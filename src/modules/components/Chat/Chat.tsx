import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, getCurrentUser } from '../../api/getUser';
import { getMessages, sendMessage } from '../../api/getMessage';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';

import { ScrollArea, Avatar, Group, Divider, Stack, Box, Button, Textarea } from '@mantine/core';
import { ChatMessage } from '../ChatMessage';

interface Message {
    messageId: number;
    senderId: number;
    content: string;
    sendDttm: string;
}

interface ChatProps {
  chatId: number;
  companionId: number;
}

const Chat: React.FC<ChatProps> = ({ chatId, companionId }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
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
        <Stack className="chat-container">
            <Group className="chat-header">
                <Avatar
                    src={companion.profilePictureLink}
                    alt={defaultProfilePicture}
                />

                <div className="header-info">
                    <h3>{companion.nickname}</h3>
                </div>
            </Group>

            <Divider/>
            
            <ScrollArea className="messages-container" w="100vh" h="65vh">
                {loadingMessages && messages.length === 0 ? (
                    <div className="loading-message">Загрузка сообщений...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-chat">Нет сообщений. Начните диалог!</div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = message.senderId === currentUser.userId;
                        const { time, date } = formatDateTime(message.sendDttm);
                        const senderNickname = isCurrentUser ? currentUser.nickname : companion.nickname
                        
                        return (
                            <ChatMessage
                                avatar={companion.profilePictureLink}
                                nickname={senderNickname}
                                message={message.content}
                                time={time}
                                date={date}
                                isCurrentUser={isCurrentUser}
                            />
                        )
                    })
                )}
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
                    disabled={messageMutation.isPending}
                />
        
                <Button
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim() || messageMutation.isPending}
                >
                    {messageMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
                </Box>
        </Box>
        </Stack>
    );
};

export { Chat };