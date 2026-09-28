import type { Topic } from './types'

export const express: Topic = {
  id: 'express',
  title: 'Express & API Design',
  group: 'Backend',
  summary:
    'The middleware model, a layered project structure, central error handling, validation with Zod, pagination, rate limiting, uploads, webhooks and API documentation.',
  questions: [
    {
      q: 'What is middleware in Express?',
      level: 'basic',
      a: "A middleware is a function `(req, res, next)` that runs during the request. It can read or change `req` and `res`, end the request by sending a response, or call `next()` to pass control to the next middleware. Middleware runs in the order you register it. Logging, parsing JSON, auth, CORS and rate limiting are all middleware.",
      code: `
app.use(express.json())
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => console.log(req.method, req.url, res.statusCode, Date.now() - start + 'ms'))
  next()
})
`,
    },
    {
      q: 'Walk through the lifecycle of a request in Express.',
      level: 'mid',
      diagram: `
flowchart LR
  IN["Request"] --> G["helmet, cors, json, logger"] --> RT{"Route match?"}
  RT -- "no" --> NF["404"]
  RT -- "yes" --> AU["auth"] --> V["validate"] --> C["controller"] --> OUT["response"]
  AU -. "next(err)" .-> EH["error handler"]
  V -. "next(err)" .-> EH
  C -. "throw" .-> EH
`,
      a: "The request goes through global middleware in order (security headers, CORS, body parsing, logging), then the router matches the path and method, then route-level middleware (auth, validation), then the handler, which calls a service and sends a response. If anything calls `next(err)` or throws (in Express 5, including async errors), Express skips ahead to the error-handling middleware.",
    },
    {
      q: 'How do you structure an Express project, and why split into layers?',
      level: 'mid',
      diagram: `
flowchart TD
  R["Routes"] --> C["Controllers (HTTP in/out)"] --> S["Services (business rules)"] --> D["Data access"] --> DB[("Database")]
  W["Queue workers / cron"] --> S
`,
      a: "A common split:\n- Routes: map URLs and methods to controllers, attach middleware.\n- Controllers: handle HTTP. Read the validated input, call a service, send the response. No business logic.\n- Services: business rules (\"a campaign can't be scheduled in the past\"). No `req` or `res`.\n- Data access (models or repositories): database queries only.\n\nWhy: each layer can be tested on its own, business logic can be reused (from a queue worker, a cron job), and you can change the database or framework without rewriting the rules.",
      code: `
// routes/campaigns.ts
router.post('/', requireAuth, validate(CreateCampaign), campaignController.create)

// controllers/campaign.ts
export async function create(req, res) {
  const campaign = await campaignService.create(req.user.orgId, req.body)
  res.status(201).json(campaign)
}

// services/campaign.ts
export async function create(orgId, input) {
  if (input.scheduledAt < new Date()) throw new BadRequest('Schedule must be in the future')
  return campaignRepo.insert({ ...input, orgId })
}
`,
    },
    {
      q: 'How do you handle errors centrally?',
      level: 'mid',
      a: "Throw custom error classes with a status code from anywhere, and have one error-handling middleware (four parameters) at the end that turns them into a consistent JSON shape. Log unexpected errors with details, but never leak stack traces to clients in production.",
      code: `
class AppError extends Error {
  constructor(public status: number, message: string, public code = 'ERROR') { super(message) }
}
class NotFound extends AppError { constructor(what: string) { super(404, what + ' not found', 'NOT_FOUND') } }

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } })
  }
  logger.error({ err, path: req.path }, 'Unhandled error')
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } })
})
`,
    },
    {
      q: 'Why do async route handlers need special care in Express 4?',
      level: 'mid',
      a: "Express 4 doesn't catch rejected promises. If an `async` handler throws, the error isn't passed to your error middleware: the request hangs and you get an unhandled rejection. Wrap handlers so rejections go to `next`, or use Express 5, which handles returned promises natively.",
      code: `
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await userService.get(req.params.id))
}))
`,
    },
    {
      q: 'How do you validate input, and why at the boundary?',
      level: 'mid',
      a: "Validate everything that comes from outside (body, params, query, headers) as soon as it enters, before any business logic runs. With Zod you get validation and a TypeScript type from one schema. Everything after the boundary can then trust the data. Return 400 or 422 with clear field errors.",
      code: `
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(422).json({ error: { code: 'VALIDATION', fields: result.error.flatten().fieldErrors } })
  }
  req.body = result.data // cleaned and typed
  next()
}
`,
    },
    {
      q: 'Offset vs cursor pagination?',
      level: 'mid',
      diagram: `
flowchart LR
  subgraph Offset["Offset: page 500"]
    O1["Read 10,020 rows"] --> O2["Throw away 10,000"] --> O3["Return 20"]
  end
  subgraph Cursor["Cursor: after id X"]
    C1["Seek to X in the index"] --> C2["Read 20"] --> C3["Return 20"]
  end
`,
      a: "- Offset (`?page=3&limit=20` → `skip(40).limit(20)`): simple and lets users jump to any page. But it gets slow on large tables (the database still walks past skipped rows), and results shift if rows are added while paging.\n- Cursor (`?after=<lastId>&limit=20` → `WHERE id < lastId ORDER BY id DESC LIMIT 20`): fast with an index at any depth, and stable while data changes. Can't jump to page 50. Best for feeds, chats and infinite scroll.",
      code: `
// Cursor pagination with Mongo
const messages = await Message.find({ chatId, ...(cursor && { _id: { $lt: cursor } }) })
  .sort({ _id: -1 })
  .limit(limit + 1)
const hasMore = messages.length > limit
res.json({ items: messages.slice(0, limit), nextCursor: hasMore ? messages[limit - 1]._id : null })
`,
    },
    {
      q: 'How would you design filtering and sorting in a list endpoint?',
      level: 'basic',
      a: "Use query parameters: `GET /contacts?status=active&tag=vip&sort=-createdAt&limit=20`. Validate them against an allow-list of fields (never pass raw query objects to the database, which invites injection), map them to a database query, and make sure the common filter and sort combinations have indexes.",
    },
    {
      q: 'How do you implement rate limiting?',
      level: 'mid',
      a: "Count requests per key (IP address, user ID or API key) in a time window and return 429 with a `Retry-After` header when the limit is exceeded. Store the counters in Redis so the limit works across several server instances. Use stricter limits on sensitive routes like login and password reset. Common algorithms: fixed window, sliding window, token bucket.",
      code: `
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'

app.use('/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
}))
`,
    },
    {
      q: 'What are idempotency keys and how do you implement them?',
      level: 'advanced',
      diagram: `
sequenceDiagram
  participant C as Client
  participant A as API
  participant R as Redis
  C->>A: POST /send (Idempotency-Key k1)
  A->>A: Do the work
  A->>R: Store response under k1
  A--xC: Response lost
  C->>A: Retry with k1
  A->>R: Found k1
  A-->>C: Same response, work not repeated
`,
      a: "The client sends a unique `Idempotency-Key` header with a POST. The server stores the key with the response (in Redis or a table, with a TTL). If the same key arrives again (a retry after a timeout), return the stored response instead of doing the work again. This prevents double charges or duplicate campaign sends.",
      code: `
async function idempotent(req, res, next) {
  const key = req.header('Idempotency-Key')
  if (!key) return next()
  const cached = await redis.get('idem:' + key)
  if (cached) return res.status(200).json(JSON.parse(cached))
  const json = res.json.bind(res)
  res.json = (body) => {
    redis.set('idem:' + key, JSON.stringify(body), 'EX', 86400)
    return json(body)
  }
  next()
}
`,
    },
    {
      q: 'How do you handle file uploads?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant B as Browser
  participant A as API
  participant S as S3
  B->>A: Ask to upload (type, size)
  A-->>B: Pre-signed URL + key
  B->>S: PUT file directly
  B->>A: Save record with key
`,
      a: "For small files, use `multer` with limits on size and type (check the actual content type, not just the extension). For large or many files, have the client upload directly to S3 with a pre-signed URL: your server only signs the request and stores the file key, so large files never pass through your Node process.",
      code: `
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'

app.post('/uploads/sign', requireAuth, async (req, res) => {
  const key = 'media/' + req.user.orgId + '/' + crypto.randomUUID()
  const url = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: BUCKET, Key: key, ContentType: req.body.contentType,
  }), { expiresIn: 300 })
  res.json({ url, key })
})
`,
    },
    {
      q: 'How do you build a reliable webhook receiver?',
      level: 'advanced',
      diagram: `
sequenceDiagram
  participant P as Provider
  participant H as Webhook route
  participant Q as Queue
  participant W as Worker
  P->>H: POST event (signed)
  H->>H: Verify HMAC on raw body
  H->>Q: Add job (jobId = event id)
  H-->>P: 200 fast
  Q->>W: Process (duplicates skipped)
`,
      a: "- Verify the signature (HMAC with a shared secret) over the raw body to make sure it's really from the provider.\n- Respond `200` quickly, then process in the background (push to a queue), because providers retry if you're slow.\n- Expect duplicates: providers deliver at least once. Store the event ID and skip ones already processed.\n- Don't assume order: check timestamps or state before applying an event.\n\nThis maps directly to handling WhatsApp message status webhooks.",
      code: `
app.post('/webhooks/whatsapp', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.header('x-hub-signature-256')
  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(req.body).digest('hex')
  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.sendStatus(401)
  }
  res.sendStatus(200)
  await webhookQueue.add('event', JSON.parse(req.body.toString()), { jobId: eventIdFrom(req.body) })
})
`,
    },
    {
      q: 'How do you send webhooks to others reliably?',
      level: 'advanced',
      a: "Put each delivery in a queue job, sign the payload, and retry failures with exponential backoff (for example 1 minute, 5, 30, 2 hours, up to a limit). Include an event ID so receivers can deduplicate. Record every attempt and response for debugging, and let customers see and replay failed deliveries.",
    },
    {
      q: 'How do you version an API?',
      level: 'mid',
      a: "Most common: a version in the URL (`/api/v1/...`). Alternatives are a header (`Accept-Version`) or a date-based version. Add new fields without breaking old clients; only create a new version for breaking changes, and give clients time and a deprecation notice before removing the old one.",
    },
    {
      q: 'How do you design consistent API responses and errors?',
      level: 'basic',
      a: "Pick one shape and use it everywhere, so frontend code can handle responses generically. Use the right status codes, consistent field naming (camelCase), ISO 8601 dates, and machine-readable error codes plus human messages.",
      code: `
// Success
{ "data": { "id": "c_123", "name": "Diwali Sale" } }
// List
{ "data": [...], "nextCursor": "c_100" }
// Error
{ "error": { "code": "VALIDATION", "message": "Invalid input", "fields": { "name": ["Required"] } } }
`,
    },
    {
      q: 'How do you document an API?',
      level: 'basic',
      a: "With an OpenAPI (Swagger) spec: endpoints, parameters, request and response schemas, auth and error codes. Serve it with Swagger UI or Redoc. Better still, generate it from your Zod schemas (`zod-to-openapi`) so the docs can't drift from the validation.",
    },
    {
      q: 'What is helmet, and what does it protect against?',
      level: 'basic',
      a: "`helmet` sets security-related HTTP headers: `Content-Security-Policy` (limits where scripts can load from, reducing XSS), `Strict-Transport-Security` (forces HTTPS), `X-Content-Type-Options: nosniff`, `X-Frame-Options` (clickjacking), and removes `X-Powered-By`. One line, `app.use(helmet())`, and then tune the CSP.",
    },
    {
      q: 'How do you stream a large response in Express?',
      level: 'mid',
      a: "Instead of building a huge array and calling `res.json`, stream it: use a database cursor and write rows as they come, with `pipeline` so backpressure is handled. Good for CSV exports of thousands of contacts.",
      code: `
app.get('/contacts/export', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv')
  res.write('name,phone\\n')
  for await (const c of Contact.find({ orgId: req.user.orgId }).cursor()) {
    if (!res.write(c.name + ',' + c.phone + '\\n')) {
      await new Promise((r) => res.once('drain', r)) // backpressure
    }
  }
  res.end()
})
`,
    },
    {
      q: 'What is the difference between PUT and PATCH in practice?',
      level: 'basic',
      a: "PUT replaces the whole resource with what you send: missing fields are cleared. PATCH changes only the fields you send. For a form that edits a few fields, PATCH with validation of an optional-fields schema (`Schema.partial()`) is usually what you want.",
    },
  ],
}
