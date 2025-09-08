"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import { EnhancedSidePanel } from "@/components/EnhancedSidePanel";
import { EnhancedLabEquipment } from "@/components/EnhancedLabEquipment";
import { EquipmentRack } from "@/components/EquipmentRack";
import { EnhancedLabTable } from "@/components/EnhancedLabTable";
import { EnhancedChemicalLibrary } from "@/components/EnhancedChemicalLibrary";
import { DragDropProvider } from "@/components/DragDropProvider";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Beaker, FlaskConical, Award, Zap, Star } from "lucide-react";

interface PlacedEquipment {
  id: string;
  position: [number, number, number];
  type: string;
  contents: string[];
}

const ScienceLab = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [reactions, setReactions] = useState<any[]>([]);
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

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
    toast({
      title: "Experiment Started",
      description: "Use the equipment rack to add tools.",
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
      const experimentData = {
        user_id: user.id,
        experiment_name: `Lab Session ${new Date().toLocaleDateString()}`,
        chemicals_used: reactions.map((r) => r.type || "unknown"),
        results: {
          reactions: reactions.length,
          equipment_used: selectedEquipment,
          timestamp: new Date().toISOString(),
        },
        score: reactions.length * 10,
      };

      const { data, error } = await supabase
        .from("user_experiments")
        .insert(experimentData)
        .select();

      if (error) {
        toast({
          title: "Save Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Experiment Saved!",
          description: "Your lab session has been recorded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unexpected error while saving.",
        variant: "destructive",
      });
    }
  };

  const handleEquipmentPlace = (
    equipmentId: string,
    position: [number, number, number]
  ) => {
    const newEquipment: PlacedEquipment = {
      id: `${equipmentId}-${Date.now()}`,
      position,
      type: equipmentId,
      contents: [],
    };
    setPlacedEquipment((prev) => [...prev, newEquipment]);
    toast({
      title: "Equipment Placed",
      description: `${equipmentId} has been placed on the workbench.`,
    });
  };

  const handleChemicalAdd = (equipmentId: string, chemicalName: string) => {
    setPlacedEquipment((prev) =>
      prev.map((equipment) =>
        equipment.id === equipmentId
          ? { ...equipment, contents: [...equipment.contents, chemicalName] }
          : equipment
      )
    );
  };

  const handleChemicalSelect = (chemical: any) => {
    if (selectedEquipment) {
      handleChemicalAdd(selectedEquipment, chemical.name);
    } else {
      toast({
        title: "No Equipment Selected",
        description: "Please select equipment first.",
        variant: "destructive",
      });
    }
  };

  const getEquipmentContents = (equipmentId: string): string[] => {
    const equipment = placedEquipment.find((eq) => eq.id === equipmentId);
    return equipment?.contents || [];
  };

  return (
    <div className="h-screen flex bg-background">
      <DragDropProvider>
        {/* Left Panel */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            leftCollapsed ? "w-8" : "w-96"
          } h-full flex flex-col relative`}
        >
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="absolute top-0 -right-0 z-10 bg-card border rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-muted"
          >
            {leftCollapsed ? "➡️" : "⬅️"}
          </button>

          {!leftCollapsed && (
            <>
              <div className="bg-card/95 backdrop-blur-sm p-4 border-b shadow-sm">
                <h3 className="text-lg font-semibold mb-3">
                  Enhanced Lab Controls
                </h3>
                <div className="space-y-2">
                  <Button
                    className="w-full text-sm"
                    variant="outline"
                    onClick={resetLab}
                  >
                    🔄 Reset Lab
                  </Button>
                  <Button
                    className="w-full text-sm"
                    variant="secondary"
                    onClick={startExperiment}
                  >
                    🧪 Start Experiment
                  </Button>
                  <Button
                    className="w-full text-sm"
                    variant="outline"
                    onClick={saveExperiment}
                    disabled={!user}
                  >
                    💾 Save Progress
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <EquipmentRack
                  onEquipmentSelect={() => {}}
                  position={[0, 0, 0]}
                />
              </div>
            </>
          )}
        </div>

        {/* Main 3D Scene */}
        <div className="flex-1 relative min-w-0">
          <Canvas
            camera={{ position: [0, 8, 12], fov: 60 }}
            shadows
            className="w-full h-full"
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} castShadow />
            <OrbitControls enableZoom enableRotate />
            <Environment preset="studio" />
            <EnhancedLabTable
              onEquipmentPlace={handleEquipmentPlace}
              placedEquipment={placedEquipment}
            />
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
          <div className="absolute top-4 right-4">
            <UserMenu />
          </div>
        </div>

        {/* Right Panel */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            rightCollapsed ? "w-8" : "w-96"
          } bg-card border-l border-border h-full relative`}
        >
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="absolute top-0 -left-0 z-10 bg-card border rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-muted"
          >
            {rightCollapsed ? "⬅️" : "➡️"}
          </button>

          {!rightCollapsed && (
            <>
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Enhanced Science Lab
                </h2>
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
                {/* other tabs unchanged */}
              </Tabs>
            </>
          )}
        </div>
      </DragDropProvider>
    </div>
  );
};

export default ScienceLab;
