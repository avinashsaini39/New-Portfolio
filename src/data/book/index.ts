// The Full-Stack Handbook: one Markdown file per chapter in this folder.
//
// Writing a chapter: plain Markdown (GitHub flavour, so tables work). Use `##` for sections and `###`
// for sub-sections; they build the "On this page" outline. Use ```js / ```ts / ```bash fences for
// code, and `> **Tip:**` style blockquotes for callouts. A ```mermaid block becomes a diagram; start it with
// a `%% Caption text` line to give it a caption.

import auth from './auth.md?raw'
import devops from './devops.md?raw'
import dsa from './dsa.md?raw'
import express from './express.md?raw'
import git from './git.md?raw'
import htmlcss from './htmlcss.md?raw'
import javascript from './javascript.md?raw'
import mongodb from './mongodb.md?raw'
import nextjs from './nextjs.md?raw'
import node from './node.md?raw'
import postgres from './postgres.md?raw'
import react from './react.md?raw'
import realtime from './realtime.md?raw'
import redis from './redis.md?raw'
import state from './state.md?raw'
import systemDesign from './systemDesign.md?raw'
import testing from './testing.md?raw'
import typescript from './typescript.md?raw'
import web from './web.md?raw'

export const parts = ['Foundations', 'Frontend', 'Backend', 'Data', 'Shipping', 'Interviews'] as const
export type Part = (typeof parts)[number]

export type Chapter = {
  id: string
  number: number
  title: string
  part: Part
  summary: string
  content: string
}

// Reading order. Chapter numbers come from the position in this list.
const list: Omit<Chapter, 'number'>[] = [
  {
    id: 'javascript',
    title: 'JavaScript, Properly',
    part: 'Foundations',
    summary: 'Values and memory, scope and closures, this, prototypes, the event loop and async code: the layer underneath every framework you use.',
    content: javascript,
  },
  {
    id: 'typescript',
    title: 'TypeScript’s Type System',
    part: 'Foundations',
    summary: 'Structural typing, narrowing, discriminated unions, generics and utility types, and validating data at the edges where types can’t reach.',
    content: typescript,
  },
  {
    id: 'web',
    title: 'How the Web Works',
    part: 'Foundations',
    summary: 'From URL to pixels: DNS, HTTP, the rendering pipeline, events, storage, CORS, caching, browser security and Core Web Vitals.',
    content: web,
  },
  {
    id: 'html-css',
    title: 'HTML, CSS & Accessibility',
    part: 'Foundations',
    summary: 'Semantic markup, forms and accessibility, then the cascade, the box model, Flexbox and Grid, stacking contexts and responsive design.',
    content: htmlcss,
  },
  {
    id: 'git',
    title: 'Git & Team Workflow',
    part: 'Foundations',
    summary: 'How Git stores history, merge vs rebase, cleaning up and undoing mistakes, resolving conflicts, and pull requests people like reviewing.',
    content: git,
  },
  {
    id: 'react',
    title: 'React Under the Hood',
    part: 'Frontend',
    summary: 'What triggers a render, reconciliation and keys, state as a snapshot, the rules of hooks, when not to use effects, and finding slow renders.',
    content: react,
  },
  {
    id: 'state',
    title: 'State & Data Fetching',
    part: 'Frontend',
    summary: 'Client vs server state, Context, Zustand and Redux Toolkit, TanStack Query and RTK Query, optimistic updates, and the URL as state.',
    content: state,
  },
  {
    id: 'nextjs',
    title: 'Next.js App Router',
    part: 'Frontend',
    summary: 'Server and Client Components, rendering strategies, caching and revalidation, streaming, Server Actions, hydration and SEO.',
    content: nextjs,
  },
  {
    id: 'nodejs',
    title: 'Node.js Internals',
    part: 'Backend',
    summary: 'V8 and libuv, the event loop phases, not blocking the thread, streams and backpressure, workers and processes, and shutting down gracefully.',
    content: node,
  },
  {
    id: 'express',
    title: 'Express & API Design',
    part: 'Backend',
    summary: 'The middleware pipeline, a layered project structure, central error handling, validation, pagination, rate limits, idempotency and webhooks.',
    content: express,
  },
  {
    id: 'auth',
    title: 'Authentication & Security',
    part: 'Backend',
    summary: 'Password hashing, sessions vs JWTs, refresh token rotation, OAuth with PKCE, RBAC and multi-tenancy, and the attacks to defend against.',
    content: auth,
  },
  {
    id: 'realtime',
    title: 'Real-time Systems',
    part: 'Backend',
    summary: 'Polling, SSE and WebSockets, Socket.io rooms and auth, scaling with the Redis adapter, and a reliable live message pipeline.',
    content: realtime,
  },
  {
    id: 'mongodb',
    title: 'MongoDB in Depth',
    part: 'Data',
    summary: 'Modelling from access patterns, embed vs reference, compound indexes and explain(), aggregations, transactions, Mongoose, and scaling.',
    content: mongodb,
  },
  {
    id: 'postgresql',
    title: 'PostgreSQL & SQL',
    part: 'Data',
    summary: 'Relational modelling and constraints, joins to window functions, transactions and isolation, query plans, indexes, JSONB and migrations.',
    content: postgres,
  },
  {
    id: 'redis',
    title: 'Redis, Caching & Queues',
    part: 'Data',
    summary: 'Data types, cache-aside and invalidation, rate limits, pub/sub and locks, then job queues with BullMQ: retries, idempotency and concurrency.',
    content: redis,
  },
  {
    id: 'testing',
    title: 'Testing That Pays Off',
    part: 'Shipping',
    summary: 'What to test at which level, Vitest and React Testing Library, MSW, Supertest with a real database, Playwright, flaky tests, and adding tests to an untested codebase.',
    content: testing,
  },
  {
    id: 'devops',
    title: 'Docker, CI/CD & Production',
    part: 'Shipping',
    summary: 'Multi-stage Docker images, Compose, GitHub Actions pipelines, zero-downtime deploys, Nginx and HTTPS on AWS, and observability.',
    content: devops,
  },
  {
    id: 'system-design',
    title: 'System Design',
    part: 'Interviews',
    summary: 'A repeatable method, the building blocks of scalable systems, and five worked designs, from a URL shortener to a 100,000-contact WhatsApp campaign.',
    content: systemDesign,
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    part: 'Interviews',
    summary: 'Big-O, the core data structures, and the dozen patterns behind most coding-round problems, each with a JavaScript example.',
    content: dsa,
  },
]

export const chapters: Chapter[] = list.map((c, i) => ({ ...c, number: i + 1 }))
