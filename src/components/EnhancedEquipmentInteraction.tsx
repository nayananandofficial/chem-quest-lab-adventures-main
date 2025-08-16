import React, { useState, useCallback } from 'react';
import { useDragDrop } from './DragDropProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Beaker, 
  FlaskConical, 
  TestTube, 
  Flame, 
  Thermometer, 
  Scale,
  Move,
  RotateCcw,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export interface EquipmentState {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  contents: string[];
  temperature: number;
  isHeated: boolean;
  isSelected: boolean;
  volume: number;
  maxVolume: number;
  pH?: number;
  pressure?: number;
  isVisible: boolean;
}

interface EnhancedEquipmentInteractionProps {
  equipment: EquipmentState[];
  onEquipmentUpdate: (id: string, updates: Partial<EquipmentState>) => void;
  onEquipmentDelete: (id: string) => void;
  onEquipmentDuplicate: (id: string) => void;
  selectedEquipmentId: string | null;
  onEquipmentSelect: (id: string | null) => void;
}

export const EnhancedEquipmentInteraction: React.FC<EnhancedEquipmentInteractionProps> = ({
  equipment,
  onEquipmentUpdate,
  onEquipmentDelete,
  onEquipmentDuplicate,
  selectedEquipmentId,
  onEquipmentSelect
}) => {
  const [dragMode, setDragMode] = useState<'move' | 'rotate' | 'stack'>('move');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const { isDragging, setIsDragging } = useDragDrop();
  const { toast } = useToast();

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'beaker': return Beaker;
      case 'flask': return FlaskConical;
      case 'test-tube': return TestTube;
      case 'burner': return Flame;
      case 'thermometer': return Thermometer;
      case 'scale': return Scale;
      default: return Beaker;
    }
  };

  const handleEquipmentAction = useCallback((id: string, action: string) => {
    const equipmentItem = equipment.find(eq => eq.id === id);
    if (!equipmentItem) return;

    switch (action) {
      case 'heat':
        onEquipmentUpdate(id, { 
          isHeated: !equipmentItem.isHeated,
          temperature: equipmentItem.isHeated ? 20 : Math.min(equipmentItem.temperature + 30, 100)
        });
        toast({
          title: equipmentItem.isHeated ? "Heating Stopped" : "Heating Started",
          description: `${equipmentItem.type} is now ${equipmentItem.isHeated ? 'cooling down' : 'being heated'}`
        });
        break;
        
      case 'cool':
        onEquipmentUpdate(id, { 
          temperature: Math.max(equipmentItem.temperature - 20, 20),
          isHeated: false
        });
        toast({
          title: "Cooling Applied",
          description: `${equipmentItem.type} temperature reduced`
        });
        break;
        
      case 'empty':
        onEquipmentUpdate(id, { 
          contents: [],
          volume: 0,
          pH: undefined
        });
        toast({
          title: "Equipment Emptied",
          description: `All contents removed from ${equipmentItem.type}`
        });
        break;
        
      case 'toggle_visibility':
        onEquipmentUpdate(id, { isVisible: !equipmentItem.isVisible });
        break;
        
      case 'reset_position':
        onEquipmentUpdate(id, { 
          position: [0, 0, 0],
          rotation: [0, 0, 0]
        });
        toast({
          title: "Position Reset",
          description: `${equipmentItem.type} moved to origin`
        });
        break;
    }
  }, [equipment, onEquipmentUpdate, toast]);

  const handleStackEquipment = useCallback((baseId: string, topId: string) => {
    const baseEquipment = equipment.find(eq => eq.id === baseId);
    const topEquipment = equipment.find(eq => eq.id === topId);
    
    if (!baseEquipment || !topEquipment) return;

    // Check if stacking is valid
    const validStacks = {
      'beaker': ['thermometer', 'test-tube'],
      'flask': ['thermometer'],
      'burner': ['beaker', 'flask']
    };

    if (!validStacks[baseEquipment.type as keyof typeof validStacks]?.includes(topEquipment.type)) {
      toast({
        title: "Invalid Stack",
        description: `Cannot stack ${topEquipment.type} on ${baseEquipment.type}`,
        variant: "destructive"
      });
      return;
    }

    // Calculate stacked position
    const stackHeight = baseEquipment.type === 'burner' ? 0.3 : 0.2;
    const newPosition: [number, number, number] = [
      baseEquipment.position[0],
      baseEquipment.position[1] + stackHeight,
      baseEquipment.position[2]
    ];

    onEquipmentUpdate(topId, { position: newPosition });
    
    toast({
      title: "Equipment Stacked",
      description: `${topEquipment.type} stacked on ${baseEquipment.type}`
    });
  }, [equipment, onEquipmentUpdate, toast]);

  const getEquipmentState = (equipmentItem: EquipmentState) => {
    const states = [];
    
    if (equipmentItem.isHeated) states.push({ label: 'Heated', color: 'bg-red-500' });
    if (equipmentItem.contents.length > 0) states.push({ label: 'Has Contents', color: 'bg-blue-500' });
    if (equipmentItem.temperature > 40) states.push({ label: 'Hot', color: 'bg-orange-500' });
    if (equipmentItem.volume > equipmentItem.maxVolume * 0.8) states.push({ label: 'Nearly Full', color: 'bg-yellow-500' });
    if (!equipmentItem.isVisible) states.push({ label: 'Hidden', color: 'bg-gray-500' });
    
    return states;
  };

  const selectedEquipment = equipment.find(eq => eq.id === selectedEquipmentId);

  return (
    <div className="space-y-4">
      {/* Equipment Management Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Equipment Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interaction Mode Toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={dragMode === 'move' ? 'default' : 'outline'}
              onClick={() => setDragMode('move')}
            >
              <Move className="h-4 w-4 mr-1" />
              Move
            </Button>
            <Button
              size="sm"
              variant={dragMode === 'rotate' ? 'default' : 'outline'}
              onClick={() => setDragMode('rotate')}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Rotate
            </Button>
            <Button
              size="sm"
              variant={dragMode === 'stack' ? 'default' : 'outline'}
              onClick={() => setDragMode('stack')}
            >
              <Copy className="h-4 w-4 mr-1" />
              Stack
            </Button>
          </div>

          {/* Equipment List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {equipment.map((equipmentItem) => {
              const Icon = getEquipmentIcon(equipmentItem.type);
              const states = getEquipmentState(equipmentItem);
              const isSelected = selectedEquipmentId === equipmentItem.id;

              return (
                <div
                  key={equipmentItem.id}
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                  }`}
                  onClick={() => onEquipmentSelect(isSelected ? null : equipmentItem.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {equipmentItem.type} #{equipmentItem.id.slice(-4)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipmentAction(equipmentItem.id, 'toggle_visibility');
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {equipmentItem.isVisible ? 
                          <Eye className="h-3 w-3" /> : 
                          <EyeOff className="h-3 w-3" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEquipmentDuplicate(equipmentItem.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEquipmentDelete(equipmentItem.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Equipment States */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {states.map((state, index) => (
                      <Badge key={index} className={`${state.color} text-white text-xs`}>
                        {state.label}
                      </Badge>
                    ))}
                  </div>

                  {/* Equipment Properties */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Temp: {equipmentItem.temperature}°C</div>
                    <div>Volume: {equipmentItem.volume}mL</div>
                    <div>Contents: {equipmentItem.contents.length}</div>
                    {equipmentItem.pH && <div>pH: {equipmentItem.pH.toFixed(1)}</div>}
                  </div>

                  {/* Volume Progress */}
                  {equipmentItem.maxVolume > 0 && (
                    <div className="mt-2">
                      <Progress 
                        value={(equipmentItem.volume / equipmentItem.maxVolume) * 100} 
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Equipment Controls */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(getEquipmentIcon(selectedEquipment.type), { className: "h-5 w-5" })}
              {selectedEquipment.type} Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => handleEquipmentAction(selectedEquipment.id, 'heat')}
                variant={selectedEquipment.isHeated ? 'destructive' : 'default'}
              >
                <Flame className="h-4 w-4 mr-1" />
                {selectedEquipment.isHeated ? 'Stop Heat' : 'Heat'}
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleEquipmentAction(selectedEquipment.id, 'cool')}
                variant="secondary"
                disabled={selectedEquipment.temperature <= 20}
              >
                <Thermometer className="h-4 w-4 mr-1" />
                Cool
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleEquipmentAction(selectedEquipment.id, 'empty')}
                variant="outline"
                disabled={selectedEquipment.contents.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Empty
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleEquipmentAction(selectedEquipment.id, 'reset_position')}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Position Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {['X', 'Y', 'Z'].map((axis, index) => (
                  <div key={axis}>
                    <label className="text-xs text-muted-foreground">{axis}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedEquipment.position[index].toFixed(1)}
                      onChange={(e) => {
                        const newPosition = [...selectedEquipment.position] as [number, number, number];
                        newPosition[index] = parseFloat(e.target.value) || 0;
                        onEquipmentUpdate(selectedEquipment.id, { position: newPosition });
                      }}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment-specific controls */}
            {selectedEquipment.type === 'burner' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Burner Settings</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selectedEquipment.isHeated ? 'destructive' : 'default'}
                    onClick={() => handleEquipmentAction(selectedEquipment.id, 'heat')}
                  >
                    {selectedEquipment.isHeated ? 'Turn Off' : 'Ignite'}
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {selectedEquipment.isHeated ? 'Flame is lit' : 'Ready to ignite'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                equipment.forEach(eq => handleEquipmentAction(eq.id, 'cool'));
                toast({
                  title: "All Equipment Cooled",
                  description: "All equipment temperatures reset to room temperature"
                });
              }}
            >
              Cool All
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                equipment.forEach(eq => handleEquipmentAction(eq.id, 'empty'));
                toast({
                  title: "All Equipment Emptied",
                  description: "All contents removed from equipment"
                });
              }}
            >
              Empty All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};