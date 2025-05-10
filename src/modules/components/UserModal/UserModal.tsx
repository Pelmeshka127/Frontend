import { useDisclosure } from '@mantine/hooks';
import { useMantineTheme, Modal, Button, Text, Avatar, ActionIcon, Badge, Card, Group, Stack } from '@mantine/core';
import { IconAt, IconCake, IconPhoneCall } from '@tabler/icons-react';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';

interface User {
  userId: number;
  nickname: string;
  firstname: string;
  secondname: string;
  profilePictureLink: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  active: boolean;
}

interface UserModalProps {
  otherUser: User;
  currentUser: User;
}

export function UserModal({ otherUser, currentUser }: UserModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();

  return (
    <>
      <Modal opened={opened} onClose={close} centered withCloseButton={false}>
        <Card radius="md" p="md">
          <Card.Section>
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <Avatar size="xl" src={otherUser.profilePictureLink} alt={defaultProfilePicture} />
              
              <Stack gap={2} mt={-2}>
                <Text fz="lg" fw={500} lh={1.2}>
                  @{otherUser.nickname}
                </Text>
                <Text fz="sm" c="dimmed" lh={1.2}>
                  {otherUser.firstname} {otherUser.secondname}
                </Text>
                <Badge 
                  size="sm" 
                  variant="light" 
                  color={otherUser.active ? theme.colors.lime[9] : theme.colors.red[9]}
                  mt={2}
                >
                  {otherUser.active ? "ONLINE" : "OFFLINE"}
                </Badge>
              </Stack>
            </Group>
          </Card.Section>

          <Card.Section mt="sm">
            <Stack gap={3}>
              <Group wrap="nowrap" gap={8} align="center">
                <IconAt stroke={1.5} size={16} />
                <Text fz="sm">{otherUser.email}</Text>
              </Group>

              <Group wrap="nowrap" gap={8} align="center">
                <IconPhoneCall stroke={1.5} size={16} />
                <Text fz="sm">{otherUser.phone}</Text>
              </Group>

              <Group wrap="nowrap" gap={8} align="center">
                <IconCake stroke={1.5} size={16} />
                <Text fz="sm">{otherUser.dateOfBirth}</Text>
              </Group>
            </Stack>
          </Card.Section>

          
          {otherUser.userId != currentUser.userId && (
            <Group mt="md">
              <Button radius="md" fullWidth>
                Add to contacts
              </Button>
            </Group>
          )}
        </Card>
      </Modal>

      <ActionIcon radius="xl" size="xl" color="white">
        <Avatar onClick={open} src={otherUser.profilePictureLink} alt={defaultProfilePicture} />
      </ActionIcon>
    </>
  );
}