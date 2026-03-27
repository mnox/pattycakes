# Pattycakes — Patrick, the Customer Onboarding Agent

> An intelligent AI agent that transforms raw customer signals into prioritized needs and phased Time-to-Value roadmaps — before a human CSM has to touch the data.

---

## What is this?

This repo is a working proof-of-concept for **Patrick**, an agentic AI system built for [Pattern](https://pattern.io) (a customer success platform). Patrick automates the most time-consuming analytical work in customer onboarding: reading transcripts, scoring needs, and generating structured success plans.

The core insight is simple but underappreciated in the CS space: **CSMs are overqualified for the analysis they spend most of their time doing.** Reading through 90-minute kickoff transcripts, cross-referencing support tickets, tagging needs, estimating impact and effort — that's synthesis work. It's real, it's important, but it doesn't require human judgment. Patrick handles it in minutes so CSMs can focus on the work that does require a person: building relationships, providing strategic guidance, and closing expansions.

The math: 3 hours of analysis per customer → 30 minutes of validation. Across 10 CSMs managing 15 customers each, that's ~125 hours/month freed. That's not a marginal improvement — it's a structural shift in how a CS org operates.

---

## Architecture Overview

```
Customer Data (transcripts, metrics, surveys, tickets)
        │
        ▼
   rawRecords table (Convex)
        │
        ▼
 HTTP POST /agent/stream ──► Claude (Sonnet 4.6) with 6 tools
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
    getScoringCriteria       searchRecordsByKeyword    recordNeed
    fetchCustomerData        listIdentifiedNeeds       buildRoadmap
              │
              ▼
  runEvents table (streamed in real-time)
              │
              ▼
  Convex useQuery subscription → live UI
```

**Stack:**
- **Backend**: [Convex](https://convex.dev) — real-time database + HTTP actions + serverless functions
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) (`streamText`, tool definitions) + Claude Sonnet 4.6
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + React Router
- **Validation**: Zod throughout (tool args, API inputs, schema validators)

---

## How Patrick Works

Patrick is not a chatbot. He's a **tool-calling agent** with a structured operating procedure and a specific job to do.

### Step-by-step

1. CSM selects a customer and pastes in their data — transcripts, survey responses, support tickets, raw metrics, emails. Any unstructured text is fair game.

2. Each data source is stored in `rawRecords` with a type, label, and **weight** (e.g., kickoff transcripts carry more signal than automated survey responses).

3. CSM clicks **Run Patrick**. The frontend creates a run record in Convex, then POSTs to `/agent/stream`.

4. Patrick boots with a **dynamically generated system prompt** containing:
   - Customer name, company, industry, and tier
   - Which data sources are active and their relative weights
   - The customer's scoring framework — exactly what "impact" and "effort" mean in their context, with custom dimensions and weights
   - The priority formula (default: `impact / effort`, configurable)
   - A step-by-step operating procedure Patrick is expected to follow

5. Patrick works through the data with tools:
   - Loads the scoring criteria
   - Fetches all customer records
   - Iteratively searches for evidence using keywords
   - Records each identified need with title, description, category, supporting evidence, and scores
   - Reviews the full need list for gaps
   - Structures everything into a phased roadmap with objectives, rationale, and expected outcomes per item

6. Every chunk — text delta, tool call, tool result — is written to `runEvents` as it happens.

7. The frontend subscribes to that table via `useQuery`. No SSE parsing, no WebSocket management. **Just reactive DB writes feeding reactive UI reads.** The event stream is live within milliseconds.

8. When the run completes, token usage, step count, and timing are committed to the `runs` table.

9. The CSM reviews output in the Needs and Roadmap tabs, exports to markdown, and goes straight to the customer call.

---

## Database Schema

Eight tables, purpose-built for onboarding intelligence:

| Table | Purpose |
|---|---|
| `customers` | Profiles: name, company, industry, tier, metadata |
| `ingestionConfigs` | Per-customer data source config: enabled sources, weights, parsing hints |
| `scoringConfigs` | Per-customer scoring dimensions for impact and effort with weights |
| `rawRecords` | Ingested data: transcripts, metrics, emails, surveys, tickets, custom |
| `needs` | Identified needs with category, evidence, impact/effort/priority scores, status |
| `roadmaps` | Phased TTV roadmaps: executive summary + phases each with objectives and items |
| `runs` | Execution metadata: status, token usage, step count, timing |
| `runEvents` | Real-time event log: `text_delta`, `tool_call`, `tool_result`, `step_complete`, `error` |

The `needs` table tracks a status lifecycle: `identified → validated → included_in_roadmap → deferred`. That pipeline is the foundation for a feedback loop (more on that below).

---

## The Scoring System

Patrick doesn't just list needs — he **scores** them against a configurable framework that reflects what actually matters to each customer.

Each customer has a scoring config with two sides:

**Impact dimensions** (examples):
- Revenue retention risk
- Time-to-value acceleration
- Feature completeness gap
- Adoption rate potential

**Effort dimensions** (examples):
- Engineering hours required
- CSM coordination overhead
- Customer change management

Each dimension has a weight. Patrick scores needs 1–10 on each dimension, weights and sums them, then computes a **priority score** via a configurable formula (default: `impact / effort`). This surfaces quick wins first — exactly the right prioritization philosophy for a TTV roadmap.

Because the scoring config is stored per-customer and injected into the system prompt at runtime, Patrick adapts to different customer contexts **without retraining or fine-tuning**.

---

## The Streaming Architecture

One of the more interesting technical decisions here: instead of parsing Server-Sent Events on the client, event streaming runs **through the database**.

```
HTTP action (Convex) → streamText with onChunk callback
    → ctx.runMutation(api.runs.appendEvent, { type, payload })
    → runEvents row written
    → useQuery(api.runs.getEvents) invalidation
    → React re-render with new event
```

This means:
- No custom WebSocket management
- Events are **persisted** — a run can be replayed after the fact
- Multiple browser tabs or team members see the same live stream
- The run history tab is free, because the events are just rows

Convex's reactive query model does the heavy lifting. The complexity cost is essentially zero.

---

## Agent Design Thinking

A few deliberate choices in how Patrick reasons:

**Tools over generation.** Patrick doesn't write out the roadmap in one shot. He uses tools to iteratively discover needs, gather evidence, score them, review the full picture, then structure the roadmap. This forces reasoning to happen at each step rather than letting the model hallucinate a plausible-looking plan. Evidence is cited. Scores have rationales.

**Dynamic context, not fine-tuning.** The system prompt injects customer-specific scoring frameworks, active data sources, and their weights at runtime. This is a much faster path to per-customer calibration than fine-tuning, and it's transparent — you can read the prompt and understand exactly what Patrick was told to care about.

**Status lifecycle on needs.** The `identified → validated → included_in_roadmap → deferred` pipeline is not just UI polish. It's the data model for a **feedback loop**. Every time a CSM marks a need as irrelevant, or adds a need Patrick missed, that's a labeled training signal. That's the flywheel.

**maxSteps: 20.** Patrick can make up to 20 tool calls per run. This is intentional — complex customers with many data sources need multiple evidence-gathering passes. The run event log captures every step, so you can audit exactly what Patrick examined and when.

---

## The Flywheel (What This Becomes)

Patrick v1 is a one-shot analysis system. The strategic value of the architecture is where it goes next:

```
CSM feedback (validated / rejected / missing needs)
        │
        ▼
Pattern library (recurring need types by segment/industry)
        │
        ▼
Similarity matching (embed customer profiles, retrieve analogous customers)
        │
        ▼
In-context learning (surface similar customers with outcomes as few-shot examples)
        │
        ▼
Fine-tuning pipeline (validated corrections as supervised examples)
```

Every corrected need is worth more than a thousand uncorrected runs. The data model is built to capture it.

The integration vision: deal closes → auto-create customer in Patrick → kickoff data flows in → Patrick runs on handoff notes → CSM validates at kickoff call → Patrick re-runs on kickoff transcript → 30/60/90-day gates update the roadmap → outcomes feed renewal forecasting → feature gap needs surface directly in the product backlog with customer evidence attached.

Patrick as the connective tissue between sales handoff, CS execution, product prioritization, and renewal.

---

## Current State / Known Gaps

This is a working POC, not a production system. The honest gap list:

| Gap | Why it matters |
|---|---|
| No auth / multi-tenant isolation | Everything is unprotected right now |
| File upload not wired | Only text paste works; PDF/CSV ingestion is stubbed |
| CSM feedback UI incomplete | The flywheel's linchpin — without it Patrick can't learn |
| No outcome tracking | Can't measure whether roadmap items actually got done or drove retention |
| No CRM/CS integrations | Salesforce, Gong, Gainsight, HubSpot — Patrick should pull data, not wait for it to be pasted |
| No notifications | CSMs need to know when Patrick finishes |
| Pattern library not built | Cross-customer need patterns are the highest-leverage learning surface |

The prioritization here was deliberate: **get the core reasoning loop working and observable before building the scaffolding around it.** The agent logic, streaming architecture, scoring system, and data model are all production-ready in structure. The gaps are features, not foundations.

---

## Running Locally

```bash
# Install dependencies
npm install

# Set Anthropic API key in Convex
npx convex env set ANTHROPIC_API_KEY=sk-...

# Start Convex dev server and frontend
npx convex dev &
npm run dev
```

Environment variables:
- `VITE_CONVEX_URL` — Convex deployment URL (set in `.env.local`)
- `VITE_CONVEX_SITE_URL` — Convex HTTP actions base (`.convex.site` domain)
- `ANTHROPIC_API_KEY` — Set via `npx convex env set` (not in `.env`)

---

## Project Structure

```
pattycakes/
├── convex/
│   ├── agent/
│   │   ├── stream.ts        # HTTP POST handler, streamText orchestration
│   │   ├── tools.ts         # 6 tool definitions with Zod schemas
│   │   └── prompts.ts       # Dynamic system prompt builder
│   ├── schema.ts            # 8-table schema
│   ├── customers.ts         # Customer queries/mutations
│   ├── runs.ts              # Run lifecycle and event logging
│   ├── needs.ts             # Need CRUD
│   ├── roadmaps.ts          # Roadmap creation
│   ├── config.ts            # Ingestion/scoring config CRUD
│   ├── ingestion.ts         # Raw record ingestion
│   └── http.ts              # HTTP router
├── src/
│   ├── pages/
│   │   ├── CustomerPage.tsx  # Main 3-panel layout
│   │   ├── ConfigPage.tsx    # Config editor
│   │   └── RunsPage.tsx      # Run history
│   └── components/
│       ├── agent/            # AgentLauncher, RunStream, RunEventItem
│       ├── needs/            # NeedsBoard, NeedCard
│       ├── roadmap/          # RoadmapView (with markdown export)
│       ├── config/           # IngestionConfigForm, ScoringConfigForm
│       ├── customers/        # CustomerSelector, CustomerForm
│       └── ingestion/        # TextPasteModal, DataSourcePanel
└── docs/
    ├── project_architecture.md
    ├── gaps_next_steps.md
    ├── data_flywheel.md
    ├── data_seeding.md
    ├── success_metrics.md
    ├── product_process.md
    └── team_evolution.md
```

---

## Why I Built This

I wanted to demonstrate how I think about building agentic AI systems in the real world — not toy demos, but systems with:

- **A real problem worth solving** (CSM capacity, not just "AI + my app")
- **A data model designed for the agent's reasoning loop**, not bolted on after
- **Observable, debuggable agent behavior** (the event stream, run history, step log)
- **A path to self-improvement** (the feedback pipeline and flywheel)
- **Architecture decisions that scale** (reactive streaming via DB, configurable scoring, per-customer context injection)

The docs in `/docs` represent the full product thinking behind this: what to measure, how to seed it with historical data, how the CSM role evolves, how it integrates into the broader product lifecycle.

Patrick is a complete thought, not just a demo.

---

*Built with [Convex](https://convex.dev), [Vercel AI SDK](https://sdk.vercel.ai/), Claude Sonnet 4.6, React 19, and TypeScript.*
