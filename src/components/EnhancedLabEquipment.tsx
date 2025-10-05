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
  onChemicalAdd?: (chemical: any, volume: number) => void; // Updated signature
  equipmentContents?: string[]; // Keep for backward compatibility
  // New props for volume system:
  chemicalObjects?: Array<{name: string; volume: number; color: string}>;
  totalVolume?: number;
  onVolumeChange?: (newVolume: number) => void;
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
  equipmentContents = [],
  chemicalObjects = [],
  totalVolume = 0,
  onVolumeChange
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

  // Helper function to get default colors for backward compatibility
  const getDefaultChemicalColor = (chemicalName: string): string => {
    const colorMap: { [key: string]: string } = {
      "Hydrochloric Acid": "#FFD700",
      "HCl": "#FFD700",
      "Sodium Hydroxide": "#87CEEB",
      "NaOH": "#87CEEB",
      "Copper Sulfate": "#4169E1",
      "CuSO4": "#4169E1",
      "Sulfuric Acid": "#FFFF99",
      "H2SO4": "#FFFF99",
      "Iron Oxide": "#CD853F",
      "Fe2O3": "#CD853F",
      "Potassium Permanganate": "#800080",
      "KMnO4": "#800080",
    };
    return colorMap[chemicalName] || "#87CEEB";
  };

  // Use chemicalObjects if available, otherwise convert equipmentContents to objects
  const chemicals = chemicalObjects.length > 0 
    ? chemicalObjects 
    : equipmentContents.map(name => ({
        name,
        volume: 5, // Default volume for backward compatibility
        color: getDefaultChemicalColor(name)
      }));

  const contentNames = chemicals.map(c => c.name);

  // Update equipment contents and calculate properties
  useEffect(() => {
    setEquipment(prev => {
      const newEquipment = {
        ...prev,
        contents: contentNames
      };

      // Calculate pH based on contents
      newEquipment.pH = calculatePH(contentNames);
      
      // Determine if heating should occur (burettes typically don't get heated)
      newEquipment.isHeated = shouldHeat(contentNames) && !equipmentType.includes('burette');
      
      // Calculate temperature based on reactions and heating
      newEquipment.temperature = calculateTemperature(contentNames, newEquipment.isHeated);
      
      // Determine reaction type and progress
      const reactionInfo = determineReaction(contentNames);
      newEquipment.reactionType = reactionInfo.type;
      newEquipment.reactionProgress = reactionInfo.progress;

      return newEquipment;
    });

    // Trigger visual effects based on contents and reactions
    updateVisualEffects(contentNames);
  }, [equipmentContents, chemicalObjects, equipmentType]);

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
    console.log(`Selected equipment: ${equipmentId}, Contents:`, contentNames);
  };

  // NEW: Enhanced chemical addition handler
  const handleChemicalAdd = (chemical: any, volume: number) => {
    console.log(`Adding chemical: ${chemical.name}, Volume: ${volume}ml to ${equipmentId}`);
    
    // Update equipment state with new chemical
    setEquipment(prev => {
      const newContents = [...prev.contents, chemical.name];
      return {
        ...prev,
        contents: newContents
      };
    });

    // Call parent handler to update the chemical objects and total volume
    if (onChemicalAdd) {
      onChemicalAdd(chemical, volume);
    }
  };

  const handleChemicalDrop = (chemical: string) => {
    console.log(`Chemical ${chemical} dropped on ${equipmentId}`);
    // This is for backward compatibility - convert to new format
    const chemicalObj = {
      name: chemical,
      color: getDefaultChemicalColor(chemical)
    };
    handleChemicalAdd(chemicalObj, 5);
  };

  const handleBuretteDispense = () => {
    setEquipment(prev => ({ ...prev, isDispensing: !prev.isDispensing }));
    console.log(`Burette ${equipmentId} dispensing toggled`);
  };

  const isSelected = selectedEquipment === equipmentId;

  // Determine beaker model scale based on equipment type
  const beakerScale: [number, number, number] = equipmentType.includes('500')
    ? [0.1, 0.1, 0.1]
    : equipmentType.includes('250')
    ? [0.08, 0.08, 0.08]
    : [0.06, 0.06, 0.06];

  return (
    <group position={position}>
      {/* Render appropriate equipment type with enhanced volume system */}
      {equipmentType.includes('beaker') && (
        <RealisticBeaker
          position={[0, 0, 0]}
          contents={chemicals} // Pass chemical objects with volume and color
          totalVolume={totalVolume}
          isSelected={isSelected}
          temperature={equipment.temperature}
          isHeated={equipment.isHeated}
          onClick={handleEquipmentClick}
          onChemicalAdd={handleChemicalAdd} // Pass the enhanced handler
          scale={beakerScale}
          equipmentType={equipmentType}
          onVolumeChange={onVolumeChange}
        />
      )}

      {equipmentType.includes('flask') && (
        <RealisticFlask
          position={[0, 0, 0]}
          contents={chemicals}
          totalVolume={totalVolume}
          isSelected={isSelected}
          temperature={equipment.temperature}
          isHeated={equipment.isHeated}
          onClick={handleEquipmentClick}
          onVolumeChange={onVolumeChange}
          onChemicalAdd={handleChemicalAdd}
        />
      )}

      {equipmentType.includes('burner') && (
        <RealisticBurner
          position={[0, 0, 0]}
          contents={chemicals}
          isSelected={isSelected}
          temperature={equipment.temperature}
          isHeated={equipment.isHeated}
          onClick={handleEquipmentClick}
          isLit={equipment.isHeated}
          onToggle={() => setEquipment(prev => ({ ...prev, isHeated: !prev.isHeated }))}
        />
      )}

      {equipmentType.includes('burette') && (
        <BuretteWithStand
          position={[0, 0, 0]}
          contents={chemicals}
          isSelected={isSelected}
          temperature={equipment.temperature}
          onClick={handleEquipmentClick}
          onChemicalAdd={handleChemicalAdd}
          scale={[1.2, 1.2, 1.2]}
        />
      )}

      {/* Advanced Visual Effects - Modified for burette compatibility */}
      {activeEffects.bubbling && !equipmentType.includes('burette') && totalVolume > 10 && (
        <BubblingEffect
          position={[0, 0.2, 0]}
          effectType="bubbling"
          intensity={0.8}
          duration={8000}
        />
      )}

      {activeEffects.steam && !equipmentType.includes('burette') && totalVolume > 10 && (
        <SteamEffect
          position={[0, 0.5, 0]}
          effectType="steam"
          intensity={0.6}
          duration={10000}
        />
      )}

      {activeEffects.crystallization && totalVolume > 5 && (
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
            color={chemicals.length > 0 ? chemicals[0].color : "#87CEEB"}
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}

      {/* Advanced Chemistry Visualizations - Adjusted positions for burette */}
      {contentNames.length > 0 && (
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
        </mesh>
      )}
    </group>
  );
};
