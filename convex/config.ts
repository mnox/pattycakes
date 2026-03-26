import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const dimensionValidator = v.object({
  key: v.string(),
  label: v.string(),
  description: v.string(),
  weight: v.number(),
});

const sourceValidator = v.object({
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
});

export const getIngestion = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) => {
    const config = await ctx.db
      .query("ingestionConfigs")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .first();
    return config ?? defaultIngestionConfig(customerId);
  },
});

export const getScoring = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) => {
    const config = await ctx.db
      .query("scoringConfigs")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .first();
    return config ?? defaultScoringConfig(customerId);
  },
});

export const upsertIngestion = mutation({
  args: {
    customerId: v.id("customers"),
    sources: v.array(sourceValidator),
    globalParsingNotes: v.optional(v.string()),
  },
  handler: async (ctx, { customerId, ...fields }) => {
    const existing = await ctx.db
      .query("ingestionConfigs")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...fields, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("ingestionConfigs", {
        customerId,
        ...fields,
        updatedAt: Date.now(),
      });
    }
  },
});

export const upsertScoring = mutation({
  args: {
    customerId: v.id("customers"),
    impactDimensions: v.array(dimensionValidator),
    effortDimensions: v.array(dimensionValidator),
    priorityFormula: v.optional(v.string()),
  },
  handler: async (ctx, { customerId, ...fields }) => {
    const existing = await ctx.db
      .query("scoringConfigs")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...fields, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("scoringConfigs", {
        customerId,
        ...fields,
        updatedAt: Date.now(),
      });
    }
  },
});

function defaultIngestionConfig(customerId: string) {
  return {
    _id: null as unknown,
    customerId,
    sources: [
      { type: "metrics" as const, enabled: true, weight: 1.5, label: "Product Metrics" },
      { type: "transcript" as const, enabled: true, weight: 1.2, label: "Sales Transcripts" },
      { type: "email" as const, enabled: true, weight: 1.0, label: "Email Communications" },
      { type: "survey" as const, enabled: true, weight: 1.3, label: "Customer Survey" },
      { type: "support_ticket" as const, enabled: true, weight: 1.1, label: "Support Tickets" },
      { type: "custom" as const, enabled: false, weight: 1.0, label: "Custom Source" },
    ],
    globalParsingNotes: "",
    updatedAt: Date.now(),
  };
}

function defaultScoringConfig(customerId: string) {
  return {
    _id: null as unknown,
    customerId,
    impactDimensions: [
      { key: "revenue_risk", label: "Revenue Risk", description: "Potential revenue impact if unaddressed", weight: 2.0 },
      { key: "churn_signal", label: "Churn Signal", description: "Likelihood this leads to churn", weight: 1.8 },
      { key: "adoption_blocker", label: "Adoption Blocker", description: "Prevents full product adoption", weight: 1.5 },
      { key: "strategic_alignment", label: "Strategic Alignment", description: "Aligns with customer's stated goals", weight: 1.2 },
    ],
    effortDimensions: [
      { key: "implementation_complexity", label: "Implementation Complexity", description: "Technical complexity of the solution", weight: 1.5 },
      { key: "time_investment", label: "Time Investment", description: "Time required from Pattern team", weight: 1.3 },
      { key: "customer_change_mgmt", label: "Change Management", description: "Customer-side change required", weight: 1.0 },
    ],
    priorityFormula: "impact / effort",
    updatedAt: Date.now(),
  };
}
