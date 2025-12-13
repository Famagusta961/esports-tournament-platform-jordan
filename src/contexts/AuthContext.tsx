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
    
    // Set up more frequent auth state listener for immediate updates
    let lastAuthCheck = 0;
    const checkAuthState = async () => {
      try {
        const now = Date.now();
        // Throttle to every 100ms for near-instant updates
        if (now - lastAuthCheck < 100) return;
        lastAuthCheck = now;
        
        const currentUser = await auth.getUser();
        const user_id = currentUser?.userUuid || currentUser?.id;
        const currentUserId = user?.userUuid || user?.id;
        
        // Only update if the auth state actually changed
        if (user_id !== currentUserId || 
            currentUser?.email !== user?.email) {
          console.log('🔐 AuthContext: Auth state changed detected', {
            from: { id: currentUserId, email: user?.email },
            to: { id: user_id, email: currentUser?.email }
          });
          refreshUser();
        }
      } catch (error) {
        // User logged out
        if (error.message?.includes('User not authenticated') && user) {
          console.log('🔐 AuthContext: User logged out detected');
          setUser(null);
        }
      }
    };
    
    // Check auth state every 100ms for near-instant UI updates
    const interval = setInterval(checkAuthState, 100);
    
    return () => clearInterval(interval);
  }, [user]);

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