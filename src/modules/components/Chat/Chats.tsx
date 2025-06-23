import React, { useState } from 'react';
import { UnstyledButton, Group, Avatar, Box, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';


interface ChatsProps {
  chats: { chatId: number; companion: { userId: number; nickname: string; firstname?: string; secondname?: string; profilePictureLink?: string } }[];
  unreadChats: Set<number>;
  selectedChatId?: number | null;
  onSelectChat: (chatId: number, companionId: number) => void;
}

const Chats = ({ chats, unreadChats, selectedChatId, onSelectChat }: ChatsProps) => {
  let currentNickname = '';
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      currentNickname = parsed.currentUser.nickname;
    }
  } catch (e) {
    console.error('localStorage error:', e);
  }

  const sortedChats = [...chats].sort((a, b) => {
    if (a.companion.nickname === currentNickname) return -1;
    if (b.companion.nickname === currentNickname) return 1;

    const aUnread = unreadChats.has(a.chatId);
    const bUnread = unreadChats.has(b.chatId);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;

    return 0;
  });

  return (
    <>
      {sortedChats.length === 0 ? (
        <p>Нет доступных чатов</p>
      ) : (
        sortedChats.map(({ chatId, companion }) => {
          const isSelected = Number(selectedChatId) === Number(chatId);
          return (
            <UnstyledButton
              key={chatId}
              onClick={() => onSelectChat(chatId, companion.userId)}
              className={isSelected ? 'chat-selected' : 'chat-unselected'}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 0',
                backgroundColor: isSelected ? 'var(--mantine-color-blue-7)' : 'transparent',
                borderRadius: 0,
                fontWeight: isSelected ? 600 : 400,
                outline: 'none',
                boxShadow: 'none',
              }}
            >
              <Group>
                <Avatar src={companion.profilePictureLink || defaultProfilePicture} size="md" radius="xl" style={{ marginLeft: 12 }} />
                <Box style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    size="md"
                    fw={700}
                    style={{ color: isSelected ? 'white' : '#1a1a1a', transition: 'color 0.2s' }}
                  >
                    {companion.nickname}
                  </Text>
                  <Text
                    size="sm"
                    style={{ color:  'white' }}
                  >
                    {companion.firstname && companion.secondname
                      ? `${companion.firstname} ${companion.secondname}`
                      : companion.nickname}
                  </Text>
                </Box>
                {unreadChats.has(chatId) && (
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'red',
                    marginLeft: 4
                  }} title="Есть новые сообщения" />
                )}
                <IconChevronRight size={16} color={isSelected ? 'white' : undefined} />
              </Group>
            </UnstyledButton>
          );
        })
      )}
    </>
  );
};

export { Chats };
