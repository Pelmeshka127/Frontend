import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getCurrentUser, getUserById } from "../../api/getUser";
import { getAllMyChats, getAllChatMembers } from "../../api/getChats";
import {
  AppShell,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Group,
  Input,
  Paper,
  Stack,
  Text,
  useMantineTheme,
  Loader,
  NavLink,
  ScrollArea,
  Divider,
  rem,
} from "@mantine/core";
import {
  IconSearch,
  IconSettings,
  IconMessage,
  IconChevronRight,
} from "@tabler/icons-react";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";

interface ChatMember {
  chatId: number;
  userId: number;
  joinDttm: string;
  leaveDttm: string | null;
}

interface User {
  userId: number;
  nickname: string;
  firstname?: string;
  secondname?: string;
  profilePictureLink?: string;
}

interface ChatWithCompanion {
  chatId: number;
  companion: User;
}

const Home = () => {
  const theme = useMantineTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<number | null>(null);

  const { data: currentUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { data: myChats = [], isLoading: isLoadingChats } = useQuery<ChatMember[]>({
    queryKey: ["myChats"],
    queryFn: getAllMyChats,
    enabled: !!currentUser,
  });

  const { data: allChatMembers = [], isLoading: isLoadingMembers } = useQuery<ChatMember[]>({
    queryKey: ["allChatMembers"],
    queryFn: getAllChatMembers,
    enabled: !!currentUser,
  });

  const companionRequests = useQueries({
    queries:
      currentUser && allChatMembers.length > 0
        ? myChats.map(({ chatId }) => {
            const companionMember = allChatMembers.find(
              (m) => m.chatId === chatId && m.userId !== currentUser.userId
            );
            return {
              queryKey: ["companion", chatId],
              queryFn: () =>
                companionMember
                  ? getUserById(companionMember.userId)
                  : Promise.reject("No companion found"),
              enabled: !!companionMember,
            };
          })
        : [],
  });

  const companions: ChatWithCompanion[] = companionRequests
    .map((result, idx) => {
      if (result.isSuccess && idx < myChats.length) {
        return {
          chatId: myChats[idx].chatId,
          companion: result.data,
        };
      }
      return null;
    })
    .filter((c): c is ChatWithCompanion => !!c);

  const filteredChats = companions.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.companion.nickname.toLowerCase().includes(query) ||
      (chat.companion.firstname &&
        chat.companion.firstname.toLowerCase().includes(query)) ||
      (chat.companion.secondname &&
        chat.companion.secondname.toLowerCase().includes(query))
    );
  });

  const isLoading = isLoadingUser || isLoadingChats || isLoadingMembers;

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
    >
      {/* Боковая панель с контактами */}
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Group mb="md">
            <Avatar
              src={currentUser?.profilePictureLink || defaultProfilePicture}
              size="md"
              radius="xl"
            />
            <Box>
              <Text fw={500}>
                {currentUser?.firstname || currentUser?.nickname || "Пользователь"}{" "}
                {currentUser?.secondname || ""}
              </Text>
              <Text size="xs" c="dimmed">
                @{currentUser?.nickname || "nickname"}
              </Text>
            </Box>
          </Group>
          <Input
            placeholder="Поиск"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
          />
        </AppShell.Section>

        <AppShell.Section grow my="md" component={ScrollArea}>
          {isLoading ? (
            <Flex justify="center" align="center" p="xl">
              <Loader />
            </Flex>
          ) : filteredChats.length === 0 ? (
            <Text p="md">{searchQuery ? "Чаты не найдены" : "Нет доступных чатов"}</Text>
          ) : (
            filteredChats.map(({ chatId, companion }) => (
              <NavLink
                key={chatId}
                label={companion.nickname}
                description={
                  companion.firstname && companion.secondname
                    ? `${companion.firstname} ${companion.secondname}`
                    : undefined
                }
                leftSection={
                  <Avatar
                    src={companion.profilePictureLink || defaultProfilePicture}
                    size="sm"
                    radius="xl"
                  />
                }
                rightSection={<IconChevronRight size={14} />}
                active={activeChat === chatId}
                onClick={() => setActiveChat(chatId)}
                variant="subtle"
                mb={4}
                component={Link}
                to={`/chat?id=${companion.userId}&chatId=${chatId}`}
              />
            ))
          )}
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <NavLink
            label="Настройки"
            leftSection={<IconSettings size={20} />}
            component={Link}
            to="/settings"
          />
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Основное содержимое - чат */}
      <AppShell.Main>
        <Container size="lg" p={0} h="100%">
          {activeChat ? (
            <Box h="100%">
              {/* Заголовок чата */}
              <Group p="md" bg="white" style={{ borderRadius: theme.radius.md }}>
                <Avatar size="md" radius="xl" />
                <Box>
                  <Text fw={500}>Имя пользователя</Text>
                  <Text size="sm" c="dimmed">
                    @никнейм
                  </Text>
                </Box>
              </Group>

              {/* История сообщений */}
              <Box p="md" h={`calc(100% - ${rem(120)})`} style={{ overflowY: "auto" }}>
                <Stack gap="sm">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Paper
                      key={i}
                      p="xs"
                      radius="md"
                      shadow="sm"
                      maw="70%"
                      ml={i % 2 === 0 ? "auto" : undefined}
                      bg={i % 2 === 0 ? theme.colors.blue[6] : theme.colors.gray[1]}
                      c={i % 2 === 0 ? "white" : undefined}
                    >
                      <Text size="sm">Пример сообщения {i}</Text>
                      <Text size="xs" c={i % 2 === 0 ? "white" : "dimmed"} ta="right">
                        12:20
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* Поле ввода сообщения */}
              <Group p="md" align="flex-end">
                <Input
                  placeholder="Введите сообщение..."
                  style={{ flexGrow: 1 }}
                  rightSection={<IconMessage size={20} />}
                />
                <Button>Отправить</Button>
              </Group>
            </Box>
          ) : (
            <Flex
              h="100%"
              justify="center"
              align="center"
              direction="column"
              c="dimmed"
            >
              <IconMessage size={48} stroke={1.5} />
              <Text size="lg" mt="md">
                Выберите чат для начала общения
              </Text>
            </Flex>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Home;