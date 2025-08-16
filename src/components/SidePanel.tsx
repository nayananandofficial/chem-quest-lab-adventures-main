
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Beaker, FlaskConical, Flame, Thermometer, Droplets, Zap } from 'lucide-react';

interface SidePanelProps {
  selectedEquipment: string | null;
  reactions: any[];
}

const chemicals = [
  { name: 'Sodium Chloride', formula: 'NaCl', color: '#FFFFFF', danger: 'low' },
  { name: 'Hydrochloric Acid', formula: 'HCl', color: '#FFD700', danger: 'high' },
  { name: 'Sodium Hydroxide', formula: 'NaOH', color: '#87CEEB', danger: 'medium' },
  { name: 'Copper Sulfate', formula: 'CuSO₄', color: '#4169E1', danger: 'medium' },
  { name: 'Iron Oxide', formula: 'Fe₂O₃', color: '#CD853F', danger: 'low' },
  { name: 'Magnesium', formula: 'Mg', color: '#C0C0C0', danger: 'medium' },
];

export const SidePanel: React.FC<SidePanelProps> = ({ selectedEquipment, reactions }) => {
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(20);
  const [volume, setVolume] = useState(100);

  const getDangerColor = (danger: string) => {
    switch (danger) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Science Lab Panel
        </h2>
      </div>

      <Tabs defaultValue="chemicals" className="h-full">
        <TabsList className="grid w-full grid-cols-3 m-4">
          <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="reactions">Reactions</TabsTrigger>
        </TabsList>

        <TabsContent value="chemicals" className="px-4 pb-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Available Chemicals</h3>
              {chemicals.map((chemical) => (
                <Card 
                  key={chemical.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedChemical === chemical.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedChemical(chemical.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
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
                  </CardContent>
                </Card>
              ))}
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
                    <Button className="w-full" size="sm">
                      <Droplets className="h-4 w-4 mr-2" />
                      Add Chemical
                    </Button>
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
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reactions" className="px-4 pb-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Recent Reactions</h3>
              
              {reactions.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No reactions yet</p>
                    <p className="text-xs mt-1">Start mixing chemicals to see reactions</p>
                  </CardContent>
                </Card>
              ) : (
                reactions.map((reaction, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-sm">Reaction {index + 1}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{reaction.description}</p>
                      <div className="mt-2 flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {reaction.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {reaction.energy}
                        </Badge>
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
