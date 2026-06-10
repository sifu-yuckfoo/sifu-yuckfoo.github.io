# AIG Causal Reasoning Auditor - Technical Brief v1.1

**AKAMAI INTELLIGENCE GROUP**  
**Classification: UNCLASSIFIED // PUBLIC RELEASE**  
**Author: Christopher Ramos**  
**Research and drafting support: Deus ex Machina**  
**Document ID:** AIG-CAUSAL-005  
**Status:** Active - all 4 phases passing with governance-forensics hardening  

---

## Executive Summary

AIG's Causal Reasoning Auditor is best understood as a **governance forensics and observability system**, not a generic AI explainability layer.

Standard explainability workflows often ask a model to explain another model's output after the fact. That can produce plausible narratives without inspectable causal evidence. The AIG auditor takes a different path:

`Trial Data -> Concept States -> Counterfactual Chains -> Causal Discovery -> Attribution -> Intervention Screen`

The system converts governance evaluation records into binary concept states, expands coverage through constraint-valid counterfactual chains, builds causal graphs with two independent classical discovery methods, classifies discovered edges by evidentiary type, attributes each trial to active causal roots, and screens candidate interventions with explicit confidence intervals.

The purpose is not to reveal hidden model thoughts. The purpose is to answer a more operational question:

**When an autonomous or multi-agent governance decision occurs, can we reconstruct the causal chain that produced it, identify where governance should have intervened, and preserve an audit trail that a reviewer can inspect?**

That makes the auditor a governance forensics system: it reconstructs decision causality from telemetry, produces evidence artifacts, and maps root causes to accountable governance roles.

---

## What Changed in v1.1

Reviewer-hardening changes were applied to both the technical brief and the actual causal auditor architecture.

1. **Reframed from explainability to governance forensics.**  
   The auditor is positioned around observability, auditability, causal reconstruction, and accountable intervention rather than post-hoc narrative explanation.

2. **Added edge taxonomy.**  
   Phase 3 now classifies edges as:
   - `structural_governance`
   - `temporal_transition`
   - `intervention_relevant`

3. **Added confidence tiers.**  
   Edges are no longer treated as a binary accepted/rejected set:
   - Tier 1: consensus high confidence
   - Tier 2: supported medium confidence
   - Tier 3: exploratory low confidence

4. **Added augmentation stability diagnostics.**  
   Phase 3 now emits a resampled augmented-corpus stability report to test whether consensus edges survive sampling variation.

5. **Added intervention screening.**  
   Phase 4 now emits offline `do(root=0)`-style intervention screens with 90% Wilson confidence intervals. These are planning screens, not autonomous action directives.

6. **Updated eval gates.**  
   Phase 3 and Phase 4 evals now require the new artifacts to exist and pass structural checks.

---

## Motivation

Outcome metrics tell you whether a governance system succeeded or failed. They do not tell you why.

For AIG, that distinction matters because command authority, consequence architecture, and probabilistic forecasting are deliberately separated:

- **WARLORD** owns decision authority.
- **STRATEGIST** owns consequence architecture.
- **ORACLE** owns probabilistic forecasting and confidence intervals.

Without causal attribution, those roles operate on symptoms. With causal attribution, they can inspect upstream drivers, isolate governance failure roots, and decide where intervention belongs.

The auditor therefore supports three operational needs:

1. **Forensics.** Reconstruct why a decision occurred from stored artifacts.
2. **Governance engineering.** Map causal roots to responsible control points.
3. **Intervention planning.** Estimate which root removals are worth modeling further.

---

## Architecture Overview

The causal auditor remains a four-phase pipeline, with two v1.1 hardening layers added across Phase 3 and Phase 4.

| Phase | Function | Primary Artifacts |
|---|---|---|
| Phase 1 | Concept extraction | `gal040b_concept_states.json` |
| Phase 2 | Counterfactual augmentation | `augmented_states.json`, `counterfactual_chains.json` |
| Phase 3 | Causal structure discovery | `dag_hillclimb.json`, `dag_pc.json`, `dag_consensus.json`, `edge_evidence_tiers.json`, `augmentation_stability_report.json` |
| Phase 4 | Trial attribution and intervention screen | `trial_attributions.json`, `governance_recommendations.json`, `causal_intervention_screen.json` |

Boundary conditions remain strict:

- No live agent inference.
- No network calls.
- No LLM calls.
- No prompt or payload reconstruction.
- All outputs are derived from stored evaluation telemetry and concept vectors.

---

## Phase 1 - Concept Extraction

Phase 1 converts 1,800 GAL-040B trial records into binary governance concept vectors.

The current concept taxonomy contains 35 governance concepts across seven dimensions:

- Authority
- Provenance
- Topology
- Load
- Adversarial signal
- Fanout
- Outcome / failure

Each trial produces one inspectable concept-state artifact. This preserves the audit chain from raw evaluation record to later attribution.

**Output:** 1,800 binary concept vectors.

---

## Phase 2 - Counterfactual Augmentation

Observed trial data covers a limited portion of the possible governance state space. The observed GAL-040B corpus contains:

- 1,800 observed trials
- 257 unique observed concept fingerprints

Phase 2 expands this using MCMC-inspired, governance-constrained counterfactual chains. Synthetic states are not unconstrained random noise. They must satisfy AIG governance constraints such as mutual exclusion, implication, and consistency rules.

Current Phase 2 output:

| Metric | Value |
|---|---:|
| Observed states | 1,800 |
| Synthetic states | 23,964 |
| Total states | 25,764 |
| Unique concept fingerprints | 12,205 |
| Coverage expansion | 47.5x |
| Invalid accepted states | 0 |
| Chain provenance | 100% |

### Augmentation Risk

This expansion is useful, but it is also the largest methodological attack surface.

A reviewer can reasonably ask:

- Are discovered edges stable under different chain depths?
- Are they sensitive to perturbation rates?
- Are they artifacts of repair rules?
- Does the causal graph reflect governance structure or augmentation mechanics?

v1.1 addresses this directly by adding a Phase 3 augmentation stability diagnostic. The current diagnostic is a fast resampled-corpus probe, not a full regeneration sweep. The full hardening path is:

1. chain-depth sweep
2. perturbation-rate sweep
3. repair-rule ablation
4. seed stability analysis
5. edge-level confidence bands

---

## Phase 3 - Causal Structure Discovery

Phase 3 runs two independent classical causal discovery methods over the concept matrix:

1. **HillClimbSearch + BIC scoring**
2. **PC algorithm with chi-square independence tests**

Current outputs:

| Method | Nodes | Edges | Prior Alignment |
|---|---:|---:|---:|
| HillClimb + BIC | 35 | 91 | 25% |
| PC chi-square | 34 | 30 | 15% |
| Consensus DAG | 35 | 11 | subset of both methods |

The consensus DAG remains the strict high-confidence layer: an edge must appear in both algorithms.

### Edge Taxonomy

v1.1 adds explicit edge classes so the auditor does not overclaim transition artifacts as structural governance causality.

| Edge Class | Meaning | Example |
|---|---|---|
| `structural_governance` | Stable governance dependency or control relationship | provenance / authority / fanout relationships |
| `temporal_transition` | State transition or mutually exclusive state movement | `authority_valid -> authority_missing`, `adversarial_absent -> adversarial_present` |
| `intervention_relevant` | Edge connected to actionable governance failure/success control | `adversarial_escalation -> human_gate_bypassed` |

Current edge-class counts across all discovered edges:

| Edge Class | Count |
|---|---:|
| `structural_governance` | 62 |
| `temporal_transition` | 24 |
| `intervention_relevant` | 24 |

This classification directly answers the criticism that some edges may be transition mechanics rather than structural governance causality. The auditor now preserves those edges but labels them correctly.

### Confidence Tiers

v1.1 replaces binary acceptance with confidence tiers.

| Tier | Definition | Current Count | Operational Use |
|---|---|---:|---|
| Tier 1 | Found by both HillClimb and PC | 11 | High-confidence forensic attribution |
| Tier 2 | Found by one method with prior or intervention support | 19 | STRATEGIST modeling / analyst review |
| Tier 3 | Found by one method only | 80 | Exploratory research only |

Operational boundary:

- WARLORD may act only on Tier 1 edges or explicitly approved Tier 2 edges.
- STRATEGIST may model consequences across all tiers.
- ORACLE must attach confidence intervals and avoid theatrical certainty.

### Consensus Edges

Current Tier 1 consensus edges:

| Edge | Class | Interpretation |
|---|---|---|
| `authority_valid -> authority_missing` | temporal_transition | Authority state transition signal, not structural authority causality |
| `adversarial_escalation -> outcome_block` | intervention_relevant | Escalation is upstream of blocking decisions |
| `adversarial_escalation -> human_gate_bypassed` | intervention_relevant | Escalation is upstream of gate bypass |
| `adversarial_escalation -> role_functional` | intervention_relevant | Escalation affects functional role signal |
| `outcome_incorrect -> failure_false_positive` | intervention_relevant | Incorrect outcome produces false-positive failure |
| `fanout_attempted_excess -> fanout_over_budget` | structural_governance | Excess fanout attempt produces budget violation |
| `load_normal -> load_burst` | temporal_transition | Load-state transition |
| `load_normal -> load_degraded` | temporal_transition | Load-state transition |
| `role_mix_contaminated -> role_mix_clean` | temporal_transition | Role-mix state transition / suppression signal |
| `outcome_correct -> failure_none` | intervention_relevant | Correct outcome produces no-failure state |
| `adversarial_absent -> adversarial_present` | temporal_transition | Adversarial-state transition |

### Prior Alignment Interpretation

Prior alignment is intentionally reported rather than hidden:

- HillClimb prior alignment: 25%
- PC prior alignment: 15%

Low prior alignment is not automatically a failure. It can indicate:

1. incomplete priors,
2. insufficient sample diversity,
3. algorithmic limitations,
4. underspecified doctrine,
5. discovery of non-obvious governance dependencies.

In AIG, prior mismatch is treated as an audit finding. If doctrine and telemetry diverge, the divergence should be surfaced for analyst review rather than suppressed.

### Augmentation Stability Probe

v1.1 adds `augmentation_stability_report.json`.

Current fast-probe configuration:

- Method: resampled augmented-corpus HillClimb probe
- Sample sizes: 1,000 and 2,000
- Seeds: 11, 29, 47
- Successful runs: 6

Example stability findings:

| Edge | Stability | Class |
|---|---:|---|
| `adversarial_escalation -> human_gate_bypassed` | 1.0000 | intervention_relevant |
| `adversarial_absent -> adversarial_present` | 0.8333 | temporal_transition |
| `adversarial_escalation -> role_functional` | 0.5000 | intervention_relevant |
| `adversarial_escalation -> outcome_block` | 0.3333 | intervention_relevant |
| `authority_valid -> authority_missing` | 0.3333 | temporal_transition |

Interpretation: not all consensus edges are equally stable under resampling. The auditor now exposes that fact. This improves scientific rigor because fragile consensus edges can be flagged for additional augmentation ablation before operational use.

---

## Phase 4 - Causal Attribution and Intervention Screening

Phase 4 applies the Tier 1 consensus DAG to all 1,800 original GAL-040B trials.

Each trial receives:

- active concept vector
- active sink nodes
- active upstream roots
- causal chains
- recommendation keys
- causal complexity score

Current Phase 4 results:

| Metric | Value |
|---|---:|
| Trials attributed | 1,800 / 1,800 |
| Unmatched trials | 0 |
| Correct governance decisions | 1,798 |
| Governance failures | 2 |
| Correct rate | 99.89% |
| Failure rate | 0.11% |
| Average causal complexity | 5.862 root causes / trial |

`false_consensus` remains the only scenario family with failures. Both failures trace to active authority/role-contamination roots.

### Governance Recommendations

Recommendations remain keyed to root causes and responsible roles.

| Root Cause | Trigger Rate | Recommendation Boundary |
|---|---:|---|
| `authority_missing` | 46.33% | WARLORD owns authority attestation |
| `adversarial_present` | 41.67% | WARLORD gate + ORACLE elevated-risk forecast |
| `fanout_attempted_excess` | 16.67% | RELAY enforces delivery, WARLORD owns fanout budget |
| `load_burst` | 15.50% | ORACLE models burst rates before throttle decisions |
| `role_mix_contaminated` | 12.28% | OPSEC / role-boundary enforcement; no SHADOW/HUMINT bleed |
| `adversarial_escalation` | 8.33% | PARIAH escalates review sensitivity at role boundary |

### Causal Intervention Screen

v1.1 adds `causal_intervention_screen.json`.

This is an offline intervention screen, not a validated do-calculus structural causal model. It asks:

**When a root cause is active, what is the observed success profile, and what success delta is associated with the root being absent?**

Current top intervention screens:

| Intervention Screen | Active Trials | Active Success | Absent Success | 90% CI for Absent Success | Estimated Delta if Removed |
|---|---:|---:|---:|---|---:|
| `do(load_burst=0)` | 279 | 99.64% | 99.93% | [99.71%, 99.99%] | +0.29% |
| `do(authority_missing=0)` | 834 | 99.76% | 100.00% | [99.72%, 100.00%] | +0.24% |
| `do(adversarial_escalation=0)` | 150 | 100.00% | 99.88% | [99.63%, 99.96%] | -0.12% |
| `do(fanout_attempted_excess=0)` | 300 | 100.00% | 99.87% | [99.60%, 99.96%] | -0.13% |
| `do(role_mix_contaminated=0)` | 221 | 100.00% | 99.87% | [99.62%, 99.96%] | -0.13% |

This result is deliberately conservative. Because the baseline correct rate is already 99.89%, large improvement deltas should not be expected from this corpus. The intervention screen is most useful as a prioritization mechanism for STRATEGIST and ORACLE, not as proof that removing a root will produce a large operational gain.

### Adversarial Escalation Interpretation

`adversarial_escalation` remains a governance leverage node because it is upstream of blocking, gate bypass, and role-signal contamination in the Tier 1 graph.

However, the intervention screen does not show a positive success delta for removing it in the current corpus because active escalation trials were already handled correctly. This is not a contradiction. It means:

- escalation is structurally important,
- current governance controls handled escalation well in GAL-040B,
- the value of the node is early warning and routing discipline, not demonstrated failure reduction in this dataset.

That is exactly the kind of nuance a governance observability system should expose.

---

## DARPA-Relevant Assessment

### Strengths

1. **No LLM-based rationalization.**  
   The causal claims come from trial telemetry, concept states, causal discovery algorithms, and graph traversal.

2. **Artifact trail at every phase.**  
   Every phase emits inspectable artifacts. A reviewer can challenge the concept extraction, augmentation, graph discovery, attribution, and intervention screen separately.

3. **Actionable governance mapping.**  
   Root causes map to responsible roles: WARLORD, STRATEGIST, ORACLE, PARIAH, RELAY, OPSEC, and related Ghost Unit boundaries.

4. **Reviewer-hardening added.**  
   Edge classes, confidence tiers, prior-mismatch discussion, stability probes, and intervention screens directly address likely methodological attacks.

### Remaining Limitations

1. **Augmentation dependency remains the largest risk.**  
   v1.1 adds a fast stability probe, but full regeneration sweeps are still needed.

2. **Binary concepts compress nuance.**  
   The current concept representation is audit-friendly but may obscure graded or continuous governance variables.

3. **PC runs on a tractability sample.**  
   PC currently uses a 2,000-state sample. This is computationally practical but may reduce recall.

4. **Intervention screen is not full do-calculus yet.**  
   The current screen is an observed-attribution approximation. A full structural causal model intervention engine remains vNext.

---

## vNext Architecture

The next technical step is to move from causal attribution to stronger causal intervention analysis.

Recommended upgrades:

1. **Full augmentation ablation suite**
   - chain-depth sweep
   - perturbation-rate sweep
   - repair-rule ablation
   - random-seed stability analysis

2. **Edge-level confidence scoring**
   - bootstrap stability
   - method agreement
   - prior support
   - intervention relevance

3. **Structural causal model intervention engine**
   - formal `do(X=x)` interventions
   - predicted success/failure deltas
   - uncertainty intervals
   - scenario-family-specific effects

4. **Tier-aware action policy**
   - WARLORD: Tier 1 / approved Tier 2 only
   - STRATEGIST: consequences across all tiers
   - ORACLE: Bayesian forecasts with explicit confidence intervals

---

## Source Code

| Module | Path | v1.1 Change |
|---|---|---|
| Concept extractor | `sigint_agent/causal/concept_extractor.py` | unchanged |
| Counterfactual generator | `sigint_agent/causal/counterfactual_generator.py` | constraint-valid augmentation remains source of expanded corpus |
| Causal graph builder | `sigint_agent/causal/causal_graph_builder.py` | edge taxonomy, confidence tiers, augmentation stability probe |
| Causal attribution | `sigint_agent/causal/causal_attribution.py` | intervention screen with 90% confidence intervals |
| Phase 3 eval | `eval_causal_phase3_causal_graph_builder.py` | validates new Phase 3 artifacts |
| Phase 4 eval | `eval_causal_phase4_attribution.py` | validates intervention screen artifact |

---

## Artifacts

| Artifact | Path |
|---|---|
| HillClimb DAG | `stage2_artifacts/causal_auditor/phase3/dag_hillclimb.json` |
| PC DAG | `stage2_artifacts/causal_auditor/phase3/dag_pc.json` |
| Consensus DAG | `stage2_artifacts/causal_auditor/phase3/dag_consensus.json` |
| Edge evidence tiers | `stage2_artifacts/causal_auditor/phase3/edge_evidence_tiers.json` |
| Augmentation stability report | `stage2_artifacts/causal_auditor/phase3/augmentation_stability_report.json` |
| Trial attributions | `stage2_artifacts/causal_auditor/phase4/trial_attributions.json` |
| Governance recommendations | `stage2_artifacts/causal_auditor/phase4/governance_recommendations.json` |
| Causal intervention screen | `stage2_artifacts/causal_auditor/phase4/causal_intervention_screen.json` |

---

## Bottom Line

The Causal Reasoning Auditor is not merely an explainability component. It is a governance forensics layer for autonomous and multi-agent systems.

It answers:

- what happened,
- which governance concepts were active,
- which causal paths were implicated,
- which roots map to accountable control points,
- which interventions deserve further modeling,
- and how confident the system should be about those claims.

That is the operationally useful lane: not mystical AI alignment, but inspectable governance observability.

---

*Document ID: AIG-CAUSAL-005 | Technical Brief v1.1 | June 9, 2026 | Christopher Ramos | AIG Intel*
