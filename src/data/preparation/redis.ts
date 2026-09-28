import type { Topic } from './types'

export const redis: Topic = {
  id: 'redis',
  title: 'Redis & Queues',
  group: 'Databases',
  summary:
    'Data types beyond strings, TTLs, caching patterns and invalidation, pub/sub, distributed locks, and BullMQ, which you have used for queued crawl jobs with retries and priorities.',
  questions: [
    {
      q: 'What is Redis, and why is it so fast?',
      level: 'basic',
      a: "Redis is an in-memory key-value data store. It's fast because data lives in RAM, operations are simple, and it runs commands on a single thread with an efficient event loop (no locking between commands). It can persist to disk (RDB snapshots, AOF logs), but it's mainly used for caching, sessions, rate limits, queues and pub/sub.",
    },
    {
      q: 'Which Redis data types should you know, and what are they good for?',
      level: 'mid',
      a: "- String: cached values, counters (`INCR`), flags, locks.\n- Hash: an object's fields (a user session, a cached record) that you can read or update individually.\n- List: queues and recent-items lists (`LPUSH`, `RPOP`, `LTRIM`).\n- Set: unique members, like online user IDs or tags.\n- Sorted set: members ordered by a score. Leaderboards, rate-limit windows, delayed jobs (BullMQ uses these).\n- Streams: an append-only log with consumer groups, for event processing.",
    },
    {
      q: 'What is a TTL, and why should almost every cache key have one?',
      level: 'basic',
      a: "A TTL (time to live) makes a key expire automatically after some seconds (`SET key value EX 300`). It limits how stale cached data can get, stops memory filling up with keys nobody uses, and acts as a safety net if an invalidation is ever missed.",
    },
    {
      q: 'Explain the cache-aside pattern.',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant A as API
  participant R as Redis
  participant D as Database
  A->>R: GET key
  alt hit
    R-->>A: value
  else miss
    A->>D: Query
    D-->>A: result
    A->>R: SET key result EX 60
  end
  Note over A,D: On write: update DB, then DEL key
`,
      a: "The application manages the cache:\n- On read: check Redis. On a hit, return it. On a miss, read from the database, store the result in Redis with a TTL, return it.\n- On write: update the database, then delete (invalidate) the cache key so the next read reloads fresh data.\n\nIt's the most common pattern because the cache only holds data that's actually requested, and a Redis outage just means slower reads.",
      code: `
async function getCampaignStats(id: string) {
  const key = 'campaign:stats:' + id
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const stats = await computeStats(id) // slow aggregation
  await redis.set(key, JSON.stringify(stats), 'EX', 60)
  return stats
}

async function onMessageStatusChanged(campaignId: string) {
  await redis.del('campaign:stats:' + campaignId)
}
`,
    },
    {
      q: 'Cache-aside vs write-through vs write-behind?',
      level: 'mid',
      a: "- Cache-aside: the app loads the cache on a miss and invalidates on write. Simple, most common.\n- Write-through: every write goes to the cache and the database together, so the cache is always fresh. Slower writes, and you cache data that may never be read.\n- Write-behind (write-back): write to the cache and save to the database later in batches. Very fast writes, but data can be lost if the cache fails first.",
    },
    {
      q: 'Why is cache invalidation hard, and how do you handle it?',
      level: 'advanced',
      a: "Because data changes in many places and a missed invalidation shows users stale data. Also, races: a slow reader can put old data back into the cache right after a writer deleted it.\n\nPractical approaches:\n- Short TTLs as a safety net.\n- Delete keys on write rather than updating them.\n- Versioned keys (`stats:v5:42`), bumping the version on change.\n- Cache at the right level: invalidating one campaign's stats is easier than a giant 'dashboard' blob.",
    },
    {
      q: 'What is a cache stampede, and how do you prevent it?',
      level: 'advanced',
      a: "When a popular key expires, hundreds of requests miss at the same moment and all hit the database together. Fixes:\n- A lock so only one request recomputes while others wait or get the stale value.\n- Add random jitter to TTLs so keys don't all expire together.\n- Refresh popular keys in the background before they expire.",
    },
    {
      q: 'How does Redis pub/sub work, and what are its limits?',
      level: 'mid',
      a: "Publishers send messages to a channel; every subscriber currently listening gets them. It's fire-and-forget: if a subscriber is offline, it misses the message, and nothing is stored. Good for broadcasting live events across servers (the Socket.io Redis adapter uses it). For messages that must not be lost, use Redis Streams or a proper queue.",
    },
    {
      q: 'How do you build a distributed lock with Redis?',
      level: 'advanced',
      a: "Use `SET key token NX PX 30000`: set only if the key doesn't exist, with an expiry so a crashed holder doesn't lock forever. The token is a random value, so only the owner can release it; release with a small Lua script that checks the token before deleting. Use it to make sure only one server runs a cron job or processes one campaign at a time. For strict guarantees, look at Redlock and fencing tokens.",
      code: `
const token = crypto.randomUUID()
const ok = await redis.set('lock:campaign:' + id, token, 'PX', 30000, 'NX')
if (!ok) return // someone else holds it

try {
  await sendCampaign(id)
} finally {
  await redis.eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end",
    1, 'lock:campaign:' + id, token,
  )
}
`,
    },
    {
      q: 'How do you implement a rate limiter with Redis?',
      level: 'mid',
      a: "Fixed window: `INCR` a key like `rl:user:42:<minute>` and set an expiry on the first hit; reject when the count passes the limit. Sliding window: keep a sorted set of request timestamps, remove old ones, count the rest. Redis is ideal because every server instance shares the same counters.",
      code: `
async function allow(userId: string, limit = 100) {
  const key = 'rl:' + userId + ':' + Math.floor(Date.now() / 60000)
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60)
  return count <= limit
}
`,
    },
    {
      q: 'What happens when Redis runs out of memory?',
      level: 'mid',
      a: "It follows its `maxmemory-policy`. For a cache, use an eviction policy like `allkeys-lru` (remove least recently used keys). For data you can't lose (queues, sessions), use `noeviction` so writes fail loudly rather than silently deleting jobs, and monitor memory. Don't mix a disposable cache and a job queue with different needs in one instance if you can avoid it.",
    },
    {
      q: 'How does BullMQ work?',
      level: 'mid',
      diagram: `
flowchart LR
  API["API: add job"] --> Q[("Queue in Redis")]
  Q --> W1["Worker 1"]
  Q --> W2["Worker 2"]
  W1 --> DB[("Database")]
  W2 --> DB
`,
      a: "BullMQ is a job queue for Node built on Redis. Producers add jobs to a named queue; workers (in the same or separate processes) pick them up and run a processor function. Redis stores job data and state (waiting, active, completed, failed, delayed), so jobs survive restarts and many workers can share the load. Features: retries with backoff, delays, priorities, rate limits, concurrency, repeatable (cron) jobs, and flows (parent and child jobs).",
      code: `
const crawlQueue = new Queue('crawl', { connection })

await crawlQueue.add('audit', { siteId, url }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  priority: plan === 'pro' ? 1 : 5, // lower number = higher priority
  removeOnComplete: 1000,
})

new Worker('crawl', async (job) => {
  await job.updateProgress(10)
  return runAudit(job.data)
}, { connection, concurrency: 4 })
`,
    },
    {
      q: 'Why use a job queue instead of doing work inside the request?',
      level: 'basic',
      a: "Long or unreliable work (crawling sites, rendering videos, sending thousands of WhatsApp messages, calling LLM APIs) would make the request slow or time out, and a crash would lose it. A queue lets you respond immediately ('audit started'), process in the background, retry failures automatically, control concurrency and rate limits, and scale workers separately from the API.",
    },
    {
      q: 'How do retries with exponential backoff work, and why add jitter?',
      level: 'mid',
      diagram: `
stateDiagram-v2
  [*] --> waiting
  waiting --> active: worker picks up
  active --> completed: success
  active --> delayed: failed, retries left (5s, 10s, 20s)
  delayed --> waiting
  active --> failed: no retries left
`,
      a: "After a failure, wait before retrying, doubling the wait each time (5s, 10s, 20s...), up to a maximum number of attempts. It gives a struggling service time to recover. Jitter (a random extra delay) stops many failed jobs from retrying at exactly the same moment and overwhelming the service again. After the final attempt, the job goes to a failed state (a dead-letter list) for inspection.",
    },
    {
      q: 'What makes a job safe to retry?',
      level: 'advanced',
      a: "Jobs should be idempotent: running one twice has the same effect as once, because a worker can crash after doing the work but before marking the job done. Techniques: use a deterministic `jobId` so duplicates aren't queued, check whether the step was already completed before doing it, and use upserts rather than blind inserts.",
    },
    {
      q: 'Tell me about the BullMQ pipeline you built.',
      level: 'mid',
      a: "Practise this as a system-design story (SEO Analyzer):\n- Problem: auditing many sites in parallel with Playwright is slow, memory-heavy and flaky.\n- Design: the API validates the request, creates an audit record, adds a BullMQ job and returns immediately.\n- Workers run Playwright with limited concurrency, run 20+ checks, and store results as JSONB in PostgreSQL.\n- Retries with backoff handle flaky pages; priorities let important jobs jump the queue.\n- The frontend polls or subscribes for progress.\n- What you'd improve: per-domain rate limits, a dead-letter review screen, metrics on job duration and failure rate.",
    },
  ],
}
