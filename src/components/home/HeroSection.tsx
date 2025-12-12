import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import auth from '@/lib/shared/kliv-auth.js';

interface User {
  userUuid: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const HeroSection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getUser();
        setUser(currentUser as User);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-20 md:py-20 py-12">
        <div className="text-center space-y-8">
          {/* Logo and Badge */}
          <div className="flex flex-col items-center space-y-6 animate-slide-up">
            <div className="relative inline-flex items-center justify-center">
              <img 
                src="/arenajo-logo-square.png" 
                alt="ArenaJo" 
                className="w-24 h-24 sm:w-16 sm:h-16 object-contain"
                style={{width: '96px', height: '96px'}}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary blur-xl opacity-30" />
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-gaming text-sm text-primary">Jordan's #1 Esports Platform</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">COMPETE.</span>
            <span className="block text-gradient">WIN.</span>
            <span className="block">DOMINATE.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground font-gaming animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Join thousands of players in Jordan's biggest esports tournaments. 
            Battle in PUBG Mobile, EA FC, Valorant, and more. Real prizes, real glory.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/tournaments">
              <Button size="lg" className="font-gaming text-lg px-8 py-6 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 glow-cyan group">
                <Trophy className="w-5 h-5 mr-2" />
                Browse Tournaments
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            {/* Only show Create Account button when user is not logged in */}
            {!loading && !user && (
              <Link to="/register">
                <Button size="lg" variant="outline" className="font-gaming text-lg px-8 py-6 border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10">
                  <Users className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-primary">10K+</div>
              <div className="font-gaming text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="font-display text-3xl sm:text-4xl font-bold text-secondary">500+</div>
              <div className="font-gaming text-sm text-muted-foreground">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-success">50K JD</div>
              <div className="font-gaming text-sm text-muted-foreground">Prizes Won</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
