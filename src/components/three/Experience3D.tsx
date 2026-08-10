import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { Experience3DProps } from '../../lib/types'

/** Scroll progress shared between the 3D scene and the DOM temperature readout. */
export const roomProgress = { current: 0 }

/* ------------------------------------------------------------------ */
/* Camera + room animation driven by the section's scroll position     */
/* ------------------------------------------------------------------ */

function ScrollCamera() {
  const { camera } = useThree()
  useFrame((_, delta) => {
    const el = document.getElementById('experience')
    if (!el) return
    const offsetTop = el.getBoundingClientRect().top + window.scrollY
    const span = Math.max(1, el.offsetHeight - window.innerHeight)
    const raw = THREE.MathUtils.clamp((window.scrollY - offsetTop) / span, 0, 1)
    roomProgress.current = THREE.MathUtils.damp(roomProgress.current, raw, 3.2, delta)
    const p = roomProgress.current

    camera.position.x = p * 2.4
    camera.position.y = 2.7 - p * 0.55
    camera.position.z = 9.6 - p * 2.6
    camera.lookAt(0, 1.5, 0)
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Room pieces                                                         */
/* ------------------------------------------------------------------ */

function RoomShell() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#0b1320" metalness={0.35} roughness={0.65} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, 4.4, 0]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#0a0f18" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 2.2, -6]}>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial color="#0c1420" roughness={0.9} />
      </mesh>
      {/* Left / right walls */}
      <mesh position={[-9, 2.2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[12, 4.4]} />
        <meshStandardMaterial color="#0a111c" roughness={0.9} />
      </mesh>
      <mesh position={[9, 2.2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[12, 4.4]} />
        <meshStandardMaterial color="#0a111c" roughness={0.9} />
      </mesh>

      {/* Window glow on the back wall */}
      {[-3.2, 3.2].map((x) => (
        <group key={x} position={[x, 2.4, -5.96]}>
          <mesh>
            <planeGeometry args={[2.6, 1.8]} />
            <meshBasicMaterial color="#0e7490" transparent opacity={0.32} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[2.1, 1.3]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.22} />
          </mesh>
          {/* Frame */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[2.7, 0.08, 0.06]} />
            <meshStandardMaterial color="#111a28" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.08, 1.9, 0.06]} />
            <meshStandardMaterial color="#111a28" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Wall-mounted indoor unit on the back wall. */
function IndoorUnit() {
  return (
    <group position={[-4.6, 2.3, -5.7]} rotation-y={Math.PI}>
      <RoundedBox args={[2.0, 0.62, 0.46]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color="#0d1524" metalness={0.7} roughness={0.35} envMapIntensity={0.9} />
      </RoundedBox>
      <mesh position={[0, 0, 0.24]}>
        <boxGeometry args={[1.84, 0.5, 0.04]} />
        <meshStandardMaterial color="#1c2a3c" metalness={0.4} roughness={0.5} />
      </mesh>
      {[-0.4, -0.13, 0.14, 0.41].map((x) => (
        <mesh key={x} position={[x * 0.95, 0.03, 0.28]}>
          <boxGeometry args={[0.15, 0.36, 0.02]} />
          <meshStandardMaterial color="#0d1726" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.78, 0.1, 0.29]}>
        <boxGeometry args={[0.2, 0.045, 0.01]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0, -0.8, 1.2]} intensity={6} distance={6} color="#38bdf8" />
    </group>
  )
}

/** Outdoor condenser unit near the corner. */
function OutdoorUnit() {
  return (
    <group position={[6.1, 0, -4.9]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.05, 0.84, 0.38]} />
        <meshStandardMaterial color="#2b3a4e" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Top fan grille */}
      <mesh position={[0, 0.86, 0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.33, 0.33, 0.05, 20]} />
        <meshStandardMaterial color="#1c2838" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.86, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.33, 0.016, 8, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Side vent slats */}
      {[-0.2, 0, 0.2].map((y) => (
        <mesh key={y} position={[0.54, 0.42 + y * 0.24, 0]} rotation-y={Math.PI / 2}>
          <boxGeometry args={[0.26, 0.05, 0.02]} />
          <meshStandardMaterial color="#1c2838" />
        </mesh>
      ))}
      {/* Feet */}
      <mesh position={[-0.32, 0.03, 0.14]}>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#111a28" />
      </mesh>
      <mesh position={[0.32, 0.03, 0.14]}>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#111a28" />
      </mesh>
    </group>
  )
}

/** The cooled-air path: glowing dashes travelling across the room. */
function AirflowDashes() {
  const ref = useRef<THREE.Group>(null)
  const count = 26

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.3, 1.5, -4.2),
        new THREE.Vector3(-2.8, 0.8, -2.2),
        new THREE.Vector3(-1.4, 0.45, 0.2),
        new THREE.Vector3(0.2, 0.3, 2.6),
        new THREE.Vector3(1.6, 0.35, 4.2),
      ]),
    [],
  )

  const seeds = useMemo(() => new Float32Array(count).map(() => Math.random()), [])

  useFrame((_, delta) => {
    const g = ref.current
    if (!g) return
    const p = roomProgress.current
    const speed = 0.1 + p * 0.28
    g.children.forEach((child, i) => {
      let s = seeds[i] + delta * speed * (0.8 + (i % 4) * 0.12)
      if (s > 1) s -= 1
      seeds[i] = s
      const point = curve.getPoint(s)
      child.position.copy(point)
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      mat.opacity = (0.12 + Math.sin(s * Math.PI) * 0.5) * (0.35 + p * 0.65)
      child.scale.setScalar(0.4 + p * 0.7)
    })
  })

  return (
    <group ref={ref}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Cooling particles travelling along the airflow path. */
function FlowParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const seeds = useMemo(() => new Float32Array(count).map(() => Math.random()), [count])
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.3, 1.5, -4.2),
        new THREE.Vector3(-2.8, 0.8, -2.2),
        new THREE.Vector3(-1.4, 0.45, 0.2),
        new THREE.Vector3(0.2, 0.3, 2.6),
        new THREE.Vector3(1.6, 0.35, 4.2),
      ]),
    [],
  )

  useFrame((state, delta) => {
    const points = ref.current
    if (!points) return
    const pos = points.geometry.attributes.position.array as Float32Array
    const speed = 0.12 + roomProgress.current * 0.3
    for (let i = 0; i < count; i++) {
      let s = seeds[i] + delta * speed * (0.7 + (i % 5) * 0.18)
      if (s > 1) s -= 1
      seeds[i] = s
      const p = curve.getPoint(s)
      pos[i * 3] = p.x + Math.sin(state.clock.elapsedTime * 1.6 + i) * 0.05
      pos[i * 3 + 1] = p.y
      pos[i * 3 + 2] = p.z
    }
    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(count * 3), 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#8ee7ff"
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Floor glow showing how far the cooling has spread (scroll driven). */
function CoolSpread() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({ uStrength: { value: 0.12 }, uColor: { value: new THREE.Color('#38bdf8') } }),
    [],
  )

  useFrame(() => {
    if (!matRef.current) return
    matRef.current.uniforms.uStrength.value = 0.12 + roomProgress.current * 0.6
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 1.2]}>
      <planeGeometry args={[11, 9, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uStrength;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            vec2 c = vUv - vec2(0.5);
            float d = length(c) * 2.0;
            float g = exp(-d * d * 2.4);
            gl_FragColor = vec4(uColor, g * uStrength * 0.5);
          }
        `}
      />
    </mesh>
  )
}

function Scene({ quality }: { quality: 'low' | 'medium' | 'high' }) {
  const particleCount = quality === 'low' ? 26 : quality === 'medium' ? 60 : 110

  return (
    <>
      <fog attach="fog" args={['#05080c', 10, 26]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} color="#cfe0ff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-4, 4, -3]} intensity={14} distance={10} color="#38bdf8" />
      <pointLight position={[5, 1, 5]} intensity={10} distance={12} color="#1d4ed8" />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.4} color="#dff6ff" position={[0, 4, -6]} scale={[14, 5, 1]} />
        <Lightformer intensity={1.4} color="#38bdf8" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[14, 1, 1]} />
      </Environment>

      <ScrollCamera />
      <RoomShell />
      <IndoorUnit />
      <OutdoorUnit />
      <AirflowDashes />
      <FlowParticles count={particleCount} />
      <CoolSpread />

      <Sparkles count={quality === 'low' ? 12 : 30} scale={[10, 4, 8]} position={[0, 2, 0]} size={1.6} speed={0.2} color="#7dd3fc" opacity={0.3} />
    </>
  )
}

export default function Experience3D({ quality, active = true }: Experience3DProps) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={quality === 'low' ? 1 : [1, 1.6]}
      camera={{ position: [0, 2.7, 9.6], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor('#05080c', 1)}
    >
      <Suspense fallback={null}>
        <Scene quality={quality} />
      </Suspense>
    </Canvas>
  )
}
