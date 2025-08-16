
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Droplets, AlertTriangle, Info, Flame, Skull } from 'lucide-react';

interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string;
  state: 'solid' | 'liquid' | 'gas';
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  molarMass: number;
  density?: number;
  boilingPoint?: number;
  meltingPoint?: number;
  pH?: number;
  reactsWith: string[];
  category: 'acid' | 'base' | 'salt' | 'organic' | 'metal' | 'indicator' | 'solvent';
  hazards: string[];
  concentration?: string;
}

const chemicalDatabase: Chemical[] = [
  {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    color: '#FFD700',
    state: 'liquid',
    dangerLevel: 'high',
    description: 'Strong acid commonly used in chemical reactions',
    molarMass: 36.46,
    density: 1.18,
    boilingPoint: 85,
    pH: 1,
    reactsWith: ['bases', 'metals', 'carbonates'],
    category: 'acid',
    hazards: ['corrosive', 'toxic'],
    concentration: '1M'
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    color: '#87CEEB',
    state: 'solid',
    dangerLevel: 'high',
    description: 'Strong base, highly caustic',
    molarMass: 39.997,
    density: 2.13,
    meltingPoint: 318,
    pH: 14,
    reactsWith: ['acids', 'fats', 'oils'],
    category: 'base',
    hazards: ['corrosive', 'caustic'],
    concentration: '1M'
  },
  {
    id: 'nacl',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    color: '#FFFFFF',
    state: 'solid',
    dangerLevel: 'low',
    description: 'Common table salt, ionic compound',
    molarMass: 58.44,
    density: 2.16,
    meltingPoint: 801,
    pH: 7,
    reactsWith: [],
    category: 'salt',
    hazards: [],
    concentration: 'saturated'
  },
  {
    id: 'cuso4',
    name: 'Copper Sulfate',
    formula: 'CuSO₄·5H₂O',
    color: '#4169E1',
    state: 'solid',
    dangerLevel: 'medium',
    description: 'Blue crystalline solid, commonly used in electroplating',
    molarMass: 249.68,
    density: 2.29,
    pH: 4,
    reactsWith: ['metals', 'bases'],
    category: 'salt',
    hazards: ['irritant'],
    concentration: '0.5M'
  },
  {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    color: '#FFFF99',
    state: 'liquid',
    dangerLevel: 'extreme',
    description: 'Highly corrosive strong acid',
    molarMass: 98.08,
    density: 1.84,
    boilingPoint: 337,
    pH: 0,
    reactsWith: ['bases', 'metals', 'water'],
    category: 'acid',
    hazards: ['extremely corrosive', 'dehydrating agent'],
    concentration: '0.1M'
  },
  {
    id: 'fe2o3',
    name: 'Iron Oxide',
    formula: 'Fe₂O₃',
    color: '#CD853F',
    state: 'solid',
    dangerLevel: 'low',
    description: 'Rust-colored powder, common iron compound',
    molarMass: 159.69,
    density: 5.24,
    meltingPoint: 1565,
    pH: 7,
    reactsWith: ['acids'],
    category: 'metal',
    hazards: [],
    concentration: 'pure'
  },
  {
    id: 'mg',
    name: 'Magnesium',
    formula: 'Mg',
    color: '#C0C0C0',
    state: 'solid',
    dangerLevel: 'medium',
    description: 'Reactive metal that burns with bright white flame',
    molarMass: 24.31,
    density: 1.74,
    meltingPoint: 650,
    reactsWith: ['acids', 'oxygen', 'water'],
    category: 'metal',
    hazards: ['flammable', 'burns intensely'],
    concentration: 'pure'
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    formula: 'C₂₀H₁₄O₄',
    color: '#FFB6C1',
    state: 'liquid',
    dangerLevel: 'low',
    description: 'pH indicator, colorless in acid, pink in base',
    molarMass: 318.32,
    pH: 8.2,
    reactsWith: [],
    category: 'indicator',
    hazards: [],
    concentration: '0.1%'
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    color: '#F0F8FF',
    state: 'liquid',
    dangerLevel: 'medium',
    description: 'Common alcohol, good solvent',
    molarMass: 46.07,
    density: 0.79,
    boilingPoint: 78.4,
    reactsWith: ['acids', 'oxidizing agents'],
    category: 'organic',
    hazards: ['flammable', 'volatile'],
    concentration: '95%'
  },
  {
    id: 'agno3',
    name: 'Silver Nitrate',
    formula: 'AgNO₃',
    color: '#E6E6FA',
    state: 'solid',
    dangerLevel: 'high',
    description: 'Silver salt used for precipitation reactions',
    molarMass: 169.87,
    density: 4.35,
    meltingPoint: 212,
    reactsWith: ['halides', 'organic compounds'],
    category: 'salt',
    hazards: ['oxidizing', 'staining'],
    concentration: '0.1M'
  }
];

interface EnhancedChemicalLibraryProps {
  onChemicalSelect: (chemical: Chemical) => void;
  selectedEquipment: string | null;
}

export const EnhancedChemicalLibrary: React.FC<EnhancedChemicalLibraryProps> = ({ 
  onChemicalSelect, 
  selectedEquipment 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);

  const categories = ['all', 'acid', 'base', 'salt', 'organic', 'metal', 'indicator', 'solvent'];

  const filteredChemicals = chemicalDatabase.filter(chemical => {
    const matchesSearch = chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chemical.formula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || chemical.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDangerIcon = (level: string) => {
    switch (level) {
      case 'extreme': return <Skull className="h-3 w-3 text-red-600" />;
      case 'high': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default: return <Info className="h-3 w-3 text-green-500" />;
    }
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'extreme': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const handleChemicalClick = (chemical: Chemical) => {
    setSelectedChemical(chemical);
  };

  const handleAddChemical = () => {
    if (selectedChemical && selectedEquipment) {
      onChemicalSelect(selectedChemical);
      setSelectedChemical(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Enhanced Chemical Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chemicals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Chemical List */}
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {filteredChemicals.map(chemical => (
                <div
                  key={chemical.id}
                  className={`p-3 rounded border cursor-pointer transition-all hover:shadow-md ${
                    selectedChemical?.id === chemical.id ? 'ring-2 ring-primary bg-muted/50' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleChemicalClick(chemical)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: chemical.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{chemical.name}</p>
                        <p className="text-xs text-muted-foreground">{chemical.formula}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getDangerIcon(chemical.dangerLevel)}
                      <Badge variant="outline" className="text-xs capitalize">
                        {chemical.state}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{chemical.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    <Badge className={`${getDangerColor(chemical.dangerLevel)} text-white text-xs`}>
                      {chemical.dangerLevel}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {chemical.category}
                    </Badge>
                    {chemical.concentration && (
                      <Badge variant="outline" className="text-xs">
                        {chemical.concentration}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Selected Chemical Details */}
          {selectedChemical && (
            <Card className="border-primary/50 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedChemical.color }}
                  />
                  {selectedChemical.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Formula: {selectedChemical.formula}</div>
                  <div>MW: {selectedChemical.molarMass} g/mol</div>
                  {selectedChemical.density && <div>Density: {selectedChemical.density} g/cm³</div>}
                  {selectedChemical.pH && <div>pH: {selectedChemical.pH}</div>}
                </div>
                {selectedChemical.hazards.length > 0 && (
                  <div className="text-xs">
                    <span className="font-medium text-red-600">Hazards: </span>
                    {selectedChemical.hazards.join(', ')}
                  </div>
                )}
                <Button
                  onClick={handleAddChemical}
                  disabled={!selectedEquipment}
                  className="w-full text-xs"
                  size="sm"
                >
                  <Droplets className="h-3 w-3 mr-1" />
                  Add to {selectedEquipment || 'Select Equipment'}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
