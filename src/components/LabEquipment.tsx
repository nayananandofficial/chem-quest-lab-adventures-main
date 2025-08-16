
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useDragDrop } from './DragDropProvider';
import * as THREE from 'three';

interface LabEquipmentProps {
  selectedEquipment: string | null;
  setSelectedEquipment: (equipment: string | null) => void;
  reactions: any[];
  setReactions: (reactions: any[]) => void;
}

const BeakerComponent: React.FC<{ position: [number, number, number], id: string, onClick: () => void }> = ({ position, id, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { draggedItem, setDraggedItem, isDragging, setIsDragging } = useDragDrop();

  useFrame((state) => {
    if (meshRef.current && hovered && !isDragging) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setDraggedItem({ type: 'beaker', id });
    setIsDragging(true);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.5, 0.3, 1.5, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#60A5FA" : "#3B82F6"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        Beaker
      </Text>
    </group>
  );
};

const FlaskComponent: React.FC<{ position: [number, number, number], id: string, onClick: () => void }> = ({ position, id, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#F59E0B" : "#D97706"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#F59E0B" : "#D97706"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        Flask
      </Text>
    </group>
  );
};

const BurnerComponent: React.FC<{ position: [number, number, number], id: string, onClick: () => void }> = ({ position, id, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isLit, setIsLit] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isLit) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => {
          onClick();
          setIsLit(!isLit);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#6B7280" : "#4B5563"} 
        />
      </mesh>
      {isLit && (
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.1, 0.5, 8]} />
          <meshStandardMaterial 
            color="#FF4500" 
            transparent 
            opacity={0.8}
            emissive="#FF4500"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        Burner {isLit ? '(ON)' : '(OFF)'}
      </Text>
    </group>
  );
};

export const LabEquipment: React.FC<LabEquipmentProps> = ({ 
  selectedEquipment, 
  setSelectedEquipment, 
  reactions, 
  setReactions 
}) => {
  const equipment = [
    { type: 'beaker', id: 'beaker1', position: [-2, 0.8, 0] as [number, number, number] },
    { type: 'beaker', id: 'beaker2', position: [0, 0.8, 0] as [number, number, number] },
    { type: 'flask', id: 'flask1', position: [2, 0.8, 0] as [number, number, number] },
    { type: 'burner', id: 'burner1', position: [0, 0.15, -1.5] as [number, number, number] },
  ];

  const handleEquipmentClick = (id: string) => {
    setSelectedEquipment(selectedEquipment === id ? null : id);
    console.log(`Selected equipment: ${id}`);
  };

  return (
    <>
      {equipment.map((item) => {
        switch (item.type) {
          case 'beaker':
            return (
              <BeakerComponent
                key={item.id}
                position={item.position}
                id={item.id}
                onClick={() => handleEquipmentClick(item.id)}
              />
            );
          case 'flask':
            return (
              <FlaskComponent
                key={item.id}
                position={item.position}
                id={item.id}
                onClick={() => handleEquipmentClick(item.id)}
              />
            );
          case 'burner':
            return (
              <BurnerComponent
                key={item.id}
                position={item.position}
                id={item.id}
                onClick={() => handleEquipmentClick(item.id)}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};
