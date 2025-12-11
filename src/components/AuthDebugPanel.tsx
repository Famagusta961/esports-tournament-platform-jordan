import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, RefreshCw, Cookie } from 'lucide-react';
import auth from '@/lib/shared/kliv-auth.js';

interface AuthUser {
  id: string;
  email: string;
  groups?: Array<{ key: string; name: string; description: string }>;
  isPrimaryTeam?: boolean;
  userMetadata?: Record<string, unknown>;
  teamMetadata?: Record<string, unknown>;
}

interface AuthDebugInfo {
  isSignedIn: boolean;
  user: AuthUser | null;
  sessionCookie: string;
  lastCheck: string;
  error: string;
}

const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo>({
    isSignedIn: false,
    user: null,
    sessionCookie: '',
    lastCheck: '',
    error: ''
  });
  const [showCookieDetails, setShowCookieDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testEmail, setTestEmail] = useState('admin@arenajo.com');

  const checkAuthStatus = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔍 [AuthDebug] Checking auth status...');
      
      // Get session cookie
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const sessionCookie = cookies['session'] || 'Not found';

      // Check auth user
      const user = await auth.getUser(true); // Force refresh
      
      setDebugInfo({
        isSignedIn: !!user,
        user: user,
        sessionCookie: sessionCookie,
        lastCheck: new Date().toLocaleTimeString(),
        error: ''
      });

      console.log('✅ [AuthDebug] Auth check successful:', { 
        isSignedIn: !!user, 
        userEmail: user?.email,
        userId: user?.id,
        sessionCookie: sessionCookie ? 'Present' : 'Missing'
      });
    } catch (error) {
      console.error('❌ [AuthDebug] Auth check failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date().toLocaleTimeString()
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const testSessionCall = async () => {
    try {
      console.log('🧪 [AuthDebug] Testing /api/v2/auth/user call...');
      const response = await fetch('/api/v2/auth/user', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('📡 [AuthDebug] Session API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AuthDebug] Session API data:', data);
        alert('Session API call successful! Check console for details.');
      } else {
        const errorText = await response.text();
        console.error('❌ [AuthDebug] Session API failed:', errorText);
        alert(`Session API failed: ${response.status} ${response.statusText}\n${errorText}`);
      }
    } catch (error) {
      console.error('❌ [AuthDebug] Session API error:', error);
      alert(`Session API error: ${error}`);
    }
  };

  const forceLoginTest = async () => {
    try {
      console.log('🔓 [AuthDebug] Testing login flow...');
      // Test with known admin credentials
      await auth.signIn(testEmail, 'ArenaJo2024!AdminSecure#Pass');
      
      // Check status immediately after login
      setTimeout(checkAuthStatus, 1000);
      
      alert('Login test completed! Check debug panel for results.');
    } catch (error) {
      console.error('❌ [AuthDebug] Login test failed:', error);
      alert(`Login test failed: ${error}`);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    // Check auth status every 30 seconds
    const interval = setInterval(checkAuthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const { isSignedIn, user, sessionCookie, lastCheck, error } = debugInfo;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-black/90 border border-cyan-500/30 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-mono flex items-center justify-between">
            🔐 Auth Debug Panel
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={checkAuthStatus}
                disabled={isRefreshing}
                className="h-6 text-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCookieDetails(!showCookieDetails)}
                className="h-6 text-xs"
              >
                {showCookieDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Last check: {lastCheck}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertDescription className="text-red-400 text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Auth Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">Auth Status:</span>
            <Badge variant={isSignedIn ? "default" : "destructive"} className="text-xs">
              {isSignedIn ? "✅ Signed In" : "❌ Not Authenticated"}
            </Badge>
          </div>

          {/* Session Cookie */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono flex items-center gap-1">
              <Cookie className="w-3 h-3" /> Session:
            </span>
            <Badge variant={sessionCookie && sessionCookie !== 'Not found' ? "default" : "destructive"} className="text-xs">
              {sessionCookie && sessionCookie !== 'Not found' ? "Present" : "Missing"}
            </Badge>
          </div>

          {/* User Info */}
          {user && (
            <div className="space-y-2 text-xs">
              <div className="font-mono text-green-400">User Data:</div>
              <div className="bg-black/50 p-2 rounded border border-green-500/30 space-y-1">
                <div>Email: {user.email}</div>
                <div>ID: {user.id}</div>
                {user.groups && (
                  <div>Groups: {user.groups.map((g: { key: string }) => g.key).join(', ')}</div>
                )}
                {user.isPrimaryTeam !== undefined && (
                  <div>Primary Team: {user.isPrimaryTeam ? 'Yes' : 'No'}</div>
                )}
              </div>
            </div>
          )}

          {/* Cookie Details */}
          {showCookieDetails && (
            <div className="space-y-2 text-xs">
              <div className="font-mono text-yellow-400">Cookie Details:</div>
              <div className="bg-black/50 p-2 rounded border border-yellow-500/30">
                <div className="font-mono break-all">
                  {sessionCookie === 'Not found' ? (
                    <span className="text-red-400">No session cookie found</span>
                  ) : (
                    <div>
                      <div>Length: {sessionCookie.length} chars</div>
                      <div>Start: {sessionCookie.substring(0, 20)}...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Button
              size="sm"
              onClick={testSessionCall}
              className="w-full text-xs h-7"
              variant="outline"
            >
              Test /api/v2/auth/user
            </Button>
            
            <div className="flex gap-2">
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email for test"
                className="text-xs h-7"
              />
              <Button
                size="sm"
                onClick={forceLoginTest}
                className="text-xs h-7"
                variant="outline"
              >
                Test Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugPanel;