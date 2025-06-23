// Поиск пользователей по частичному совпадению
// Комментарии и логи только на английском!

const searchUsers = async (query: string) => {
  const response = await fetch(`/api/user/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

export default searchUsers; 