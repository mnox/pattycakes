import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) =>
    ctx.db
      .query("runs")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .order("desc")
      .collect(),
});

export const get = query({
  args: { id: v.id("runs") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) =>
    ctx.db.insert("runs", {
      customerId,
      status: "running",
      startedAt: Date.now(),
    }),
});

export const finalize = mutation({
  args: {
    id: v.id("runs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    completedAt: v.number(),
    totalInputTokens: v.optional(v.number()),
    totalOutputTokens: v.optional(v.number()),
    stepCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => ctx.db.patch(id, fields),
});

export const appendEvent = mutation({
  args: {
    runId: v.id("runs"),
    sequenceNumber: v.number(),
    type: v.union(
      v.literal("text_delta"),
      v.literal("tool_call"),
      v.literal("tool_result"),
      v.literal("step_complete"),
      v.literal("run_complete"),
      v.literal("error")
    ),
    textDelta: v.optional(v.string()),
    toolName: v.optional(v.string()),
    toolCallId: v.optional(v.string()),
    toolInput: v.optional(v.string()),
    toolResult: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => ctx.db.insert("runEvents", args),
});

export const getEvents = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) =>
    ctx.db
      .query("runEvents")
      .withIndex("by_run_sequence", (q) => q.eq("runId", runId))
      .order("asc")
      .collect(),
});
