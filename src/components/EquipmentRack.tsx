
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Beaker, FlaskConical, Flame, Pipette, Search } from 'lucide-react';
import { useDragDrop } from './DragDropProvider';

interface EquipmentItem {
  id: string;
  name: string;
  type: 'beaker' | 'flask' | 'test-tube' | 'burner' | 'burette';
  description: string;
  icon: React.ComponentType<any>;
  available: number;
  inUse: number;
  level: 1 | 2; // Which level of the rack
}

interface EquipmentRackProps {
  onEquipmentSelect: (equipment: EquipmentItem) => void;
  position: [number, number, number]; // Kept for compatibility but not used in UI mode
}

const equipmentLibrary: EquipmentItem[] = [
  {
    id: 'beaker-250ml',
    name: 'Beaker 250ml',
    type: 'beaker',
    description: 'Standard glass beaker for mixing and heating',
    icon: Beaker,
    available: 5,
    inUse: 0,
    level: 1
  },
  {
    id: 'beaker-500ml',
    name: 'Beaker 500ml', 
    type: 'beaker',
    description: 'Large glass beaker for bulk reactions',
    icon: Beaker,
    available: 3,
    inUse: 0,
    level: 1
  },
  {
    id: 'erlenmeyer-flask',
    name: 'Erlenmeyer Flask',
    type: 'flask',
    description: 'Conical flask for swirling and mixing',
    icon: FlaskConical,
    available: 4,
    inUse: 0,
    level: 1
  },
  // test-tube removed from sidebar by request
  {
    id: 'bunsen-burner',
    name: 'Bunsen Burner',
    type: 'burner',
    description: 'Gas burner for heating equipment',
    icon: Flame,
    available: 2,
    inUse: 0,
    level: 2
  },
  {
    id: 'burette',
    name: 'Burette',
    type: 'burette',
    description: 'Precision instrument for titration',
    icon: Pipette,
    available: 1,
    inUse: 0,
    level: 2
  }
];

export const EquipmentRack: React.FC<EquipmentRackProps> = ({ onEquipmentSelect }) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(equipmentLibrary);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const { setDraggedItem, setIsDragging } = useDragDrop();

  const levels = ['all', '1', '2'];

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || item.level.toString() === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleEquipmentDragStart = (item: EquipmentItem) => {
    if (item.available > item.inUse) {
      setDraggedItem(item);
      setIsDragging(true);
      console.log('Starting drag for:', item.name);
    }
  };

  const handleEquipmentClick = (item: EquipmentItem) => {
    if (item.available > item.inUse) {
      onEquipmentSelect(item);
      setEquipment(prev => prev.map(eq => 
        eq.id === item.id 
          ? { ...eq, inUse: eq.inUse + 1 }
          : eq
      ));
    }
  };

  const level1Equipment = filteredEquipment.filter(item => item.level === 1);
  const level2Equipment = filteredEquipment.filter(item => item.level === 2);

  return (
    <Card className="w-96 h-full bg-card/95 backdrop-blur-sm border shadow-lg flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          3D Equipment Rack
        </CardTitle>
        <p className="text-xs text-muted-foreground">Search and drag equipment to workspace</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Search and Filter - Fixed at top */}
        <div className="space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {levels.map(level => (
              <Button
                key={level}
                size="sm"
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => setSelectedLevel(level)}
                className="text-xs capitalize"
              >
                {level === 'all' ? 'All Levels' : `Level ${level}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Equipment List with Full Height Scroll */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-3">
              {/* Level 1 Equipment */}
              {(selectedLevel === 'all' || selectedLevel === '1') && level1Equipment.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-1">
                    Level 1 - Main Equipment
                    <Badge variant="outline" className="text-xs">Ground Floor</Badge>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {level1Equipment.map((item) => {
                      const Icon = item.icon;
                      const isAvailable = item.available > item.inUse;
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded border transition-all duration-200 ${
                            isAvailable 
                              ? 'hover:bg-muted/50 hover:shadow-md cursor-pointer hover:border-primary/50' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          draggable={isAvailable}
                          onDragStart={() => handleEquipmentDragStart(item)}
                          onClick={() => handleEquipmentClick(item)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isAvailable ? "default" : "secondary"} className="text-xs">
                              {item.available - item.inUse}/{item.available}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!isAvailable}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipmentClick(item);
                              }}
                              className="text-xs px-2 py-1"
                            >
                              {isAvailable ? 'Drag' : 'Empty'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Level 2 Equipment */}
              {(selectedLevel === 'all' || selectedLevel === '2') && level2Equipment.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-1">
                    Level 2 - Precision Tools
                    <Badge variant="outline" className="text-xs">Upper Shelf</Badge>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {level2Equipment.map((item) => {
                      const Icon = item.icon;
                      const isAvailable = item.available > item.inUse;
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded border transition-all duration-200 ${
                            isAvailable 
                              ? 'hover:bg-muted/50 hover:shadow-md cursor-pointer hover:border-primary/50' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          draggable={isAvailable}
                          onDragStart={() => handleEquipmentDragStart(item)}
                          onClick={() => handleEquipmentClick(item)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-full bg-secondary/10">
                              <Icon className="h-4 w-4 text-secondary-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isAvailable ? "default" : "secondary"} className="text-xs">
                              {item.available - item.inUse}/{item.available}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!isAvailable}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipmentClick(item);
                              }}
                              className="text-xs px-2 py-1"
                            >
                              {isAvailable ? 'Drag' : 'Empty'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {filteredEquipment.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Beaker className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No equipment found</p>
                  <p className="text-xs">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Usage Stats - Fixed at bottom */}
        <div className="pt-2 border-t border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Total Equipment: {equipment.length} | 
            In Use: {equipment.reduce((sum, item) => sum + item.inUse, 0)} | 
            Available: {equipment.reduce((sum, item) => sum + (item.available - item.inUse), 0)} |
            Showing: {filteredEquipment.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
