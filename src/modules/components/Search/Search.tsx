import { useEffect, useCallback, useState } from "react";
import debounce from "lodash.debounce";
import searchUsers from "../../api/searchUsers";
import { UnstyledButton, Group, Avatar, Text, Box } from "@mantine/core";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";

// Тип DotUser (аналогично User из Home.utils.ts)
type DotUser = {
  userId: number;
  nickname: string;
  firstname?: string;
  secondname?: string;
  profilePictureLink?: string;
};

// Комментарии и логи только на английском!
type SearchProps = {
  value: string;
};

const Search = ({ value }: SearchProps) => {
  const [results, setResults] = useState<DotUser[]>([]);

  // Debounced функция поиска
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      console.log("debouncedSearch called with:", query);
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const users = await searchUsers(query);
        setResults(users);
        console.log("Search results:", users);
      } catch (error) {
        setResults([]);
        console.error("Search error:", error);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  return (
    <Box p="xs">
      {results.length === 0 && value.trim() !== "" && (
        <Text p="md" c="white" size="md">
        Пользователи не найдены
      </Text>
      )}
      {results.map((user) => (
        <UnstyledButton
          key={user.userId}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "8px 0",
            backgroundColor: "transparent",
            borderRadius: 0,
            fontWeight: 400,
            outline: "none",
            boxShadow: "none",
          }}
        >
          <Group wrap="nowrap" gap={12} align="center">
            <Avatar src={user.profilePictureLink || defaultProfilePicture} radius="xl" size="md" style={{ marginLeft: 12 }} />
            <Box style={{ flex: 1, marginLeft: 12 }}>
              <Text fw={700} size="md" c="white">
                {user.nickname}
              </Text>
              <Text size="sm" c="white">
                {user.firstname && user.secondname
                  ? `${user.firstname} ${user.secondname}`
                  : user.nickname}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
      ))}
    </Box>
  );
};

export default Search; 