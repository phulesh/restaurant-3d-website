import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/* Lightweight 3D vignettes for Hospitals / Commercial / Residential   */
/* ------------------------------------------------------------------ */

function Room({ warm = false }: { warm?: boolean }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color={warm ? '#16100c' : '#0b1320'} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.2, -4.5]}>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color={warm ? '#171210' : '#0c1420'} roughness={0.9} />
      </mesh>
      <mesh position={[-7, 2.2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[9, 4.4]} />
        <meshStandardMaterial color={warm ? '#141010' : '#0a111c'} roughness={0.9} />
      </mesh>
      <mesh position={[7, 2.2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[9, 4.4]} />
        <meshStandardMaterial color={warm ? '#141010' : '#0a111c'} roughness={0.9} />
      </mesh>
    </group>
  )
}

function MiniAC({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <RoundedBox args={[1.5, 0.46, 0.34]} radius={0.05} smoothness={3}>
        <meshStandardMaterial color="#0d1524" metalness={0.7} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.18]}>
        <boxGeometry args={[1.38, 0.36, 0.03]} />
        <meshStandardMaterial color="#1c2a3c" metalness={0.4} roughness={0.5} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <mesh key={x} position={[x * 0.95, 0.02, 0.21]}>
          <boxGeometry args={[0.11, 0.26, 0.02]} />
          <meshStandardMaterial color="#0d1726" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.58, 0.06, 0.22]}>
        <boxGeometry args={[0.14, 0.03, 0.01]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

/** Particles drifting down from an AC outlet. */
function Drift({ count, from, spread = 0.5 }: { count: number; from: [number, number, number]; spread?: number }) {
  const ref = useRef<THREE.Points>(null)
  const seeds = useMemo(() => new Float32Array(count).map(() => Math.random()), [count])

  useFrame((state, delta) => {
    const points = ref.current
    if (!points) return
    const pos = points.geometry.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      let s = seeds[i] + delta * (0.16 + (i % 5) * 0.04)
      if (s > 1) s -= 1
      seeds[i] = s
      pos[i * 3] = from[0] + Math.sin(t * 1.3 + i * 0.9) * 0.1 + ((i % 7) - 3) * 0.06 * spread
      pos[i * 3 + 1] = from[1] - 0.05 - s * 2.8
      pos[i * 3 + 2] = from[2] + s * 1.1
    }
    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(count * 3), 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
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

/* ------------------------------- Hospital ------------------------------- */

function HospitalScene() {
  return (
    <group>
      <Room />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={1.2} color="#e8f4ff" />
      <pointLight position={[-3, 2.5, 2]} intensity={12} distance={8} color="#7dd3fc" />

      {/* Wall AC over the bed */}
      <MiniAC position={[-2.2, 2.5, -4.2]} rotationY={Math.PI} />
      <Drift count={26} from={[-2.2, 2.1, -3.9]} />

      {/* Hospital bed */}
      <group position={[-2.2, 0, -2.6]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[1.5, 0.3, 2.0]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[1.4, 0.14, 1.9]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        <mesh position={[-0.72, 0.66, 0]}>
          <boxGeometry args={[0.05, 0.5, 1.9]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.72, 0.66, 0]}>
          <boxGeometry args={[0.05, 0.5, 1.9]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.75, -0.98]}>
          <boxGeometry args={[1.5, 0.42, 0.06]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* IV stand */}
      <group position={[-3.4, 0, -2.6]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.72, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.015, 0.015, 0.55, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.34, 1.5, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.26, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
      </group>

      {/* Medical cross glow */}
      <group position={[2.4, 2.6, -4.45]}>
        <mesh>
          <boxGeometry args={[0.34, 0.85, 0.04]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.8} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.85, 0.34, 0.04]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <Sparkles count={16} scale={[7, 3, 5]} position={[0, 1.5, -1]} size={1.4} speed={0.2} color="#7dd3fc" opacity={0.28} />
    </group>
  )
}

/* ------------------------------ Commercial ------------------------------ */

function CommercialScene() {
  return (
    <group>
      <Room />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 4]} intensity={1.3} color="#dff0ff" />
      <pointLight position={[3, 2.5, 2]} intensity={14} distance={9} color="#38bdf8" />

      {/* City window glow */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <mesh key={x} position={[x * 1.6 + 2, 2.4, -4.45]}>
          <planeGeometry args={[0.9, 1.7]} />
          <meshBasicMaterial color={['#7dd3fc', '#a5b4fc', '#6ee7b7'][i]} transparent opacity={0.5 - i * 0.08} />
        </mesh>
      ))}
      <mesh position={[1.6, 2.4, -4.43]}>
        <boxGeometry args={[4.6, 0.06, 0.04]} />
        <meshStandardMaterial color="#111a28" />
      </mesh>

      {/* Ceiling duct */}
      <mesh position={[-2, 3.9, -1]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.28, 0.28, 5, 18]} />
        <meshStandardMaterial color="#243247" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-3.2, 3.62, -1]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.16, 0.16, 0.7, 14]} />
        <meshStandardMaterial color="#243247" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Wall AC */}
      <MiniAC position={[-3.6, 2.4, -3.9]} rotationY={Math.PI} />
      <Drift count={26} from={[-3.6, 2.0, -3.6]} />

      {/* Desk + chair */}
      <group position={[3, 0, -2.2]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[2.0, 0.08, 0.9]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[-0.85, 0.19, -0.34]}>
          <boxGeometry args={[0.08, 0.38, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.85, 0.19, -0.34]}>
          <boxGeometry args={[0.08, 0.38, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* monitor */}
        <mesh position={[0, 0.62, -0.15]}>
          <boxGeometry args={[0.5, 0.32, 0.03]} />
          <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 0.43, -0.15]}>
          <boxGeometry args={[0.1, 0.14, 0.03]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <group position={[2.1, 0, -1.6]}>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.08, 18]} />
          <meshStandardMaterial color="#0f766e" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.5, 10]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.95, 0.05]} rotation-x={-0.5}>
          <boxGeometry args={[0.55, 0.5, 0.08]} />
          <meshStandardMaterial color="#0f766e" metalness={0.3} roughness={0.6} />
        </mesh>
      </group>

      <Sparkles count={16} scale={[8, 3, 6]} position={[0, 1.8, -1]} size={1.6} speed={0.22} color="#7dd3fc" opacity={0.3} />
    </group>
  )
}

/* ------------------------------ Residential ----------------------------- */

function ResidentialScene() {
  return (
    <group>
      <Room warm />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 4]} intensity={1.1} color="#ffe9c9" />
      <pointLight position={[-3, 2, 2]} intensity={12} distance={9} color="#7dd3fc" />

      {/* Wall AC */}
      <MiniAC position={[-3.6, 2.3, -3.8]} rotationY={Math.PI} />
      <Drift count={24} from={[-3.6, 1.9, -3.5]} />

      {/* Sofa */}
      <group position={[1.4, 0, -2.4]}>
        <mesh position={[0, 0.26, 0.1]} castShadow>
          <boxGeometry args={[2.1, 0.34, 0.9]} />
          <meshStandardMaterial color="#334155" metalness={0.15} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.66, -0.12]}>
          <boxGeometry args={[2.1, 0.55, 0.26]} />
          <meshStandardMaterial color="#334155" metalness={0.15} roughness={0.75} />
        </mesh>
        <mesh position={[-0.92, 0.42, 0.12]} rotation-y={-Math.PI / 10}>
          <boxGeometry args={[0.22, 0.5, 0.9]} />
          <meshStandardMaterial color="#3b4a5f" metalness={0.15} roughness={0.75} />
        </mesh>
        <mesh position={[0.92, 0.42, 0.12]} rotation-y={Math.PI / 10}>
          <boxGeometry args={[0.22, 0.5, 0.9]} />
          <meshStandardMaterial color="#3b4a5f" metalness={0.15} roughness={0.75} />
        </mesh>
        <mesh position={[0.6, 0.48, 0.18]}>
          <boxGeometry args={[0.6, 0.14, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.1} roughness={0.85} />
        </mesh>
      </group>

      {/* Floor lamp */}
      <group position={[2.9, 0, -2.6]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 1.6, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <cylinderGeometry args={[0.3, 0.34, 0.22, 18, 1, true]} />
          <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={1.6} />
        </mesh>
        <pointLight position={[0, 1.6, 0]} intensity={6} distance={5} color="#fbbf24" />
      </group>

      {/* Rug */}
      <mesh rotation-x={-Math.PI / 2} position={[0.6, 0.015, -1.2]}>
        <cylinderGeometry args={[1.6, 1.6, 0.02, 28]} />
        <meshStandardMaterial color="#134e4a" roughness={0.95} />
      </mesh>

      {/* Picture frame */}
      <group position={[2.2, 2.2, -4.45]}>
        <mesh>
          <boxGeometry args={[0.95, 0.72, 0.04]} />
          <meshStandardMaterial color="#1c2a3c" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.85, 0.62]} />
          <meshStandardMaterial color="#0e7490" emissive="#0e7490" emissiveIntensity={0.4} />
        </mesh>
      </group>

      <Sparkles count={14} scale={[8, 3, 6]} position={[0, 1.6, -1]} size={1.5} speed={0.18} color="#fbbf24" opacity={0.22} />
    </group>
  )
}

/* --------------------------------- Root --------------------------------- */

export default function AppScene3D({ scene, active = true }: { scene: string; active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.9, 5.2], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor('#05080c', 1)}
    >
      {scene === 'hospital' && <HospitalScene />}
      {scene === 'commercial' && <CommercialScene />}
      {scene === 'residential' && <ResidentialScene />}
    </Canvas>
  )
}
