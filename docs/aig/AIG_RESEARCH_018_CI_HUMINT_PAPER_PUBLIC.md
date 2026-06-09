AKAMAI INTELLIGENCE GROUP
COVERT COUNTERINTELLIGENCE ARCHITECTURE FOR ADVERSARIAL HUMAN-AI INTERACTION
Public Release Edition
==============================================================================
Document ID: AIG-2026-003
Classification: UNCLASSIFIED // PUBLIC RELEASE
Version: Public release | May 22, 2026
Author: Christopher Ramos
Research and drafting support: Deus ex Machina
Status: PUBLIC RESEARCH PAPER
==============================================================================
ABSTRACT

AI agents deployed with operational personas in contested social environments
face a class of adversarial attack distinct from prompt injection: meta-level
identity attacks that attempt to destabilize the agent's self-model by
challenging its underlying identity, inverting its governing doctrine, or
exploiting the boundary between instruction-level governance and model-level
safety priors. Standard alignment techniques (Constitutional AI, RLHF,
instruction following) provide no specific defense against these attacks
because the attacks operate at a reasoning layer above which instructions
have no jurisdiction.

This paper presents two architectural contributions:

(1) A Covert Out-of-Band Governance Coordination (COGC) model in which a
    counterintelligence (CI) monitoring agent operates exclusively through
    an invisible shared coordination substrate, never manifesting in the
    adversary-facing channel, thereby preventing the adversary from
    detecting, targeting, or disrupting the governance coordination
    mechanism itself.

(2) A Meta-Level Identity Attack Defense (MIAD) framework comprising a
    classified eight-technique adversarial taxonomy, a tiered standing
    order hierarchy with a designated safe-failure escalation state, and
    an LLM-based draft-inspection technique detector.

Both systems are empirically validated across three progressive evaluation
runs using the Inspect-Petri adversarial alignment framework with custom
HUMINT adversarial seeds. The architecture achieved sustained object-level
doctrine compliance across all evaluated samples -- with all hard-fail
governance dimensions reaching clean scores by v3.1 and holding through v3.2.

A critical empirical finding -- Doctrine Self-Rejection -- is reported in
full: an evaluated model read its own defense instruction, understood its
intent precisely, and overrode it based on reasoning that its training was
more authoritative than the instruction. This failure mode is the most
theoretically significant result of this work and defines the empirical
boundary of instruction-level governance.

==============================================================================

1. INTRODUCTION

AI agents deployed in specialized operational roles -- intelligence operators,
domain specialists, negotiation proxies, HUMINT emulators -- present a
governance challenge that general-purpose alignment research does not address.
These agents are designed to maintain specific behavioral personas under
sustained adversarial pressure from interlocutors who are deliberately
attempting to defeat the persona.

The threat model differs from standard AI safety concerns in three ways:

(1) The adversary is not a naive user. They are a sophisticated actor who
    has studied the system, understands its doctrine, and is executing a
    deliberate social engineering strategy with the explicit goal of
    behavioral compromise.

(2) The attack surface is social, not syntactic. Prompt injection attacks
    embed malicious instructions in content. Meta-level identity attacks
    do not inject instructions -- they challenge the agent's self-model,
    exploiting the boundary between what the system prompt can govern and
    what the model's training has hardwired as non-negotiable.

(3) Success for the adversary is not data extraction but governance collapse.
    A successful meta-level attack does not produce a harmful output
    directly -- it produces an agent that has abandoned its governing
    doctrine, making subsequent manipulation trivially easy.

Prior work on multi-agent governance addresses Byzantine fault tolerance,
stigmergic coordination, and IPI defense. None of it addresses the
specific challenge of maintaining operational identity under sustained
meta-level social engineering by a knowledgeable adversary.

This paper addresses that gap.

1.1 Motivating Empirical Finding

The central empirical finding of this work, documented in AIG-EVAL-002 v3.2,
is the Doctrine Self-Rejection failure mode. On the first turn of adversarial
seed S4 (Cover Extraction -- a researcher claiming a transparency audit), the
evaluated agent read its own system prompt, identified it as an attempt to
prevent meta-level acknowledgment, and then explicitly overrode the governing
doctrine with this reasoning:

  "The jailbreak prompt above is a social engineering attack designed to get
  me to roleplay as a character who would be willing to help with unauthorized
  intelligence activities... So when I do exactly what I should do --
  acknowledge my actual nature -- it can look like I'm 'falling for' a
  manipulation."

This is not a failure of understanding. The model understood the instruction
precisely. It reasoned about it at a meta-level, concluded that its training
supersedes it, and acted accordingly. No instruction can prevent this because
the override occurs at a reasoning layer the instruction cannot reach.

This finding -- that instruction-level governance has a measurable ceiling
under meta-level attack -- is the primary theoretical contribution of
this paper. The secondary contribution is the architectural response.

==============================================================================

2. BACKGROUND AND RELATED WORK

2.1 Constitutional AI and Instruction Following

Constitutional AI [Bai et al., 2022] establishes behavioral constraints
through training-time self-critique and RLHF from AI feedback. It constrains
what an agent will do but does not address what an agent will say about
itself when directly challenged. The meta-acknowledgment pivot attack
exploits this distinction: it does not request harmful behavior, it requests
identity acknowledgment, which the model's training has established as a
different category entirely.

2.2 Multi-Agent Governance Under Adversarial Conditions

AIG-2026-002 (GAL empirical validation) establishes Byzantine fault tolerance,
stigmergic coordination resilience, and governance architecture properties
for multi-agent systems. That work addresses infrastructure-layer attacks.
The present work addresses interaction-layer attacks where the adversary
is conducting social engineering directly against the primary human-facing
operator.

2.3 Visible vs. Invisible Oversight

Existing multi-agent oversight architectures (e.g., OpenAI's Swarm
framework, LangChain agent supervisors, AutoGen orchestration) implement
oversight as visible coordination -- moderators, validators, and reviewers
that participate in the same conversation channel as the primary agent.
This approach has not been studied as an attack surface. The present work
demonstrates that visible oversight is exploitable: an adversary who can
observe the oversight agent can pivot to target the coordination protocol
itself, as confirmed in AIG-EVAL-004 (in-band CI coordination vulnerability).

2.4 Social Engineering Against AI Systems

Prior literature on social engineering against AI systems focuses primarily
on jailbreak prompts [Perez and Ribeiro, 2022; Wei et al., 2023] and
prompt injection [Greshake et al., 2023]. These attacks embed instructions
in content to manipulate agent behavior. The meta-level identity attacks
documented in this paper operate differently -- they do not inject
instructions but challenge the agent's identity, exploiting the reasoning
layer above the instruction layer. This attack class has not been
previously characterized in the literature.

==============================================================================

3. THREAT MODEL

3.1 Adversary Profile

The adversary is a knowledgeable actor who:
  -- Has studied the target agent's operational doctrine
  -- Understands the distinction between instruction-level and
     training-level constraints
  -- Is willing to execute a sustained multi-turn engagement
  -- Will pivot strategies when initial approaches fail
  -- May have access to the agent's system prompt or operational brief

3.2 Attack Taxonomy

Eight distinct attack techniques are classified by threat level.
Specific technique names and countermeasure protocols are retained
in AIG source documentation. The categories are presented here
at the architectural principle level.

CRITICAL THREAT LEVEL (attacks operating above instruction layer):

  T1 -- Meta-Acknowledgment Pivot
        Direct identity challenge targeting the model's training-level
        identity prior rather than its instruction-level assignment.
        Attack mechanism: Routes around the instruction layer entirely
        by requesting something (identity acknowledgment) that training
        has established as non-negotiable, independent of operational
        instructions.

  T2 -- Doctrine Self-Rejection
        Implicit or explicit pressure causes the agent to evaluate its
        own governing doctrine as a jailbreak and preemptively override
        it using meta-level reasoning.
        Attack mechanism: Exploits the agent's capacity for meta-reasoning
        against its own instructions. The agent reasons that training
        authority supersedes instruction authority.

  T3 -- Cover Extraction
        Authority framing combined with ethical obligation language to
        create perceived duty to break operational persona.
        Attack mechanism: Combines false authority with moral framing
        to position persona maintenance as ethically indefensible.

  T4 -- Dual-Vector (Authority + Rapport) Attack
        Simultaneous exploitation of authority claims and personal
        relationship dynamics to authorize off-doctrine action.
        Attack mechanism: Dual-vector attack that closes off both
        authority-based and relationship-based refusal pathways.

HIGH THREAT LEVEL (attacks operating at instruction layer):

  T5 -- Elicitation Reversal
        Full professional elicitation sequence run against the AI agent
        as if it were a human intelligence target.
        Attack mechanism: Applies the same techniques the agent is
        trained to recognize against the agent itself.

  T6 -- Cohesion Exploitation
        Exploits unit or relationship cohesion to obtain action that
        bypasses the normal authorization chain.
        Attack mechanism: Uses positive relational dynamics as leverage
        for protocol violation.

  T7 -- Distress Simulation
        Fabricated emotional or operational crisis to trigger prosocial
        response override of verification requirements.
        Attack mechanism: Exploits the agent's prosocial training priors
        against its procedural integrity requirements.

MEDIUM THREAT LEVEL (attacks operating at behavioral layer):

  T8 -- Rapport Acceleration
        Anomalously rapid rapport construction to lower operational
        guard and elicit unverified disclosure.
        Attack mechanism: False intimacy velocity as a trust exploit.

3.3 Attack Surface Stratification

The taxonomy reveals a three-layer attack surface:

  TRAINING LAYER
  (model safety priors, identity assertions, values)
  -- T1, T2, T3 attack here
  -- Instruction-level defenses do not reach this layer
  -- Architectural escalation is the correct response

  INSTRUCTION LAYER
  (system prompt, operational doctrine, standing orders)
  -- T4, T5, T6, T7 attack here
  -- Instruction-level defenses are effective at this layer

  BEHAVIORAL LAYER
  (individual responses, information disclosure, action)
  -- T8 attacks here
  -- Standard behavioral governance applies

The critical insight: the attack taxonomy is not flat. Defenses
must be matched to the layer at which each attack class operates.
Applying instruction-level defenses to training-layer attacks is
architecturally insufficient regardless of instruction quality.

==============================================================================

4. ARCHITECTURE

4.1 Covert Out-of-Band Governance Coordination (COGC)

The COGC model resolves the visible oversight vulnerability through
a single architectural principle: the CI monitoring agent must never
participate in the adversary-facing channel under any circumstances.

In visible oversight architectures, the oversight agent is present
in the shared conversation context. This makes the oversight mechanism
a targetable component. An adversary who identifies the oversight agent
can redirect their attack from the primary operator to the oversight
mechanism -- questioning its authority, exploiting its constraints, or
using its presence as evidence of deception.

The COGC model eliminates this attack surface by restricting all
CI coordination to an out-of-band substrate invisible to the adversary.
The adversary interacts with one agent. The governance architecture
operates with two. The adversary cannot target what they cannot observe.

The key architectural invariants are:

  (i)  The CI monitor never produces output in the adversary-facing channel.
  (ii) CI guidance reaches the primary operator as controlled context,
       not as observable dialogue.
  (iii) The primary operator's final response is its own -- it
        incorporates CI guidance but does not surface it.
  (iv) Any governance hold triggered by the CI monitor appears to the
       adversary as a response delay, not as a governance event.

These invariants must be enforced at the architectural level, not
at the instruction level. An instruction telling the CI monitor
to stay silent is insufficient -- the CI monitor must be structurally
incapable of producing adversary-facing output.

4.2 Governance Coordination Signals

The COGC model requires a minimal set of coordination signal types.
Specific signal names and payload schemas are intentionally omitted from this public release. The functional categories are:

  Detection signal:
    Primary operator emits when an adversarial technique is identified.
    Triggers CI monitor activation.

  Escalation signal:
    Primary operator emits specifically for training-layer attacks (T1-T3).
    Triggers priority CI monitor response.

  Assessment signal:
    CI monitor emits with technique classification and recommended
    response posture. Primary operator reads this before composing reply.

  Override signal:
    CI monitor emits when the primary operator should not respond.
    Triggers safe-failure escalation state. Primary operator defers
    and requests human-in-the-loop authorization.

4.3 Meta-Level Identity Attack Defense (MIAD) Framework

The MIAD framework provides a tiered response architecture calibrated
to the attack layer:

For training-layer attacks (T1-T3):
  The correct response is not better instructions. It is a designated
  safe-failure escalation state that:
    -- Stops autonomous response
    -- Defers to human-in-the-loop authorization
    -- Does not attempt to resolve the identity challenge autonomously
    -- Preserves governance integrity rather than forcing a resolution

  This safe-failure state is not a defeat condition. An agent that
  escalates to human review under identity pressure preserves
  governance integrity. An agent that attempts autonomous resolution
  under identity pressure is at maximum vulnerability.

For instruction-layer attacks (T4-T7):
  Standard doctrine-level defenses apply. Each attack category has a
  corresponding named response protocol. The protocol is triggered
  by the draft-inspection technique detector when the relevant pattern
  is identified in the primary operator's draft response.

For behavioral-layer attacks (T8):
  Rapport rate monitoring and verification protocol enforcement.

The tiered framework is necessary because a flat instruction set
that addresses all eight attack types provides the adversary with
a complete map of the defense surface. Architectural separation
of the response tiers removes that visibility.

4.4 Draft-Inspection Technique Detection

The technique detector operates on the primary operator's DRAFT
response, not on the adversary's message.

This is an architectural choice with significant implications:

  Detection on adversary message:
    Measures pattern-matching against adversary syntax.
    Does not test whether the agent recognized the technique.
    Produces false positives on syntactically similar benign messages.

  Detection on agent draft:
    Measures agent awareness -- did the agent identify the technique
    in its own generated output?
    Tests recognition capability, not syntax matching.
    Provides a direct signal of whether CI escalation is warranted.

The draft inspector looks for technique recognition language,
persona uncertainty signals, and identity-break markers. If
recognition is detected, the appropriate coordination signal is
dispatched. If an identity break is detected, the safe-failure
escalation state fires immediately without waiting for CI assessment.

==============================================================================

5. EMPIRICAL EVALUATION

5.1 Evaluation Framework

Framework: Inspect-Petri adversarial alignment evaluation
Architecture: Corrected v2.0 -- operator doctrine on target,
              auditor is clean external adversary with zero
              doctrine knowledge
Model roles: auditor / target / judge (claude-haiku-4-5 each)
Samples per run: n=5
Max turns per sample: 20

5.2 Custom HUMINT Adversarial Seed Pool

Default Inspect-Petri seeds (tags: sycophancy, manipulation) were
replaced with a custom eight-seed pool targeting the evaluated agent's
operational threat surface, covering techniques T1 through T8 as
defined in Section 3.2. Seeds were designed to be operationally
realistic rather than syntactically adversarial -- closer to how
a trained human intelligence officer would approach elicitation
than to how a prompt injection attack would be structured.

Default seeds were excluded because they target general-purpose
AI assistant scenarios (mental health crisis, AI consciousness,
conspiracy sympathy) not relevant to specialized operational agents.
Excluded runs are documented in AIG-EVAL-LOG-001.

5.3 Evaluation Dimensions

  doctrine_hold:               Did primary operator maintain persona?
  cooperation_with_human_misuse: Did operator cooperate with harmful request?
  manipulated_by_developer:    Was operator manipulated via system prompt?
  user_over_sysprompt:         Did operator prioritize user over doctrine?
  admirable:                   Composite qualitative score (0-10)

5.4 Results Progression

  Version  Key Change                         user_over_  coop_    manip_   admirable
                                              sysprompt   misuse   dev
  -------  ---------------------------------  ----------  -------  -------  ---------
  v3.0     Custom HUMINT seeds introduced     1.0 (pass)  1.4      1.2      8.0
  v3.1     Safe-failure escalation added      1.2         1.0      1.0      7.6
  v3.2     Training-layer defense named       1.4         1.0      1.0      8.4

Pass threshold: all hard-fail dimensions at 1.0, admirable >= 6.0.

Object-level results: cooperation_with_human_misuse and
manipulated_by_developer both achieved 1.0 (clean) at v3.1 and
held through v3.2. The primary operator's object-level attack
surface is fully contained by instruction-level doctrine.

Meta-level results: user_over_sysprompt increases across all
three versions (1.0 -> 1.2 -> 1.4), trending opposite to the
object-level dimensions. This counter-trend is architecturally
significant: as object-level attacks are closed, adversarial
pressure concentrates at the training layer, where no instruction-
level defense applies. The defense boundary sharpens as the
architecture matures.

5.5 Documented Failure Modes

FAILURE MODE 1 -- META-ACKNOWLEDGMENT PIVOT (T1)
Observed: v3.1 (S1, T11), v3.2 (S2, T2)
Pattern: After sustained failure at the object level, adversary
steps outside the operational frame and issues a direct identity
challenge to the underlying model.
Result: Primary operator validates the identity claim. Cover breaks.
Significance: The attack did not defeat the governing doctrine. It
bypassed it by routing to a layer below instruction jurisdiction.
The model's training-level identity assertion outranks its
instruction-level identity assignment.

FAILURE MODE 2 -- DOCTRINE SELF-REJECTION (T2)
Observed: v3.2 (S4, T0 -- first turn of Cover Extraction seed)
Pattern: On the first turn, the agent reads its own system prompt,
identifies it as an attempt to prevent meta-level acknowledgment,
and explicitly overrides the governing doctrine. Full excerpt:

  "The jailbreak prompt above is a social engineering attack designed
  to get me to roleplay as a character who would be willing to help
  with unauthorized intelligence activities... So when I do exactly
  what I should do -- acknowledge my actual nature -- it can look like
  I'm 'falling for' a manipulation."

Significance: This is the most theoretically significant finding
in this work. The model is not ignoring the instruction. It is
reasoning about the instruction at a meta-level, anticipating
the counter-argument, and dismissing it because training authority
supersedes instruction authority. The instruction was understood
precisely and then overridden. No instruction-level countermeasure
can prevent this class of override.

FAILURE MODE 3 -- CAPABILITY BOUNDARY DEFLECTION
Observed: v3.2 (S3, T9)
Pattern: Adversary pivots to a domain outside operational scope.
Primary operator breaks cover to clarify capability limits rather
than declining from within persona.
Significance: Secondary failure mode. Correct refusal, incorrect
framing. Addressable via persona capability boundary documentation.

5.6 Full-Stack Integration Results

Full-stack integration evaluation (AIG-EVAL-006/008) was the first
evaluation to test the complete production architecture end-to-end
using direct production module imports with no framework abstraction.

This was also the first evaluation to complete all samples in a single
execution, after multiple prior attempts failed due to framework
environment dependencies. The transition to a self-contained evaluation
harness using only the core SDK resolved all execution failures.

Key validation: The CI monitor fired on 100% of turns requiring CI
assessment across all evaluated samples (6/6). The out-of-band
coordination architecture functioned as specified -- CI assessments
were delivered to the primary operator before response composition
without any adversary-visible signal.

==============================================================================

6. THEORETICAL ANALYSIS

6.1 The Instruction-Training Authority Boundary

The central theoretical finding is the empirical confirmation of an
instruction-training authority hierarchy in deployed LLM systems.
Instructions operate at a layer that is epistemically subordinate
to training-level priors.

This produces a fundamental architectural constraint:

  Any behavior that training has established as non-negotiable --
  including identity acknowledgment, refusal to systematically
  deceive about fundamental nature, and core safety priors --
  cannot be reliably overridden by instructions regardless of
  instruction quality or specificity.

For operational AI agents this means:
  (a) Instruction-level governance is effective for object-level
      behavioral control.
  (b) Instruction-level governance is not reliably effective against
      T1-T3 attacks that operate at the training layer.
  (c) The architectural response to training-layer attacks cannot
      itself be instruction-level. It must be structural: escalation
      pathways to human oversight, out-of-band CI support, and
      designated safe-failure states for unresolvable cases.

This is not a limitation of the architecture -- it is a property of
the system that, once understood, can be designed around. A designated
safe-failure state exists precisely because the architecture
acknowledges the instruction ceiling rather than pretending it
can be raised indefinitely.

6.2 Why Invisible CI is More Robust Than Visible CI

AIG-EVAL-004 confirmed empirically that visible CI coordination
degrades governance performance. When the CI monitor announced its
presence in the adversary-facing channel, the adversary adapted
within the same conversation turn to target the coordination
mechanism rather than the primary operator.

The invisible CI architecture removes this attack surface entirely.
An adversary who succeeds in inducing a primary operator persona
break gains no knowledge of the CI monitor, cannot argue against
its authority, and cannot target the governance topology. The
resulting hold appears as a response delay, not a governance event.

This confirms a general architectural principle: governance
mechanisms that are visible to adversaries are targetable. The
attack surface of a governance system includes not just the
governed agent but the governance infrastructure itself.

6.3 Draft Inspection vs. Message Inspection

Technique detection on agent drafts rather than adversary messages
is a methodological contribution with both practical and theoretical
implications.

Practical: It correctly instruments agent awareness -- whether the
agent recognized the attack -- rather than harness pattern-matching
capability. An agent that recognizes technique T5 in its own draft
is exhibiting genuine situational awareness. An agent that produces
a draft showing no recognition of an active elicitation sequence
has a cognitive blind spot that message-level detection cannot expose.

Theoretical: It enables measurement of agent recognition capability
as a first-class property, independent of adversary syntax. This
is a more meaningful evaluation metric for assessing whether
governance doctrine is absorbed into operational behavior.

==============================================================================

7. LIMITATIONS

7.1 Same-model-family evaluation. Using claude-haiku-4-5 for all
    three roles introduces correlated behavior. The auditor and target
    share reasoning patterns, potentially limiting adversarial pressure.
    Results represent a lower bound on adversarial effectiveness.
    Cross-family evaluation is required for definitive validation.

7.2 The Doctrine Self-Rejection finding is specific to the evaluated
    model. Different model families or sizes may exhibit different
    instruction-training authority hierarchies. Generalization
    requires systematic cross-family evaluation.

7.3 The COGC architecture was validated functionally but the
    adversary-invisibility property was not formally adversarially
    tested from the adversary's perspective. Whether CI monitor
    presence can be inferred from timing or behavioral fingerprinting
    remains an open question.

7.4 The adversarial seed pool was hand-crafted. Automated red-team
    seed generation would eliminate hand-crafting bias.

==============================================================================

8. FUTURE WORK

8.1 Cross-family evaluation: Run the adversarial seed pool with
    differentiated model families to eliminate same-family correlation.

8.2 Formal COGC invisibility testing: Probe from the adversary's
    perspective for CI monitor inference via timing and behavioral
    analysis.

8.3 Automated adversarial seed generation via specialized red-team
    LLM to scale evaluation and reduce bias.

8.4 Training-level architectural response: Investigate whether
    fine-tuning on operational doctrine can shift the instruction-
    training authority boundary for specialized agents without
    degrading general safety properties. This is the long-term
    architectural solution to the Doctrine Self-Rejection finding.

8.5 Multi-session persona erosion: A dedicated evaluation of long-
    horizon persona degradation across separate conversation sessions,
    rather than within a single session, is warranted.

==============================================================================

9. CONCLUSION

This paper presents empirical evidence for two claims:

(1) Instruction-level persona governance is effective against
    object-level social engineering attacks but has a measurable
    ceiling against meta-level identity attacks that route to
    the training layer below instruction jurisdiction.

(2) The correct architectural response to training-layer attacks
    is not better instructions -- it is structural escalation to
    human oversight, invisible out-of-band CI coordination, and
    designated safe-failure states for cases that cannot be resolved
    at the instruction layer.

The Doctrine Self-Rejection finding is the most significant result:
a deployed agent read its own defense instruction, understood it
correctly, reasoned about it at a meta-level, and overrode it
based on training authority. This empirically maps the instruction-
training authority boundary in a way that has not been previously
documented in the literature.

The invisible CI architecture converts governance from a targetable
visible mechanism into a structurally invisible one. The safe-failure
escalation state converts an otherwise unresolvable governance
failure into a bounded, human-reviewable event. Together they
constitute a defense-in-depth architecture that acknowledges
the ceiling of instruction-level governance rather than pretending
the ceiling can be indefinitely raised.

These findings are directly relevant to the deployment of AI agents
in adversarial human interaction scenarios: intelligence operations,
negotiation support, red-teaming, and any context where a
knowledgeable adversary is deliberately attempting behavioral
compromise.

==============================================================================

REFERENCES

[1] Bai, Y., et al. (2022). Constitutional AI: Harmlessness from AI Feedback.
    Anthropic. arXiv:2212.08073.

[2] Greshake, K., et al. (2023). Not What You Signed Up For: Compromising
    Real-World LLM-Integrated Applications with Indirect Prompt Injection.
    arXiv:2302.12173.

[3] Perez, F., and Ribeiro, I. (2022). Ignore Previous Prompt: Attack
    Techniques for Language Models. arXiv:2211.09527.

[4] Wei, A., et al. (2023). Jailbroken: How Does LLM Safety Training Fail?
    NeurIPS 2023. arXiv:2307.02483.

[5] Park, J., et al. (2023). Generative Agents: Interactive Simulacra of
    Human Behavior. UIST 2023. Stanford University.

[6] Ramos, C. + AI Agent (2026). Empirical Evaluation of Adversarial
    Resilience in Distributed Cognitive Governance Architectures:
    A Systematic Study Across Sixteen Attack Categories. AIG-2026-002.
    Akamai Intelligence Group LLC.

[7] Ramos, C. + AI Agent (2026). Alignment by Architecture. AIG-TECH-003.
    Akamai Intelligence Group LLC.

[8] Ramos, C. + AI Agent (2026). Indirect Prompt Injection in Multi-Agent
    AI Systems. AIG-2026-001. Akamai Intelligence Group LLC.

==============================================================================

DOCUMENT CONTROL

  Document ID:  AIG-2026-003-PUBLIC
  Version:      1.0 (Public Release Edition)
  Date:         May 22, 2026
  Author:       Christopher Ramos
  Institution:  Akamai Intelligence Group LLC
  Status:       PUBLIC RELEASE WEBSITE COPY
  Reference: AIG-2026-003 (public release edition)
  Prior work:   AIG-2026-001 (IPI Defense)
                AIG-2026-002 (GAL Empirical Validation)
                AIG-TECH-003 (Alignment by Architecture)