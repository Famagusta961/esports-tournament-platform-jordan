/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';

interface TestResult {
  message: string;
  timestamp: string;
}

interface DebugInfo {
  authUser?: {
    email: string;
    id?: string;
  } | null;
  dbUser?: {
    email: string;
    role: string;
  } | null;
  error?: string;
}

const AdminFixDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runFullTest = async () => {
    setTestResults([]);
    addTestResult('🚀 Starting full admin authentication test...');

    try {
      // Test 1: Auth SDK
      addTestResult('1️⃣ Testing auth.getUser()...');
      const authUser = await auth.getUser();
      addTestResult(`✅ Auth user: ${authUser?.email || 'NULL'}`);
      
      if (!authUser) {
        addTestResult('❌ No auth user found - skipping database tests');
        return;
      }

      // Test 2: Database Query
      addTestResult('2️⃣ Testing database query...');
      const { data: users, error: dbError } = await db.query('users', {
        email: 'eq.' + authUser.email
      });
      
      if (dbError) {
        addTestResult(`❌ DB error: ${dbError}`);
      } else {
        addTestResult(`✅ DB query returned ${users?.length || 0} results`);
        
        if (users && users.length > 0) {
          const dbUser = users[0];
          addTestResult(`📊 DB user record: ${JSON.stringify(dbUser, null, 2)}`);
          addTestResult(`👑 DB user role: "${dbUser.role}"`);
          addTestResult(`✅ Admin role check: ${dbUser.role === 'admin' ? 'PASS' : 'FAIL'}`);
        } else {
          addTestResult('❌ No user found in database');
        }
      }

      // Test 3: Direct SQL
      addTestResult('3️⃣ Testing direct SQL query...');
      try {
        const directResult = await db.execute(`
          SELECT _row_id, email, role 
          FROM users 
          WHERE email = ?
        `, [authUser.email]);
        
        addTestResult(`✅ Direct SQL returned ${directResult?.rows?.length || 0} results`);
        
        if (directResult?.rows?.length > 0) {
          const row = directResult.rows[0];
          addTestResult(`📊 Direct SQL result: ${JSON.stringify(row, null, 2)}`);
          addTestResult(`👑 Direct SQL role: "${row.role}"`);
          addTestResult(`✅ Direct SQL admin check: ${row.role === 'admin' ? 'PASS' : 'FAIL'}`);
        }
      } catch (sqlError) {
        addTestResult(`❌ Direct SQL error: ${sqlError}`);
      }

      // Test 4: All admin users
      addTestResult('4️⃣ Testing all admin users...');
      try {
        const allAdmins = await db.execute(`
          SELECT email, role 
          FROM users 
          WHERE role = 'admin'
        `);
        
        addTestResult(`✅ Found ${allAdmins?.rows?.length || 0} admin users`);
        allAdmins?.rows?.forEach((row: any) => {
          addTestResult(`👑 Admin: ${row.email} (${row.role})`);
        });
      } catch (adminError) {
        addTestResult(`❌ Admin query error: ${adminError}`);
      }

    } catch (error) {
      addTestResult(`💥 Test failed: ${error}`);
    }
    
    addTestResult('✅ Full test completed');
  };

  useEffect(() => {
    runFullTest();
  }, []);

  return (
    <div className="fixed top-20 right-4 w-[500px] bg-yellow-900 text-white p-4 rounded-lg shadow-lg z-50 font-mono text-xs">
      <h3 className="text-lg font-bold mb-3">🔧 ADMIN FIX DEBUG PANEL</h3>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Current Status:</strong>
        </div>
        <div>
          Auth User: {debugInfo?.authUser ? '✅ Logged In' : '❌ None'}
        </div>
        <div>
          Auth Email: {debugInfo?.authUser?.email || 'N/A'}
        </div>
        <div>
          DB User: {debugInfo?.dbUser ? '✅ Found' : '❌ Not Found'}
        </div>
        <div>
          DB Role: {debugInfo?.dbUser?.role || 'N/A'}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <strong>Test Results:</strong>
        <div className="bg-black/50 p-2 rounded max-h-60 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="text-green-300">
              {result}
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={runFullTest} 
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white mr-2"
      >
        🔁 Re-run Tests
      </button>
      
      <button 
        onClick={() => {
          addTestResult('🔄 Refreshing auth status...');
          window.location.reload();
        }} 
        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
      >
        🔄 Refresh Page
      </button>
    </div>
  );
};

export default AdminFixDebugPanel;