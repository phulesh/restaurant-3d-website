import { Phone } from 'lucide-react'
import { BUSINESS } from '../lib/business'

export default function StickyCall() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <a
        href={BUSINESS.phoneHref}
        className="btn-primary w-full !py-4 text-base shadow-[0_-6px_30px_-8px_rgba(56,189,248,0.5)]"
        aria-label={`Call Samrat Electronics now at ${BUSINESS.phoneDisplay}`}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        Call Now · {BUSINESS.phoneDisplay}
      </a>
    </div>
  )
}
