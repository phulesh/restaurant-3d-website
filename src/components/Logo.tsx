import { Snowflake } from 'lucide-react'

export function Logo() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 to-blue-600/25 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
      <Snowflake className="h-5 w-5 text-cyan-300" aria-hidden="true" />
      <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
    </span>
  )
}
