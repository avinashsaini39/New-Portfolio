import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sectionAccents, sectionProgress } from './shapes'

const accents = sectionAccents.map((c) => new THREE.Color(c))

// Syntax and stack terms from the resume, drifting through the background at different depths.
const TOKENS = [
  '</>', '{ }', '=>', '( )', '[ ]', '&&', '===', '//', ';', '...',
  'async', 'await', 'const', 'import', 'export', 'return', 'useState()', 'useEffect',
  'GET /api', 'POST', '200 OK', 'SELECT *', 'JSONB', 'npm run dev', 'git push', 'docker',
  'React', 'Node.js', 'TypeScript', 'Redis', 'PostgreSQL', 'MongoDB', 'BullMQ', 'Playwright', 'AWS', 'Next.js',
]

const COLORS = ['#ffffff', '#e5e5e5', '#cfcfcf']
const WHITE = new THREE.Color(1, 1, 1)

function makeTexture(text: string, color: string) {
  const fontSize = 64
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  const font = `400 ${fontSize}px "Geist Mono", ui-monospace, Menlo, monospace`
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + 32
  c.width = w
  c.height = fontSize + 32
  ctx.font = font
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, 16, c.height / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return { tex, aspect: c.width / c.height }
}

function buildItems(narrow: boolean) {
  let seed = 5
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const count = narrow ? 22 : 40
  return Array.from({ length: count }, (_, i) => {
    const text = TOKENS[i % TOKENS.length]
    const color = COLORS[i % COLORS.length]
    const z = -2.5 - rand() * 7
    const { tex, aspect } = makeTexture(text, color)
    // Keep the band behind the hero content mostly clear; push tokens toward the edges.
    const side = rand() < 0.5 ? -1 : 1
    const x = side * (2 + rand() * (narrow ? 2 : 7))
    return {
      tex,
      aspect,
      height: 0.22 + rand() * 0.22,
      // Start below the fold so the hero stays clean; tokens rise into view as you scroll.
      base: new THREE.Vector3(x, -4.5 - rand() * 26, z),
      phase: rand() * Math.PI * 2,
      speed: 0.2 + rand() * 0.4,
      opacity: THREE.MathUtils.mapLinear(z, -9.5, -2.5, 0.15, 0.45),
    }
  })
}

export default function CodeGlyphs({ ids, getScroll, reduced, narrow }: { ids: string[]; getScroll: () => number; reduced: boolean; narrow: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const tint = useRef({ target: new THREE.Color(), current: new THREE.Color(1, 1, 1) })

  const items = useMemo(() => buildItems(narrow), [narrow])

  useEffect(() => () => items.forEach((it) => it.tex.dispose()), [items])

  useFrame(({ clock }, delta) => {
    // Parallax: deeper tokens move slower, so the field has real depth as you scroll.
    const p = getScroll()
    const t = reduced ? 0 : clock.elapsedTime

    // Tokens take on the current section's colour, softened towards white so they stay in the background.
    const f = sectionProgress(ids)
    const i0 = Math.min(Math.floor(f), accents.length - 1)
    const i1 = Math.min(i0 + 1, accents.length - 1)
    const { target, current } = tint.current
    target.copy(accents[i0]).lerp(accents[i1], f - i0).lerp(WHITE, 0.35)
    current.lerp(target, 1 - Math.exp(-4 * delta))

    group.current.children.forEach((child, i) => {
      ;((child as THREE.Sprite).material as THREE.SpriteMaterial).color.copy(current)
      const it = items[i]
      const depth = THREE.MathUtils.mapLinear(it.base.z, -9.5, -2.5, 0.55, 1)
      const targetY = it.base.y + p * 26 * depth + Math.sin(t * it.speed + it.phase) * 0.15
      child.position.y = THREE.MathUtils.damp(child.position.y, targetY, 4, delta)
      child.position.x = it.base.x + Math.cos(t * it.speed * 0.7 + it.phase) * 0.1
    })
  })

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <sprite key={i} position={it.base} scale={[it.height * it.aspect, it.height, 1]}>
          <spriteMaterial map={it.tex} transparent opacity={it.opacity} depthWrite={false} fog />
        </sprite>
      ))}
    </group>
  )
}
