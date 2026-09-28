import { useEffect, useId, useState } from 'react'

type Mermaid = typeof import('mermaid').default

// useMaxWidth: false draws diagrams at their natural size; wide ones scroll instead of shrinking to unreadable text.
const perDiagram = { theme: 'base', look: 'classic', useMaxWidth: false }

// Mermaid is large, so it's loaded on first use and configured once, in the site's dark palette.
let loader: Promise<Mermaid> | null = null
function loadMermaid() {
  loader ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#0a0a0a',
        fontSize: '14px',
        primaryColor: '#161616',
        primaryTextColor: '#ececea',
        primaryBorderColor: '#ff6a3d',
        secondaryColor: '#1f1f1f',
        secondaryTextColor: '#ececea',
        secondaryBorderColor: '#5c5c59',
        tertiaryColor: '#0e0e0e',
        tertiaryTextColor: '#ececea',
        tertiaryBorderColor: '#3a3a38',
        lineColor: '#8a8a86',
        textColor: '#ececea',
        mainBkg: '#161616',
        nodeBorder: '#ff6a3d',
        clusterBkg: '#0e0e0e',
        clusterBorder: '#3a3a38',
        titleColor: '#ececea',
        edgeLabelBackground: '#0a0a0a',
        noteBkgColor: '#2a1710',
        noteTextColor: '#ececea',
        noteBorderColor: '#ff6a3d',
        actorBkg: '#161616',
        actorBorder: '#ff6a3d',
        actorTextColor: '#ececea',
        actorLineColor: '#5c5c59',
        signalColor: '#c9c9c5',
        signalTextColor: '#ececea',
        labelBoxBkgColor: '#161616',
        labelBoxBorderColor: '#ff6a3d',
        labelTextColor: '#ececea',
        loopTextColor: '#ececea',
        activationBkgColor: '#2a1710',
        activationBorderColor: '#ff6a3d',
        sequenceNumberColor: '#000000',
        git0: '#ff6a3d',
        git1: '#61dafb',
        git2: '#a78bfa',
        git3: '#fbbf24',
        gitBranchLabel0: '#000000',
        gitBranchLabel1: '#000000',
        gitBranchLabel2: '#000000',
        gitBranchLabel3: '#000000',
        commitLabelColor: '#ececea',
        commitLabelBackground: '#161616',
      },
      // Mermaid 12 gives every diagram type its own default theme ("redux-color") and look ("neo"),
      // which override the global theme above and draw dark text on our dark background.
      // Pin each type we use back to our palette.
      look: 'classic',
      flowchart: { ...perDiagram, curve: 'basis', padding: 12, nodeSpacing: 36, rankSpacing: 40, diagramPadding: 8 },
      sequence: { ...perDiagram, mirrorActors: false },
      state: perDiagram,
      er: perDiagram,
      gantt: perDiagram,
      gitGraph: perDiagram,
      class: perDiagram,
      // Belt and braces: keep label text light even if a future default changes again.
      themeCSS: '.nodeLabel, .edgeLabel, .label, .cluster-label, .messageText, .loopText, .noteText { color: #ececea; }',
    } as Parameters<typeof mermaid.initialize>[0])
    return mermaid
  })
  // Don't keep a failed load around: the next diagram should try again instead of failing forever.
  loader.catch(() => {
    loader = null
  })
  return loader
}

// Finished SVGs by chart source, so revisiting a chapter or reopening an answer shows diagrams instantly.
const cache = new Map<string, string>()

// Mermaid renders through shared internal state, so diagrams are drawn one at a time.
let queue: Promise<unknown> = Promise.resolve()
function render(id: string, chart: string) {
  const job = queue.then(async () => {
    const mermaid = await loadMermaid()
    return mermaid.render(id, chart)
  })
  queue = job.catch(() => undefined)
  return job
}

export default function Diagram({ chart, caption }: { chart: string; caption?: string }) {
  const id = 'diagram-' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const source = chart.trim()
  const [rendered, setRendered] = useState<{ source: string; svg: string } | null>(null)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const failed = failedSource === source
  const svg = cache.get(source) ?? (rendered?.source === source ? rendered.svg : null)

  useEffect(() => {
    if (cache.has(source)) return
    let alive = true
    render(id, source)
      .then(({ svg }) => {
        cache.set(source, svg)
        if (alive) setRendered({ source, svg })
      })
      .catch(() => {
        if (alive) setFailedSource(source)
      })
    return () => {
      alive = false
    }
  }, [source, id])

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-line bg-[#0a0a0a]">
      {failed ? (
        <pre className="overflow-x-auto p-4 font-mono text-xs text-dim">{source}</pre>
      ) : svg ? (
        <div className="overflow-x-auto p-4 [&>svg]:mx-auto [&>svg]:block [&>svg]:max-w-none" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-40 animate-pulse bg-white/[0.02]" />
      )}
      {caption && <figcaption className="border-t border-line px-4 py-2 text-xs text-faint">{caption}</figcaption>}
    </figure>
  )
}
