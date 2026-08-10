import { Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Lightformer, RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { isWebGLAvailable } from '../../lib/webgl'
import { useDeviceProfile } from '../../lib/useDeviceProfile'
import type { Quality } from '../../lib/types'

/* ------------------------------------------------------------------ */
/* Hero 3D: cinematic floating AC unit with airflow particles          */
/* ------------------------------------------------------------------ */

function pointerParallax(ref: RefObject<THREE.Group>) {
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    current.x = THREE.MathUtils.damp(current.x, target.x, 2.2, delta)
    current.y = THREE.MathUtils.damp(current.y, target.y, 2.2, delta)
    if (ref.current) {
      ref.current.rotation.y = current.x * 0.16
      ref.current.rotation.x = -current.y * 0.1
    }
  })
}

/** Tilts the whole scene back as the user scrolls away from the hero. */
function ScrollTilt({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const p = Math.min(1, window.scrollY / (window.innerHeight * 0.85))
    ref.current.rotation.x = p * 0.5
    ref.current.rotation.z = p * 0.05
    ref.current.position.y = -p * 2.4
  })
  return <group ref={ref}>{children}</group>
}

function ACUnit() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    // Gentle "smooth rotation" sway so every angle catches the light
    ref.current.rotation.y = -0.46 + Math.sin(t * 0.32) * 0.12
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.035
  })

  const slats = [-0.42, -0.14, 0.14, 0.42]

  return (
    <group position={[2.1, 0.55, 0.15]} ref={ref}>
      {/* Main shell */}
      <RoundedBox args={[2.1, 0.66, 0.5]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color="#0b1220" metalness={0.78} roughness={0.32} envMapIntensity={1.1} />
      </RoundedBox>
      {/* Front panel */}
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[1.94, 0.54, 0.04]} />
        <meshStandardMaterial color="#1c2a3c" metalness={0.45} roughness={0.48} />
      </mesh>
      {/* Vertical grille slats */}
      {slats.map((x) => (
        <mesh key={x} position={[x * 0.95, 0.03, 0.3]}>
          <boxGeometry args={[0.17, 0.4, 0.02]} />
          <meshStandardMaterial color="#0d1726" metalness={0.35} roughness={0.6} />
        </mesh>
      ))}
      {/* Top intake */}
      <mesh position={[0, 0.36, 0.06]}>
        <boxGeometry args={[1.82, 0.035, 0.34]} />
        <meshStandardMaterial color="#0a111d" roughness={0.8} />
      </mesh>
      {/* Brand plate */}
      <mesh position={[-0.55, 0.19, 0.31]}>
        <boxGeometry args={[0.5, 0.1, 0.012]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.86, 0.12, 0.31]}>
        <boxGeometry args={[0.2, 0.045, 0.012]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.4} />
      </mesh>
      {/* Bottom glow strip */}
      <mesh position={[0, -0.36, 0.16]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[1.7, 0.3]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Soft cyan light spilling from the unit */}
      <pointLight position={[0, -0.7, 1.1]} intensity={8} distance={7} color="#38bdf8" />
    </group>
  )
}

/** Cool airflow: particles emitted from the unit's outlet, drifting down. */
function CoolingParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const seeds = useMemo(() => new Float32Array(count).map(() => Math.random()), [count])

  useFrame((state, delta) => {
    const points = ref.current
    if (!points) return
    const pos = points.geometry.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      let s = seeds[i] + delta * (0.2 + (i % 6) * 0.045)
      if (s > 1) s -= 1
      seeds[i] = s
      const sway = Math.sin(t * 1.5 + i * 0.8) * 0.14
      pos[i * 3] = 2.05 + sway * (1 - s * 0.4)
      pos[i * 3 + 1] = -0.18 - s * 4.4
      pos[i * 3 + 2] = 0.15 + s * 1.9 + ((i % 9) - 4) * 0.03
    }
    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(count * 3), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#8ee7ff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Scene({ quality }: { quality: Quality }) {
  const parallax = useRef<THREE.Group>(null)
  pointerParallax(parallax)

  const particleCount = quality === 'low' ? 60 : quality === 'medium' ? 140 : 240

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 7, 3]}
        intensity={1.6}
        color="#dbeafe"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[-5, 3, 4]} intensity={22} distance={14} color="#38bdf8" />
      <pointLight position={[-4, 3, -6]} intensity={16} distance={12} color="#2563eb" />

      {/* Offline-safe environment reflections */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} color="#dff6ff" position={[0, 4, -6]} scale={[12, 6, 1]} />
        <Lightformer intensity={2} color="#38bdf8" position={[-6, 1, -1]} rotation-y={Math.PI / 2} scale={[16, 0.8, 1]} />
        <Lightformer intensity={1.2} color="#0ea5e9" position={[6, 0, 0]} rotation-y={-Math.PI / 2} scale={[10, 1.2, 1]} />
      </Environment>

      <ScrollTilt>
        <group ref={parallax}>
          <Float speed={1.6} rotationIntensity={0.22} floatIntensity={0.7} floatingRange={[-0.12, 0.12]}>
            <ACUnit />
          </Float>
          <CoolingParticles count={particleCount} />
        </group>
      </ScrollTilt>

      {/* Shadow catcher floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.15, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>

      {/* Ambient dust */}
      <Sparkles
        count={quality === 'low' ? 20 : 60}
        scale={[13, 6, 8]}
        position={[0, 0.6, -1]}
        size={2}
        speed={0.25}
        color="#7dd3fc"
        opacity={0.35}
      />
    </>
  )
}

export default function Hero3D() {
  const { isMobile, isLowEnd, prefersReducedMotion } = useDeviceProfile()
  const quality: Quality = isLowEnd ? 'low' : isMobile ? 'medium' : 'high'
  const webgl = useMemo(() => isWebGLAvailable(), [])

  if (!webgl || prefersReducedMotion) return null

  return (
    <Canvas
      dpr={quality === 'low' ? 1 : [1, 1.75]}
      camera={{ position: [0, 1.1, 8.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor('#05080c', 0)}
    >
      <Suspense fallback={null}>
        <Scene quality={quality} />
      </Suspense>
    </Canvas>
  )
}
