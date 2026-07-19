'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className,
  staggerDelay = 0.08,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({
  value,
  suffix = '',
  prefix = '',
  className,
}: {
  value: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: 1600, bounce: 0 })

  useEffect(() => {
    if (inView) motionVal.set(value)
  }, [inView, value, motionVal])

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(v).toLocaleString('en-US')}${suffix}`
      }
    })
    return unsub
  }, [spring, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

export { motion }
