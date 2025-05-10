import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Text, Paper, Center, Avatar, ActionIcon } from '@mantine/core';
import defaultProfilePicture from '../../../assets/default_profile_picture.png';

interface User {
  userId: number;
  nickname: string;
  firstname: string;
  secondname: string;
  profilePictureLink: string;
  dateOfBirth: string;
  phone: string;
  email: string
}

interface UserModalProps {
    user: User 
}

export function UserModal({user}: UserModalProps) {
    const [opened, { open, close }] = useDisclosure(false);

    console.log(user.profilePictureLink)
  
    return (
    <>
      <Modal opened={opened} onClose={close} title="Modal" centered>
        <Text>
        Text
      </Text>

      </Modal>

      <ActionIcon radius="xl" size="xl" color='white'>
        <Avatar onClick={open}
          src={user.profilePictureLink}
          alt={defaultProfilePicture}
        />
      </ActionIcon>
    </>
  );
}