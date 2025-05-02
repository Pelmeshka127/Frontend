import { Avatar, Box, Group, Text, Paper, Stack, useMantineTheme, Title, Divider } from '@mantine/core';

import defaultProfilePicture from '../../../assets/default_profile_picture.png';

interface MessageProps {
  avatar: string;
  nickname: string;
  message: string;
  time: string;
  date: string;
  isCurrentUser: boolean;
}

export function ChatMessage({ avatar, nickname, message, time, date, isCurrentUser }: MessageProps) {
  const theme = useMantineTheme();
  
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: 'md',
      }}
    >
      <Paper
        withBorder={true}
        p="sm"
        radius="md"
        shadow="sm"
        style={{
          maxWidth: '90%'
        }}
      >
        <Stack>
          <Group>
            {!isCurrentUser && (
              <Avatar 
                src={avatar} 
                size="sm" 
                radius="xl" 
                alt={defaultProfilePicture}
              />
            )}
            
            <Title
                order={5}
            >
              {nickname}
            </Title>
            
            <Text size="xs" >
                {time} • {date}
            </Text>
          </Group>
          
            <Divider/>

          <Text 
            size="sm"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}