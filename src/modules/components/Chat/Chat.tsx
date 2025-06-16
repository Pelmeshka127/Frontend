import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserById, getCurrentUser } from '../../api/getUser';
import {
  sendMessage,
  getLastNMessagesWithText,
  getNMessagesBeforeMessageWithText,
  MessageWithTextDto
} from '../../api/getMessage';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';
import { ScrollArea, Group, Divider, Stack, Box, Button, Textarea } from '@mantine/core';
import { ChatMessage } from '../ChatMessage';
import { UserModal } from '../UserModal';

interface ChatProps {
  chatId: number;
  companionId: number;
  addMessageToChatRef?: React.MutableRefObject<null | ((chatId: number, message: any) => void)>;
}

const PAGE_SIZE = 40;

const Chat: React.FC<ChatProps> = ({ chatId, companionId, addMessageToChatRef }) => {
  const [messages, setMessages] = useState<MessageWithTextDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  // refs для корректировки скролла при подгрузке
  const oldScrollHeightRef = useRef<number | null>(null);
  const oldScrollTopRef = useRef<number | null>(null);
  const loadingMoreRef = useRef(false);
  const [optimisticId, setOptimisticId] = useState<number | null>(null);
  const prevMessagesLength = useRef(messages.length);

  const userDataRaw = localStorage.getItem('userData');
  let currentUser = null;
  let companions = [];
  if (userDataRaw) {
    try {
      const parsed = JSON.parse(userDataRaw);
      currentUser = parsed.currentUser;
      companions = parsed.companions || [];
    } catch {}
  }
  const companion = companions.find((c: any) => c.userId === companionId);

  useEffect(() => {
    // setMessages([]); // Убрать эту строку!
  }, [chatId, companionId]);

  // Загрузка последних сообщений при открытии чата
  useEffect(() => {
    setLoading(true);
    getLastNMessagesWithText(chatId, PAGE_SIZE)
      .then(msgs => {
        setMessages(msgs.reverse());
        setHasMore(msgs.length === PAGE_SIZE);
        // Прокрутка вниз после первой загрузки
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 0);
      })
      .finally(() => setLoading(false));
  }, [chatId]);

  // Скролл вниз после первой загрузки сообщений
  useEffect(() => {
    if (messages.length > 0 && messages.length <= PAGE_SIZE) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  // Подгрузка старых сообщений
  const loadMore = async () => {
    if (!hasMore || loading || messages.length === 0) return;
    setLoading(true);

    // Сохраняем высоту и позицию скролла до подгрузки в ref
    if (scrollRef.current) {
      oldScrollHeightRef.current = scrollRef.current.scrollHeight;
      oldScrollTopRef.current = scrollRef.current.scrollTop;
    } else {
      oldScrollHeightRef.current = null;
      oldScrollTopRef.current = null;
    }
    loadingMoreRef.current = true;

    const firstMsgId = messages[0].messageId;
    const older = await getNMessagesBeforeMessageWithText(chatId, firstMsgId, PAGE_SIZE);

    setMessages(prev => {
      const next = [...older.reverse(), ...prev];
      return next;
    });
    setHasMore(older.length === PAGE_SIZE);
    setLoading(false);

    // Скролл теперь будет корректироваться в useLayoutEffect
    // (убираем requestAnimationFrame отсюда)
  };

  // Корректировка скролла после подгрузки старых сообщений
  useLayoutEffect(() => {
    if (loadingMoreRef.current && scrollRef.current && oldScrollHeightRef.current !== null && oldScrollTopRef.current !== null) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTop = newScrollHeight - oldScrollHeightRef.current + oldScrollTopRef.current;
      // Сбросить флаги
      loadingMoreRef.current = false;
      oldScrollHeightRef.current = null;
      oldScrollTopRef.current = null;
    }
  }, [messages]);

  // Отправка сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    setLoading(true);
    try {
      await sendMessage(chatId, currentUser.userId, newMessage);
      setNewMessage('');
      setShouldScrollToBottom(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  // Скролл вниз только после отправки или получения нового сообщения
  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    if (optimisticId !== null) {
      const timer = setTimeout(() => setOptimisticId(null), 400);
      return () => clearTimeout(timer);
    }
  }, [optimisticId]);

  // При монтировании/смене чата регистрируем функцию для добавления сообщения
  useEffect(() => {
    if (addMessageToChatRef) {
      addMessageToChatRef.current = (incomingChatId, message) => {
        if (incomingChatId === chatId) {
          setMessages(prev => {
            if (prev.some(m => m.messageId === message.messageId)) return prev;
            return [...prev, message];
          });
          setShouldScrollToBottom(true);
        }
      };
      return () => {
        addMessageToChatRef.current = null;
      };
    }
  }, [chatId, addMessageToChatRef]);

  if (!chatId) return <div className="error-message">Чат не найден</div>;
  if (!currentUser || !companion) return <div className="error-message">Ошибка загрузки данных</div>;
  if (currentUser.userId === companionId) return <div className='error-message'>Нельзя писать самому себе</div>;

  return (
    <Stack className="chat-container">
      <Group className="chat-header">
        <UserModal otherUser={companion} currentUser={currentUser} />
        <div className="header-info">
          <h3>{companion.nickname}</h3>
        </div>
      </Group>
      <Divider />
      <ScrollArea
        className="messages-container"
        w="100vh"
        h="65vh"
        viewportRef={scrollRef}
      >
        {/* Кнопка подгрузки */}
        {hasMore && (
          <Box style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <Button
              size="xs"
              onClick={loadMore}
              disabled={loading}
              variant="light"
            >
              Загрузить ещё
            </Button>
          </Box>
        )}

        {/* Список сообщений */}
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser.userId;
          const { time, date } = formatDateTime(message.sendDttm);
          const senderNickname = isCurrentUser ? currentUser.nickname : companion.nickname;
          const className = message.messageId === optimisticId ? 'chat-message-appear' : '';
          return (
            <ChatMessage
              key={message.messageId}
              avatar={companion.profilePictureLink || defaultProfilePicture}
              nickname={senderNickname}
              message={message.text}
              time={time}
              date={date}
              isCurrentUser={isCurrentUser}
              isActive={companion.isActive}
              className={className}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <Box component='form' onSubmit={handleSendMessage}>
        <Box style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <Textarea
            style={{ flex: 1 }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your message"
            className="message-input"
            disabled={loading}
          />
          <Button
            type="submit"
            className="send-button"
            disabled={!newMessage.trim() || loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
};

export { Chat };