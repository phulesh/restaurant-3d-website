export interface DeviceProfile {
  isMobile: boolean
  isLowEnd: boolean
  prefersReducedMotion: boolean
}

export type Quality = 'low' | 'medium' | 'high'

export interface Experience3DProps {
  quality: Quality
  /** Pauses the render loop when the section is off-screen. */
  active?: boolean
}
