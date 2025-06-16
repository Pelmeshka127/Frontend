import { UnstyledButton, Group, Avatar, Box, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';


interface ChatsProps {
  chats: { chatId: number; companion: { userId: number; nickname: string; firstname?: string; secondname?: string; profilePictureLink?: string } }[];
  unreadChats: Set<number>;
  onSelectChat: (chatId: number, companionId: number) => void;
  selectedChatId?: number | null;
}

const Chats = ({ chats, unreadChats, onSelectChat, selectedChatId }: ChatsProps) => (
  <>
    {chats.length === 0 ? (
      <p>Нет доступных чатов</p>
    ) : (
      chats.map(({ chatId, companion }) => {
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

export { Chats };
