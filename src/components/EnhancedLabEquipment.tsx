import React, { useState, useEffect } from 'react';
import { 
  BubblingEffect, 
  SteamEffect, 
  CrystallizationEffect, 
  HeatGlowEffect, 
  ColorTransitionEffect 
} from './EnhancedChemicalEffects';
import { RealisticBeaker, RealisticFlask, RealisticBurner, BuretteWithStand } from './AdvancedEquipmentModels';
import { 
  TemperatureVisualization, 
  PHIndicator,
  EquipmentStateIndicator 
} from './AdvancedChemistryVisuals';

interface Equipment {
  type: string;
  id: string;
  position: [number, number, number];
  temperature: number;
  contents: string[];
  isHeated: boolean;
  pH: number;
  mixingLevel: number;
  reactionProgress: number;
  reactionType: string | null;
  // Added for burette
  volume?: number;
  concentration?: number;
  isDispensing?: boolean;
}

interface EnhancedLabEquipmentProps {
  selectedEquipment: string | null;
  setSelectedEquipment: (equipment: string | null) => void;
  reactions: any[];
  setReactions: (reactions: any[]) => void;
  position: [number, number, number];
  equipmentType: string;
  equipmentId: string;
  onChemicalAdd?: (equipmentId: string, chemical: string) => void;
  equipmentContents?: string[];
}

export const EnhancedLabEquipment: React.FC<EnhancedLabEquipmentProps> = ({ 
  selectedEquipment, 
  setSelectedEquipment, 
  reactions, 
  setReactions,
  position,
  equipmentType,
  equipmentId,
  onChemicalAdd,
  equipmentContents = []
}) => {
  const [equipment, setEquipment] = useState<Equipment>({
    type: equipmentType,
    id: equipmentId,
    position,
    temperature: 20,
    contents: equipmentContents,
    isHeated: false,
    pH: 7.0,
    mixingLevel: 0.0,
    reactionProgress: 0.0,
    reactionType: null,
    // Burette-specific properties
    volume: equipmentType.includes('burette') ? 50 : undefined,
    concentration: 0.1,
    isDispensing: false
  });

  const [activeEffects, setActiveEffects] = useState<{
    bubbling: boolean;
    steam: boolean;
    crystallization: boolean;
    heatGlow: boolean;
    colorTransition: boolean;
  }>({
    bubbling: false,
    steam: false,
    crystallization: false,
    heatGlow: false,
    colorTransition: false
  });

  // Update equipment contents and calculate properties
  useEffect(() => {
    setEquipment(prev => {
      const newEquipment = {
        ...prev,
        contents: equipmentContents
      };

      // Calculate pH based on contents
      newEquipment.pH = calculatePH(equipmentContents);
      
      // Determine if heating should occur (burettes typically don't get heated)
      newEquipment.isHeated = shouldHeat(equipmentContents) && !equipmentType.includes('burette');
      
      // Calculate temperature based on reactions and heating
      newEquipment.temperature = calculateTemperature(equipmentContents, newEquipment.isHeated);
      
      // Determine reaction type and progress
      const reactionInfo = determineReaction(equipmentContents);
      newEquipment.reactionType = reactionInfo.type;
      newEquipment.reactionProgress = reactionInfo.progress;

      return newEquipment;
    });

    // Trigger visual effects based on contents and reactions
    updateVisualEffects(equipmentContents);
  }, [equipmentContents, equipmentType]);

  const calculatePH = (contents: string[]): number => {
    if (contents.length === 0) return 7.0;
    
    const phMap: { [key: string]: number } = {
      'Hydrochloric Acid': 1.0,
      'HCl': 1.0,
      'Sulfuric Acid': 0.5,
      'H2SO4': 0.5,
      'Sodium Hydroxide': 13.0,
      'NaOH': 13.0,
      'Copper Sulfate': 4.0,
      'CuSO4': 4.0,
      'Potassium Permanganate': 2.0,
      'KMnO4': 2.0
    };

    let totalPH = 0;
    let count = 0;

    contents.forEach(chemical => {
      if (phMap[chemical] !== undefined) {
        totalPH += phMap[chemical];
        count++;
      }
    });

    return count > 0 ? totalPH / count : 7.0;
  };

  const shouldHeat = (contents: string[]): boolean => {
    const heatingChemicals = ['Sodium Hydroxide', 'NaOH', 'Sulfuric Acid', 'H2SO4'];
    return contents.some(chemical => heatingChemicals.includes(chemical));
  };

  const calculateTemperature = (contents: string[], isHeated: boolean): number => {
    let baseTemp = 20;
    
    if (isHeated) baseTemp += 40;
    
    // Exothermic reactions increase temperature
    if (contents.includes('Hydrochloric Acid') && contents.includes('Sodium Hydroxide')) {
      baseTemp += 30;
    }
    
    if (contents.includes('Sulfuric Acid')) {
      baseTemp += 20;
    }

    return Math.min(baseTemp + Math.random() * 10, 120);
  };

  const determineReaction = (contents: string[]): { type: string | null; progress: number } => {
    if (contents.includes('Hydrochloric Acid') && contents.includes('Sodium Hydroxide')) {
      return { type: 'Acid-Base Neutralization', progress: 0.8 };
    }
    
    if (contents.includes('Copper Sulfate') && contents.includes('Iron')) {
      return { type: 'Metal Displacement', progress: 0.6 };
    }
    
    if (contents.includes('Potassium Permanganate')) {
      return { type: 'Redox Titration', progress: 0.7 };
    }
    
    if (contents.length >= 2) {
      return { type: 'Chemical Mixing', progress: 0.4 };
    }

    return { type: null, progress: 0.0 };
  };

  const updateVisualEffects = (contents: string[]) => {
    setActiveEffects({
      bubbling: contents.includes('Hydrochloric Acid') || contents.includes('Sodium Hydroxide'),
      steam: equipment.temperature > 80,
      crystallization: contents.includes('Copper Sulfate') || contents.includes('Salt'),
      heatGlow: equipment.temperature > 60,
      colorTransition: contents.length > 1
    });
  };

  const handleEquipmentClick = () => {
    setSelectedEquipment(selectedEquipment === equipmentId ? null : equipmentId);
    console.log(`Selected equipment: ${equipmentId}, Contents:`, equipmentContents);
  };

  const handleChemicalDrop = (chemical: string) => {
    console.log(`Chemical ${chemical} dropped on ${equipmentId}`);
    if (onChemicalAdd) {
      onChemicalAdd(equipmentId, chemical);
    }
  };

  const handleBuretteDispense = () => {
    setEquipment(prev => ({ ...prev, isDispensing: !prev.isDispensing }));
    console.log(`Burette ${equipmentId} dispensing toggled`);
  };

  const isSelected = selectedEquipment === equipmentId;

  return (
    <group position={position}>
      {/* Render appropriate equipment type with advanced models */}
      {equipmentType.includes('beaker') && (
        <RealisticBeaker
          position={[0, 0, 0]}
          contents={equipment.contents}
          isSelected={isSelected}
          temperature={equipment.temperature}
          isHeated={equipment.isHeated}
          onClick={handleEquipmentClick}
          onChemicalAdd={(chemical: string) => onChemicalAdd?.(equipmentId, chemical)}
        />
      )}

      {equipmentType.includes('flask') && (
        <RealisticFlask
          position={[0, 0, 0]}
          contents={equipment.contents}
          isSelected={isSelected}
          temperature={equipment.temperature}
          isHeated={equipment.isHeated}
          onClick={handleEquipmentClick}
        />
      )}

      {equipmentType.includes('burner') && (
        <RealisticBurner
          position={[0, 0, 0]}
          contents={equipment.contents}
          isSelected={isSelected}
          temperature={equipment.temperature}
          isHeated={equipment.isHeated}
          onClick={handleEquipmentClick}
          isLit={equipment.isHeated}
          onToggle={() => setEquipment(prev => ({ ...prev, isHeated: !prev.isHeated }))}
        />
      )}

      {/* 🎯 ADDED: Burette with Stand */}
      {equipmentType.includes('burette') && (
        <BuretteWithStand
          position={[0, 0, 0]}
          contents={equipment.contents}
          isSelected={isSelected}
          temperature={equipment.temperature}
          onClick={handleEquipmentClick}
          onChemicalAdd={(chemical: string) => onChemicalAdd?.(equipmentId, chemical)}
          // Burette-specific props
          scale={[1.2, 1.2, 1.2]}
        />
      )}

      {/* Advanced Visual Effects - Modified for burette compatibility */}
      {activeEffects.bubbling && !equipmentType.includes('burette') && (
        <BubblingEffect
          position={[0, 0.2, 0]}
          effectType="bubbling"
          intensity={0.8}
          duration={8000}
        />
      )}

      {activeEffects.steam && !equipmentType.includes('burette') && (
        <SteamEffect
          position={[0, 0.5, 0]}
          effectType="steam"
          intensity={0.6}
          duration={10000}
        />
      )}

      {activeEffects.crystallization && (
        <CrystallizationEffect
          position={[0, -0.3, 0]}
          effectType="crystallization"
          intensity={0.7}
          duration={12000}
        />
      )}

      {/* Burette-specific dispensing effect */}
      {equipmentType.includes('burette') && equipment.isDispensing && (
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
          <meshStandardMaterial 
            color={equipment.contents.length > 0 ? "#4169E1" : "#87CEEB"}
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}

      {/* Advanced Chemistry Visualizations - Adjusted positions for burette */}
      {equipment.contents.length > 0 && (
        <PHIndicator
          pH={equipment.pH}
          position={equipmentType.includes('burette') ? [-1.2, 1.5, 0] : [-0.8, 0.5, 0]}
        />
      )}

      <EquipmentStateIndicator
        isSelected={isSelected}
        isHeated={equipment.isHeated}
        hasReaction={equipment.reactionType !== null}
        position={equipmentType.includes('burette') ? [0, -2, 0] : [0, -0.8, 0]}
      />

      {/* Burette-specific volume indicator */}
      {equipmentType.includes('burette') && equipment.volume && (
        <mesh position={[1.2, 1.5, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          {/* You would add text here showing volume */}
        </mesh>
      )}
    </group>
  );
};

// Usage example in your main lab component:
/*
<EnhancedLabEquipment
  selectedEquipment={selectedEquipment}
  setSelectedEquipment={setSelectedEquipment}
  reactions={reactions}
  setReactions={setReactions}
  position={[4, 0, 0]}
  equipmentType="burette"
  equipmentId="burette_1"
  onChemicalAdd={handleChemicalAdd}
  equipmentContents={["Sodium Hydroxide", "NaOH"]}
/>
*/