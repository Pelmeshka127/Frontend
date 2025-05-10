import { Box, Text, Stack, Paper, Flex, useMantineTheme } from '@mantine/core';

interface MessageProps {
  avatar?: string;
  nickname: string;
  message: string;
  time: string;
  date: string;
  isCurrentUser: boolean;
  isActive: boolean
}

export function ChatMessage({ message, time, date, isCurrentUser }: MessageProps) {
  const theme = useMantineTheme();

  return (
    <Box
      mx="md"
      mb="sm"
      style={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
      }}
    >
      <Paper
        p="sm"
        radius="md"
        shadow="sm"
        withBorder
        maw="80%"
        bg={isCurrentUser ? theme.colors.cyan[6] : theme.colors.gray[1]}
      >
        <Stack gap={2} style={{ textAlign: 'left' }}>
          <Text
            size="sm"
            style={{ wordBreak: 'break-word' }}
            c={isCurrentUser ? 'white' : undefined}
          >
            {message}
          </Text>


          <Flex justify="flex-end">
            <Text size="xs" c={isCurrentUser ? 'white' : 'dimmed'}>
              {time} • {date}
            </Text>
          </Flex>
        
        </Stack>
      </Paper>
    </Box>
  );
}