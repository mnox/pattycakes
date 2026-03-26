---
name: Data Flywheel Strategy
description: Plan for making Patrick self-improving through CSM feedback, outcome tracking, pattern library, similarity matching, and eventual fine-tuning
type: project
---

## The Core Insight
Pattern's human expertise is the scarce asset. The flywheel captures it in structured form so it compounds rather than evaporates when employees leave or customers churn.

## Four Flywheel Stages

### Stage 1 — Capture Feedback (build first)
Add two Convex tables:
- `feedback`: `{ runId, needId, csmId, action: 'validated'|'rejected'|'missing'|'edited', editedContent?, note? }`
- `outcomes`: `{ customerId, needId, completedAt, measuredImpact?, healthScoreDelta?, churnPrevented? }`

CSM feedback UI: thumb up/down per need, inline editing, "Patrick missed this" free-text input for false negatives.

### Stage 2 — Pattern Library (medium term)
- Extract recurring need patterns from validated needs across customers
- Segment by industry, tier, product usage profile
- `needPatterns` table: `{ segment, title, description, avgImpact, avgEffort, occurrenceCount, evidenceExamples }`
- Inject top patterns for the relevant segment into Patrick's system prompt as few-shot context

### Stage 3 — Similarity Matching (medium term)
- Embed company profiles + ingested data summaries for each customer
- On new customer ingestion, retrieve 3–5 most similar past customers
- Surface their validated needs and roadmap outcomes as additional context for Patrick
- Lightweight RAG approach that dramatically boosts accuracy without fine-tuning

### Stage 4 — Fine-Tuning (long term)
- Once 50+ validated run pairs exist (Patrick output → CSM-corrected output), use as supervised fine-tuning examples
- Anthropic fine-tuning API or distillation via claude-haiku-4-5 for cost efficiency
- The fine-tuned model becomes a proprietary asset — competitors cannot replicate it without Pattern's validated onboarding data

## Key Leverage Point
The feedback interface is the linchpin. Build it before anything else in the flywheel. Every correction a CSM makes is worth more than 1000 uncorrected runs.
