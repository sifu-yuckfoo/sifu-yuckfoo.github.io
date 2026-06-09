AKAMAI INTELLIGENCE GROUP
GHOST FIELD SCALE DECISION MEMO
==============================================================================
Document ID: AIG-ARCH-017
Classification: UNCLASSIFIED // AIG INTERNAL
Version: 0.1 | May 31, 2026
Author: Christopher Ramos
Research and drafting support: Deus ex Machina
Status: ACTIVE ARCHITECTURE DECISION
==============================================================================

PURPOSE
------------------------------------------------------------------------------
This memo records the current architecture decision for the Ghost Field state bus
in support of AIG's DICE scaling path from the current Ghost Unit seed cell to
100 named operators and 500 Phase I logical agents.

The decision is based on the new executable substrate and evidence chain:

  - operator_scale_manifest.py
  - logical_agent_factory.py
  - ghost_field_load_simulator.py
  - GAL-033 100-agent controlled-emergence stress test
  - GAL-034 500-agent governed interaction capacity test
  - GAL-035 governed interaction metrics package

DECISION
------------------------------------------------------------------------------
SQLite/WAL Ghost Field remains the correct near-term bus for edge prototype,
local evaluation, and Phase I-scale simulation evidence.

AIG will not claim that the current SQLite-backed Ghost Field is the final
100,000-agent distributed substrate.

AIG will claim that the governance architecture is substrate-agnostic. The
current SQLite/WAL Ghost Field is the local edge/evaluation implementation of a
more general stigmergic state-bus pattern.

In short:

  SQLite Ghost Field is sufficient for current 49-agent operations, 100-agent
  named roster simulation, and 500-logical-agent Phase I evaluation.

  For higher concurrency, distributed deployment, or Phase II/III scale, AIG
  will migrate the same governance primitives onto sharded and/or queue-backed
  state-bus infrastructure.

RATIONALE
------------------------------------------------------------------------------
The current Ghost Field passed the evidence threshold required for the present
DICE strategy.

GAL-033 demonstrated:

  - 100 logical agents
  - 9,900 naive all-to-all possible edges
  - 818 budget-allowed edges
  - 91.7374 percent fanout reduction
  - 100 percent authority-spoof blocking in tested attempts
  - false-consensus detection
  - rogue-coalition detection
  - consultation-budget enforcement

GAL-034 demonstrated:

  - 500 logical agents
  - 100 named operators
  - 400 sharded logical agents
  - 24 active inference workers
  - 4.8 percent active reasoning ratio
  - 249,500 naive all-to-all possible edges
  - 2,887 budget-allowed edges
  - 0.011571 governed interaction ratio
  - 246,663 blocked or throttled potential interaction paths
  - 100 percent authority-boundary block rate in tested attempts
  - false-consensus detection
  - rogue-coalition detection
  - sensor-burst observability

GAL-035 packaged those results into durable JSON and Markdown evidence.

The evidence supports AIG's primary DICE claim:

  AIG scales by governed interaction capacity, not by one always-on LLM per
  logical agent.

CURRENT IMPLEMENTATION STATUS
------------------------------------------------------------------------------
The current Ghost Field implementation provides:

  - SQLite-backed local signal bus
  - WAL mode
  - thread-safe write/read lock
  - signal type taxonomy
  - operator registry validation
  - eval-safe probe/system source prefixes
  - HMAC provenance signing for registered operators
  - adversarial payload scan
  - write-side validation gate
  - burst/cascade monitoring
  - PARIAH bus monitor subscription
  - field status metrics
  - active-signal TTL semantics
  - cluster registration

Observed scale behavior:

  - 100 temp-load simulation accepted 100/100 writes
  - 500 temp-load simulation accepted 500/500 writes
  - no write rejection under eval-safe probe identities
  - p95 write latency stayed well below 50 ms in tested runs
  - default GhostField.read() has a LIMIT 100 window
  - field_status() correctly reported all active 500 signals

The read-window behavior is not a failure. It is an API design constraint that
must be handled explicitly at scale.

ENGINEERING CAVEATS
------------------------------------------------------------------------------
The current SQLite/WAL Ghost Field should not be over-claimed.

Known caveats:

  1. The current load tests are deterministic and local.
  2. The current tests are not multi-host distributed tests.
  3. The current tests do not prove 100,000-agent bus capacity.
  4. SQLite write locking may become a bottleneck under heavy concurrent write
     pressure.
  5. GhostField.read() defaults to LIMIT 100 and therefore requires explicit
     pagination, high-limit reads, read_recent(), or status-driven access for
     large populations.
  6. PARIAH burst monitoring correctly fires on repeated eval activity; future
     stress tests may need explicit eval windows or expected-burst annotations
     to distinguish test pressure from real compromise.

These caveats are acceptable for Phase I evidence because the claim is not
"SQLite is the final swarm substrate." The claim is that AIG's governance
architecture can be instantiated, measured, and migrated across substrate
implementations.

SUBSTRATE-AGNOSTIC PRIMITIVES
------------------------------------------------------------------------------
The following AIG primitives should survive any future bus migration:

  - operator identity
  - authority tier
  - logical layer
  - interaction budget
  - allowed signal types
  - allowed action classes
  - provenance and state lineage
  - deterministic execution contracts
  - legitimacy scoring
  - gateway authority checks
  - controlled emergence metrics
  - false-consensus detection
  - rogue-coalition detection
  - burst/cascade monitoring

Therefore, the Ghost Field should be treated as the current implementation of a
stigmergic state-bus interface, not as the entire architecture.

MIGRATION PATH
------------------------------------------------------------------------------
AIG's bus scale path is staged.

Stage 0 -- Current Edge/Eval Bus
  SQLite/WAL Ghost Field on local edge hardware and local eval harnesses.

Stage 1 -- Hardened SQLite Bus
  - explicit read limits and pagination
  - batched writes
  - batch read APIs
  - eval window metadata
  - improved high-volume status queries
  - retention and compaction jobs
  - WAL tuning by deployment profile

Stage 2 -- Sharded Ghost Fields
  - per-cohort or per-layer bus shards
  - governance-core aggregator
  - shard-local state with summarized cross-shard exchange
  - shard lineage and consistency monitors
  - MIRRORNODE/LEDGERNODE style audit roles

Stage 3 -- Queue-Backed Ingestion
  - append-first queue in front of state store
  - workers drain into durable state bus
  - backpressure and rate-limit policies
  - replayable event stream
  - deterministic eval replay support

Stage 4 -- Distributed State Bus
  Candidate implementation families:
    - Redis Streams
    - NATS / JetStream
    - PostgreSQL / Timescale-style event store
    - SQLite shards per edge node with sync aggregation
    - hybrid local-first edge bus plus central evaluation collector

The correct final substrate should be selected only after the BAA clarifies
Phase I/II/III evaluation environment constraints.

DICE PROPOSAL POSITION
------------------------------------------------------------------------------
Proposal-safe phrasing:

  AIG's current Ghost Field is a local SQLite/WAL implementation of a broader
  stigmergic state-bus abstraction. It is sufficient for edge prototyping and
  Phase I-scale simulation evidence, including 500 logical agents under sparse
  activation and interaction budgeting. AIG does not depend on SQLite as the
  final distributed substrate; the governing primitives are substrate-agnostic
  and can migrate to sharded, queue-backed, or distributed event-bus systems as
  scale and evaluation requirements increase.

Short version:

  SQLite is the edge/eval bus. Governance is the architecture.

DECISION RECORD
------------------------------------------------------------------------------
Decision:
  Keep SQLite/WAL Ghost Field for current edge prototype, GAL evidence, and
  Phase I simulation harnesses.

Do now:
  - keep using SQLite/WAL in GAL-033/GAL-034/GAL-035 evidence
  - document read-window and concurrency caveats
  - add explicit scale-path language to DICE docs
  - avoid claiming SQLite solves 100,000-agent distributed scale

Do next:
  - add pagination/batched-read helper if needed
  - add eval-window metadata to reduce false alarm noise in stress tests
  - add sharded bus design if BAA requires higher concurrency evidence

Do later:
  - prototype queue-backed or sharded Ghost Field if Phase I/II evaluation
    environment demands it

BOTTOM LINE
------------------------------------------------------------------------------
The Ghost Field has proven enough for the current DICE evidence chain. The next
risk is not local 500-agent simulation. The next risk is over-claiming the bus.
AIG should be explicit: the current bus is sufficient for evidence and edge
prototype work; the governance primitives are designed to survive migration to
larger substrates.
