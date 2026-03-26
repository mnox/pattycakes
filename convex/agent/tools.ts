import { tool } from "ai";
import { z } from "zod";
import { api } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const sourceTypeEnum = z.enum([
  "metrics",
  "transcript",
  "email",
  "survey",
  "support_ticket",
  "custom",
]);

const categoryEnum = z.enum([
  "adoption",
  "integration",
  "training",
  "feature_gap",
  "process",
  "support",
  "other",
]);

export function buildTools(
  ctx: ActionCtx,
  { customerId, runId }: { customerId: Id<"customers">; runId: Id<"runs"> }
) {
  return {
    getScoringCriteria: tool({
      description:
        "Retrieve the scoring configuration for this customer. Call this first to understand what 'impact' and 'effort' mean in context.",
      parameters: z.object({}),
      execute: async () => {
        return ctx.runQuery(api.config.getScoring, { customerId });
      },
    }),

    fetchCustomerData: tool({
      description:
        "Load all ingested raw records for the customer, joined with their source weights. Call this to get the full data set to analyze.",
      parameters: z.object({
        sourceTypes: z
          .array(sourceTypeEnum)
          .optional()
          .describe("Filter to specific source types. Omit for all enabled sources."),
      }),
      execute: async ({ sourceTypes }) => {
        const [records, config] = await Promise.all([
          ctx.runQuery(api.ingestion.list, { customerId }),
          ctx.runQuery(api.config.getIngestion, { customerId }),
        ]);

        const filteredRecords = sourceTypes
          ? records.filter((r) => sourceTypes.includes(r.sourceType as typeof sourceTypes[number]))
          : records.filter((r) => {
              const source = config.sources.find((s) => s.type === r.sourceType);
              return source?.enabled !== false;
            });

        return {
          records: filteredRecords.map((r) => {
            const source = config.sources.find((s) => s.type === r.sourceType);
            return {
              id: r._id,
              sourceType: r.sourceType,
              sourceLabel: r.sourceLabel ?? r.sourceType,
              weight: source?.weight ?? 1.0,
              content: r.content,
              metadata: r.metadata,
            };
          }),
          totalRecords: filteredRecords.length,
          enabledSources: config.sources.filter((s) => s.enabled).map((s) => s.type),
        };
      },
    }),

    searchRecordsByKeyword: tool({
      description:
        "Search raw records for specific keywords to find targeted evidence for a need you are formulating.",
      parameters: z.object({
        keywords: z
          .array(z.string())
          .min(1)
          .max(5)
          .describe("Keywords to match against record content (case-insensitive OR match)"),
        sourceTypes: z.array(sourceTypeEnum).optional(),
        limit: z.number().int().min(1).max(20).optional().default(10),
      }),
      execute: async ({ keywords, sourceTypes, limit }) => {
        const records = await ctx.runQuery(api.ingestion.list, { customerId });

        const filtered = records.filter((r) => {
          if (sourceTypes && !sourceTypes.includes(r.sourceType as typeof sourceTypes[number])) return false;
          const lower = r.content.toLowerCase();
          return keywords.some((k) => lower.includes(k.toLowerCase()));
        });

        return filtered.slice(0, limit ?? 10).map((r) => ({
          id: r._id,
          sourceType: r.sourceType,
          content: r.content.slice(0, 1000),
          relevanceNote: `Matched keywords in ${r.sourceLabel ?? r.sourceType}`,
        }));
      },
    }),

    recordNeed: tool({
      description:
        "Persist a single identified customer need. Call once per distinct need as you discover them.",
      parameters: z.object({
        title: z.string().max(120).describe("Clear, actionable title for the need"),
        description: z
          .string()
          .describe("Detailed description of the need and its business context"),
        category: categoryEnum,
        evidenceSnippets: z
          .array(z.string())
          .max(5)
          .describe("Direct quotes or data points from source records supporting this need"),
        sourceRecordIds: z
          .array(z.string())
          .describe("IDs of the raw records this need was derived from"),
        impactScore: z
          .number()
          .min(0)
          .max(10)
          .describe("Impact score 0–10 based on the scoring dimensions"),
        effortScore: z
          .number()
          .min(0)
          .max(10)
          .describe("Effort score 0–10 based on the effort dimensions (higher = more effort)"),
        impactRationale: z
          .string()
          .describe("Explain why you assigned this impact score"),
        effortRationale: z
          .string()
          .describe("Explain why you assigned this effort score"),
      }),
      execute: async (args) => {
        const priorityScore = args.impactScore / Math.max(args.effortScore, 0.1);
        const needId = await ctx.runMutation(api.needs.create, {
          customerId,
          runId,
          ...args,
          priorityScore,
        });
        return { needId, priorityScore: Math.round(priorityScore * 100) / 100 };
      },
    }),

    listIdentifiedNeeds: tool({
      description:
        "List all needs recorded in this run, sorted by priority score. Call before building the roadmap to review completeness.",
      parameters: z.object({}),
      execute: async () => {
        const needs = await ctx.runQuery(api.needs.listByRun, { runId });
        const sorted = [...needs].sort((a, b) => b.priorityScore - a.priorityScore);
        return {
          needs: sorted.map((n) => ({
            id: n._id,
            title: n.title,
            category: n.category,
            impactScore: n.impactScore,
            effortScore: n.effortScore,
            priorityScore: Math.round(n.priorityScore * 100) / 100,
          })),
          count: sorted.length,
        };
      },
    }),

    buildRoadmap: tool({
      description:
        "Persist the final Time-to-Value roadmap. Call after all needs are identified and reviewed. Phase items should be ordered by priority (quick wins first).",
      parameters: z.object({
        title: z.string().describe("Roadmap title, e.g. '90-Day Time-to-Value Roadmap'"),
        executiveSummary: z
          .string()
          .describe("High-level summary of findings and roadmap rationale"),
        phases: z.array(
          z.object({
            phaseNumber: z.number().int().min(1),
            label: z
              .string()
              .describe("Phase label, e.g. 'Phase 1: Quick Wins (Days 1–30)'"),
            objective: z.string().describe("What this phase aims to accomplish"),
            items: z.array(
              z.object({
                needId: z
                  .string()
                  .describe("The ID returned by recordNeed for this need"),
                title: z.string(),
                rationale: z
                  .string()
                  .describe("Why this item is in this phase"),
                expectedOutcome: z
                  .string()
                  .describe("Concrete outcome when this item is complete"),
                effort: z.enum(["Low", "Medium", "High"]),
                impact: z.enum(["Low", "Medium", "High"]),
              })
            ),
          })
        ),
      }),
      execute: async ({ title, executiveSummary, phases }) => {
        const typedPhases = phases.map((phase) => ({
          ...phase,
          items: phase.items.map((item) => ({
            ...item,
            needId: item.needId as Id<"needs">,
          })),
        }));

        const roadmapId = await ctx.runMutation(api.roadmaps.create, {
          customerId,
          runId,
          title,
          executiveSummary,
          phases: typedPhases,
        });

        await Promise.all(
          phases.flatMap((phase) =>
            phase.items.map((item) =>
              ctx.runMutation(api.needs.updateStatus, {
                id: item.needId as Id<"needs">,
                status: "included_in_roadmap",
              })
            )
          )
        );

        return { roadmapId, phaseCount: phases.length, totalItems: phases.reduce((sum, p) => sum + p.items.length, 0) };
      },
    }),
  };
}
