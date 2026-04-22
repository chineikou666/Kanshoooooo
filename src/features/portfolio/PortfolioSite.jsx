import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import projects from '../../content/projects.json'
import siteContent from '../../content/siteContent.json'
import { Footer } from './Footer.jsx'
import { InvertingLensCursor } from './InvertingLensCursor.jsx'
import { SmartImage } from './SmartImage.jsx'
import { SocialPanel } from './SocialPanel.jsx'
import { useSeo } from './useSeo.js'

const getLangFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang')
  if (lang === 'en' || lang === 'zh') return lang
  return 'ja'
}

const parsePath = (pathname) => {
  const detailMatch = pathname.match(/^\/projects\/([^/]+)\/?$/)
  if (detailMatch) return { page: 'detail', slug: decodeURIComponent(detailMatch[1]) }
  return { page: 'home', slug: null }
}

const withQuery = (path, lang) => {
  const search = lang === 'ja' ? '' : `?lang=${lang}`
  return `${path}${search}`
}

const toOgImage = (baseUrl) => {
  const url = new URL(baseUrl)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('fm', 'jpg')
  url.searchParams.set('w', '1200')
  url.searchParams.set('q', '80')
  return url.toString()
}

const toCoverImage = (baseUrl) => {
  const url = new URL(baseUrl)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('q', '80')
  url.searchParams.set('w', '1400')
  return url.toString()
}

const coverWidths = [480, 720, 960, 1280, 1600, 1920]
const COVER_FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23141414"/><stop offset="100%25" stop-color="%23242424"/></linearGradient></defs><rect width="1200" height="1600" fill="url(%23g)"/></svg>'

const toCoverSrcSet = (baseUrl, format) =>
  coverWidths
    .map((width) => {
      const url = new URL(baseUrl)
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      url.searchParams.set('q', '80')
      url.searchParams.set('w', String(width))
      if (format) url.searchParams.set('fm', format)
      return `${url.toString()} ${width}w`
    })
    .join(', ')

function LanguageSwitcher({ lang, onChange }) {
  const options = [
    { code: 'ja', label: '日本語' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
  ]

  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-xs">
      {options.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded-full px-3 py-1 transition ${
            lang === code ? 'bg-white text-black' : 'text-white/70 hover:text-white'
          }`}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function HomePage({ lang, text, onLanguageChange, onOpenProject }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [coversReady, setCoversReady] = useState(false)
  const [centerCardIndex, setCenterCardIndex] = useState(0)
  const [preloadRadius, setPreloadRadius] = useState(6)
  const REPEAT_SETS = 3
  const MIDDLE_SET_INDEX = 1
  const cardBaseW = 266
  const cardExpW = 533
  const gap = 32
  const cardHeight = '68vh'
  const items = useMemo(() => Array.from({ length: REPEAT_SETS }, () => projects).flat(), [])
  const setW = projects.length * (cardBaseW + gap)
  const x = useMotionValue(-(setW * MIDDLE_SET_INDEX))
  const velocity = useRef(0)
  const isInEdgeZone = useRef(false)
  const cardRefs = useRef([])
  const totalCards = items.length
  const [ioReadyIndices, setIoReadyIndices] = useState(() => new Set())

  const DAMPING = 0.94
  const STOP_THRESHOLD = 0.01
  const BASE_DRIFT = 0.06

  const coverMap = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.slug, toCoverImage(project.images[0])])),
    []
  )
  const coverSrcSetMap = useMemo(
    () =>
      Object.fromEntries(
        projects.map((project) => [
          project.slug,
          {
            avif: toCoverSrcSet(project.images[0], 'avif'),
            webp: toCoverSrcSet(project.images[0], 'webp'),
            fallback: toCoverSrcSet(project.images[0]),
          },
        ])
      ),
    []
  )

  useEffect(() => {
    const updateRadius = () => {
      const cardsInView = Math.ceil(window.innerWidth / (cardBaseW + gap))
      setPreloadRadius(Math.max(6, cardsInView + 2))
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  useEffect(() => {
    let disposed = false
    const urls = [...new Set(Object.values(coverMap))]

    const preload = async () => {
      await Promise.all(
        urls.map(async (url) => {
          const img = new Image()
          img.src = url
          try {
            if (img.decode) await img.decode()
          } catch {
            // continue
          }
        })
      )
      if (!disposed) setCoversReady(true)
    }

    preload()
    return () => {
      disposed = true
    }
  }, [coverMap])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIoReadyIndices((prev) => {
          const next = new Set(prev)
          let changed = false
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const idx = Number(entry.target.dataset.cardIndex)
            if (!Number.isNaN(idx) && !next.has(idx)) {
              next.add(idx)
              changed = true
            }
          })
          return changed ? next : prev
        })
      },
      {
        root: null,
        rootMargin: '0px 1000px 0px 0px',
        threshold: 0.01,
      }
    )

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [items.length])

  useMotionValueEvent(x, 'change', (latest) => {
    const viewportCenter = window.innerWidth * 0.5
    const pitch = cardBaseW + gap
    const rawIndex = Math.round((viewportCenter - latest) / pitch)
    const wrappedIndex = ((rawIndex % totalCards) + totalCards) % totalCards
    setCenterCardIndex((prev) => (prev === wrappedIndex ? prev : wrappedIndex))
  })

  useAnimationFrame(() => {
    if (!coversReady) return
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
    <main className="flex h-screen w-full cursor-none flex-col items-center justify-center overflow-hidden bg-[#171717] font-sans antialiased text-white">
      <style>{`canvas, body { cursor: none !important; }`}</style>

      <header className="fixed left-0 top-0 z-40 w-full">
        <div className="flex w-full flex-col items-start pb-8 pl-8 pr-32 pt-10 md:pl-12">
          <h1 className="text-[34px] font-light tracking-[0.52em] text-white/90 md:text-[40px]">HAS.WORKS</h1>
          <nav aria-label="Primary" className="mt-7 flex gap-8 text-[10px] tracking-[0.36em] text-white/50 md:gap-12">
            {text.nav.map((item) => (
              <motion.button
                key={item}
                type="button"
                className="group relative pb-1 text-white/45 transition-colors"
                whileHover={{ y: -1, color: 'rgba(255,255,255,0.9)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {item}
                <motion.span className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-white/75 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </motion.button>
            ))}
          </nav>
        </div>
        <div className="absolute right-8 top-7 opacity-70">
          <LanguageSwitcher lang={lang} onChange={onLanguageChange} />
        </div>
      </header>

      <InvertingLensCursor isHovered={hoveredIndex !== null} />

      <div
        className="flex w-full flex-grow items-center"
        onMouseLeave={() => {
          isInEdgeZone.current = false
        }}
        onMouseMove={(e) => {
          if (!coversReady) return
          if (hoveredIndex !== null) return
          const iw = window.innerWidth
          const edge = iw * 0.2
          if (e.clientX < edge) {
            isInEdgeZone.current = true
            velocity.current = (edge - e.clientX) * 0.0117
          } else if (e.clientX > iw - edge) {
            isInEdgeZone.current = true
            velocity.current = (iw - edge - e.clientX) * 0.0117
          } else {
            isInEdgeZone.current = false
          }
        }}
      >
        <motion.div
          style={{ x, transform: 'translate3d(0,0,0)' }}
          className="flex will-change-transform [backface-visibility:hidden]"
        >
          {items.map((project, i) => {
            const active = hoveredIndex === i
            const distanceFromCenter = Math.abs(i - centerCardIndex)
            const mirroredDistance = Math.min(distanceFromCenter, totalCards - distanceFromCenter)
            const isNearViewport = mirroredDistance <= preloadRadius
            const shouldLoadNow = isNearViewport || ioReadyIndices.has(i)
            return (
              <motion.button
                key={`${project.id}-${i}`}
                type="button"
                ref={(node) => {
                  cardRefs.current[i] = node
                }}
                data-card-index={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onOpenProject(project.slug)}
                aria-label={`${project.title[lang]} ${text.openProject}`}
                className="relative flex-shrink-0 overflow-hidden rounded-[24px] text-left"
                style={{
                  marginRight: gap,
                  height: cardHeight,
                  width: cardBaseW,
                  willChange: 'width, filter',
                }}
                animate={{
                  width: active ? cardExpW : cardBaseW,
                  zIndex: active ? 20 : 1,
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 45 }}
              >
                {coversReady ? (
                  <picture>
                    <source type="image/avif" srcSet={coverSrcSetMap[project.slug].avif} sizes="(max-width: 768px) 72vw, 533px" />
                    <source type="image/webp" srcSet={coverSrcSetMap[project.slug].webp} sizes="(max-width: 768px) 72vw, 533px" />
                    <img
                      src={coverMap[project.slug]}
                      srcSet={coverSrcSetMap[project.slug].fallback}
                      sizes="(max-width: 768px) 72vw, 533px"
                      alt={`${project.title[lang]} cover`}
                      className={`h-full w-full object-cover transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-90'}`}
                      loading={shouldLoadNow ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={isNearViewport ? 'high' : 'auto'}
                      referrerPolicy="no-referrer"
                      draggable="false"
                      onError={(event) => {
                        const img = event.currentTarget
                        const picture = img.closest('picture')
                        picture?.querySelectorAll('source').forEach((source) => {
                          source.srcset = ''
                        })
                        img.srcset = ''
                        img.src = COVER_FALLBACK_IMAGE
                      }}
                      style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', contain: 'paint' }}
                    />
                  </picture>
                ) : (
                  <div className="h-full w-full animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
                )}

                <div
                  className={`absolute inset-0 z-10 transition-opacity duration-500 ${
                    active ? 'bg-black/10' : 'bg-black/75'
                  }`}
                />

                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-end px-10 pb-16 text-center"
                    >
                      <p className="mb-3 text-[12px] font-medium tracking-[0.18em] text-white/40">
                        {project.category[lang]}
                      </p>
                      <h3 className="text-4xl font-medium leading-tight tracking-[0.08em] text-white">
                        {project.title[lang]}
                      </h3>
                      <p className="mt-4 text-[11px] tracking-[0.16em] text-white/75">{text.openProject}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </main>
  )
}

function DetailPage({
  lang,
  text,
  project,
  previousProject,
  nextProject,
  onBack,
  onOpenProject,
  onLanguageChange,
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) {
        setProgress(0)
        return
      }
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onBack()
      if (event.key === 'ArrowLeft' && previousProject) onOpenProject(previousProject.slug)
      if (event.key === 'ArrowRight' && nextProject) onOpenProject(nextProject.slug)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onBack, onOpenProject, previousProject, nextProject])

  return (
    <main className="min-h-screen bg-black pb-28 text-white">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-white/10" aria-hidden="true">
        <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md md:px-12">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs tracking-[0.14em] text-white/80 transition hover:border-white/50 hover:text-white"
          >
            {text.backToHome}
          </button>
          <LanguageSwitcher lang={lang} onChange={onLanguageChange} />
        </div>
      </header>

      <article className="px-6 pt-8 md:px-12 md:pt-10">
        <section className="relative overflow-hidden rounded-[24px] border border-white/10">
          <SmartImage
            baseUrl={project.images[0]}
            alt={`${project.title[lang]} hero`}
            containerClassName="h-[62vh] min-h-[380px]"
            className="h-full w-full object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 px-8 pb-10 md:px-12">
            <p className="text-xs tracking-[0.18em] text-white/55">
              {project.year} / {project.category[lang]} / {project.role[lang]}
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-[0.08em] md:text-6xl">{project.title[lang]}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/75">{project.excerpt[lang]}</p>
          </div>
        </section>

        <section className="mt-12">
          <div className="mt-5 grid grid-cols-1 gap-4 text-sm leading-relaxed text-white/75 md:grid-cols-2 md:text-base">
            {project.description[lang].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
            {project.images.slice(1).map((image, idx) => (
              <SmartImage
                key={image}
                baseUrl={image}
                alt={`${project.title[lang]} ${idx + 2}`}
                containerClassName={`h-[36vh] min-h-[220px] rounded-xl border border-white/10 ${
                  idx % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2'
                }`}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ))}
          </div>
        </section>

        <nav className="mt-10 flex flex-wrap gap-3 pb-6" aria-label="Project navigation">
          <button
            type="button"
            onClick={() => previousProject && onOpenProject(previousProject.slug)}
            disabled={!previousProject}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs tracking-[0.14em] text-white/80 transition hover:border-white/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            {text.previousProject}
          </button>
          <button
            type="button"
            onClick={() => nextProject && onOpenProject(nextProject.slug)}
            disabled={!nextProject}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs tracking-[0.14em] text-white/80 transition hover:border-white/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            {text.nextProject}
          </button>
        </nav>
      </article>
    </main>
  )
}

export default function PortfolioSite() {
  const [lang, setLang] = useState(getLangFromUrl())
  const [route, setRoute] = useState(parsePath(window.location.pathname))
  const text = siteContent[lang]

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    const onPopState = () => {
      setLang(getLangFromUrl())
      setRoute(parsePath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const updateUrl = (path, nextLang, mode = 'push') => {
    const target = withQuery(path, nextLang)
    if (mode === 'replace') window.history.replaceState({}, '', target)
    else window.history.pushState({}, '', target)
  }

  const onLanguageChange = (nextLang) => {
    setLang(nextLang)
    updateUrl(window.location.pathname, nextLang, 'replace')
  }

  const onOpenProject = (slug) => {
    const path = `/projects/${encodeURIComponent(slug)}`
    updateUrl(path, lang)
    setRoute({ page: 'detail', slug })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const onBack = () => {
    updateUrl('/', lang)
    setRoute({ page: 'home', slug: null })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const currentProjectIndex = useMemo(
    () => projects.findIndex((project) => project.slug === route.slug),
    [route.slug]
  )
  const currentProject = currentProjectIndex >= 0 ? projects[currentProjectIndex] : null
  const previousProject = currentProjectIndex > 0 ? projects[currentProjectIndex - 1] : null
  const nextProject =
    currentProjectIndex >= 0 && currentProjectIndex < projects.length - 1
      ? projects[currentProjectIndex + 1]
      : null

  const seoTitle =
    route.page === 'detail' && currentProject
      ? `${currentProject.title[lang]} | HAS.WORKS`
      : text.seoHomeTitle
  const seoDescription =
    route.page === 'detail' && currentProject ? currentProject.excerpt[lang] : text.seoHomeDescription
  const seoImage =
    route.page === 'detail' && currentProject
      ? toOgImage(currentProject.images[0])
      : toOgImage(projects[0].images[0])

  useSeo({ title: seoTitle, description: seoDescription, image: seoImage })

  return (
    <>
      {route.page === 'detail' && currentProject ? (
        <DetailPage
          lang={lang}
          text={text}
          project={currentProject}
          previousProject={previousProject}
          nextProject={nextProject}
          onBack={onBack}
          onOpenProject={onOpenProject}
          onLanguageChange={onLanguageChange}
        />
      ) : (
        <HomePage lang={lang} text={text} onLanguageChange={onLanguageChange} onOpenProject={onOpenProject} />
      )}

      <SocialPanel />
      <Footer />
    </>
  )
}
