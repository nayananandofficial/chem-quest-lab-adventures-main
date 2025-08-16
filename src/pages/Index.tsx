
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, FlaskConical, Atom, BookOpen, Users, ChevronRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Beaker className="h-8 w-8 text-blue-600" />
            <FlaskConical className="h-6 w-6 text-purple-600 absolute -top-1 -right-1" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Virtual Science Lab
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email?.split('@')[0]}
              </span>
              <Button onClick={() => navigate('/lab')}>
                Enter Lab
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Learn Chemistry Through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Interactive Experiments
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the wonder of chemistry in a safe, virtual environment. 
            Conduct experiments, learn chemical reactions, and explore the periodic table
            with our cutting-edge 3D laboratory simulator.
          </p>
          
          <div className="flex justify-center gap-4">
            {user ? (
              <Button size="lg" onClick={() => navigate('/lab')} className="text-lg px-8 py-6">
                <Beaker className="mr-2 h-5 w-5" />
                Start Experimenting
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                  <Beaker className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <FlaskConical className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Interactive 3D Lab</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work with realistic lab equipment in a fully interactive 3D environment. 
                Mix chemicals, use burners, and observe reactions in real-time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Atom className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <CardTitle>Periodic Table Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover the elements with our interactive periodic table. 
                Learn properties, electron configurations, and chemical behaviors.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <CardTitle>Guided Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Follow structured lessons from basic chemistry to advanced synthesis. 
                Track your progress and master chemical concepts step by step.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Chemical Reactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">118</div>
              <div className="text-gray-600 dark:text-gray-400">Periodic Elements</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Interactive Lessons</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Your Chemistry Journey?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Join thousands of students exploring chemistry in our virtual laboratory.
          </p>
          {!user && (
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
              <Users className="mr-2 h-5 w-5" />
              Join the Lab Today
            </Button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Virtual Science Lab. Empowering the next generation of chemists.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
