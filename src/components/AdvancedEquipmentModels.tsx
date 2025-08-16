import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';

interface AdvancedEquipmentProps {
  position: [number, number, number];
  isSelected?: boolean;
  isHeated?: boolean;
  temperature?: number;
  contents?: string[];
  onClick?: () => void;
  onChemicalAdd?: (chemical: string) => void;
}

export const RealisticBeaker: React.FC<AdvancedEquipmentProps> = ({
  position,
  contents,
  isSelected,
  temperature,
  isHeated,
  onClick
}) => {
  const beakerRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const liquidHeight = Math.min(contents.length * 0.25, 1.0);
  
  const getLiquidColor = () => {
    if (contents.length === 0) return '#87CEEB';
    
    // More sophisticated color mixing
    const colorMap: { [key: string]: THREE.Color } = {
      'Hydrochloric Acid': new THREE.Color('#FFD700'),
      'HCl': new THREE.Color('#FFD700'),
      'Sodium Hydroxide': new THREE.Color('#87CEEB'),
      'NaOH': new THREE.Color('#87CEEB'),
      'Copper Sulfate': new THREE.Color('#4169E1'),
      'CuSO4': new THREE.Color('#4169E1'),
      'Sulfuric Acid': new THREE.Color('#FFFF99'),
      'H2SO4': new THREE.Color('#FFFF99'),
      'Iron Oxide': new THREE.Color('#CD853F'),
      'Fe2O3': new THREE.Color('#CD853F'),
      'Potassium Permanganate': new THREE.Color('#800080'),
      'KMnO4': new THREE.Color('#800080')
    };

    if (contents.length === 1) {
      return colorMap[contents[0]] || new THREE.Color('#87CEEB');
    }

    // Mix colors for multiple chemicals
    let mixedColor = new THREE.Color('#87CEEB');
    contents.forEach(chemical => {
      const chemColor = colorMap[chemical];
      if (chemColor) {
        mixedColor.lerp(chemColor, 0.5);
      }
    });

    // Temperature affects color
    if (temperature > 50) {
      mixedColor.lerp(new THREE.Color('#FF6B6B'), 0.2);
    }

    return mixedColor;
  };

  useFrame((state) => {
    if (beakerRef.current) {
      if (isSelected) {
        beakerRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
      
      if (isHeated && liquidRef.current) {
        // Add subtle liquid movement when heated
        liquidRef.current.position.y = -0.7 + liquidHeight/2 + Math.sin(state.clock.elapsedTime * 8) * 0.02;
      }
    }
  });

  return (
    <group ref={beakerRef} position={position}>
      {/* Beaker body with more realistic shape */}
      <mesh onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <cylinderGeometry args={[0.45, 0.35, 1.4, 32]} />
        <meshPhysicalMaterial 
          color={isSelected ? '#60A5FA' : '#E6F3FF'}
          transparent
          opacity={0.7}
          roughness={0.1}
          transmission={0.9}
          thickness={0.1}
        />
      </mesh>

      {/* Beaker rim */}
      <mesh position={[0, 0.7, 0]}>
        <torusGeometry args={[0.45, 0.03, 8, 32]} />
        <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Spout */}
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />
        <meshPhysicalMaterial 
          color="#E6F3FF"
          transparent
          opacity={0.7}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>

      {/* Liquid with better rendering */}
      {liquidHeight > 0 && (
        <mesh ref={liquidRef} position={[0, -0.7 + liquidHeight/2, 0]}>
          <cylinderGeometry args={[0.42, 0.32, liquidHeight, 32]} />
          <meshPhysicalMaterial 
            color={getLiquidColor()}
            transparent
            opacity={0.85}
            roughness={0.0}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
      )}

      {/* Measurement markings */}
      {[0.2, 0.4, 0.6, 0.8].map((height, index) => (
        <mesh key={index} position={[0.46, -0.4 + height, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.1]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}

      {/* Temperature indicator */}
      {temperature > 30 && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color={temperature > 80 ? '#FF4444' : temperature > 50 ? '#FF8844' : '#FFAA44'}
            emissive={temperature > 80 ? '#440000' : '#000000'}
          />
        </mesh>
      )}

      {/* Equipment label with enhanced info */}
      <Html position={[0, 1.2, 0]} center>
        <div className="bg-black/80 text-white p-2 rounded text-xs min-w-32 text-center">
          <div className="font-bold">Beaker 250mL</div>
          <div>Contents: {contents.length}</div>
          <div>Temp: {temperature}°C</div>
          {isHeated && <div className="text-red-400">🔥 Heated</div>}
        </div>
      </Html>
    </group>
  );
};

export const RealisticFlask: React.FC<AdvancedEquipmentProps> = ({
  position,
  contents,
  isSelected,
  temperature,
  onClick
}) => {
  const flaskRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const liquidHeight = Math.min(contents.length * 0.15, 0.5);

  const getLiquidColor = () => {
    if (contents.length === 0) return '#87CEEB';
    
    const colorMap: { [key: string]: string } = {
      'Hydrochloric Acid': '#FFD700',
      'Sodium Hydroxide': '#87CEEB',
      'Copper Sulfate': '#4169E1',
      'Sulfuric Acid': '#FFFF99',
      'Iron Oxide': '#CD853F'
    };

    return colorMap[contents[0]] || '#87CEEB';
  };

  useFrame((state) => {
    if (flaskRef.current && isSelected) {
      flaskRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={flaskRef} position={position}>
      {/* Flask bottom - more realistic round bottom */}
      <mesh onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshPhysicalMaterial 
          color={isSelected ? '#F59E0B' : '#FEF3C7'}
          transparent
          opacity={0.8}
          roughness={0.1}
          transmission={0.8}
          thickness={0.1}
        />
      </mesh>

      {/* Flask neck - longer and more elegant */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 1.0, 32]} />
        <meshPhysicalMaterial 
          color={isSelected ? '#F59E0B' : '#FEF3C7'}
          transparent
          opacity={0.8}
          roughness={0.1}
          transmission={0.8}
        />
      </mesh>

      {/* Flask opening */}
      <mesh position={[0, 1.1, 0]}>
        <torusGeometry args={[0.12, 0.02, 8, 32]} />
        <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Liquid in flask */}
      {liquidHeight > 0 && (
        <mesh position={[0, -0.35 + liquidHeight/2, 0]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshPhysicalMaterial 
            color={getLiquidColor()}
            transparent
            opacity={0.9}
            roughness={0.0}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Volume markings */}
      {[0.1, 0.2, 0.3].map((height, index) => (
        <React.Fragment key={index}>
          <mesh position={[0.36, -0.2 + height, 0]}>
            <boxGeometry args={[0.02, 0.01, 0.08]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <Text
            position={[0.5, -0.2 + height, 0]}
            fontSize={0.06}
            color="#666666"
            anchorX="left"
            anchorY="middle"
          >
            {(index + 1) * 50}mL
          </Text>
        </React.Fragment>
      ))}

      <Html position={[0, 1.4, 0]} center>
        <div className="bg-black/80 text-white p-2 rounded text-xs min-w-32 text-center">
          <div className="font-bold">Erlenmeyer Flask</div>
          <div>Volume: 250mL</div>
          <div>Contents: {contents.length}</div>
          <div>Temp: {temperature}°C</div>
        </div>
      </Html>
    </group>
  );
};

export const RealisticBurner: React.FC<AdvancedEquipmentProps & { 
  isLit: boolean; 
  onToggle: () => void 
}> = ({
  position,
  isLit,
  onToggle,
  onClick
}) => {
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Burner base */}
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 32]} />
        <meshStandardMaterial color="#2C2C2C" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Burner ring */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.2, 0.02, 8, 32]} />
        <meshStandardMaterial color="#1C1C1C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Gas holes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.18;
        const z = Math.sin(angle) * 0.18;
        return (
          <mesh key={i} position={[x, 0.12, z]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        );
      })}

      {/* Control knob */}
      <mesh position={[0.35, 0, 0]} onClick={onToggle}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Flame effect */}
      {isLit && (
        <group ref={flameRef} position={[0, 0.15, 0]}>
          {/* Inner flame - blue */}
          <mesh>
            <coneGeometry args={[0.15, 0.4, 8]} />
            <meshStandardMaterial 
              color="#0088FF"
              emissive="#0066CC"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Outer flame - orange */}
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshStandardMaterial 
              color="#FF6600"
              emissive="#FF4400"
              emissiveIntensity={1.0}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Heat distortion effect */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color="#FFAA00"
              transparent
              opacity={0.1}
            />
          </mesh>
        </group>
      )}

      <Html position={[0, -0.3, 0]} center>
        <div className="bg-black/80 text-white p-2 rounded text-xs text-center">
          <div className="font-bold">Bunsen Burner</div>
          <div>{isLit ? '🔥 Lit' : '⭕ Off'}</div>
          <div className="text-xs text-gray-300">Click knob to toggle</div>
        </div>
      </Html>
    </group>
  );
};