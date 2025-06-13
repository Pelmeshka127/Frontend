// App.tsx
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User } from './modules/components/User/index';
import { NoMatch } from './components/NoMatch';
import { Home } from './modules/components/Home';
import { Chat, Chats } from './modules/components/Chat';
import { Contact } from './modules/components/Contacts';
import LoginForm from './modules/components/LoginForm';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { AuthProvider, useAuth } from './modules/components/AuthContext/AuthContext'; // Импортируем AuthProvider и useAuth

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/user" element={isAuthenticated ? <User /> : <Navigate to="/login" replace />} />
      <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />} />
      <Route path="/chats" element={isAuthenticated ? <Chats /> : <Navigate to="/login" replace />} />
      <Route path="/contacts" element={isAuthenticated ? <Contact /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<NoMatch />} />
    </Routes>
  );
};

const App = () => {
  return (
    <MantineProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MantineProvider>
  );
};

export default App;