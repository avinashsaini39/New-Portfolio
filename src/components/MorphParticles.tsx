import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { atom, atSign, cap, codeTag, editor, layers, network, sectionProgress, type Shape } from './shapes'

// One shape per section, in page order: home, about, experience, projects, skills, education, contact.
const builders = [codeTag, atom, layers, editor, network, cap, atSign]

// Where the formation sits for each section: [x as a fraction of half the view width, y, z, scale].
// Hero sits between the name and the photo; after that it alternates sides, always filling the half the content leaves empty.
const stagesWide: [number, number, number, number][] = [
  [0.16, -0.2, -0.6, 0.54], // home: in the gap between the name and the photo
  [-0.56, 0, -1, 0.8], // about: left
  [0.56, 0, -1, 0.78], // experience: right
  [-0.56, 0, -1, 0.78], // projects: left
  [0.56, 0, -1, 0.8], // skills: right
  [-0.56, 0, -1, 0.8], // education: left
  [0.56, 0, -1, 0.85], // contact: right
]

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const vertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uPixelRatio;
uniform float uSize;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aColFrom;
attribute vec3 aColTo;
attribute float aRandom;
varying vec3 vColor;
varying float vGlow;
${noise}
void main() {
  // Staggered morph: each particle leaves at its own moment, so shapes dissolve rather than slide.
  float d = clamp((uMorph - aRandom * 0.35) / 0.65, 0.0, 1.0);
  float e = d * d * (3.0 - 2.0 * d);
  vec3 p = mix(aFrom, aTo, e);

  // Mid-flight the particles swirl through a noise field, like a cloud of data being reshaped.
  float arc = sin(e * 3.14159);
  vec3 swirl = vec3(
    snoise(aFrom * 0.7 + uTime * 0.15),
    snoise(aTo * 0.7 + 17.0 + uTime * 0.15),
    snoise(aFrom * 0.7 + 41.0));
  p += swirl * arc * 1.4;

  // Idle shimmer keeps the formation alive without breaking its outline.
  p += vec3(
    snoise(p * 1.2 + uTime * 0.3),
    snoise(p * 1.2 + uTime * 0.3 + 31.0),
    snoise(p * 1.2 + uTime * 0.3 + 63.0)) * 0.025;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  gl_PointSize = uSize * (0.6 + aRandom * 0.6) * uPixelRatio * (8.0 / -mv.z) * (1.0 + arc * 0.6);

  vColor = mix(aColFrom, aColTo, e);
  vGlow = 1.0 + arc * 0.3;
}`

const fragment = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = exp(-d * d * 80.0);
  float halo = exp(-d * d * 14.0);
  // Each section's own colours, with white-hot particle centres so the shape still reads crisply.
  vec3 tint = mix(vColor, vec3(1.0), 0.15);
  vec3 col = tint * halo + vec3(1.0) * core;
  float a = (halo * 0.6 + core) * vGlow * uOpacity;
  gl_FragColor = vec4(col * a, a);
}`

type Built = { geometry: THREE.BufferGeometry; pos: THREE.BufferAttribute[]; col: THREE.BufferAttribute[] }

function build(n: number): Built {
  const shapes: Shape[] = builders.map((f) => f(n))
  const pos = shapes.map((s) => new THREE.BufferAttribute(s.pos, 3))
  const col = shapes.map((s) => new THREE.BufferAttribute(s.col, 3))
  const rnd = new Float32Array(n)
  for (let i = 0; i < n; i++) rnd[i] = ((i * 2654435761) % 1000) / 1000
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', pos[0])
  geometry.setAttribute('aFrom', pos[0])
  geometry.setAttribute('aTo', pos[1])
  geometry.setAttribute('aColFrom', col[0])
  geometry.setAttribute('aColTo', col[1])
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(rnd, 1))
  return { geometry, pos, col }
}

export default function MorphParticles({ ids, reduced }: { ids: string[]; reduced: boolean }) {
  const { viewport, gl } = useThree()
  const narrow = viewport.width < 7
  const [built, setBuilt] = useState<Built | null>(null)
  const group = useRef<THREE.Group>(null!)
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null!)
  const s = useRef({ pair: -1 })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uPixelRatio: { value: gl.getPixelRatio() },
      uSize: { value: narrow ? 0.8 : 0.7 },
      uOpacity: { value: 1 },
    }),
    [gl, narrow],
  )

  // Text shapes are drawn with the site fonts, so wait for them before sampling.
  useEffect(() => {
    let alive = true
    const fonts = ['500 100px "Geist Mono"', 'italic 400 100px "Instrument Serif"']
    Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => null))).then(() => {
      if (alive) setBuilt(build(narrow ? 7000 : 13000))
    })
    return () => {
      alive = false
    }
  }, [narrow])

  useEffect(() => () => built?.geometry.dispose(), [built])

  useFrame(({ clock }, delta) => {
    if (!built || !points.current) return
    const st = s.current
    const f = sectionProgress(ids)
    const from = Math.min(Math.floor(f), builders.length - 1)
    const to = Math.min(from + 1, builders.length - 1)
    const t = f - from

    if (st.pair !== from) {
      st.pair = from
      const g = built.geometry
      g.setAttribute('aFrom', built.pos[from])
      g.setAttribute('aTo', built.pos[to])
      g.setAttribute('aColFrom', built.col[from])
      g.setAttribute('aColTo', built.col[to])
    }

    const u = points.current.material.uniforms
    u.uMorph.value = t
    u.uTime.value = reduced ? 0 : clock.elapsedTime

    // Glide between stage positions in step with the morph.
    const a = stagesWide[from]
    const b = stagesWide[to]
    const lerp = (i: number) => a[i] + (b[i] - a[i]) * t
    const tx = narrow ? 0 : lerp(0) * (viewport.width / 2)
    const ty = narrow ? 1.6 : lerp(1)
    const tz = narrow ? -1.5 : lerp(2)
    // Shapes are sized for a 16:9 window; shrink them on narrower desktop windows so they stay in their half.
    const fit = THREE.MathUtils.clamp(viewport.width / 10.3, 0.7, 1.15)
    const sc = narrow ? 0.62 : lerp(3) * fit
    const grp = group.current
    grp.position.x = THREE.MathUtils.damp(grp.position.x, tx, 4, delta)
    grp.position.y = THREE.MathUtils.damp(grp.position.y, ty, 4, delta)
    grp.position.z = THREE.MathUtils.damp(grp.position.z, tz, 4, delta)
    grp.scale.setScalar(THREE.MathUtils.damp(grp.scale.x, sc, 4, delta))
    // Gentle sway so the 3D depth of each shape reads, while text stays legible. Ignores the pointer.
    grp.rotation.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.35) * 0.22
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, narrow && from > 0 ? 0.6 : 1, 3, delta)
  })

  if (!built) return null
  return (
    <group ref={group} position={narrow ? [0, 1.6, -1.5] : [stagesWide[0][0] * (viewport.width / 2), stagesWide[0][1], stagesWide[0][2]]}>
      <points ref={points} geometry={built.geometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
        />
      </points>
    </group>
  )
}
