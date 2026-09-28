import type { Topic } from './types'

export const node: Topic = {
  id: 'node',
  title: 'Node.js',
  group: 'Backend',
  summary:
    'How Node actually works: the event loop phases, libuv and the thread pool, streams and backpressure, workers and clustering, and handling errors and shutdown properly.',
  questions: [
    {
      q: 'What is Node.js, and why is it good for I/O-heavy servers?',
      level: 'basic',
      a: "Node is a JavaScript runtime built on Chrome's V8 engine plus libuv, a C library for asynchronous I/O. Your JavaScript runs on a single thread, but I/O (network, files, databases) is handed off and doesn't block. While one request waits for the database, Node serves others. That makes it efficient for APIs, real-time apps and anything that mostly waits on I/O. It's weaker for heavy CPU work, which blocks that single thread.",
    },
    {
      q: 'What are the phases of the Node event loop?',
      level: 'advanced',
      diagram: `
flowchart TD
  T["timers"] --> PC["pending callbacks"] --> PO["poll (I/O)"] --> CH["check (setImmediate)"] --> CL["close callbacks"] --> T
  MQ["Between every callback:<br/>process.nextTick, then promises"]
`,
      a: "Each loop iteration goes through phases in order:\n- timers: run due `setTimeout`/`setInterval` callbacks.\n- pending callbacks: some system-level I/O callbacks.\n- poll: wait for and run I/O callbacks (most of your code runs here).\n- check: run `setImmediate` callbacks.\n- close callbacks: e.g. `socket.on('close')`.\n\nBetween every callback, Node drains `process.nextTick` callbacks first, then promise microtasks.",
      code: `
setTimeout(() => console.log('timeout'), 0)
setImmediate(() => console.log('immediate'))
process.nextTick(() => console.log('nextTick'))
Promise.resolve().then(() => console.log('promise'))

// nextTick, promise, then timeout/immediate
// (inside an I/O callback, immediate always comes before timeout)
`,
    },
    {
      q: 'How is the Node event loop different from the browser one?',
      level: 'mid',
      a: "Both run JavaScript on one thread with task and microtask queues. Differences:\n- Node has explicit phases (timers, poll, check...), and `setImmediate` runs in the check phase.\n- Node has `process.nextTick`, which runs before promise microtasks.\n- The browser has rendering steps and `requestAnimationFrame` between tasks; Node has no rendering.",
    },
    {
      q: 'What is libuv and the thread pool?',
      level: 'mid',
      diagram: `
flowchart TD
  JS["Your JS (one main thread, V8)"] --> UV["libuv event loop"]
  UV --> OS["OS async I/O: network sockets"]
  UV --> TP["Thread pool (4): fs, dns.lookup,<br/>crypto, zlib"]
`,
      a: "libuv provides Node's event loop and async I/O. Network I/O uses the operating system's non-blocking mechanisms (epoll, kqueue) directly. Some operations have no non-blocking OS API, so libuv runs them on a thread pool (4 threads by default, set by `UV_THREADPOOL_SIZE`): file system calls, DNS `lookup`, `crypto` (like `pbkdf2`, `bcrypt`-style hashing) and `zlib` compression. If all 4 threads are busy with slow hashing, other file or crypto work waits.",
    },
    {
      q: 'What blocks the event loop, and how do you avoid it?',
      level: 'mid',
      a: "Anything slow and synchronous: big `JSON.parse`/`JSON.stringify` calls, heavy loops over large arrays, synchronous file APIs (`readFileSync`) inside request handlers, bad regular expressions, image processing, synchronous crypto. While it runs, every other request waits.\n\nFixes: use async APIs, split work into chunks, move CPU-heavy work to worker threads or a separate job queue (BullMQ workers), and stream large data instead of loading it all at once.",
    },
    {
      q: 'What are streams, and why use them?',
      level: 'mid',
      diagram: `
flowchart LR
  R["DB cursor (Readable)"] --> T["to CSV (Transform)"] --> G["gzip (Transform)"] --> W["HTTP response (Writable)"]
`,
      a: "Streams process data piece by piece instead of loading it all into memory. There are four types: Readable (source), Writable (destination), Duplex (both, like a socket) and Transform (changes data as it passes, like gzip). Streaming a 2GB file uses a few KB of memory instead of 2GB, and the first bytes reach the user sooner.",
      code: `
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'

app.get('/export', async (req, res) => {
  res.setHeader('Content-Encoding', 'gzip')
  await pipeline(createReadStream('./report.csv'), createGzip(), res)
})
`,
    },
    {
      q: 'What is backpressure?',
      level: 'advanced',
      a: "When a readable source produces data faster than the writable destination can handle, data piles up in memory. Backpressure is the mechanism that slows the source down: `writable.write()` returns `false` when its buffer is full, and you should pause until the `drain` event. `pipe()` and `pipeline()` handle this for you, which is why you should use them instead of manually wiring `data` events.",
    },
    {
      q: 'What is a Buffer?',
      level: 'basic',
      a: "A Buffer is a fixed-size chunk of raw binary data, used for files, network packets and images. It lives outside the normal JavaScript heap. You convert between buffers and strings with an encoding: `Buffer.from('hi', 'utf8')` and `buf.toString('base64')`.",
    },
    {
      q: 'What is EventEmitter?',
      level: 'basic',
      a: "Node's built-in publish/subscribe class. Objects emit named events and listeners react with `.on()`. Streams, HTTP servers and sockets are all EventEmitters. An `error` event with no listener crashes the process, so always handle it.",
      code: `
class Emitter {
  events = new Map()
  on(name, fn) {
    if (!this.events.has(name)) this.events.set(name, [])
    this.events.get(name).push(fn)
    return () => this.off(name, fn)
  }
  off(name, fn) {
    this.events.set(name, (this.events.get(name) || []).filter((f) => f !== fn))
  }
  emit(name, ...args) {
    ;(this.events.get(name) || []).forEach((fn) => fn(...args))
  }
}
`,
    },
    {
      q: 'Child processes vs worker threads vs cluster: when do you use each?',
      level: 'mid',
      a: "- Worker threads: run JavaScript in parallel threads inside the same process, and can share memory. Best for CPU-heavy JavaScript (parsing, image work).\n- Child processes (`spawn`, `exec`, `fork`): run separate programs, like FFmpeg for rendering video, or a Python script.\n- Cluster: start several copies of your server (one per CPU core) sharing the same port, to use all cores. In production this is often done by PM2, or by running several containers behind a load balancer instead.",
    },
    {
      q: 'What is the difference between process.nextTick and setImmediate?',
      level: 'advanced',
      a: "`process.nextTick` runs right after the current operation, before promises and before the loop continues. Overusing it can starve I/O. `setImmediate` runs in the check phase of the next loop iteration, after I/O. Despite the names, `nextTick` fires sooner than `setImmediate`. Prefer `setImmediate` or `queueMicrotask` unless you specifically need nextTick.",
    },
    {
      q: 'How do you manage configuration and environment variables?',
      level: 'basic',
      a: "Read settings from environment variables (`process.env`), load them locally from a `.env` file (never committed), and validate them at startup so the app fails fast with a clear message if something is missing. Keep secrets in a secrets manager in production.",
      code: `
import { z } from 'zod'

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
})
export const env = Env.parse(process.env)
`,
    },
    {
      q: 'dependencies vs devDependencies, and what is a lockfile for?',
      level: 'basic',
      a: "- `dependencies`: needed at runtime (express, mongoose).\n- `devDependencies`: only needed to build and test (typescript, jest, eslint).\n- The lockfile (`package-lock.json`) records the exact version of every package, including sub-dependencies, so every machine and CI installs the same tree. Commit it, and use `npm ci` in CI for a clean, exact install.",
    },
    {
      q: 'What is the difference between operational errors and programmer errors?',
      level: 'mid',
      a: "- Operational errors are expected failures in a correct program: a database timeout, invalid user input, a third-party API returning 500, a file not found. Handle them: retry, return a clear error, log.\n- Programmer errors are bugs: reading a property of `undefined`, wrong arguments. You can't safely recover. Log them and let the process restart (under a supervisor) rather than continue in an unknown state.",
    },
    {
      q: 'How do you handle unhandledRejection and uncaughtException?',
      level: 'mid',
      a: "Register handlers that log the error with full details and then shut down gracefully. Continuing after an uncaught exception is unsafe because the app may be in a broken state. A process manager (PM2, Docker restart policy, Kubernetes) starts a fresh process.",
      code: `
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection')
  shutdown(1)
})
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  shutdown(1)
})
`,
    },
    {
      q: 'What is graceful shutdown?',
      level: 'mid',
      diagram: `
flowchart TD
  S["SIGTERM"] --> A["Stop accepting connections"] --> B["Finish in-flight requests"]
  B --> C["Finish current queue job"] --> D["Close DB / Redis"] --> E["exit(0)"]
  S --> T["Hard timeout → exit(1)"]
`,
      a: "When the process gets `SIGTERM` (from Docker, a deploy or a scale-down), stop accepting new connections, let in-flight requests and jobs finish, close database and Redis connections, then exit. Add a timeout so a stuck request can't block shutdown forever. Without it, deploys cut requests off halfway.",
      code: `
async function shutdown(code = 0) {
  server.close()                  // stop new connections
  await worker.close()            // finish current BullMQ job
  await mongoose.disconnect()
  await redis.quit()
  process.exit(code)
}
process.on('SIGTERM', () => shutdown(0))
setTimeout(() => process.exit(1), 10_000).unref() // hard limit
`,
    },
    {
      q: 'How would you find a memory leak in a Node app?',
      level: 'advanced',
      a: "- Watch memory over time (`process.memoryUsage()`, your monitoring). A leak shows as heap growing steadily and never dropping after garbage collection.\n- Take heap snapshots a few minutes apart (Chrome DevTools via `node --inspect`, or `heapdump`) and compare which objects keep growing.\n- Usual causes: caches or maps that never evict, event listeners added per request and never removed, closures holding large objects, global arrays used as logs, timers never cleared.",
    },
    {
      q: 'How did you use Playwright for scraping in Node, and what are the pitfalls?',
      level: 'mid',
      a: "Relevant to your SEO Analyzer and Instagram tools. Points worth making:\n- Launch the browser once and reuse contexts or pages; launching per job is slow and heavy on memory.\n- Always close pages and contexts in `finally`, or memory leaks.\n- Wait for the right signal (`waitForSelector`, network idle) instead of fixed sleeps.\n- Limit concurrency (BullMQ concurrency setting), because each page uses real memory and CPU.\n- Set timeouts and retries with backoff; sites are slow and flaky.\n- Respect robots.txt, rate limits and terms of service.",
    },
  ],
}
