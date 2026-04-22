import { AnimatePresence, motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Footer } from './Footer.jsx'
import { InvertingLensCursor } from './InvertingLensCursor.jsx'
import { Navigation } from './Navigation.jsx'
import { PHOTO_DATA } from './photoData.js'
import { SocialPanel } from './SocialPanel.jsx'

export default function InvertingArtistPortfolio() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const cardBaseW = 266
  const cardExpW = 533
  const cardHeight = '68vh'
  const gap = 32
  const borderRadius = '24px'

  const items = useMemo(() => [...PHOTO_DATA, ...PHOTO_DATA, ...PHOTO_DATA], [])
  const setW = PHOTO_DATA.length * (cardBaseW + gap)

  const x = useMotionValue(-setW)
  const velocity = useRef(0)
  const isInEdgeZone = useRef(false)

  const DAMPING = 0.96
  const STOP_THRESHOLD = 0.005
  const BASE_DRIFT = 0.02
  const SRCSET_WIDTHS = [640, 960, 1280, 1920]
  const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23111111"/><stop offset="100%25" stop-color="%23272727"/></linearGradient></defs><rect width="1200" height="1600" fill="url(%23g)"/><circle cx="980" cy="260" r="220" fill="%23333333" opacity="0.45"/><circle cx="180" cy="1380" r="300" fill="%233b3b3b" opacity="0.35"/></svg>'

  const setUnsplashWidth = (url, width) => {
    try {
      const u = new URL(url)
      u.searchParams.set('w', String(width))
      return u.toString()
    } catch {
      return url
    }
  }

  const buildSrcSet = (url) =>
    SRCSET_WIDTHS.map((w) => `${setUnsplashWidth(url, w)} ${w}w`).join(', ')

  const handleImageError = (event) => {
    const img = event.currentTarget
    img.onerror = null
    img.srcset = ''
    img.src = FALLBACK_IMAGE
  }

  useEffect(() => {
    const stopEdgeDrive = () => {
      isInEdgeZone.current = false
    }

    window.addEventListener('mouseleave', stopEdgeDrive)
    window.addEventListener('blur', stopEdgeDrive)
    return () => {
      window.removeEventListener('mouseleave', stopEdgeDrive)
      window.removeEventListener('blur', stopEdgeDrive)
    }
  }, [])

  useAnimationFrame(() => {
    if (hoveredIndex !== null) return

    if (!isInEdgeZone.current) {
      velocity.current *= DAMPING
      if (Math.abs(velocity.current) < STOP_THRESHOLD) velocity.current = 0
    }

    const currentVelocity = velocity.current === 0 ? BASE_DRIFT : velocity.current
    let nextX = x.get() + currentVelocity
    if (nextX <= -(setW * 2)) nextX += setW
    else if (nextX >= 0) nextX -= setW
    x.set(nextX)
  })

  return (
    <main className="flex h-screen w-full cursor-none flex-col items-center justify-center overflow-hidden bg-black font-sans antialiased">
      <style>{`canvas, body { cursor: none !important; }`}</style>

      <Navigation />
      <InvertingLensCursor isHovered={hoveredIndex !== null} />

      <div
        className="flex w-full flex-grow items-center"
        onMouseLeave={() => {
          isInEdgeZone.current = false
        }}
        onMouseMove={(e) => {
          if (hoveredIndex !== null) return
          const iw = window.innerWidth
          const edge = iw * 0.2
          if (e.clientX < edge) {
            isInEdgeZone.current = true
            velocity.current = (edge - e.clientX) * 0.02
          } else if (e.clientX > iw - edge) {
            isInEdgeZone.current = true
            velocity.current = (iw - edge - e.clientX) * 0.02
          } else {
            isInEdgeZone.current = false
          }
        }}
      >
        <motion.div style={{ x, transition: 'none' }} className="flex will-change-transform">
          {items.map((p, i) => {
            const active = hoveredIndex === i
            return (
              <motion.div
                key={`${p.id}-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => console.log(`Maps to Project: ${p.id}`)}
                className="relative origin-center flex-shrink-0 cursor-pointer overflow-hidden"
                style={{
                  marginRight: gap,
                  height: cardHeight,
                  borderRadius: borderRadius,
                  willChange: 'width, filter',
                }}
                animate={{
                  width: active ? cardExpW : cardBaseW,
                  filter: active ? 'grayscale(0%)' : 'grayscale(100%)',
                }}
                whileTap={{ scale: 0.985 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 45,
                }}
              >
                <img
                  src={setUnsplashWidth(p.img, 1280)}
                  srcSet={buildSrcSet(p.img)}
                  sizes="(min-width: 768px) 533px, 266px"
                  className="pointer-events-none h-full w-full object-cover"
                  alt={p.alt ?? `${p.title}｜${p.cat}`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />

                <div
                  className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
                    active ? 'bg-black/10' : 'bg-black/75'
                  }`}
                />

                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 px-10 text-center"
                    >
                      <p className="mb-3 text-[12px] font-medium tracking-[0.18em] text-white/40">
                        {p.cat}
                      </p>
                      <h3 className="text-4xl font-medium leading-tight tracking-[0.08em] text-white">
                        {p.title}
                      </h3>
                      <div className="mt-6 h-px w-8 bg-white/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <SocialPanel />
      <Footer />
    </main>
  )
}

