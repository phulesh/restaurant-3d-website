import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export interface IconItem {
  type: string
  el: HTMLElement | null
}

/**
 * A single WebGL canvas that renders one procedural 3D icon per card.
 * Icons track the DOM card positions every frame, so the grid stays
 * perfectly responsive with only ONE canvas (great for Android).
 */
export default function IconGrid3D({ items, className = '' }: { items: IconItem[]; className?: string }) {
  const [inView, setInView] = useState(false)
  const [ever, setEver] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setEver(true)
      },
      { rootMargin: '500px 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  const visible = ever && items.some((i) => i.el)

  return (
    <div ref={rootRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {visible && (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ pointerEvents: 'none' }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.3} />
          <pointLight position={[-3, 2, 3]} intensity={14} distance={10} color="#38bdf8" />
          {items.map(
            (item, i) => item.el && <TrackedIcon key={item.type} el={item.el} type={item.type} index={i} />,
          )}
        </Canvas>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Per-icon tracking + floating                                        */
/* ------------------------------------------------------------------ */

function TrackedIcon({ el, type, index }: { el: HTMLElement; type: string; index: number }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const x = (cx / state.size.width - 0.5) * state.viewport.width
    const y = -(cy / state.size.height - 0.5) * state.viewport.height
    const t = state.clock.elapsedTime

    // pxPerUnit: how many CSS pixels one world unit spans horizontally.
    // We size the icon to ~96px tall and park it ~70px below the card top edge.
    const pxPerUnit = state.size.width / state.viewport.width
    const iconHeightWorld = 1.7
    const scale = THREE.MathUtils.clamp(96 / (iconHeightWorld * pxPerUnit), 0.09, 0.55)
    const yOffset = 70 / pxPerUnit

    // Icon hovers in the card's reserved icon zone (just below the top edge)
    g.position.x += (x - g.position.x) * 0.16
    g.position.y += (y + yOffset - g.position.y) * 0.16
    g.rotation.y = Math.sin(t * 0.85 + index * 1.9) * 0.42
    g.rotation.x = Math.cos(t * 0.65 + index * 1.3) * 0.14
    g.scale.setScalar(scale)
  })

  return (
    <group ref={group}>
      <Icon3D type={type} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Procedural 3D icons (no external assets)                            */
/* ------------------------------------------------------------------ */

function Base({ children }: { children: ReactNode }) {
  return (
    <group>
      {children}
      <group position={[0, -0.62, 0]}>
        <mesh rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.72, 40]} />
          <meshStandardMaterial color="#0d1a2b" metalness={0.7} roughness={0.35} transparent opacity={0.92} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.58, 0.64, 44]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

function Icon3D({ type }: { type: string }) {
  return (
    <Base>
      {type === 'network' && <NetworkIcon />}
      {type === 'square' && <SquareIcon />}
      {type === 'fan' && <FanIcon />}
      {type === 'wall' && <WallIcon />}
      {type === 'design' && <DesignIcon />}
      {type === 'supply' && <SupplyIcon />}
      {type === 'install' && <InstallIcon />}
      {type === 'shield' && <ShieldIcon />}
    </Base>
  )
}

function NetworkIcon() {
  const nodes: Array<[number, number]> = [
    [-0.36, 0.3],
    [0.36, 0.3],
    [0, -0.36],
  ]
  return (
    <group>
      {nodes.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[0.16, 18, 18]} />
          <meshStandardMaterial color="#dbeafe" metalness={0.55} roughness={0.28} />
        </mesh>
      ))}
      <mesh>
        <icosahedronGeometry args={[0.17, 0]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

function SquareIcon() {
  return (
    <group rotation-x={0.25}>
      <mesh>
        <boxGeometry args={[1.05, 0.07, 1.05]} />
        <meshStandardMaterial color="#1c2a3c" metalness={0.55} roughness={0.4} />
      </mesh>
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.09, 0.03, 0.66]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.1} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.5, 0.025, 10, 36]} />
        <meshStandardMaterial color="#67e8f9" metalness={0.5} roughness={0.25} />
      </mesh>
    </group>
  )
}

function FanIcon() {
  return (
    <group rotation-z={Math.PI / 2}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 1.05, 22]} />
        <meshStandardMaterial color="#2b3a4e" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.56, 0, 0]} rotation-z={Math.PI / 2}>
        <torusGeometry args={[0.3, 0.028, 10, 26]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[-0.3, 0, 0]}>
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r, i) => (
          <mesh key={i} rotation-z={r}>
            <boxGeometry args={[0.52, 0.08, 0.02]} />
            <meshStandardMaterial color="#67e8f9" metalness={0.45} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function WallIcon() {
  return (
    <group>
      <RoundedBox args={[1.25, 0.4, 0.3]} radius={0.05} smoothness={3}>
        <meshStandardMaterial color="#0d1524" metalness={0.75} roughness={0.32} />
      </RoundedBox>
      {[-0.4, -0.13, 0.14, 0.41].map((x) => (
        <mesh key={x} position={[x * 0.95, 0.02, 0.17]}>
          <boxGeometry args={[0.1, 0.26, 0.02]} />
          <meshStandardMaterial color="#0d1726" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.5, 0.07, 0.18]}>
        <boxGeometry args={[0.13, 0.03, 0.01]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function DesignIcon() {
  return (
    <group>
      <mesh position={[-0.42, -0.14, 0]} rotation-z={0.45}>
        <boxGeometry args={[0.95, 0.09, 0.07]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0.36, 0.16, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.06, 3]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.05, 0.34, 0]} rotation-z={0.7}>
        <cylinderGeometry args={[0.045, 0.045, 0.7, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.3, 0.12, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.02]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  )
}

function SupplyIcon() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.82, 0.55, 0.55]} />
        <meshStandardMaterial color="#8b9bb0" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.05, 0.29]}>
        <boxGeometry args={[0.86, 0.08, 0.03]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.24, 0]} rotation-x={0.12}>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

function InstallIcon() {
  return (
    <group rotation-z={-Math.PI / 5}>
      <mesh position={[0.28, 0.05, 0]} rotation-z={Math.PI / 2}>
        <torusGeometry args={[0.2, 0.06, 12, 26, Math.PI * 1.55]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.32, 0.05, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.72, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.5, 0.4, 0]} rotation-z={Math.PI / 5}>
        <cylinderGeometry args={[0.12, 0.12, 0.16, 6]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.3} />
      </mesh>
    </group>
  )
}

function ShieldIcon() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.56, 0.56, 0.09, 8]} />
        <meshStandardMaterial color="#1c2a3c" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh rotation-z={Math.PI / 8}>
        <torusGeometry args={[0.5, 0.03, 10, 32]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} />
      </mesh>
      {/* check mark */}
      <mesh position={[-0.06, 0.1, 0.06]} rotation-z={Math.PI / 4}>
        <boxGeometry args={[0.34, 0.07, 0.03]} />
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.15, -0.02, 0.06]} rotation-z={-Math.PI / 4}>
        <boxGeometry args={[0.2, 0.07, 0.03]} />
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}
