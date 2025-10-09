import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export type SessionContextType = {
  user: any;
  isAuthenticated: boolean;
  handleToken: (token: string) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const isAuthenticated = !!user;

  const handleToken = (token: string) => {
    setUser(jwtDecode(token));
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Token encontrado en localStorage, autenticando usuario...');
    handleToken(token);
  }

  return (
    <SessionContext.Provider value={{ user, isAuthenticated, handleToken }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSessionContext debe usarse dentro de SessionProvider');
  return context;
};
