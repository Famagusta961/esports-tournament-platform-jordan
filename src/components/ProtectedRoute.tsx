import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckFailed, setAdminCheckFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getUser();
        setIsAuthenticated(!!user);
        
        if (requireAuth && !user) {
          navigate(redirectTo);
          return;
        }

        if (requireAdmin && user) {
          try {
            // Check if user has admin role
            const { data: users } = await db.query('users', {
              email: 'eq.' + user.email,
              role: 'eq.admin'
            });

            const adminUser = users?.[0];
            setIsAdmin(!!adminUser);

            if (!adminUser) {
              setAdminCheckFailed(true);
            }
          } catch (error) {
            console.error('Admin check failed:', error);
            setAdminCheckFailed(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          navigate(redirectTo);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requireAuth, requireAdmin, redirectTo, navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              {adminCheckFailed ? (
                <AlertTriangle className="w-8 h-8 text-destructive" />
              ) : (
                <Shield className="w-8 h-8 text-destructive" />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold mb-2">
                {adminCheckFailed ? 'Access Denied' : 'Admin Access Required'}
              </h1>
              <p className="text-muted-foreground font-gaming mb-4">
                {adminCheckFailed 
                  ? 'You need administrator privileges to access this panel.'
                  : 'This area is restricted to administrators only.'}
              </p>
            </div>
            <div className="space-y-2 w-full">
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-gaming hover:opacity-90"
              >
                Go Home
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 border border-border rounded-lg font-gaming hover:bg-muted"
              >
                Sign In as Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;