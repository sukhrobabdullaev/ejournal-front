import React, { createContext, useContext, useState, useEffect } from 'react';
import { TokenManager, type User } from '../lib/api';
import { getCurrentUser } from '../lib/queries-api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  loading: false,
  user: null,
});

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const token = TokenManager.getAccessToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      const currentUser = await getCurrentUser();
      if (!isMounted) {
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoading(false);
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loading: isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
