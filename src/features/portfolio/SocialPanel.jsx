import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const SOCIAL_ITEMS = [
  {
    id: 'instagram',
    short: 'IG',
    platform: 'INSTAGRAM',
    handle: '@HAS.WORKS',
    url: 'https://instagram.com/has.works',
  },
  {
    id: 'behance',
    short: 'BH',
    platform: 'BEHANCE',
    handle: '@HASWORKS',
    url: 'https://behance.net/hasworks',
  },
  {
    id: 'x',
    short: 'X',
    platform: 'X',
    handle: '@HASWORKS',
    url: 'https://x.com/hasworks',
  },
  {
    id: 'youtube',
    short: 'YT',
    platform: 'YOUTUBE',
    handle: '@HASWORKS',
    url: 'https://www.youtube.com/@hasworks',
  },
  {
    id: 'red',
    short: 'RED',
    platform: 'RED',
    handle: '@HASWORKS',
    url: 'https://www.xiaohongshu.com/user/profile/hasworks',
  },
  {
    id: 'weibo',
    short: 'WB',
    platform: 'WEIBO',
    handle: '@HASWORKS',
    url: 'https://weibo.com/hasworks',
  },
  {
    id: 'douyin',
    short: 'DY',
    platform: 'DOUYIN',
    handle: '@HASWORKS',
    url: 'https://www.douyin.com/user/hasworks',
  },
]

const makeQrUrl = (value) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=0&color=000000&bgcolor=FFFFFF&data=${encodeURIComponent(
    value
  )}`

const makeQrFallback = (label) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#fff"/><g fill="#000"><rect x="18" y="18" width="30" height="30"/><rect x="54" y="18" width="12" height="12"/><rect x="72" y="18" width="24" height="24"/><rect x="102" y="18" width="12" height="12"/><rect x="122" y="18" width="24" height="24"/><rect x="152" y="18" width="14" height="14"/><rect x="174" y="18" width="30" height="30"/><rect x="18" y="54" width="12" height="12"/><rect x="38" y="54" width="24" height="24"/><rect x="70" y="54" width="14" height="14"/><rect x="92" y="54" width="30" height="30"/><rect x="128" y="54" width="12" height="12"/><rect x="146" y="54" width="24" height="24"/><rect x="176" y="54" width="14" height="14"/><rect x="18" y="92" width="24" height="24"/><rect x="48" y="92" width="12" height="12"/><rect x="66" y="92" width="26" height="26"/><rect x="98" y="92" width="14" height="14"/><rect x="120" y="92" width="18" height="18"/><rect x="146" y="92" width="14" height="14"/><rect x="168" y="92" width="36" height="36"/><rect x="18" y="132" width="12" height="12"/><rect x="38" y="132" width="28" height="28"/><rect x="74" y="132" width="12" height="12"/><rect x="92" y="132" width="24" height="24"/><rect x="124" y="132" width="12" height="12"/><rect x="142" y="132" width="26" height="26"/><rect x="176" y="132" width="12" height="12"/><rect x="18" y="170" width="30" height="30"/><rect x="54" y="170" width="12" height="12"/><rect x="74" y="170" width="24" height="24"/><rect x="104" y="170" width="12" height="12"/><rect x="122" y="170" width="30" height="30"/><rect x="158" y="170" width="12" height="12"/><rect x="176" y="170" width="30" height="30"/></g><text x="120" y="228" text-anchor="middle" font-size="12" fill="#000" font-family="JetBrains Mono, monospace">${label}</text></svg>`
  )}`

function IconGlyph({ id }) {
  if (id === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
        <circle cx="12" cy="12" r="3.3" />
        <circle cx="16.7" cy="7.3" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'behance') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7.5h4.6c1.8 0 3 1 3 2.5 0 1-.5 1.7-1.3 2.1.9.3 1.7 1.1 1.7 2.4 0 1.8-1.3 2.9-3.4 2.9H5z" />
        <path d="M7 10.8h2.3c.9 0 1.4-.3 1.4-1s-.6-1-1.4-1H7zm0 4.4h2.6c1 0 1.6-.4 1.6-1.2s-.6-1.2-1.6-1.2H7z" />
        <path d="M14.8 8h4.4M15 13h4.7M15 15.8h4.7" />
      </svg>
    )
  }
  if (id === 'x') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M5.5 5.5h3.2l7.1 13h-3.2zM18.5 5.5 5.5 18.5" />
      </svg>
    )
  }
  if (id === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.8" y="6.8" width="16.4" height="10.4" rx="3.2" />
        <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'red') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="3.5" />
        <path d="M7 10h10M7 14h10" />
      </svg>
    )
  }
  if (id === 'weibo') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 9.2c2.2 1.3 2.4 4 .5 5.9-2.1 2.2-6.3 2.8-9 1.3-2.1-1.1-2.6-3.4-1.3-5.4 1.2-1.8 3.7-2.9 5.8-2.6.4-1.1 1.6-1.8 2.8-1.4 1 .3 1.7 1.2 1.8 2.2z" />
        <ellipse cx="11.3" cy="13.1" rx="2.1" ry="1.6" />
        <circle cx="11.3" cy="13.1" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12.5 5.2c1.7 0 3 1.1 3 2.5 0 .7-.3 1.3-.8 1.8.7.3 1.2.7 1.6 1.3 1 1.6.7 3.8-.8 5.1-1.4 1.2-3.4 1.8-5.1 1.5-1.4-.2-2.7-.9-3.4-2-1-1.5-.6-3.4.8-4.8 1-.9 2.2-1.4 3.4-1.5a2.6 2.6 0 0 1 1.3-3.9z" />
      <path d="M10.2 10.2v5.4M13.8 9.8v6.2" />
    </svg>
  )
}

export function SocialPanel() {
  const [hoveredId, setHoveredId] = useState(null)
  const [isDesktopHover, setIsDesktopHover] = useState(false)
  const [qrFailed, setQrFailed] = useState({})

  const socials = useMemo(
    () =>
      SOCIAL_ITEMS.map((item) => ({
        ...item,
        qrUrl: makeQrUrl(item.url),
        qrFallback: makeQrFallback(item.short),
      })),
    []
  )

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)')
    const apply = () => setIsDesktopHover(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  return (
    <div className="fixed bottom-10 right-12 z-50 flex items-end gap-3 overflow-visible">
      {socials.map((item, index) => {
        const active = hoveredId === item.id && isDesktopHover
        const isRightClamped = index >= socials.length - 2
        return (
          <div
            key={item.id}
            className="relative flex w-11 justify-center"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <motion.a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${item.platform} ${item.handle}`}
              className="group block"
              whileTap={{ scale: 0.96 }}
              whileHover={
                isDesktopHover
                  ? {
                      y: -4,
                      scale: 1.05,
                    }
                  : {}
              }
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <motion.span
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-white/5 text-white/80 backdrop-blur-md"
                whileHover={
                  isDesktopHover
                    ? {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                      }
                    : {}
                }
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <IconGlyph id={item.id} />
              </motion.span>
            </motion.a>

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
                  className={`pointer-events-none absolute bottom-full z-50 mb-5 w-[176px] rounded-[16px] border border-white/10 bg-white/5 p-3 backdrop-blur-xl ${
                    isRightClamped
                      ? 'right-0 origin-right'
                      : 'left-1/2 -translate-x-1/2 origin-center'
                  }`}
                >
                  <p className="mb-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white">
                    {item.handle}
                  </p>
                  <div className="overflow-hidden rounded-[10px] border-2 border-white bg-white p-1.5">
                    <img
                      src={qrFailed[item.id] ? item.qrFallback : item.qrUrl}
                      alt={`${item.short} QR`}
                      className="h-[132px] w-[132px] grayscale"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => setQrFailed((prev) => ({ ...prev, [item.id]: true }))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
