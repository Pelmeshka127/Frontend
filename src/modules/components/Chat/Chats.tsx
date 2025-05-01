import { useQuery, useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAllMyChats, getAllChatMembers } from "../../api/getChats";
import { getCurrentUser, getUserById } from "../../api/getUser";

interface ChatMember {
  chatId: number;
  userId: number;
  joinDttm: string;
  leaveDttm: string | null;
}

interface User {
  userId: number;
  nickname: string;
  profilePictureLink: string;
}

const Chats = () => {
  const { data: currentUser } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: myChats = [] } = useQuery<ChatMember[]>({
    queryKey: ["myChats"],
    queryFn: getAllMyChats,
    enabled: !!currentUser,
  });

  const { data: allChatMembers = [] } = useQuery<ChatMember[]>({
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

  const companions = companionRequests
    .map((result, idx) => {
      if (result.isSuccess) {
        return {
          chatId: myChats[idx].chatId,
          companion: result.data,
        };
      }
      return null;
    })
    .filter((c): c is { chatId: number; companion: User } => !!c);

  return (
    <div>
      <h2>Мои чаты</h2>
      {companions.length === 0 ? (
        <p>Нет доступных чатов</p>
      ) : (
        <ul>
          {companions.map(({ chatId, companion }) => (
            <li key={chatId}>
              <Link to={`/chat?id=${companion.userId}&chatId=${chatId}`}>
                {companion.nickname}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { Chats };
