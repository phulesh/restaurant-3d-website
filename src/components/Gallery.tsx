import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { GALLERY_IMAGES } from '../data/content'
import Reveal from './Reveal'

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  const [zoom, setZoom] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const close = useCallback(() => {
    setOpen(null)
    setZoom(false)
  }, [])

  const step = useCallback(
    (dir: 1 | -1) => {
      setZoom(false)
      setOpen((cur) => (cur === null ? cur : (cur + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
    },
    [],
  )

  // Keyboard + body scroll lock
  useEffect(() => {
    if (open === null) return
    document.body.classList.add('lightbox-open')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('lightbox-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, step])

  return (
    <section id="gallery" className="section-pad relative overflow-hidden bg-[#070b11]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            Showroom Gallery
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">Step inside our <span className="text-gradient-blue">Sharda Chowk showroom</span></h2>
          <p className="mt-4 text-slate-400">
            The real Samrat Electronics storefront — displays, equipment and the team behind your
            installation.
          </p>
        </Reveal>

        <div className="mt-14 grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[230px] sm:gap-4 lg:grid-cols-4">
          {GALLERY_IMAGES.map((img, i) => (
            <Reveal key={img.src} delay={(i % 4) * 70} className={img.span ?? ''}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`View larger: ${img.alt}`}
                className="group relative block h-full w-full overflow-hidden rounded-2xl border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-[0.6deg]"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                  <span className="text-left text-xs font-semibold text-white sm:text-sm">{img.caption}</span>
                  <Maximize2 className="h-4 w-4 shrink-0 text-cyan-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <p className="mt-6 text-center text-xs text-slate-500">
            Tap any photo to zoom. Swipe or use the arrow keys to browse.
          </p>
        </Reveal>
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={GALLERY_IMAGES[open].alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <figure
            className="mx-4 w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              touchStart.current = { x: e.clientX, y: e.clientY }
            }}
            onPointerUp={(e) => {
              if (!touchStart.current) return
              const dx = e.clientX - touchStart.current.x
              const dy = e.clientY - touchStart.current.y
              touchStart.current = null
              if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) step(dx > 0 ? -1 : 1)
            }}
          >
            <div
              className="relative max-h-[78vh] overflow-hidden rounded-2xl border border-white/15 bg-black/40"
              onDoubleClick={() => setZoom((z) => !z)}
            >
              <img
                src={GALLERY_IMAGES[open].src}
                alt={GALLERY_IMAGES[open].alt}
                className={`max-h-[78vh] w-full select-none object-contain transition-transform duration-500 ${zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                draggable={false}
              />
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 px-1">
              <span className="text-sm font-medium text-slate-300">{GALLERY_IMAGES[open].caption}</span>
              <span className="text-xs tabular-nums text-slate-500">
                {open + 1} / {GALLERY_IMAGES.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
