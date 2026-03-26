import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildSystemPrompt } from "./prompts";
import { buildTools } from "./tools";
import type { Id } from "../_generated/dataModel";

function corsHeaders(request: Request, headers = new Headers()): Headers {
  const origin = request.headers.get("Origin") ?? "*";
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Vary", "Origin");
  return headers;
}

export const agentStream = httpAction(async (ctx, request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const { customerId, runId, userMessage } = (await request.json()) as {
    customerId: Id<"customers">;
    runId: Id<"runs">;
    userMessage?: string;
  };

  const [customer, ingestionConfig, scoringConfig] = await Promise.all([
    ctx.runQuery(api.customers.get, { id: customerId }),
    ctx.runQuery(api.config.getIngestion, { customerId }),
    ctx.runQuery(api.config.getScoring, { customerId }),
  ]);

  const systemPrompt = buildSystemPrompt(customer, ingestionConfig, scoringConfig);
  const tools = buildTools(ctx, { customerId, runId });

  let seq = 0;

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    prompt: userMessage ?? "Begin the customer onboarding analysis.",
    tools,
    maxSteps: 20,
    onChunk: async ({ chunk }) => {
      if (chunk.type === "text-delta") {
        await ctx.runMutation(api.runs.appendEvent, {
          runId,
          sequenceNumber: seq++,
          type: "text_delta",
          textDelta: chunk.textDelta,
          createdAt: Date.now(),
        });
      } else if (chunk.type === "tool-call") {
        await ctx.runMutation(api.runs.appendEvent, {
          runId,
          sequenceNumber: seq++,
          type: "tool_call",
          toolName: chunk.toolName,
          toolCallId: chunk.toolCallId,
          toolInput: JSON.stringify(chunk.args),
          createdAt: Date.now(),
        });
      } else if (chunk.type === "tool-result") {
        await ctx.runMutation(api.runs.appendEvent, {
          runId,
          sequenceNumber: seq++,
          type: "tool_result",
          toolCallId: chunk.toolCallId,
          toolResult: JSON.stringify(chunk.result),
          createdAt: Date.now(),
        });
      }
    },
    onFinish: async ({ usage, finishReason, steps }) => {
      await ctx.runMutation(api.runs.finalize, {
        id: runId,
        status: finishReason === "error" ? "failed" : "completed",
        completedAt: Date.now(),
        totalInputTokens: usage.promptTokens,
        totalOutputTokens: usage.completionTokens,
        stepCount: steps.length,
      });
      await ctx.runMutation(api.runs.appendEvent, {
        runId,
        sequenceNumber: seq++,
        type: "run_complete",
        createdAt: Date.now(),
      });
    },
  });

  const response = result.toDataStreamResponse();
  const headers = new Headers(response.headers);
  corsHeaders(request, headers);
  return new Response(response.body, { status: response.status, headers });
});
