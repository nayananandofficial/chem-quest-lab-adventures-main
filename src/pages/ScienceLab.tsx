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
import { Beaker, FlaskConical, Award, Zap, Star, Settings, ChevronDown, Play, RotateCcw, Save, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
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

      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/add-experiment`, {experimentData:experimentData}
      );

      if (response.status !== 200) {
        toast({
          title: "Save Failed",
          description: response.data.message || "Failed to save experiment.",
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
    <div className="h-screen flex flex-col bg-background">
      <DragDropProvider>
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Beaker className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-base font-bold">Virtual Chemistry Lab</h1>
                <p className="text-xs text-muted-foreground">Professional Workspace</p>
              </div>
            </div>

            {/* Lab Control Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 px-3 py-1.5">
                  <Settings className="w-4 h-4" />
                  Lab Control
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={startExperiment}>
                  <Play className="w-4 h-4 mr-2" /> Start
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetLab}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={saveExperiment}>
                  <Save className="w-4 h-4 mr-2" /> Save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 px-3 py-1.5">
                  <Layers className="w-4 h-4" />
                  Tools
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Results</DropdownMenuItem>
                <DropdownMenuItem>Education</DropdownMenuItem>
                <DropdownMenuItem>Equipment</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <UserMenu />
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Left Panel collapsed / empty */}
          <div className="w-8 flex-shrink-0" />

          {/* 3D Workspace */}
          <div className="flex-1 relative min-w-0">
            <Canvas camera={{ position: [0, 8, 22], fov: 25 }} shadows className="w-full h-full">
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} castShadow />
              <OrbitControls enableZoom enableRotate />
              <Environment preset="studio" />
              <EnhancedLabTable onEquipmentPlace={handleEquipmentPlace} placedEquipment={placedEquipment} />
              {placedEquipment.map((equipment) => (
              <EnhancedLabEquipment
                key={equipment.id}
                selectedEquipment={selectedEquipment}
                setSelectedEquipment={setSelectedEquipment}
                reactions={reactions}          // ✅ Add this
                setReactions={setReactions}    // ✅ Add this
                position={equipment.position}
                equipmentType={equipment.type}
                equipmentId={equipment.id}
                equipmentContents={equipment.contents}
              />
            ))}

              <Grid args={[30, 30]} position={[0, -0.5, 0]} cellSize={1} cellThickness={0.5} cellColor="#6B7280" sectionSize={5} sectionThickness={1} sectionColor="#374151" fadeDistance={25} fadeStrength={1} />
            </Canvas>
          </div>

          {/* Right Panel - Tabs */}
          <div className="w-96 bg-card border-l border-border flex flex-col h-full">
            <Tabs defaultValue="chemicals" className=" flex flex-col h-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
              </TabsList>

              <TabsContent value="chemicals" className="p-4 flex-1 overflow-y-auto">
                <EnhancedChemicalLibrary
                  onChemicalSelect={handleChemicalSelect}
                  selectedEquipment={selectedEquipment}
                />
              </TabsContent>

              <TabsContent value="equipment" className="p-4 flex-1 overflow-y-auto">
                <EquipmentRack onEquipmentSelect={() => {}} position={[0, 0, 0]} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DragDropProvider>
    </div>
  );
};

export default ScienceLab;
