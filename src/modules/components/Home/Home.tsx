import { useState, useEffect, useRef } from "react";
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
  IconUserPlus,
  IconMessages,
} from "@tabler/icons-react";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";
import classes from "./Navbar.module.css";
import { Chat } from "../Chat";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../AuthContext/AuthContext";
import { Chats } from '../Chat/Chats';
import { subscribeToUserEvents, connectWebSocket } from '../../api/ws';
import {
  ChatMember,
  User,
  ChatWithCompanion,
  Contact,
  UserData,
  getChatIdWithUser,
  mapChatsWithCompanions,
} from './Home.utils';
import Search from "../Search/Search";

const Home = () => {
  const theme = useMantineTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "chats";
  const [selectedChat, setSelectedChat] = useState<{ chatId: number; companionId: number } | null>(null);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const { logout } = useAuth();
  const [unreadChats, setUnreadChats] = useState<Set<number>>(new Set());
  const addMessageToChatRef = useRef<null | ((chatId: number, message: any) => void)>(null);
  const selectedChatIdRef = useRef<number | null>(null);

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
  const chatWithCompanions: ChatWithCompanion[] = mapChatsWithCompanions(myChats, allChatMembers, companions, currentUser);

  const filteredChats = chatWithCompanions.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.companion.nickname.toLowerCase().includes(query) ||
      (chat.companion.firstname && chat.companion.firstname.toLowerCase().includes(query)) ||
      (chat.companion.secondname && chat.companion.secondname.toLowerCase().includes(query))
    );
  });

  // Функция для получения chatId по userId
  const getChatIdWithUserMemo = (userId: number): number | null => getChatIdWithUser(myChats, allChatMembers, userId);

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
    }
  };

  // Обработчик новых сообщений по WebSocket
  const handleWsEvent = (topic: string, body: string) => {
    if (topic === 'chat-message') {
      try {
        const msg = JSON.parse(body);
        const chatId = msg.chatId;
        if (selectedChatIdRef.current === chatId && addMessageToChatRef.current) {
          addMessageToChatRef.current(chatId, msg);
        } else {
          setUnreadChats(prev => {
            const next = new Set(prev);
            next.add(chatId);
            return next;
          });
        }
      } catch (e) { }
    }
    // Можно добавить обработку других событий (new-chat, added-to-contacts)
  };

  // При открытии чата убираем индикатор непрочитанного
  useEffect(() => {
    if (selectedChat) {
      setUnreadChats(prev => {
        const next = new Set(prev);
        next.delete(selectedChat.chatId);
        return next;
      });
    }
  }, [selectedChat]);

  // Подписка на события WebSocket с нужным обработчиком
  useEffect(() => {
    if (userData && userData.currentUser && userData.myChats) {
      connectWebSocket();
      const userId = userData.currentUser.userId;
      const chatIds = userData.myChats.map((c: any) => c.chatId);
      setTimeout(() => {
        subscribeToUserEvents(userId, chatIds, handleWsEvent);
      }, 500);
    }
  }, [userData]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChat?.chatId ?? null;
  }, [selectedChat]);

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
                  leftSection={<IconUserPlus size={24} color="white" />}
                  active={activeTab === "search"}
                  onClick={() => handleTabChange("search")}
                  variant="subtle"
                  style={{
                    borderRadius: 0,
                    borderLeft: activeTab === "search" ? `4px solid ${theme.colors.blue[5]}` : "none",
                    backgroundColor: activeTab === "search" ? theme.colors.blue[7] : "transparent",
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
                  <Chats chats={filteredChats} unreadChats={unreadChats} onSelectChat={handleChatSelect} selectedChatId={selectedChat?.chatId} />
                ) : (
                  <Search value={searchQuery} />
                )}
              </ScrollArea>
            </Box>
          </Flex>
        </AppShell.Navbar>

        <AppShell.Main pt="70px" pl={430}>
          <Container size="lg" p={0} h="100%">
            {selectedChat && (
              <Chat
                chatId={selectedChat.chatId}
                companionId={selectedChat.companionId}
                addMessageToChatRef={addMessageToChatRef}
              />
            )}
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  );
};

export default Home;