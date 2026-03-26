import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const sourceTypeValidator = v.union(
  v.literal("metrics"),
  v.literal("transcript"),
  v.literal("email"),
  v.literal("survey"),
  v.literal("support_ticket"),
  v.literal("custom")
);

export const list = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) =>
    ctx.db
      .query("rawRecords")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .order("desc")
      .collect(),
});

export const listBySource = query({
  args: {
    customerId: v.id("customers"),
    sourceType: sourceTypeValidator,
  },
  handler: async (ctx, { customerId, sourceType }) =>
    ctx.db
      .query("rawRecords")
      .withIndex("by_customer_source", (q) =>
        q.eq("customerId", customerId).eq("sourceType", sourceType)
      )
      .collect(),
});

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    sourceType: sourceTypeValidator,
    sourceLabel: v.optional(v.string()),
    content: v.string(),
    fileName: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("rawRecords", {
      ...args,
      ingestionStatus: "pending",
    }),
});

export const markProcessed = mutation({
  args: { id: v.id("rawRecords") },
  handler: async (ctx, { id }) =>
    ctx.db.patch(id, { ingestionStatus: "processed", processedAt: Date.now() }),
});

export const remove = mutation({
  args: { id: v.id("rawRecords") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
