import * as THREE from 'three'

// Each shape is N particle positions + colours. Particle i of one shape morphs to particle i of the next.
export type Shape = { pos: Float32Array; col: Float32Array }

const C = {
  white: new THREE.Color('#fff7f0'),
  orange: new THREE.Color('#ff6a3d'),
  peach: new THREE.Color('#ffb38a'),
  pink: new THREE.Color('#ff7eb3'),
  react: new THREE.Color('#61dafb'),
  sky: new THREE.Color('#7dd3fc'),
  amber: new THREE.Color('#ffd166'),
  teal: new THREE.Color('#5eead4'),
  violet: new THREE.Color('#a78bfa'),
  lilac: new THREE.Color('#c4b5fd'),
  slate: new THREE.Color('#94a3b8'),
  gold: new THREE.Color('#fbbf24'),
}

// Signature colour of each section's shape, in page order. The floating code tokens borrow it too.
export const sectionAccents = ['#ff6a3d', '#61dafb', '#ffd166', '#ff7eb3', '#a78bfa', '#fbbf24', '#ff6a3d']

// Continuous section index: whole numbers while a section fills the screen, fractional while
// the next one scrolls in. The change happens over the last 35% of each section.
export function sectionProgress(ids: string[]) {
  const mid = window.innerHeight * 0.5
  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i])
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.bottom >= mid || i === ids.length - 1) {
      const q = THREE.MathUtils.clamp((mid - r.top) / r.height, 0, 1)
      return i + (i < ids.length - 1 ? THREE.MathUtils.smoothstep(q, 0.65, 1) : 0)
    }
  }
  return 0
}

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

class Builder {
  pos: Float32Array
  col: Float32Array
  i = 0
  rand: () => number
  n: number
  constructor(n: number, seed: number) {
    this.n = n
    this.pos = new Float32Array(n * 3)
    this.col = new Float32Array(n * 3)
    this.rand = rng(seed)
  }
  get left() {
    return this.n - this.i
  }
  push(x: number, y: number, z: number, c: THREE.Color) {
    if (this.i >= this.n) return
    this.pos.set([x, y, z], this.i * 3)
    this.col.set([c.r, c.g, c.b], this.i * 3)
    this.i++
  }
  // Fill any leftover slots by doubling up points already on the shape, so nothing floats loose.
  fill() {
    const used = this.i
    while (this.left > 0) {
      const j = Math.floor(this.rand() * used)
      this.push(this.pos[j * 3] + this.jitter(0.02), this.pos[j * 3 + 1] + this.jitter(0.02), this.pos[j * 3 + 2] + this.jitter(0.02), new THREE.Color().fromArray(this.col, j * 3))
    }
  }
  jitter(a: number) {
    return (this.rand() - 0.5) * a
  }
  transform(m: THREE.Matrix4, from = 0, to = this.i) {
    const v = new THREE.Vector3()
    for (let k = from; k < to; k++) {
      v.fromArray(this.pos, k * 3).applyMatrix4(m)
      v.toArray(this.pos, k * 3)
    }
  }
  // Shuffle so morphs scatter particles across the whole shape instead of sliding in bands.
  done(): Shape {
    for (let k = this.n - 1; k > 0; k--) {
      const j = Math.floor(this.rand() * (k + 1))
      for (let a = 0; a < 3; a++) {
        ;[this.pos[k * 3 + a], this.pos[j * 3 + a]] = [this.pos[j * 3 + a], this.pos[k * 3 + a]]
        ;[this.col[k * 3 + a], this.col[j * 3 + a]] = [this.col[j * 3 + a], this.col[k * 3 + a]]
      }
    }
    return { pos: this.pos, col: this.col }
  }
}

const rot = (x: number, y: number, z = 0) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x, y, z))

function text(n: number, seed: number, str: string, font: string, width: number, colorAt: (u: number, v: number) => THREE.Color) {
  const b = new Builder(n, seed)
  const W = 1024
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(str, W / 2, H / 2)
  const data = ctx.getImageData(0, 0, W, H).data
  const px: number[] = []
  let minX = W, maxX = 0, minY = H, maxY = 0
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (data[(y * W + x) * 4 + 3] > 128) {
        px.push(x, y)
        minX = Math.min(minX, x); maxX = Math.max(maxX, x)
        minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      }
  const scale = width / (maxX - minX)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const count = n
  for (let k = 0; k < count; k++) {
    const j = Math.floor(b.rand() * (px.length / 2)) * 2
    const x = (px[j] - cx + b.jitter(2)) * scale
    const y = -(px[j + 1] - cy + b.jitter(2)) * scale
    b.push(x, y, b.jitter(0.45), colorAt((px[j] - minX) / (maxX - minX), (px[j + 1] - minY) / (maxY - minY)))
  }
  b.fill()
  return b.done()
}

const gradient = (a: THREE.Color, c: THREE.Color) => (u: number) => a.clone().lerp(c, u)

export function codeTag(n: number) {
  return text(n, 3, '</>', '500 380px "Geist Mono", ui-monospace, Menlo, monospace', 5.2, gradient(C.orange, C.peach))
}

export function atSign(n: number) {
  return text(n, 5, '@', 'italic 400 560px "Instrument Serif", Georgia, serif', 3.4, (u, v) => C.orange.clone().lerp(C.pink, (u + v) / 2))
}

// React logo: three tilted electron orbits around a bright nucleus.
export function atom(n: number) {
  const b = new Builder(n, 7)
  const nucleus = Math.floor(n * 0.13)
  for (let k = 0; k < nucleus; k++) {
    const r = Math.pow(b.rand(), 0.6) * 0.34
    const u = b.rand() * 2 - 1
    const t = b.rand() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    b.push(Math.cos(t) * s * r, u * r, Math.sin(t) * s * r, C.white)
  }
  const orbits = n - nucleus
  const v = new THREE.Vector3()
  for (let k = 0; k < orbits; k++) {
    const ring = k % 3
    const a = b.rand() * Math.PI * 2
    v.set(Math.cos(a) * (2.2 + b.jitter(0.06)), Math.sin(a) * (0.82 + b.jitter(0.05)), b.jitter(0.06))
    v.applyAxisAngle(new THREE.Vector3(0, 0, 1), (ring * Math.PI) / 3)
    b.push(v.x, v.y, v.z, C.react.clone().lerp(C.sky, (Math.sin(a * 2) + 1) / 2))
  }
  b.transform(rot(0.3, 0))
  b.fill()
  return b.done()
}

// Full stack: UI / API / DB as three stacked grid plates, joined by data pipes.
export function layers(n: number) {
  const b = new Builder(n, 9)
  const colors = [C.orange, C.amber, C.teal]
  const W = 3.2
  const D = 2.2
  const plates = Math.floor(n * 0.76)
  for (let k = 0; k < plates; k++) {
    const layer = k % 3
    const y = 1.15 - layer * 1.15
    let x: number, z: number
    const mode = b.rand()
    if (mode < 0.45) {
      // Plate outline.
      const e = b.rand() * 2 * (W + D)
      if (e < W) { x = e - W / 2; z = -D / 2 } else if (e < W + D) { x = W / 2; z = e - W - D / 2 } else if (e < 2 * W + D) { x = e - W - D - W / 2; z = D / 2 } else { x = -W / 2; z = e - 2 * W - D - D / 2 }
    } else if (mode < 0.85) {
      // Grid lines.
      if (b.rand() < 0.5) { x = Math.round((b.rand() - 0.5) * W / 0.4) * 0.4; z = (b.rand() - 0.5) * D } else { x = (b.rand() - 0.5) * W; z = Math.round((b.rand() - 0.5) * D / 0.4) * 0.4 }
    } else {
      x = (b.rand() - 0.5) * W
      z = (b.rand() - 0.5) * D
    }
    b.push(x + b.jitter(0.02), y + b.jitter(0.03), z + b.jitter(0.02), colors[layer])
  }
  const pipes = n - plates
  const cols = [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]
  for (let k = 0; k < pipes; k++) {
    const [px, pz] = cols[k % 4]
    const y = (b.rand() - 0.5) * 2.3
    b.push(px + b.jitter(0.05), y, pz + b.jitter(0.05), C.white.clone().lerp(C.amber, b.rand()))
  }
  b.transform(rot(0.55, 0.65))
  b.fill()
  return b.done()
}

// A code editor window with syntax-coloured lines.
export function editor(n: number) {
  const b = new Builder(n, 13)
  const W = 4.2
  const H = 2.9
  const outline = Math.floor(n * 0.22)
  for (let k = 0; k < outline; k++) {
    const e = b.rand() * 2 * (W + H)
    let x: number, y: number
    if (e < W) { x = e - W / 2; y = H / 2 } else if (e < W + H) { x = W / 2; y = H / 2 - (e - W) } else if (e < 2 * W + H) { x = W / 2 - (e - W - H); y = -H / 2 } else { x = -W / 2; y = -H / 2 + (e - 2 * W - H) }
    b.push(x + b.jitter(0.03), y + b.jitter(0.03), b.jitter(0.05), C.slate)
  }
  // Title bar divider and traffic-light dots.
  const bar = Math.floor(n * 0.06)
  for (let k = 0; k < bar; k++) b.push((b.rand() - 0.5) * W, H / 2 - 0.4 + b.jitter(0.02), b.jitter(0.04), C.slate)
  const dots = Math.floor(n * 0.04)
  for (let k = 0; k < dots; k++) {
    const a = b.rand() * Math.PI * 2
    const r = Math.sqrt(b.rand()) * 0.08
    b.push(-W / 2 + 0.3 + (k % 3) * 0.25 + Math.cos(a) * r, H / 2 - 0.2 + Math.sin(a) * r, 0, [C.orange, C.amber, C.teal][k % 3])
  }
  // Code tokens: indent levels and token lengths laid out like real source.
  const r = rng(99)
  const indents = [0, 1, 2, 2, 3, 2, 1, 1, 0]
  const tokens: { x0: number; x1: number; y: number; c: THREE.Color }[] = []
  const palette = [C.pink, C.sky, C.white, C.amber, C.lilac]
  indents.forEach((ind, row) => {
    let x = -W / 2 + 0.3 + ind * 0.32
    const y = H / 2 - 0.72 - row * 0.24
    const parts = 1 + Math.floor(r() * 3)
    for (let p = 0; p < parts && x < W / 2 - 0.5; p++) {
      const len = 0.3 + r() * 0.9
      tokens.push({ x0: x, x1: Math.min(x + len, W / 2 - 0.3), y, c: palette[Math.floor(r() * palette.length)] })
      x += len + 0.14
    }
  })
  const total = tokens.reduce((s, t) => s + (t.x1 - t.x0), 0)
  const code = n - b.i
  for (let k = 0; k < code; k++) {
    let d = b.rand() * total
    const t = tokens.find((t) => (d -= t.x1 - t.x0) <= 0) ?? tokens[tokens.length - 1]
    b.push(t.x0 + b.rand() * (t.x1 - t.x0), t.y + b.jitter(0.07), b.jitter(0.05), t.c)
  }
  b.transform(rot(0.05, -0.28))
  b.fill()
  return b.done()
}

// Services talking to each other: nodes joined to their nearest neighbours.
export function network(n: number) {
  const b = new Builder(n, 17)
  const r = rng(41)
  const nodes = Array.from({ length: 22 }, () => new THREE.Vector3((r() - 0.5) * 4.6, (r() - 0.5) * 3.2, (r() - 0.5) * 2.2))
  const edges: [number, number][] = []
  nodes.forEach((a, i) => {
    nodes
      .map((c, j) => ({ j, d: a.distanceTo(c) }))
      .filter((e) => e.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        if (!edges.some(([p, q]) => (p === j && q === i) || (p === i && q === j))) edges.push([i, j])
      })
  })
  const nodePts = Math.floor(n * 0.34)
  for (let k = 0; k < nodePts; k++) {
    const c = nodes[k % nodes.length]
    const big = k % nodes.length < 5
    const rad = Math.pow(b.rand(), 0.5) * (big ? 0.2 : 0.11)
    const u = b.rand() * 2 - 1
    const t = b.rand() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    b.push(c.x + Math.cos(t) * s * rad, c.y + u * rad, c.z + Math.sin(t) * s * rad, big ? C.white : C.lilac)
  }
  const edgePts = n - nodePts
  const v = new THREE.Vector3()
  for (let k = 0; k < edgePts; k++) {
    const [p, q] = edges[k % edges.length]
    const t = b.rand()
    v.lerpVectors(nodes[p], nodes[q], t)
    b.push(v.x + b.jitter(0.025), v.y + b.jitter(0.025), v.z + b.jitter(0.025), C.violet.clone().lerp(C.sky, t))
  }
  b.fill()
  return b.done()
}

// Graduation cap: diamond mortarboard, crown and a gold tassel.
export function cap(n: number) {
  const b = new Builder(n, 23)
  const S = 3.1
  const board = Math.floor(n * 0.5)
  const m45 = rot(0, Math.PI / 4)
  const v = new THREE.Vector3()
  for (let k = 0; k < board; k++) {
    let x: number, z: number
    if (b.rand() < 0.4) {
      const e = b.rand() * 4 * S
      const side = Math.floor(e / S)
      const f = (e % S) - S / 2
      ;[x, z] = side === 0 ? [f, -S / 2] : side === 1 ? [S / 2, f] : side === 2 ? [f, S / 2] : [-S / 2, f]
    } else {
      x = (b.rand() - 0.5) * S
      z = (b.rand() - 0.5) * S
    }
    v.set(x, 0.55 + b.jitter(0.08), z).applyMatrix4(m45)
    b.push(v.x, v.y, v.z, C.white.clone().lerp(C.amber, b.rand() * 0.5))
  }
  const crown = Math.floor(n * 0.32)
  for (let k = 0; k < crown; k++) {
    const a = b.rand() * Math.PI * 2
    const y = b.rand() < 0.2 ? -0.55 : -0.55 + b.rand() * 1.05
    b.push(Math.cos(a) * 1.05, y, Math.sin(a) * 0.95, C.lilac.clone().lerp(C.violet, (0.5 - y) / 1.2))
  }
  const tassel = n - b.i
  const corner = new THREE.Vector3(S / 2, 0.6, 0).applyMatrix4(m45).multiplyScalar(0.92)
  for (let k = 0; k < tassel; k++) {
    const f = b.rand()
    if (f < 0.35) {
      b.push(corner.x * (f / 0.35), 0.62, corner.z * (f / 0.35), C.gold)
    } else if (f < 0.7) {
      b.push(corner.x + b.jitter(0.03), 0.62 - ((f - 0.35) / 0.35) * 1.1, corner.z, C.gold)
    } else {
      const g = (f - 0.7) / 0.3
      b.push(corner.x + b.jitter(0.2 * g + 0.05), -0.5 - g * 0.45, corner.z + b.jitter(0.2 * g + 0.05), C.gold)
    }
  }
  b.transform(rot(0.38, 0.35))
  b.fill()
  return b.done()
}
