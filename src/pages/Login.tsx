import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import auth from '@/lib/shared/kliv-auth.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getUser();
        if (user) {
          console.log('User already logged in, redirecting...', user.email);
          
          // Check if user should be redirected to a specific tournament
          const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
          const joinTournamentId = sessionStorage.getItem('joinTournamentAfterLogin');
          
          // Clear the stored values
          sessionStorage.removeItem('redirectAfterLogin');
          sessionStorage.removeItem('joinTournamentAfterLogin');
          
          if (redirectTarget) {
            console.log('Redirecting to saved target:', redirectTarget);
            navigate(redirectTarget);
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.log('No active session found');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', email);
      const user = await auth.signIn(email, password);
      console.log('Login successful:', user);
      
      // Verify session was established
      setTimeout(async () => {
        try {
          const sessionCheck = await auth.getUser();
          console.log('Session verification:', sessionCheck);
        } catch (sessionError) {
          console.error('Session verification failed:', sessionError);
        }
      }, 1000);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      // Check if user should be redirected to a specific tournament
      const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
      const joinTournamentId = sessionStorage.getItem('joinTournamentAfterLogin');
      
      // Clear the stored values
      sessionStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('joinTournamentAfterLogin');
      
      if (redirectTarget) {
        console.log('Redirecting to saved target:', redirectTarget);
        navigate(redirectTarget);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password.";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background bg-grid-pattern">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />

      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <Link 
          to="/" 
          className="absolute -top-12 right-0 sm:-top-16 sm:-right-16 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Button variant="ghost" size="icon" className="w-10 h-10">
            <X className="w-5 h-5" />
          </Button>
        </Link>
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img 
            src="/arenajo-logo-square.png" 
            alt="ArenaJo" 
            className="w-12 h-12 object-contain"
            style={{width: '48px', height: '48px'}}
          />
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-gaming">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-gaming">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="player@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-muted/50 border-border font-gaming"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-gaming">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-gaming">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-muted/50 border-border font-gaming"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full font-gaming text-lg py-6 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground font-gaming">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
