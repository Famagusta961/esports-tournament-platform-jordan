import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

// TEMPORARY: Hardcoded admin bypass - REMOVE IN PRODUCTION
const ADMIN_EMAILS = ['admin@arenajo.com'];

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
            console.log('=== ADMIN CHECK DEBUG ===');
            console.log('Auth user object:', user);
            console.log('Auth user email:', user.email);
            console.log('Auth user metadata:', user.metadata);
            console.log('Auth user ID:', user.id);
            
            // LEGACY SUPPORT: Check both hardcoded list and database
            if (ADMIN_EMAILS.includes(user.email)) {
              console.log('🔓 HARDCODED BYPASS: Granting admin access to', user.email);
              setIsAdmin(true);
              setAdminCheckFailed(false);
              return;
            }
            
            // Check database for admin role - this is the authoritative source
            const { data: users } = await db.query('users', {
              email: 'eq.' + user.email,
              role: 'eq.admin'
            });

            console.log('Admin query result for', user.email, ':', users);
            console.log('Query result length:', users?.length || 0);
            
            const adminUser = users?.[0];
            const isAdminByDB = !!adminUser;
            
            console.log('isAdminByDB:', isAdminByDB);
            console.log('adminUser:', adminUser);
            
            setIsAdmin(isAdminByDB);

            if (!adminUser) {
              console.log('❌ No admin role found for user:', user.email);
              setAdminCheckFailed(true);
            } else {
              console.log('✅ Admin access granted for:', user.email);
            }
          } catch (error) {
            console.error('❌ Admin check failed:', error);
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