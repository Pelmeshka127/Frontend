import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import getUserById from '../../api/getUserById';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';
import { User } from '../User';
import getCurrentUser from '../../api/getCurrentUser';

interface Message {
  id: number;
  text: string;
  senderId: number;
  timestamp: Date;
}

const Dialogue = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [companion, setCompanion] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const companionId = searchParams.get("id") ? +searchParams.get("id")! : 0;

  useEffect(() => {
    getCurrentUser()
      .then(json => {
        setCurrentUser(json);
      })
      .catch(error => {
        console.error('Failed to load current user', error);
      });
  }, []);

  useEffect(() => {
    const fetchCompanion = async () => {
      try {
        if (companionId === 0) return;
        
        const user = await getUserById(companionId);
        if (!user.profilePictureLink) {
          user.profilePictureLink = defaultProfilePicture;
        }
        setCompanion(user);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load companion', error);
        setLoading(false);
      }
    };

    fetchCompanion();
  }, [companionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    
    const message: Message = {
      id: Date.now(), 
      text: newMessage,
      senderId: currentUser.userId,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    if (companion) {
      setTimeout(() => {
        const reply: Message = {
          id: Date.now() + 1,
          text: `Это автоматический ответ от пользователя ${companion.nickname}`,
          senderId: companion.userId,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  if (currentUser?.userId === companionId) {
    return <div className='the-same-user-in-chat-error'>It's the same user</div>
  }

  if (loading) {
    return <div className="spinner-container">Loading chat...</div>;
  }

  if (!companion) {
    return <div className="error-overlay">Failed to load companion</div>;
  }

  if (!currentUser) {
    return <div className="error-overlay">Failed to load current user</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img 
          src={companion.profilePictureLink} 
          alt={companion.nickname} 
          className="companion-avatar"
          onError={(e) => {
            e.currentTarget.src = defaultProfilePicture;
          }}
        />
        <div className="chat-header-info">
          <h2>{companion.nickname}</h2>
          <p>Диалог между {currentUser.nickname} и {companion.nickname}</p>
        </div>
      </div>
      
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-chat">Нет сообщений. Начните диалог!</div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.senderId === currentUser.userId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <span className="sender-id">
                  {message.senderId === currentUser.userId ? currentUser.userId : companion.userId}:
                </span>
                <p className="message-text">{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="message-input"
        />
        <button type="submit" className="send-button">Отправить</button>
      </form>
    </div>
  );
};

export default Dialogue;