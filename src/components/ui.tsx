import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView } from 'framer-motion'

export const container = 'mx-auto w-full max-w-[90rem] px-5 md:px-10 xl:px-14'
const ease = [0.22, 1, 0.36, 1] as const

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

// Words wrapped in *asterisks* are set in the italic serif. Each word rises out of a blur.
export function Title({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(/(\*[^*]+\*)/).flatMap((part) =>
    part.startsWith('*') ? [{ w: part.slice(1, -1), serif: true }] : part.split(' ').filter(Boolean).map((w) => ({ w, serif: false })),
  )
  return (
    <h2 className={`text-[clamp(2.6rem,6vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.045em] text-paper ${className}`}>
      {words.map(({ w, serif }, i) => (
        <motion.span
          key={i}
          className={`mr-[0.22em] inline-block ${serif ? 'font-serif font-normal italic tracking-[-0.01em] text-accent' : ''}`}
          initial={{ opacity: 0, y: '0.4em', filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: i * 0.07, ease }}
        >
          {w}
        </motion.span>
      ))}
    </h2>
  )
}

// Content takes seven columns on one side; the particle formation fills the empty side.
export function Section({
  id,
  index,
  label,
  title,
  side,
  children,
}: {
  id: string
  index: string
  label: string
  title: string
  side: 'left' | 'right'
  children: ReactNode
}) {
  return (
    <section id={id} className="relative py-24 md:py-36">
      <div className={container}>
        <div className="grid grid-cols-12 gap-x-6">
          <div className={`col-span-12 lg:col-span-7 ${side === 'left' ? 'lg:col-start-6' : ''}`}>
            <Reveal>
              <p className="mb-6 flex items-center gap-3 text-sm text-dim">
                <span className="font-mono text-accent">{index}</span>
                <span className="h-px w-10 bg-line" />
                {label}
              </p>
            </Reveal>
            <Title text={title} className="mb-14 md:mb-20" />
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration: 1.8, ease, onUpdate: (v) => setValue(Math.round(v)) })
    return () => controls.stop()
  }, [inView, to])
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}
