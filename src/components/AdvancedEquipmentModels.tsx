import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SteamParticles } from "./AdvancedChemistryVisuals";

interface Bubble {
  id: number;
  position: THREE.Vector3;
  speed: number;
  size: number;
  life: number;
}

import { GLTF } from "three-stdlib";

// Updated type definitions for your specific GLTF models
type BeakerGLTFResult = GLTF & {
  nodes: {
    lab_beaker_a_0: THREE.Mesh;
    lab_erlenmeyer_a_0: THREE.Mesh;
  };
  materials: {
    lab_beaker_a: THREE.MeshPhysicalMaterial;
    lab_erlenmeyer_a: THREE.MeshPhysicalMaterial;
  };
};

type BuretteGLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

type StandGLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
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
}) => {
  const beakerRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleCount = contents.length > 1 ? 15 : 0;

  const liquidHeight = Math.min(contents.length * 0.05, 1.0);

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

    let mixedColor = new THREE.Color("#87CEEB");
    contents.forEach((chemical) => {
      const chemColor = colorMap[chemical];
      if (chemColor) {
        mixedColor.lerp(chemColor, 0.5);
      }
    });

    return mixedColor;
  };

  useFrame((state) => {
    if (beakerRef.current) {
      if (isSelected) {
        beakerRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }

      if (isHeated && liquidRef.current) {
        liquidRef.current.position.y =
          -0.2 +
          liquidHeight / 2 +
          Math.sin(state.clock.elapsedTime * 8) * 0.02;
      }
    }
  });

  const { nodes, materials } = useGLTF(
    "/models/beaker/scene.gltf"
  ) as BeakerGLTFResult;

  useEffect(() => {
    if (contents.length > 1) {
      const interval = setInterval(() => {
        setBubbles((prev) => {
          const remaining = prev
            .filter((b) => b.life > 0)
            .map((b) => ({
              ...b,
              life: b.life - 0.02,
            }));

          while (remaining.length < bubbleCount) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;
            remaining.push({
              id: Date.now() + Math.random(),
              position: new THREE.Vector3(
                Math.cos(angle) * radius,
                -0.2,
                Math.sin(angle) * radius
              ),
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

  return (
    <group
      ref={beakerRef}
      position={[position[0], position[1] - 0.7, position[2]]}
    >
      <group scale={0.04} rotation={[-Math.PI / 2, 0, 0]}>
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

      {liquidHeight > 0 && (
        <mesh ref={liquidRef} position={[0, 0 + liquidHeight/2, 0]}>
          <cylinderGeometry args={[0.17, 0.17, liquidHeight, 32]} />
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

      {contents.length > 1 && (
        <>
          {bubbles.map((bubble) => (
            <mesh
              key={bubble.id}
              position={[
                bubble.position.x,
                bubble.position.y + (1 - bubble.life) * 0.4,
                bubble.position.z,
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
  temperature = 20,
  isHeated,
  onClick,
}) => {
  const flaskRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { nodes, materials } = useGLTF(
    "/models/beaker/scene.gltf"
  ) as BeakerGLTFResult;

  const liquidHeight = Math.min(contents.length * 0.1, 0.8);

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

    let mixedColor = new THREE.Color("#87CEEB");
    contents.forEach((chemical) => {
      const chemColor = colorMap[chemical];
      if (chemColor) {
        mixedColor.lerp(chemColor, 0.5);
      }
    });

    return mixedColor;
  };

  useFrame((state) => {
    if (flaskRef.current && isSelected) {
      flaskRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={flaskRef} position={[0, -0.75, 0]}>
      <group scale={0.04} rotation={[-Math.PI / 2, 0, 0]}>
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
          position={[0, 0 + liquidHeight / 2, 0]}
          scale={[0.4, 0.7, 0.35]}
        >
          <cylinderGeometry args={[0.23, 0.5, liquidHeight, 32]} />
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

      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
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
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 32]} />
        <meshStandardMaterial color="#2C2C2C" metalness={0.8} roughness={0.3} />
      </mesh>

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

      <mesh position={[0.35, 0, 0]} onClick={onToggle}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.4} />
      </mesh>

      {isLit && (
        <group ref={flameRef} position={[0, 0.15, 0]}>
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
        </group>
      )}
    </group>
  );
};

// FIXED: BuretteWithStand Component
export const BuretteWithStand: React.FC<AdvancedEquipmentProps> = ({
  position,
  scale = [1, 1, 1],
  isSelected,
  onClick,
  contents = [],
  temperature = 20,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [liquidLevel, setLiquidLevel] = useState(0.8);

  const liquidHeight = Math.min(contents.length * 0.3, 1.5);

  const getLiquidColor = () => {
    if (contents.length === 0) return "#87CEEB";

    const colorMap: { [key: string]: string } = {
      "Hydrochloric Acid": "#FFD700",
      HCl: "#FFD700",
      "Sodium Hydroxide": "#87CEEB",
      NaOH: "#87CEEB",
      "Potassium Permanganate": "#800080",
      KMnO4: "#800080",
    };

    return colorMap[contents[0]] || "#87CEEB";
  };

  // Load both models with error handling
  const standGltf = useGLTF(
    "/models/burette_stand/scene.gltf"
  ) as StandGLTFResult;
  const buretteGltf = useGLTF(
    "/models/burette/scene.gltf"
  ) as BuretteGLTFResult;

  useEffect(() => {
    console.log("Stand loaded:", standGltf.scene);
    console.log("Burette loaded:", buretteGltf.scene);

    // Traverse and log the scene structure
    standGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log("Stand mesh:", child.name, child.geometry, child.material);
      }
    });

    buretteGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(
          "Burette mesh:",
          child.name,
          child.geometry,
          child.material
        );
      }
    });
  }, [standGltf, buretteGltf]);

  // Gentle rotation when selected
  useFrame((state) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.02;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Stand Base */}
      <mesh position={[0, -0.54, 0]}>
        <cylinderGeometry args={[0.2, 0.5, 0.15, 4]} />
        <meshStandardMaterial color="#404040" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Stand Vertical Rod */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 16]} />
        <meshStandardMaterial color="#606060" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Clamp Holder */}
      <mesh position={[0.2, 1.5, 0]}>
        <boxGeometry args={[0.7, 0.1, 0.1]} />
        <meshStandardMaterial color="#303030" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Burette Glass Tube */}
      <mesh position={[0.45, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2, 32]} />
        <meshPhysicalMaterial
          color="#F0F8FF"
          transparent
          opacity={0.15}
          roughness={0.0}
          transmission={0.95}
          thickness={0.1}
          ior={1.5}
        />
      </mesh>

      {/* Burette Liquid */}
      {liquidHeight > 0 && (
        <mesh position={[0.15, 0.8 - (1 - liquidLevel), 0]}>
          <cylinderGeometry args={[0.025, 0.025, liquidLevel * 2, 32]} />
          <meshPhysicalMaterial
            color={getLiquidColor()}
            opacity={0.8}
            transparent
            roughness={0.1}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Stopcock Body - More cylindrical and realistic */}
      <mesh position={[0.45, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Stopcock Core/Plug - The rotating part inside */}
      <mesh position={[0.45, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.085, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Valve Handle - More realistic T-handle */}
      <mesh position={[0.49, -0.15, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 4]} />
        <meshStandardMaterial color="#8B7355" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Threaded connections on both sides */}
      <mesh position={[0.41, -0.15, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.038, 0.026, 0.02, 4]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.49, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.016, 0.02, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Burette Tip */}
      <mesh position={[0.45, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshPhysicalMaterial
          color="#F0F8F3"
          transparent
          opacity={0.4}
          roughness={0.0}
          transmission={0.9}
        />
      </mesh>

      {/* Burette Tip Opening */}
      <mesh position={[0.45, -0.29, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.02, 8]} />
        <meshPhysicalMaterial color="#F0F8F3" transparent opacity={0.6} />
      </mesh>

      {/* Graduation Marks */}
      {Array.from({ length: 23 }).map((_, i) => (
        <mesh key={i} position={[0.48, 1.7 - i * 0.08, 0]}>
          <boxGeometry args={[0.0, 0.003, 0.03]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}

      {/* Major graduation marks with numbers */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`major-${i}`} position={[0.49, 1.7 - i * 0.4, 0]}>
          <boxGeometry args={[0.001, 0.001, 0.025]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0.45, 0.8, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.98, 32]} />
          <meshBasicMaterial color="#60A5FA" transparent opacity={0.1} />
        </mesh>
      )}

      {/* Hover information */}
      {hovered && (
        <Html position={[0, 2.5, 0]} center>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <div className="text-xs text-gray-300 text-center mt-1">
              Click to select
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Preload all models
useGLTF.preload("/models/beaker/scene.gltf");
useGLTF.preload("/models/burette_stand/scene.gltf");
useGLTF.preload("/models/burette/scene.gltf");
