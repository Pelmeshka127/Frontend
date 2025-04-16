import { Link } from 'react-router-dom';
import './Home.css';
import { useEffect, useState } from 'react';
import getCurrentUser from '../../api/getCurrentUser';

interface User {
  userId: number
}

const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser()
    .then(json => {
        setUser(json)
      })
    }
  )

  return (
    <div className="home-container">
      <div className="content">
          <h1>Добро пожаловать в КлиМакс!</h1>
      </div>
      <nav className="top-nav">
        <Link to={`/user?id=${user?.userId}`} className="nav-button">
          Мой профиль
        </Link>
        <Link to="/chats" className="nav-button">
          Чаты
        </Link>
      </nav>
    </div>
  );
};

export default Home;