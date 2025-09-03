import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface LiquidPhysicsProps {
  containerShape: 'cylinder' | 'sphere';
  liquidVolume: number;
  viscosity: number;
  density: number;
  position: [number, number, number];
  agitation: number;
}

export const LiquidPhysics: React.FC<LiquidPhysicsProps> = ({
  containerShape,
  liquidVolume,
  viscosity,
  density,
  position,
  agitation
}) => {
  const liquidRef = useRef<THREE.Mesh>(null);
  const [wavePhase, setWavePhase] = useState(0);

  // Memoize geometry creation - only recalculate when shape or volume changes
  const liquidGeometry = useMemo(() => {
    if (containerShape === 'cylinder') {
      return <cylinderGeometry args={[0.4, 0.3, THREE.MathUtils.clamp(Math.abs(liquidVolume), 0.01, 2), 32]} />;
    } else {
      return <sphereGeometry args={[Math.max(0.05, 0.3 * Math.abs(liquidVolume)), 32, 32]} />;
    }
  }, [containerShape, liquidVolume]);

  // Memoize material creation - only recalculate when viscosity changes
  const liquidMaterial = useMemo(() => (
    <meshPhysicalMaterial 
      color="#87CEEB"
      transparent
      opacity={THREE.MathUtils.clamp(0.8 - viscosity * 0.2, 0.05, 1)}
      roughness={THREE.MathUtils.clamp(viscosity, 0, 1)}
      metalness={0.1}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
    />
  ), [viscosity]);

  // Memoize wave calculation function - only recreate when agitation changes
  const calculateWavePosition = useCallback((time: number) => {
    const waveHeight = agitation * 0.02;
    return position[1] + Math.sin(time * 2 + wavePhase) * waveHeight;
  }, [agitation, position, wavePhase]);

  useFrame((state) => {
    if (liquidRef.current) {
      const time = state.clock.elapsedTime;
      
      if (containerShape === 'cylinder') {
        liquidRef.current.position.y = calculateWavePosition(time);
      }
      
      if (agitation > 0.5) {
        liquidRef.current.rotation.z = Math.sin(time * 4) * agitation * 0.1;
      }
    }
  });

  return (
    <mesh ref={liquidRef} position={position}>
      {liquidGeometry}
      {liquidMaterial}
    </mesh>
  );
};

interface TemperatureVisualizationProps {
  temperature: number;
  position: [number, number, number];
  equipmentType: string;
}

export const TemperatureVisualization: React.FC<TemperatureVisualizationProps> = ({
  temperature,
  position,
  equipmentType
}) => {
  const getTemperatureColor = (temp: number) => {
    if (temp < 25) return '#0088FF'; // Cold - blue
    if (temp < 50) return '#00FFFF'; // Cool - cyan
    if (temp < 75) return '#FFFF00'; // Warm - yellow
    if (temp < 100) return '#FF8800'; // Hot - orange
    return '#FF0000'; // Very hot - red
  };

  const getTemperatureIntensity = (temp: number) => {
    return Math.min((temp - 20) / 80, 1.0);
  };

  return (
    <group position={position}>
      {/* Temperature glow effect */}
      {temperature > 30 && (
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial 
            color={getTemperatureColor(temperature)}
            emissive={getTemperatureColor(temperature)}
            emissiveIntensity={getTemperatureIntensity(temperature) * 0.3}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Steam particles for hot liquids */}
      {temperature > 80 && (
        <SteamParticles temperature={temperature} />
      )}

      {/* Temperature display */}
      {/* <Html position={[0.8, 0, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
          <div className="font-mono">{temperature.toFixed(1)}°C</div>
          <div 
            className="w-16 h-2 border border-white/50 rounded overflow-hidden"
            style={{ background: 'linear-gradient(to right, #0088FF, #FFFF00, #FF0000)' }}
          >
            <div 
              className="h-full bg-white/80"
              style={{ 
                width: `${Math.min((temperature / 120) * 100, 100)}%`,
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      </Html> */}
    </group>
  );
};

export const SteamParticles: React.FC<{ temperature: number }> = ({ temperature }) => {
  const [particles, setParticles] = useState<{ 
    id: number; 
    position: THREE.Vector3; 
    velocity: THREE.Vector3;
    life: number;
  }[]>([]);

  useEffect(() => {
    let particleId = 0;
    const steamRate = (temperature - 80) / 20; // More steam at higher temps
    
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev];
        
        // Add new steam particles
        if (Math.random() < steamRate) {
          newParticles.push({
            id: particleId++,
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              0,
              (Math.random() - 0.5) * 0.3
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              0.02 + Math.random() * 0.02,
              (Math.random() - 0.5) * 0.01
            ),
            life: 1.0
          });
        }
        
        // Update existing particles
        return newParticles
          .map(particle => ({
            ...particle,
            position: particle.position.clone().add(particle.velocity),
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []); // No dependencies needed since we use fixed steam rate

  return (
    <group>
      {particles.map(particle => (
        <mesh key={particle.id} position={particle.position.toArray() as [number, number, number]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial 
            color="#F0F8FF"
            transparent
            opacity={particle.life * 0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

interface ConcentrationGradientProps {
  chemicals: string[];
  mixingLevel: number;
  position: [number, number, number];
}

export const ConcentrationGradient: React.FC<ConcentrationGradientProps> = ({
  chemicals,
  mixingLevel,
  position
}) => {
  const gradientRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (gradientRef.current && mixingLevel < 1.0) {
      // Show unmixed layers
      gradientRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (chemicals.length < 2) return null;

  return (
    <mesh ref={gradientRef} position={position}>
      <cylinderGeometry args={[0.35, 0.25, 0.8, 32, 10]} />
      <meshStandardMaterial 
        color="#87CEEB"
        transparent
        opacity={0.6}
        vertexColors
      />
    </mesh>
  );
};

interface PHIndicatorProps {
  pH: number;
  position: [number, number, number];
}

export const PHIndicator: React.FC<PHIndicatorProps> = ({ pH, position }) => {
  const getPHColor = (phValue: number) => {
    if (phValue < 2) return '#FF0000'; // Strong acid - red
    if (phValue < 4) return '#FF6600'; // Acid - orange
    if (phValue < 6) return '#FFAA00'; // Weak acid - yellow-orange
    if (phValue < 8) return '#00FF00'; // Neutral - green
    if (phValue < 10) return '#0088FF'; // Weak base - blue
    if (phValue < 12) return '#0000FF'; // Base - dark blue
    return '#8800FF'; // Strong base - purple
  };

  const getPHLabel = (phValue: number) => {
    if (phValue < 3) return 'Strong Acid';
    if (phValue < 6) return 'Acid';
    if (phValue < 8) return 'Neutral';
    if (phValue < 11) return 'Base';
    return 'Strong Base';
  };

  return (
    <group position={position}>
      {/* <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={getPHColor(pH)}
          emissive={getPHColor(pH)}
          emissiveIntensity={0.2}
        />
      </mesh> */}
      
      {/* <Html position={[0, 0.3, 0]} center>
        <div className="bg-black/90 text-white px-2 py-1 rounded text-xs text-center">
          <div className="font-bold">pH {pH.toFixed(1)}</div>
          <div className="text-xs">{getPHLabel(pH)}</div>
        </div>
      </Html> */}
    </group>
  );
};

interface ReactionProgressBarProps {
  progress: number;
  reactionType: string;
  position: [number, number, number];
}

export const ReactionProgressBar: React.FC<ReactionProgressBarProps> = ({
  progress,
  reactionType,
  position
}) => {
  return (
    <Html position={position} center>
      <div className="bg-black/90 text-white p-2 rounded">
        <div className="text-xs font-bold mb-1">{reactionType}</div>
        <div className="w-24 h-2 bg-gray-700 rounded overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="text-xs mt-1">{(progress * 100).toFixed(0)}% Complete</div>
      </div>
    </Html>
  );
};

interface EquipmentStateIndicatorProps {
  isSelected: boolean;
  isHeated: boolean;
  hasReaction: boolean;
  position: [number, number, number];
}

export const EquipmentStateIndicator: React.FC<EquipmentStateIndicatorProps> = ({
  isSelected,
  isHeated,
  hasReaction,
  position
}) => {
  return (
    <group position={position}>

      {/* Heat indicator */}
      {/* {isHeated && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#FF6600"
            emissive="#FF2200"
            emissiveIntensity={0.8}
          />
        </mesh>
      )} */}

      {/* Reaction indicator */}
      {/* {hasReaction && (
        <mesh position={[0, 1.0, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial 
            color="#FFFF00"
            emissive="#AAAA00"
            emissiveIntensity={0.6}
          />
        </mesh>
      )} */}
    </group>
  );
};