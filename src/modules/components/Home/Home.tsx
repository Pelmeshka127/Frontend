"use client"

import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery, useQueries } from "@tanstack/react-query"
import { getCurrentUser, getUserById } from "../../api/getUser"
import { getAllMyChats, getAllChatMembers } from "../../api/getChats"
import { getAllContacts } from "../../api/getContacts"
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
  Tabs,
  UnstyledButton,
  ActionIcon,
} from "@mantine/core"
import {
  IconSearch,
  IconSettings,
  IconMessage,
  IconChevronRight,
  IconUsers,
  IconMessages,
} from "@tabler/icons-react"
import defaultProfilePicture from "../../../assets/default_profile_picture.png"
import classes from "./Navbar.module.css"
import { Chat } from "../Chat"

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

const Home = () => {
  const theme = useMantineTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "chats"
  const [selectedChat, setSelectedChat] = useState<{ chatId: number; companionId: number } | null>(null)

  const { data: currentUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const { data: myChats = [], isLoading: isLoadingChats } = useQuery<ChatMember[]>({
    queryKey: ["myChats"],
    queryFn: getAllMyChats,
    enabled: !!currentUser,
  })

  const { data: allChatMembers = [], isLoading: isLoadingMembers } = useQuery<ChatMember[]>({
    queryKey: ["allChatMembers"],
    queryFn: getAllChatMembers,
    enabled: !!currentUser,
  })

  // Contacts data fetching
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
  } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: getAllContacts,
    enabled: !!currentUser,
  })

  const companionRequests = useQueries({
    queries:
      currentUser && allChatMembers.length > 0
        ? myChats.map(({ chatId }) => {
            const companionMember = allChatMembers.find((m) => m.chatId === chatId && m.userId !== currentUser.userId)
            return {
              queryKey: ["companion", chatId],
              queryFn: () =>
                companionMember ? getUserById(companionMember.userId) : Promise.reject("No companion found"),
              enabled: !!companionMember,
            }
          })
        : [],
  })

  // Contact users data fetching
  const contactUserRequests = useQueries({
    queries: contacts.map((contact) => ({
      queryKey: ["user", contact.userId],
      queryFn: () => getUserById(contact.userId),
      enabled: !!contact.userId,
    })),
  })

  const companions: ChatWithCompanion[] = companionRequests
    .map((result, idx) => {
      if (result.isSuccess && idx < myChats.length) {
        return {
          chatId: myChats[idx].chatId,
          companion: result.data,
        }
      }
      return null
    })
    .filter((c): c is ChatWithCompanion => !!c)

  // Process contact users
  const contactUsers = contactUserRequests
    .map((result, idx) => {
      if (result.isSuccess && idx < contacts.length) {
        return {
          contact: contacts[idx],
          user: result.data,
        }
      }
      return null
    })
    .filter((entry): entry is { contact: Contact; user: User } => !!entry)

  const filteredChats = companions.filter((chat) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      chat.companion.nickname.toLowerCase().includes(query) ||
      (chat.companion.firstname && chat.companion.firstname.toLowerCase().includes(query)) ||
      (chat.companion.secondname && chat.companion.secondname.toLowerCase().includes(query))
    )
  })

  // Filter contacts based on search query
  const filteredContacts = contactUsers.filter((entry) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      entry.user.nickname.toLowerCase().includes(query) ||
      (entry.user.firstname && entry.user.firstname.toLowerCase().includes(query)) ||
      (entry.user.secondname && entry.user.secondname.toLowerCase().includes(query))
    )
  })

  // Function to get chat ID with a specific user
  const getChatIdWithUser = (userId: number): number | null => {
    for (const chat of myChats) {
      const members = allChatMembers.filter((m) => m.chatId === chat.chatId)
      const hasCompanion = members.some((m) => m.userId === userId)
      if (hasCompanion) return chat.chatId
    }
    return null
  }

  const isLoading = isLoadingUser || isLoadingChats || isLoadingMembers || isLoadingContacts

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  const handleChatSelect = (chatId: number, companionId: number) => {
    setSelectedChat({ chatId, companionId })
  }

  return (
    <AppShell
      padding="md"
      header={{ height: 70 }}
      navbar={{
        width: 350,
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
          <ActionIcon variant="transparent" size="xl">
            <IconSettings size={44} />
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="blue.8">
        <AppShell.Section>
          <Input
            placeholder="Поиск"
            leftSection={<IconSearch size={18} color="white" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
            className={classes.searchInput}
            size="md"
          />
        </AppShell.Section>

        <AppShell.Section>
          <Tabs value={activeTab} onChange={handleTabChange} className={classes.tabs}>
            <Tabs.List grow>
              <Tabs.Tab value="chats" leftSection={<IconMessages size={18} />} className={classes.tab}>
                <Text size="md">Чаты</Text>
              </Tabs.Tab>
              <Tabs.Tab value="contacts" leftSection={<IconUsers size={18} />} className={classes.tab}>
                <Text size="md">Контакты</Text>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </AppShell.Section>

        <AppShell.Section grow my="md" component={ScrollArea}>
          {isLoading ? (
            <Flex justify="center" align="center" p="xl">
              <Loader color="white" size="lg" />
            </Flex>
          ) : activeTab === "chats" ? (
            filteredChats.length === 0 ? (
              <Text p="md" c="white" size="md">
                {searchQuery ? "Чаты не найдены" : "Нет доступных чатов"}
              </Text>
            ) : (
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
            )
          ) : (
            <>
              {filteredContacts.length === 0 ? (
                <Text p="md" c="white" size="md">
                  {searchQuery ? "Контакты не найдены" : "Нет доступных контактов"}
                </Text>
              ) : (
                filteredContacts.map(({ user }) => {
                  const chatId = getChatIdWithUser(user.userId)
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
                  )
                })
              )}
            </>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main pt="70px">
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
  )
}

export default Home