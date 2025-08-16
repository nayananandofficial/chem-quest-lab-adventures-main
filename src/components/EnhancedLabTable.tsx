import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { useDragDrop } from './DragDropProvider';
import * as THREE from 'three';

interface GridPosition {
  x: number;
  z: number;
  occupied: boolean;
  equipmentId?: string;
  snapPoint: [number, number, number];
}

interface EnhancedLabTableProps {
  onEquipmentPlace: (equipmentId: string, position: [number, number, number]) => void;
  placedEquipment: { id: string; position: [number, number, number]; type: string }[];
}

export const EnhancedLabTable: React.FC<EnhancedLabTableProps> = ({ 
  onEquipmentPlace, 
  placedEquipment 
}) => {
  const tableRef = useRef<THREE.Group>(null);
  const [hoveredGrid, setHoveredGrid] = useState<{ x: number; z: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<[number, number, number]>([0, 0, 0]);
  const { draggedItem, isDragging, setIsDragging, setDraggedItem } = useDragDrop();

  // Enhanced grid system with snap points
  const gridSize = { width: 8, depth: 6 };
  const cellSize = 1.0;
  const tableWidth = gridSize.width * cellSize;
  const tableDepth = gridSize.depth * cellSize;

  const [gridPositions, setGridPositions] = useState<GridPosition[]>(() => {
    const positions: GridPosition[] = [];
    for (let x = 0; x < gridSize.width; x++) {
      for (let z = 0; z < gridSize.depth; z++) {
        const worldX = (x - gridSize.width / 2 + 0.5) * cellSize;
        const worldZ = (z - gridSize.depth / 2 + 0.5) * cellSize;
        positions.push({
          x: worldX,
          z: worldZ,
          occupied: false,
          snapPoint: [worldX, 0.85, worldZ]
        });
      }
    }
    return positions;
  });

  const getClosestSnapPoint = (position: [number, number, number]): [number, number, number] => {
    let closestDistance = Infinity;
    let closestPoint: [number, number, number] = position;

    gridPositions.forEach(gridPos => {
      const distance = Math.sqrt(
        Math.pow(position[0] - gridPos.snapPoint[0], 2) +
        Math.pow(position[2] - gridPos.snapPoint[2], 2)
      );
      
      if (distance < closestDistance && !gridPos.occupied) {
        closestDistance = distance;
        closestPoint = gridPos.snapPoint;
      }
    });

    return closestPoint;
  };

  const handleGridClick = (gridX: number, gridZ: number) => {
    if (draggedItem && isDragging) {
      const snapPoint = getClosestSnapPoint([gridX, 0, gridZ]);
      
      // Check collision detection
      const hasCollision = placedEquipment.some(eq => {
        const distance = Math.sqrt(
          Math.pow(eq.position[0] - snapPoint[0], 2) +
          Math.pow(eq.position[2] - snapPoint[2], 2)
        );
        return distance < cellSize * 0.8;
      });

      if (!hasCollision) {
        onEquipmentPlace(draggedItem.id, snapPoint);
        
        // Update grid occupancy
        setGridPositions(prev => prev.map(pos => {
          const distance = Math.sqrt(
            Math.pow(pos.snapPoint[0] - snapPoint[0], 2) +
            Math.pow(pos.snapPoint[2] - snapPoint[2], 2)
          );
          
          if (distance < cellSize * 0.5) {
            return { ...pos, occupied: true, equipmentId: draggedItem.id };
          }
          return pos;
        }));
      }
      
      setIsDragging(false);
      setDraggedItem(null);
      setShowPreview(false);
    }
  };

  const handleGridHover = (gridX: number, gridZ: number) => {
    if (isDragging && draggedItem) {
      const snapPoint = getClosestSnapPoint([gridX, 0, gridZ]);
      setPreviewPosition(snapPoint);
      setShowPreview(true);
      setHoveredGrid({ x: gridX, z: gridZ });
    }
  };

  // Enhanced table animation and effects
  useFrame((state) => {
    if (tableRef.current) {
      if (isDragging) {
        // Subtle glow effect when dragging
        tableRef.current.children.forEach((child: any) => {
          if (child.material && 'emissive' in child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.emissive.setHex(0x002200);
            material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
          }
        });
      } else {
        tableRef.current.children.forEach((child: any) => {
          if (child.material && 'emissive' in child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 0;
          }
        });
      }
    }
  });

  return (
    <group ref={tableRef} position={[0, 0, 0]}>
      {/* Enhanced Table Surface with better materials */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[tableWidth, 0.15, tableDepth]} />
        <meshPhysicalMaterial 
          color="#8B4513"
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Table edge trim */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[tableWidth + 0.1, 0.05, tableDepth + 0.1]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Enhanced Table Legs with better design */}
      {[
        [-tableWidth/2 + 0.3, -0.5, -tableDepth/2 + 0.3],
        [tableWidth/2 - 0.3, -0.5, -tableDepth/2 + 0.3],
        [-tableWidth/2 + 0.3, -0.5, tableDepth/2 - 0.3],
        [tableWidth/2 - 0.3, -0.5, tableDepth/2 - 0.3]
      ].map((legPosition, index) => (
        <group key={index}>
          {/* Main leg */}
          <mesh position={legPosition as [number, number, number]} castShadow>
            <boxGeometry args={[0.2, 1.0, 0.2]} />
            <meshStandardMaterial color="#654321" roughness={0.6} />
          </mesh>
          
          {/* Leg base */}
          <mesh position={[legPosition[0], legPosition[1] - 0.4, legPosition[2]]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Enhanced Grid System with better visuals */}
      {gridPositions.map((gridPos, index) => {
        const isOccupied = placedEquipment.some(eq => {
          const distance = Math.sqrt(
            Math.pow(eq.position[0] - gridPos.snapPoint[0], 2) +
            Math.pow(eq.position[2] - gridPos.snapPoint[2], 2)
          );
          return distance < cellSize * 0.5;
        });
        
        const isHovered = hoveredGrid && 
          Math.abs(hoveredGrid.x - gridPos.x) < 0.1 && 
          Math.abs(hoveredGrid.z - gridPos.z) < 0.1;
        
        return (
          <mesh
            key={index}
            position={[gridPos.x, 0.12, gridPos.z]}
            onPointerEnter={() => handleGridHover(gridPos.x, gridPos.z)}
            onPointerLeave={() => {
              setHoveredGrid(null);
              setShowPreview(false);
            }}
            onClick={() => handleGridClick(gridPos.x, gridPos.z)}
          >
            <cylinderGeometry args={[cellSize * 0.35, cellSize * 0.35, 0.02, 16]} />
            <meshStandardMaterial 
              color={
                isOccupied ? "#ff6b6b" : 
                isDragging && !isOccupied ? "#51cf66" : 
                isHovered ? "#74c0fc" : "#ffffff"
              }
              transparent 
              opacity={
                isDragging ? 0.7 : 
                isHovered ? 0.4 : 
                0.15
              }
              emissive={
                isHovered && isDragging ? "#00FF00" : "#000000"
              }
              emissiveIntensity={isHovered && isDragging ? 0.2 : 0}
            />
          </mesh>
        );
      })}

      {/* Grid lines for better guidance */}
      {Array.from({ length: gridSize.width + 1 }).map((_, i) => (
        <mesh key={`vertical-${i}`} position={[
          (i - gridSize.width / 2) * cellSize, 
          0.11, 
          0
        ]}>
          <boxGeometry args={[0.01, 0.005, tableDepth]} />
          <meshStandardMaterial 
            color="#999999" 
            transparent 
            opacity={isDragging ? 0.6 : 0.2} 
          />
        </mesh>
      ))}
      
      {Array.from({ length: gridSize.depth + 1 }).map((_, i) => (
        <mesh key={`horizontal-${i}`} position={[
          0, 
          0.11, 
          (i - gridSize.depth / 2) * cellSize
        ]}>
          <boxGeometry args={[tableWidth, 0.005, 0.01]} />
          <meshStandardMaterial 
            color="#999999" 
            transparent 
            opacity={isDragging ? 0.6 : 0.2} 
          />
        </mesh>
      ))}

      {/* Equipment Preview */}
      {showPreview && draggedItem && (
        <mesh position={previewPosition}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
          <meshStandardMaterial 
            color="#00FF00"
            transparent
            opacity={0.5}
            wireframe
          />
        </mesh>
      )}

      {/* Dynamic Instructions */}
      {isDragging && (
        <Html position={[0, 1.2, tableDepth/2 + 0.5]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
            <div className="font-bold text-green-400">🎯 Smart Placement Active</div>
            <div>• Green zones = Available</div>
            <div>• Red zones = Occupied</div>
            <div>• Auto-snap to grid</div>
          </div>
        </Html>
      )}

      {/* Enhanced Table Information */}
      <Html position={[0, -0.7, tableDepth/2 + 0.4]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs text-center">
          <div className="font-bold">Enhanced Lab Workbench</div>
          <div>{gridSize.width}×{gridSize.depth} Smart Grid • Auto-Snap • Collision Detection</div>
          <div className="text-gray-300">Placed: {placedEquipment.length}/{gridSize.width * gridSize.depth}</div>
        </div>
      </Html>

      {/* Table surface details */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[tableWidth - 0.2, 0.005, tableDepth - 0.2]} />
        <meshStandardMaterial 
          color="#A0522D"
          roughness={0.8}
          normalScale={new THREE.Vector2(0.1, 0.1)}
        />
      </mesh>

      {/* Table shadows and depth */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[tableWidth, 0.05, tableDepth]} />
        <meshStandardMaterial 
          color="#333333"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};