import { useQuery } from '@tanstack/react-query';

const fetchUsers = async () => {
  const response = await fetch("https://localhost:8080/users");
  if (!response.ok) {
    throw new Error("Ошибка загрузки пользователей");
  }
  return response.json();
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};
