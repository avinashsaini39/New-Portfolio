import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { education, experience, profile, projects, skills, stats, type Project } from '../data/resume'
import { Counter, Reveal, Section, container } from './ui'

export function Marquee() {
  const words = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Playwright', 'AdonisJS', 'MongoDB', 'Next.js', 'AWS']
  return (
    <div className="relative border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-marquee flex w-max">
        {[...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-8 text-[clamp(1.75rem,3.5vw,3rem)] tracking-[-0.03em] text-paper/80">
            <span className={i % 2 ? 'font-serif italic' : ''}>{w}</span>
            <span className="ml-16 text-base text-accent">✳</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function About() {
  return (
    <Section id="about" index="01" label="About me" title="Interfaces, APIs and the *database* behind them." side="left">
      <Reveal>
        <p className="text-xl leading-relaxed text-paper/85 md:text-2xl md:leading-relaxed">
          I'm a full-stack developer with two-plus years of shipping SaaS products. Most days I'm in React and TypeScript, but I'm just as
          happy writing the Node.js service, the queue worker or the Postgres query behind a feature.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 leading-relaxed text-dim">
          At EvolveNext I work on <span className="text-paper">EasySocial.io</span>, a WhatsApp automation and CRM platform: chatbot flows,
          audience segmentation, campaign analytics and the shared component library the product is built on. On the side I build
          automation and LLM tools, like a pipeline that turns a product brief into a finished video ad.
        </p>
      </Reveal>
      <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-ink/85 p-6 backdrop-blur-sm md:p-8">
            <p className="font-serif text-5xl italic text-paper md:text-6xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-dim">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export function Experience() {
  const list = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 65%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const headTop = useTransform(progress, (v) => `${v * 100}%`)

  return (
    <Section id="experience" index="02" label="Experience" title="Where I've been *building*." side="right">
      <ol ref={list} className="relative flex flex-col gap-14 pl-10 md:pl-14">
        {/* Track, the drawn line, and a glowing head that rides the scroll. */}
        <span className="absolute bottom-0 left-[0.3125rem] top-0 w-px bg-line md:left-[0.5625rem]" />
        <motion.span style={{ scaleY: progress }} className="absolute bottom-0 left-[0.3125rem] top-0 w-px origin-top bg-gradient-to-b from-accent/30 via-accent to-accent md:left-[0.5625rem]" />
        <motion.span style={{ top: headTop }} className="absolute left-[0.3125rem] -ml-[0.3125rem] -mt-[0.3125rem] h-[0.6875rem] w-[0.6875rem] rounded-full bg-accent shadow-[0_0_18px_4px_rgb(255_106_61/0.55)] md:left-[0.5625rem]" />

        {experience.map((job) => (
          <li key={job.company} className="relative">
            <motion.span
              className="absolute -left-10 top-2 h-[0.6875rem] w-[0.6875rem] rounded-full border md:-left-14 md:h-[1.1875rem] md:w-[1.1875rem] md:top-1"
              initial={{ borderColor: 'rgb(255 255 255 / 0.25)', backgroundColor: 'rgb(0 0 0)' }}
              whileInView={{ borderColor: 'rgb(255 106 61)', backgroundColor: 'rgb(255 106 61 / 0.2)' }}
              viewport={{ margin: '-45% 0px -45% 0px' }}
              transition={{ duration: 0.4 }}
            />
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="text-2xl tracking-tight text-paper md:text-3xl">{job.role}</h3>
                <span className="font-mono text-sm text-dim">{job.period}</span>
              </div>
              <p className="mt-1 text-lg">
                <span className="font-serif italic text-accent">{job.company}</span>
                <span className="text-faint"> · {job.location}</span>
              </p>
              <ul className="mt-5 space-y-2.5 leading-relaxed text-dim">
                {job.points.map((p) => (
                  <li key={p} className="grid grid-cols-[1.25rem_1fr]">
                    <span className="text-accent/70">↳</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {job.stack.map((s) => (
                  <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-dim">
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const mx = useMotionValue(-300)
  const my = useMotionValue(-300)
  const glow = useMotionTemplate`radial-gradient(500px circle at ${mx}px ${my}px, rgb(255 106 61 / 0.13), transparent 60%)`
  const border = useMotionTemplate`radial-gradient(300px circle at ${mx}px ${my}px, rgb(255 106 61 / 0.7), transparent 60%)`

  return (
    <Reveal delay={i * 0.05}>
      <a
        href={p.link ?? profile.github}
        target="_blank"
        rel="noreferrer"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          mx.set(e.clientX - r.left)
          my.set(e.clientY - r.top)
        }}
        className="group relative block overflow-hidden rounded-3xl p-px"
      >
        {/* 1px border that lights up where the cursor is. */}
        <span className="absolute inset-0 rounded-3xl bg-line" />
        <motion.span className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: border }} />
        <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-ink/90 p-7 backdrop-blur-sm md:p-10">
          <motion.span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glow }} />
          <div className="relative flex items-start justify-between gap-6">
            <span className="font-serif text-6xl italic leading-none text-paper/15 transition-colors duration-500 group-hover:text-accent md:text-7xl">
              0{i + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-xl text-paper transition duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
              ↗
            </span>
          </div>
          <h3 className="relative mt-8 text-3xl tracking-[-0.03em] text-paper md:text-5xl">{p.title}</h3>
          <p className="relative mt-4 max-w-2xl leading-relaxed text-paper/75">{p.blurb}</p>
          <ul className="relative mt-5 space-y-2 text-sm leading-relaxed text-dim">
            {p.points.map((pt) => (
              <li key={pt} className="grid grid-cols-[1.25rem_1fr]">
                <span className="text-accent/70">↳</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-7 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-xs text-paper/80">
                {s}
              </span>
            ))}
          </div>
        </div>
      </a>
    </Reveal>
  )
}

export function Projects() {
  return (
    <Section id="projects" index="03" label="Selected projects" title="Things I've *made*." side="left">
      <div className="space-y-6">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} />
        ))}
      </div>
      <Reveal className="mt-10">
        <a href={profile.github} target="_blank" rel="noreferrer" className="link text-lg text-dim hover:text-paper">
          More on GitHub ↗
        </a>
      </Reveal>
    </Section>
  )
}

export function Skills() {
  return (
    <Section id="skills" index="04" label="Toolkit" title="Tools of the *trade*." side="right">
      <div className="divide-y divide-line border-y border-line">
        {skills.map((g, i) => (
          <Reveal key={g.group} delay={i * 0.04} className="grid gap-4 py-6 md:grid-cols-[11rem_1fr]">
            <h3 className="font-serif text-xl italic text-dim">{g.group}</h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-line px-4 py-1.5 text-sm text-paper transition duration-300 hover:-translate-y-0.5 hover:border-paper hover:bg-paper hover:text-ink"
                >
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export function Education() {
  return (
    <Section id="education" index="05" label="Education" title="Where I *studied*." side="left">
      {education.map((e) => (
        <Reveal key={e.degree}>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink/80 p-7 backdrop-blur-sm md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
            <p className="relative font-mono text-sm text-dim">{e.period}</p>
            <h3 className="relative mt-4 text-3xl tracking-[-0.03em] text-paper md:text-4xl">{e.degree}</h3>
            <p className="relative mt-2 font-serif text-xl italic text-dim">{e.school}</p>
            <div className="relative mt-10 flex items-end justify-between border-t border-line pt-6">
              <span className="text-sm text-dim">Aggregate</span>
              <span className="font-serif text-6xl italic leading-none text-accent md:text-7xl">{e.score}</span>
            </div>
          </div>
        </Reveal>
      ))}
    </Section>
  )
}

export function Contact() {
  const rows = [
    { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/-/g, '')}` },
    { label: 'LinkedIn', value: 'in/avinash-saini', href: profile.linkedin },
    { label: 'GitHub', value: 'avinashsaini39', href: profile.github },
    { label: 'Résumé', value: 'View PDF', href: profile.resume },
  ]
  const [user, domain] = profile.email.split('@')
  return (
    <Section id="contact" index="06" label="Contact" title="Let's make something *good*." side="right">
      <Reveal>
        <p className="max-w-xl text-xl leading-snug text-dim">Hiring, or have something you'd like built? Drop me a line.</p>
        <a
          href={`mailto:${profile.email}`}
          className="group mt-8 inline-flex flex-wrap items-baseline text-[clamp(1.8rem,4.4vw,4rem)] leading-none tracking-[-0.045em] text-paper"
        >
          <span className="link">
            {user}
            <span className="font-serif italic tracking-normal text-accent">@</span>
            {domain}
          </span>
          <span className="ml-4 text-accent transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
        </a>
      </Reveal>
      <Reveal delay={0.1} className="mt-14 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <a
            key={r.label}
            href={r.href}
            target={r.href.startsWith('tel:') ? undefined : '_blank'}
            rel="noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-line bg-ink/70 px-5 py-4 backdrop-blur-sm transition duration-300 hover:border-paper hover:bg-paper"
          >
            <span>
              <span className="block text-xs text-faint transition-colors group-hover:text-ink/60">{r.label}</span>
              <span className="block text-paper transition-colors group-hover:text-ink">{r.value}</span>
            </span>
            <span className="text-dim transition group-hover:text-ink">↗</span>
          </a>
        ))}
      </Reveal>
    </Section>
  )
}

export function Footer({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <footer className="overflow-hidden pb-8 pt-16">
      <div className={container}>
        <motion.p
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="select-none whitespace-nowrap bg-gradient-to-b from-paper/25 to-transparent bg-clip-text text-[clamp(4rem,16vw,16rem)] font-medium leading-[0.85] tracking-[-0.06em] text-transparent"
        >
          Avinash <span className="font-serif font-normal italic tracking-[-0.02em]">Saini</span>
        </motion.p>
        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm text-faint md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Avinash Saini</span>
          <span>Built with React, Three.js and a lot of coffee.</span>
          <button onClick={() => onNavigate('home')} className="link self-start text-dim hover:text-paper md:self-auto">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
