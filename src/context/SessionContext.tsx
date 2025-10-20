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
  const navigate = useNavigate();

  const handleToken = (token: string) => {
    setUser(jwtDecode(token));
  };

  useEffect(() => {
    async function loadUserFromStorage() {
      if (user) {
        setIsLoading(false);
        return;
      }

      const token = await validateToken();

      if (!token) {
        navigate('/ingresar', { replace: true });
        return;
      }

      handleToken(token);
      setIsLoading(false);
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
