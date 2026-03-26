---
name: Patrick Gaps and Next Steps
description: Known production gaps in Patrick and the priority order for closing them
type: project
---

The core loop (ingest → analyze → score → roadmap) works end-to-end. What's missing falls into three buckets: production hardening, the feedback/learning loop, and integrations.

## Priority Build Order
1. **Auth** (Convex Auth or Clerk) — nothing is protected today
2. **File upload HTTP action** — `/ingest/upload` handler that reads from Convex storage, extracts text, creates rawRecords (PDF, docx, csv)
3. **CSM feedback interface** — mark needs validated/irrelevant/missing, inline editing, "Patrick missed this" input. This is the flywheel seed.
4. **Outcome tracking** — `outcomes` table recording what roadmap items were completed, health score delta, churn prevented

## Full Gap List
- No authentication or multi-tenant row-level security
- No file upload (only text paste works currently)
- No CSM feedback capture on needs/roadmap
- No outcome tracking (can't measure impact, can't improve model)
- No run comparison (can't diff two Patrick runs for same customer)
- No notifications (CSMs need to know when Patrick finishes)
- No CRM/CS tool integrations (Salesforce, HubSpot, Gainsight, Gong)
- No pattern library (recurring need patterns across similar customers)
- No similarity matching ("customers like this one had these needs")
- No fine-tuning or RAG pipeline
- `AgentLauncher.tsx` requires `VITE_CONVEX_SITE_URL` to be set correctly

## Why the Feedback Interface Is the Linchpin
Every CSM correction is more valuable than 1000 uncorrected runs. The feedback interface is what transforms Patrick from a demo into a self-improving product. Prioritize making it frictionless.
