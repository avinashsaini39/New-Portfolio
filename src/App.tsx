import { lazy, Suspense, useEffect, useRef } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { About, Contact, Education, Experience, Footer, Marquee, Projects, Skills } from './components/Sections'

// three.js is heavy; load it after the page content so first paint stays fast.
const Scene = lazy(() => import('./components/Scene'))

export default function App() {
  const reduced = useReducedMotion() ?? false
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const l = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.current = l
    let raf = requestAnimationFrame(function loop(t) {
      l.raf(t)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      l.destroy()
      lenis.current = null
    }
  }, [reduced])

  const navigate = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis.current) lenis.current.scrollTo(el, { offset: id === 'home' ? 0 : -72, duration: 1.4 })
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <Suspense fallback={null}>
          <Scene reduced={reduced} />
        </Suspense>
        {/* Soft vignette keeps text readable over the 3D scene. */}
        <div className="pointer-events-none fixed inset-0 -z-[5] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(0_0_0/0.7)_100%)]" />

        <Navbar onNavigate={navigate} />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Education />
          <Contact />
        </main>
        <Footer onNavigate={navigate} />
      </div>
    </MotionConfig>
  )
}
