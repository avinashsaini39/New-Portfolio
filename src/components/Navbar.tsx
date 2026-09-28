import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { nav, profile } from '../data/resume'
import { container } from './ui'

export default function Navbar({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['home', ...nav.map((n) => n.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  const go = (id: string) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${scrolled || open ? 'border-line bg-ink/75 backdrop-blur-md' : 'border-transparent bg-transparent'}`}
    >
      <nav className={`${container} flex h-14 items-center justify-between text-sm`}>
        <button onClick={() => go('home')} className="font-medium tracking-tight text-paper">
          {profile.name}
        </button>

        <ul className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <button onClick={() => go(n.id)} className={`flex items-center gap-2 transition-colors ${active === n.id ? 'text-paper' : 'text-dim hover:text-paper'}`}>
                <span className={`h-1 w-1 rounded-full bg-accent transition-opacity ${active === n.id ? 'opacity-100' : 'opacity-0'}`} />
                {n.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <a href={profile.resume} target="_blank" rel="noreferrer" className="link hidden text-paper sm:inline">
            Résumé ↗
          </a>
          <button aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="text-paper lg:hidden">
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${container} overflow-hidden lg:hidden`}
          >
            {nav.map((n, i) => (
              <li key={n.id} className="border-t border-line">
                <button onClick={() => go(n.id)} className="flex w-full items-baseline gap-3 py-4 text-left text-2xl tracking-tight">
                  <span className="font-mono text-xs text-faint">0{i + 1}</span>
                  <span className={active === n.id ? 'text-paper' : 'text-dim'}>{n.label}</span>
                </button>
              </li>
            ))}
            <li className="border-t border-line py-5">
              <a href={profile.resume} target="_blank" rel="noreferrer" className="link-static text-paper">
                View résumé ↗
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
