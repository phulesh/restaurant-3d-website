import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import * as THREE from 'three'

function DataParticle({ from, to, color, offset = 0, speed = 0.16 }) {
  const ref = useRef()
  const start = useMemo(() => new THREE.Vector3(...from), [from])
  const end = useMemo(() => new THREE.Vector3(...to), [to])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const progress = (clock.elapsedTime * speed + offset) % 1
    ref.current.position.lerpVectors(start, end, progress)
    const pulse = 0.7 + Math.sin(progress * Math.PI) * 0.8
    ref.current.scale.setScalar(pulse)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function Node({ position, color, size = 0.42 }) {
  return (
    <Float speed={1.25} rotationIntensity={0.25} floatIntensity={0.3}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[size, 24, 24]} />
          <meshStandardMaterial color="#081223" emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh>
          <torusGeometry args={[size * 1.33, 0.018, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <pointLight color={color} intensity={2.2} distance={3.2} />
      </group>
    </Float>
  )
}

function Core() {
  const core = useRef()
  const ring = useRef()
  useFrame(({ clock }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced && core.current) {
      core.current.rotation.y = clock.elapsedTime * 0.22
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.33) * 0.15
    }
    if (!reduced && ring.current) ring.current.rotation.z = -clock.elapsedTime * 0.16
  })
  return (
    <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.45}>
      <group>
        <group ref={core}>
          <mesh>
            <icosahedronGeometry args={[1.03, 2]} />
            <meshStandardMaterial color="#08162b" emissive="#10c8ff" emissiveIntensity={0.42} metalness={0.65} roughness={0.18} wireframe />
          </mesh>
          <mesh scale={0.64}>
            <icosahedronGeometry args={[1, 3]} />
            <meshStandardMaterial color="#16d9ff" emissive="#098fc2" emissiveIntensity={2.2} metalness={0.25} roughness={0.15} transparent opacity={0.88} />
          </mesh>
          {[[0.6, 0.4, 0.55], [-0.55, 0.5, 0.35], [0.3, -0.58, 0.55], [-0.55, -0.35, 0.4]].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshBasicMaterial color={i % 2 ? '#8b5cf6' : '#45f0b5'} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <group ref={ring} rotation={[1.2, 0.1, 0.2]}>
          <mesh>
            <torusGeometry args={[1.4, 0.016, 8, 80]} />
            <meshBasicMaterial color="#40dfff" transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[1.4, 0, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
        <pointLight color="#20d9ff" intensity={8} distance={6} />
      </group>
    </Float>
  )
}

function CRMPanel() {
  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.18}>
      <group position={[0.4, 0.35, -2.5]} rotation={[-0.05, -0.08, 0]}>
        <mesh>
          <boxGeometry args={[4.7, 2.75, 0.07]} />
          <meshStandardMaterial color="#071120" emissive="#172e53" emissiveIntensity={0.35} metalness={0.6} roughness={0.2} transparent opacity={0.7} />
        </mesh>
        {[[-1.55, 0.72, 0.08], [-0.35, 0.72, 0.08], [0.85, 0.72, 0.08], [1.78, 0.72, 0.08]].map((p, i) => (
          <mesh position={p} key={i}>
            <boxGeometry args={[0.88, 0.48, 0.05]} />
            <meshStandardMaterial color={i === 2 ? '#12332f' : '#0e1d35'} emissive={i === 2 ? '#18d99b' : '#1384bd'} emissiveIntensity={0.18} />
          </mesh>
        ))}
        {[0.25, -0.28, -0.81].map((y, row) => [ -1.55, -0.35, 0.85, 1.78].map((x, col) => (
          <mesh position={[x, y, 0.09]} key={`${row}-${col}`}>
            <boxGeometry args={[0.87, 0.3, 0.05]} />
            <meshStandardMaterial color="#0c1a31" emissive={row === 0 && col === 0 ? '#742e17' : '#182947'} emissiveIntensity={0.2} />
          </mesh>
        )))}
      </group>
    </Float>
  )
}

function ParticleField({ count }) {
  const points = useRef()
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const seed = i * 12.9898
      data[i * 3] = (Math.sin(seed) * 0.5) * 10
      data[i * 3 + 1] = (Math.sin(seed * 1.7) * 0.5) * 7
      data[i * 3 + 2] = -2 + Math.sin(seed * 2.3) * 3
    }
    return data
  }, [count])
  useFrame(({ clock }) => {
    if (points.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) points.current.rotation.y = clock.elapsedTime * 0.012
  })
  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.025} color="#63dfff" transparent opacity={0.42} sizeAttenuation />
    </points>
  )
}

function Scene({ mobile }) {
  const group = useRef()
  const { pointer } = useThree()
  useFrame(() => {
    if (!group.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.09, 0.035)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.055, 0.035)
  })

  const lines = [
    { from: [-3, 0.35, 0], to: [-0.85, 0.12, 0], color: '#20d9ff' },
    { from: [3, 0.35, 0], to: [0.85, 0.12, 0], color: '#45f0b5' },
    { from: [0, -0.7, 0], to: [0, -2.1, 0], color: '#a78bfa' },
  ]
  return (
    <group ref={group} scale={mobile ? 0.76 : 1} position={[mobile ? 0 : 0.15, mobile ? 0.2 : 0, 0]}>
      <CRMPanel />
      {lines.map((line, index) => (
        <group key={index}>
          <Line points={[line.from, line.to]} color={line.color} transparent opacity={0.38} lineWidth={0.8} dashed dashSize={0.12} gapSize={0.09} />
          <DataParticle {...line} offset={index * 0.27} />
          <DataParticle {...line} offset={index * 0.27 + 0.5} />
        </group>
      ))}
      <Node position={[-3, 0.35, 0]} color="#24a1de" />
      <Node position={[3, 0.35, 0]} color="#25d366" />
      <Node position={[0, -2.1, 0]} color="#8b5cf6" size={0.34} />
      <Core />
      <ParticleField count={mobile ? 45 : 105} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 5, 4]} intensity={0.8} color="#bfefff" />
    </group>
  )
}

export default function HeroScene() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700
  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.1, 7], fov: mobile ? 54 : 47 }} dpr={mobile ? [1, 1.25] : [1, 1.7]} gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}><Scene mobile={mobile} /></Suspense>
      </Canvas>
      <div className="scene-label scene-label-left"><i className="telegram-dot" />Telegram <span>Connected</span></div>
      <div className="scene-label scene-label-right"><i className="whatsapp-dot" />WhatsApp <span>Connected</span></div>
      <div className="scene-label scene-label-core"><i />AI Agent <span>Analyzing intent…</span></div>
      <div className="scene-lead-card">
        <div className="mini-score">92</div>
        <div><b>Rahul Sharma</b><span>Qualified lead · ₹50k</span></div>
        <em>HOT</em>
      </div>
      <div className="scene-journey">
        <span>Customer</span><i>→</i><span>Channels</span><i>→</i><span>AI Agent</span><i>→</i><span>Qualified</span><i>→</i><span>CRM</span><i>→</i><span>Sales Team</span>
      </div>
    </div>
  )
}
