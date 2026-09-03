import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const userId = import.meta.env.VITE_USER_ID;
  
  if (!userId) {
    throw new Error("Falta la configuración del Usuario. Por favor define VITE_USER_ID en tu archivo .env.local");
  }

  // Inicializamos con el usuario definido en las variables de entorno
  const [user] = useState<User | null>({
    id: userId,
    name: 'Propietario'
  });

  return (
    <AuthContext.Provider value={{ user }}>
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
