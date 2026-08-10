/** Detects WebGL support without throwing on flaky drivers. */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    )
  } catch {
    return false
  }
}
