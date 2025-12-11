import { useEffect, useState } from 'react';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';

interface DebugInfo {
  authUser?: {
    email: string;
    id?: string;
  } | null;
  dbUser?: {
    email: string;
    role: string;
  } | null;
  isAdminUser?: boolean;
  hasAdminRole?: boolean;
  error?: string;
}

const AdminDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const user = await auth.getUser();
        console.log('=== ADMIN DEBUG PANEL ===');
        console.log('Auth user:', user);
        
        let dbUser = null;
        if (user) {
          console.log('🔍 [AdminDebug] Querying database for user:', user.email);
          const { data: users } = await db.query('users', {
            email: 'eq.' + user.email
          });
          console.log('📊 [AdminDebug] DB query result:', users);
          console.log('📊 [AdminDebug] DB query result count:', users?.length || 0);
          dbUser = users?.[0];
          console.log('📊 [AdminDebug] Extracted DB user:', dbUser);
        }
        
        setDebugInfo({
          authUser: user,
          dbUser: dbUser,
          isAdminUser: user?.email === 'admin@arenajo.com',
          hasAdminRole: dbUser?.role === 'admin'
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    getDebugInfo();
  }, []);

  if (loading) return <div>Loading debug info...</div>;

  return (
    <div className="fixed top-4 right-4 w-96 bg-red-900 text-white p-4 rounded-lg shadow-lg z-50 font-mono text-xs">
      <h3 className="text-lg font-bold mb-3">🔍 ADMIN DEBUG PANEL</h3>
      
      {debugInfo?.error ? (
        <div className="text-red-300">Error: {debugInfo.error}</div>
      ) : (
        <div className="space-y-2">
          <div>
            <strong>Auth User:</strong> {debugInfo?.authUser ? '✅ Logged In' : '❌ None'}
          </div>
          <div>
            <strong>Auth Email:</strong> {debugInfo?.authUser?.email || 'N/A'}
          </div>
          <div>
            <strong>DB User:</strong> {debugInfo?.dbUser ? '✅ Found' : '❌ Not Found'}
          </div>
          <div>
            <strong>DB Role:</strong> {debugInfo?.dbUser?.role || 'N/A'}
          </div>
          <div>
            <strong>Is Admin Email:</strong> {debugInfo?.isAdminUser ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Has Admin Role:</strong> {debugInfo?.hasAdminRole ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Should Be Admin:</strong> {(debugInfo?.isAdminUser || debugInfo?.hasAdminRole) ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      )}
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Refresh
      </button>
    </div>
  );
};

export default AdminDebugPanel;