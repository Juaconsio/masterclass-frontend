import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
    const token = localStorage.getItem('token');
    if (token) {
      handleToken(token);
    }
    setIsLoading(false);
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
