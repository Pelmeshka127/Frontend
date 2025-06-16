import { UnstyledButton, Group, Avatar, Box, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';


interface ChatsProps {
  chats: { chatId: number; companion: { userId: number; nickname: string; firstname?: string; secondname?: string; profilePictureLink?: string } }[];
  unreadChats: Set<number>;
  onSelectChat: (chatId: number, companionId: number) => void;
  selectedChatId?: number | null;
}

const Chats = ({ chats, unreadChats, onSelectChat, selectedChatId }: ChatsProps) => {
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

  console.log('Исходный chats:', chats.map(c => c.companion.nickname));
  console.log('currentNickname:', currentNickname);

  const sortedChats = [...chats].sort((a, b) => {
    if (a.companion.nickname === currentNickname) return -1;
    if (b.companion.nickname === currentNickname) return 1;

    const aUnread = unreadChats.has(a.chatId);
    const bUnread = unreadChats.has(b.chatId);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;

    return 0;
  });

  console.log('Отсортированный chats:', sortedChats.map(c => c.companion.nickname));
  console.log('unreadChats:', Array.from(unreadChats));
  sortedChats.forEach(c => {
    console.log(`chatId: ${c.chatId}, unread: ${unreadChats.has(c.chatId)}`);
  });

  return (
    <>
      {sortedChats.length === 0 ? (
        <p>Нет доступных чатов</p>
      ) : (
        sortedChats.map(({ chatId, companion }) => {
          const isSelected = selectedChatId === chatId;
          return (
            <UnstyledButton
              key={chatId}
              onClick={() => onSelectChat(chatId, companion.userId)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 0',
                background: isSelected ? 'var(--mantine-color-blue-7)' : undefined,
                color: isSelected ? 'white' : undefined,
                borderRadius: 0,
                fontWeight: isSelected ? 600 : undefined,
                outline: 'none',
                boxShadow: 'none',
              }}
            >
              <Group>
                <Avatar src={companion.profilePictureLink || defaultProfilePicture} size="md" radius="xl" style={{ marginLeft: 12 }} />
                <Box style={{ flex: 1, marginLeft: 12 }}>
                  <Text size="md" fw={700} c="white">
                    {companion.nickname}
                  </Text>
                  <Text size="sm" c="white">
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
