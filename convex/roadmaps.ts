import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const roadmapItemValidator = v.object({
  needId: v.id("needs"),
  title: v.string(),
  rationale: v.string(),
  expectedOutcome: v.string(),
  effort: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
  impact: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
});

const phaseValidator = v.object({
  phaseNumber: v.number(),
  label: v.string(),
  objective: v.string(),
  items: v.array(roadmapItemValidator),
});

export const getByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) =>
    ctx.db
      .query("roadmaps")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .order("desc")
      .first(),
});

export const getByRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) =>
    ctx.db
      .query("roadmaps")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .first(),
});

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    runId: v.id("runs"),
    title: v.string(),
    executiveSummary: v.string(),
    phases: v.array(phaseValidator),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("roadmaps", { ...args, status: "draft" }),
});

export const finalize = mutation({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, { id }) =>
    ctx.db.patch(id, { status: "finalized", finalizedAt: Date.now() }),
});
