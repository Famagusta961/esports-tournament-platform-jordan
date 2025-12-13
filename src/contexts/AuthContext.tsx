import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@/lib/shared/kliv-auth.js';

interface UserData {
  id?: string;
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
      
      // Check all possible ID fields
      console.log('🔐 AuthContext: ID FIELD CHECK:', {
        id: currentUser?.id,
        uuid: currentUser?.uuid,
        _id: currentUser?._id,
        userId: currentUser?.userId,
        user_id: currentUser?.user_id,
        sub: currentUser?.sub
      });
      
      // Determine which field to use as the user ID
      const user_id = currentUser?.id || currentUser?.uuid || currentUser?._id || currentUser?.userId || currentUser?.user_id || currentUser?.sub;
      
      // Normalize user object to ensure we always have an `id` field
      const normalizedUser = currentUser ? {
        ...currentUser,
        id: user_id || 'UNKNOWN'
      } : null;
      
      console.log('🔐 AuthContext: NORMALIZED USER:', normalizedUser);
      console.log('🔐 AUTH READY - FINAL user.id:', normalizedUser?.id);
      
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