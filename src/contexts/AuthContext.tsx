import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@/lib/shared/kliv-auth.js';

interface UserData {
  userUuid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log('🔐 AuthContext: Refreshing user...');
      const currentUser = await auth.getUser();
      
      // CRITICAL: Log complete user object to see what we actually get
      console.log('🔐 AuthContext: RAW USER OBJECT FROM auth.getUser():', currentUser);
      console.log('🔐 AuthContext: User object keys:', currentUser ? Object.keys(currentUser) : 'null');
      console.log('🔐 AuthContext: User object stringified:', JSON.stringify(currentUser, null, 2));
      
      // Kliv auth uses userUuid field - normalize for consistency
      console.log('🔐 AuthContext: ID FIELD CHECK:', {
        userUuid: currentUser?.userUuid,
        id: currentUser?.id, // fallback
        email: currentUser?.email
      });
      
      // Use userUuid from Kliv auth as primary ID, fallback to legacy id field
      const user_id = currentUser?.userUuid || currentUser?.id;
      
      // Normalize user object to ensure we always have an `id` field for compatibility
      const normalizedUser = currentUser ? {
        ...currentUser,
        id: user_id || 'UNKNOWN' // Map userUuid to id for downstream compatibility
      } : null;
      
      console.log('🔐 AuthContext: NORMALIZED USER:', normalizedUser);
      console.log('🔐 AUTH READY - FINAL user.id:', normalizedUser?.id, 'original userUuid:', currentUser?.userUuid);
      
      setUser(normalizedUser);
    } catch (error) {
      console.error('🔐 AuthContext: Failed to refresh user:', error);
      console.error('🔐 AuthContext: Error details:', JSON.stringify(error, null, 2));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');
    refreshUser();
    
    // Set up auth state listener
    const setupAuthListener = async () => {
      try {
        // In Kliv, we need to poll for auth state changes
        const checkAuthState = async () => {
          try {
            const currentUser = await auth.getUser();
            
            // Only update if the auth state actually changed
            if (currentUser?.userUuid !== user?.userUuid || 
                currentUser?.id !== user?.id ||
                currentUser?.email !== user?.email) {
              console.log('🔐 AuthContext: Auth state changed detected, refreshing...');
              refreshUser();
            }
          } catch (error) {
            // User logged out
            if (error.message.includes('User not authenticated') && user) {
              console.log('🔐 AuthContext: User logged out detected');
              setUser(null);
            }
          }
        };
        
        // Check auth state every 2 seconds to catch sign in/out
        const interval = setInterval(checkAuthState, 2000);
        
        // Cleanup listener
        return () => clearInterval(interval);
      } catch (error) {
        console.error('🔐 AuthContext: Failed to set up auth listener', error);
      }
    };
    
    const cleanup = setupAuthListener();
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
}, []);

  const value: AuthContextType = {
    user,
    loading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };