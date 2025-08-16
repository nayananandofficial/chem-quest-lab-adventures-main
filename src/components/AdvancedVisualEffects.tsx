import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AdvancedEffectProps {
  position: [number, number, number];
  intensity: number;
  duration?: number;
  onComplete?: () => void;
}

interface ParticleSystemProps extends AdvancedEffectProps {
  particleCount: number;
  particleSize: number;
  color: string;
  velocity: [number, number, number];
  gravity: number;
  lifetime: number;
}

export const AdvancedParticleSystem: React.FC<ParticleSystemProps> = ({
  position,
  intensity,
  particleCount,
  particleSize,
  color,
  velocity,
  gravity,
  lifetime,
  duration = 5000,
  onComplete
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, () => ({
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * 0.1,
        position[1],
        position[2] + (Math.random() - 0.5) * 0.1
      ),
      velocity: new THREE.Vector3(
        velocity[0] + (Math.random() - 0.5) * 0.2,
        velocity[1] + Math.random() * 0.3,
        velocity[2] + (Math.random() - 0.5) * 0.2
      ),
      life: lifetime,
      maxLife: lifetime
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [particleCount, position, velocity, lifetime, duration, onComplete]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    setParticles(prev => 
      prev.map(particle => {
        particle.velocity.y -= gravity * delta;
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
        particle.life -= delta;
        return particle;
      }).filter(particle => particle.life > 0)
    );

    // Update positions array
    if (pointsRef.current.geometry && particles.length > 0) {
      const positions = new Float32Array(particles.length * 3);
      const colors = new Float32Array(particles.length * 3);
      const sizes = new Float32Array(particles.length);

      particles.forEach((particle, i) => {
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;

        const alpha = particle.life / particle.maxLife;
        const c = new THREE.Color(color);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = particleSize * alpha * intensity;
      });

      pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pointsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={particleSize}
        vertexColors
        transparent
        opacity={intensity}
        sizeAttenuation
      />
    </points>
  );
};

export const AdvancedSmokeEffect: React.FC<AdvancedEffectProps> = ({
  position,
  intensity,
  duration = 10000,
  onComplete
}) => {
  return (
    <AdvancedParticleSystem
      position={position}
      intensity={intensity}
      particleCount={50}
      particleSize={0.05}
      color="#C0C0C0"
      velocity={[0, 0.5, 0]}
      gravity={-0.1}
      lifetime={3}
      duration={duration}
      onComplete={onComplete}
    />
  );
};

export const AdvancedSparkEffect: React.FC<AdvancedEffectProps> = ({
  position,
  intensity,
  duration = 2000,
  onComplete
}) => {
  return (
    <AdvancedParticleSystem
      position={position}
      intensity={intensity}
      particleCount={100}
      particleSize={0.02}
      color="#FFD700"
      velocity={[0, 1, 0]}
      gravity={2}
      lifetime={1}
      duration={duration}
      onComplete={onComplete}
    />
  );
};

export const AdvancedFireEffect: React.FC<AdvancedEffectProps> = ({
  position,
  intensity,
  duration = 5000,
  onComplete
}) => {
  const flameRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(prev => prev + delta);
    
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(time * 10) * 0.2 * intensity;
      flameRef.current.scale.x = 1 + Math.sin(time * 8) * 0.1 * intensity;
      flameRef.current.position.y = position[1] + Math.sin(time * 12) * 0.05;
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <group position={position}>
      <mesh ref={flameRef} position={[0, 0.2, 0]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={intensity}
        />
      </mesh>
      
      <AdvancedParticleSystem
        position={[position[0], position[1] + 0.3, position[2]]}
        intensity={intensity * 0.5}
        particleCount={30}
        particleSize={0.03}
        color="#FF8800"
        velocity={[0, 0.3, 0]}
        gravity={-0.2}
        lifetime={2}
        duration={duration}
      />
    </group>
  );
};

export const AdvancedElectricEffect: React.FC<AdvancedEffectProps> = ({
  position,
  intensity,
  duration = 3000,
  onComplete
}) => {
  const lightningRef = useRef<THREE.Group>(null);
  const [bolts, setBolts] = useState<THREE.Vector3[][]>([]);

  useEffect(() => {
    const generateBolt = () => {
      const points = [];
      let currentPos = new THREE.Vector3(position[0], position[1], position[2]);
      
      for (let i = 0; i < 10; i++) {
        points.push(currentPos.clone());
        currentPos.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.1,
          (Math.random() - 0.5) * 0.2
        ));
      }
      
      return points;
    };

    const newBolts = Array.from({ length: 3 }, generateBolt);
    setBolts(newBolts);

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [position, duration, onComplete]);

  useFrame(() => {
    if (lightningRef.current) {
      lightningRef.current.visible = Math.random() > 0.7;
    }
  });

  return (
    <group ref={lightningRef} position={position}>
      {bolts.map((bolt, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array(bolt.flatMap(p => [p.x, p.y, p.z]))}
              count={bolt.length}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00FFFF"
            linewidth={2}
            transparent
            opacity={intensity}
          />
        </line>
      ))}
    </group>
  );
};

export const AdvancedCrystallizationEffect: React.FC<AdvancedEffectProps> = ({
  position,
  intensity,
  duration = 8000,
  onComplete
}) => {
  const crystalsRef = useRef<THREE.Group>(null);
  const [crystals, setCrystals] = useState<Array<{
    position: THREE.Vector3;
    scale: number;
    rotation: THREE.Euler;
  }>>([]);

  useEffect(() => {
    const newCrystals = Array.from({ length: 20 }, () => ({
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * 0.3,
        position[1] + Math.random() * 0.2,
        position[2] + (Math.random() - 0.5) * 0.3
      ),
      scale: 0,
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
    }));
    setCrystals(newCrystals);

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [position, duration, onComplete]);

  useFrame((state, delta) => {
    setCrystals(prev => prev.map(crystal => ({
      ...crystal,
      scale: Math.min(crystal.scale + delta * 0.5 * intensity, 0.1),
      rotation: new THREE.Euler(
        crystal.rotation.x + delta * 0.5,
        crystal.rotation.y + delta * 0.3,
        crystal.rotation.z + delta * 0.4
      )
    })));
  });

  return (
    <group ref={crystalsRef}>
      {crystals.map((crystal, index) => (
        <mesh
          key={index}
          position={crystal.position}
          scale={[crystal.scale, crystal.scale, crystal.scale]}
          rotation={crystal.rotation}
        >
          <octahedronGeometry args={[1]} />
          <meshPhysicalMaterial
            color="#87CEEB"
            transparent
            opacity={0.8}
            roughness={0.0}
            metalness={0.1}
            transmission={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

export const AdvancedPrecipitationEffect: React.FC<AdvancedEffectProps> = ({
  position,
  intensity,
  duration = 6000,
  onComplete
}) => {
  return (
    <group position={position}>
      <AdvancedParticleSystem
        position={[0, 0.5, 0]}
        intensity={intensity}
        particleCount={200}
        particleSize={0.01}
        color="#4169E1"
        velocity={[0, -0.2, 0]}
        gravity={0.5}
        lifetime={4}
        duration={duration}
        onComplete={onComplete}
      />
      
      <AdvancedCrystallizationEffect
        position={[0, 0, 0]}
        intensity={intensity * 0.5}
        duration={duration}
      />
    </group>
  );
};