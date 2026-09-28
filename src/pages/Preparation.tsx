import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { groups, topics, type Level, type QA, type Topic } from '../data/preparation'
import Diagram from '../components/Diagram'

const STORAGE_KEY = 'prep:revised'

function loadRevised(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function saveRevised(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Private mode or blocked storage: progress just won't persist.
  }
}

const qid = (topic: Topic, i: number) => `${topic.id}:${i}`

// Answers are plain strings: blank lines split paragraphs, "- " starts a bullet, `backticks` mark inline code.
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.85em] text-paper">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  )
}

// Consecutive "- " lines become one list; any other lines become a paragraph.
function Answer({ text }: { text: string }) {
  type Part = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }
  const parts = text.split(/\n\s*\n/).flatMap((block) => {
    const out: Part[] = []
    for (const line of block.split('\n')) {
      const last = out[out.length - 1]
      const bullet = line.trim().startsWith('- ')
      if (bullet && last?.kind === 'ul') last.items.push(line.trim().slice(2))
      else if (bullet) out.push({ kind: 'ul', items: [line.trim().slice(2)] })
      else if (last?.kind === 'p') last.text += ' ' + line
      else out.push({ kind: 'p', text: line })
    }
    return out
  })
  return (
    <div className="space-y-3">
      {parts.map((part, i) =>
        part.kind === 'ul' ? (
          <ul key={i} className="space-y-1.5">
            {part.items.map((item, j) => (
              <li key={j} className="grid grid-cols-[1.1rem_1fr]">
                <span className="text-accent">•</span>
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{inline(part.text)}</p>
        ),
      )}
    </div>
  )
}

const levelStyle: Record<Level, string> = {
  basic: 'text-emerald-300 border-emerald-300/30',
  mid: 'text-amber-300 border-amber-300/30',
  advanced: 'text-rose-300 border-rose-300/30',
}

function QuestionCard({
  topic,
  qa,
  index,
  open,
  revised,
  onToggle,
  onRevised,
  showTopic,
}: {
  topic: Topic
  qa: QA
  index: number
  open: boolean
  revised: boolean
  onToggle: () => void
  onRevised: () => void
  showTopic?: boolean
}) {
  return (
    <li className={`rounded-2xl border transition-colors ${open ? 'border-white/20 bg-white/[0.03]' : 'border-line hover:border-white/20'}`}>
      <div className="flex items-start gap-3 p-4 md:p-5">
        <button onClick={onToggle} className="flex flex-1 items-start gap-4 text-left" aria-expanded={open}>
          <span className="mt-0.5 w-8 shrink-0 font-mono text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
          <span className="flex-1">
            {showTopic && <span className="mb-1 block text-xs text-accent">{topic.title}</span>}
            <span className={`block text-[1.02rem] leading-snug ${revised ? 'text-dim' : 'text-paper'}`}>{qa.q}</span>
          </span>
          <span className={`hidden shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.68rem] sm:inline ${levelStyle[qa.level]}`}>{qa.level}</span>
          <span className={`mt-0.5 shrink-0 text-faint transition-transform duration-300 ${open ? 'rotate-45 text-accent' : ''}`}>+</span>
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-4 pb-5 pt-4 md:px-5 md:pl-[4.25rem]">
          <div className="leading-relaxed text-paper/85">
            <Answer text={qa.a} />
          </div>
          {qa.diagram && <Diagram chart={qa.diagram} />}
          {qa.code && (
            <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-[#0c0c0c] p-4 font-mono text-[0.82rem] leading-relaxed text-paper/90">
              <code>{qa.code.trim()}</code>
            </pre>
          )}
          <label className="mt-4 inline-flex cursor-pointer select-none items-center gap-2 text-sm text-dim">
            <input type="checkbox" checked={revised} onChange={onRevised} className="h-4 w-4 accent-[var(--color-accent)]" />
            Revised
          </label>
        </div>
      )}
    </li>
  )
}

export default function Preparation() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeId = location.hash.slice(1) || topics[0].id
  const topic = topics.find((t) => t.id === activeId) ?? topics[0]

  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<Level | 'all'>('all')
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [revised, setRevised] = useState<Set<string>>(loadRevised)
  const [drawer, setDrawer] = useState(false)
  const search = useRef<HTMLInputElement>(null)
  const content = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Interview preparation — Avinash Saini'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== search.current) {
        e.preventDefault()
        search.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const total = useMemo(() => topics.reduce((n, t) => n + t.questions.length, 0), [])

  const q = query.trim().toLowerCase()
  const matches = (qa: QA) => (level === 'all' || qa.level === level) && (!q || qa.q.toLowerCase().includes(q) || qa.a.toLowerCase().includes(q))

  // With a search query we look across every topic; otherwise just the selected one.
  const visible = useMemo(() => {
    const scope = q ? topics : [topic]
    return scope.flatMap((t) => t.questions.map((qa, i) => ({ t, qa, i })).filter(({ qa }) => matches(qa)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, level, topic])

  const selectTopic = (id: string) => {
    setQuery('')
    setDrawer(false)
    navigate({ hash: id })
    content.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const toggleRevised = (id: string) =>
    setRevised((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      saveRevised(n)
      return n
    })

  const allOpen = visible.length > 0 && visible.every(({ t, i }) => open.has(qid(t, i)))
  const setAll = (value: boolean) =>
    setOpen((s) => {
      const n = new Set(s)
      visible.forEach(({ t, i }) => (value ? n.add(qid(t, i)) : n.delete(qid(t, i))))
      return n
    })

  const revisedIn = (t: Topic) => t.questions.filter((_, i) => revised.has(qid(t, i))).length

  const sidebar = (
    <nav className="space-y-7">
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-2 px-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">{g}</p>
          <ul className="space-y-0.5">
            {topics
              .filter((t) => t.group === g)
              .map((t) => {
                const done = revisedIn(t)
                const active = t.id === topic.id && !q
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => selectTopic(t.id)}
                      className={`group relative flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-white/[0.07] text-paper' : 'text-dim hover:bg-white/[0.04] hover:text-paper'}`}
                    >
                      {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
                      <span>{t.title}</span>
                      <span className="font-mono text-[0.7rem] text-faint">
                        {done > 0 ? `${done}/` : ''}
                        {t.questions.length}
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[100rem] items-center gap-4 px-4 md:px-8">
          <Link to="/" className="shrink-0 text-sm text-dim transition-colors hover:text-paper">
            ← <span className="hidden sm:inline">Avinash Saini</span>
          </Link>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <h1 className="shrink-0 text-sm font-medium text-paper">
            Interview <span className="font-serif text-base italic text-accent">prep</span>
          </h1>
          <div className="relative ml-auto w-full max-w-sm">
            <input
              ref={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all questions…"
              className="h-9 w-full rounded-full border border-line bg-white/[0.04] px-4 pr-10 text-sm text-paper outline-none transition placeholder:text-faint focus:border-white/30"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[0.65rem] text-faint sm:block">/</kbd>
          </div>
          <button onClick={() => setDrawer(true)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm text-paper lg:hidden">
            Topics
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[100rem] gap-10 px-4 md:px-8">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto overscroll-contain py-8 pr-2 lg:block">
          <div className="mb-6 px-3">
            <p className="text-sm text-dim">
              <span className="text-paper">{revised.size}</span> of {total} revised
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(revised.size / total) * 100}%` }} />
            </div>
          </div>
          {sidebar}
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close topics" className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-ink py-6 pr-3">
              <div className="mb-5 flex items-center justify-between px-3">
                <p className="text-sm text-paper">Topics</p>
                <button onClick={() => setDrawer(false)} className="text-sm text-dim">
                  Close
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main ref={content} className="min-w-0 flex-1 pb-24 pt-8 md:pt-12">
          <div className="mb-8 border-b border-line pb-8">
            {q ? (
              <>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">Search</p>
                <h2 className="mt-3 text-3xl tracking-[-0.03em] text-paper md:text-5xl">
                  {visible.length} result{visible.length === 1 ? '' : 's'} for <span className="font-serif italic text-accent">“{query.trim()}”</span>
                </h2>
              </>
            ) : (
              <>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">{topic.group}</p>
                <h2 className="mt-3 text-4xl tracking-[-0.035em] text-paper md:text-6xl">{topic.title}</h2>
                <p className="mt-4 max-w-3xl leading-relaxed text-dim">{topic.summary}</p>
                <p className="mt-4 text-sm text-faint">
                  {topic.questions.length} questions · {revisedIn(topic)} revised
                </p>
              </>
            )}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            {(['all', 'basic', 'mid', 'advanced'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${level === l ? 'border-paper bg-paper text-ink' : 'border-line text-dim hover:text-paper'}`}
              >
                {l}
              </button>
            ))}
            <button onClick={() => setAll(!allOpen)} className="link ml-auto text-sm text-dim hover:text-paper">
              {allOpen ? 'Hide all answers' : 'Show all answers'}
            </button>
          </div>

          {visible.length === 0 ? (
            <p className="py-16 text-center text-dim">Nothing matches. Try a different word or level.</p>
          ) : (
            <ol className="space-y-3">
              {visible.map(({ t, qa, i }) => {
                const id = qid(t, i)
                return (
                  <QuestionCard
                    key={id}
                    topic={t}
                    qa={qa}
                    index={i}
                    open={open.has(id)}
                    revised={revised.has(id)}
                    onToggle={() => toggle(id)}
                    onRevised={() => toggleRevised(id)}
                    showTopic={!!q}
                  />
                )
              })}
            </ol>
          )}

          {!q && (
            <div className="mt-12 flex justify-between gap-4 border-t border-line pt-6 text-sm">
              {(() => {
                const idx = topics.indexOf(topic)
                const prev = topics[idx - 1]
                const next = topics[idx + 1]
                return (
                  <>
                    {prev ? (
                      <button onClick={() => selectTopic(prev.id)} className="text-left text-dim hover:text-paper">
                        <span className="block text-xs text-faint">Previous</span>← {prev.title}
                      </button>
                    ) : (
                      <span />
                    )}
                    {next && (
                      <button onClick={() => selectTopic(next.id)} className="text-right text-dim hover:text-paper">
                        <span className="block text-xs text-faint">Next</span>
                        {next.title} →
                      </button>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
