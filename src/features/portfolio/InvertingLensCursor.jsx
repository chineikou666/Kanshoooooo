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
      className="pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center rounded-full"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
        mixBlendMode: 'difference',
        backgroundColor: '#FFFFFF',
        opacity: 1,
        willChange: 'transform',
      }}
      animate={{
        width: isHovered ? 120 : 15,
        height: isHovered ? 120 : 15,
      }}
      transition={{ type: 'spring', ...springConfig }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[11px] font-medium tracking-[0.3em] text-black"
          >
            VIEW
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
