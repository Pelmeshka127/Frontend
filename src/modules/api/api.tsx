import { useQuery } from '@tanstack/react-query';

const fetchUsers = async () => {
  const response = await fetch("http://localhost:8080/user?id=147");
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