---
name: Pattern Data Seeding
description: Strategy for using Pattern's existing customer history to bootstrap Patrick's accuracy before the flywheel accumulates new data
type: project
---

## The Opportunity
Pattern already has a wealth of onboarding history. Extract structured signal from it and inject it into Patrick as enriched system prompt context, RAG-retrievable examples, or labeled training data.

## Highest-Value Historical Data Sources
1. **Historical success plans / onboarding plans** — already contain identified needs and recommended actions → parse into needPatterns library
2. **QBR decks and notes** — contain explicit statements of what the customer struggled with and what improved health → gold-labeled outcomes data
3. **CRM opportunity notes** — sales-to-CS handoff notes contain the customer's stated goals and pain points → exactly what Patrick would infer from transcripts
4. **Support ticket history** — recurring ticket themes = direct evidence of adoption gaps, integration friction, training needs → high signal for feature_gap and support categories
5. **NPS/CSAT survey verbatims** — surface needs the customer hasn't explicitly raised with their CSM
6. **Churn post-mortems** — reasons for churn = needs that weren't met → inverse success signals, extremely high-value training data
7. **Renewal risk assessments** — CSM risk scoring = human-generated impact scores → use to calibrate Patrick's scoring dimensions

## Seeding Process
1. Build a one-time ingestion pipeline: historical docs → Claude extraction prompt → structured needPatterns records
2. Extraction prompt: "Given this document about customer X, identify each distinct need, categorize it, and score its impact on their success."
3. Have CSMs review extracted patterns for accuracy before they influence Patrick
4. Store validated patterns in `needPatterns` table segmented by industry + tier
5. Inject relevant patterns into Patrick's system prompt

## Quick Win
Ask Pattern to export the last 20 customer success plans. Run batch extraction. Review with 2 CSMs for 1 hour. That one session could yield 100+ validated need patterns that make Patrick dramatically more accurate from day one — before any new runs are needed.
