'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId, signOut, getUserAttributes } from '@/lib/auth/cognito';
import { getUserProfile, UserProfile, SessionExpiredError, saveUserProfile } from '@/lib/db/users';

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
    // Only sign out if we can confirm the session is truly expired
    // by checking if Cognito still has valid tokens
    isAuthenticated().then((stillValid) => {
      if (!stillValid) {
        signOut();
        setUser(null);
        router.push('/');
      }
      // If still valid, the error was likely a transient DynamoDB issue, not a real session expiry
    });
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
      
      // Ensure email is synced from Cognito to DynamoDB on every session
      if (profile && !profile.email) {
        try {
          const attrs = await getUserAttributes();
          if (attrs?.email) {
            profile.email = attrs.email;
            await saveUserProfile(profile);
          }
        } catch {
          // Cognito attributes not available — skip email sync
        }
      }

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
