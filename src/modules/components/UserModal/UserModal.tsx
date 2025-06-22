import { useMantineTheme, Modal, Button, Text, Avatar, Badge, Card, Group, Stack } from '@mantine/core';
import { IconAt, IconCake, IconPhoneCall, IconMessage } from '@tabler/icons-react';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';

interface DotUser {
  userId: number;
  nickname: string;
  firstname?: string;
  secondname?: string;
  profilePictureLink?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

interface UserModalProps {
  otherUser: DotUser;
  currentUser: DotUser;
  isCompanion: boolean;
  onOpenChat: () => void;
  opened: boolean;
  onClose: () => void;
}

export function UserModal({ 
  otherUser, 
  currentUser, 
  isCompanion,
  onOpenChat,
  opened, 
  onClose 
}: UserModalProps) {
  const theme = useMantineTheme();

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      centered 
      withCloseButton={false}
      size="auto"
    >
      <Card radius="md" p="md">
        <Card.Section p="md">
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <Avatar 
              size="xl" 
              src={otherUser.profilePictureLink || defaultProfilePicture} 
              alt={otherUser.nickname} 
            />
            <Stack gap={2} mt={-2}>
              <Text fz="lg" fw={500} lh={1.2}>
                @{otherUser.nickname}
              </Text>
              <Text fz="sm" c="dimmed" lh={1.2}>
                {otherUser.firstname} {otherUser.secondname}
              </Text>
              {otherUser.active !== undefined && (
                <Badge 
                  size="sm" 
                  variant="light" 
                  color={otherUser.active ? theme.colors.lime[9] : theme.colors.red[9]}
                  mt={2}
                >
                  {otherUser.active ? "ONLINE" : "OFFLINE"}
                </Badge>
              )}
            </Stack>
          </Group>
        </Card.Section>

        <Card.Section p="md">
          <Stack gap={3}>
            {otherUser.email && (
              <Group wrap="nowrap" gap={8} align="center">
                <IconAt stroke={1.5} size={16} />
                <Text fz="sm">{otherUser.email}</Text>
              </Group>
            )}

            {otherUser.phone && (
              <Group wrap="nowrap" gap={8} align="center">
                <IconPhoneCall stroke={1.5} size={16} />
                <Text fz="sm">{otherUser.phone}</Text>
              </Group>
            )}

            {otherUser.dateOfBirth && (
              <Group wrap="nowrap" gap={8} align="center">
                <IconCake stroke={1.5} size={16} />
                <Text fz="sm">{otherUser.dateOfBirth}</Text>
              </Group>
            )}
          </Stack>
        </Card.Section>

        <Group mt="md" grow>
          {otherUser.userId !== currentUser.userId && (
            <Button 
              leftSection={<IconMessage size={18} />}
              radius="md" 
              onClick={isCompanion ? onOpenChat : () => {}}
            >
              {isCompanion ? "Перейти к чату" : "Создать чат"}
            </Button>
          )}
        </Group>
      </Card>
    </Modal>
  );
}