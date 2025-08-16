import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Award, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Star,
  Trophy,
  Shield,
  Brain,
  Zap
} from 'lucide-react';
import { ReactionData } from './SmartChemistryEngine';

interface EducationalFeaturesProps {
  currentReaction?: ReactionData | null;
  reactionHistory: ReactionData[];
  onStartLesson: (lessonId: string) => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  points: number;
  category: 'safety' | 'chemistry' | 'equipment' | 'discovery';
}

interface LearningObjective {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  chemicalsNeeded: string[];
  equipmentNeeded: string[];
  safetyLevel: 'low' | 'medium' | 'high';
  completed: boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first_reaction',
    name: 'First Reaction',
    description: 'Perform your first chemical reaction',
    icon: Zap,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    points: 50,
    category: 'chemistry'
  },
  {
    id: 'safety_expert',
    name: 'Safety Expert',
    description: 'Follow all safety protocols for 10 reactions',
    icon: Shield,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    points: 200,
    category: 'safety'
  },
  {
    id: 'acid_base_master',
    name: 'Acid-Base Master',
    description: 'Complete 5 acid-base reactions',
    icon: Brain,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    points: 150,
    category: 'chemistry'
  },
  {
    id: 'equipment_specialist',
    name: 'Equipment Specialist',
    description: 'Use all types of equipment',
    icon: Trophy,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    points: 300,
    category: 'equipment'
  },
  {
    id: 'discovery_pioneer',
    name: 'Discovery Pioneer',
    description: 'Discover 3 unexpected reactions',
    icon: Star,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    points: 500,
    category: 'discovery'
  }
];

const learningObjectives: LearningObjective[] = [
  {
    id: 'basic_mixing',
    title: 'Basic Chemical Mixing',
    description: 'Learn to safely mix chemicals and observe reactions',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    prerequisites: [],
    chemicalsNeeded: ['NaCl', 'H₂O'],
    equipmentNeeded: ['beaker', 'stirring rod'],
    safetyLevel: 'low',
    completed: false
  },
  {
    id: 'acid_base_neutralization',
    title: 'Acid-Base Neutralization',
    description: 'Understand how acids and bases neutralize each other',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    prerequisites: ['basic_mixing'],
    chemicalsNeeded: ['HCl', 'NaOH', 'phenolphthalein'],
    equipmentNeeded: ['beaker', 'burette', 'pH meter'],
    safetyLevel: 'medium',
    completed: false
  },
  {
    id: 'precipitation_reactions',
    title: 'Precipitation Reactions',
    description: 'Explore how ionic compounds form precipitates',
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    prerequisites: ['acid_base_neutralization'],
    chemicalsNeeded: ['CuSO₄', 'NaOH', 'AgNO₃'],
    equipmentNeeded: ['test tubes', 'beaker', 'filter paper'],
    safetyLevel: 'medium',
    completed: false
  },
  {
    id: 'metal_reactivity',
    title: 'Metal Reactivity Series',
    description: 'Investigate how different metals react with acids',
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    prerequisites: ['precipitation_reactions'],
    chemicalsNeeded: ['Mg', 'Zn', 'Cu', 'HCl'],
    equipmentNeeded: ['test tubes', 'gas collection tube'],
    safetyLevel: 'high',
    completed: false
  },
  {
    id: 'combustion_analysis',
    title: 'Combustion Analysis',
    description: 'Analyze combustion reactions and energy changes',
    difficulty: 'advanced',
    estimatedTime: '45 minutes',
    prerequisites: ['metal_reactivity'],
    chemicalsNeeded: ['Mg', 'ethanol', 'O₂'],
    equipmentNeeded: ['bunsen burner', 'calorimeter'],
    safetyLevel: 'high',
    completed: false
  }
];

export const EducationalFeatures: React.FC<EducationalFeaturesProps> = ({
  currentReaction,
  reactionHistory,
  onStartLesson
}) => {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [objectives, setObjectives] = useState<LearningObjective[]>(learningObjectives);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    // Update achievements based on reaction history
    if (reactionHistory.length > 0) {
      setUserAchievements(prev => prev.map(achievement => {
        switch (achievement.id) {
          case 'first_reaction':
            return {
              ...achievement,
              progress: Math.min(reactionHistory.length, 1),
              unlocked: reactionHistory.length >= 1
            };
          case 'acid_base_master':
            const acidBaseReactions = reactionHistory.filter(r => r.type === 'acid_base').length;
            return {
              ...achievement,
              progress: Math.min(acidBaseReactions, 5),
              unlocked: acidBaseReactions >= 5
            };
          case 'safety_expert':
            const safeReactions = reactionHistory.filter(r => r.dangerLevel === 'low').length;
            return {
              ...achievement,
              progress: Math.min(safeReactions, 10),
              unlocked: safeReactions >= 10
            };
          default:
            return achievement;
        }
      }));
    }
  }, [reactionHistory]);

  useEffect(() => {
    const points = userAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(points);
    setCurrentLevel(Math.floor(points / 100) + 1);
  }, [userAchievements]);

  const getReactionExplanation = (reaction: ReactionData) => {
    return {
      type: getReactionTypeExplanation(reaction.type),
      energy: getEnergyExplanation(reaction.energy),
      mechanism: reaction.mechanism || [],
      safety: reaction.safetyWarnings,
      educational: reaction.educationalNotes
    };
  };

  const getReactionTypeExplanation = (type: string) => {
    const explanations = {
      'acid_base': 'An acid-base reaction occurs when an acid donates a proton (H⁺) to a base, forming water and a salt.',
      'precipitation': 'A precipitation reaction forms an insoluble product (precipitate) when two soluble ionic compounds are mixed.',
      'combustion': 'A combustion reaction involves a substance combining with oxygen, usually producing heat and light.',
      'single_replacement': 'A more reactive element displaces a less reactive element from its compound.',
      'double_replacement': 'Two ionic compounds exchange ions to form two new compounds.',
      'synthesis': 'Two or more substances combine to form a single, more complex product.',
      'decomposition': 'A single compound breaks down into two or more simpler substances.'
    };
    return explanations[type as keyof typeof explanations] || 'Chemical reaction type explanation not available.';
  };

  const getEnergyExplanation = (energy: string) => {
    return energy === 'exothermic' 
      ? 'This reaction releases energy (usually heat) to the surroundings, making the container feel warm.'
      : 'This reaction absorbs energy from the surroundings, making the container feel cool.';
  };

  const getSafetyGuidelines = () => [
    'Always wear safety goggles and gloves',
    'Work in a well-ventilated area',
    'Never mix chemicals unless instructed',
    'Keep a fire extinguisher nearby',
    'Know the location of emergency equipment',
    'Read safety data sheets for all chemicals',
    'Never eat or drink in the laboratory',
    'Dispose of chemicals properly'
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return Shield;
      case 'chemistry': return Brain;
      case 'equipment': return Trophy;
      case 'discovery': return Star;
      default: return Award;
    }
  };

  return (
    <div className="space-y-4">
      {/* User Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Level {currentLevel}</span>
              <span className="text-sm text-muted-foreground">{totalPoints} points</span>
            </div>
            <Progress value={(totalPoints % 100)} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {100 - (totalPoints % 100)} points to next level
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explanation">Explanation</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="explanation" className="space-y-4">
          {currentReaction ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reaction Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Reaction Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {getReactionExplanation(currentReaction).type}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Energy Change</h4>
                  <p className="text-sm text-muted-foreground">
                    {getReactionExplanation(currentReaction).energy}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Balanced Equation</h4>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    {currentReaction.balancedEquation}
                  </div>
                </div>

                {currentReaction.mechanism && currentReaction.mechanism.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Reaction Mechanism</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {currentReaction.mechanism.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {currentReaction.educationalNotes && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Key Learning Points
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentReaction.educationalNotes.map((note, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Perform a reaction to see detailed explanations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Laboratory Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <ul className="space-y-2">
                  {getSafetyGuidelines().map((guideline, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          {currentReaction && currentReaction.safetyWarnings.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-5 w-5" />
                  Current Reaction Safety Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {currentReaction.safetyWarnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {objectives.map((objective) => (
                <Card key={objective.id} className={objective.completed ? 'bg-green-50 border-green-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{objective.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(objective.difficulty)}>
                          {objective.difficulty}
                        </Badge>
                        {objective.completed && (
                          <Badge className="bg-green-500">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {objective.description}
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        <span>Time: {objective.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Safety Level: {objective.safetyLevel}</span>
                      </div>
                      {objective.prerequisites.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Prerequisites: {objective.prerequisites.join(', ')}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onStartLesson(objective.id)}
                      disabled={objective.completed}
                      className="mt-3"
                    >
                      {objective.completed ? 'Completed' : 'Start Lesson'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {userAchievements.map((achievement) => {
                const Icon = achievement.icon;
                const CategoryIcon = getCategoryIcon(achievement.category);
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : 'opacity-60'}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
                          <h4 className="font-semibold text-sm">{achievement.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                            {achievement.points} pts
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};