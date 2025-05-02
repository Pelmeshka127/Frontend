import { Link } from 'react-router-dom';
import './Home.css';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/getUser';

interface User {
  userId: number
}

const Home = () => {
  const { data: user } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  return (
    <div className="home-container">
      <div className="content">
        <h1>Добро пожаловать в Мессенджер!</h1>
      </div>
      <nav className="top-nav">
        <Link to={`/user?id=${user?.userId}`} className="nav-button">
          Мой профиль
        </Link>
        <Link to="/chats" className="nav-button">
          Чаты
        </Link>
        <Link to="/contacts" className="nav-button">
          Контакты
        </Link>
      </nav>
    </div>
  );
};

export default Home;