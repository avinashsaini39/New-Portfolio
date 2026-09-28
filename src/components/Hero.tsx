import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import photo from '../assets/profilePhoto.webp'
import { profile } from '../data/resume'
import { container } from './ui'

const ease = [0.22, 1, 0.36, 1] as const

const istTime = () =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())

function LocalTime() {
  const [time, setTime] = useState(istTime)
  useEffect(() => {
    const id = setInterval(() => setTime(istTime()), 15_000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono">{time} IST</span>
}

function Line({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay, ease }}>
        {children}
      </motion.span>
    </span>
  )
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 60])

  const links = [
    { label: 'Email', href: `mailto:${profile.email}` },
    { label: 'GitHub', href: profile.github },
    { label: 'LinkedIn', href: profile.linkedin },
  ]

  return (
    <section id="home" ref={ref} className="relative flex min-h-svh flex-col pt-14">
      <div className={`${container} flex flex-1 flex-col`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="grid grid-cols-2 gap-6 border-b border-line py-4 text-sm text-dim md:grid-cols-4"
        >
          <span>Full-stack developer</span>
          <span className="hidden md:block">React · Node.js · TypeScript</span>
          <span className="hidden md:block">
            Kota, India — <LocalTime />
          </span>
          <span className="flex items-center justify-end gap-2 text-paper">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Taking on new work
          </span>
        </motion.div>

        <div className="grid flex-1 grid-cols-12 items-end gap-x-6 gap-y-10 pb-10 pt-16 md:pb-14">
          <motion.div style={{ y: nameY }} className="col-span-12 lg:col-span-8">
            <h1 className="text-[clamp(3.6rem,11.5vw,11.5rem)] font-medium leading-[0.86] tracking-[-0.055em] text-paper">
              <Line delay={0.15}>Avinash</Line>
              <Line delay={0.28}>
                <span className="font-serif font-normal italic tracking-[-0.02em] text-accent">Saini</span>
              </Line>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease }}
              className="mt-10 max-w-md"
            >
              <p className="text-lg leading-snug text-paper/90">
                I build web products end to end, from the interface down to the database. Right now that's{' '}
                <span className="font-serif text-xl italic">EasySocial.io</span>, a WhatsApp automation and CRM platform at EvolveNext.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-lg">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="link">
                      {l.label} ↗
                    </a>
                  </li>
                ))}
                <li>
                  <a href={profile.resume} target="_blank" rel="noreferrer" className="link">
                    Résumé ↗
                  </a>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.figure
            style={{ y: photoY }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.35, ease }}
            className="group col-span-8 col-start-5 sm:col-span-5 sm:col-start-8 lg:col-span-3 lg:col-start-10"
          >
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={photo}
                  alt="Avinash Saini"
                  fetchPriority="high"
                  className="aspect-[4/5] w-full object-cover object-[55%_30%] grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
              </div>
            </div>
            <figcaption className="mt-3 flex justify-between text-xs text-faint">
              <span>That's me.</span>
              <span className="font-mono">fig. 01</span>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  )
}
