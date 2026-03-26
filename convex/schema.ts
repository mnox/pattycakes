import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  customers: defineTable({
    name: v.string(),
    company: v.string(),
    industry: v.optional(v.string()),
    tier: v.optional(
      v.union(
        v.literal("enterprise"),
        v.literal("mid-market"),
        v.literal("smb")
      )
    ),
    metadata: v.optional(v.record(v.string(), v.string())),
  }).index("by_company", ["company"]),

  ingestionConfigs: defineTable({
    customerId: v.id("customers"),
    sources: v.array(
      v.object({
        type: v.union(
          v.literal("metrics"),
          v.literal("transcript"),
          v.literal("email"),
          v.literal("survey"),
          v.literal("support_ticket"),
          v.literal("custom")
        ),
        enabled: v.boolean(),
        weight: v.number(),
        label: v.optional(v.string()),
        parsingHint: v.optional(v.string()),
      })
    ),
    globalParsingNotes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_customer", ["customerId"]),

  scoringConfigs: defineTable({
    customerId: v.id("customers"),
    impactDimensions: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        description: v.string(),
        weight: v.number(),
      })
    ),
    effortDimensions: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        description: v.string(),
        weight: v.number(),
      })
    ),
    priorityFormula: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_customer", ["customerId"]),

  rawRecords: defineTable({
    customerId: v.id("customers"),
    sourceType: v.union(
      v.literal("metrics"),
      v.literal("transcript"),
      v.literal("email"),
      v.literal("survey"),
      v.literal("support_ticket"),
      v.literal("custom")
    ),
    sourceLabel: v.optional(v.string()),
    content: v.string(),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    ingestionStatus: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("skipped")
    ),
    processedAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_customer", ["customerId"])
    .index("by_customer_status", ["customerId", "ingestionStatus"])
    .index("by_customer_source", ["customerId", "sourceType"]),

  needs: defineTable({
    customerId: v.id("customers"),
    runId: v.id("runs"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("adoption"),
      v.literal("integration"),
      v.literal("training"),
      v.literal("feature_gap"),
      v.literal("process"),
      v.literal("support"),
      v.literal("other")
    ),
    evidenceSnippets: v.array(v.string()),
    sourceRecordIds: v.array(v.string()),
    impactScore: v.number(),
    effortScore: v.number(),
    priorityScore: v.number(),
    impactRationale: v.string(),
    effortRationale: v.string(),
    status: v.union(
      v.literal("identified"),
      v.literal("validated"),
      v.literal("included_in_roadmap"),
      v.literal("deferred")
    ),
  })
    .index("by_customer", ["customerId"])
    .index("by_run", ["runId"])
    .index("by_customer_priority", ["customerId", "priorityScore"]),

  roadmaps: defineTable({
    customerId: v.id("customers"),
    runId: v.id("runs"),
    title: v.string(),
    executiveSummary: v.string(),
    phases: v.array(
      v.object({
        phaseNumber: v.number(),
        label: v.string(),
        objective: v.string(),
        items: v.array(
          v.object({
            needId: v.id("needs"),
            title: v.string(),
            rationale: v.string(),
            expectedOutcome: v.string(),
            effort: v.union(
              v.literal("Low"),
              v.literal("Medium"),
              v.literal("High")
            ),
            impact: v.union(
              v.literal("Low"),
              v.literal("Medium"),
              v.literal("High")
            ),
          })
        ),
      })
    ),
    status: v.union(v.literal("draft"), v.literal("finalized")),
    finalizedAt: v.optional(v.number()),
  })
    .index("by_customer", ["customerId"])
    .index("by_run", ["runId"]),

  runs: defineTable({
    customerId: v.id("customers"),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    triggeredBy: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    totalInputTokens: v.optional(v.number()),
    totalOutputTokens: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    stepCount: v.optional(v.number()),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"]),

  runEvents: defineTable({
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
  })
    .index("by_run", ["runId"])
    .index("by_run_sequence", ["runId", "sequenceNumber"]),
});
