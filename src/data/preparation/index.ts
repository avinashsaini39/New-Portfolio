import { auth } from './auth'
import { behavioral } from './behavioral'
import { browser } from './browser'
import { cs } from './cs'
import { css } from './css'
import { devops } from './devops'
import { dsa } from './dsa'
import { express } from './express'
import { git } from './git'
import { html } from './html'
import { javascript } from './javascript'
import { jsCoding } from './jsCoding'
import { mongodb } from './mongodb'
import { nextjs } from './nextjs'
import { node } from './node'
import { react } from './react'
import { realtime } from './realtime'
import { redis } from './redis'
import { sql } from './sql'
import { state } from './state'
import { systemDesign } from './systemDesign'
import { testing } from './testing'
import type { Topic } from './types'
import { typescript } from './typescript'

export { groups, type Group, type Level, type QA, type Topic } from './types'

// Sidebar order, following the roadmap phases. Topics are shown under their `group`, in this order.
export const topics: Topic[] = [
  // Phase 0: foundations
  javascript,
  typescript,
  html,
  css,
  browser,
  git,
  cs,
  // Phase 1 and 5: frontend
  react,
  state,
  nextjs,
  // Phase 2, 4 and 6: backend
  node,
  express,
  auth,
  realtime,
  // Phase 2: databases
  mongodb,
  sql,
  redis,
  // Phase 3 and 6: quality and ops
  testing,
  devops,
  // Phase 7 and 8: interview rounds
  jsCoding,
  dsa,
  systemDesign,
  behavioral,
]
