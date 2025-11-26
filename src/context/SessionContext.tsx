import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';
import { validateToken } from '@/client/auth';

export type SessionContextType = {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleToken: (token: string) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const handleToken = (token: string) => {
    setUser(jwtDecode(token));
  };

  useEffect(() => {
    async function loadUserFromStorage() {
      setIsLoading(true);
      try {
        if (user) {
          return;
        }

        const token = await validateToken();

        if (token) {
          handleToken(token);
        }
      } catch (error) {
        // On any error validating the token, remain unauthenticated for public routes
      } finally {
        // Always clear loading state
        setIsLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  return (
    <SessionContext.Provider value={{ user, isAuthenticated, isLoading, handleToken }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSessionContext debe usarse dentro de SessionProvider');
  return context;
};
