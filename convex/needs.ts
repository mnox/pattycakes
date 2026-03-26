import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const categoryValidator = v.union(
  v.literal("adoption"),
  v.literal("integration"),
  v.literal("training"),
  v.literal("feature_gap"),
  v.literal("process"),
  v.literal("support"),
  v.literal("other")
);

export const listByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) =>
    ctx.db
      .query("needs")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .collect(),
});

export const listByRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) =>
    ctx.db
      .query("needs")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect(),
});

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    runId: v.id("runs"),
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    evidenceSnippets: v.array(v.string()),
    sourceRecordIds: v.array(v.string()),
    impactScore: v.number(),
    effortScore: v.number(),
    priorityScore: v.number(),
    impactRationale: v.string(),
    effortRationale: v.string(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("needs", { ...args, status: "identified" }),
});

export const updateStatus = mutation({
  args: {
    id: v.id("needs"),
    status: v.union(
      v.literal("identified"),
      v.literal("validated"),
      v.literal("included_in_roadmap"),
      v.literal("deferred")
    ),
  },
  handler: async (ctx, { id, status }) => ctx.db.patch(id, { status }),
});
