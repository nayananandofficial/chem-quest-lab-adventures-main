
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Beaker, FlaskConical } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, signInWithGoogle} = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    navigate('/lab');
    return null;
  }

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(loginForm.email, loginForm.password);
      toast({
          title: "Welcome back!",
          description: "Successfully logged in to Science Lab.",
        });
      navigate('/lab');
    } catch (error) {
      console.log(error);
      if(error.message === 'No account found with this email'){
        toast({
          title: error.message,
          description: "Please check your email or sign up for a new account.",
          variant: "destructive",
        })
      }else if(error.message === 'Please sign in with Google'){
        toast({
          title: error.message,
          description: "You previously signed up with Google. Please use the Google sign-in option.",
          variant: "destructive",
        })
      }else{
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } 
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (signupForm.password.length < 6) {
      toast({
        title: "Signup Failed",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await signUp(
        signupForm.email, 
        signupForm.password,
        signupForm.fullName,
      );
      toast({
        title: "Account Created!",
        description: "Welcome to Science Lab! You can now start experimenting.",
      });
      navigate('/lab');
    } catch (error: any) {
      if(error.message === 'Email already in use'){
        toast({
        title: error.message,
        description: "Please use a different email address.",
        variant: "destructive",
      });
      }else{
        toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      }
      console.log(error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithGoogle = async () => {
    setLoading(true);
    try{
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
      navigate('/lab');
    }catch(error:any){
      if(error.code==="auth/account-exists-with-different-credential"){
        toast({
          title: "Email already in use",
          description: "Please use a different email address.",
          variant: "destructive",
        })
      }else{
        toast({
          title: "Google Sign-In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
      navigate('/auth');
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Beaker className="h-8 w-8 text-blue-600" />
              <FlaskConical className="h-6 w-6 text-purple-600 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl">Virtual Science Lab</CardTitle>
          <CardDescription>
            Join our interactive chemistry learning platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              <div className="flex items-center justify-center my-2 text-center">
                <hr className="flex-1 mr-1 border-gray-400" />
                <span className="text-gray-950 py-6">or</span>
                <hr className="flex-1 ml-1 border-gray-400"/>
              </div>
              <div>
                <Button className="w-full" onClick={handleSignUpWithGoogle} >
                <img src="google-icon.svg" alt="Google" width={24} height={24} />
                Sign up with Google
              </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              <div className="flex items-center justify-center my-2 text-center">
                <hr className="flex-1 mr-1 border-gray-400" />
                <span className="text-gray-950 py-6">or</span>
                <hr className="flex-1 ml-1 border-gray-400"/>
              </div>
              <div>
                <Button className="w-full" onClick={handleSignUpWithGoogle} >
                <img src="google-icon.svg" alt="Google" width={24} height={24} />
                Sign up with Google
              </Button>
              </div>
              
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Start your chemistry journey today! 🧪
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
