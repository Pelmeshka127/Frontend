import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../../api/ws';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    nickname: string;
    firstname: string;
    secondname: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<void>;
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
        // Добавляем currentUser в companions, если его там нет
        const userId = data.currentUser?.userId;
        if (userId && !data.companions.some((c: any) => c.userId === userId)) {
          data.companions = [...data.companions, data.currentUser];
        }
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
    const userId = sessionInfo.currentUser?.userId;
    if (userId && !sessionInfo.companions.some((c: any) => c.userId === userId)) {
      sessionInfo.companions = [...sessionInfo.companions, sessionInfo.currentUser];
    }

    localStorage.setItem('userData', JSON.stringify(sessionInfo));
    setIsAuthenticated(true);
    connectWebSocket();
  };

  const register = async (userData: {
    nickname: string;
    firstname: string;
    secondname: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    const response = await fetch(`api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    await login(userData.nickname, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    disconnectWebSocket();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading }}>
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