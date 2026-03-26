---
name: Patrick Agent Architecture
description: Full technical architecture of the Patrick onboarding agent — stack, schema, tools, streaming pattern, repo location
type: project
---

**Repo:** `/c/code/repos/pattycakes`
**Convex deployment:** `frugal-roadrunner-966` (team: matt-noxon-366b5, project: pattycakes)

## What Patrick Does
Ingests customer data (transcripts, metrics, emails, surveys, support tickets) → identifies needs → scores by impact/effort → builds a phased Time-to-Value roadmap. Fully configurable ingestion weights and scoring criteria per customer.

## Stack
- **Backend:** Convex (real-time DB + HTTP actions)
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) — `streamText` with `maxSteps: 20`
- **Model:** `claude-sonnet-4-6`
- **Frontend:** React + Vite + TypeScript + Tailwind CSS

## Schema (7 tables)
`customers`, `ingestionConfigs`, `scoringConfigs`, `rawRecords`, `needs`, `roadmaps`, `runs`, `runEvents`

## Agent Tools (6)
1. `getScoringCriteria` — loads scoring config before analysis
2. `fetchCustomerData` — loads all rawRecords with source weights
3. `searchRecordsByKeyword` — targeted evidence retrieval
4. `recordNeed` — persists one identified need (called N times)
5. `listIdentifiedNeeds` — review completeness before roadmap
6. `buildRoadmap` — persists phased TTV roadmap

## Streaming Architecture
- Frontend POSTs `{customerId, runId}` to `/agent/stream` (Convex HTTP action)
- Run doc pre-created via mutation before fetch (so useQuery subscription is ready)
- `onChunk` callback writes `text_delta` / `tool_call` / `tool_result` events to `runEvents` table
- Frontend displays live via `useQuery(api.runs.getEvents)` — not SSE parsing
- All functions are public (`query`/`mutation`), so use `api` not `internal` in agent files

## Key Files
- `convex/agent/stream.ts` — HTTP action, streamText, CORS, onChunk/onFinish callbacks
- `convex/agent/tools.ts` — all 6 tool definitions with zod schemas
- `convex/agent/prompts.ts` — dynamic system prompt injecting customer context + config
- `src/pages/CustomerPage.tsx` — main 3-panel layout
- `src/components/agent/AgentLauncher.tsx` — run lifecycle (creates run, POSTs to stream, tracks status)
- `src/components/agent/RunStream.tsx` — live event display via Convex subscription
- `src/components/needs/NeedsBoard.tsx` + `NeedCard.tsx` — live needs visualization
- `src/components/roadmap/RoadmapView.tsx` — phased roadmap with markdown copy export
- `src/components/config/` — `IngestionConfigForm` + `ScoringConfigForm`

## Env Vars
- `VITE_CONVEX_URL` — Convex client URL
- `VITE_CONVEX_SITE_URL` — Convex HTTP actions base URL (`.convex.site`)
- `ANTHROPIC_API_KEY` — set via `npx convex env set ANTHROPIC_API_KEY sk-ant-...`
