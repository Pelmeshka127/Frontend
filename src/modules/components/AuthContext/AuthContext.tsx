// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../../api/ws';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (nickname: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сессию при старте
    fetch('/api/user/current', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
    // Отключаем WS при размонтировании
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated]);

  const login = (nickname: string) => {
    localStorage.setItem('currentUser', nickname);
    setIsAuthenticated(true);
    connectWebSocket();
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    disconnectWebSocket();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};