import { useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { nav } from '../data/resume'
import CodeGlyphs from './CodeGlyphs'
import MorphParticles from './MorphParticles'

const sectionIds = ['home', ...nav.map((n) => n.id)]

// Normalised page scroll (0 at top, 1 at bottom). Lenis drives window scroll,
// so reading it per frame keeps the scene in sync with the smoothed position.
function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? window.scrollY / max : 0
}

function World({ reduced }: { reduced: boolean }) {
  const narrow = useThree((s) => s.viewport.width < 7)
  const [fontReady, setFontReady] = useState(false)
  useEffect(() => {
    document.fonts.load('400 64px "Geist Mono"').finally(() => setFontReady(true))
  }, [])
  return (
    <>
      <MorphParticles ids={sectionIds} reduced={reduced} />
      {fontReady && <CodeGlyphs ids={sectionIds} getScroll={scrollProgress} reduced={reduced} narrow={narrow} />}
    </>
  )
}

export default function Scene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      className="!fixed inset-0 -z-10"
      style={{ position: 'fixed', pointerEvents: 'none' }}
      eventSource={document.body}
      eventPrefix="client"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 7, 17]} />
      <World reduced={reduced} />

      {/* Bloom turns the additive particle cores into real-looking light. */}
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.45} luminanceSmoothing={0.25} radius={0.55} />
        <Vignette offset={0.25} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
