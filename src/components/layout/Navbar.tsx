import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, Trophy, Gamepad2, Users, Wallet, Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Check if user has admin role
          const { data: users } = await db.query('users', {
            email: 'eq.' + currentUser.email,
            role: 'eq.admin'
          });
          setIsAdmin(!!users?.[0]);
        } catch (error) {
          console.error('Admin check failed:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-lg border-b border-border' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Shows on all devices */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/arenajo-logo-rectangle.png" 
                alt="ArenaJo" 
                className="h-12 w-[180px] max-w-[180px] object-contain lg:h-10 lg:w-[120px] lg:max-w-[120px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.filter(link => !link.hideOnDesktop).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-gaming font-semibold text-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="font-gaming">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/wallet">
                  <Button variant="ghost" size="sm" className="font-gaming">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="font-gaming border-primary/50 hover:border-primary hover:bg-primary/10">
                    <User className="w-4 h-4 mr-2" />
                    {user.firstName || 'Profile'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="font-gaming">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="font-gaming bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-cyan">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-lg border-b border-border animate-slide-up">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-gaming font-semibold text-lg transition-all ${
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-gaming">
                        <Shield className="w-5 h-5 mr-3" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Link to="/wallet" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-gaming">
                      <Wallet className="w-5 h-5 mr-3" />
                      Wallet
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start font-gaming">
                      <User className="w-5 h-5 mr-3" />
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-gaming">
                      <LogIn className="w-5 h-5 mr-3" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full font-gaming bg-gradient-to-r from-primary to-secondary">
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
