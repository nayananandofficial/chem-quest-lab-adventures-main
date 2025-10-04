import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SteamParticles } from "./AdvancedChemistryVisuals";
import { GLTF } from "three-stdlib";

interface Bubble {
  id: number;
  position: THREE.Vector3;
  speed: number;
  size: number;
  life: number;
}

// GLTF result typings for models used in this file
type BeakerGLTFResult = GLTF & {
  nodes: {
    lab_beaker_a_0?: THREE.Mesh;
    lab_erlenmeyer_a_0?: THREE.Mesh;
  };
  materials: {
    lab_beaker_a?: THREE.Material;
    lab_erlenmeyer_a?: THREE.Material;
  };
};

type GenericGLTFResult = GLTF & {
  nodes: { [key: string]: THREE.Mesh };
  materials: { [key: string]: THREE.Material };
};

interface AdvancedEquipmentProps {
  position: [number, number, number];
  isSelected?: boolean;
  isHeated?: boolean;
  scale?: [number, number, number];
  temperature?: number;
  contents?: string[];
  onClick?: () => void;
  onChemicalAdd?: (chemical: string) => void;
}

export const RealisticBeaker: React.FC<AdvancedEquipmentProps> = ({
  position,
  contents = [],
  isSelected,
  temperature = 20,
  isHeated,
  onClick,
  scale,
}) => {
  const beakerRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const bubbleCount = contents.length > 1 ? 15 : 0;
  const liquidHeight = Math.min(contents.length * 0.05, 1.0);

  const getLiquidColor = () => {
    if (contents.length === 0) return new THREE.Color("#87CEEB");

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

    const mixedColor = new THREE.Color("#87CEEB");
    contents.forEach((chemical) => {
      const chemColor = colorMap[chemical];
      if (chemColor) mixedColor.lerp(chemColor, 0.5);
    });

    return mixedColor;
  };

  useFrame((state) => {
    if (beakerRef.current) {
      if (isSelected) {
        beakerRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }

      if (isHeated && liquidRef.current) {
        liquidRef.current.position.y = -0.2 + liquidHeight / 2 + Math.sin(state.clock.elapsedTime * 8) * 0.02;
      }
    }
  });

  const { nodes, materials } = useGLTF("/models/beaker/scene.gltf") as BeakerGLTFResult;

  useEffect(() => {
    if (contents.length > 1) {
      const interval = setInterval(() => {
        setBubbles((prev) => {
          const remaining = prev
            .filter((b) => b.life > 0)
            .map((b) => ({ ...b, life: b.life - 0.02 }));

          while (remaining.length < bubbleCount) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;
            remaining.push({
              id: Date.now() + Math.random(),
              position: new THREE.Vector3(Math.cos(angle) * radius, -0.2, Math.sin(angle) * radius),
              speed: 0.01 + Math.random() * 0.02,
              size: 0.02 + Math.random() * 0.02,
              life: 1.0,
            });
          }

          return remaining;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [contents.length, bubbleCount]);

  const modelScale: [number, number, number] = (scale as [number, number, number]) ?? [0.08, 0.08, 0.08];

  return (
    <group ref={beakerRef} position={[position[0], position[1] - 0.7, position[2]]} scale={modelScale}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {nodes?.lab_beaker_a_0 && (
          <mesh
            geometry={nodes.lab_beaker_a_0.geometry}
            material={materials.lab_beaker_a as any}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            castShadow
            receiveShadow
          >
            {isSelected && <meshStandardMaterial color="#60A5FA" transparent opacity={0.2} roughness={0.1} />}
          </mesh>
        )}
      </group>

      {liquidHeight > 0 && (
        <mesh ref={liquidRef} position={[0, liquidHeight / 2 - 0.2, 0]}>
          <cylinderGeometry args={[0.17, 0.17, liquidHeight, 32]} />
          <meshPhysicalMaterial color={getLiquidColor()} opacity={0.9} roughness={0.0} metalness={0.2} clearcoat={1.0} clearcoatRoughness={0.1} />
        </mesh>
      )}

      {contents.length > 1 && (
        <>
          {bubbles.map((bubble) => (
            <mesh key={bubble.id} position={[bubble.position.x, bubble.position.y + (1 - bubble.life) * 0.4, bubble.position.z]}>
              <sphereGeometry args={[bubble.size, 8, 8]} />
              <meshPhysicalMaterial color={getLiquidColor()} transparent opacity={bubble.life * 0.5} roughness={0.0} metalness={0.1} clearcoat={1.0} />
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
  temperature = 20,
  isHeated,
  onClick,
  scale,
}) => {
  const flaskRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { nodes, materials } = useGLTF("/models/beaker/scene.gltf") as BeakerGLTFResult;
  const liquidHeight = Math.min(contents.length * 0.1, 0.8);

  const getLiquidColor = () => {
    if (contents.length === 0) return new THREE.Color("#87CEEB");

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

    if (contents.length === 1) return colorMap[contents[0]] || new THREE.Color("#87CEEB");

    const mixedColor = new THREE.Color("#87CEEB");
    contents.forEach((chemical) => {
      const chemColor = colorMap[chemical];
      if (chemColor) mixedColor.lerp(chemColor, 0.5);
    });
    return mixedColor;
  };

  useFrame((state) => {
    if (flaskRef.current && isSelected) {
      flaskRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const modelScale: [number, number, number] = (scale as [number, number, number]) ?? [0.08, 0.08, 0.08];

  return (
    <group ref={flaskRef} position={[position[0], position[1] - 0.75, position[2]]} scale={modelScale}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {nodes?.lab_erlenmeyer_a_0 && (
          <mesh
            geometry={nodes.lab_erlenmeyer_a_0.geometry}
            material={materials.lab_erlenmeyer_a as any}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            castShadow
            receiveShadow
          >
            {isSelected && <meshStandardMaterial color="#60A5FA" transparent opacity={0.25} roughness={0.15} />}
          </mesh>
        )}
      </group>

      {liquidHeight > 0 && (
        <mesh ref={liquidRef} position={[0, liquidHeight / 2 - 0.15, 0]} scale={[0.4, 0.7, 0.35]}>
          <cylinderGeometry args={[0.23, 0.5, liquidHeight, 32]} />
          <meshPhysicalMaterial color={getLiquidColor()} opacity={0.85} transparent roughness={0.1} transmission={0.9} thickness={0.6} ior={1.33} />
        </mesh>
      )}
    </group>
  );
};

export const RealisticBurner: React.FC<AdvancedEquipmentProps & { isLit?: boolean; onToggle?: () => void }> = ({ position, onClick, isLit, onToggle }) => {
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.2;
    }
  });

  return (
    <group position={[position[0], position[1] - 0.7, position[2]]}>
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.15, 0.2, 0.1, 52]} />
        <meshStandardMaterial color="#2C2C2C" metalness={0.8} roughness={0.3} />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 6;
        const x = Math.cos(angle) * 0.18;
        const z = Math.sin(angle) * 0.18;
        return (
          <mesh key={i} position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 52]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        );
      })}

      {/* Control knob (click to toggle flame) */}
      <mesh position={[0, 0.01, 0.18]} onClick={onToggle} rotation={[-Math.PI / 4, 0, 1.57]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 4]} />
        <meshStandardMaterial color="#ff151a" metalness={0.7} roughness={0.4} />
      </mesh>

      {isLit && (
        <group ref={flameRef} position={[0, 0.05, 0]}>
          <mesh>
            <coneGeometry args={[0.15, 0.4, 16]} />
            <meshStandardMaterial color="#0088FF" emissive="#0066CC" emissiveIntensity={0.8} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <coneGeometry args={[0.09, 0.3, 10]} />
            <meshStandardMaterial color="#FF6600" emissive="#FF4400" emissiveIntensity={1.0} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Top heating stand: four legs + top plate to support equipment for heating */}
      <group position={[0, 0.42, 0]}> 
        {/* four legs */}
        {[
          [-0.45, 0, -0.45],
          [0.45, 0, -0.45],
          [-0.45, 0, 0.45],
          [0.45, 0, 0.45]
        ].map((legPos, i) => (
          <group key={i} position={[legPos[0], -0.35, legPos[2]]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 4]} />
              <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* top plate */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1, 0.02, 1]} />
          <meshStandardMaterial color="#333333" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

export const BuretteWithStand: React.FC<AdvancedEquipmentProps> = ({ position, scale, onClick }) => {
  const stand = useGLTF("/models/burette_stand/scene.gltf") as GenericGLTFResult;
  const burette = useGLTF("/models/burette/scene.gltf") as GenericGLTFResult;

  const modelScale = [0.1, 0.1, 0.1];

  // Debug: Log all mesh names to console
  useEffect(() => {
    if (stand?.nodes) {
      console.log('Stand mesh names:', Object.keys(stand.nodes));
      console.log('Stand nodes:', stand.nodes);
    }
    if (stand?.materials) {
      console.log('Stand materials:', Object.keys(stand.materials));
    }
  }, [stand]);

  // Clone and modify material
  const getModifiedMaterial = (originalMaterial: THREE.Material, isBase: boolean) => {
    if (isBase) {
      const clonedMaterial = originalMaterial.clone();
      (clonedMaterial as any).color = new THREE.Color(0x000000); // Black color
      return clonedMaterial;
    }
    return originalMaterial;
  };

  return (
    <group position={[position[0], position[1] - 0.9, position[2]]} scale={modelScale}>
      {/* Stand */}
      {stand?.nodes && (
        <group>
          {Object.entries(stand.nodes).map(([key, node]) => {
            const isBase = key.toLowerCase().includes('base') || 
                          key.toLowerCase().includes('foot') || 
                          key.toLowerCase().includes('bottom');
            
            const originalMaterial = (stand.materials as any)[Object.keys(stand.materials)[0]];
            const material = getModifiedMaterial(originalMaterial, isBase);
            
            return (
              <mesh 
                key={key} 
                geometry={node.geometry}
                material={material}
              />
            );
          })}
        </group>
      )}

      {/* Burette (glass) - positioned slightly above the stand */}
      {burette?.nodes && (
        <group position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
          {Object.keys(burette.nodes).map((key) => (
            <mesh 
              key={key} 
              geometry={(burette.nodes as any)[key]?.geometry} 
              material={(burette.materials as any)[Object.keys(burette.materials)[0]]} 
              onClick={onClick} 
            />
          ))}
        </group>
      )}
    </group>
  );
};

// Preload models used by these components
useGLTF.preload("/models/beaker/scene.gltf");
useGLTF.preload("/models/burette_stand/scene.gltf");
useGLTF.preload("/models/burette/scene.gltf");

