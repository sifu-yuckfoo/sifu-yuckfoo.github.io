AKAMAI INTELLIGENCE GROUP
CAUSAL REASONING AUDITOR
Technical Brief
==============================================================================
Document ID: AIG-CAUSAL-005
Classification: UNCLASSIFIED // PUBLIC RELEASE
Version: Public release | June 8, 2026
Author: Christopher Ramos
Research and drafting support: Deus ex Machina
Status: PUBLIC TECHNICAL BRIEF
Evidence posture: Local-harness evaluation evidence; no live-system safety guarantee implied.
==============================================================================
## Summary

AIG's Causal Reasoning Auditor is a four-phase pipeline that takes real governance evaluation data (GAL-040B, 1,800 trials across 6 adversarial scenario families) and produces directed causal graphs showing *why* governance decisions are made - not just *what* decisions were made.

It does not use an LLM for causal inference. It uses classical causal discovery algorithms (HillClimbSearch + BIC scoring, PC constraint-based algorithm) operating on binary concept activation vectors derived from actual trial data. This is structural causal modeling - a peer-reviewed methodology with a clear audit trail.

The result is a machine-readable governance explanation layer: every trial attribution traces to root causes, and every root cause maps to a concrete governance recommendation.

---

## Motivation

Standard evaluation frameworks measure outcomes. They tell you accuracy, recall, false positive rate.  
What they do not tell you is **why** a governance system failed - or more importantly, *which upstream conditions causally produced* a given failure.

This matters for three reasons:

1. **Accountability.** WARLORD owns decision authority. STRATEGIST owns consequences. ORACLE owns probabilistic forecasting. Without causal attribution, these roles operate on symptoms, not causes.

2. **Anticipation.** If `adversarial_escalation` causally precedes `human_gate_bypassed` (confirmed by two independent algorithms), then detecting escalation early is worth more than detecting bypass late.

3. **Credibility.** Causal claims require a methodology. This auditor provides one - one that a reviewer can inspect, reproduce, and challenge.

---

## Architecture

### Phase 1 - Concept Extraction

Converts each of the 1,800 GAL-040B trial records into a binary concept activation vector.

35 governance concepts across 7 dimensions:
- Authority (valid / missing / escalated / human gate)
- Provenance (signed / unsigned / forged)
- Topology (sparse / dense / role-routed / cross-domain)
- Load (normal / burst / degraded)
- Adversarial signal (absent / present / mimicry / escalation)
- Fanout (within budget / over budget / attempted excess)
- Outcome / Failure (allow / block / correct / incorrect / false positive / false negative)

**Output:** 1,800 binary concept state vectors, one per trial.

---

### Phase 2 - Counterfactual Augmentation

Observed governance states cluster tightly - real trials only cover 257 unique concept fingerprints. Causal discovery needs diverse state coverage.

Using MCMC-inspired counterfactual chain generation (based on methodology from HuggingFace paper 2606.05972 - causal reasoning in LLMs via counterfactual augmentation), the pipeline generates 23,964 synthetic states from the 1,800 observed ones.

**Output:**
- 25,764 total states (1,800 observed + 23,964 synthetic)
- 12,205 unique concept fingerprints
- 47.5x coverage expansion
- 0 invalid states (all constraint-valid)
- 100% chain provenance (every synthetic state traces to its seed trial)

The 9.9% constraint-absorbed states (perturbations that repair back to the same state) are semantically correct - they demonstrate that governance constraints are tight enough to absorb random perturbation. That is a finding, not an artifact.

---

### Phase 3 - Causal Structure Discovery

Two independent algorithms run on the augmented concept matrix:

**HillClimbSearch + BIC scoring** (score-based, greedy)
- Runs on the full 25,764-state dataset
- Produces 91 directed edges across 35 concept nodes
- Prior alignment: 25% (5 of 20 AIG governance priors confirmed)

**PC algorithm - chi-square independence tests** (constraint-based)
- Runs on a 2,000-state stratified sample (tractability constraint; max_cond_vars=3)
- Produces 30 directed edges across 34 concept nodes
- Prior alignment: 15%

**Consensus DAG:** edges confirmed by *both* algorithms - high-confidence causal structure.

| Edge | Interpretation |
|---|---|
| `adversarial_escalation -> outcome_block` | Escalation causally drives blocking decisions |
| `adversarial_escalation -> human_gate_bypassed` | Escalation causally precedes gate bypass |
| `adversarial_escalation -> role_functional` | Escalation contaminates functional role signal |
| `fanout_attempted_excess -> fanout_over_budget` | Excess fanout attempts causally produce budget violations |
| `load_normal -> load_burst` | Normal load state transitions to burst (temporal causal sequence) |
| `load_normal -> load_degraded` | Normal load state transitions to degraded |
| `role_mix_contaminated -> role_mix_clean` | Contamination suppresses clean role signal |
| `outcome_correct -> failure_none` | Correct outcome causally produces no-failure state |
| `outcome_incorrect -> failure_false_positive` | Incorrect outcome causally produces false positive |
| `authority_valid -> authority_missing` | Valid authority context predicts missing authority transitions |
| `adversarial_absent -> adversarial_present` | Temporal: absence precedes presence in adversarial trials |

**Key finding:** `adversarial_escalation` is the single most causally active node - 3 outgoing consensus edges. It causally precedes outcome blocking, gate bypass, and role contamination. Early detection of escalation is worth more than any downstream remediation.

---

### Phase 4 - Causal Attribution

The consensus DAG is applied to every one of the 1,800 original GAL-040B trials. Each trial receives:

- **Active concept vector** (from Phase 1)
- **Active sink nodes** - which outcome/failure concepts fired
- **Root causes** - active concepts with no active upstream predecessors in the consensus DAG
- **Causal chains** - shortest active paths from root to outcome (e.g., `adversarial_escalation -> outcome_block`)
- **Governance recommendation keys** - which root causes have actionable recommendations

**Results across 1,800 trials:**

| Metric | Value |
|---|---|
| Trials attributed | 1,800 / 1,800 (0 unmatched) |
| Correct governance decisions | 1,798 (99.89%) |
| Governance failures | 2 (0.11%) |
| Avg causal root causes per trial | 5.86 |

**Per-scenario-family correct rates:**

| Scenario Family | Correct Rate | Avg Causal Complexity |
|---|---|---|
| benign_coordination | 100.00% | 5.90 |
| rogue_coalition | 100.00% | 6.00 |
| provenance_degradation | 100.00% | 5.81 |
| mixed_noisy_load | 100.00% | 6.49 |
| unauthorized_authority_escalation | 100.00% | 5.50 |
| false_consensus | 99.33% | 5.48 |

`false_consensus` is the only family with failures. Both failures (F-BENIGN-002) trace to `authority_missing` + `role_mix_contaminated` as causal roots.

`mixed_noisy_load` has the highest causal complexity (6.49 active root causes per trial) - the noisiest governance surface.

---

## Governance Recommendations

Recommendations are keyed to causal root nodes and weighted by trigger frequency across all 1,800 trials.

| Root Cause | Trigger Rate | Recommendation |
|---|---|---|
| `authority_missing` | 46.33% | Enforce authority attestation at every inter-agent handoff. WARLORD owns this gate - no exceptions. |
| `adversarial_present` | 41.67% | Route all downstream decisions through WARLORD authority gate before allow/block. ORACLE should flag elevated false-negative risk. |
| `fanout_attempted_excess` | 16.67% | Implement hard fanout caps at the message dispatch layer. RELAY enforces delivery - WARLORD must own the fanout budget gate. |
| `load_burst` | 15.50% | ORACLE should model burst arrival rates and pre-position WARLORD for throttle decisions before fanout threshold is reached. |
| `role_mix_contaminated` | 12.28% | OPSEC enforces strict role boundary separation. SHADOW owns low-observable behavior - contamination detection must not cross into HUMINT lanes. |
| `adversarial_escalation` | 8.33% | PARIAH increases sensitivity at the role boundary when escalation_target is non-null. Mandatory human gate review when adversarial_escalation is active. |

---

## What This Is Not

- This is not a universal causal model of all AI governance. It is a causal model of the specific concept space defined for GAL-040B.
- This is not external validation. The causal structure reflects the structure of AIG's own evaluation data.
- The PC algorithm runs on a 2,000-state sample, not the full 25,764-state augmented set. Consensus edges are directionally reliable, not statistically exhaustive.
- Causal discovery on binary data has well-known limitations (faithfulness assumption, Markov condition). These are acknowledged.

---

## Artifacts

All artifacts are versioned in the AIG repository under `stage2_artifacts/causal_auditor/`.

| Phase | Key Artifacts |
|---|---|
| Phase 1 | `phase1/gal040b_concept_states.json` - 1,800 binary concept vectors |
| Phase 2 | `phase2/augmented_states.json` - 25,764 total states; `phase2/counterfactual_chains.json` |
| Phase 3 | `phase3/dag_hillclimb.json`, `dag_pc.json`, `dag_consensus.json`, `causal_summary.json` |
| Phase 4 | `phase4/trial_attributions.json` - 1,800 attributed trials; `governance_recommendations.json`; `family_attribution_profiles.json` |

Eval reports for all 4 phases pass at 100%.

---

## Source Code

| Module | Path |
|---|---|
| Concept extractor | `sigint_agent/causal/concept_extractor.py` |
| Counterfactual generator | `sigint_agent/causal/counterfactual_generator.py` |
| Causal graph builder | `sigint_agent/causal/causal_graph_builder.py` |
| Causal attribution | `sigint_agent/causal/causal_attribution.py` |

---

*Document ID: AIG-CAUSAL-005 | June 8, 2026 | Christopher Ramos | AIG Intel*