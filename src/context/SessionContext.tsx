import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

// Ajusta el tipo de usuario según tu modelo
export type SessionContextType = {
  user: any;
  isAuthenticated: boolean;

  // Agrega más funciones/propiedades según lo que necesites
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useAuth();

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSessionContext debe usarse dentro de SessionProvider');
  return context;
};
