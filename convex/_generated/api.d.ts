/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent_prompts from "../agent/prompts.js";
import type * as agent_stream from "../agent/stream.js";
import type * as agent_tools from "../agent/tools.js";
import type * as config from "../config.js";
import type * as customers from "../customers.js";
import type * as http from "../http.js";
import type * as ingestion from "../ingestion.js";
import type * as needs from "../needs.js";
import type * as roadmaps from "../roadmaps.js";
import type * as runs from "../runs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agent/prompts": typeof agent_prompts;
  "agent/stream": typeof agent_stream;
  "agent/tools": typeof agent_tools;
  config: typeof config;
  customers: typeof customers;
  http: typeof http;
  ingestion: typeof ingestion;
  needs: typeof needs;
  roadmaps: typeof roadmaps;
  runs: typeof runs;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
