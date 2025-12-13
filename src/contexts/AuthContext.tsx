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
  clearAuthState: () => void;
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

  const clearAuthState = () => {
    console.log('🔐 AuthContext: Clearing auth state');
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');
    refreshUser();
    
    // Set up auth state listener with immediate response
    let lastKnownUserId = null;
    let authCheckInterval = null;
    
    const checkAuthState = async () => {
      try {
        const currentUser = await auth.getUser();
        const user_id = currentUser?.userUuid || currentUser?.id;
        
        // Check if user ID actually changed
        if (user_id !== lastKnownUserId) {
          console.log('🔐 AuthContext: USER STATE CHANGED', {
            from: lastKnownUserId,
            to: user_id,
            email: currentUser?.email
          });
          
          lastKnownUserId = user_id;
          
          // Force immediate state update
          if (user_id && user_id !== 'UNKNOWN') {
            // Normalized user object for consistency
            const normalizedUser = currentUser ? {
              ...currentUser,
              id: user_id
            } : null;
            
            setUser(normalizedUser);
            console.log('✅ AuthContext: User state updated immediately');
          } else {
            console.log('🔐 AuthContext: User logged out');
            setUser(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        // Check if this is a logout (not authenticated)
        if (error.message?.includes('User not authenticated') && lastKnownUserId !== null) {
          console.log('🔐 AuthContext: User session ended');
          lastKnownUserId = null;
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    // Check auth state every 200ms for immediate updates, then slow down
    let checkCount = 0;
    authCheckInterval = setInterval(() => {
      checkAuthState();
      checkCount++;
      
      // Slow down after initial checks to reduce load
      if (checkCount === 20) { // After 4 seconds
        clearInterval(authCheckInterval);
        authCheckInterval = setInterval(checkAuthState, 1000); // Check every second
      }
    }, 200);
    
    // Cleanup
    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    refreshUser,
    clearAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };