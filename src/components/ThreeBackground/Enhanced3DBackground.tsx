import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, Box, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingGeometryProps {
  position: [number, number, number];
  geometry: 'sphere' | 'box' | 'torus' | 'octahedron';
  color: string;
  scale?: number;
}

const FloatingGeometry: React.FC<FloatingGeometryProps> = ({ position, geometry, color, scale = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  const GeometryComponent = {
    sphere: Sphere,
    box: Box,
    torus: Torus,
    octahedron: Octahedron,
  }[geometry];

  return (
    <GeometryComponent
      ref={meshRef}
      position={position}
      scale={scale}
      args={geometry === 'torus' ? [0.5, 0.2, 8, 16] : undefined}
    >
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </GeometryComponent>
  );
};

const ParticleField: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.075;
    }
  });

  return (
    <Points ref={pointsRef} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={isDark ? '#60A5FA' : '#3B82F6'}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

const CameraController: React.FC = () => {
  const { camera, mouse } = useThree();
  
  useFrame(() => {
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

interface Enhanced3DBackgroundProps {
  isDark: boolean;
}

const Enhanced3DBackground: React.FC<Enhanced3DBackgroundProps> = ({ isDark }) => {
  const geometries: FloatingGeometryProps[] = [
    { position: [-10, 5, -5], geometry: 'sphere', color: '#3B82F6', scale: 0.5 },
    { position: [8, -3, -8], geometry: 'box', color: '#14B8A6', scale: 0.7 },
    { position: [-5, -8, -3], geometry: 'torus', color: '#F59E0B', scale: 0.6 },
    { position: [12, 8, -10], geometry: 'octahedron', color: '#EF4444', scale: 0.4 },
    { position: [-15, 2, -12], geometry: 'sphere', color: '#8B5CF6', scale: 0.8 },
    { position: [6, -10, -6], geometry: 'box', color: '#EC4899', scale: 0.5 },
  ];

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: isDark ? '#111827' : '#F3F4F6' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60A5FA" />
        
        <ParticleField isDark={isDark} />
        
        {geometries.map((geo, index) => (
          <FloatingGeometry key={index} {...geo} />
        ))}
        
        <CameraController />
      </Canvas>
    </div>
  );
};

export default Enhanced3DBackground;