import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function InvertingLensCursor({ isHovered }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 30, stiffness: 350, mass: 0.8 }
  const smoothX = useSpring(cursorX, springConfig)
  const smoothY = useSpring(cursorY, springConfig)

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(coarse || touch)
  }, [])

  useEffect(() => {
    if (isTouchDevice) return undefined

    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [cursorX, cursorY, isTouchDevice])

  if (isTouchDevice) return null

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{
        x: smoothX,
        y: smoothY,
        mixBlendMode: 'difference',
        willChange: 'transform',
      }}
    >
      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          width: 15,
          height: 15,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isHovered ? 8 : 1,
        }}
        transition={{ type: 'spring', ...springConfig }}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ x: '-50%', y: '-50%' }}
            className="absolute whitespace-nowrap text-[11px] font-medium tracking-[0.3em] text-black"
            transition={{ duration: 0.2 }}
          >
            VIEW
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
