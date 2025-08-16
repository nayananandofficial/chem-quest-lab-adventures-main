
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ChemicalReactionProps {
  position: [number, number, number];
  reactionType: 'acid-base' | 'oxidation' | 'precipitation' | 'combustion';
  intensity: number;
  onComplete?: () => void;
}

const ChemicalReaction: React.FC<ChemicalReactionProps> = ({ 
  position, 
  reactionType, 
  intensity, 
  onComplete 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const getReactionColor = (type: string) => {
    switch (type) {
      case 'acid-base': return '#00FF00';
      case 'oxidation': return '#FF4500';
      case 'precipitation': return '#87CEEB';
      case 'combustion': return '#FF0000';
      default: return '#FFFFFF';
    }
  };

  useEffect(() => {
    if (!particlesRef.current) return;

    const particleCount = Math.floor(intensity * 100);
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = Math.random() * 0.2;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
      
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.05 + 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: getReactionColor(reactionType),
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });

    particlesRef.current.geometry = geometry;
    particlesRef.current.material = material;
    (particlesRef.current as any).velocities = velocities;
  }, [reactionType, intensity]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (particlesRef.current && (particlesRef.current as any).velocities) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = (particlesRef.current as any).velocities;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Reset particles that go too high
        if (positions[i + 1] > 2) {
          positions[i + 1] = 0;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Auto-complete reaction after 5 seconds
    if (timeRef.current > 5 && onComplete) {
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <points ref={particlesRef} />
      {reactionType === 'combustion' && (
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.2, 0.8, 8]} />
          <meshStandardMaterial 
            color="#FF4500" 
            transparent 
            opacity={0.7}
            emissive="#FF4500"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

export default ChemicalReaction;
