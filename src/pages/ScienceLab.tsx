"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import { EnhancedLabEquipment } from "@/components/EnhancedLabEquipment";
import { EquipmentRack } from "@/components/EquipmentRack";
import { EnhancedLabTable } from "@/components/EnhancedLabTable";
import { EnhancedChemicalLibrary } from "@/components/EnhancedChemicalLibrary";
import { DragDropProvider } from "@/components/DragDropProvider";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useExperimentProtection } from "@/hooks/useExperimentProtection";
import {
  Beaker,
  Settings,
  ChevronDown,
  Play,
  RotateCcw,
  Save,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import useChemicalReactionEngine from "@/components/ChemicalReactionEngine";
import useExperimentScoring, {
  ExperimentScorePanel,
} from "@/components/ExperimentScoring";
import EducationalTooltips from "@/components/EducationalTooltips";
import SafetyWarnings from "@/components/SafetyWarnings";

interface PlacedEquipment {
  id: string;
  position: [number, number, number];
  type: string;
  contents: string[];
  chemicalObjects: Array<{ name: string; volume: number; color: string }>;
  totalVolume: number;
}

interface ExperimentState {
  status: "idle" | "active" | "paused" | "completed";
  startTime?: Date;
  currentSession?: string;
  autoSaveEnabled: boolean;
}

const STORAGE_KEY = "virtual-lab-state";

const ScienceLab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const reactionEngine = useChemicalReactionEngine();
  const scoring = useExperimentScoring();

  // 🔹 State Management
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [experimentState, setExperimentState] = useState<ExperimentState>({
    status: "idle",
    autoSaveEnabled: true,
  });
  const [isExperimentStarted, setIsExperimentStarted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 🧠 Load saved experiment
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    setPlacedEquipment(parsed.placedEquipment || []);
    setReactions(parsed.reactions || []);
    setIsExperimentStarted(parsed.isExperimentStarted || false);

    const restored = parsed.experimentState || { status: "idle", autoSaveEnabled: true };
    if (restored.startTime) restored.startTime = new Date(restored.startTime);
    setExperimentState(restored);

    // Restore scoring
    if (parsed.score) {
      scoring.award(parsed.score);
    }
    if (parsed.badges) {
      parsed.badges.forEach((b: string) => scoring.awardBadge(b));
    }
  }, []);

  // 💾 Auto persist to localStorage (optimized via useMemo)
  const experimentData = useMemo(
    () => ({
      placedEquipment,
      reactions,
      experimentState,
      isExperimentStarted,
      score: scoring.score,
      badges: scoring.badges,
    }),
    [placedEquipment, reactions, experimentState, isExperimentStarted, scoring.score, scoring.badges]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(experimentData));
  }, [experimentData]);

  // ⚠️ Protection when closing tab
  useExperimentProtection({
    isExperimentActive: isExperimentStarted,
    onBeforeUnload: () => {
      if (placedEquipment.length || reactions.length) saveExperiment(true);
    },
  });

  // 🕒 Auto-save every 60 seconds
  useEffect(() => {
    if (!isExperimentStarted || !experimentState.autoSaveEnabled || !user) return;
    const interval = setInterval(() => saveExperiment(true), 60000);
    return () => clearInterval(interval);
  }, [isExperimentStarted, experimentState.autoSaveEnabled, user, placedEquipment, reactions]);

  // 🔹 Handlers
  const startExperiment = useCallback(() => {
    if (isExperimentStarted) return;
    const sessionId = `exp-${Date.now()}`;
    setExperimentState({
      status: "active",
      startTime: new Date(),
      currentSession: sessionId,
      autoSaveEnabled: true,
    });
    setIsExperimentStarted(true);
    scoring.award(10, "Experiment Started");
    toast({
      title: "Experiment Started! 🧪",
      description: "You can now interact with equipment and chemicals.",
    });
  }, [isExperimentStarted, scoring, toast]);

  const performReset = useCallback(() => {
    setReactions([]);
    setSelectedEquipment(null);
    setPlacedEquipment([]);
    setIsExperimentStarted(false);
    setExperimentState({ status: "idle", autoSaveEnabled: true });
    scoring.reset();
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Lab Reset",
      description: "All equipment cleared. Click Start to begin a new experiment.",
    });
  }, [scoring, toast]);

  const resetLab = useCallback(() => {
    if (experimentState.status === "active") setShowResetConfirm(true);
    else performReset();
  }, [experimentState.status, performReset]);

  const saveExperiment = useCallback(
    async (isAutoSave = false) => {
      if (!user)
        return toast({
          title: "Authentication Required",
          description: "Please sign in to save your experiments.",
          variant: "destructive",
        });

      if (experimentState.status === "idle")
        return toast({
          title: "No Active Experiment",
          description: "Start an experiment first to save progress.",
          variant: "destructive",
        });

    try {
      const experimentData = {
        user_id: user.uid,
        experiment_name: `Lab Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        chemicals_used: placedEquipment.flatMap(eq => eq.contents),
        results: {
          reactions: reactions.length,
          equipment_used: placedEquipment.length,
          chemicals_mixed: placedEquipment.reduce((total, eq) => total + eq.chemicalObjects.length, 0),
          session_duration: experimentState.startTime ? 
            Math.round((Date.now() - experimentState.startTime.getTime()) / 1000) : 0,
          equipment_details: placedEquipment.map(eq => ({
            type: eq.type,
            chemicals: eq.chemicalObjects,
            totalVolume: eq.totalVolume
          })),
          reactions_performed: reactions.map(r => ({
            name: r.name,
            type: r.type,
            timestamp: r.startedAt
          })),
          timestamp: new Date().toISOString(),
        },
        score: scoring.score,
      };

      console.log("Saving experiment data:", experimentData);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/add-experiment`, 
        { experimentData }
      );
      console.log("Save response:", response);
      
      if (response.status === 200) {
        setExperimentState(prev => ({
          ...prev,
          status: 'active'
        }));

        toast({
          title: isAutoSave ? "Auto-saved" : "Experiment Saved!",
          description: `Progress saved with ${scoring.score} points.`,
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save experiment. Please try again.",
        variant: "destructive",
      });
    }
  };

  
  const handleVolumeChange = (equipmentId: string, newTotalVolume: number) => {
    if (!isExperimentStarted) {
      toast({
        title: "Experiment Not Started",
        description: "Click 'Start' in Lab Controls to begin experimenting.",
        variant: "destructive",
      });
      return;
    }

    setPlacedEquipment((prev) =>
      prev.map((equipment) => {
        if (equipment.id === equipmentId) {
          const existing = Array.isArray(equipment.chemicalObjects) ? equipment.chemicalObjects : [];
          if (existing.length > 0) {
            const currentTotal = existing.reduce((s, c) => s + Number(c.volume || 0), 0);
            if (currentTotal <= 0) {
              return {
                ...equipment,
                totalVolume: Number(newTotalVolume || 0),
              };
            }
            const scale = Number(newTotalVolume) / currentTotal;
            const scaled = existing.map((c) => ({ ...c, volume: Number(c.volume || 0) * scale }));
            const recalculated = scaled.reduce((s, c) => s + Number(c.volume || 0), 0);
            return {
              ...equipment,
              chemicalObjects: scaled,
              totalVolume: recalculated,
            };
          }

          return {
            ...equipment,
            totalVolume: Number(newTotalVolume || 0),
          };
        }
        return equipment;
      })
    );

    toast({
      title: "Volume Adjusted",
      description: `Volume set to ${newTotalVolume}ml`,
    });
  };

  const handleEquipmentPlace = (equipmentId: string, position: [number, number, number]) => {
    if (!isExperimentStarted) {
      toast({
        title: "Experiment Not Started", 
        description: "Click 'Start' to place equipment.",
        variant: "destructive",
      });
      return;
    }

    const newEquipment: PlacedEquipment = {
      id: `${equipmentId}-${Date.now()}`,
      position,
      type: equipmentId,
      contents: [],
      chemicalObjects: [],
      totalVolume: 0
    };
    setPlacedEquipment((prev) => [...prev, newEquipment]);
    
    scoring.award(10, `Placed ${equipmentId}`);
    
    toast({
      title: "Equipment Placed",
      description: `${equipmentId} has been placed on the workbench.`,
    });
  };

  const handleChemicalAdd = (equipmentId: string, chemical: any, volume: number) => {
    if (!isExperimentStarted) {
      toast({
        title: "Experiment Not Started",
        description: "Click 'Start' in Lab Controls to begin experimenting.",
        variant: "destructive",
      });
      return;
    }

      const vol = Number(volume || 0);
      setPlacedEquipment((prev) =>
        prev.map((eq) => {
          if (eq.id !== equipmentId) return eq;
          const newChemicals = [
            ...(eq.chemicalObjects || []),
            {
              name: chemical.name,
              volume: vol,
              color: chemical.color || chemical.colorHex || "#87CEEB",
            },
          ];
          const newContents = [...(eq.contents || []), chemical.name];
          const updated = {
            ...eq,
            chemicalObjects: newChemicals,
            contents: newContents,
            totalVolume: newChemicals.reduce((sum, c) => sum + Number(c.volume || 0), 0),
          };

          try {
            const reaction = reactionEngine.perform(newChemicals.map((c) => c.name), 20);
            if (reaction) {
              setReactions((prevR) => [
                ...prevR,
                { ...reaction, id: `${reaction.id}-${Date.now()}`, equipmentId: eq.id },
              ]);
              scoring.award(50, `Reaction: ${reaction.name}`);
              scoring.awardBadge(reaction.type || "reaction");
            }
            scoring.award(15, `Added ${chemical.name}`);
          } catch (e) {
            console.error("Reaction engine error:", e);
          }

          return updated;
        })
      );
      toast({
        title: "Chemical Added",
        description: `${chemical.name} (${vol}ml) added to equipment.`,
      });
    },
    [isExperimentStarted, reactionEngine, scoring, toast]
  );

  const handleChemicalSelect = useCallback(
    (chemical: any) => {
      if (!isExperimentStarted)
        return toast({
          title: "Experiment Not Started",
          description: "Click 'Start' to begin experimenting.",
          variant: "destructive",
        });

      if (selectedEquipment) handleChemicalAdd(selectedEquipment, chemical, 5);
      else
        toast({
          title: "No Equipment Selected",
          description: "Please select equipment first.",
          variant: "destructive",
        });
    },
    [isExperimentStarted, selectedEquipment, handleChemicalAdd, toast]
  );

  // 🧩 Experiment stats
  const experimentDetails = useMemo(
    () => [
      { label: "Equipment placed", value: placedEquipment.length },
      {
        label: "Chemicals added",
        value: placedEquipment.reduce(
          (t, eq) => t + eq.chemicalObjects.length,
          0
        ),
      },
      { label: "Reactions performed", value: reactions.length },
      { label: "Current score", value: `${scoring.score} points` },
    ],
    [placedEquipment, reactions, scoring.score]
  );

  // 🔹 UI Rendering
  return (
    <div className="h-screen flex flex-col bg-background">
      <ExperimentScorePanel score={scoring.score} badges={scoring.badges} />
      <SafetyWarnings
        alerts={reactionEngine.safetyAlerts}
        onClear={reactionEngine.clearSafetyAlerts}
      />
      <EducationalTooltips
        reaction={
          reactionEngine.activeReactions[
            reactionEngine.activeReactions.length - 1
          ]
        }
      />

      <DragDropProvider>
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Beaker className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-base font-bold">Virtual Chemistry Lab</h1>
                <p className="text-xs text-muted-foreground">
                  {isExperimentStarted ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Experiment Active
                    </span>
                  ) : (
                    "Click Start to begin experimenting"
                  )}
                </p>
              </div>
            </div>

            {/* --- Lab Controls --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isExperimentStarted ? "default" : "outline"}
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  <Settings className="w-4 h-4" />
                  Lab Control
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={startExperiment}
                  disabled={isExperimentStarted}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExperimentStarted ? "Active" : "Start"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetLab}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => saveExperiment(false)}
                  disabled={!isExperimentStarted}
                >
                  <Save className="w-4 h-4 mr-2" /> Save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <UserMenu />
        </header>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 relative min-w-0">
            <Canvas
              camera={{ position: [0, 8, 22], fov: 25 }}
              shadows
              className="w-full h-full"
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} castShadow />
              <OrbitControls enableZoom enableRotate />
              <Environment preset="studio" />
              <EnhancedLabTable
                onEquipmentPlace={(id, pos) => {
                  setPlacedEquipment((prev) => [
                    ...prev,
                    {
                      id: `${id}-${Date.now()}`,
                      position: pos,
                      type: id,
                      contents: [],
                      chemicalObjects: [],
                      totalVolume: 0,
                    },
                  ]);
                  scoring.award(10, `Placed ${id}`);
                }}
                placedEquipment={placedEquipment}
              />
              {placedEquipment.map((eq) => (
                <EnhancedLabEquipment
                  key={eq.id}
                  selectedEquipment={selectedEquipment}
                  setSelectedEquipment={setSelectedEquipment}
                  reactions={reactions}
                  setReactions={setReactions}
                  position={eq.position}
                  equipmentType={eq.type}
                  equipmentId={eq.id}
                  equipmentContents={eq.contents}
                  chemicalObjects={eq.chemicalObjects}
                  totalVolume={eq.totalVolume}
                  onChemicalAdd={(chem, vol) =>
                    handleChemicalAdd(eq.id, chem, vol)
                  }
                />
              ))}
              <Grid
                args={[30, 30]}
                position={[0, -0.5, 0]}
                cellSize={1}
                fadeDistance={25}
                fadeStrength={1}
              />
            </Canvas>
          </div>

          <div className="w-96 bg-card border-l flex flex-col h-full">
            <Tabs defaultValue="chemicals" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger
                  value="chemicals"
                  disabled={!isExperimentStarted}
                >
                  Chemicals
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  disabled={!isExperimentStarted}
                >
                  Equipment
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="chemicals"
                className="p-4 flex-1 overflow-y-auto"
              >
                <EnhancedChemicalLibrary
                  onChemicalSelect={handleChemicalSelect}
                  selectedEquipment={selectedEquipment}
                />
              </TabsContent>

              <TabsContent
                value="equipment"
                className="p-4 flex-1 overflow-y-auto"
              >
                <EquipmentRack onEquipmentSelect={() => {}} position={[0, 0, 0]} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <ConfirmationDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={performReset}
          title="Reset Active Experiment?"
          description="You have an active experiment in progress. Resetting will delete your progress."
          icon={AlertTriangle}
          iconColor="text-orange-600"
          confirmText="Reset Anyway"
          cancelText="Save First"
          confirmVariant="destructive"
          details={experimentDetails}
        />
      </DragDropProvider>
    </div>
  );
};

export default ScienceLab;
