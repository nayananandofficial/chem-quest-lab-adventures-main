import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  PlayCircle,
  Award,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
interface Lesson {
  id: string;
  title: string;
  description: string;
  content: any;
  difficulty_level: string;
  category: string;
  duration_minutes: number;
  learning_objectives: string[];
}

interface LessonProgress {
  id: string;
  lesson_id: string;
  status: string;
  progress_percentage: number;
  completed_at: string | null;
  score: number | null;
  lessons: Lesson;
}

const MyLessons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchLessons();
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/lessons`);
      if(response.status !== 200){
        throw new Error("Failed to fetch lessons");
      }
      const data = response.data;
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load lessons.",
        variant: "destructive",
      });
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/lessons/${user.id}`);
      if(response.status !== 200){
        throw new Error("Failed to fetch user progress");
      }
      const data = response.data;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lesson: Lesson) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start lessons.",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingProgress = userProgress.find(p => p.lesson_id === lesson.id);
      
      if (!existingProgress) {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/lessons/start`, {
          user_id: user.id,
          lesson_id: lesson.id,
        });  
        if(response.status !== 200){
          throw new Error("Failed to start lesson");
        }
        
        toast({
          title: "Lesson Started!",
          description: `You've started "${lesson.title}". Good luck!`,
        });
        
        fetchUserProgress();
      } else {
        toast({
          title: "Continue Learning",
          description: `Continue with "${lesson.title}" where you left off.`,
        });
      }
      
      setSelectedLesson(lesson);
    } catch (error) {
      console.error('Error starting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to start lesson.",
        variant: "destructive",
      });
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/lessons/complete`, {
        user_id: user.id,
        lesson_id: lessonId,
      });
      if(response.status !== 200){
        throw new Error("Failed to complete lesson");
      }
      toast({
        title: "Lesson Completed! 🎉",
        description: "Great job! You've successfully completed this lesson.",
      });
      
      fetchUserProgress();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: error.message,
        description: "Failed to complete lesson.",
        variant: "destructive"
      })
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressForLesson = (lessonId: string) => {
    return userProgress.find(p => p.lesson_id === lessonId);
  };

  const completedLessons = userProgress.filter(p => p.status === 'completed');
  const inProgressLessons = userProgress.filter(p => p.status === 'in_progress');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Learning Journey</h1>
              <p className="text-muted-foreground mt-2">Master chemistry through interactive lessons</p>
            </div>
            
            {user && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{completedLessons.length} Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{inProgressLessons.length} In Progress</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Lessons</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => {
                const progress = getProgressForLesson(lesson.id);
                return (
                  <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`text-white ${getDifficultyColor(lesson.difficulty_level)}`}>
                          {lesson.difficulty_level}
                        </Badge>
                        <Badge variant="outline">{lesson.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <CardDescription>{lesson.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {lesson.duration_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {lesson.learning_objectives.length} objectives
                          </div>
                        </div>

                        {progress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress.progress_percentage}%</span>
                            </div>
                            <Progress value={progress.progress_percentage} className="h-2" />
                          </div>
                        )}

                        <Button 
                          onClick={() => startLesson(lesson)}
                          className="w-full"
                          variant={progress?.status === 'completed' ? 'outline' : 'default'}
                        >
                          {progress?.status === 'completed' ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Review Lesson
                            </>
                          ) : progress?.status === 'in_progress' ? (
                            <>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Continue
                            </>
                          ) : (
                            <>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Start Lesson
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inProgressLessons.map((progress) => (
                <Card key={progress.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {progress.lessons.title}
                      <Badge variant="outline">{progress.progress_percentage}%</Badge>
                    </CardTitle>
                    <CardDescription>{progress.lessons.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={progress.progress_percentage} className="h-2" />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedLesson(progress.lessons)}
                          variant="default"
                          size="sm"
                        >
                          Continue Learning
                        </Button>
                        <Button 
                          onClick={() => completeLesson(progress.lesson_id)}
                          variant="outline"
                          size="sm"
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedLessons.map((progress) => (
                <Card key={progress.id} className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-green-500 text-white">
                        Completed
                      </Badge>
                      {progress.score && (
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          {progress.score}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{progress.lessons.title}</CardTitle>
                    <CardDescription>{progress.lessons.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Completed {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : ''}
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedLesson(progress.lessons)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Review Lesson
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lesson Detail Modal/Overlay */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedLesson(null)}
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            <ScrollArea className="h-[60vh] p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedLesson.learning_objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                {selectedLesson.content?.sections && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Lesson Content</h3>
                    <div className="space-y-4">
                      {selectedLesson.content.sections.map((section: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{section.title}</h4>
                          <p className="text-muted-foreground">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-6 border-t">
              <Button 
                onClick={() => completeLesson(selectedLesson.id)}
                className="w-full"
              >
                Complete Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLessons;