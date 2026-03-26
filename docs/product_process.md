---
name: Product Process Integration
description: How Patrick fits into Pattern's end-to-end product and customer process from sales handoff through renewal
type: project
---

## Where Patrick Sits
Between sales handoff and CSM first engagement — the analytical layer that transforms raw customer signals into a structured success plan before a human touches it. When the CSM shows up to the kickoff call, they have a hypothesis-driven plan to validate, not a blank slate to fill. This shifts the first call from information-gathering to hypothesis-validation: faster, more impressive, higher-confidence.

## Integration Points

### 1. Sales → CS Handoff (trigger)
- Deal closes in CRM → auto-create Patrick customer record
- Pull in opportunity notes, call transcripts (Gong/Chorus), stated use cases as first rawRecords
- Patrick runs immediately on handoff data → CSM arrives at kickoff with a pre-built plan

### 2. Kickoff Call (enrichment)
- Kickoff transcript ingested as 'transcript' rawRecord
- Patrick re-runs / incrementally updates needs assessment
- Delta view shows CSM what changed vs. pre-kickoff plan

### 3. Ongoing Onboarding (tracking)
- Product usage metrics flow in as 'metrics' rawRecords (webhook or scheduled pull)
- Support tickets auto-ingest as 'support_ticket' rawRecords
- Patrick re-runs at 30/60/90-day checkpoints to reassess and update roadmap

### 4. QBR Preparation (output)
- Patrick's roadmap + outcome tracking feeds into QBR prep
- Auto-generate QBR summary: what was planned, completed, what the impact was
- CSM edits and presents — analytical backbone is Patrick's output

### 5. Renewal / Expansion (downstream)
- Completed roadmap items + health scores feed renewal forecasting
- Identified but unaddressed needs become expansion conversation hooks
- `feature_gap` category needs become product feedback for the product team

## Integrations Needed (priority order)
1. CRM webhook → auto-create customer + ingest deal data on close
2. Gong/Chorus API → auto-ingest call transcripts
3. Product analytics (Amplitude/Mixpanel/internal) → push usage metrics as rawRecords
4. Gainsight/Totango → push roadmap and health signals back to CS platform
5. Slack notification → alert CSM when Patrick completes a run
6. Calendar integration → trigger re-run before scheduled calls

## Longer-Term Vision
Patrick becomes the source of truth for a customer's onboarding state. Every system reads from Patrick's output. The roadmap in Patrick IS the customer's success plan — not a separate doc in Google Drive. Feature gap needs flow directly into the product backlog with customer evidence attached.
