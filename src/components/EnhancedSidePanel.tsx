
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Beaker, FlaskConical, Flame, Thermometer, Droplets, Zap, Award, Star } from 'lucide-react';

interface EnhancedSidePanelProps {
  selectedEquipment: string | null;
  reactions: any[];
}

const chemicals = [
  { 
    name: 'Sodium Chloride', 
    formula: 'NaCl', 
    color: '#FFFFFF', 
    danger: 'low',
    description: 'Common table salt, safe to handle',
    molarMass: 58.44
  },
  { 
    name: 'Hydrochloric Acid', 
    formula: 'HCl', 
    color: '#FFD700', 
    danger: 'high',
    description: 'Strong acid, handle with extreme care',
    molarMass: 36.46
  },
  { 
    name: 'Sodium Hydroxide', 
    formula: 'NaOH', 
    color: '#87CEEB', 
    danger: 'medium',
    description: 'Strong base, caustic',
    molarMass: 39.997
  },
  { 
    name: 'Copper Sulfate', 
    formula: 'CuSO₄', 
    color: '#4169E1', 
    danger: 'medium',
    description: 'Blue crystalline solid',
    molarMass: 159.609
  },
  { 
    name: 'Iron Oxide', 
    formula: 'Fe₂O₃', 
    color: '#CD853F', 
    danger: 'low',
    description: 'Rust-colored powder',
    molarMass: 159.687
  },
  { 
    name: 'Magnesium', 
    formula: 'Mg', 
    color: '#C0C0C0', 
    danger: 'medium',
    description: 'Reactive metal, burns brightly',
    molarMass: 24.305
  },
];

const experimentTemplates = [
  {
    name: 'Acid-Base Neutralization',
    chemicals: ['HCl', 'NaOH'],
    procedure: 'Add equal amounts of HCl and NaOH to observe neutralization',
    expectedResult: 'Heat generation and color change',
    difficulty: 'Beginner'
  },
  {
    name: 'Copper Precipitation',
    chemicals: ['CuSO₄', 'NaOH'],
    procedure: 'Add NaOH to CuSO₄ solution to form precipitate',
    expectedResult: 'Blue precipitate formation',
    difficulty: 'Intermediate'
  },
  {
    name: 'Magnesium Combustion',
    chemicals: ['Mg'],
    procedure: 'Heat magnesium strip over burner',
    expectedResult: 'Bright white flame',
    difficulty: 'Advanced'
  }
];

export const EnhancedSidePanel: React.FC<EnhancedSidePanelProps> = ({ selectedEquipment, reactions }) => {
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(20);
  const [volume, setVolume] = useState(100);
  const [experimentProgress, setExperimentProgress] = useState(0);
  const [score, setScore] = useState(150);
  const [level, setLevel] = useState(1);

  const getDangerColor = (danger: string) => {
    switch (danger) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddChemical = () => {
    if (selectedChemical && selectedEquipment) {
      // Call the exposed method from EnhancedLabEquipment
      if ((window as any).addChemicalToSelected) {
        (window as any).addChemicalToSelected(selectedChemical);
        setExperimentProgress(prev => Math.min(prev + 20, 100));
        setScore(prev => prev + 10);
      }
    }
  };

  const selectedChemicalData = chemicals.find(c => c.name === selectedChemical);

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Enhanced Science Lab
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">Level {level} • Score: {score}</span>
        </div>
      </div>

      <Tabs defaultValue="chemicals" className="h-full">
        <TabsList className="grid w-full grid-cols-4 m-4">
          <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="chemicals" className="px-4 pb-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Chemical Library</h3>
              {chemicals.map((chemical) => (
                <Card 
                  key={chemical.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedChemical === chemical.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedChemical(chemical.name)}
                >
                  <CardContent className="p-3">
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
                      <Badge className={`${getDangerColor(chemical.danger)} text-white text-xs`}>
                        {chemical.danger}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{chemical.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">MW: {chemical.molarMass} g/mol</p>
                  </CardContent>
                </Card>
              ))}
              
              {selectedChemicalData && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Selected Chemical</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{selectedChemicalData.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{selectedChemicalData.description}</p>
                    <Button 
                      onClick={handleAddChemical}
                      disabled={!selectedEquipment}
                      className="w-full"
                      size="sm"
                    >
                      <Droplets className="h-4 w-4 mr-2" />
                      Add to {selectedEquipment || 'Select Equipment'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="equipment" className="px-4 pb-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <h3 className="font-semibold mb-3">Equipment Controls</h3>
              
              {selectedEquipment ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Selected: {selectedEquipment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="temperature" className="text-sm">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="volume" className="text-sm">Volume (mL)</Label>
                      <Input
                        id="volume"
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select equipment to control</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Environment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Room Temp:</span>
                    <span className="text-sm font-medium">22°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Humidity:</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pressure:</span>
                    <span className="text-sm font-medium">1 atm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Safety Status:</span>
                    <Badge className="bg-green-500 text-white text-xs">Safe</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="experiments" className="px-4 pb-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Experiment Templates</h3>
              
              <div className="mb-4">
                <Label className="text-sm">Progress</Label>
                <Progress value={experimentProgress} className="mt-2" />
                <span className="text-xs text-muted-foreground">{experimentProgress}% Complete</span>
              </div>

              {experimentTemplates.map((experiment, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{experiment.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {experiment.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{experiment.procedure}</p>
                    <div className="flex gap-1 mb-2">
                      {experiment.chemicals.map((chem, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {chem}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-green-600">{experiment.expectedResult}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="results" className="px-4 pb-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Reaction History</h3>
              
              {reactions.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No reactions recorded yet</p>
                    <p className="text-xs mt-1">Start mixing chemicals to see results</p>
                  </CardContent>
                </Card>
              ) : (
                reactions.map((reaction, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-sm">Reaction {index + 1}</span>
                        <Star className="h-3 w-3 text-yellow-400" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{reaction.description}</p>
                      <div className="flex gap-1 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {reaction.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {reaction.energy}
                        </Badge>
                      </div>
                      <div className="text-xs text-green-600">
                        +{reaction.points || 25} points earned
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
