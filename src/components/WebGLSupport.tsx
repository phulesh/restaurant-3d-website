import { AlertTriangle, Phone } from 'lucide-react'
import { BUSINESS } from '../lib/business'

/** Graceful fallback shown when WebGL is unavailable. */
export function WebGLFallback() {
  return (
    <div className="flex min-h-[420px] items-center justify-center bg-[#070b10]">
      <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
          <AlertTriangle className="h-6 w-6 text-amber-300" aria-hidden="true" />
        </span>
        <h3 className="font-display text-lg font-bold text-white">3D view unavailable</h3>
        <p className="mt-2 text-sm text-slate-400">
          Your browser or device does not support WebGL, which this 3D experience needs. The rest of
          the site works perfectly — and we&apos;re just a call away.
        </p>
        <a href={BUSINESS.phoneHref} className="btn-primary mt-6 px-6! py-3! text-sm">
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call {BUSINESS.phoneDisplay}
        </a>
      </div>
    </div>
  )
}
