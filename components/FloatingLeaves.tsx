'use client';

import { Canvas } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * FloatingLeaves — a 3D canvas with floating leaf-like planes.
 * Renders as a decorative background layer.
 */
function Leaf({ position, rotation, scale, color }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}) {
  // Create a leaf shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.3, 0.2, 0.5, 0.8, 0, 1);
    s.bezierCurveTo(-0.5, 0.8, -0.3, 0.2, 0, 0);
    return s;
  }, []);

  const geometry = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);

  return (
    <Float speed={1.5 + Math.random()} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh position={position} rotation={rotation} scale={scale}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

const LEAF_COLORS = ['#7FA77D', '#AFC8A8', '#3F6B45', '#5E8C5A'];

export function FloatingLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.4,
      color: LEAF_COLORS[i % LEAF_COLORS.length],
    }));
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ pointerEvents: 'none' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Environment preset="forest" />
      {leaves.map((leaf, i) => (
        <Leaf key={i} {...leaf} />
      ))}
    </Canvas>
  );
}
