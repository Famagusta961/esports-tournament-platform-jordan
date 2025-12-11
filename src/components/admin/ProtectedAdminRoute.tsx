import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

// Production admin emails - REMOVE THIS HARDCODED LIST IN PRODUCTION
const ADMIN_EMAILS = ['admin@arenajo.com'];

// Check if development environment
const isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

interface ProtectedAdminRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedAdminRoute = ({ 
  children, 
  requireAuth = true,
  requireAdmin = true,
  redirectTo = '/login' 
}: ProtectedAdminRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckFailed, setAdminCheckFailed] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔒 [ProtectedAdminRoute] Starting authentication check...');
        
        // Step 1: Check if user is authenticated
        const user = await auth.getUser();
        console.log('👤 [ProtectedAdminRoute] Auth user:', user?.email || 'None');
        
        setIsAuthenticated(!!user);
        setDebugInfo(prev => ({ ...prev, authUser: user }));
        
        if (requireAuth && !user) {
          console.log('🚪 [ProtectedAdminRoute] No auth user, redirecting to login');
          navigate(redirectTo);
          return;
        }

        // Step 2: Check admin privileges if required
        if (requireAdmin && user) {
          try {
            console.log('🔍 [ProtectedAdminRoute] Checking admin privileges for:', user.email);
            
            // First check if email is in hardcoded admin list
            const isHardcodedAdmin = ADMIN_EMAILS.includes(user.email);
            console.log('📝 [ProtectedAdminRoute] Hardcoded admin check:', isHardcodedAdmin);
            
            if (isHardcodedAdmin) {
              console.log('✅ [ProtectedAdminRoute] Granted admin access via hardcoded list');
              setIsAdmin(true);
              setAdminCheckFailed(false);
              setDebugInfo(prev => ({ ...prev, adminSource: 'hardcoded' }));
              return;
            }
            
            // Then check database for admin role
            console.log('💾 [ProtectedAdminRoute] Querying database for admin role...');
            const { data: users, error } = await db.query('users', {
              email: 'eq.' + user.email
            });

            if (error) {
              console.error('❌ [ProtectedAdminRoute] Database error:', error);
              setAdminCheckFailed(true);
              setDebugInfo(prev => ({ ...prev, dbError: error }));
              return;
            }

            console.log('📊 [ProtectedAdminRoute] Database query result:', users);
            setDebugInfo(prev => ({ ...prev, dbUsers: users }));

            const adminUser = users?.[0];
            const isAdminByDB = adminUser?.role === 'admin';
            
            console.log('👑 [ProtectedAdminRoute] Admin role check:', { 
              userFound: !!adminUser, 
              role: adminUser?.role, 
              isAdmin: isAdminByDB 
            });
            
            setIsAdmin(isAdminByDB);
            setAdminCheckFailed(!adminUser);
            setDebugInfo(prev => ({ 
              ...prev, 
              adminSource: 'database',
              adminUser: adminUser,
              isAdminByDB
            }));

            if (!adminUser) {
              console.log('❌ [ProtectedAdminRoute] User not found in database');
            } else if (!isAdminByDB) {
              console.log('❌ [ProtectedAdminRoute] User does not have admin role');
            } else {
              console.log('✅ [ProtectedAdminRoute] Granted admin access via database');
            }
          } catch (error) {
            console.error('💥 [ProtectedAdminRoute] Admin check failed:', error);
            setAdminCheckFailed(true);
            setDebugInfo(prev => ({ ...prev, adminError: error }));
          }
        }
      } catch (error) {
        console.error('💥 [ProtectedAdminRoute] Auth check failed:', error);
        setDebugInfo(prev => ({ ...prev, authError: error }));
        if (requireAuth) {
          navigate(redirectTo);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requireAuth, requireAdmin, redirectTo, navigate]);

  // Debug panel - REMOVE IN PRODUCTION
  if (isDevelopment) {
    console.log('🐛 [ProtectedAdminRoute] Current state:', {
      isChecking,
      isAuthenticated,
      isAdmin,
      adminCheckFailed,
      debugInfo
    });
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground font-gaming">Verifying admin access...</p>
          {isDevelopment && (
            <div className="text-xs text-muted-foreground max-w-md text-center">
              Debug: Checking authentication and admin privileges...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              {adminCheckFailed ? (
                <AlertTriangle className="w-10 h-10 text-destructive" />
              ) : (
                <Shield className="w-10 h-10 text-destructive" />
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-bold text-destructive">
                {adminCheckFailed ? 'Access Denied' : 'Admin Access Required'}
              </h1>
              
              <div className="text-muted-foreground font-gaming space-y-2">
                <p>
                  {adminCheckFailed 
                    ? 'You need administrator privileges to access this panel.' 
                    : 'This area is restricted to administrators only.'}
                </p>
                
                {debugInfo.authUser && !debugInfo.dbUsers?.length && (
                  <p className="text-sm text-orange-500">
                    User authenticated but not found in database. Contact system administrator.
                  </p>
                )}
                
                {debugInfo.adminUser && debugInfo.adminUser.role !== 'admin' && (
                  <p className="text-sm text-orange-500">
                    User found but does not have admin role. Current role: {debugInfo.adminUser.role}
                  </p>
                )}
              </div>
            </div>

            {/* Debug info - REMOVE IN PRODUCTION */}
            {isDevelopment && (
              <div className="bg-black/50 p-4 rounded-lg text-left text-xs font-mono space-y-2 max-w-md">
                <div className="text-green-400 font-bold">Debug Information:</div>
                <div>Auth User: {debugInfo.authUser?.email || 'None'}</div>
                <div>Admin Source: {debugInfo.adminSource || 'None'}</div>
                <div>DB Users Found: {debugInfo.dbUsers?.length || 0}</div>
                <div>User Role: {debugInfo.adminUser?.role || 'N/A'}</div>
                <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
                <div>Check Failed: {adminCheckFailed ? 'Yes' : 'No'}</div>
                {debugInfo.authError && <div className="text-red-400">Auth Error: {String(debugInfo.authError)}</div>}
                {debugInfo.dbError && <div className="text-red-400">DB Error: {String(debugInfo.dbError)}</div>}
                {debugInfo.adminError && <div className="text-red-400">Admin Error: {String(debugInfo.adminError)}</div>}
              </div>
            )}
            
            <div className="space-y-2 w-full">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-gaming hover:opacity-90 transition-opacity"
              >
                🏠 Go Home
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 border border-border rounded-lg font-gaming hover:bg-muted transition-colors"
              >
                🔐 Sign In as Admin
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 border border-blue-500 text-blue-500 rounded-lg font-gaming hover:bg-blue-500/10 transition-colors text-sm"
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;