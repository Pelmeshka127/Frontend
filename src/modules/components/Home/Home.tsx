import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useQueries } from "@tanstack/react-query"
import { getCurrentUser, getUserById } from "../../api/getUser"
import { getAllMyChats, getAllChatMembers } from "../../api/getChats"
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
  Title,
  ActionIcon,
  useMantineTheme,
  Loader,
} from "@mantine/core"
import defaultProfilePicture from "../../../assets/default_profile_picture.png"

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

const Home = () => {
  const theme = useMantineTheme()
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredChats = companions.filter((chat) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      chat.companion.nickname.toLowerCase().includes(query) ||
      (chat.companion.firstname && chat.companion.firstname.toLowerCase().includes(query)) ||
      (chat.companion.secondname && chat.companion.secondname.toLowerCase().includes(query))
    )
  })

  const isLoading = isLoadingUser || isLoadingChats || isLoadingMembers

  return (
    <AppShell>
      <Flex h="100vh">
        <Box w={70} h="100%" bg={theme.colors.gray[2]} p="md">
          <Stack align="center">
            <ActionIcon size="lg" component={Link} to={`/user?id=${currentUser?.userId}`}>
              <Text size="xl" fw={700}>
                👤
              </Text>
            </ActionIcon>

            <ActionIcon size="lg" component={Link} to="/contacts">
              <Text size="xl" fw={700}>
                👥
              </Text>
            </ActionIcon>

            <Avatar size="md" radius="xl" color="gray" />
            <Avatar size="md" radius="xl" color="gray" />
            <Avatar size="md" radius="xl" color="gray" />
          </Stack>
        </Box>

        <Box>
          <Container size="lg" px="lg" py="md">
            <Flex justify="space-between" align="center" mb="lg">
              <Group>
                <Avatar src={currentUser?.profilePictureLink || defaultProfilePicture} size="md" radius="xl" />
                <Box>
                  <Text fw={500}>
                    {currentUser?.firstname || currentUser?.nickname || "Пользователь"} {currentUser?.secondname || ""}
                  </Text>
                  <Text size="xs" c="dimmed">
                    @{currentUser?.nickname || "nickname"}
                  </Text>
                </Box>
              </Group>

              <Title order={1}>Мессенджер</Title>

              <ActionIcon variant="subtle" radius="xl" size="lg" component={Link} to='*'>
                <Text size="xl" fw={700}>
                  ⚙️
                </Text>
              </ActionIcon>
            </Flex>

            <Paper p="md" radius="md" withBorder>
              <Group mb="md">
                <Button leftSection={<Text>🔍</Text>} variant="filled" color="dark">
                  Поиск
                </Button>
                <Input
                  placeholder="Введите никнейм"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  ml="md"
                />
              </Group>

              <Stack>
                {isLoading ? (
                  <Flex justify="center" align="center" p="xl">
                    <Loader />
                  </Flex>
                ) : filteredChats.length === 0 ? (
                  <Text p="md">
                    {searchQuery ? "Чаты не найдены" : "Нет доступных чатов"}
                  </Text>
                ) : (
                  filteredChats.map(({ chatId, companion }) => (
                    <Paper
                      key={chatId}
                      p="sm"
                      withBorder
                      radius="md"
                      component={Link}
                      to={`/chat?id=${companion.userId}&chatId=${chatId}`}
                      >
                      <Group>
                        <Avatar src={companion.profilePictureLink || defaultProfilePicture} size="sm" radius="xl" />
                        <Box>
                          <Text fw={500}>{companion.nickname}</Text>
                          {companion.firstname && companion.secondname && (
                            <Text size="xs" c="dimmed">
                              {companion.firstname} {companion.secondname}
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Container>
        </Box>
      </Flex>
    </AppShell>
  )
}

export default Home
