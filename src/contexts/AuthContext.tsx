import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useClerk, useAuth as useClerkAuth, useUser } from '@clerk/nextjs';

interface User {
  id: string;
  username?: string;
  imageUrl?: string;
  publicMetadata?: {
    bio?: string;
    [key: string]: any;
  };
  // Add other user properties as needed
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setUser(clerkUser ? {
        id: clerkUser.id,
        username: clerkUser.username || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
        publicMetadata: clerkUser.publicMetadata || {}
      } : null);
    }
  }, [clerkUser, isLoaded]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 