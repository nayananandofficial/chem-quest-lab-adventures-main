import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/* ---------------- Helpers ---------------- */
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const isFiniteNumber = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n);
const isVec3 = (p: unknown): p is [number, number, number] =>
  Array.isArray(p) && p.length === 3 && p.every((n) => isFiniteNumber(n));

/* ---------------- LIQUID PHYSICS ---------------- */
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
  agitation,
}) => {
  const liquidRef = useRef<THREE.Mesh>(null);
  const [wavePhase] = useState(0);

  // Normalize inputs
  const vViscosity = clamp(isFiniteNumber(viscosity) ? viscosity : 0.5, 0, 1);
  const vAgitation = clamp(isFiniteNumber(agitation) ? agitation : 0, 0, 1);
  const vVolume = Math.max(0.001, isFiniteNumber(liquidVolume) ? liquidVolume : 0.5);
  const vPosition: [number, number, number] = isVec3(position) ? position : [0, 0, 0];

  // Geometry
  const liquidGeometry = useMemo(() => {
    if (containerShape === 'cylinder') {
      return (
        <cylinderGeometry
          args={[0.4, 0.3, THREE.MathUtils.clamp(Math.abs(vVolume), 0.01, 2), 32]}
        />
      );
    }
    return (
      <sphereGeometry
        args={[Math.max(0.05, 0.3 * Math.abs(vVolume)), 32, 32]}
      />
    );
  }, [containerShape, vVolume]);

  // Material
  const liquidMaterial = useMemo(
    () => (
      <meshPhysicalMaterial
        color="#87CEEB"
        transparent
        opacity={THREE.MathUtils.clamp(0.8 - vViscosity * 0.2, 0.05, 1)}
        roughness={vViscosity}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    ),
    [vViscosity]
  );

  // Wave motion
  const calculateWavePosition = useCallback(
    (time: number) => {
      const waveHeight = vAgitation * 0.02;
      return vPosition[1] + Math.sin(time * 2 + wavePhase) * waveHeight;
    },
    [vAgitation, vPosition, wavePhase]
  );

  useFrame((state) => {
    if (liquidRef.current) {
      const time = state.clock.elapsedTime;
      if (containerShape === 'cylinder') {
        liquidRef.current.position.y = calculateWavePosition(time);
      }
      if (vAgitation > 0.5) {
        liquidRef.current.rotation.z = Math.sin(time * 4) * vAgitation * 0.1;
      }
    }
  });

  return (
    <mesh ref={liquidRef} position={vPosition}>
      {liquidGeometry}
      {liquidMaterial}
    </mesh>
  );
};

/* ---------------- TEMPERATURE VIS ---------------- */
interface TemperatureVisualizationProps {
  temperature: number;
  position: [number, number, number];
  equipmentType: string;
}

export const TemperatureVisualization: React.FC<TemperatureVisualizationProps> = ({
  temperature,
  position,
}) => {
  const t = isFiniteNumber(temperature) ? temperature : 20;

  const getTemperatureColor = (temp: number) => {
    if (temp < 25) return '#0088FF';
    if (temp < 50) return '#00FFFF';
    if (temp < 75) return '#FFFF00';
    if (temp < 100) return '#FF8800';
    return '#FF0000';
  };

  const getTemperatureIntensity = (temp: number) => {
    return Math.min((temp - 20) / 80, 1.0);
  };

  return (
    <group position={position}>
      {t > 30 && (
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color={getTemperatureColor(t)}
            emissive={getTemperatureColor(t)}
            emissiveIntensity={getTemperatureIntensity(t) * 0.3}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      {t > 80 && <SteamParticles temperature={t} />}
    </group>
  );
};

/* ---------------- STEAM PARTICLES ---------------- */
export const SteamParticles: React.FC<{ temperature: number }> = ({ temperature }) => {
  const [particles, setParticles] = useState<
    { id: number; position: THREE.Vector3; velocity: THREE.Vector3; life: number }[]
  >([]);

  useEffect(() => {
    const safeTemp = isFiniteNumber(temperature) ? temperature : 20;
    const steamRate = Math.max(0, (safeTemp - 80) / 20);
    if (steamRate <= 0) {
      setParticles([]);
      return;
    }

    let particleId = 0;
    const interval = setInterval(() => {
      setParticles((prev) => {
        const newParticles = [...prev];
        if (Math.random() < steamRate) {
          newParticles.push({
            id: particleId++,
            position: new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              0.02 + Math.random() * 0.02,
              (Math.random() - 0.5) * 0.01
            ),
            life: 1.0,
          });
        }
        return newParticles
          .map((p) => ({
            ...p,
            position: p.position.clone().add(p.velocity),
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
          .slice(-100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [temperature]);

  return (
    <group>
      {particles.map((p) => (
        <mesh key={p.id} position={p.position.toArray() as [number, number, number]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#F0F8FF" transparent opacity={p.life * 0.4} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------------- CONCENTRATION GRADIENT ---------------- */
interface ConcentrationGradientProps {
  chemicals: string[];
  mixingLevel: number;
  position: [number, number, number];
}

export const ConcentrationGradient: React.FC<ConcentrationGradientProps> = ({
  chemicals,
  mixingLevel,
  position,
}) => {
  const gradientRef = useRef<THREE.Mesh>(null);
  const vMix = clamp(isFiniteNumber(mixingLevel) ? mixingLevel : 0, 0, 1);

  useFrame((state) => {
    if (gradientRef.current && vMix < 1.0) {
      gradientRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (chemicals.length < 2) return null;

  return (
    <mesh ref={gradientRef} position={position}>
      <cylinderGeometry args={[0.35, 0.25, 0.8, 32, 10]} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} vertexColors />
    </mesh>
  );
};

/* ---------------- PH INDICATOR ---------------- */
interface PHIndicatorProps {
  pH: number;
  position: [number, number, number];
}

export const PHIndicator: React.FC<PHIndicatorProps> = ({ pH, position }) => {
  const vPH = clamp(isFiniteNumber(pH) ? pH : 7, 0, 14);

  const getPHColor = (phValue: number) => {
    if (phValue < 2) return '#FF0000';
    if (phValue < 4) return '#FF6600';
    if (phValue < 6) return '#FFAA00';
    if (phValue < 8) return '#00FF00';
    if (phValue < 10) return '#0088FF';
    if (phValue < 12) return '#0000FF';
    return '#8800FF';
  };

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={getPHColor(vPH)}
          emissive={getPHColor(vPH)}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

/* ---------------- REACTION PROGRESS ---------------- */
interface ReactionProgressBarProps {
  progress: number;
  reactionType: string;
  position: [number, number, number];
}

export const ReactionProgressBar: React.FC<ReactionProgressBarProps> = ({
  progress,
  reactionType,
  position,
}) => {
  const vProgress = clamp(isFiniteNumber(progress) ? progress : 0, 0, 1);
  const vType = typeof reactionType === 'string' && reactionType.trim() ? reactionType : 'Reaction';

  return (
    <Html position={position} center>
      <div className="bg-black/90 text-white p-2 rounded">
        <div className="text-xs font-bold mb-1">{vType}</div>
        <div className="w-24 h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${vProgress * 100}%` }}
          />
        </div>
        <div className="text-xs mt-1">{(vProgress * 100).toFixed(0)}% Complete</div>
      </div>
    </Html>
  );
};

/* ---------------- EQUIPMENT STATE ---------------- */
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
  position,
}) => {
  return (
    <group position={position}>
      {isHeated && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FF6600" emissive="#FF2200" emissiveIntensity={0.8} />
        </mesh>
      )}
      {hasReaction && (
        <mesh position={[0, 1.0, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#FFFF00" emissive="#AAAA00" emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  );
};
