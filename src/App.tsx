import './App.css';
import '@mantine/core/styles.css';
import { Routes, Route } from 'react-router-dom';
import { User } from './modules/components/User/index';
import { NoMatch } from './components/NoMatch';
import { Home } from './modules/components/Home';
import { Chat, Chats } from './modules/components/Chat';
import { Contact } from './modules/components/Contacts';
import { MantineProvider } from '@mantine/core';

const App = () => {
  return (
    <MantineProvider>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/user' element={<User />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/chats' element={<Chats />} />
        <Route path='/contacts' element={<Contact />} />
        <Route path='*' element={<NoMatch />} />
      </Routes>
    </MantineProvider>
  );
};

export default App;