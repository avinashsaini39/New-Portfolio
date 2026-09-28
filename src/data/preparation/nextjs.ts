import type { Topic } from './types'

export const nextjs: Topic = {
  id: 'nextjs',
  title: 'Next.js',
  group: 'Frontend',
  summary:
    'App Router, Server vs Client Components, rendering strategies (SSR, SSG, ISR), caching and revalidation, Server Actions and SEO. Prove it or drop it from the resume.',
  questions: [
    {
      q: 'Why use Next.js instead of plain React with Vite?',
      level: 'basic',
      a: "Next.js adds what a plain React SPA lacks:\n- Server rendering and static generation, so pages arrive as HTML: better SEO and faster first paint.\n- File-based routing with layouts.\n- Server Components and Server Actions, so you can fetch data and handle forms without writing a separate API.\n- Built-in image, font and script optimisation.\n- API routes (Route Handlers) in the same project.\n\nFor a logged-in dashboard where SEO doesn't matter, Vite + React is often simpler.",
    },
    {
      q: 'How does routing work in the App Router?',
      level: 'basic',
      a: "Folders inside `app/` become URL segments. A `page.tsx` makes a segment publicly visible. Special files add behaviour: `layout.tsx` (shared UI that persists), `loading.tsx` (a Suspense fallback), `error.tsx` (an error boundary), `not-found.tsx`. Dynamic segments use brackets: `app/blog/[slug]/page.tsx`. Folders in parentheses like `(marketing)` group routes without affecting the URL.",
    },
    {
      q: 'What is the difference between Server Components and Client Components?',
      level: 'mid',
      diagram: `
flowchart TD
  subgraph Server["Server only (no JS shipped)"]
    P["page.tsx: async, reads DB"] --> T["Table (server)"]
  end
  subgraph Client["Hydrated in the browser"]
    F["Filters ('use client')"]
  end
  P --> F
`,
      a: "- Server Components (the default in `app/`): run only on the server. They can be `async`, read databases and secrets directly, and send no JavaScript for themselves to the browser. They can't use state, effects, event handlers or browser APIs.\n- Client Components (`\"use client\"` at the top of the file): rendered on the server for the first HTML, then hydrated in the browser so they're interactive. Needed for `useState`, `useEffect`, `onClick` and browser APIs.\n\nThe goal: keep most of the tree on the server and push `\"use client\"` down to small interactive leaves.",
    },
    {
      q: 'What are the rules at the server/client boundary?',
      level: 'advanced',
      a: "- `\"use client\"` marks a boundary: that file and everything it imports becomes client code.\n- A Client Component can't import a Server Component, but it can receive one as `children` or another prop from a Server Component parent.\n- Props passed from server to client must be serialisable: plain data, not functions (except Server Actions), class instances or Dates in older versions.\n- Keep secrets and database code in files marked `import 'server-only'` so they error if accidentally imported on the client.",
      code: `
// Server Component
export default async function Page() {
  const campaigns = await db.campaign.findMany()
  return (
    <ClientTabs>                 {/* client component */}
      <CampaignTable data={campaigns} />  {/* server component passed as children */}
    </ClientTabs>
  )
}
`,
    },
    {
      q: 'SSR vs SSG vs ISR vs CSR: when do you choose each?',
      level: 'mid',
      diagram: `
flowchart TD
  Q{"Does the page need SEO / fast first view?"} -- "no" --> CSR["CSR: fetch in the browser"]
  Q -- "yes" --> F{"How fresh must it be?"}
  F -- "changes only on deploy" --> SSG["SSG: build once"]
  F -- "every few minutes is fine" --> ISR["ISR: revalidate in background"]
  F -- "always fresh / per user" --> SSR["SSR: render per request"]
`,
      a: "- SSG (static): HTML built once at build time. Fastest and cheapest. For marketing pages, docs, blogs.\n- ISR (incremental static regeneration): static, but regenerated in the background after a time or on demand. For product or listing pages that change occasionally.\n- SSR (server-side rendering per request): always fresh, and can be personalised. For dashboards with SEO needs or per-user pages. Costs server time on every request.\n- CSR (client-side rendering): the browser fetches data after load. For highly interactive, logged-in screens where SEO doesn't matter.",
    },
    {
      q: 'How does data fetching and caching work in the App Router?',
      level: 'advanced',
      a: "In Server Components you just `await fetch()` or query the database. You control freshness per request or per route:\n- `fetch(url, { cache: 'force-cache' })`: cache it (static).\n- `fetch(url, { next: { revalidate: 60 } })`: reuse for 60 seconds, then refresh in the background (ISR).\n- `fetch(url, { cache: 'no-store' })` or `export const dynamic = 'force-dynamic'`: fresh on every request.\n- `revalidatePath('/campaigns')` or `revalidateTag('campaigns')`: clear the cache on demand, typically after a mutation.\n\nCaching defaults have changed between Next versions (15 made `fetch` uncached by default), so check the version you're on.",
    },
    {
      q: 'What are Server Actions?',
      level: 'mid',
      a: "Async functions marked `\"use server\"` that run on the server but can be called from a form or a client component like a normal function. Next creates the POST endpoint for you. They're good for form submissions and mutations, and can call `revalidatePath` so the page shows fresh data. Always validate input and check auth inside them: they're public endpoints.",
      code: `
// app/contacts/actions.ts
'use server'
export async function createContact(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  const data = ContactSchema.parse(Object.fromEntries(formData))
  await db.contact.create({ data: { ...data, orgId: session.orgId } })
  revalidatePath('/contacts')
}

// In a component
<form action={createContact}>...</form>
`,
    },
    {
      q: 'What are Route Handlers?',
      level: 'basic',
      a: "Files named `route.ts` inside `app/` that export functions named after HTTP methods (`GET`, `POST`, ...). They're Next's version of API routes, useful for webhooks, third-party callers, or anything that isn't a form mutation.",
      code: `
// app/api/webhooks/whatsapp/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  await queue.add('incoming-message', body)
  return Response.json({ ok: true })
}
`,
    },
    {
      q: 'What does loading.tsx do?',
      level: 'basic',
      a: "It wraps the page segment in a Suspense boundary automatically. While the Server Component awaits its data, users see the loading UI immediately, and the page streams in when ready. You can add more `<Suspense>` boundaries inside a page to stream slow sections separately.",
    },
    {
      q: 'What is hydration, and what causes a hydration mismatch?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant S as Server
  participant B as Browser
  S-->>B: HTML rendered on the server
  Note over B: Page visible, not yet interactive
  B->>B: Load JS, React renders again
  alt same output
    B->>B: Attach events: interactive
  else different (Date.now, window checks)
    B->>B: Hydration mismatch warning
  end
`,
      a: "Hydration is React attaching event handlers and state to HTML that was rendered on the server. It expects the first client render to produce exactly the same HTML.\n\nMismatches come from rendering things that differ between server and browser: `Date.now()`, `Math.random()`, `window` checks, locale-dependent formatting, or invalid HTML nesting (a `div` inside a `p`). Fix by moving browser-only values into `useEffect`, or rendering them only on the client.",
    },
    {
      q: 'How do you handle SEO in Next.js?',
      level: 'mid',
      a: "- Export `metadata` or `generateMetadata` from pages and layouts for titles, descriptions, canonical URLs and Open Graph tags.\n- Add `app/sitemap.ts` and `app/robots.ts` to generate those files.\n- Use static or ISR rendering so crawlers get full HTML.\n- Use `next/image` (correct sizes, lazy loading, modern formats) and `next/font` (no layout shift) for Core Web Vitals.\n- Add structured data (JSON-LD) where it helps.\n\nWith your SEO Analyzer background, you can talk about the specific checks your tool ran and how Next satisfies them.",
      code: `
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: '/blog/' + post.slug },
    openGraph: { images: [post.cover] },
  }
}
`,
    },
    {
      q: 'What does middleware do in Next.js?',
      level: 'mid',
      a: "`middleware.ts` runs before a request is matched to a route, on the edge. Common uses: redirecting unauthenticated users, rewriting URLs, A/B testing, and setting headers. Keep it light: it runs on every matched request. It's a first gate, not a replacement for checking auth in the data layer.",
    },
    {
      q: 'What does next/image do for you?',
      level: 'basic',
      a: "It serves images resized for each device, in modern formats like WebP/AVIF, lazy-loads offscreen images, and requires width and height (or `fill`) so space is reserved and the layout doesn't jump. Mark the main above-the-fold image with `priority` to improve LCP.",
    },
    {
      q: 'How would you deploy a Next.js app outside Vercel?',
      level: 'mid',
      a: "Set `output: 'standalone'` in `next.config` to get a minimal Node server with only the needed dependencies, build a Docker image from it, and run it on EC2 (or ECS) behind Nginx or a load balancer. Serve static assets through a CDN. Features like ISR need a shared cache if you run several instances.",
    },
  ],
}
