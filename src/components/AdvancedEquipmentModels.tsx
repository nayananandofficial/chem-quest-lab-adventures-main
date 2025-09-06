import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SteamParticles } from './AdvancedChemistryVisuals';

interface Bubble {
  id: number;
  position: THREE.Vector3;
  speed: number;
  size: number;
  life: number;
}
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    lab_beaker_a_0: THREE.Mesh
    lab_erlenmeyer_a_0: THREE.Mesh
  }
  materials: {
    lab_beaker_a: THREE.MeshPhysicalMaterial
    lab_erlenmeyer_a: THREE.MeshPhysicalMaterial
  }
};

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
  onClick,
}) => {
  const beakerRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleCount = contents.length > 1 ? 15 : 0; // Only show bubbles when mixing chemicals

  const liquidHeight = Math.min(contents.length * 0.25, 1.0);

  const getLiquidColor = () => {
    if (contents.length === 0) return "#87CEEB";

    // More sophisticated color mixing
    const colorMap: { [key: string]: THREE.Color } = {
      "Hydrochloric Acid": new THREE.Color("#FFD700"),
      HCl: new THREE.Color("#FFD700"),
      "Sodium Hydroxide": new THREE.Color("#87CEEB"),
      NaOH: new THREE.Color("#87CEEB"),
      "Copper Sulfate": new THREE.Color("#4169E1"),
      CuSO4: new THREE.Color("#4169E1"),
      "Sulfuric Acid": new THREE.Color("#FFFF99"),
      H2SO4: new THREE.Color("#FFFF99"),
      "Iron Oxide": new THREE.Color("#CD853F"),
      Fe2O3: new THREE.Color("#CD853F"),
      "Potassium Permanganate": new THREE.Color("#800080"),
      KMnO4: new THREE.Color("#800080"),
    };

    if (contents.length === 1) {
      return colorMap[contents[0]] || new THREE.Color("#87CEEB");
    }

    // Mix colors for multiple chemicals
    let mixedColor = new THREE.Color("#87CEEB");
    contents.forEach((chemical) => {
      const chemColor = colorMap[chemical];
      if (chemColor) {
        mixedColor.lerp(chemColor, 0.5);
      }
    });

    // Temperature affects color
    // if (temperature > 50) {
    //   mixedColor.lerp(new THREE.Color("#FF6B6B"), 0.2);
    // }

    return mixedColor;
  };

  
  useFrame((state) => {
    if (beakerRef.current) {
      if (isSelected) {
        beakerRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }

      if (isHeated && liquidRef.current) {
        // Add subtle liquid movement when heated
        liquidRef.current.position.y =
          -0.2 +
          liquidHeight / 2 +
          Math.sin(state.clock.elapsedTime * 8) * 0.02;
      }
    }
  });

  const { nodes, materials } = useGLTF('/models/beaker/scene.gltf') as GLTFResult;

  useEffect(() => {
    if (contents.length > 1) {
      const interval = setInterval(() => {
        setBubbles(prev => {
          // Remove dead bubbles and add new ones
          const remaining = prev
            .filter(b => b.life > 0)
            .map(b => ({
              ...b,
              life: b.life - 0.02
            }));

          // Add new bubbles if needed
          while (remaining.length < bubbleCount) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;
            remaining.push({
              id: Date.now() + Math.random(),
              position: new THREE.Vector3(
                Math.cos(angle) * radius,
                -0.2, // Start from bottom
                Math.sin(angle) * radius
              ),
              speed: 0.01 + Math.random() * 0.02,
              size: 0.02 + Math.random() * 0.02,
              life: 1.0
            });
          }
          return remaining;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [contents.length, bubbleCount]);

  return (
    <group ref={beakerRef} position={[position[0], position[1] - 0.7, position[2]]}>
      {/* Beaker body with more realistic shape */}
            {/* GLTF Beaker Model */}
      <group scale={0.1} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes.lab_beaker_a_0.geometry}
          material={materials.lab_beaker_a}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow
        >
          {isSelected && (
            <meshStandardMaterial
              color="#60A5FA"
              transparent
              opacity={0.2}
              roughness={0.1}
            />
          )}
        </mesh>
      </group>

      {/* Spout */}
      {/* <mesh position={[0.38, 0.64, 0]} rotation={[0.08, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.1, 0.1, 16]} />
        <meshPhysicalMaterial 
          color="#E6F3FF"
          transparent
          opacity={0.7}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh> */}

      {/* Liquid with better rendering */}
      {liquidHeight > 0 && (
        <mesh ref={liquidRef} position={[0, 0 + (liquidHeight / 2), 0]}>
          <cylinderGeometry args={[0.47, 0.47, liquidHeight, 32]} />
          <meshPhysicalMaterial
            color={getLiquidColor()}
            opacity={0.9}
            roughness={0.0}
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
      )}

      {/* Measurement markings */}
      {/* {[0, 0.2, 0.4, 0.6, 0.8, 1].map((height, index) => (
        <mesh key={index} position={[0.45, -0.4 + height, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.1]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))} */}

      {/* Temperature indicator */}
      {/* {temperature > 30 && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={
              temperature > 80
                ? "#FF4444"
                : temperature > 50
                ? "#FF8844"
                : "#FFAA44"
            }
            emissive={temperature > 80 ? "#440000" : "#000000"}
          />
        </mesh>
      )} */}

      {/* Equipment label with enhanced info */}
      {/* <Html position={[0, 1.2, 0]} center>
        <div className="bg-black/80 text-white p-2 rounded text-xs min-w-32 text-center">
          <div className="font-bold">Beaker 250mL</div>
          <div>Contents: {contents.length}</div>
          <div>Temp: {temperature}°C</div>
          {isHeated && <div className="text-red-400">🔥 Heated</div>}
        </div>
      </Html> */}

      {/* Reaction Bubbles */}
      {contents.length > 1 && (
        <>
          {/* Bubble particles */}
          {bubbles.map(bubble => (
            <mesh 
              key={bubble.id} 
              position={[
                bubble.position.x,
                bubble.position.y + (1 - bubble.life) * 0.4, // Move upward as life decreases
                bubble.position.z
              ]}
            >
              <sphereGeometry args={[bubble.size, 8, 8]} />
              <meshPhysicalMaterial
                color={getLiquidColor()}
                transparent
                opacity={bubble.life * 0.5}
                roughness={0.0}
                metalness={0.1}
                clearcoat={1.0}
              />
            </mesh>
          ))}
          <SteamParticles temperature={temperature} />
        </>
      )}
    </group>
  );
};


export const RealisticFlask: React.FC<AdvancedEquipmentProps> = ({
  position,
  contents = [],
  isSelected,
  temperature,
  isHeated,
  onClick,
}) => {
  const flaskRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Load Erlenmeyer flask from GLTF
  const { nodes, materials } = useGLTF("/models/beaker/scene.gltf") as any;

  // Calculate liquid height (flask is taller, so adjust scaling)
  const liquidHeight = Math.min(contents.length * 0.2, 0.8);

const getLiquidColor = () => {
  if (contents.length === 0) return "#87CEEB";

  const colorMap: { [key: string]: THREE.Color } = {
    "Hydrochloric Acid": new THREE.Color("#FFD700"),
    HCl: new THREE.Color("#FFD700"),
    "Sodium Hydroxide": new THREE.Color("#87CEEB"),
    NaOH: new THREE.Color("#87CEEB"),
    "Copper Sulfate": new THREE.Color("#4169E1"),
    CuSO4: new THREE.Color("#4169E1"),
    "Sulfuric Acid": new THREE.Color("#FFFF99"),
    H2SO4: new THREE.Color("#FFFF99"),
    "Iron Oxide": new THREE.Color("#CD853F"),
    Fe2O3: new THREE.Color("#CD853F"),
    "Potassium Permanganate": new THREE.Color("#800080"),
    KMnO4: new THREE.Color("#800080"),
  };

  if (contents.length === 1) {
    return colorMap[contents[0]] || new THREE.Color("#87CEEB");
  }

  // Mix multiple
  let mixedColor = new THREE.Color("#87CEEB");
  contents.forEach((chemical) => {
    const chemColor = colorMap[chemical];
    if (chemColor) {
      mixedColor.lerp(chemColor, 0.5);
    }
  });

  return mixedColor;
};


  // Gentle wiggle when selected
  useFrame((state) => {
    if (flaskRef.current && isSelected) {
      flaskRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={flaskRef} position={[0, -0.75, 0]}>
      {/* Flask mesh */}
      <group scale={0.1} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes.lab_erlenmeyer_a_0.geometry}
          material={materials.lab_erlenmeyer_a}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow
        >
          {isSelected && (
            <meshStandardMaterial
              color="#60A5FA"
              transparent
              opacity={0.25}
              roughness={0.15}
            />
          )}
        </mesh>
      </group>

      {liquidHeight > 0 && (
  <mesh
    ref={liquidRef}
    position={[0, 0.04 + liquidHeight / 2, 0]}
    scale={[1, 1, 1]}
  >
    {/* base radius larger, top radius smaller */}
    <cylinderGeometry args={[0.23, 0.50, liquidHeight, 32]} />
    <meshPhysicalMaterial
      color={getLiquidColor()}
      opacity={0.85}
      transparent
      roughness={0.1}
      transmission={0.9}
      thickness={0.6}
      ior={1.33}
    />
  </mesh>
)}

      {/* Optional floating UI label */}
      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
            Flask: {contents.join(", ") || "Empty"} <br />
            Temp: {temperature}°C
          </div>
        </Html>
      )}
    </group>
  );
};

export const RealisticBurner: React.FC<
  AdvancedEquipmentProps & {
    isLit: boolean;
    onToggle: () => void;
  }
> = ({ position, isLit, onToggle, onClick }) => {
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      flameRef.current.scale.y =
        1 + Math.sin(state.clock.elapsedTime * 6) * 0.2;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Burner base */}
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 32]} />
        <meshStandardMaterial color="#2C2C2C" metalness={0.8} roughness={0.3} />
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
          {/* <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#FFAA00" transparent opacity={0.1} />
          </mesh> */}
        </group>
      )}

      {/* <Html position={[0, -0.3, 0]} center>
        <div className="bg-black/80 text-white p-2 rounded text-xs text-center">
          <div className="font-bold">Bunsen Burner</div>
          <div>{isLit ? '🔥 Lit' : '⭕ Off'}</div>
          <div className="text-xs text-gray-300">Click knob to toggle</div>
        </div>
      </Html> */}
    </group>
  );
};

useGLTF.preload('/models/beaker/scene.gltf');
