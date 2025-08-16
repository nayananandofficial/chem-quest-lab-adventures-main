
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { EnhancedSidePanel } from '@/components/EnhancedSidePanel';
import { EnhancedLabEquipment } from '@/components/EnhancedLabEquipment';
import { EquipmentRack } from '@/components/EquipmentRack';
import { EnhancedLabTable } from '@/components/EnhancedLabTable';
import { EnhancedChemicalLibrary } from '@/components/EnhancedChemicalLibrary';
import { DragDropProvider } from '@/components/DragDropProvider';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Beaker, FlaskConical, Award, Zap, Star } from 'lucide-react';

interface PlacedEquipment {
  id: string;
  position: [number, number, number];
  type: string;
  contents: string[];
}

const ScienceLab = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetLab = () => {
    setReactions([]);
    setSelectedEquipment(null);
    setPlacedEquipment([]);
    toast({
      title: "Lab Reset",
      description: "All equipment and reactions have been cleared.",
    });
  };

  const startExperiment = () => {
    console.log('Starting new experiment');
    toast({
      title: "Experiment Started",
      description: "Welcome to your enhanced virtual chemistry lab! Use the equipment rack to add tools.",
    });
  };

  const saveExperiment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your experiments.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log('Saving experiment for user:', user.id);
      console.log('Reactions:', reactions);
      console.log('Selected equipment:', selectedEquipment);

      const experimentData = {
        user_id: user.id,
        experiment_name: `Lab Session ${new Date().toLocaleDateString()}`,
        chemicals_used: reactions.map(r => r.type || 'unknown'),
        results: { 
          reactions: reactions.length, 
          equipment_used: selectedEquipment,
          timestamp: new Date().toISOString()
        },
        score: reactions.length * 10,
      };

      console.log('Inserting experiment data:', experimentData);

      const { data, error } = await supabase
        .from('user_experiments')
        .insert(experimentData)
        .select();

      if (error) {
        console.error('Error saving experiment:', error);
        toast({
          title: "Save Failed",
          description: `Could not save your experiment: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Experiment saved successfully:', data);
        toast({
          title: "Experiment Saved!",
          description: "Your lab session has been recorded successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error saving experiment:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    }
  };

  const handleEquipmentPlace = (equipmentId: string, position: [number, number, number]) => {
    const newEquipment: PlacedEquipment = {
      id: `${equipmentId}-${Date.now()}`,
      position,
      type: equipmentId,
      contents: []
    };
    setPlacedEquipment(prev => [...prev, newEquipment]);
    toast({
      title: "Equipment Placed",
      description: `${equipmentId} has been placed on the workbench.`,
    });
  };

  const handleEquipmentSelect = (equipment: any) => {
    // This will be called from the equipment rack
    console.log('Equipment selected for placement:', equipment);
  };

  const handleChemicalAdd = (equipmentId: string, chemicalName: string) => {
    setPlacedEquipment(prev => prev.map(equipment => {
      if (equipment.id === equipmentId) {
        const updatedContents = [...equipment.contents, chemicalName];
        console.log(`Added ${chemicalName} to ${equipmentId}. Contents:`, updatedContents);
        
        // Check for reactions
        if (updatedContents.length >= 2) {
          const hasAcid = updatedContents.some(c => 
            c.includes('Hydrochloric Acid') || 
            c.includes('Sulfuric Acid')
          );
          const hasBase = updatedContents.some(c => 
            c.includes('Sodium Hydroxide')
          );
          
          if (hasAcid && hasBase) {
            const newReaction = {
              type: 'acid-base',
              description: 'Acid-Base neutralization reaction occurred!',
              energy: 'exothermic',
              points: 50,
              timestamp: new Date().toISOString()
            };
            setReactions(prev => [...prev, newReaction]);
            toast({
              title: "Chemical Reaction!",
              description: "Acid-Base neutralization detected! +50 points",
            });
          }
        }
        
        return {
          ...equipment,
          contents: updatedContents
        };
      }
      return equipment;
    }));

    toast({
      title: "Chemical Added",
      description: `${chemicalName} added to equipment successfully.`,
    });
  };

  const handleChemicalSelect = (chemical: any) => {
    if (selectedEquipment) {
      // Find the selected equipment and add chemical to it
      const equipment = placedEquipment.find(eq => eq.id === selectedEquipment);
      if (equipment) {
        handleChemicalAdd(selectedEquipment, chemical.name);
      } else {
        toast({
          title: "Equipment Not Found",
          description: "Selected equipment not found. Please select equipment first.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Equipment Selected",
        description: "Please select equipment first before adding chemicals.",
        variant: "destructive",
      });
    }
  };

  const getEquipmentContents = (equipmentId: string): string[] => {
    const equipment = placedEquipment.find(eq => eq.id === equipmentId);
    return equipment?.contents || [];
  };

  return (
    <div className="h-screen flex bg-background">
      <DragDropProvider>
        {/* Left Panel - Equipment Rack with Full Height */}
        <div className="w-96 h-full flex flex-col">
          {/* Enhanced Lab Controls - Fixed at top */}
          <div className="bg-card/95 backdrop-blur-sm p-4 border-b shadow-sm flex-shrink-0">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Enhanced Lab Controls
            </h3>
            <div className="space-y-2">
              <button 
                className="w-full px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
                onClick={resetLab}
              >
                🔄 Reset Lab
              </button>
              <button 
                className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors text-sm"
                onClick={startExperiment}
              >
                🧪 Start Experiment
              </button>
              <Button 
                className="w-full text-sm"
                variant="outline"
                onClick={saveExperiment}
                disabled={!user}
              >
                💾 Save Progress
              </Button>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Equipment Placed: {placedEquipment.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedEquipment || 'None'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Reactions: {reactions.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  User: {user?.email?.split('@')[0] || 'Guest'}
                </p>
              </div>
            </div>
          </div>

          {/* Equipment Rack - Takes remaining height */}
          <div className="flex-1 min-h-0">
            <EquipmentRack 
              onEquipmentSelect={handleEquipmentSelect}
              position={[0, 0, 0]}
            />
          </div>
        </div>

        {/* Main 3D Scene */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [0, 8, 12], fov: 60 }}
            shadows
            className="w-full h-full"
          >
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            {/* Additional lighting for better visibility */}
            <pointLight position={[-5, 5, 5]} intensity={0.6} color="#ffffff" />
            <pointLight position={[5, 5, -5]} intensity={0.6} color="#ffffff" />
            <spotLight 
              position={[0, 10, 0]} 
              intensity={0.8} 
              angle={Math.PI / 4}
              penumbra={0.5}
              castShadow
            />
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxDistance={25}
              minDistance={5}
              maxPolarAngle={Math.PI / 2.2}
            />
            
            <Environment preset="studio" />
            
            {/* Enhanced Lab Table with Grid */}
            <EnhancedLabTable 
              onEquipmentPlace={handleEquipmentPlace}
              placedEquipment={placedEquipment}
            />
            
            {/* Placed Equipment */}
            {placedEquipment.map((equipment) => (
              <EnhancedLabEquipment
                key={equipment.id}
                selectedEquipment={selectedEquipment}
                setSelectedEquipment={setSelectedEquipment}
                reactions={reactions}
                setReactions={setReactions}
                position={equipment.position}
                equipmentType={equipment.type}
                equipmentId={equipment.id}
                onChemicalAdd={handleChemicalAdd}
                equipmentContents={getEquipmentContents(equipment.id)}
              />
            ))}
            
            {/* Floor Grid for reference */}
            <Grid
              args={[30, 30]}
              position={[0, -0.5, 0]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6B7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#374151"
              fadeDistance={25}
              fadeStrength={1}
            />
          </Canvas>
          
          {/* User Menu in Top Right */}
          <div className="absolute top-4 right-4">
            <UserMenu />
          </div>

          {/* Instructions - positioned at bottom */}
          <div className="absolute bottom-4 left-4 space-y-2">
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg max-w-xs">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                🎯 How to Add Chemicals
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                1. Place equipment from the rack<br/>
                2. Click to select equipment<br/>
                3. Choose chemical from library<br/>
                4. Click "Add to Equipment"
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg max-w-xs">
              <p className="text-xs text-green-600 dark:text-green-400">
                ✨ Chemical Reactions: Mix acids and bases to see reactions!
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg max-w-xs">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ Virtual Lab Safety: Always wear proper PPE in real laboratories
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Side Panel with New Chemical Library */}
        <div className="w-96 bg-card border-l border-border h-full overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Enhanced Science Lab
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Advanced Virtual Laboratory</span>
            </div>
          </div>

          <Tabs defaultValue="chemicals" className="h-full">
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="chemicals" className="px-4 pb-4">
              <EnhancedChemicalLibrary 
                onChemicalSelect={handleChemicalSelect}
                selectedEquipment={selectedEquipment}
              />
            </TabsContent>

            <TabsContent value="equipment" className="px-4 pb-4">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">Placed Equipment</h3>
                  
                  {placedEquipment.length === 0 ? (
                    <Card>
                      <CardContent className="p-4 text-center text-muted-foreground">
                        <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No equipment placed yet</p>
                        <p className="text-xs mt-1">Use the equipment rack to add tools</p>
                      </CardContent>
                    </Card>
                  ) : (
                    placedEquipment.map((equipment) => (
                      <Card key={equipment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{equipment.type}</p>
                              <p className="text-xs text-muted-foreground">
                                Position: ({equipment.position[0].toFixed(1)}, {equipment.position[2].toFixed(1)})
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedEquipment(equipment.id)}
                              className="text-xs"
                            >
                              {selectedEquipment === equipment.id ? 'Selected' : 'Select'}
                            </Button>
                          </div>
                          {equipment.contents.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs font-medium mb-1">Contents:</p>
                              <div className="flex flex-wrap gap-1">
                                {equipment.contents.map((chemical, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {chemical}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
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
      </DragDropProvider>
    </div>
  );
};

export default ScienceLab;
