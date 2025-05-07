import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../../api/getUser";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";
//import './user.css';

import { Avatar, Group, Text, Paper } from '@mantine/core';
import { IconAt, IconPhoneCall, IconCake } from '@tabler/icons-react';

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

const User = () => {
  const [searchParams] = useSearchParams();
  const id = +searchParams.get("id")!;

  const { data: user, isLoading, isError, } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
  });

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isError || !user || !user.userId) {
    return (
      <div className="error-overlay">
        <div className="error-modal">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">Failed to load user</p>
        </div>
      </div>
    );
  }

  const profilePicture = user.profilePictureLink || defaultProfilePicture;

  return (
    <div>
      <Paper withBorder={true} p={"md"}>
      <Group wrap="nowrap">
        <Avatar
          src={profilePicture}
          alt={defaultProfilePicture}
          size={94}
          radius="md"
        />
        <div>
          <Text fz="xs" fw={700} c="dimmed">
            @{user.nickname}
          </Text>

          <Text fz="lg" fw={500}>
          {user.firstname} {user.secondname}
          </Text>

          <Group wrap="nowrap" gap={10} mt={3}>
            <IconAt stroke={1.5} size={16}/>
            <Text fz="xs" c="dimmed">
              {user.email}
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={5}>
            <IconPhoneCall stroke={1.5} size={16} />
            <Text fz="xs" c="dimmed">
              {user.phone}
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={5}>
            <IconCake stroke={1.5} size={16}/>
            <Text fz="xs" c="dimmed">
              {user.dateOfBirth}
            </Text>
          </Group>
        </div>
      </Group>
      </Paper>
    </div>
  );
};

export default User;
