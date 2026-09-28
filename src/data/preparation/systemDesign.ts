import type { Topic } from './types'

export const systemDesign: Topic = {
  id: 'system-design',
  title: 'System Design',
  group: 'Interview rounds',
  summary:
    'Mid-level system design: a repeatable approach, caching, scaling, queues, rate limiting and webhooks, plus practice designs. Your BullMQ and WhatsApp work are real answers here.',
  questions: [
    {
      q: 'How should you approach a system design interview?',
      level: 'basic',
      diagram: `
flowchart LR
  R["Requirements"] --> E["Estimates"] --> A["API"] --> D["Data model"] --> H["High-level design"] --> DD["Deep dives"] --> W["Trade-offs"]
`,
      a: "Use a steady structure and talk through it:\n- Requirements: clarify what it must do (functional) and how much load, latency and reliability matter (non-functional). Ask questions.\n- Estimates: rough users, requests per second, data size. Enough to choose sensible tools.\n- API: the main endpoints or events.\n- Data model: main entities and which database fits.\n- High-level design: draw clients, load balancer, services, database, cache, queue.\n- Deep dive: the hardest part (scaling a hot path, consistency, failures).\n- Trade-offs and what you'd improve with more time.",
    },
    {
      q: 'What does "stateless" mean for a server, and why does it help scaling?',
      level: 'mid',
      a: "A stateless server keeps no per-user data in its own memory between requests: sessions live in Redis or a token, files in S3, jobs in a queue. Then any instance can handle any request, so you can add or remove instances behind a load balancer freely and survive one crashing.",
    },
    {
      q: 'Vertical vs horizontal scaling?',
      level: 'basic',
      a: "- Vertical: a bigger machine (more CPU and RAM). Simple, but has a ceiling, gets expensive, and is still one point of failure.\n- Horizontal: more machines behind a load balancer. Scales much further and adds redundancy, but needs stateless services and shared data stores.\n\nDatabases usually scale vertically first, then with read replicas, caching, and finally sharding.",
    },
    {
      q: 'What does a load balancer do?',
      level: 'basic',
      a: "It spreads incoming requests across several servers (round robin, least connections, and so on), sends traffic only to healthy instances based on health checks, and often terminates SSL. It lets you scale horizontally and deploy without downtime.",
    },
    {
      q: 'Where can you add caching in a system?',
      level: 'mid',
      a: "- Browser: HTTP cache headers for assets and some API responses.\n- CDN: static files and cacheable pages close to users.\n- Application cache (Redis): expensive query results, computed analytics, sessions.\n- Database: its own buffer cache, plus materialised views or precomputed summary tables.\n\nFor each, decide what's cached, for how long, and how it gets invalidated.",
    },
    {
      q: 'How do read replicas help, and what is replication lag?',
      level: 'mid',
      a: "Read replicas are copies of the primary database that serve read queries, taking load off the primary, which handles writes. Replication is usually asynchronous, so a replica can be slightly behind (lag). A user who just saved something might not see it if the next read hits a replica. Fix by reading from the primary right after a user's own write.",
    },
    {
      q: 'Why use a message queue between services?',
      level: 'mid',
      a: "- It decouples producers and consumers: the API doesn't wait for slow work.\n- It absorbs traffic spikes: jobs wait in the queue instead of overloading workers.\n- It adds reliability: retries, and jobs survive crashes.\n- Workers scale independently of the API.\n\nThe trade-off is eventual consistency (results appear a bit later) and more moving parts to monitor.",
    },
    {
      q: 'Design a URL shortener.',
      level: 'mid',
      diagram: `
flowchart LR
  C["Client"] --> LB["Load balancer"] --> API["Redirect service"]
  API --> R[("Redis cache")]
  API -- "miss" --> DB[("Links DB")]
  API --> Q[("Click events queue")] --> W["Analytics worker"]
`,
      a: "- Requirements: create a short link for a long URL; redirect quickly; optional expiry and click counts. Reads far outnumber writes.\n- API: `POST /links { url }` → `{ code }`; `GET /:code` → 301/302 redirect.\n- Code generation: base62-encode an auto-increment ID or a random 7-character string (62^7 ≈ 3.5 trillion), checking for collisions with a unique index.\n- Storage: a key-value style table `code → url, createdAt, expiresAt`.\n- Reads: cache hot codes in Redis; serve redirects close to users via a CDN or edge.\n- Analytics: push click events to a queue and count them asynchronously so the redirect stays fast.\n- 301 lets browsers cache the redirect (fewer hits, less analytics); 302 always comes to you.",
    },
    {
      q: 'Design a rate limiter.',
      level: 'mid',
      diagram: `
flowchart LR
  C["Client"] --> A1["API 1"]
  C --> A2["API 2"]
  A1 --> R[("Redis counters")]
  A2 --> R
  A1 -- "over limit" --> X["429 + Retry-After"]
`,
      a: "- Where: API gateway or middleware, keyed by user ID, API key or IP.\n- Algorithm: token bucket (allows short bursts, smooth average rate) or sliding window (accurate counts).\n- Storage: Redis, so all API instances share counters; use atomic operations (`INCR` with expiry, or a Lua script for token bucket).\n- Response: 429 with `Retry-After` and `X-RateLimit-Remaining` headers.\n- Failure mode: if Redis is down, decide whether to fail open (allow) or closed (block). Usually fail open for normal APIs.\n- Different limits per plan and per endpoint (login is strict).",
    },
    {
      q: 'Design a notification service (email, SMS, WhatsApp, push).',
      level: 'advanced',
      diagram: `
flowchart TD
  S["Other services"] --> NA["Notification API:<br/>preferences, templates, idempotency"]
  NA --> QE[("Email queue")] --> WE["Email workers"]
  NA --> QW[("WhatsApp queue")] --> WW["WhatsApp workers"]
  NA --> QP[("Push queue")] --> WP["Push workers"]
`,
      a: "- Other services call one API or publish an event: `notify(userId, template, data, channels)`.\n- The notification service checks user preferences and quiet hours, renders templates, and creates one job per channel in a queue.\n- Channel workers call providers (SES, Twilio, WhatsApp Cloud API) with retries, backoff and per-provider rate limits.\n- Idempotency keys stop duplicate sends when upstream retries.\n- Store every notification and its status (queued, sent, delivered, failed), updated by provider webhooks.\n- Priorities: OTPs jump ahead of marketing messages.\n- Scale by adding workers per channel; monitor queue length and failure rates.",
    },
    {
      q: 'Design a WhatsApp-style campaign sender for 100,000 recipients.',
      level: 'advanced',
      diagram: `
flowchart TD
  U["Schedule campaign"] --> API["API: validate"] --> J["Delayed job"]
  J --> EX["Expander: cursor in batches"] --> Q[("Send queue: jobId per contact")]
  Q --> SW["Senders (rate-limited)"] --> WA["WhatsApp API"]
  WA -. "status webhooks" .-> WH["Webhook handler"] --> P["Counters + live progress"]
`,
      a: "- The user creates a campaign (template, audience segment, schedule). Validate and save it.\n- At send time, a scheduler job expands the segment into recipients in batches (cursor through contacts, don't load 100k into memory).\n- Each batch becomes queue jobs. Workers send through the WhatsApp API respecting its rate limits (BullMQ rate limiter) and per-org quotas.\n- Record each message with a unique ID; retries with backoff for temporary errors; permanent failures (invalid number) are marked and not retried.\n- Delivery and read receipts arrive by webhook → update message status → increment campaign counters (Redis) → push live progress to the dashboard through sockets.\n- Idempotency: a deterministic job ID per (campaign, contact) so a crash or retry never double-sends.\n- Controls: pause and cancel (workers check campaign status), opt-out handling.",
    },
    {
      q: 'Design a chat system.',
      level: 'advanced',
      diagram: `
flowchart LR
  C1["Client"] --> G1["Socket gateway 1"]
  C2["Client"] --> G2["Socket gateway 2"]
  G1 --- R[("Redis adapter")]
  G2 --- R
  G1 --> MS["Message service"] --> DB[("Messages by chatId")]
`,
      a: "- Clients keep a WebSocket connection to a gateway layer (Socket.io with the Redis adapter to span servers).\n- Sending: the client sends a message with a temporary ID → the server saves it to the database (messages partitioned by conversation, indexed by conversation and time) → acknowledges with the real ID → emits to the conversation room.\n- Offline users: they fetch missed messages on reconnect (since the last seen ID); push notifications through a queue.\n- Read receipts and typing indicators are lightweight socket events; receipts are stored, typing is not.\n- History: cursor pagination, newest first.\n- Scale: stateless socket servers, a sharded message store by conversation ID, and caching recent conversations.",
    },
    {
      q: 'Design an SEO audit service like your SEO Analyzer.',
      level: 'mid',
      diagram: `
flowchart LR
  C["Client"] --> API["API: validate URL (block private IPs)"]
  API --> Q[("BullMQ")] --> W["Playwright workers"]
  W --> PG[("Postgres: JSONB results")]
  C -. "poll progress" .-> API
`,
      a: "- `POST /audits { url }` validates the URL (block internal IPs to prevent SSRF), creates an audit record, queues a job, and returns the audit ID.\n- Crawl workers (Playwright) with limited concurrency and per-domain rate limits fetch pages, run 20+ checks, and compute a score.\n- Results are stored as JSONB in PostgreSQL next to relational fields (site, score, created time) that you filter and sort on.\n- Retries with backoff for flaky pages; timeouts per page; a failed state with the reason.\n- The client polls `GET /audits/:id` or listens for progress events.\n- Scaling: more workers, and a scheduled re-audit feature with repeatable jobs.",
    },
    {
      q: 'What is the CAP theorem, in simple terms?',
      level: 'mid',
      a: "When a network partition splits a distributed system, you must choose between Consistency (every read sees the latest write, so some requests fail) and Availability (every request gets an answer, possibly stale data). Partitions will happen, so the real choice is what to give up during one. Payments lean towards consistency; a social feed leans towards availability.",
    },
    {
      q: 'How do you handle failures between services?',
      level: 'advanced',
      a: "- Timeouts on every outgoing call.\n- Retries with exponential backoff and jitter, only for safe (idempotent) operations.\n- Circuit breaker: after repeated failures, stop calling the broken service for a while and fail fast or use a fallback.\n- Queues for work that can happen later.\n- Graceful degradation: show cached or partial data instead of an error page.\n- Idempotency keys so retries don't duplicate effects.",
    },
    {
      q: 'Monolith vs microservices?',
      level: 'mid',
      a: "A monolith (one deployable app) is simpler to build, test, deploy and debug, and it's the right default for most teams and products. Microservices let teams deploy independently and scale parts separately, but bring network calls, distributed data, harder debugging and more operations work. A good middle ground is a modular monolith with clear boundaries, plus separate workers for background jobs.",
    },
  ],
}
