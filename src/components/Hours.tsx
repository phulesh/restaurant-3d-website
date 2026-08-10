import { useEffect, useState } from 'react'
import { CalendarDays, Moon, Sun } from 'lucide-react'
import Reveal from './Reveal'

interface DayRow {
  day: string
  label: string
  hours: string
  closed: boolean
}

const WEEK: DayRow[] = [
  { day: 'monday', label: 'Monday', hours: '10:00 AM – 10:00 PM', closed: false },
  { day: 'tuesday', label: 'Tuesday', hours: '10:00 AM – 10:00 PM', closed: false },
  { day: 'wednesday', label: 'Wednesday', hours: '10:00 AM – 10:00 PM', closed: false },
  { day: 'thursday', label: 'Thursday', hours: '10:00 AM – 10:00 PM', closed: false },
  { day: 'friday', label: 'Friday', hours: '10:00 AM – 10:00 PM', closed: false },
  { day: 'saturday', label: 'Saturday', hours: '10:00 AM – 10:00 PM', closed: false },
  { day: 'sunday', label: 'Sunday', hours: 'Closed', closed: true },
]

/** Returns the current time in Asia/Kolkata (IST) as a Date-like object. */
function istNow(): { day: number; hours: number; minutes: number; dateLabel: string } {
  const now = new Date()
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const dateLabel = ist.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  return { day: ist.getDay(), hours: ist.getHours(), minutes: ist.getMinutes(), dateLabel }
}

function getStatus() {
  const { day, hours, minutes } = istNow()
  const isSunday = day === 0
  const mins = hours * 60 + minutes
  const openMins = 10 * 60
  const closeMins = 22 * 60
  const open = !isSunday && mins >= openMins && mins < closeMins
  return {
    open,
    isSunday,
    mins,
    remaining: closeMins - mins,
  }
}

export default function Hours() {
  const [, tick] = useState(0)
  useEffect(() => {
    // Keep the OPEN / CLOSED indicator accurate as time passes.
    const id = window.setInterval(() => tick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const status = getStatus()
  const now = istNow()
  const todayIndex = now.day === 0 ? 6 : now.day - 1

  return (
    <section id="hours" className="section-pad relative overflow-hidden bg-[#070b11]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <p className="kicker">
              <span className="eyebrow-line" />
              Business Hours
            </p>
            <h2 className="section-title">
              We&apos;re here when <span className="text-gradient-blue">you need us</span>
            </h2>
            <p className="mt-5 text-slate-400">
              Six days a week, 10 AM to 10 PM — showroom visits, site surveys and service calls.
              Sundays are reserved for rest.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span
                className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-bold ${
                  status.open
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                    : 'border-rose-400/40 bg-rose-400/10 text-rose-300'
                }`}
                role="status"
              >
                {status.open ? (
                  <>
                    <Sun className="h-4 w-4" aria-hidden="true" />
                    OPEN NOW · closes at 10:00 PM
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" aria-hidden="true" />
                    CLOSED NOW
                  </>
                )}
              </span>
              <p className="text-xs text-slate-500">Current time: {now.dateLabel}</p>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-200/90">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
              <p>
                <span className="font-semibold text-amber-200">Indian Independence Day (15 August):</span>{' '}
                hours might differ — call us before visiting.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="glass-strong overflow-hidden rounded-[1.75rem]">
            <ul className="divide-y divide-white/5">
              {WEEK.map((row, i) => {
                const isToday = i === todayIndex
                return (
                  <li
                    key={row.day}
                    className={`flex items-center justify-between gap-4 px-6 py-4 text-sm sm:px-8 ${
                      isToday ? 'bg-cyan-400/10' : ''
                    }`}
                  >
                    <span className={`flex items-center gap-3 font-semibold ${isToday ? 'text-cyan-300' : 'text-white'}`}>
                      {isToday && (
                        <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                          Today
                        </span>
                      )}
                      {row.label}
                    </span>
                    <span className={row.closed ? 'font-semibold text-rose-300/90' : 'text-slate-300 tabular-nums'}>
                      {row.hours}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
