import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  ScrollArea,
  UnstyledButton,
  ActionIcon,
  NavLink,
  Drawer,
  Button,
  Stack,
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
import { Chat } from "../Chat";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../AuthContext/AuthContext";

interface ChatMember {
  chatId: number
  userId: number
  joinDttm: string
  leaveDttm: string | null
}

interface User {
  userId: number
  nickname: string
  firstname?: string
  secondname?: string
  profilePictureLink?: string
}

interface ChatWithCompanion {
  chatId: number
  companion: User
}

interface Contact {
  ownerId: number
  userId: number
}

interface UserData {
  currentUser: User;
  myChats: ChatMember[];
  allChatMembers: ChatMember[];
  companions: User[];
  contacts: Contact[];
}

const Home = () => {
  const theme = useMantineTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "chats";
  const [selectedChat, setSelectedChat] = useState<{ chatId: number; companionId: number } | null>(null);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const { logout } = useAuth();

  // Загружаем userData из localStorage
  const [userData, setUserData] = useState<UserData | null>(() => {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  });

  // Если данных нет — показываем ошибку
  if (!userData) {
    return (
      <Flex h="100vh" justify="center" align="center" direction="column" c="dimmed">
        <IconMessage size={48} stroke={1.5} />
        <Text size="lg" mt="md">
          Нет данных пользователя. Пожалуйста, войдите заново.
        </Text>
      </Flex>
    );
  }

  const { currentUser, myChats, allChatMembers, companions, contacts } = userData;

  // companions: User[] -> ChatWithCompanion[] (сопоставляем chatId)
  const chatWithCompanions: ChatWithCompanion[] = myChats.map((chat) => {
    const companion = allChatMembers
      .filter((m) => m.chatId === chat.chatId && m.userId !== currentUser.userId)
      .map((m) => companions.find((c) => c.userId === m.userId))
      .find(Boolean);
    return companion
      ? { chatId: chat.chatId, companion }
      : null;
  }).filter((c): c is ChatWithCompanion => !!c);

  // Контактные пользователи (ищем их среди companions)
  const contactUsers = contacts.map((contact) => {
    const user = companions.find((c) => c.userId === contact.userId);
    return user ? { contact, user } : null;
  }).filter((entry): entry is { contact: Contact; user: User } => !!entry);

  const filteredChats = chatWithCompanions.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.companion.nickname.toLowerCase().includes(query) ||
      (chat.companion.firstname && chat.companion.firstname.toLowerCase().includes(query)) ||
      (chat.companion.secondname && chat.companion.secondname.toLowerCase().includes(query))
    );
  });

  const filteredContacts = contactUsers.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.user.nickname.toLowerCase().includes(query) ||
      (entry.user.firstname && entry.user.firstname.toLowerCase().includes(query)) ||
      (entry.user.secondname && entry.user.secondname.toLowerCase().includes(query))
    );
  });

  // Функция для получения chatId по userId
  const getChatIdWithUser = (userId: number): number | null => {
    for (const chat of myChats) {
      const members = allChatMembers.filter((m) => m.chatId === chat.chatId);
      const hasCompanion = members.some((m) => m.userId === userId);
      if (hasCompanion) return chat.chatId;
    }
    return null;
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleChatSelect = (chatId: number, companionId: number) => {
    setSelectedChat({ chatId, companionId });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      logout();
      window.location.reload();
    } catch (e) {
      // Logging only in English!
      console.error('Logout error', e);
    }
  };

  return (
    <>
      <Drawer
        opened={settingsOpened}
        onClose={closeSettings}
        title="Настройки"
        position="right"
        size={400}
        overlayProps={{ opacity: 0 }}
        withCloseButton={true}
        styles={{
          body: { paddingTop: 20, background: theme.colors.blue[9] },
          header: { borderBottom: "1px solid #eee", background: theme.colors.blue[9] },
          content: { background: theme.colors.blue[9] },
        }}
      >
        <Button color="red" onClick={handleLogout} fullWidth>
          Logout
        </Button>
      </Drawer>
      <AppShell
        padding="md"
        header={{ height: 70 }}
        navbar={{
          width: 430, // Увеличиваем ширину для двух колонок
          breakpoint: "sm",
          collapsed: { mobile: false },
        }}
      >
        <AppShell.Header px="md">
          <Group h="100%" justify="space-between">
            <Group>
              <Avatar src={currentUser?.profilePictureLink || defaultProfilePicture} size="lg" radius="xl" />
              <Box>
                <Text fw={500} size="md">
                  {currentUser?.firstname || currentUser?.nickname || "Пользователь"} {currentUser?.secondname || ""}
                </Text>
                <Text size="sm" c="dimmed">
                  @{currentUser?.nickname || "nickname"}
                </Text>
              </Box>
            </Group>
            <ActionIcon variant="transparent" size="xl" onClick={openSettings}>
              <IconSettings size={44} />
            </ActionIcon>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p={0} bg="blue.8">
          <Flex h="100%">
            {/* Левая колонка с кнопками навигации */}
            <Box w={80} h="100%" bg="blue.8">
              <Stack gap={0} pt="md">
                <NavLink
                  leftSection={<IconMessages size={24} color="white" />}
                  active={activeTab === "chats"}
                  onClick={() => handleTabChange("chats")}
                  variant="subtle"
                  style={{
                    borderRadius: 0,
                    borderLeft: activeTab === "chats" ? `4px solid ${theme.colors.blue[5]}` : "none",
                    backgroundColor: activeTab === "chats" ? theme.colors.blue[7] : "transparent",
                  }}
                  c="white"
                />
                <NavLink
                  leftSection={<IconUsers size={24} color="white" />}
                  active={activeTab === "contacts"}
                  onClick={() => handleTabChange("contacts")}
                  variant="subtle"
                  style={{
                    borderRadius: 0,
                    borderLeft: activeTab === "contacts" ? `4px solid ${theme.colors.blue[5]}` : "none",
                    backgroundColor: activeTab === "contacts" ? theme.colors.blue[7] : "transparent",
                  }}
                  c="white"
                />
              </Stack>
            </Box>

            {/* Правая колонка с контентом */}
            <Box w={350} h="100%" bg="blue.8">
              <Box p="md">
                <Input
                  placeholder="Поиск"
                  leftSection={<IconSearch size={18} color="white" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  mb="md"
                  className={classes.searchInput}
                  size="md"
                />
              </Box>

              <ScrollArea h="calc(100% - 60px)" px="md">
                {filteredChats.length === 0 && activeTab === "chats" ? (
                  <Text p="md" c="white" size="md">
                    {searchQuery ? "Чаты не найдены" : "Нет доступных чатов"}
                  </Text>
                ) : activeTab === "chats" ? (
                  filteredChats.map(({ chatId, companion }) => (
                    <UnstyledButton
                      key={chatId}
                      className={classes.link}
                      onClick={() => handleChatSelect(chatId, companion.userId)}
                      py="sm"
                    >
                      <Group>
                        <Avatar src={companion.profilePictureLink || defaultProfilePicture} size="md" radius="xl" />
                        <Box style={{ flex: 1 }}>
                          <Text size="md" fw={500} c="white">
                            {companion.nickname}
                          </Text>
                          <Text size="sm" c="blue.3">
                            {companion.firstname && companion.secondname
                              ? `${companion.firstname} ${companion.secondname}`
                              : companion.nickname}
                          </Text>
                        </Box>
                        <IconChevronRight size={16} color="white" />
                      </Group>
                    </UnstyledButton>
                  ))
                ) : (
                  <>
                    {filteredContacts.length === 0 ? (
                      <Text p="md" c="white" size="md">
                        {searchQuery ? "Контакты не найдены" : "Нет доступных контактов"}
                      </Text>
                    ) : (
                      filteredContacts.map(({ user }) => {
                        const chatId = getChatIdWithUser(user.userId);
                        return (
                          <UnstyledButton
                            key={user.userId}
                            className={classes.link}
                            onClick={() => chatId && handleChatSelect(chatId, user.userId)}
                            py="sm"
                            disabled={!chatId}
                          >
                            <Group>
                              <Avatar src={user.profilePictureLink || defaultProfilePicture} size="md" radius="xl" />
                              <Box style={{ flex: 1 }}>
                                <Text size="md" fw={500} c="white">
                                  {user.nickname}
                                </Text>
                                <Text size="sm" c="blue.3">
                                  {user.firstname && user.secondname
                                    ? `${user.firstname} ${user.secondname}`
                                    : chatId
                                      ? "Перейти в чат"
                                      : "Чата нет"}
                                </Text>
                              </Box>
                              {chatId && <IconChevronRight size={16} color="white" />}
                            </Group>
                          </UnstyledButton>
                        );
                      })
                    )}
                  </>
                )}
              </ScrollArea>
            </Box>
          </Flex>
        </AppShell.Navbar>

        <AppShell.Main pt="70px" pl={430}>
          <Container size="lg" p={0} h="100%">
            {selectedChat ? (
              <Chat chatId={selectedChat.chatId} companionId={selectedChat.companionId} />
            ) : (
              <Flex h="100%" justify="center" align="center" direction="column" c="dimmed">
                <IconMessage size={48} stroke={1.5} />
                <Text size="lg" mt="md">
                  Выберите чат для начала общения
                </Text>
              </Flex>
            )}
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  );
};

export default Home;