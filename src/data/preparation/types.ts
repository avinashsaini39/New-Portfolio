// Interview preparation notes, following the learning roadmap (ROADMAP.md). Each topic lives in its
// own file in this folder and is listed in order in index.ts.
//
// Writing an answer:
// - `a` is plain text. A blank line starts a new paragraph, a line starting with "- " is a bullet,
//   and `backticks` mark inline code.
// - `code` is an optional example shown in a code block. It's a template literal, so escape
//   backticks and dollar-braces inside it (\` and \${).
// - `diagram` is an optional Mermaid diagram (flowchart, sequenceDiagram, gitGraph…) drawn under the answer.
// - `level` is how deep the question goes: basic, mid or advanced.

export type Level = 'basic' | 'mid' | 'advanced'

export type QA = {
  q: string
  a: string
  code?: string
  diagram?: string
  level: Level
}

export type Topic = {
  id: string
  title: string
  group: Group
  summary: string
  questions: QA[]
}

export const groups = ['Foundations', 'Frontend', 'Backend', 'Databases', 'Quality & Ops', 'Interview rounds'] as const
export type Group = (typeof groups)[number]
