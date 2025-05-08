import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getCurrentUser, getUserById } from "../../api/getUser";
import { getAllMyChats, getAllChatMembers } from "../../api/getChats";
import {
  AppShell,
  Avatar,
  Box,
  Container,
  Flex,
  Group,
  Input,
  Text,
  useMantineTheme,
  Loader,
  NavLink,
  ScrollArea,
  Tabs,
  UnstyledButton,
} from "@mantine/core";
import {
  IconSearch,
  IconSettings,
  IconMessage,
  IconChevronRight,
  IconUsers,
  IconMessages,
} from "@tabler/icons-react";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";
import classes from "./Navbar.module.css";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "chats";

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

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

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
      <AppShell.Navbar p="md" bg="blue.8">
        <AppShell.Section>
          <Group mb="md" className={classes.header}>
            <Avatar
              src={currentUser?.profilePictureLink || defaultProfilePicture}
              size="md"
              radius="xl"
            />
            <Box>
              <Text fw={500} c="white">
                {currentUser?.firstname || currentUser?.nickname || "Пользователь"}{" "}
                {currentUser?.secondname || ""}
              </Text>
              <Text size="xs" c="blue.2">
                @{currentUser?.nickname || "nickname"}
              </Text>
            </Box>
          </Group>
          <Input
            placeholder="Поиск"
            leftSection={<IconSearch size={16} color="white" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
            className={classes.searchInput}
          />
        </AppShell.Section>

        <AppShell.Section>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            className={classes.tabs}
          >
            <Tabs.List grow>
              <Tabs.Tab 
                value="chats" 
                leftSection={<IconMessages size={16} />}
                className={classes.tab}
              >
                Чаты
              </Tabs.Tab>
              <Tabs.Tab 
                value="contacts" 
                leftSection={<IconUsers size={16} />}
                className={classes.tab}
              >
                Контакты
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </AppShell.Section>

        <AppShell.Section grow my="md" component={ScrollArea}>
          {isLoading ? (
            <Flex justify="center" align="center" p="xl">
              <Loader color="white" />
            </Flex>
          ) : activeTab === "chats" ? (
            filteredChats.length === 0 ? (
              <Text p="md" c="white">
                {searchQuery ? "Чаты не найдены" : "Нет доступных чатов"}
              </Text>
            ) : (
              filteredChats.map(({ chatId, companion }) => (
                <UnstyledButton
                  key={chatId}
                  className={classes.link}
                  component={Link}
                  to={`/chat?id=${companion.userId}&chatId=${chatId}`}
                >
                  <Group>
                    <Avatar
                      src={companion.profilePictureLink || defaultProfilePicture}
                      size="sm"
                      radius="xl"
                    />
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500} c="white">
                        {companion.nickname}
                      </Text>
                      <Text size="xs" c="blue.3">
                        {companion.firstname && companion.secondname
                          ? `${companion.firstname} ${companion.secondname}`
                          : companion.nickname}
                      </Text>
                    </Box>
                    <IconChevronRight size={14} color="white" />
                  </Group>
                </UnstyledButton>
              ))
            )
          ) : (
            <Text p="md" c="white">
              Список контактов будет здесь
            </Text>
          )}
        </AppShell.Section>

        <AppShell.Section className={classes.footer}>
          <NavLink
            label="Настройки"
            leftSection={<IconSettings size={20} color="white" />}
            component={Link}
            to="/settings"
            className={classes.link}
            c="white"
          />
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Основное содержимое - заглушка для выбора чата */}
      <AppShell.Main>
        <Container size="lg" p={0} h="100%">
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
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Home;