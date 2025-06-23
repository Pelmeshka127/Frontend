
import { useState, useEffect, useRef, useContext } from "react";
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
  ScrollArea,
  ActionIcon,
  NavLink,
  Drawer,
  Button,
  Stack,
  AppShellAside,
  Switch,
  createTheme,
  MantineProvider,
  Space
} from "@mantine/core";
import {
  IconSearch,
  IconSettings,
  IconMessage,
  IconUserPlus,
  IconMessages,
  IconSun,
  IconMoonStars
} from "@tabler/icons-react";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";
import classes from "./Navbar.module.css";
import { Chat } from "../Chat";
import { useDisclosure, useToggle  } from "@mantine/hooks";
import { useAuth } from "../AuthContext/AuthContext";
import { Chats } from '../Chat/Chats';
import { Settings } from '../Settings/Settings';
import { subscribeToUserEvents, connectWebSocket } from '../../api/ws';
import {
  User,
  ChatWithCompanion,
  mapChatsWithCompanions,
  UserData
} from './Home.utils';
import Search from "../Search/Search";
import { UserModal } from "../UserModal/UserModal";

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

  // Состояния для управления модальным окном пользователя
  const [isUserModalOpen, { open: openUserModal, close: closeUserModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCompanion, setIsCompanion] = useState(false);

  // Загружаем userData из localStorage
  const [userData, setUserData] = useState<UserData | null>(() => {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  });

  // Проверяем, есть ли выбранный пользователь в companions
  useEffect(() => {
    if (selectedUser && userData) {
      const companionExists = userData.companions.some(
        companion => companion.userId === selectedUser.userId
      );
      setIsCompanion(companionExists);
    }
  }, [selectedUser, userData]);

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

  const { currentUser, myChats, allChatMembers, companions } = userData;

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

  // Обработчик выбора пользователя в поиске
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    openUserModal();
  };

  // Переход к существующему чату
  const handleOpenChat = () => {
    if (!selectedUser || !userData) return;
    
    const existingChat = chatWithCompanions.find(
      chat => chat.companion.userId === selectedUser.userId
    );
    
    if (existingChat) {
      setSelectedChat({ chatId: existingChat.chatId, companionId: selectedUser.userId });
    }
    
    closeUserModal();
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

const { themeType, jsx: SettingsUI } = Settings();
  const createPrivateChat = async (creatorId: number, companionId: number) => {
    const response = await fetch("/api/chat/private", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ creatorId, companionId }),
    });
    if (!response.ok) throw new Error("Failed to create private chat");
    return await response.json();
  };

  const handleCreateChat = async () => {
    if (!selectedUser || !userData) return;
    try {
      const res = await createPrivateChat(userData.currentUser.userId, selectedUser.userId);
      // Обновляем userData в localStorage
      const newChat = { chatId: res.chatId, userId: res.companion.userId as any, joinDttm: res.createdDttm, leaveDttm: null };
      const newCompanion = {
        userId: res.companion.userId,
        nickname: res.companion.nickname,
        firstname: res.companion.firstname,
        secondname: res.companion.secondname,
        profilePictureLink: res.companion.profilePictureLink,
        dateOfBirth: res.companion.dateOfBirth,
        phone: res.companion.phone,
        email: res.companion.email,
        active: res.companion.active
      };
      const updatedUserData = {
        ...userData,
        myChats: [...userData.myChats, newChat],
        companions: [...userData.companions, newCompanion]
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsCompanion(true);
      // Открываем чат сразу после создания
      setSelectedChat({ chatId: res.chatId, companionId: res.companion.userId });
      closeUserModal();
    } catch (e) {
      // Logging only in English!
    }
  };

  return (
    <MantineProvider forceColorScheme={themeType?'dark':'light'}>
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

          {SettingsUI}      
          <Space h="md" />    
          <Button color="red" onClick={handleLogout} fullWidth>
            Logout
          </Button>
      </Drawer>
      
      {/* Модальное окно пользователя */}
      {selectedUser && (
        <UserModal
          otherUser={selectedUser}
          currentUser={currentUser}
          isCompanion={isCompanion}
          onOpenChat={handleOpenChat}
          onCreateChat={handleCreateChat}
          opened={isUserModalOpen}
          onClose={closeUserModal}
        />
      )}
      
      <AppShell
        padding="md"
        header={{ height: 70 }}
        navbar={{
          width: 430,
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
                {activeTab === "chats" ? (
                  filteredChats.length === 0 ? (
                    <Text p="md" c="white" size="md">
                      {searchQuery ? "Чаты не найдены" : "Нет доступных чатов"}
                    </Text>
                  ) : (
                    <Chats 
                      chats={filteredChats} 
                      unreadChats={unreadChats} 
                      onSelectChat={handleChatSelect} 
                      selectedChatId={selectedChat?.chatId} 
                    />
                  )
                ) : (
                  <Search 
                    value={searchQuery} 
                    onUserSelect={handleUserSelect} 
                  />
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
    </MantineProvider>
  );
};


export default Home;