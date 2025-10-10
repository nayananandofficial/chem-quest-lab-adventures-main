import React, { useState, useEffect } from "react";
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
import useExperimentScoring, { ExperimentScorePanel } from "@/components/ExperimentScoring";
import EducationalTooltips from "@/components/EducationalTooltips";
import SafetyWarnings from "@/components/SafetyWarnings";

// Interfaces
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

// Main Component
const ScienceLab = () => {
  // States
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [experimentState, setExperimentState] = useState<ExperimentState>({
    status: "idle",
    autoSaveEnabled: true,
  });
  const [isExperimentStarted, setIsExperimentStarted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Hooks
  const reactionEngine = useChemicalReactionEngine();
  const scoring = useExperimentScoring();

  useExperimentProtection({
    isExperimentActive: isExperimentStarted,
    onBeforeUnload: () => {
      if (placedEquipment.length > 0 || reactions.length > 0) {
        saveExperiment(true);
      }
    },
  });

  // Auto-save
  useEffect(() => {
    if (!isExperimentStarted || !experimentState.autoSaveEnabled || !user) return;

    const autoSaveInterval = setInterval(() => {
      if (placedEquipment.length > 0 || reactions.length > 0) {
        saveExperiment(true);
      }
    }, 60000);

    return () => clearInterval(autoSaveInterval);
  }, [isExperimentStarted, placedEquipment, reactions, experimentState.autoSaveEnabled, user]);

  // Handlers
  const startExperiment = () => {
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
  };

  const performReset = () => {
    setReactions([]);
    setSelectedEquipment(null);
    setPlacedEquipment([]);
    setIsExperimentStarted(false);
    setExperimentState({ status: "idle", autoSaveEnabled: true });
    scoring.reset();
    toast({
      title: "Lab Reset",
      description: "All equipment cleared. Click Start to begin a new experiment.",
    });
  };

  const resetLab = () => {
    if (experimentState.status === "active") {
      setShowResetConfirm(true);
      return;
    }
    performReset();
  };

  const saveExperiment = async (isAutoSave = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your experiments.",
        variant: "destructive",
      });
      return;
    }

    if (experimentState.status === "idle") {
      toast({
        title: "No Active Experiment",
        description: "Start an experiment first to save progress.",
        variant: "destructive",
      });
      return;
    }

    try {
      const experimentData = {
        user_id: user.uid,
        experiment_name: `Lab Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        chemicals_used: placedEquipment.flatMap((eq) => eq.contents),
        results: {
          reactions: reactions.length,
          equipment_used: placedEquipment.length,
          chemicals_mixed: placedEquipment.reduce(
            (total, eq) => total + eq.chemicalObjects.length,
            0
          ),
          session_duration: experimentState.startTime
            ? Math.round((Date.now() - experimentState.startTime.getTime()) / 1000)
            : 0,
          equipment_details: placedEquipment.map((eq) => ({
            type: eq.type,
            chemicals: eq.chemicalObjects,
            totalVolume: eq.totalVolume,
          })),
          reactions_performed: reactions.map((r) => ({
            name: r.name,
            type: r.type,
            timestamp: r.startedAt,
          })),
          timestamp: new Date().toISOString(),
        },
        score: scoring.score,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/add-experiment`,
        { experimentData },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds
          onUploadProgress: (progressEvent) => {
            console.log('📤 Upload progress:', progressEvent);
          }
        }
      );

      console.log("✅ Save response received:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      if (response.status === 200) {
        setExperimentState((prev) => ({ ...prev, status: "active" }));
        toast({
          title: isAutoSave ? "Auto-saved" : "Experiment Saved! 💾",
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
          const existing = Array.isArray(equipment.chemicalObjects)
            ? equipment.chemicalObjects
            : [];

          if (existing.length > 0) {
            const currentTotal = existing.reduce((s, c) => s + Number(c.volume || 0), 0);
            if (currentTotal <= 0) {
              return { ...equipment, totalVolume: Number(newTotalVolume || 0) };
            }

            const scale = Number(newTotalVolume) / currentTotal;
            const scaled = existing.map((c) => ({ ...c, volume: Number(c.volume || 0) * scale }));
            const recalculated = scaled.reduce((s, c) => s + Number(c.volume || 0), 0);

            return { ...equipment, chemicalObjects: scaled, totalVolume: recalculated };
          }

          return { ...equipment, totalVolume: Number(newTotalVolume || 0) };
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
      totalVolume: 0,
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
      prev.map((equipment) => {
        if (equipment.id === equipmentId) {
          const existingContents = Array.isArray(equipment.contents) ? equipment.contents : [];
          const existingChemObjects = Array.isArray(equipment.chemicalObjects)
            ? equipment.chemicalObjects
            : [];

          const newContents = [...existingContents, chemical.name];
          const newChemicalObject = {
            name: chemical.name,
            volume: vol,
            color: chemical.color || chemical.colorHex || "#87CEEB",
          };
          const newChemicalObjects = [...existingChemObjects, newChemicalObject];
          const newTotalVolume = newChemicalObjects.reduce((sum, chem) => sum + Number(chem.volume || 0), 0);

          const updated = {
            ...equipment,
            contents: newContents,
            chemicalObjects: newChemicalObjects,
            totalVolume: newTotalVolume,
          };

          try {
            const names = newChemicalObjects.map((c) => c.name);
            const reaction = reactionEngine.perform(names, 20);

            if (reaction) {
              const reactionInstance = {
                ...reaction,
                id: `${reaction.id}-${Date.now()}`,
                equipmentId: equipment.id,
                startedAt: Date.now(),
              };

              setReactions((prev) => [...prev, reactionInstance]);
              scoring.award(15, `Added ${chemical.name}`);
              scoring.award(50, `Reaction: ${reaction.name}`);
              scoring.awardBadge(reaction.type || "reaction");
            } else {
              scoring.award(15, `Added ${chemical.name}`);
            }
          } catch (e) {
            console.error("Reaction engine error", e);
          }

          return updated;
        }
        return equipment;
      })
    );

    toast({
      title: "Chemical Added",
      description: `${chemical.name} (${vol}ml) added to equipment.`,
    });
  };

  const handleChemicalSelect = (chemical: any) => {
    if (!isExperimentStarted) {
      toast({
        title: "Experiment Not Started",
        description: "Click 'Start' in Lab Controls to begin experimenting.",
        variant: "destructive",
      });
      return;
    }

    console.log("Chemical selected:", chemical);
    console.log("Selected equipment:", selectedEquipment);

    if (selectedEquipment) {
      handleChemicalAdd(selectedEquipment, chemical, 5);
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

  const experimentDetails = [
    { label: "Equipment placed", value: placedEquipment.length },
    { label: "Chemicals added", value: placedEquipment.reduce((total, eq) => total + eq.chemicalObjects.length, 0) },
    { label: "Reactions performed", value: reactions.length },
    { label: "Current score", value: `${scoring.score} points` },
    {
      label: "Session duration",
      value: experimentState.startTime
        ? `${Math.round((Date.now() - experimentState.startTime.getTime()) / 60000)} min`
        : "0 min",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Score panel and safety tooltips */}
      <ExperimentScorePanel score={scoring.score} badges={scoring.badges} />
      <SafetyWarnings alerts={reactionEngine.safetyAlerts} onClear={() => reactionEngine.clearSafetyAlerts()} />
      <EducationalTooltips reaction={reactionEngine.activeReactions[reactionEngine.activeReactions.length - 1]} />

      <DragDropProvider>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Beaker className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-base font-bold">Virtual Chemistry Lab</h1>
                <p className="text-xs text-muted-foreground">
                  {isExperimentStarted ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Experiment Active
                    </span>
                  ) : (
                    "Click Start to begin experimenting"
                  )}
                </p>
              </div>
            </div>

            {/* Lab Controls */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isExperimentStarted ? "default" : "outline"}
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  <Settings className="w-4 h-4" /> Lab Control <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={startExperiment}
                  disabled={isExperimentStarted}
                  className={isExperimentStarted ? "opacity-50" : ""}
                >
                  <Play className="w-4 h-4 mr-2" /> {isExperimentStarted ? "Experiment Active" : "Start"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetLab}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => saveExperiment(false)}
                  disabled={!isExperimentStarted}
                  className={!isExperimentStarted ? "opacity-50" : ""}
                >
                  <Save className="w-4 h-4 mr-2" /> Save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 px-3 py-1.5">
                  <Layers className="w-4 h-4" /> Tools <ChevronDown className="w-3 h-3" />
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

        {/* Lab Canvas & Sidebar */}
        <div className="flex flex-1 min-h-0">
          <div className="w-8 flex-shrink-0" />
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
                  reactions={reactions}
                  setReactions={setReactions}
                  position={equipment.position}
                  equipmentType={equipment.type}
                  equipmentId={equipment.id}
                  equipmentContents={equipment.contents}
                  chemicalObjects={equipment.chemicalObjects}
                  totalVolume={equipment.totalVolume}
                  onVolumeChange={(newVolume) => handleVolumeChange(equipment.id, newVolume)}
                  onChemicalAdd={(chemical, volume) => handleChemicalAdd(equipment.id, chemical, volume)}
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
          </div>

          {/* Sidebar */}
          <div className="w-96 bg-card border-l border-border flex flex-col h-full">
            {!isExperimentStarted && (
              <div className="p-4 bg-muted border-b">
                <div className="text-sm font-medium text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> Click "Start" in Lab Controls to begin
                </div>
              </div>
            )}

            <Tabs defaultValue="chemicals" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="chemicals" disabled={!isExperimentStarted}>
                  Chemicals
                </TabsTrigger>
                <TabsTrigger value="equipment" disabled={!isExperimentStarted}>
                  Equipment
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chemicals" className="p-4 flex-1 overflow-y-auto">
                <div className={!isExperimentStarted ? "opacity-50 pointer-events-none" : ""}>
                  <EnhancedChemicalLibrary
                    onChemicalSelect={handleChemicalSelect}
                    selectedEquipment={selectedEquipment}
                  />
                </div>
              </TabsContent>
              <TabsContent value="equipment" className="p-4 flex-1 overflow-y-auto">
                <div className={!isExperimentStarted ? "opacity-50 pointer-events-none" : ""}>
                  <EquipmentRack onEquipmentSelect={() => {}} position={[0, 0, 0]} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={performReset}
          title="Reset Active Experiment?"
          description="You have an active experiment in progress. Resetting will permanently delete all your progress:"
          icon={AlertTriangle}
          iconColor="text-orange-600"
          confirmText="Reset Anyway"
          cancelText="Save First"
          confirmVariant="destructive"
          details={experimentDetails}
        >
          <p className="text-xs text-muted-foreground mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            💡 <strong>Tip:</strong> Consider saving your experiment first to preserve your progress and points.
          </p>
        </ConfirmationDialog>
      </DragDropProvider>
    </div>
  );
};

export default ScienceLab;
