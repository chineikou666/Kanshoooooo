import { useMemo, useState } from 'react'

const withParams = (baseUrl, width, format) => {
  const url = new URL(baseUrl)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('q', '80')
  if (format) url.searchParams.set('fm', format)
  url.searchParams.set('w', String(width))
  return url.toString()
}

const makeSrcSet = (baseUrl, format, widths) =>
  widths.map((w) => `${withParams(baseUrl, w, format)} ${w}w`).join(', ')

export function SmartImage({
  baseUrl,
  alt,
  className,
  containerClassName = '',
  widths = [480, 720, 960, 1280, 1600, 1920],
  sizes = '(max-width: 768px) 100vw, 50vw',
  loading = 'lazy',
  decoding = 'async',
  showSkeleton = true,
  useResponsiveSources = true,
  fixedWidth = 1280,
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23101010"/><stop offset="100%25" stop-color="%23242424"/></linearGradient></defs><rect width="1200" height="900" fill="url(%23g)"/><circle cx="980" cy="180" r="180" fill="%23353535" opacity="0.35"/><circle cx="210" cy="760" r="260" fill="%233f3f3f" opacity="0.28"/></svg>'

  const responsiveSrcSet = useMemo(() => makeSrcSet(baseUrl, null, widths), [baseUrl, widths])
  const fallbackSrc = useMemo(() => withParams(baseUrl, fixedWidth), [baseUrl, fixedWidth])

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {showSkeleton && !loaded && !failed && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900"
          aria-hidden="true"
        />
      )}
      <img
        src={failed ? FALLBACK_IMAGE : fallbackSrc}
        srcSet={useResponsiveSources && !failed ? responsiveSrcSet : undefined}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          if (failed) return
          setFailed(true)
          const img = event.currentTarget
          img.srcset = ''
          img.src = FALLBACK_IMAGE
        }}
        referrerPolicy="no-referrer"
        draggable="false"
      />
    </div>
  )
}
