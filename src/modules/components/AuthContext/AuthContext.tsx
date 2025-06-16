// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { connectWebSocket, disconnectWebSocket, subscribeToUserEvents } from '../../api/ws';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сессию и обновляем userData при старте
    fetch('/api/session/info', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('userData');
          throw new Error('No session');
        }
      })
      .then(data => {
        localStorage.setItem('userData', JSON.stringify(data));
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('userData');
      })
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

  const login = async (username: string, password: string) => {
    // 1. Логин
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Login failed');

    // 2. Получаем session info
    const sessionInfoResp = await fetch('/api/session/info', { credentials: 'include' });
    if (!sessionInfoResp.ok) throw new Error('Failed to fetch session info');
    const sessionInfo = await sessionInfoResp.json();

    // 3. Сохраняем в localStorage
    localStorage.setItem('userData', JSON.stringify(sessionInfo));

    // 4. Ставим isAuthenticated
    setIsAuthenticated(true);
    connectWebSocket();
  };

  const logout = () => {
    localStorage.removeItem('userData');
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
