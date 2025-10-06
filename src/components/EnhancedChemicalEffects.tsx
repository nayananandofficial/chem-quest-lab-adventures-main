import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ChemicalEffectProps {
  position: [number, number, number];
  effectType: 'bubbling' | 'steam' | 'crystallization' | 'heat_glow' | 'color_transition';
  intensity: number;
  duration?: number;
  onComplete?: () => void;
}

export const BubblingEffect: React.FC<ChemicalEffectProps> = ({ 
  position, 
  intensity, 
  duration = 5000 
}) => {
  const bubbleGroupRef = useRef<THREE.Group>(null);
  const [bubbles, setBubbles] = useState<{ id: number; position: THREE.Vector3; scale: number; life: number }[]>([]);

  useEffect(() => {
    let bubbleId = 0;
    const interval = setInterval(() => {
      setBubbles(prev => {
        const newBubbles = [...prev];
        // Add new bubbles
        if (Math.random() < intensity) {
          newBubbles.push({
            id: bubbleId++,
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 0.6,
              0,
              (Math.random() - 0.5) * 0.6
            ),
            scale: 0.05 + Math.random() * 0.1,
            life: 1.0
          });
        }
        // Update existing bubbles
        return newBubbles
          .map(bubble => ({
            ...bubble,
            position: new THREE.Vector3(
              bubble.position.x,
              bubble.position.y + 0.02,
              bubble.position.z
            ),
            life: bubble.life - 0.02
          }))
          .filter(bubble => bubble.life > 0);
      });
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setBubbles([]);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [intensity, duration]);

  return (
    <group ref={bubbleGroupRef} position={position}>
      {bubbles.map(bubble => (
        <mesh key={bubble.id} position={bubble.position.toArray() as [number, number, number]}>
          <sphereGeometry args={[bubble.scale, 8, 8]} />
          <meshStandardMaterial 
            color="#87CEEB"
            transparent
            opacity={bubble.life * 0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

export const SteamEffect: React.FC<ChemicalEffectProps> = ({ 
  position, 
  intensity, 
  duration = 5000 
}) => {
  const steamGroupRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<{ 
    id: number; 
    position: THREE.Vector3; 
    scale: number; 
    life: number;
    velocity: THREE.Vector3;
  }[]>([]);

  useEffect(() => {
    let particleId = 0;
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev];
        // Add new steam particles
        if (Math.random() < intensity) {
          const baseScale = 0.06 + intensity * 0.28;
          newParticles.push({
            id: particleId++,
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 0.4,
              0,
              (Math.random() - 0.5) * 0.4
            ),
            scale: baseScale * (0.7 + Math.random() * 0.6),
            life: 1.0,
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              0.035 + Math.random() * 0.03 + intensity * 0.04,
              (Math.random() - 0.5) * 0.02
            )
          });
        }
        // Update existing particles
        return newParticles
          .map(particle => ({
            ...particle,
            position: particle.position.clone().add(particle.velocity),
            life: particle.life - 0.015,
            scale: particle.scale * 1.02
          }))
          .filter(particle => particle.life > 0);
      });
    }, 80);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [intensity, duration]);

  return (
    <group ref={steamGroupRef} position={position}>
      {particles.map(particle => (
        <mesh key={particle.id} position={particle.position.toArray() as [number, number, number]}>
          <sphereGeometry args={[particle.scale, 6, 6]} />
          <meshStandardMaterial 
            color={intensity > 0.6 ? '#F5F5F5' : '#F0F8FF'}
            transparent
            opacity={Math.min(0.7, particle.life * (0.35 + intensity * 0.6))}
          />
        </mesh>
      ))}
    </group>
  );
};

export const CrystallizationEffect: React.FC<ChemicalEffectProps> = ({ 
  position, 
  intensity, 
  duration = 8000 
}) => {
  const crystalGroupRef = useRef<THREE.Group>(null);
  const [crystals, setCrystals] = useState<{ 
    id: number; 
    position: THREE.Vector3; 
    scale: number; 
    rotation: THREE.Euler;
  }[]>([]);

  useEffect(() => {
    let crystalId = 0;
    const interval = setInterval(() => {
      setCrystals(prev => {
        if (prev.length < intensity * 10) {
          const newCrystals = [...prev];
          newCrystals.push({
            id: crystalId++,
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 0.8,
              -0.3 + Math.random() * 0.2,
              (Math.random() - 0.5) * 0.8
            ),
            // Smaller initial crystals for copper sulfate
            scale: 0.003 + Math.random() * 0.006,
            rotation: new THREE.Euler(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            )
          });
          return newCrystals;
        }
        return prev;
      });
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [intensity, duration]);

  useFrame(() => {
    setCrystals(prev => prev.map(crystal => ({
      ...crystal,
      // slower growth and lower cap for smaller crystals
      scale: Math.min(crystal.scale + 0.0009, 0.012 + Math.random() * 0.008)
    })));
  });

  return (
    <group ref={crystalGroupRef} position={position}>
      {crystals.map(crystal => (
        <mesh 
          key={crystal.id} 
          position={crystal.position.toArray() as [number, number, number]}
          rotation={[crystal.rotation.x, crystal.rotation.y, crystal.rotation.z]}
          scale={[crystal.scale, crystal.scale * 2, crystal.scale]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#E6E6FA"
            transparent
            opacity={0.8}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

export const HeatGlowEffect: React.FC<ChemicalEffectProps> = ({ 
  position, 
  intensity, 
  duration = 6000 
}) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);

  useFrame((state) => {
    if (glowRef.current && glowRef.current.material) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5;
      setGlowIntensity(intensity * pulse);
      const material = glowRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = glowIntensity;
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlowIntensity(0);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <mesh ref={glowRef} position={position}>
      <sphereGeometry args={[0.8, 16, 16]} />
      <meshStandardMaterial 
        color="#FF4500"
        emissive="#FF6600"
        emissiveIntensity={glowIntensity}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

export const ColorTransitionEffect: React.FC<ChemicalEffectProps & { 
  fromColor: string; 
  toColor: string; 
}> = ({ 
  position, 
  intensity, 
  duration = 4000, 
  fromColor, 
  toColor 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [transitionProgress, setTransitionProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setTransitionProgress(progress);
      
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration]);

  useFrame(() => {
    if (meshRef.current && meshRef.current.material) {
      const fromColorObj = new THREE.Color(fromColor);
      const toColorObj = new THREE.Color(toColor);
      const currentColor = fromColorObj.lerp(toColorObj, transitionProgress);
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color = currentColor;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.4, 0.3, 0.8, 16]} />
      <meshStandardMaterial 
        color={fromColor}
        transparent
        opacity={intensity * 0.8}
      />
    </mesh>
  );
};