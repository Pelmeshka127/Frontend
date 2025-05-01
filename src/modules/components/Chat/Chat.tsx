import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, getCurrentUser } from '../../api/getUser';
import { getMessages, sendMessage } from '../../api/getMessage';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';

interface Message {
    messageId: number;
    senderId: number;
    content: string;
    sendDttm: string;
}

const Chat = () => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const companionId = searchParams.get("id") ? +searchParams.get("id")! : 0;
    const queryClient = useQueryClient();
    const chatId: number = parseInt(searchParams.get("chatId") || "");

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        staleTime: Infinity,
    });

    const { data: companion } = useQuery({
        queryKey: ['companion', companionId],
        queryFn: () => getUserById(companionId),
        enabled: !!companionId,
        select: (user) => ({
            ...user,
            profilePictureLink: user.profilePictureLink || defaultProfilePicture
        }),
        staleTime: Infinity,
    });

    const {
        data: messages = [],
        isLoading: loadingMessages,
    } = useQuery({
        queryKey: ['messages', chatId],
        queryFn: () => getMessages(chatId),
        refetchInterval: 5000,
        initialData: () => {
            return queryClient.getQueryData<Message[]>(['messages', chatId]);
        },
    });

    const messageMutation = useMutation({
        mutationFn: (text: string) => {
            if (!currentUser) throw new Error('Current user not loaded');
            return sendMessage(chatId, currentUser.userId, text);
        },
        onMutate: async (text) => {
            await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

            const previousMessages = queryClient.getQueryData<Message[]>(['messages', chatId]);

            const optimisticMessage: Message = {
                messageId: Date.now(),
                senderId: currentUser!.userId,
                content: text,
                sendDttm: new Date().toISOString(),
            };

            queryClient.setQueryData<Message[]>(['messages', chatId], (old = []) => [
                ...old,
                optimisticMessage,
            ]);

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 0);

            return { previousMessages };
        },
        onError: (err, newMessage, context) => {
            queryClient.setQueryData(['messages', chatId], context?.previousMessages);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            setNewMessage('');
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        messageMutation.mutate(newMessage);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
        };
    };

    if (!chatId) {
        return <div className="error-message">Чат не найден</div>;
    }

    if (!currentUser || !companion) {
        return <div className="error-message">Ошибка загрузки данных</div>;
    }

    if (currentUser.userId === companionId) {
        return <div className='error-message'>Нельзя писать самому себе</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <img
                    src={companion.profilePictureLink}
                    alt={companion.nickname}
                    className="avatar"
                    onError={(e) => {
                        e.currentTarget.src = defaultProfilePicture;
                    }}
                />
                <div className="header-info">
                    <h2>{companion.nickname}</h2>
                    <p>Диалог с {companion.nickname}</p>
                </div>
            </div>

            <div className="messages-container">
                {loadingMessages && messages.length === 0 ? (
                    <div className="loading-message">Загрузка сообщений...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-chat">Нет сообщений. Начните диалог!</div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = message.senderId === currentUser.userId;
                        const sender = isCurrentUser ? currentUser : companion;
                        const { time, date } = formatDateTime(message.sendDttm);

                        return (
                            <div
                                key={message.messageId}
                                className={`message-container ${isCurrentUser ? 'current-user' : 'companion'}`}
                            >
                                <div className="message-header">
                                    <div className="sender-info">
                                        <span className="sender-name">{sender.nickname}</span>
                                        <span className="message-time">{time} • {date}</span>
                                    </div>
                                </div>
                                <div className="message-content">
                                    <p className="message-text">{message.content}</p>
                                </div>
                            </div>
                        );
                    })
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
                    disabled={messageMutation.isPending}
                />
                <button 
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim() || messageMutation.isPending}
                >
                    {messageMutation.isPending ? 'Отправка...' : 'Отправить'}
                </button>
            </form>
        </div>
    );
};

export { Chat }