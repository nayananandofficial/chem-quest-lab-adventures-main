import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Import your existing effects
import {
  BubblingEffect,
  SteamEffect,
  CrystallizationEffect,
  HeatGlowEffect,
  ColorTransitionEffect,
} from "./EnhancedChemicalEffects";
import { SteamParticles } from "./AdvancedChemistryVisuals";
import { VolumeControl } from "./VolumeControl";

// Enhanced liquid physics using your existing components
interface EnhancedLiquidProps {
  contents: Array<{ name: string; volume: number; color: string }>;
  totalVolume: number;
  containerRadius: number;
  containerHeight: number;
  temperature: number;
  isHeated: boolean;
  position: [number, number, number];
  containerType: "beaker" | "flask";
}

const EnhancedLiquidRenderer: React.FC<EnhancedLiquidProps> = ({
  contents,
  totalVolume,
  containerRadius,
  containerHeight,
  temperature,
  isHeated,
  position,
  containerType,
}) => {

  const liquidRef = useRef<THREE.Mesh>(null);

  // FIXED: Much more aggressive and continuous liquid height scaling
  const liquidHeight = useMemo(() => {
    if (totalVolume <= 0) return 0;

    if (containerType === "beaker") {
      // FIXED: Much more aggressive scaling - each 5ml adds significant height
      return Math.min(totalVolume * 0.025, containerHeight * 6.1); // 8x more aggressive + higher cap
    } else {
      // FIXED: Flask scaling - even more aggressive for faster flask filling
      return Math.min(totalVolume * 0.03, containerHeight * 8.5); // 6x more aggressive + higher cap
    }
  }, [totalVolume, containerRadius, containerHeight, containerType]);

  // ENHANCED: Realistic chemical colors and properties
  const getChemicalProperties = (chemicalName: string) => {
    const chemicalDatabase = {
      "Hydrochloric Acid": {
        color: "#F5F5DC",
        opacity: 0.95,
        roughness: 0.1,
        ior: 1.33,
        metalness: 0.0,
      },
      "Sodium Hydroxide": {
        color: "#F8F8FF",
        opacity: 0.92,
        roughness: 0.15,
        ior: 1.35,
        metalness: 0.0,
      },
      "Copper Sulfate": {
        color: "#4682B4",
        opacity: 0.88,
        roughness: 0.2,
        ior: 1.36,
        metalness: 0.1,
      },
      "Sulfuric Acid": {
        color: "#FFFAF0",
        opacity: 0.95,
        roughness: 0.25,
        ior: 1.4,
        metalness: 0.0,
      },
      "Potassium Permanganate": {
        color: "#8B008B",
        opacity: 0.85,
        roughness: 0.1,
        ior: 1.34,
        metalness: 0.05,
      },
      "Iron Oxide": {
        color: "#CD853F",
        opacity: 0.8,
        roughness: 0.3,
        ior: 1.5,
        metalness: 0.2,
      },
    };

    return (
      chemicalDatabase[chemicalName] || {
        color: "#87CEEB",
        opacity: 0.9,
        roughness: 0.1,
        ior: 1.33,
        metalness: 0.0,
      }
    );
  };

  // Material calculation
  const liquidMaterial = useMemo(() => {

    console.log("Material Debug:", {
      contents,
      totalVolume,
      contentsLength: contents.length,
      firstChemical: contents[0]?.name,
      firstChemicalColor: contents[0] ? getChemicalProperties(contents[0].name).color : 'none'
    });

    if (contents.length === 0) {
      const defaultProps = getChemicalProperties("Water");
      return {
        color: new THREE.Color(defaultProps.color),
        opacity: defaultProps.opacity,
        roughness: defaultProps.roughness,
        ior: defaultProps.ior,
        metalness: defaultProps.metalness,
      };
    }

    if (contents.length === 1) {
      const props = getChemicalProperties(contents[0].name);
      return {
        color: new THREE.Color(props.color),
        opacity: props.opacity,
        roughness: props.roughness,
        ior: props.ior,
        metalness: props.metalness,
      };
    }

    let mixedR = 0,
      mixedG = 0,
      mixedB = 0;
    let totalOpacity = 0,
      totalRoughness = 0,
      totalIor = 0,
      totalMetalness = 0;

    contents.forEach((chemical) => {
      const props = getChemicalProperties(chemical.name);
      const color = new THREE.Color(props.color);
      const ratio = chemical.volume / totalVolume;

      mixedR += color.r * ratio;
      mixedG += color.g * ratio;
      mixedB += color.b * ratio;
      totalOpacity += props.opacity * ratio;
      totalRoughness += props.roughness * ratio;
      totalIor += props.ior * ratio;
      totalMetalness += props.metalness * ratio;
    });

    return {
      color: new THREE.Color(mixedR, mixedG, mixedB),
      opacity: totalOpacity,
      roughness: totalRoughness,
      ior: totalIor,
      metalness: totalMetalness,
    };
  }, [contents, totalVolume]);

  // FIXED: Animation with proper positioning
  useFrame((state) => {
    if (liquidRef.current && totalVolume > 0) {
      const time = state.clock.elapsedTime;

      // Gentle swaying
      liquidRef.current.rotation.z = Math.sin(time * 0.5) * 0.01;

      // FIXED: Keep base position fixed, only add small movements
      if (isHeated && temperature > 50) {
        const heatIntensity = Math.min((temperature - 50) / 50, 1);
        liquidRef.current.position.y =
          liquidHeight / 2 + Math.sin(time * 8) * 0.003 * heatIntensity;
      } else {
        liquidRef.current.position.y = liquidHeight / 2;
      }

      if (contents.length > 1) {
        liquidRef.current.rotation.y += 0.005;
      }
    }
  });

  if (liquidHeight <= 0) return null;

  console.log("Liquid Debug:", {
    totalVolume,
    liquidHeight,
    containerRadius,
    containerType,
    finalLiquidColor: liquidMaterial.color.getHexString(),
    contentsDebug: contents
  });

  return (
    <group position={position}>
      {/* Main Liquid Body */}
      <mesh ref={liquidRef} position={[0, liquidHeight / 2, 0]}>
        {containerType === "beaker" ? (
          <cylinderGeometry
            args={[
              containerRadius * 3.9, // FIXED: Much larger radius - almost fills container
              containerRadius * 3.9,
              liquidHeight,
              32,
            ]}
          />
        ) : (
          <cylinderGeometry
            args={[
              containerRadius * 2.7 +
                (liquidHeight / containerHeight) * containerRadius * 0.01,
              containerRadius * 5.5 +
                (liquidHeight / containerHeight) * containerRadius * 0.2,
              liquidHeight,
              32,
            ]}
          />
        )}
        <meshPhysicalMaterial
          color={liquidMaterial.color}
          transparent
          opacity={liquidMaterial.opacity}
          roughness={liquidMaterial.roughness}
          metalness={liquidMaterial.metalness}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transmission={0.1}
          thickness={0.1}
          ior={liquidMaterial.ior}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* FIXED: Meniscus Effect - Only when significant volume */}
      {totalVolume > 10 && (
        <mesh
          position={[0, liquidHeight - 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshPhysicalMaterial
            color={liquidMaterial.color}
            transparent
            opacity={liquidMaterial.opacity * 0.6}
            roughness={0.0}
            metalness={0.0}
            clearcoat={1.0}
            ior={liquidMaterial.ior}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

// FIXED: Larger container sizes for better liquid fit
const EQUIPMENT_SPECS = {
  "beaker-250ml": {
    maxVolume: 250,
    radius: 1.2, // FIXED: Larger for better liquid fit
    name: "250ml Beaker",
  },
  "beaker-500ml": {
    maxVolume: 500,
    radius: 1.2, // FIXED: Larger for better liquid fit
    name: "500ml Beaker",
  },
  flask: {
    maxVolume: 300,
    topRadius: 0.2,
    bottomRadius: 0.8, // FIXED: Larger flask size
    name: "Conical Flask",
  },
};

// ADDED: Missing interfaces and types
interface Bubble {
  id: number;
  position: THREE.Vector3;
  speed: number;
  size: number;
  life: number;
}

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
  contents?: Array<{ name: string; volume: number; color: string }>;
  totalVolume?: number;
  equipmentType?: string;
  onClick?: () => void;
  onChemicalAdd?: (chemical: any, volume: number) => void;
  onVolumeChange?: (newVolume: number) => void;
}


export const RealisticBeaker: React.FC<AdvancedEquipmentProps> = ({
  position,
  contents = [],
  totalVolume = 0,
  isSelected,
  temperature = 20,
  isHeated,
  onClick,
  scale,
  equipmentType = "beaker-250ml",
  onVolumeChange,
  onChemicalAdd,
}) => {
  const beakerRef = useRef<THREE.Group>(null);
  const specs = EQUIPMENT_SPECS[equipmentType];

  console.log("Beaker Contents Debug:", {
    contents,
    totalVolume,
    contentsCount: contents.length,
    chemicalNames: contents.map(c => c.name),
    chemicalColors: contents.map(c => c.color)
  });

  // ENHANCED chemical library
  const availableChemicals = [
    { name: "Hydrochloric Acid", formula: "HCl", color: "#F5F5DC" },
    { name: "Sodium Hydroxide", formula: "NaOH", color: "#F8F8FF" },
    { name: "Copper Sulfate", formula: "CuSO4", color: "#0000FF" },
    { name: "Sulfuric Acid", formula: "H2SO4", color: "#FFFAF0" },
    { name: "Potassium Permanganate", formula: "KMnO4", color: "#8B008B" },
    { name: "Iron Oxide", formula: "Fe2O3", color: "#CD853F" },
    { name: "Sodium Chloride", formula: "NaCl", color: "#FFFFFF" },
  ];

  const handleChemicalAdd = (chemical: any, volume: number) => {
    if (onChemicalAdd) {
      onChemicalAdd(chemical, volume);
    }
  };

  // Effects logic
  const hasReaction = contents.length > 1;
  const isHot = temperature > 60;
  const isSteaming = temperature > 80;
  const hasPrecipitation = contents.some(
    (c) => c.name.includes("Copper Sulfate") || c.name.includes("Iron Oxide")
  );

  useFrame((state) => {
    if (beakerRef.current && isSelected) {
      beakerRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const { nodes, materials } = useGLTF(
    "/models/beaker/scene.gltf"
  ) as BeakerGLTFResult;
  const modelScale: [number, number, number] =
    equipmentType === "beaker-500ml" ? [0.1, 0.1, 0.1] : [0.08, 0.08, 0.08];

  console.log("Beaker Debug:", {
    totalVolume,
    containerRadius: specs?.radius,
    contents: contents.length,
  });

  return (
    <>
      {/* Beaker with animations - separate group */}
      <group
        ref={beakerRef}
        position={[position[0], position[1] - 0.73, position[2]]}
        scale={modelScale}
      >
        {/* 3D Beaker Model */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {nodes?.lab_beaker_a_0 && (
            <mesh
              geometry={nodes.lab_beaker_a_0.geometry}
              material={materials.lab_beaker_a as any}
              onClick={onClick}
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
          )}
        </group>

        {/* Liquid renderer */}
        {totalVolume > 0 && (
          <EnhancedLiquidRenderer
            contents={contents}
            totalVolume={totalVolume}
            containerRadius={specs?.radius || 1.2}
            containerHeight={2.0}
            temperature={temperature}
            isHeated={isHeated}
            position={[0, -0.5, 0]}
            containerType="beaker"
          />
        )}

        {/* Visual Effects */}
        {hasReaction && totalVolume > 20 && (
          <BubblingEffect
            position={[0, 0.2, 0]}
            effectType="bubbling"
            intensity={0.8}
            duration={8000}
          />
        )}

        {isSteaming && totalVolume > 10 && (
          <>
            <SteamEffect
              position={[0, 0.5, 0]}
              effectType="steam"
              intensity={0.6}
              duration={10000}
            />
            <SteamParticles temperature={temperature} />
          </>
        )}

        {hasPrecipitation && (
          <CrystallizationEffect
            position={[0, -0.3, 0]}
            effectType="crystallization"
            intensity={0.7}
            duration={12000}
          />
        )}

        {isHot && (
          <HeatGlowEffect
            position={[0, 0, 0]}
            effectType="heat_glow"
            intensity={Math.min((temperature - 50) / 50, 1)}
            duration={6000}
          />
        )}
      </group>

      {/* FIXED: Volume Control - Much closer to equipment */}
      {isSelected && onVolumeChange && specs && (
        <group position={[position[0] + 1.5, position[1] + 0.5, position[2]]}>
          <VolumeControl
            currentVolume={totalVolume}
            maxVolume={specs.maxVolume}
            onVolumeChange={onVolumeChange}
            onChemicalAdd={handleChemicalAdd}
            position={[0, 0, 0]}
            availableChemicals={availableChemicals}
          />
        </group>
      )}
    </>
  );
};

// FIXED: RealisticFlask with same fixes
export const RealisticFlask: React.FC<AdvancedEquipmentProps> = ({
  position,
  contents = [],
  totalVolume = 0,
  isSelected,
  temperature = 20,
  isHeated,
  onClick,
  scale,
  onVolumeChange,
  onChemicalAdd,
}) => {
  const flaskRef = useRef<THREE.Group>(null);

  const { nodes, materials } = useGLTF(
    "/models/beaker/scene.gltf"
  ) as BeakerGLTFResult;
  const specs = EQUIPMENT_SPECS["flask"];

  const availableChemicals = [
    { name: "Hydrochloric Acid", formula: "HCl", color: "#F5F5DC" },
    { name: "Sodium Hydroxide", formula: "NaOH", color: "#F8F8FF" },
    { name: "Copper Sulfate", formula: "CuSO4", color: "#4682B4" },
    { name: "Sulfuric Acid", formula: "H2SO4", color: "#FFFAF0" },
    { name: "Potassium Permanganate", formula: "KMnO4", color: "#8B008B" },
    { name: "Iron Oxide", formula: "Fe2O3", color: "#CD853F" },
  ];

  const handleChemicalAdd = (chemical: any, volume: number) => {
    if (onChemicalAdd) {
      onChemicalAdd(chemical, volume);
    }
  };

  const hasReaction = contents.length > 1;
  const isHot = temperature > 60;
  const isSteaming = temperature > 80;

  useFrame((state) => {
    if (flaskRef.current && isSelected) {
      flaskRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const modelScale: [number, number, number] = (scale as [
    number,
    number,
    number
  ]) ?? [0.08, 0.08, 0.08];

  return (
    <>
      {/* Flask with animations */}
      <group
        ref={flaskRef}
        position={[position[0], position[1] - 0.75, position[2]]}
        scale={modelScale}
      >
        {/* 3D Flask Model */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {nodes?.lab_erlenmeyer_a_0 && (
            <mesh
              geometry={nodes.lab_erlenmeyer_a_0.geometry}
              material={materials.lab_erlenmeyer_a as any}
              onClick={onClick}
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
          )}
        </group>

        {/* Flask liquid renderer */}
        {totalVolume > 0 && (
          <EnhancedLiquidRenderer
            contents={contents}
            totalVolume={totalVolume}
            containerRadius={specs.bottomRadius}
            containerHeight={1.2}
            temperature={temperature}
            isHeated={isHeated}
            position={[0, -0.6, 0]}
            containerType="flask"
          />
        )}

        {/* Visual Effects */}
        {hasReaction && totalVolume > 15 && (
          <BubblingEffect
            position={[0, 0.1, 0]}
            effectType="bubbling"
            intensity={0.6}
            duration={8000}
          />
        )}

        {isSteaming && (
          <SteamEffect
            position={[0, 0.8, 0]}
            effectType="steam"
            intensity={0.5}
            duration={10000}
          />
        )}
      </group>

      {/* FIXED: Volume Control - Much closer to equipment */}
      {isSelected && onVolumeChange && (
        <group position={[position[0] + 1.5, position[1] + 0.5, position[2]]}>
          <VolumeControl
            currentVolume={totalVolume}
            maxVolume={specs.maxVolume}
            onVolumeChange={onVolumeChange}
            onChemicalAdd={handleChemicalAdd}
            position={[0, 0, 0]}
            availableChemicals={availableChemicals}
          />
        </group>
      )}
    </>
  );
};

// Keep existing RealisticBurner and BuretteWithStand unchanged
export const RealisticBurner: React.FC<
  AdvancedEquipmentProps & { isLit?: boolean; onToggle?: () => void }
> = ({ position, onClick, isLit, onToggle }) => {
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      flameRef.current.scale.y =
        1 + Math.sin(state.clock.elapsedTime * 6) * 0.2;
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

      <mesh
        position={[0, 0.01, 0.18]}
        onClick={onToggle}
        rotation={[-Math.PI / 4, 0, 1.57]}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.05, 4]} />
        <meshStandardMaterial color="#ff151a" metalness={0.7} roughness={0.4} />
      </mesh>

      {isLit && (
        <group ref={flameRef} position={[0, 0.05, 0]}>
          <mesh>
            <coneGeometry args={[0.15, 0.4, 16]} />
            <meshStandardMaterial
              color="#0088FF"
              emissive="#0066CC"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <coneGeometry args={[0.09, 0.3, 10]} />
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

      <group position={[0, 0.42, 0]}>
        {[
          [-0.45, 0, -0.45],
          [0.45, 0, -0.45],
          [-0.45, 0, 0.45],
          [0.45, 0, 0.45],
        ].map((legPos, i) => (
          <group key={i} position={[legPos[0], -0.35, legPos[2]]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 4]} />
              <meshStandardMaterial
                color="#666666"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          </group>
        ))}

        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1, 0.02, 1]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};

export const BuretteWithStand: React.FC<AdvancedEquipmentProps> = ({
  position,
  scale,
  onClick,
}) => {
  const stand = useGLTF(
    "/models/burette_stand/scene.gltf"
  ) as GenericGLTFResult;
  const burette = useGLTF("/models/burette/scene.gltf") as GenericGLTFResult;

  const modelScale: [number, number, number] = [0.1, 0.1, 0.1];

  return (
    <group
      position={[position[0], position[1] - 0.9, position[2]]}
      scale={modelScale}
    >
      {stand?.nodes && (
        <group>
          {Object.entries(stand.nodes).map(([key, node]) => {
            if (node.type !== "Mesh") {
              return null;
            }

            let material;
            if (key === "pCube4_Chrom_0") {
              material = new THREE.MeshStandardMaterial({
                color: 0x000000,
                metalness: 0.3,
                roughness: 0.7,
              });
            } else if (key.includes("Black")) {
              material = stand.materials.Black;
            } else {
              material = stand.materials.Chrom;
            }

            return (
              <mesh key={key} geometry={node.geometry} material={material} />
            );
          })}
        </group>
      )}

      {burette?.nodes && (
        <group position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
          {Object.keys(burette.nodes).map((key) => {
            const node = (burette.nodes as any)[key];
            if (node.type !== "Mesh") {
              return null;
            }
            return (
              <mesh
                key={key}
                geometry={node.geometry}
                material={
                  (burette.materials as any)[Object.keys(burette.materials)[0]]
                }
                onClick={onClick}
              />
            );
          })}
        </group>
      )}
    </group>
  );
};

// Preload models
useGLTF.preload("/models/beaker/scene.gltf");
useGLTF.preload("/models/burette_stand/scene.gltf");
useGLTF.preload("/models/burette/scene.gltf");
