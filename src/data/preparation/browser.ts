import type { Topic } from './types'

export const browser: Topic = {
  id: 'browser',
  title: 'Browser & Web',
  group: 'Foundations',
  summary: 'How a page gets rendered, how requests travel, HTTP, caching, cookies and storage, and CORS, which will bite you in every project.',
  questions: [
    {
      q: 'What happens when you type a URL and press Enter?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant B as Browser
  participant D as DNS
  participant S as Server
  B->>D: Resolve domain
  D-->>B: IP address
  B->>S: TCP + TLS handshake
  B->>S: GET /page
  S-->>B: HTML
  Note over B: Parse, fetch CSS/JS,<br/>layout, paint, run JS
`,
      a: "- DNS lookup: the domain is turned into an IP address (checking caches first).\n- A TCP connection is opened, then a TLS handshake for HTTPS.\n- The browser sends an HTTP request; the server (maybe via a CDN or load balancer) runs code, queries a database and responds.\n- The browser parses HTML into the DOM and CSS into the CSSOM, loading scripts, styles and images along the way.\n- It builds the render tree, calculates layout, paints and composites the page.\n- JavaScript runs and makes the page interactive.",
    },
    {
      q: 'Explain the critical rendering path.',
      level: 'mid',
      diagram: `
flowchart LR
  H["HTML"] --> DOM["DOM"]
  C["CSS"] --> CSSOM["CSSOM"]
  DOM --> RT["Render tree"]
  CSSOM --> RT
  RT --> L["Layout"] --> P["Paint"] --> CO["Composite"]
`,
      a: "The steps from bytes to pixels: HTML → DOM, CSS → CSSOM, DOM + CSSOM → render tree, then layout (sizes and positions), paint (pixels), and composite (layers combined on the GPU).\n\nCSS blocks rendering, and normal `<script>` tags block HTML parsing. That's why you inline critical CSS and use `defer` or `async` on scripts.",
    },
    {
      q: 'What is the difference between reflow and repaint?',
      level: 'mid',
      a: "- Reflow (layout): recalculating sizes and positions. Caused by changing width, height, fonts, content, or adding and removing elements. Expensive, and it can ripple through the page.\n- Repaint: redrawing pixels without changing layout, like changing colour or background. Cheaper.\n- Composite-only: `transform` and `opacity` changes, the cheapest.",
    },
    {
      q: 'What is layout thrashing?',
      level: 'advanced',
      a: "Alternating DOM reads (like `offsetHeight`) and writes (like setting `style.height`) in a loop. Each read after a write forces the browser to recalculate layout immediately. Fix it by doing all reads first, then all writes, or batching writes in `requestAnimationFrame`.",
      code: `
// Bad: forces layout on every iteration
items.forEach((el) => { el.style.height = el.offsetWidth + 'px' })

// Good: read everything, then write everything
const widths = items.map((el) => el.offsetWidth)
items.forEach((el, i) => { el.style.height = widths[i] + 'px' })
`,
    },
    {
      q: 'async vs defer on script tags?',
      level: 'basic',
      a: "- No attribute: HTML parsing stops while the script downloads and runs.\n- `async`: downloads in parallel, runs as soon as it arrives (order not guaranteed). Good for independent scripts like analytics.\n- `defer`: downloads in parallel, runs after HTML parsing finishes, in order. Good for your app code.\n\n`type=\"module\"` scripts are deferred by default.",
    },
    {
      q: 'What do the common HTTP methods mean?',
      level: 'basic',
      a: "- `GET`: read. Safe and idempotent.\n- `POST`: create, or trigger an action. Not idempotent.\n- `PUT`: replace a resource completely. Idempotent.\n- `PATCH`: update part of a resource.\n- `DELETE`: remove. Idempotent.\n\nIdempotent means doing it twice has the same effect as doing it once.",
    },
    {
      q: 'Which HTTP status codes should you know?',
      level: 'basic',
      a: "- 200 OK, 201 Created, 204 No Content.\n- 301 Moved Permanently, 302 Found (temporary), 304 Not Modified (use the cached copy).\n- 400 Bad Request (invalid input), 401 Unauthorized (not logged in), 403 Forbidden (logged in but not allowed), 404 Not Found, 409 Conflict, 422 Unprocessable (validation), 429 Too Many Requests.\n- 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.",
    },
    {
      q: 'What is CORS and why does it exist?',
      level: 'mid',
      diagram: `
flowchart LR
  P["Page on app.com"] -- "fetch api.com/data" --> B{"Browser: does api.com<br/>allow app.com?"}
  B -- "Access-Control-Allow-Origin: app.com" --> OK["JS can read the response"]
  B -- "header missing" --> X["CORS error (response hidden)"]
`,
      a: "Browsers follow the same-origin policy: a page from `app.com` can't read responses from `api.com` (different origin = different scheme, domain or port) unless `api.com` allows it.\n\nCORS is how the server allows it, using response headers like `Access-Control-Allow-Origin: https://app.com`. It protects users: without it, any site you visit could read your bank's API using your cookies.\n\nCORS is enforced by the browser, not the server. Postman and curl ignore it.",
    },
    {
      q: 'What is a CORS preflight request?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: OPTIONS /campaigns (Origin, method, headers)
  A-->>B: 204 Allow-Origin, Allow-Methods, Allow-Headers
  B->>A: POST /campaigns (the real request)
  A-->>B: 201 + Access-Control-Allow-Origin
`,
      a: "For 'non-simple' requests (methods like PUT/DELETE, a JSON content type, or custom headers like `Authorization`), the browser first sends an `OPTIONS` request asking permission. The server must answer with the allowed origin, methods and headers. Only then is the real request sent. `Access-Control-Max-Age` lets the browser cache that answer.",
    },
    {
      q: 'Why does CORS fail with credentials and a wildcard origin?',
      level: 'advanced',
      a: "To send cookies cross-origin, the request needs `credentials: 'include'` and the server must respond with `Access-Control-Allow-Credentials: true` and an exact origin. `Access-Control-Allow-Origin: *` is not allowed with credentials. The fix is to echo back the request's origin after checking it against an allow-list.",
      code: `
import cors from 'cors'

app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true,
}))
`,
    },
    {
      q: 'Cookies vs localStorage vs sessionStorage?',
      level: 'basic',
      a: "- Cookies: small (about 4KB), sent automatically with every request to that domain. Can be `HttpOnly` (hidden from JavaScript), `Secure` and `SameSite`. Best for session and refresh tokens.\n- localStorage: about 5MB, stays until cleared, readable by any JavaScript on the page (so exposed to XSS). Never sent to the server automatically.\n- sessionStorage: like localStorage but per tab, and cleared when the tab closes.",
    },
    {
      q: 'What do the SameSite, HttpOnly and Secure cookie flags do?',
      level: 'mid',
      a: "- `HttpOnly`: JavaScript can't read the cookie, which protects it from XSS.\n- `Secure`: only sent over HTTPS.\n- `SameSite=Strict`: never sent on cross-site requests. `Lax` (the default): sent on top-level navigations like clicking a link, not on cross-site POSTs or iframes. `None`: always sent, requires `Secure`. SameSite is the main modern defence against CSRF.",
    },
    {
      q: 'How does HTTP caching work?',
      level: 'mid',
      diagram: `
flowchart TD
  R["Need a file"] --> C{"Cached?"}
  C -- "no" --> F["Download (200)"]
  C -- "yes" --> FR{"Fresh (max-age)?"}
  FR -- "yes" --> U["Use cache, no request"]
  FR -- "no" --> V["Ask with If-None-Match"]
  V --> CH{"Changed?"}
  CH -- "no" --> N["304: reuse cache"]
  CH -- "yes" --> F
`,
      a: "- `Cache-Control: max-age=3600`: the browser can reuse the response for an hour without asking.\n- `no-cache`: store it, but check with the server every time. `no-store`: never store it.\n- `ETag` / `Last-Modified`: the browser asks 'has this changed?' with `If-None-Match`, and the server replies `304 Not Modified` with no body if not.\n\nCommon setup: hashed file names (`app.3f9a.js`) with `max-age=31536000, immutable`, and `index.html` with `no-cache`.",
    },
    {
      q: 'What does TLS/HTTPS actually protect?',
      level: 'mid',
      a: "TLS encrypts traffic so others on the network can't read or change it, and the certificate proves you're talking to the real server. It doesn't hide which domain you're visiting from the network, and it doesn't protect data once it's on the server.",
    },
    {
      q: 'What are Core Web Vitals?',
      level: 'mid',
      a: "Google's user-experience metrics:\n\n- LCP (Largest Contentful Paint): how fast the main content shows. Aim for under 2.5s.\n- INP (Interaction to Next Paint): how quickly the page responds to clicks and taps. Aim for under 200ms.\n- CLS (Cumulative Layout Shift): how much content jumps around. Aim for under 0.1.\n\nFixes: optimise the hero image and fonts (LCP), break up long JavaScript tasks (INP), reserve space for images and ads (CLS).",
    },
    {
      q: 'How do lazy loading and code splitting improve performance?',
      level: 'mid',
      a: "Code splitting breaks the JavaScript bundle into chunks so the first page only downloads what it needs; other routes load on demand with dynamic `import()`. Lazy loading images (`loading=\"lazy\"`) delays offscreen images until the user scrolls near them. Both reduce initial download and parse time. This is how the SRV IT pages reached 95+ Lighthouse scores.",
      code: `
const Settings = React.lazy(() => import('./pages/Settings'))

<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>
`,
    },
    {
      q: 'What are web workers?',
      level: 'advanced',
      a: "Web workers run JavaScript on a separate thread, so heavy computation (parsing a big file, image processing) doesn't freeze the UI. They can't touch the DOM and communicate with the page through `postMessage`.",
    },
    {
      q: 'What is a CDN?',
      level: 'basic',
      a: "A Content Delivery Network stores copies of your static files (and sometimes API responses) on servers around the world, so users download from somewhere close. This lowers latency and takes load off your origin server.",
    },
  ],
}
