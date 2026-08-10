import { ExternalLink, MapPin, Navigation } from 'lucide-react'
import { BUSINESS } from '../lib/business'
import Reveal from './Reveal'

export default function Location() {
  return (
    <section id="location" className="section-pad relative overflow-hidden">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            Find Us
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">Visit the showroom at <span className="text-gradient-blue">Sharda Chowk</span></h2>
          <p className="mt-4 text-slate-400">
            Right in the heart of Raipur — easy to reach from every direction.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {/* Map (key-free Google embed) */}
          <Reveal className="lg:col-span-3">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-[1.75rem] border border-white/10">
              <iframe
                title="Samrat Electronics location – Sharda Chowk, Raipur"
                src={BUSINESS.mapsEmbed}
                className="absolute inset-0 h-full w-full"
                style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) saturate(0.4) brightness(0.9)' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </Reveal>

          {/* Address card */}
          <Reveal delay={120} className="lg:col-span-2">
            <div className="glass-strong flex h-full flex-col justify-between rounded-[1.75rem] p-8">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                  <MapPin className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">Samrat Electronics — HVAC Solutions</h3>
                <address className="mt-3 text-sm not-italic leading-relaxed text-slate-300">
                  {BUSINESS.addressLines[0]}
                  <br />
                  {BUSINESS.addressLines[1]}
                </address>
                <p className="mt-3 text-xs text-slate-500">Landmark: Sharda Chowk, near RDA Building</p>
              </div>
              <a
                href={BUSINESS.mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-8 w-full !py-3.5 text-sm"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get Directions
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
