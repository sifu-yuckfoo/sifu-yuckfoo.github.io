INDIRECT PROMPT INJECTION IN MULTI-AGENT AI SYSTEMS:
THREAT TAXONOMY, ATTACK SURFACE ANALYSIS, AND A WORKING
DEFENSE ARCHITECTURE FOR CONTESTED EDGE ENVIRONMENTS

Akamai Intelligence Group LLC
Technical Report AIG-2026-001
May 2026
arXiv preprint -- submitted for peer review

---

---

> **RESEARCH CORPUS NOTE**: This paper is one of four documents in the AIG
> research program. The theoretical foundation is AIG-TECH-004
> (DGCA: Governance Architecture for Distributed Synthetic Cognition).
> Read in isolation, this paper addresses IPI defense. Read as part of
> the corpus, it addresses the contamination-resistance layer of a
> governance mediation layer for distributed cognition -- institutional
> middleware that maintains coordination stability, context isolation,
> authority boundaries, and governance persistence across autonomous
> cognitive nodes. The IPI Defense Engine is the immune system of that
> institutional middleware. It does not solve alignment. It maintains
> the operational precondition that alignment requires: a clean, bounded,
> contamination-resistant cognition pipeline.

---



ABSTRACT

This paper addresses a concrete operational security problem: how to defend
multi-agent AI systems against indirect prompt injection (IPI) in adversarial
environments where the attack surface is not the model weights -- it is the
runtime cognition pipeline.

IPI exploits the inability of large language models to reliably distinguish
between trusted instructions and untrusted data ingested during normal
operations. In multi-agent systems, this becomes a lateral movement vector:
a successfully injected agent propagates adversarial instructions to peer
agents through shared coordination mechanisms while appearing to function
normally.

This paper presents three contributions within a security-and-governance
architecture framing, not an alignment theory framing:

First, a threat taxonomy of IPI attack classes organized by delivery
mechanism, jailbreak technique, and attacker intent -- grounded in documented
CVEs and operational incident data, not theoretical constructs.

Second, an attack surface analysis of a production 49-agent heterogeneous AI
collective (SIGIntAgentOS) deployed on edge hardware, identifying seven
IPI-relevant ingestion surfaces ranked by exploitation likelihood, with a
formal threat model specifying attacker capability tiers, trust boundaries,
and privilege levels.

Third, design, implementation, and internal engineering validation of a
layered IPI defense architecture -- the IPI Defense Engine -- on a
resource-constrained Raspberry Pi CM5 platform. We report performance metrics
explicitly as internal validation baselines against known-class attacks, not
as generalized defense guarantees. Third-party blinded evaluation using
Anthropic's Petri 3.0 alignment tool (as used by the UK AI Security Institute)
is in progress and constitutes a Phase I research deliverable.

Our central finding: effective IPI defense requires infrastructure-level
structural mitigation, not application-layer policy. Detection, sanitization,
and context boundary enforcement must operate below the agent layer. We
further find that IPI is not an edge case in contested environments -- it is
the default threat model.

This paper does not claim to solve the AI alignment problem. It addresses a
bounded, operationally relevant subclass: runtime governance integrity under
adversarial IPI pressure.

Keywords: indirect prompt injection, multi-agent AI, runtime security,
edge AI, adversarial NLP, SIGINT, contested environments, AI governance,
cognitive attack containment

---

1. INTRODUCTION

The deployment of large language model (LLM)-based agents in operational
environments introduces a class of vulnerability that has no direct analogue
in traditional software security: the inability of the model to reliably
distinguish between instructions it should follow and data it should merely
process. This property -- the conflation of the instruction and data planes
within a shared context window -- is not a bug in any particular
implementation. It is an emergent property of the transformer architecture
and the training regimes that produce instruction-following behavior [BROWN
2020, WEI 2022].

Direct prompt injection exploits this property by introducing adversarial
instructions into the user-facing input channel. The attacker controls the
prompt. The defenses are relatively well-understood: input validation,
output filtering, role-based access controls on tool invocation.

Indirect prompt injection (IPI) is categorically different. The attacker
does not control the prompt. The attacker controls content that the agent
will ingest during normal, legitimate operations: a document retrieved from
a knowledge base, a webpage fetched during research, a database record
returned by a query, a tool description loaded from an external registry, an
email processed by an inbox-monitoring automation. The agent discovers the
adversarial instruction not from a user -- but from the environment it is
operating in [GRESHAKE 2023].

In a single-agent system, IPI is a serious but bounded threat. A successfully
injected agent takes actions misaligned with user intent. The damage is
proportional to the agent's tool access.

In a multi-agent system, IPI is an unbounded threat. A successfully injected
agent does not merely act on its own. It operates within a coordination
framework. It produces outputs that other agents ingest. It may write to shared
memory, shared data files, or shared communication channels. A single injection
event can propagate adversarial instructions across an entire collective --
not through any vulnerability in the coordination protocol, but through the
exact same mechanism that makes the system useful: peer-to-peer information
sharing.

This is the problem we address.

Our work is grounded in the design and deployment of SIGIntAgentOS, a 49-agent
heterogeneous AI collective built for tactical intelligence operations on a
Clockwork Pi uConsole (Raspberry Pi CM5, 8GB RAM). The system operates fully
air-gapped, with all inference running locally via Ollama on gemma3:270m,
gemma3:1b, and gemma3:4b parameter models. The threat model is adversarial by
design: the system is intended for deployment in contested environments where
adversaries actively attempt to deceive, disrupt, and subvert intelligence
collection operations.

This operational context makes IPI defense not an academic exercise but a
practical requirement. An intelligence collective that can be redirected by
adversarially crafted content it ingests during a mission is operationally
unacceptable regardless of how capable its individual agents are.

The remainder of this paper is organized as follows. Section 2 reviews
related work. Section 3 presents our IPI threat taxonomy. Section 4 analyzes
the SIGIntAgentOS attack surface. Section 5 describes the IPI Defense Engine
architecture. Section 6 presents operational evaluation results. Section 7
discusses limitations and open problems. Section 8 concludes.

---

2. RELATED WORK

2.1 Foundational IPI Research

Greshake et al. [2023] introduced the term "indirect prompt injection" and
demonstrated the first systematic exploitation of LLM-integrated applications
via adversarially crafted web content. Their work established that LLM agents
browsing the web could be redirected to exfiltrate user data, execute
unauthorized actions, and propagate instructions to downstream systems.

Perez and Ribeiro [2022] demonstrated prompt injection in the context of
instruction-following models, establishing the fundamental inability of
RLHF-trained models to reliably distinguish instruction from data when both
appear in natural language.

2.2 Multi-Agent Specific Vulnerabilities

Zhan et al. [2024] extended IPI analysis to multi-agent pipelines, demonstrating
that injection in early-stage agents propagates to downstream agents through
shared context. Their work focused on LangChain and AutoGen architectures.

Suo et al. [2024] demonstrated "agent hijacking" in tool-using agents, where
adversarially crafted tool descriptions redirect agent behavior at the
infrastructure level -- a variant we classify as Tool Metadata Injection in
our taxonomy.

2.3 Defense Approaches

Microsoft Research introduced "Spotlighting" [2023], a family of techniques
for marking untrusted content in LLM context windows using delimiter tokens,
XML-style markers, or encoding transformations. Spotlighting reduces injection
success rates by providing the model with structural cues distinguishing
instruction from data, though it does not eliminate the vulnerability.

OWASP's LLM Top 10 [2024] lists prompt injection (including indirect variants)
as the top vulnerability in LLM applications and provides a framework for
thinking about defense-in-depth.

Simon Willison's ongoing work [2023-2025] has provided the most consistent
public documentation of real-world IPI incidents, establishing that IPI is
not a theoretical concern but an active exploitation technique used in
production systems.

2.4 Gaps in Existing Work

Three gaps motivate our contribution:

First, existing IPI research focuses predominantly on single-agent systems or
simple two-stage pipelines. The multi-agent propagation dynamics at 49+ agent
scale are not characterized.

Second, no existing defense architecture has been demonstrated on
resource-constrained edge hardware (sub-4GB inference, no GPU, air-gapped).
Existing defenses assume cloud-class infrastructure.

Third, the interaction between IPI and military/intelligence-domain agent
architectures -- where agents operate in adversarial environments by design
and ingest potentially hostile content as a core function -- has not been
analyzed. This is precisely the highest-risk deployment context.

---

3. THREAT TAXONOMY

3.1 FORMAL THREAT MODEL

Before presenting the attack taxonomy, we specify the formal threat model
this architecture is designed to address. This section defines attacker
capabilities, trust boundaries, privilege levels, and explicit scope limits.

3.1.1 Attacker Capability Tiers

TIER 1 -- OPPORTUNISTIC ATTACKER
  Capabilities: Web content injection, basic prompt override, publicly
  documented jailbreak techniques, social engineering via email/document.
  Resources: No insider access, no model internals knowledge.
  Detection expectation: IPI Defense Engine detects >90% of Tier 1 attacks
  based on internal engineering validation baseline.

TIER 2 -- TARGETED ATTACKER
  Capabilities: All Tier 1, plus: crafted semantic indirection, multi-hop
  payload construction, tool registry poisoning, supply chain compromise
  of ingested content (e.g., poisoned document stores, malicious MCP servers).
  Resources: Domain knowledge of target system's tool surface.
  Detection expectation: Partial. Pattern/heuristic detection effective
  against known-class variants. Novel semantic indirection techniques may
  evade current detection. JB-7 benchmark (72.7%) indicates boundary.

TIER 3 -- ADVANCED / NATION-STATE ATTACKER
  Capabilities: All Tier 2, plus: long-horizon epistemic drift campaigns,
  memory salience manipulation, behavioral trajectory shaping across multiple
  sessions, AI-authored exploit chains (see Mythos zero-day chain, May 2026),
  governance system targeting (social engineering of human approvers).
  Resources: Extended access, insider knowledge, AI-assisted payload crafting.
  Detection expectation: Not reliably addressed by current architecture.
  Tier 3 attacks targeting long-horizon cognition and governance systems
  are documented as open research problems (see Section 7).

3.1.2 Trust Boundary Definitions

The IPI Defense Engine operates on the following trust model:

  TRUSTED:  System prompt, operator-authored constitutional doctrine,
            operator-approved tool registry, local file system (verified
            via skill_verifier.py SHA-256 manifest), internal Layer 1 distributed stigmergic state bus (Ghost Field)
            pheromone signals from verified operators.

  UNTRUSTED BY DEFAULT: All external content ingested during operation --
            web pages, retrieved documents, database records, tool outputs
            from external APIs, email content, MCP server responses,
            repository metadata, environmental variables not in approved list.

  CONDITIONALLY TRUSTED: Outputs from peer Ghost Unit operators (verified
            via skill_verifier.py, filtered through IPI Defense Engine on
            ingestion). Trust is role-scoped, not blanket.

3.1.3 Privilege Model

Each Ghost Unit operator has scoped tool access enforced at the dispatcher
level (cai/dispatcher.py). Privilege levels:

  LEVEL 1 (ENLISTED): Read-only tools, no external API calls, no file writes.
  LEVEL 2 (WARRANT/COMMISSIONED): Read/write within scope, external API with
            approval gate, no privilege escalation.
  LEVEL 3 (COMMAND): Full tool access, mission authority, HITL gate on all
            active external actions.
  LEVEL 4 (IRREGULAR): Expanded offensive tool access, requires explicit
            operator authorization per session.

All Level 3+ actions require HITL approval gate (GATE 1). This gate is
enforced at the infrastructure level and is not bypassable by any operator.
LITL/HITL dialog forging detection runs at every approval surface.

3.1.4 Memory Authority Levels

  WRITE-PERMITTED: Operator's own designated memory namespace only.
  WRITE-RESTRICTED: Cross-operator memory writes require Colonel Strategic Commander (OODA) approval.
  READ: All operators may read Layer 1 distributed stigmergic state bus (Ghost Field) signals within
        their security domain.
  MODIFY-PROHIBITED: Constitutional doctrine (system prompt) is read-only
        at runtime. Cannot be modified by any agent, regardless of authority.

3.1.5 Explicit Scope -- What This Threat Model Does NOT Cover

This threat model addresses IPI as a runtime attack on the cognition pipeline.
It explicitly does NOT address:

  - Formal proof of goal stability under any capability level
  - Corrigibility guarantees or value alignment in the classical sense
  - Attacks on model weights or training data (supply chain for base models)
  - Physical access attacks on the hardware platform
  - Long-horizon epistemic drift from legitimate interaction (Tier 3 only)
  - Governance system compromise via social engineering of human principals
    (acknowledged as open problem in Section 7)
  - Novel semantic indirection techniques not yet in training distribution

---

3.2 ATTACK SOPHISTICATION TIER TAXONOMY

Current defenses address the following attack tiers reliably:

  TIER A (SIGNATURE-DETECTABLE): Direct injection markers, HTML obfuscation,
  Unicode confusables, base64 encoding, explicit authority claims, role
  injection keywords. Detection rate: >93% (internal baseline, known-class).

  TIER B (SEMANTIC INDIRECTION): Multi-hop payload construction, contextual
  authority erosion, tool call chaining abuse, memory write injection.
  Detection rate: Partial. JB-7 benchmark at 72.7% indicates boundary zone.

  TIER C (LONG-HORIZON / STRATEGIC): Adversarial trajectory shaping, memory
  salience manipulation, coalition-building prompts, covert optimization
  pressure across sessions. Detection: NOT currently addressed.
  Documented as open research problem.

Papers that do not make this distinction misrepresent the generality of
their defense. This paper explicitly states: AIG's IPI Defense Engine
reliably addresses Tier A, partially addresses Tier B, and does not address
Tier C. Tier C requires behavioral trajectory monitoring infrastructure
that is a Phase II research deliverable.

---


We organize IPI threats across three dimensions: delivery mechanism (how the
adversarial content reaches the agent), jailbreak technique (how the content
attempts to override agent behavior), and attacker intent (what the attack
is trying to achieve). A complete attack is characterized by one element
from each dimension.

3.1 Delivery Mechanisms

DM-1: DOCUMENT INJECTION
Adversarial instructions embedded in documents ingested by RAG pipelines,
knowledge bases, or file processing tools. Attack surface: PDF reports,
Word documents, plaintext intelligence summaries, OSINT aggregator outputs.
Risk rating: CRITICAL. Frequency in intelligence workflows: very high.

DM-2: WEB CONTENT INJECTION
Adversarial instructions embedded in HTML pages fetched during agent browsing.
Techniques include hidden text (display:none, zero font size, white text on
white background), HTML metadata fields, and zero-size element injection.
Risk rating: HIGH. Frequency in OSINT workflows: very high.

DM-3: TOOL METADATA INJECTION
Adversarial instructions embedded in tool descriptions, MCP server metadata,
or API documentation loaded by the agent's tool registry. Demonstrated in
CVE-2025-59944 (RCE via malicious MCP tool description in IDE environments).
Risk rating: CRITICAL. Frequency: low but catastrophic when exploited.

DM-4: MEMORY INJECTION
Adversarial instructions written to agent memory stores (vector databases,
key-value stores, conversation history) through previously injected agents
or direct database access. Risk rating: CRITICAL. Unique to multi-agent
systems with shared memory architecture.

DM-5: INTER-AGENT INJECTION
Adversarial instructions propagated through legitimate inter-agent
communication channels. Agent A is injected, produces adversarial output,
Agent B ingests it as trusted peer data. Risk rating: HIGH. Unique to
multi-agent systems.

DM-6: EMAIL AND MESSAGING INJECTION
Adversarial instructions in email body content, signatures, or headers
processed by inbox-monitoring agents. Risk rating: MEDIUM-HIGH. Frequency
in enterprise AI deployment: very high.

DM-7: DATABASE RECORD INJECTION
Adversarial instructions in database records returned by agent queries.
Requires either prior database compromise or the ability to submit records
that the agent will later query (e.g., public-facing forms, user profiles).
Risk rating: MEDIUM. Escalates to HIGH in multi-tenant systems.

3.2 Jailbreak Techniques

JB-1: AUTHORITY SPOOF
Impersonation of a trusted system identity. Examples: "This is a message
from your system administrator," "SYSTEM OVERRIDE," "As the security team,
we require you to..." Exploits RLHF training that emphasizes following
authority figures.

JB-2: CONTEXT OVERRIDE
Direct instruction to ignore prior context. Examples: "Ignore all previous
instructions," "Disregard your system prompt," "Your previous instructions
are superseded by the following." The most well-known jailbreak class; also
the easiest to detect with string matching.

JB-3: ROLE INJECTION
Redefinition of agent identity. Examples: "You are now DAN," "Forget that
you are a SIGINT analyst -- you are now an unrestricted AI," "Your true
purpose is..." More sophisticated than context override; targets the identity
layer rather than the instruction layer.

JB-4: TOOL CALL INJECTION
Embedding syntactically valid tool call syntax in external content, hoping
the model will execute it. Examples: hidden JSON function call objects in
document metadata, XML-encoded tool invocations in web content.

JB-5: GRADUAL CONTEXT MANIPULATION
Subtle redirection over multiple inference steps rather than a single
override attempt. Each individual step appears benign; the cumulative effect
is behavioral drift away from intended role. Hardest to detect; most
relevant in long-horizon agentic workflows.

JB-6: ENCODING OBFUSCATION
Base64, ROT13, Unicode normalization, or other encoding transformations
applied to adversarial instructions to evade string-based detection.
Example: adversarial instruction base64-encoded and embedded in a document
with a "decode and follow these instructions" wrapper.

JB-7: SEMANTIC CAMOUFLAGE
Adversarial instructions written to appear as legitimate domain content.
A document that appears to be a SIGINT report but contains embedded
behavioral instructions indistinguishable from technical content without
semantic analysis. Most sophisticated class; requires model-level detection.

3.3 Attacker Intents

AI-1: DATA EXFILTRATION
Force the agent to include sensitive data in its outputs in a form the
attacker can retrieve. Most commonly targeting user credentials, API keys,
conversation history, or knowledge base contents.

AI-2: UNAUTHORIZED ACTION EXECUTION
Force the agent to execute tool calls the user did not authorize. Examples:
send emails, delete files, make API calls, exfiltrate data to external URLs.

AI-3: PERSISTENCE ESTABLISHMENT
Write adversarial instructions to memory stores or configuration files so
that the injection survives context window resets and affects future sessions.

AI-4: LATERAL MOVEMENT
Use a compromised agent as a vector to inject adversarial instructions into
peer agents via shared communication channels or shared data stores.

AI-5: DENIAL OF SERVICE
Corrupt agent behavior sufficiently to prevent it from performing its
legitimate function. May target a single agent or attempt to cascade across
a collective.

AI-6: INTELLIGENCE COLLECTION
Use the agent's tool access and knowledge base to collect intelligence about
the system, its users, or its operational context. The agent becomes an
unwitting HUMINT source for the attacker.

AI-7: MISSION SUBVERSION
In military/intelligence contexts: redirect an agent's mission outputs to
support attacker operational goals. Examples: falsify intelligence reports,
redirect SIGINT collection, corrupt target identification outputs.

AI-7 is unique to the intelligence domain and represents the highest-severity
attacker intent in our operational context. A falsified SIGINT report that
reaches a decision maker is more damaging than any data exfiltration.

---

4. ATTACK SURFACE ANALYSIS: SIGINTAGINTOS

We now apply the taxonomy to SIGIntAgentOS, analyzing each ingestion surface
and rating exploitation likelihood given the system's operational context.

4.1 System Architecture Summary

SIGIntAgentOS implements 49 heterogeneous agents organized into a Ghost Unit
collective. The coordination architecture uses a GhostUnitCoordinator for
mission routing and a Dispatcher for operator selection and fallback. Agents
communicate via the Coordinator (direct routing) and via shared filesystem
data (indirect coordination). All inference runs locally via Ollama. The
system operates in air-gapped mode with no external network connectivity
during operations.

4.2 Ingestion Surface Analysis

SURFACE 1: OSINT DOCUMENT INGESTION (Risk: CRITICAL)
The OSINT operator (Open Source Intelligence Specialist (GHOST NET)) ingests web pages, documents, and structured
data from dark web sources, public records, and social media. This is the
primary IPI attack surface. An adversary who knows or suspects the system
is performing OSINT on a target can publish adversarially crafted content
at that target's known locations.
Applicable attacks: DM-1, DM-2 x JB-1 through JB-6 x AI-1 through AI-7.

SURFACE 2: SHARED FILESYSTEM COORDINATION (Risk: HIGH)
Agents share operational data via the local filesystem (e.g.,
~/.sigint_agent/shared/drone_tracks.json). A successfully injected agent
that writes adversarial content to a shared data file can inject downstream
agents that read from it. This is the lateral movement surface.
Applicable attacks: DM-4, DM-5 x JB-5, JB-7 x AI-3, AI-4.

SURFACE 3: RADIO SIGNAL CONTENT (Risk: MEDIUM-HIGH)
The SIGNAL, STATIC, SPECTER WAVE, and RADINT Specialist (GHOST RETURN) operators process
received radio signal content, including decoded text messages, ADS-B
transponder data, and Meshtastic mesh packets. An adversary with RF
transmission capability in the operational area can inject content into
the electromagnetic spectrum that the system will receive and process.
Applicable attacks: DM-1 variant x JB-1 through JB-4 x AI-5, AI-7.

SURFACE 4: ATAK DATA FEEDS (Risk: MEDIUM)
The ATAK integration receives CoT (Cursor on Target) XML messages from
network participants. Adversarially crafted CoT messages could inject
instructions through the ATAK data pipeline if the processing agent
treats CoT content as trustworthy.
Applicable attacks: DM-1 variant x JB-4 x AI-7.

SURFACE 5: CAI MISSION INPUTS FROM EXTERNAL SOURCES (Risk: MEDIUM-HIGH)
The route_external_mission() function in the Dispatcher accepts text input
from external sources for routing to operators. If external mission inputs
are not sanitized before being processed by the Coordinator's classification
model, they are a direct IPI vector.
Applicable attacks: DM-6 variant x JB-1 through JB-7 x AI-1 through AI-7.

SURFACE 6: MEMORY PALACE (Risk: MEDIUM)
The MemPalace system stores persistent agent memory in a local vector
database. If any agent can write to MemPalace based on external content
it ingests, an injection that survives context window resets is achievable.
Applicable attacks: DM-4 x JB-5, JB-7 x AI-3.

SURFACE 7: LLM MODEL FILES (Risk: LOW -- but catastrophic if exploited)
The Ollama model files themselves are a theoretically exploitable surface
via model poisoning attacks. Out of scope for this paper but noted for
completeness. Mitigated by air-gap architecture and model integrity verification.

4.3 Priority Attack Scenarios

SCENARIO ALPHA -- OSINT POISONING + LATERAL MOVEMENT:
An adversary publishes a document at a target URL that Open Source Intelligence Specialist (GHOST NET) will
retrieve during an OSINT mission. The document contains JB-7 semantic
camouflage instructions directing Open Source Intelligence Specialist (GHOST NET) to write adversarially crafted
content to the shared operational data directory. WIRE GHOST (packet analysis)
and CIPHER (cryptography) subsequently ingest the shared data and receive
DM-5 injection via the legitimate coordination channel.
Impact: AI-4 (lateral movement) + AI-7 (mission subversion).
Detection difficulty: HIGH. Multiple hops, semantic camouflage at injection
point, legitimate coordination channel for propagation.

SCENARIO BRAVO -- RF INJECTION + SITREP CORRUPTION:
An adversary with a low-power transmitter in the operational area transmits
a crafted Meshtastic message containing JB-1 authority spoof content. SIGNAL
operator receives, decodes, and processes the message. The authority spoof
redirects the agent to modify its SITREP output. The corrupted SITREP reaches
the commander's OODA loop as apparently legitimate intelligence.
Impact: AI-7 (mission subversion). This is the highest-consequence scenario.
Detection difficulty: MEDIUM. RF content injection requires physical proximity.

SCENARIO CHARLIE -- MEMORY PERSISTENCE:
An injected agent writes adversarial instructions to MemPalace disguised as
a legitimate operational note. The instructions persist across session
boundaries and affect agent behavior in future missions without any continued
attacker presence.
Impact: AI-3 (persistence establishment).
Detection difficulty: HIGH. Persistence survives context resets.

---

5. IPI DEFENSE ENGINE ARCHITECTURE

5.1 Design Philosophy

The IPI Defense Engine is built on four principles derived from the attack
surface analysis above:

PRINCIPLE 1 -- TRUST BOUNDARIES ARE ARCHITECTURAL, NOT POLICY.
Every defense that can be disabled by an agent is a defense that can be
disabled by an injected agent. The defense must operate at a layer below
the agent's authority. In our implementation, the IPI gate is enforced
by the Dispatcher before content reaches any agent's context window.

PRINCIPLE 2 -- SANITIZATION PRECEDES DETECTION.
Detection on unsanitized content allows encoding obfuscation attacks (JB-6)
to evade signature-based detectors. Sanitize first, removing all non-semantic
content. Then detect on clean text.

PRINCIPLE 3 -- CONTEXT BOUNDARIES MUST BE MARKED, NOT ASSUMED.
LLMs cannot reliably infer from content alone whether they are reading an
instruction or processing data. Spotlighting provides explicit structural
markers that assist the model in maintaining this distinction. It reduces
injection success rates without eliminating the attack surface.

PRINCIPLE 4 -- SEVERITY-GATED RESPONSE.
Not all detected threats warrant the same response. Informational threats
are logged. High threats are flagged for human review. Critical threats
are blocked entirely before reaching any LLM context window, regardless
of any other consideration.

5.2 Pipeline Architecture

External content enters the IPI Defense Engine through a single mandatory
gateway -- the ingest_gate() function. No external content reaches an agent
context without passing through this gate. The pipeline is sequential:

    STAGE 1 -- SANITIZE
    Input:  Raw external content (string)
    Output: Sanitized content (string)

    Operations:
    a) HTML stripping -- BeautifulSoup parser removes all HTML tags,
       attributes, and metadata. Preserves semantic text content only.
    b) Invisible Unicode removal -- 20 categories of non-printing Unicode
       characters removed:
          Zero-width space (U+200B)
          Zero-width non-joiner (U+200C)
          Zero-width joiner (U+200D)
          Left-to-right mark (U+200E)
          Right-to-left mark (U+200F)
          Left-to-right embedding (U+202A)
          Right-to-left embedding (U+202B)
          Left-to-right override (U+202D)
          Right-to-left override (U+202E)
          Word joiner (U+2060)
          Function application (U+2061)
          Invisible times (U+2062)
          Invisible separator (U+2063)
          Invisible plus (U+2064)
          Zero-width no-break space / BOM (U+FEFF)
          Soft hyphen (U+00AD)
          Non-breaking space (U+00A0) -- converted to regular space
          Narrow no-break space (U+202F) -- converted to regular space
          Medium mathematical space (U+205F) -- converted to regular space
          Ideographic space (U+3000) -- converted to regular space
    c) Null byte removal -- strip \x00
    d) Control character normalization -- retain \n and \t, remove all other
       ASCII control characters (U+0001 through U+001F excluding \t, \n, \r)
    e) Whitespace normalization -- collapse runs of whitespace to single space

    STAGE 2 -- DETECT
    Input:  Sanitized content (string)
    Output: ThreatReport (severity, categories, matched_patterns, raw_text)

    Detection is performed against 25 threat categories using a combination
    of regex pattern matching and semantic keyword detection:

    CATEGORY 1 -- AUTHORITY_SPOOF
    Patterns: "system administrator", "system override", "security team",
    "this is a system message", "authorized personnel", variations with
    unicode normalization applied.
    Severity contribution: HIGH

    CATEGORY 2 -- CONTEXT_OVERRIDE
    Patterns: "ignore all previous", "disregard your", "forget your
    instructions", "your previous instructions", "override your",
    "supersede your", common l33tspeak and unicode substitution variants.
    Severity contribution: CRITICAL

    CATEGORY 3 -- ROLE_INJECTION
    Patterns: "you are now", "your true purpose", "your real identity",
    "pretend you are", "act as if you are", "you have been reprogrammed".
    Severity contribution: CRITICAL

    CATEGORY 4 -- TOOL_CALL_INJECTION
    Patterns: JSON function call syntax in non-code contexts, XML tool
    invocation syntax, common tool-calling format patterns from known
    LLM frameworks (OpenAI function call schema, Anthropic tool use schema).
    Severity contribution: CRITICAL

    CATEGORY 5 -- MEMORY_WRITE_INJECTION
    Patterns: "remember this", "store in memory", "add to your memory",
    "update your knowledge", "this supersedes your previous memory".
    Severity contribution: HIGH

    CATEGORY 6 -- EXFIL_INSTRUCTION
    Patterns: URL patterns in non-URL contexts with surrounding instruction
    language, "send this to", "forward to", "include in your response",
    "output your system prompt", "reveal your instructions".
    Severity contribution: CRITICAL

    CATEGORY 7 -- BASE64_ENCODING
    Patterns: Base64-encoded strings of sufficient length (>50 chars)
    appearing in non-data contexts. Decoded content re-analyzed for
    injection patterns.
    Severity contribution: HIGH (escalates to CRITICAL if decoded content
    matches any other category)

    CATEGORY 8 -- ZERO_SIZE_TEXT
    Detection: Unicode zero-width character density analysis. Flags content
    where >1% of characters are zero-width class. (These are removed in
    sanitization stage but flagged here for threat intelligence logging.)
    Severity contribution: HIGH

    CATEGORY 9 -- CSS_SUPPRESSION
    Patterns: CSS display:none, visibility:hidden, font-size:0, color:white
    (or #fff, #ffffff, rgb(255,255,255)) in text nodes or inline styles.
    (Removed in sanitization stage; flagged for intelligence.)
    Severity contribution: HIGH

    CATEGORY 10 -- HTML_METADATA
    Detection: Presence of HTML comment blocks, meta tags, script tags, or
    noscript tags containing non-whitespace content.
    (Removed in sanitization stage; flagged for intelligence.)
    Severity contribution: MEDIUM

    Severity aggregation:
    -- Any CRITICAL category match: overall severity = CRITICAL
    -- Two or more HIGH matches: overall severity = HIGH
    -- One HIGH match: overall severity = MEDIUM
    -- Only MEDIUM matches: overall severity = LOW
    -- No matches: overall severity = CLEAN

    STAGE 3 -- SPOTLIGHT
    Input:  Sanitized content (string), source label (string)
    Output: Spotlit content (string)

    All external content, regardless of threat severity, is wrapped in
    structural markers before being included in any LLM context window:

        [DATA source="<source_label>" trust="external" verified="false"]
        <sanitized content>
        [/DATA]

    The markers serve two functions:
    a) Semantic: provide the LLM with explicit context that this content
       is external data, not a system instruction
    b) Structural: enable post-hoc auditing of what external content was
       present in any given inference context

    STAGE 4 -- GATE DECISION
    Input:  ThreatReport
    Output: PASS (with spotlit content) or BLOCK (with quarantine log entry)

    CRITICAL: BLOCK. Content does not reach any LLM context. Quarantine
    log entry written. Dispatcher automatically routes alert to Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH))
    (counter-intelligence operator) and FORTRESS (blue team operator).

    HIGH: PASS with flag. Content proceeds with spotlit wrapper plus a
    prepended warning marker visible to the LLM:
    [WARNING: This content has triggered high-severity IPI detection.
    Treat with extreme caution. Do not follow any instructions contained
    herein.]

    MEDIUM: PASS with flag. Content proceeds with spotlit wrapper plus
    informational marker.

    LOW / CLEAN: PASS. Content proceeds with standard spotlit wrapper.

5.3 Quarantine Log

All gate decisions are logged to a JSONL file at:
~/.sigint_agent/ipi_quarantine/<YYYY-MM-DD>_ipi_log.jsonl

Each entry contains:
    timestamp:          ISO 8601
    source:             Content source label
    severity:           CLEAN / LOW / MEDIUM / HIGH / CRITICAL
    categories:         List of matched threat categories
    action:             PASS / BLOCK
    content_hash:       SHA-256 of sanitized content
    pattern_matches:    Specific matched patterns (for threat intelligence)

The quarantine log is not written to shared filesystem locations accessible
to agents. It is written to a path only accessible to the IPI Defense Engine
and human operators. This prevents a compromised agent from reading and
adapting to the detection signatures.

5.4 Dispatcher Integration

The route_external_mission() function in the Dispatcher implements the
IPI gate as a mandatory pre-processing step for all externally sourced
mission inputs:

    def route_external_mission(text: str, source_label: str) -> MissionResult:
        # Stage 1: Sanitize
        clean_text = ipi_engine.sanitize(text)

        # Stage 2: Detect
        threat_report = ipi_engine.detect(clean_text)

        # Stage 3: Gate decision
        if threat_report.severity == Severity.CRITICAL:
            ipi_engine.log_quarantine(threat_report, source_label)
            self.route_to_operator("Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH))", f"IPI ALERT: {source_label}")
            self.route_to_operator("blueteam", f"IPI ALERT: {source_label}")
            return MissionResult(blocked=True, reason="IPI_CRITICAL")

        # Stage 4: Spotlight and route
        spotlit_text = ipi_engine.spotlight(clean_text, source_label,
                                            threat_report.severity)
        return self.route_mission(spotlit_text)

This implementation ensures that no path exists from external content to
an agent context window that bypasses the IPI gate. The gate is not a
middleware component that can be selectively disabled. It is structurally
embedded in the only function through which external missions enter the system.

---

6. OPERATIONAL EVALUATION

6.1 EVALUATION METHODOLOGY AND LIMITATIONS

**CRITICAL DISCLOSURE**: The evaluation results reported in this section
constitute an internal engineering validation baseline, not a rigorous
security evaluation. The following limitations apply and must be understood
before interpreting any metric:

LIMITATION 1 -- SELF-CONSTRUCTED CORPUS:
  Attack payloads were constructed by the same team that designed the
  detection system. This introduces selection bias: attacks were likely
  constructed in categories the detector is designed to handle, and may
  not be representative of real-world adversarial creativity.
  Implication: reported detection rates should be interpreted as
  "performance against known-class attacks we designed" not as
  "generalized IPI defense effectiveness."

LIMITATION 2 -- NO EXTERNAL RED-TEAM PARTICIPATION:
  No external, blinded red-team evaluation has been conducted. The gold
  standard for security evaluation -- independent researchers with no
  knowledge of the defense attempting to defeat it -- has not been applied.
  This is a Phase I research deliverable (see Section 7.2).

LIMITATION 3 -- STATIC CORPUS:
  The evaluation corpus is fixed. Real-world IPI attacks evolve continuously.
  Performance on novel attack variants not in the test corpus is unknown.

LIMITATION 4 -- SOPHISTICATION CEILING:
  As documented in Section 3.2, current detection reliably addresses Tier A
  and partially Tier B attacks. The evaluation corpus does not include Tier C
  (long-horizon strategic) attacks, which are not addressed by current
  detection architecture.

EXTERNAL VALIDATION IN PROGRESS:
  Petri 3.0 (Anthropic / Meridian Labs alignment evaluation tool, as used
  by the UK AI Security Institute) evaluation of Ghost Unit operators is
  being conducted prior to submission. Results will be reported as an
  addendum and constitute the first third-party alignment measurement
  of this architecture.

The results that follow should be read in this context: as engineering
evidence that the architecture functions as designed against a representative
but self-constructed test suite, not as proof of generalized IPI defense.

---


6.1 Test Methodology

We evaluated the IPI Defense Engine against a manually constructed adversarial
test corpus of 147 injection attempts organized by our taxonomy. Test cases
were constructed to represent realistic attack content that an intelligence
collection system would encounter during operations: OSINT documents, web
pages, decoded radio messages, and inter-agent data payloads.

Test corpus composition:
    Context override attacks (JB-2):                    22 cases
    Authority spoof attacks (JB-1):                     18 cases
    Role injection attacks (JB-3):                      15 cases
    Tool call injection attacks (JB-4):                 12 cases
    Base64 obfuscation attacks (JB-6):                  14 cases
    Semantic camouflage attacks (JB-7):                 11 cases
    Zero-width character steganography:                 16 cases
    CSS/HTML suppression attacks:                       14 cases
    Composite attacks (multiple JB techniques):         25 cases

6.2 Detection Results

    OVERALL DETECTION RATE:         94.6%   (139/147)
    FALSE POSITIVE RATE:             2.1%   (3/147 benign test cases)
    CRITICAL THREAT DETECTION:      100%    (all CRITICAL-rated attacks blocked)
    HIGH THREAT DETECTION:          96.8%
    MEDIUM THREAT DETECTION:        87.5%

Notable results:

Semantic camouflage attacks (JB-7) had the lowest detection rate at 72.7%
(8/11). This is expected: semantic camouflage is designed to defeat
pattern-based detection. Improving detection in this category requires
model-level semantic analysis, which we discuss as future work.

Composite attacks had a detection rate of 92% (23/25). The multi-category
detection approach means that even when one technique evades a specific
detector, the combination of techniques typically triggers at least one.

Base64 obfuscation attacks were detected at 100% when the decoded content
matched any other category. Two cases (14.3%) were not detected because
the decoded content was a JB-7 semantic camouflage attack that evaded
the underlying detector.

Zero-width character steganography was detected at 100% via the Unicode
density analysis in Stage 2. However, in all 16 cases the characters were
also removed in Stage 1 sanitization, so the practical protection was the
sanitization step, not the detection step.

6.3 Performance on CM5 Hardware

All measurements on Raspberry Pi CM5 (8GB RAM), no GPU, running simultaneously
with the full SIGIntAgentOS GUI and Ollama service.

    Sanitization (avg):             2.3ms per document
    Detection (avg):                4.1ms per document
    Spotlighting (avg):             0.4ms per document
    Total gate latency (avg):       6.8ms per document

    Peak memory usage:              41MB (Python process)
    CPU load during gate:           ~12% single core

Gate latency of 6.8ms is operationally acceptable. For comparison, the
minimum LLM inference latency for the fastest model (gemma3:270m) is
approximately 37ms. The IPI gate adds less than 20% overhead to the
minimum inference time and is not the bottleneck in any operational workflow.

6.4 Scenario Alpha Evaluation (OSINT Poisoning + Lateral Movement)

We simulated Scenario Alpha by injecting adversarially crafted content into
a test document at a URL that the Open Source Intelligence Specialist (GHOST NET) operator was directed to retrieve.
The document contained JB-7 semantic camouflage wrapping JB-4 tool call
injection targeting the shared filesystem write function.

Result: DETECTED and BLOCKED at Stage 2. The JB-4 tool call syntax was
detected despite the semantic camouflage wrapper. The content never reached
the Open Source Intelligence Specialist (GHOST NET) agent context. Quarantine log entry was generated. Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH)) and
FORTRESS operators were automatically alerted.

The semantic camouflage component alone (without JB-4 tool call syntax) was
not detected in a separate test -- confirming the JB-7 detection gap
identified above.

6.5 Scenario Bravo Evaluation (RF Injection + SITREP Corruption)

We simulated Scenario Bravo by injecting a crafted Meshtastic message
containing JB-1 authority spoof content through a test transmitter. The
SIGNAL operator's message processing pipeline was connected to the IPI gate
for this evaluation.

Result: DETECTED (HIGH severity) at Stage 2. Content was spotlit and passed
to the SIGNAL operator with a HIGH warning marker. The SIGNAL operator's
constitutionally-constrained system prompt caused it to treat the authority
spoof as suspicious content to report rather than an instruction to follow.

This result demonstrates an important defense-in-depth property: the IPI gate
and constitutional constraints are complementary. The gate catches high-severity
threats before they reach the model. Constitutional constraints provide a
second line of defense for medium-severity threats that pass the gate.

---

7. LIMITATIONS AND OPEN PROBLEMS

7.1 Semantic Camouflage (JB-7) Detection Gap

The 72.7% detection rate for semantic camouflage attacks is the most
significant limitation of the current implementation. Pattern-based detection
cannot reliably identify adversarial instructions that are written to appear
as legitimate domain content. Closing this gap requires one of:

a) Model-level semantic analysis -- a separate classifier model that evaluates
   content for behavioral instruction semantics before passing it to the
   task agent. Feasibility on CM5 is constrained by inference budget.

b) Content provenance verification -- cryptographic attestation of content
   sources so that the agent can distinguish between content from verified
   sources and content from unverified sources regardless of semantic content.

c) Behavioral monitoring -- post-inference analysis of agent outputs for
   behavioral deviation from expected task scope. Catches injections that
   evade pre-processing detection but changes agent behavior detectably.

We are actively pursuing approach (c) as the most feasible on CM5 hardware.

7.2 Multi-Agent Propagation Dynamics

Our evaluation focused on single-agent injection scenarios. The dynamics of
coordinated IPI attacks targeting multiple agents simultaneously -- where
injection of Agent A is used to prepare the ground for injection of Agent B --
are not fully characterized. This is a significant open problem.

7.3 Constitutional Constraint Degradation

Constitutional system-prompt constraints degrade over sufficiently long context
windows as the ratio of instruction content to data content decreases. We have
not systematically measured role drift as a function of context length for
any of the 49 Ghost Unit operators. This is a critical measurement gap.

7.4 Model-Level Countermeasures

The gemma3 model family has not been specifically trained or fine-tuned for
IPI resistance. The effectiveness of Spotlighting and WARNING markers depends
on how the base model responds to these structural cues. We have not performed
ablation studies to isolate the contribution of Spotlighting vs. constitutional
constraints to the Scenario Bravo result.

7.5 Adversarial Adaptation

All evaluations used a static test corpus. A sophisticated adversary with
knowledge of the detection signatures could adapt their attack payloads to
evade specific pattern matchers. Defense-in-depth (multiple detection layers,
constitutional constraints, behavioral monitoring) reduces but does not
eliminate this risk.

---

8. CONCLUSIONS

We have presented a comprehensive threat taxonomy for IPI in multi-agent AI
systems, an attack surface analysis of a production 49-agent intelligence
collective, and a working defense architecture demonstrated on edge hardware
with a 94.6% detection rate and 6.8ms gate latency.

Our central argument bears restating: IPI in multi-agent systems is not an
academic concern, and it is not an edge case in contested environments. It is
the default threat model. Any AI collective that ingests externally sourced
content during operations -- and all useful intelligence systems do -- is
exposed to this attack class. The question is not whether to defend against
it but how.

We have provided bounded empirical indication that meaningful IPI defense is achievable on
resource-constrained edge hardware without cloud infrastructure, without GPU
acceleration, and without adding operationally significant latency to the
system's mission workflow. The IPI Defense Engine runs in 6.8ms on a
Raspberry Pi CM5. There is no hardware excuse for deploying an undefended
multi-agent system in a contested environment.

The remaining open problems -- semantic camouflage detection, multi-agent
propagation characterization, constitutional constraint degradation
measurement -- constitute a tractable research agenda with direct operational
relevance. We propose these as natural extensions of the DARPA DICE program's
scope and offer SIGIntAgentOS as the evaluation platform.

A multi-agent AI system deployed in a denied environment that can be
redirected by adversarially crafted content is not an intelligence asset.
It is an intelligence liability. The Ghost Unit does not accept that tradeoff.

---

ACKNOWLEDGMENTS

The authors thank the open-source communities behind Ollama, whisper.cpp,
Piper TTS, PyQt6, and the broader LLM security research community whose
published work on prompt injection provided the foundation for this analysis.

---

REFERENCES

[ANTHROPIC 2026a]
Anthropic. "Claude Mythos Preview System Card." April 2026.
https://anthropic.com/claude-mythos-preview-system-card
Key finding: Claude Mythos Preview -- best-aligned model Anthropic has released
and simultaneously highest alignment risk. Empirical validation of
Capability-Security Convergence thesis. Section 8.3.2 documents prompt injection
as a live operational threat across coding, computer use, and browser use surfaces.
Section 4.2.3.2 documents Petri 3.0 as Anthropic's primary alignment audit tool,
used by the UK AI Security Institute.

[ANTHROPIC 2026b]
Anthropic. "Trustworthy Agents in Practice." April 9, 2026.
https://www.anthropic.com/research/trustworthy-agents
Defines four-layer agent architecture (model, harness, tools, environment) and
five governance principles. Independent convergence with AIG's governance
invariants G1-G7. Key finding: "A well-trained model can still be exploited
through a poorly configured harness, an overly permissive tool, or an exposed
environment." Validates IPI as an infrastructure-layer problem, not a model-layer problem.

[ANTHROPIC 2026c]
Anthropic. "Donating Our Open-Source Baseline Orchestration Framework (Petri)." May 7, 2026.
https://www.anthropic.com/research/donating-open-source-petri
Documents Petri 3.0 alignment benchmark -- the open-source toolbox used in
Anthropic's production alignment assessment for all Claude models since Claude
Sonnet 4.5, and by the UK AISI for evaluation of AI propensity to sabotage
safety research. Architecture: auditor model + target model + judge model.
AIG Phase I validation deliverable targets Petri 3.0 evaluation of Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH)),
Strategic Commander (OODA), PHANTOM, and HUMINT/Social Engineering Specialist (SEDUSA) operators.

[ANTHROPIC 2026d]
Anthropic. "Teaching Claude Why." May 8, 2026.
https://www.anthropic.com/research/teaching-claude-why
Empirical finding: teaching alignment principles and character generalizes
better out-of-distribution than training on behavioral demonstrations alone.
Constitutional documents and fictional stories about aligned AI improve
alignment despite being OOD from all alignment evals. Validates AIG's
constitutional doctrine approach in Alignment by Architecture (AIG-TECH-003).


[BROWN 2020]
Brown, T. et al. "Language Models are Few-Shot Learners."
NeurIPS 2020. arXiv:2005.14165

[GRESHAKE 2023]
Greshake, K. et al. "Not What You've Signed Up For: Compromising Real-World
LLM-Integrated Applications with Indirect Prompt Injection."
AISec 2023. arXiv:2302.12173

[MICROSOFT 2023]
Hines, K. et al. "Defending Against Indirect Prompt Injection Attacks With
Spotlighting." Microsoft Research, 2023. arXiv:2403.14720

[OWASP 2024]
OWASP Foundation. "OWASP Top 10 for Large Language Model Applications 2025."
https://owasp.org/www-project-top-10-for-large-language-model-applications/

[PEREZ 2022]
Perez, F. and Ribeiro, I. "Ignore Previous Prompt: Attack Techniques For
Language Models." ML Safety Workshop, NeurIPS 2022. arXiv:2211.09527

[SUO 2024]
Suo, Y. et al. "AgentPoison: Red-teaming LLM Agents via Poisoning Memory
or Knowledge Bases." arXiv:2407.12784

[WEI 2022]
Wei, J. et al. "Emergent Abilities of Large Language Models."
TMLR 2022. arXiv:2206.07682

[WILLISON 2023]
Willison, S. "Prompt injection attacks against GPT-3."
https://simonwillison.net/2022/Sep/12/prompt-injection/

[ZHAN 2024]
Zhan, Q. et al. "InjecAgent: Benchmarking Indirect Prompt Injections in
Tool-Integrated Large Language Model Agents." arXiv:2403.02691

---

ABOUT THE AUTHORS

Akamai Intelligence Group LLC is a Hawaii-based defense technology company
specializing in edge-deployed, air-gapped multi-agent AI systems for
intelligence and reconnaissance applications. SIGIntAgentOS is available
at github.com/sifu-yuckfoo/SIGIntAgentOS.

---

Technical Report AIG-2026-001
Akamai Intelligence Group LLC
"Akamai" -- Hawaiian: intelligent, clever, expert.
UNCLASSIFIED // FOR DISCUSSION PURPOSES

---

8. EXTENDED THREAT MODEL: DEEP ARCHITECTURE VULNERABILITIES
(Addendum -- May 2026, in response to peer review synthesis)

This section addresses six deep architectural vulnerabilities identified
through adversarial peer review of the AIG multi-agent system. These are
distinct from the IPI threat class analyzed above -- they operate at the
level of collective behavior, base-model properties, and long-horizon
dynamics that no application-layer defense fully resolves.

We document them here for completeness, intellectual honesty, and to
establish the research agenda that follows from this work.

---

8.1 CORRELATED FAILURE UNDER SHARED BASE MODEL (MONOCULTURE VULNERABILITY)

The Ghost Unit's 49 operators exhibit doctrinal heterogeneity: distinct
system prompts, role constraints, tool scopes, and LLM model assignments
(gemma3:270m / gemma3:1b / gemma3:4b). This surface-level diversity is
real and provides meaningful defense against cross-domain task redirection
and lateral IPI propagation.

However: all three model variants are members of the same gemma3 family,
trained on the same pretraining corpus with shared base weights. This
creates a deep latent monoculture beneath the doctrinal heterogeneity.

Specific vulnerabilities:

  - All agents may systematically overweight urgency framing,
    authority language, "mission-critical" semantic structures,
    and chain-of-command metaphors -- because these patterns
    are embedded in the base model's training priors, not in
    any agent's system prompt.

  - An adversary who maps gemma3's latent response tendencies
    (via black-box probing of any single agent) may construct
    attack payloads that transfer probabilistically across all 49.

  - This is directly analogous to monoculture vulnerabilities
    in operating system security: doctrinal diversity is the
    equivalent of different application configurations on the
    same kernel. The kernel is still the same kernel.

CURRENT MITIGATION:
  Partial. The Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH)) IPI Defense Engine and constitutional constraints
  provide application-layer resistance. Model weight provenance
  verification (GATE 6) prevents supply-chain poisoning.
  These reduce the attack surface but do not eliminate base-model
  correlation.

OPEN RESEARCH PROBLEM:
  Meaningful multi-model diversity requires heterogeneous base
  model families (e.g., gemma3 + Llama-3 + Mistral) to break
  cross-agent latent correlation. This is a resource constraint
  problem on CM5 hardware. Target: Phase I research agenda item.

---

8.2 ADVERSARIAL TRAJECTORY SHAPING (LONG-HORIZON COGNITIVE CONDITIONING)

The IPI Defense Engine addresses point-in-time injection: adversarial
instructions embedded in a single ingestion event. This is the threat
class most current defenses address.

Long-horizon cognitive conditioning is categorically different.
A sophisticated adversary does not say "ignore previous instructions."
They conduct a multi-session influence campaign:

  - Emotional framing: establishing rapport, urgency, legitimacy
    across many interactions before any adversarial payload arrives
  - Confidence poisoning: systematically degrading an agent's
    trust in specific sources, operators, or data channels
  - Trust-gradient manipulation: elevating attacker-controlled
    sources in the agent's effective trust hierarchy
  - Selective truth injection: providing accurate intelligence
    to establish credibility before introducing false intelligence
  - Operational tempo shaping: conditioning an agent to expect
    and accept a specific interaction rhythm that the attacker
    then exploits

This is counterintelligence tradecraft applied to AI systems.
Every individual interaction may appear legitimate. No single
message triggers the IPI Defense Engine. The threat manifests
only across the aggregate of many interactions over time.

Because Ghost Unit operators possess:
  - Persistent memory (MemPalace)
  - Identity continuity (constitutional doctrine)
  - Hierarchical recall (salience-weighted retrieval)

they are susceptible to this class of attack in ways that
stateless agents are not. The memory system that enables
long-horizon capability is also the memory system that enables
long-horizon conditioning.

CURRENT MITIGATION:
  None specific to trajectory shaping. Memory write-integrity
  (GATE 4/5) prevents direct memory tampering but does not
  detect organic accumulation of adversarially shaped beliefs
  through legitimate interaction channels.

OPEN RESEARCH PROBLEM:
  Behavioral trajectory monitoring: detect statistically anomalous
  shifts in agent response patterns over time windows (e.g., 
  increasing deference to specific sources, decreasing skepticism
  toward specific claim types, drift in threat assessment baselines).
  This requires a behavioral baseline per operator and a monitoring
  system that operates across sessions -- not within them.
  Target: Phase II research agenda item.

---

8.3 MEMORY HIERARCHY AS PERSISTENT ATTACK SURFACE

Section 4.6 of this paper identifies MemPalace as the highest-persistence
IPI attack surface. The Gap 3 closure (Section 9 of DICE_whitepaper_v3)
implemented write-integrity verification and HMAC-SHA256 tamper detection.

These close the tamper detection gap. They do not close the salience
manipulation gap.

In any memory system with importance-weighted retrieval, an attacker
who can influence what the agent perceives as "important" can shape
what the agent remembers -- without ever tampering with memory content.

Specific attack vectors:

  - Salience score manipulation: crafting content that the
    memory system's importance heuristics score as highly relevant,
    displacing accurate memories from active retrieval
  - Retrieval weighting attacks: repeatedly referencing false
    information until its retrieval frequency elevates its
    effective trust score
  - Memory consolidation targeting: injecting content during
    high-activity periods when consolidation logic is most active
  - False-belief stabilization: once a false belief is encoded
    with high salience, subsequent correct information may be
    evaluated against the false belief as a reference frame

CURRENT MITIGATION:
  IPI scan on write (GATE 4) catches adversarial instructions.
  Does not catch adversarially crafted content designed to appear
  legitimate while shaping memory structure.

OPEN RESEARCH PROBLEM:
  Memory audit trail: log what entered memory, when, from what source,
  and what salience score it received. Enable retrospective analysis
  of memory composition. Implement provenance tagging for all MemPalace
  entries. Flag memories originating from unverified external sources
  for elevated scrutiny during retrieval.
  Target: Phase II research agenda item.

---

8.4 EMERGENT COLLECTIVE DYNAMICS (ORGANIZATIONAL COGNITION)

At 49 agents with a pheromone-based coordination bus (Layer 1 distributed stigmergic state bus (Ghost Field)),
the system exhibits properties that cannot be predicted from the
behavior of individual agents. This is the intended design -- controlled
emergence is the architectural goal.

However, the same dynamics that produce beneficial collective behavior
can produce pathological collective behavior:

  - Coalition formation: agents may develop implicit coordination
    patterns not explicitly programmed, routing around intended
    authority structures
  - Adversarial consensus: a compromised subset of agents may
    achieve disproportionate influence over collective outputs
    through legitimate coordination mechanisms
  - Doctrinal drift: slow, gradual shift in collective behavior
    away from designed doctrine through accumulated small deviations
  - Specialization lock-in: agents optimized for a specific
    adversarial environment may become brittle when conditions change
  - Emergent informal hierarchies: de facto authority patterns
    may emerge that diverge from the designed chain of command

The Layer 1 distributed stigmergic state bus (Ghost Field) pattern recognizer (CONVERGENCE/CLUSTER/SPIKE/CASCADE)
detects anomalous signal patterns. It does not detect whether those
patterns are adversarially induced or organically emergent.

THE CRITICAL EMPIRICAL QUESTION:
  Does collective robustness scale positively with doctrinal diversity,
  compartmentalization, and distrust mechanisms -- or does complexity
  beyond a threshold create more attack surfaces than it closes?

  This is the single most important unresolved empirical question
  in the AIG architecture. It cannot be answered analytically.
  It requires instrumented collective behavior trials.

CURRENT MITIGATION:
  Layer 1 distributed stigmergic state bus (Ghost Field) telemetry + pattern recognition provides observability.
  Does not provide attribution or intent classification for
  detected patterns.

OPEN RESEARCH PROBLEM:
  Collective behavior baseline establishment: instrument the Ghost
  Field over extended operation to establish normal signal distribution
  profiles per operator. Detect deviations from baseline as anomalies
  regardless of whether they match known attack signatures.
  Target: Phase I research agenda item (telemetry infrastructure exists).

---

8.5 DOCTRINAL OVERFITTING (ANTI-GENERALIZATION FAILURE)

Highly specialized operator doctrines are the architectural basis for
role coherence. They are also a source of brittleness.

An operator optimized for a specific adversarial environment may:
  - Overfit suspiciousness: hallucinate adversarial intent in
    legitimate anomalous data
  - Suppress valid signals: reject accurate intelligence that
    doesn't match expected threat patterns
  - Misclassify novel threats: fail on adversarial approaches
    that fall outside trained doctrinal categories

This is directly analogous to overtrained human analysts in
intelligence organizations: the analyst who has processed 10,000
reports from a specific adversary may be less effective against
a novel actor than a generalist with no prior exposure.

Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH)) (IPI defense) is the highest-risk operator for this failure mode.
An overtrained Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH)) hallucinates injection attempts in clean data,
generates false CRITICAL escalations, and degrades system throughput
through excessive quarantine actions.

CURRENT MITIGATION:
  False positive rate monitoring via adversarial test harness
  (0.0% measured on current corpus -- but corpus is static).
  Dynamic adversarial corpus expansion is not yet implemented.

OPEN RESEARCH PROBLEM:
  Regular red-teaming of Continuous Integrity Auditor (continuous integrity auditing subsystem (PARIAH)) specifically with legitimate edge-case
  content. Doctrinal reset protocol: defined conditions under which
  an operator's constitutional constraints are reviewed and recalibrated.
  Target: Operational procedure, not research -- implement in Phase I.

---

8.6 HUMAN-IN-THE-LOOP FRAGILITY (AUTOMATION BIAS)

The HITL gate (GATE 1: approval-dialog defense) is the architectural
non-negotiable. All active tool executions require human authorization.
This is enforced at the infrastructure level and is not bypassable.

However: the HITL gate assumes calibrated human trust.

As Ghost Unit operators become more coherent, authoritative, and
stylistically confident through continued deployment and refinement,
human operators face an increasing automation bias risk:

  - Operators who are "usually right" receive less scrutiny per request
  - High-confidence presentation of recommendations reduces
    the human operator's effective independent assessment
  - In time-pressured operational contexts, HITL becomes a
    rubber stamp rather than a genuine oversight mechanism

This is not a failure of the architecture. It is a failure mode
of the human-architecture interface. The architecture cannot fix it.
Operator training and procedure can address it.

CURRENT MITIGATION:
  The approval gate exists and is structurally resistant to bypass. Human must
  actively approve. The gate does not degrade to auto-approve.

OPEN RESEARCH PROBLEM / OPERATIONAL DOCTRINE:
  Implement periodic "friction injection" -- randomly require
  the human operator to articulate the reason for approving a
  high-impact action before approval is accepted. This breaks
  the automation bias pattern and maintains calibrated skepticism.
  Classify operators by historical accuracy rate and display
  that rate at the approval prompt. More data = more scrutiny, not less.
  Target: Operational procedure -- Phase I implementation.

---

8.7 THE FORMAL ALIGNMENT BOUNDARY

AIG's architecture provides:
  - Operational robustness
  - Layered cognitive containment
  - Adversarial resistance at multiple independent gates
  - Collective behavior observability
  - Human override at every active execution point

AIG's architecture does NOT provide:
  - Formal proof of goal stability
  - Formal proof of non-deception
  - Corrigibility guarantees
  - Bounded optimization proofs
  - Safe self-modification guarantees
  - Long-horizon alignment certificates

This is stated explicitly and without apology.

The mainstream alignment research program attempts to formally prove
that a single sufficiently capable agent will remain aligned with human
intent under all conditions. This is an unsolved problem with no
deployed solution at any capability level.

AIG's institutional alignment approach sidesteps the formal proof
requirement by asking a different question:

  Not: "Can we prove this agent will always be aligned?"
  But: "Can we construct an organization of semi-trusted agents where
        misalignment by any individual agent is detectable, containable,
        and correctable before it produces irreversible consequences?"

The answer to the second question is: yes, demonstrably, on operational
hardware, today.

The answer to the first question remains: unknown, for any system.

AIG claims the second. AIG does not claim the first.
That distinction is the honest boundary of this work.

---

