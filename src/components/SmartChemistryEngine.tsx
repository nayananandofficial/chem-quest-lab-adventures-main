import { useState, useCallback } from 'react';

export interface ReactionData {
  id: string;
  name: string;
  reactants: string[];
  products: string[];
  type: 'synthesis' | 'decomposition' | 'single_replacement' | 'double_replacement' | 'acid_base' | 'combustion' | 'redox';
  energy: 'endothermic' | 'exothermic';
  temperatureRequired: number;
  catalysts?: string[];
  conditions: string[];
  heatGenerated: number;
  colorChange?: {
    from: string;
    to: string;
  };
  gasEvolution?: boolean;
  precipitateFormed?: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  safetyWarnings: string[];
  description: string;
  balancedEquation: string;
  mechanism?: string[];
  educationalNotes: string[];
}

export interface SafetyAlert {
  id: string;
  level: 'warning' | 'danger' | 'critical';
  message: string;
  chemical?: string;
  action: string;
  timestamp: Date;
}

const reactionDatabase: ReactionData[] = [
  {
    id: 'hcl_naoh_neutralization',
    name: 'Acid-Base Neutralization',
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H₂O'],
    type: 'acid_base',
    energy: 'exothermic',
    temperatureRequired: 20,
    conditions: ['room temperature', 'aqueous solution'],
    heatGenerated: 57.3,
    dangerLevel: 'medium',
    safetyWarnings: ['Generates heat', 'Use eye protection'],
    description: 'Strong acid reacts with strong base to form salt and water',
    balancedEquation: 'HCl + NaOH → NaCl + H₂O',
    mechanism: [
      'H⁺ from acid combines with OH⁻ from base',
      'Forms water molecule',
      'Na⁺ and Cl⁻ remain as spectator ions'
    ],
    educationalNotes: [
      'This is a classic neutralization reaction',
      'The pH changes from acidic/basic to neutral (7)',
      'Heat is released due to formation of water'
    ]
  },
  {
    id: 'cuso4_naoh_precipitation',
    name: 'Copper Hydroxide Precipitation',
    reactants: ['CuSO₄', 'NaOH'],
    products: ['Cu(OH)₂', 'Na₂SO₄'],
    type: 'double_replacement',
    energy: 'exothermic',
    temperatureRequired: 20,
    conditions: ['room temperature', 'aqueous solution'],
    heatGenerated: 15.2,
    colorChange: {
      from: '#4169E1',
      to: '#87CEEB'
    },
    precipitateFormed: 'Cu(OH)₂',
    dangerLevel: 'low',
    safetyWarnings: ['Blue precipitate forms'],
    description: 'Copper sulfate reacts with sodium hydroxide to form copper hydroxide precipitate',
    balancedEquation: 'CuSO₄ + 2NaOH → Cu(OH)₂ + Na₂SO₄',
    mechanism: [
      'Cu²⁺ ions combine with OH⁻ ions',
      'Forms insoluble Cu(OH)₂ precipitate',
      'Na⁺ and SO₄²⁻ remain in solution'
    ],
    educationalNotes: [
      'Example of a precipitation reaction',
      'Demonstrates solubility rules',
      'Blue color comes from Cu²⁺ ions'
    ]
  },
  {
    id: 'mg_combustion',
    name: 'Magnesium Combustion',
    reactants: ['Mg', 'O₂'],
    products: ['MgO'],
    type: 'combustion',
    energy: 'exothermic',
    temperatureRequired: 650,
    conditions: ['high temperature', 'presence of oxygen'],
    heatGenerated: 601.6,
    colorChange: {
      from: '#C0C0C0',
      to: '#FFFFFF'
    },
    dangerLevel: 'high',
    safetyWarnings: ['Extremely bright light', 'Very hot flame', 'Do not look directly at flame'],
    description: 'Magnesium burns in oxygen with brilliant white light',
    balancedEquation: '2Mg + O₂ → 2MgO',
    mechanism: [
      'Magnesium atoms lose electrons to oxygen',
      'Forms ionic magnesium oxide',
      'Releases tremendous amount of energy'
    ],
    educationalNotes: [
      'Classic example of metal oxidation',
      'Demonstrates exothermic reactions',
      'Used in fireworks and flares'
    ]
  },
  {
    id: 'hcl_mg_replacement',
    name: 'Magnesium-Acid Reaction',
    reactants: ['Mg', 'HCl'],
    products: ['MgCl₂', 'H₂'],
    type: 'single_replacement',
    energy: 'exothermic',
    temperatureRequired: 20,
    conditions: ['room temperature', 'aqueous acid'],
    heatGenerated: 462.0,
    gasEvolution: true,
    dangerLevel: 'medium',
    safetyWarnings: ['Hydrogen gas evolution', 'Flammable gas produced'],
    description: 'Magnesium displaces hydrogen from hydrochloric acid',
    balancedEquation: 'Mg + 2HCl → MgCl₂ + H₂',
    mechanism: [
      'Magnesium atoms lose electrons',
      'H⁺ ions gain electrons to form H₂ gas',
      'Mg²⁺ and Cl⁻ remain in solution'
    ],
    educationalNotes: [
      'Example of single displacement reaction',
      'Demonstrates reactivity series',
      'Hydrogen gas test: pop with burning splint'
    ]
  },
  {
    id: 'h2so4_metal_danger',
    name: 'Sulfuric Acid Metal Reaction',
    reactants: ['H₂SO₄', 'Mg'],
    products: ['MgSO₄', 'H₂', 'SO₂'],
    type: 'redox',
    energy: 'exothermic',
    temperatureRequired: 20,
    conditions: ['room temperature', 'concentrated acid'],
    heatGenerated: 745.0,
    gasEvolution: true,
    dangerLevel: 'extreme',
    safetyWarnings: [
      'DANGER: Toxic SO₂ gas produced',
      'Extremely exothermic reaction',
      'Use fume hood',
      'Emergency ventilation required'
    ],
    description: 'DANGEROUS: Sulfuric acid reacts violently with metals producing toxic gases',
    balancedEquation: 'Mg + 2H₂SO₄ → MgSO₄ + SO₂ + 2H₂O + H₂',
    mechanism: [
      'Multiple simultaneous reactions occur',
      'Produces toxic sulfur dioxide gas',
      'Extreme heat generation'
    ],
    educationalNotes: [
      'DO NOT PERFORM without proper safety equipment',
      'Demonstrates why acid safety is critical',
      'Example of complex redox chemistry'
    ]
  }
];

const safetyRules = {
  incompatibleCombinations: [
    {
      chemicals: ['H₂SO₄', 'organic'],
      warning: 'DANGER: Sulfuric acid can cause explosive reactions with organic compounds'
    },
    {
      chemicals: ['HCl', 'H₂SO₄'],
      warning: 'CAUTION: Mixing acids can cause violent reactions'
    },
    {
      chemicals: ['Mg', 'H₂SO₄'],
      warning: 'EXTREME DANGER: Produces toxic SO₂ gas and extreme heat'
    }
  ],
  temperatureLimits: {
    'H₂SO₄': { max: 80, warning: 'Sulfuric acid becomes more reactive at high temperatures' },
    'HCl': { max: 85, warning: 'HCl vapor pressure increases rapidly with temperature' },
    'Mg': { ignition: 650, warning: 'Magnesium ignites at high temperatures' }
  }
};

export const useSmartChemistryEngine = () => {
  const [activeReactions, setActiveReactions] = useState<ReactionData[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [reactionHistory, setReactionHistory] = useState<ReactionData[]>([]);

  const detectReaction = useCallback((chemicals: string[], temperature: number = 20): ReactionData | null => {
    // Check safety first
    checkSafety(chemicals, temperature);
    
    // Find matching reaction
    for (const reaction of reactionDatabase) {
      const hasAllReactants = reaction.reactants.every(reactant =>
        chemicals.some(chem => chem.includes(reactant))
      );
      
      if (hasAllReactants && temperature >= reaction.temperatureRequired) {
        return reaction;
      }
    }
    
    return null;
  }, []);

  const checkSafety = useCallback((chemicals: string[], temperature: number) => {
    const alerts: SafetyAlert[] = [];
    
    // Check incompatible combinations
    safetyRules.incompatibleCombinations.forEach(rule => {
      const hasIncompatible = rule.chemicals.every(chem =>
        chemicals.some(chemical => chemical.includes(chem))
      );
      
      if (hasIncompatible) {
        alerts.push({
          id: `incompatible_${Date.now()}`,
          level: 'critical',
          message: rule.warning,
          action: 'STOP: Separate chemicals immediately',
          timestamp: new Date()
        });
      }
    });

    // Check temperature limits
    chemicals.forEach(chemical => {
      Object.entries(safetyRules.temperatureLimits).forEach(([chem, limits]) => {
        if (chemical.includes(chem)) {
          if ('max' in limits && temperature > limits.max) {
            alerts.push({
              id: `temp_${chem}_${Date.now()}`,
              level: 'danger',
              message: limits.warning,
              chemical: chem,
              action: 'Reduce temperature immediately',
              timestamp: new Date()
            });
          }
          if ('ignition' in limits && temperature > limits.ignition) {
            alerts.push({
              id: `ignition_${chem}_${Date.now()}`,
              level: 'critical',
              message: `${chem} ignition temperature exceeded!`,
              chemical: chem,
              action: 'EVACUATE: Fire hazard imminent',
              timestamp: new Date()
            });
          }
        }
      });
    });

    if (alerts.length > 0) {
      setSafetyAlerts(prev => [...prev, ...alerts]);
    }
  }, []);

  const performReaction = useCallback((chemicals: string[], temperature: number = 20, catalyst?: string): ReactionData | null => {
    const reaction = detectReaction(chemicals, temperature);
    
    if (reaction) {
      // Check for catalysts
      if (catalyst && reaction.catalysts?.includes(catalyst)) {
        reaction.temperatureRequired *= 0.8; // Catalyst lowers activation energy
      }
      
      setActiveReactions(prev => [...prev, reaction]);
      setReactionHistory(prev => [...prev, reaction]);
      
      // Generate educational insights
      generateEducationalInsights(reaction);
    }
    
    return reaction;
  }, [detectReaction]);

  const generateEducationalInsights = useCallback((reaction: ReactionData) => {
    // This could be expanded to provide real-time educational content
    console.log(`Educational Insight: ${reaction.description}`);
    console.log(`Mechanism: ${reaction.mechanism?.join(' → ')}`);
    console.log(`Safety: ${reaction.safetyWarnings.join(', ')}`);
  }, []);

  const clearSafetyAlerts = useCallback(() => {
    setSafetyAlerts([]);
  }, []);

  const getReactionsByType = useCallback((type: string) => {
    return reactionDatabase.filter(reaction => reaction.type === type);
  }, []);

  const predictProductProperties = useCallback((reaction: ReactionData, conditions: { temperature: number; pressure: number }) => {
    // Advanced chemistry prediction logic would go here
    return {
      state: 'liquid',
      color: reaction.colorChange?.to || '#FFFFFF',
      density: 1.0,
      boilingPoint: 100,
      stability: 'stable'
    };
  }, []);

  return {
    detectReaction,
    performReaction,
    checkSafety,
    clearSafetyAlerts,
    getReactionsByType,
    predictProductProperties,
    activeReactions,
    safetyAlerts,
    reactionHistory,
    reactionDatabase
  };
};