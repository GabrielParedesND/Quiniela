'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId, signOut } from '@/lib/auth/cognito';
import { getUserProfile, UserProfile, SessionExpiredError } from '@/lib/db/users';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSessionExpired = () => {
    signOut();
    setUser(null);
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    router.push('/');
  };

  const loadUser = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userId = await getUserId();
      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        handleSessionExpired();
      } else {
        console.error('Error loading user:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
