import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("customers").collect(),
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => ctx.db.insert("customers", { ...args }),
});

export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    industry: v.optional(v.string()),
    tier: v.optional(
      v.union(
        v.literal("enterprise"),
        v.literal("mid-market"),
        v.literal("smb")
      )
    ),
  },
  handler: async (ctx, { id, ...fields }) => {
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
