
import React, { useState ,useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Droplets, AlertTriangle, Info, Flame, Skull } from 'lucide-react';
import axios from 'axios';

interface Chemical {
  id: number;
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

interface EnhancedChemicalLibraryProps {
  onChemicalSelect: (chemical: Chemical) => void;
  selectedEquipment: string | null;
}

export const EnhancedChemicalLibrary: React.FC<EnhancedChemicalLibraryProps> = ({ 
  onChemicalSelect, 
  selectedEquipment 
}) => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
 useEffect(() => {
    const fetchChemicals = async () => {
        try{
          const response =  await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chemicals`);
          if(response.status !== 200){
            throw new Error("Failed to fetch chemicals");
          }
          const data = response.data;
          setChemicals(data)
        }catch(error){
          console.error("Error fetching chemicals:", error)
        }
    }
    fetchChemicals()
  }, [])
  const categories = ['all', 'acid', 'base', 'salt', 'organic', 'metal', 'indicator', 'solvent'];

  const filteredChemicals = chemicals.filter(chemical => {
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
