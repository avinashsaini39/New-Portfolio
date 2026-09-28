import { memo, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import GithubSlugger from 'github-slugger'
import 'highlight.js/styles/github-dark.css'
import type { Element, ElementContent } from 'hast'
import Diagram from '../components/Diagram'
import { chapters, parts, type Chapter } from '../data/book'

const LAST_KEY = 'book:last'
const SIZE_KEY = 'book:size'
const sizes = ['prose-base', 'prose-lg', 'prose-xl'] as const

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage blocked: the preference just won't persist.
  }
}

type Heading = { depth: 2 | 3; text: string; id: string }

const textOf = (nodes: ElementContent[]): string =>
  nodes.map((n) => (n.type === 'text' ? n.value : n.type === 'element' ? textOf(n.children) : '')).join('')

// A ```mermaid block is drawn as a diagram. A first line starting with "%%" becomes its caption.
function diagramSource(pre: Element | undefined) {
  const code = pre?.children[0]
  if (code?.type !== 'element' || code.tagName !== 'code') return null
  const cls = code.properties.className
  if (!Array.isArray(cls) || !cls.includes('language-mermaid')) return null
  const src = textOf(code.children)
  const [first, ...rest] = src.split('\n')
  return first.trim().startsWith('%%') ? { chart: rest.join('\n'), caption: first.trim().slice(2).trim() } : { chart: src }
}

// Mirror rehype-slug: same slugger, same text (inline markdown stripped), code blocks skipped.
function headingsOf(md: string): Heading[] {
  const slugger = new GithubSlugger()
  const out: Heading[] = []
  let fenced = false
  for (const line of md.split('\n')) {
    if (line.trimStart().startsWith('```')) fenced = !fenced
    if (fenced) continue
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!m) continue
    const text = m[2].replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) })
  }
  return out
}

const minutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).length / 220))

// Defined once at module level: if these were created during render, react-markdown would see a
// new component type for <pre> on every render and remount every diagram (they'd flicker on scroll).
const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeSlug, [rehypeHighlight, { detect: false, plainText: ['mermaid', 'text'] }]] as Parameters<typeof Markdown>[0]['rehypePlugins']
const markdownComponents: Components = {
  // Code keeps its own dark panel; drop highlight.js's background so the prose one shows.
  pre: ({ node, children }) => {
    const diagram = diagramSource(node)
    if (diagram) return <Diagram chart={diagram.chart} caption={diagram.caption} />
    return <pre className="[&_.hljs]:bg-transparent [&_.hljs]:p-0">{children}</pre>
  },
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) =>
    href?.startsWith('http') ? (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
}

// Parsing and highlighting a chapter is expensive, so it only happens when the content changes.
const ChapterBody = memo(function ChapterBody({ content }: { content: string }) {
  return (
    <Markdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={markdownComponents}>
      {content}
    </Markdown>
  )
})

// Updates the bar directly on each animation frame: no React state, so scrolling never re-renders the page.
function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = target.current
      if (!el || !bar.current) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
      bar.current.style.transform = 'scaleX(' + p + ')'
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Diagrams render after load and change the article's height.
    const resize = new ResizeObserver(schedule)
    if (target.current) resize.observe(target.current)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resize.disconnect()
    }
  }, [target])
  return <div ref={bar} className="h-0.5 origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
}

// "On this page" with its own state, so highlighting a section doesn't re-render the article.
function Outline({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    els.forEach((e) => observer.observe(e))
    return () => observer.disconnect()
  }, [headings])
  return (
    <ul className="space-y-1 border-l border-line">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={'#' + h.id}
            className={`-ml-px block border-l py-1 text-sm leading-snug transition-colors ${h.depth === 3 ? 'pl-7' : 'pl-4'} ${active === h.id ? 'border-accent text-paper' : 'border-transparent text-faint hover:text-paper'}`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

function ChapterList({ active, onPick }: { active: Chapter; onPick?: () => void }) {
  return (
    <nav className="space-y-7">
      {parts.map((part) => (
        <div key={part}>
          <p className="mb-2 px-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">{part}</p>
          <ul className="space-y-0.5">
            {chapters
              .filter((c) => c.part === part)
              .map((c) => {
                const on = c.id === active.id
                return (
                  <li key={c.id}>
                    <Link
                      to={'/book/' + c.id}
                      onClick={onPick}
                      className={`relative flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${on ? 'bg-white/[0.07] text-paper' : 'text-dim hover:bg-white/[0.04] hover:text-paper'}`}
                    >
                      {on && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
                      <span className="w-5 shrink-0 font-mono text-[0.7rem] text-faint">{String(c.number).padStart(2, '0')}</span>
                      <span>{c.title}</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function Book() {
  const { chapterId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const chapter = chapters.find((c) => c.id === chapterId)

  const [size, setSize] = useState(() => Math.min(2, Math.max(0, Number(read(SIZE_KEY) ?? 1))))
  const [drawer, setDrawer] = useState(false)
  const article = useRef<HTMLElement>(null)

  const headings = useMemo(() => (chapter ? headingsOf(chapter.content) : []), [chapter])

  // Remember the chapter, and start each chapter at the top (or at the linked heading).
  useEffect(() => {
    if (!chapter) return
    write(LAST_KEY, chapter.id)
    document.title = chapter.title + ' — The Full-Stack Handbook'
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0 })
    // Only when the chapter changes, not on every in-page anchor jump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id])

  if (!chapter) {
    const last = chapters.find((c) => c.id === read(LAST_KEY)) ?? chapters[0]
    return <Navigate to={'/book/' + last.id} replace />
  }

  const idx = chapters.indexOf(chapter)
  const prev = chapters[idx - 1]
  const next = chapters[idx + 1]

  const changeSize = (d: number) => {
    const n = Math.min(2, Math.max(0, size + d))
    setSize(n)
    write(SIZE_KEY, String(n))
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[100rem] items-center gap-4 px-4 md:px-8">
          <Link to="/" className="shrink-0 text-sm text-dim transition-colors hover:text-paper">
            ← <span className="hidden sm:inline">Avinash Saini</span>
          </Link>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <p className="truncate text-sm font-medium text-paper">
            The Full-Stack <span className="font-serif text-base italic text-accent">Handbook</span>
          </p>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => changeSize(-1)} disabled={size === 0} className="h-8 w-8 rounded-full text-sm text-dim transition hover:text-paper disabled:opacity-30" aria-label="Smaller text">
              A−
            </button>
            <button onClick={() => changeSize(1)} disabled={size === 2} className="h-8 w-8 rounded-full text-base text-dim transition hover:text-paper disabled:opacity-30" aria-label="Larger text">
              A+
            </button>
            <button onClick={() => setDrawer(true)} className="ml-2 rounded-full border border-line px-3 py-1.5 text-sm text-paper lg:hidden">
              Chapters
            </button>
          </div>
        </div>
        <ReadingProgress target={article} />
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close chapters" className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-ink py-6 pr-3">
            <div className="mb-5 flex items-center justify-between px-3">
              <p className="text-sm text-paper">Chapters</p>
              <button onClick={() => setDrawer(false)} className="text-sm text-dim">
                Close
              </button>
            </div>
            <ChapterList active={chapter} onPick={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[100rem] gap-10 px-4 md:px-8">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto overscroll-contain py-8 pr-2 lg:block">
          <ChapterList active={chapter} />
        </aside>

        <main className="min-w-0 flex-1 pb-24 pt-10 md:pt-14">
          <article ref={article} className="mx-auto max-w-3xl">
            <header className="mb-12 border-b border-line pb-10">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">
                {chapter.part} · Chapter {chapter.number}
              </p>
              <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-paper md:text-6xl">{chapter.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-dim">{chapter.summary}</p>
              <p className="mt-5 text-sm text-faint">
                {minutes(chapter.content)} min read · {headings.filter((h) => h.depth === 2).length} sections
              </p>
            </header>

            <div
              className={`prose prose-invert max-w-none ${sizes[size]}
                prose-headings:scroll-mt-24 prose-headings:font-medium prose-headings:tracking-[-0.02em] prose-headings:text-paper
                prose-h2:mt-16 prose-h2:border-t prose-h2:border-line prose-h2:pt-10
                prose-p:text-paper/85 prose-li:text-paper/85 prose-strong:text-paper
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-code:rounded prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-paper prose-code:before:content-none prose-code:after:content-none
                prose-pre:rounded-xl prose-pre:border prose-pre:border-line prose-pre:bg-[#0c0c0c] prose-pre:text-[0.85em]
                prose-blockquote:rounded-r-xl prose-blockquote:border-l-accent prose-blockquote:bg-accent/[0.06] prose-blockquote:py-1 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-paper/90 [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none
                prose-th:text-paper prose-td:text-paper/80 prose-hr:border-line`}
            >
              <ChapterBody content={chapter.content} />
            </div>

            <nav className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
              {prev ? (
                <button onClick={() => navigate('/book/' + prev.id)} className="rounded-2xl border border-line p-5 text-left transition hover:border-white/30">
                  <span className="block text-xs text-faint">← Previous</span>
                  <span className="mt-1 block text-paper">{prev.title}</span>
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button onClick={() => navigate('/book/' + next.id)} className="rounded-2xl border border-line p-5 text-right transition hover:border-white/30">
                  <span className="block text-xs text-faint">Next →</span>
                  <span className="mt-1 block text-paper">{next.title}</span>
                </button>
              )}
            </nav>
          </article>
        </main>

        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 overflow-y-auto py-10 xl:block">
          <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">On this page</p>
          <Outline headings={headings} />
        </aside>
      </div>
    </div>
  )
}
