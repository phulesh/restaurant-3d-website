import { useEffect, useState } from 'react'
import type { DeviceProfile } from '../lib/types'

/** Snapshot of the device's capabilities, used to scale 3D fidelity. */
export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => {
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(pointer: coarse) and (max-width: 768px)')
    const nav = (typeof navigator !== 'undefined' ? navigator : null) as
      | (Navigator & { deviceMemory?: number; hardwareConcurrency?: number })
      | null
    const isLowEnd = (nav?.deviceMemory ?? 8) <= 4 || (nav?.hardwareConcurrency ?? 8) <= 4
    return {
      isMobile: mqMobile.matches || window.innerWidth < 768,
      isLowEnd,
      prefersReducedMotion: mqReduced.matches,
    }
  })

  useEffect(() => {
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(pointer: coarse) and (max-width: 768px)')
    const nav = (typeof navigator !== 'undefined' ? navigator : null) as
      | (Navigator & { deviceMemory?: number; hardwareConcurrency?: number })
      | null
    const isLowEnd = (nav?.deviceMemory ?? 8) <= 4 || (nav?.hardwareConcurrency ?? 8) <= 4
    const update = () =>
      setProfile({
        isMobile: mqMobile.matches || window.innerWidth < 768,
        isLowEnd,
        prefersReducedMotion: mqReduced.matches,
      })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return profile
}
