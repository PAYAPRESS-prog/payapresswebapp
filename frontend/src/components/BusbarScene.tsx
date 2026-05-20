'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Props { width: number; thickness: number }

function CopperMesh({ width, thickness }: Props) {
  const mesh = useRef<THREE.Mesh>(null);

  // Normalize to scene units; exaggerate thickness so thin busbars look good
  const W = Math.max(0.9, (width / 50) * 2.4);
  const H = Math.max(0.14, (thickness / 12) * 0.7);
  const L = 2.8;

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y = Math.sin(clock.elapsedTime * 0.75) * 0.05;
      mesh.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.015;
    }
  });

  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <boxGeometry args={[W, H, L]} />
      <meshPhysicalMaterial
        color="#b87333"
        metalness={0.93}
        roughness={0.07}
        reflectivity={1}
        clearcoat={0.25}
        clearcoatRoughness={0.15}
        envMapIntensity={1.8}
      />
    </mesh>
  );
}

export default function BusbarScene({ width, thickness }: Props) {
  return (
    <Canvas
      camera={{ position: [2.8, 1.6, 3.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.35} color="#fff" />
      <directionalLight position={[5, 6, 5]}  intensity={0.9} castShadow color="#ffffff" shadow-mapSize={[1024,1024]} />
      <directionalLight position={[-3, 2, -3]} intensity={0.25} color="#e8a030" />
      <pointLight position={[0, 3, 0]} intensity={0.2} color="#cd7f32" />

      <CopperMesh width={width} thickness={thickness} />

      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.45}
        scale={7}
        blur={2.5}
        far={5}
        color="#3d1a00"
      />

      <Environment preset="studio" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.6}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 5}
      />
    </Canvas>
  );
}
