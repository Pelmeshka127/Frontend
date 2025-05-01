import { useState } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getAllContacts, createContact } from "../../api/getContacts";
import { getCurrentUser, getUserById } from "../../api/getUser";
import { getAllChatMembers, getAllMyChats } from "../../api/getChats";
import { Link } from "react-router-dom";

interface Contact {
  ownerId: number;
  userId: number;
}

interface User {
  userId: number;
  nickname: string;
  profilePictureLink: string;
}

interface ChatMember {
  chatId: number;
  userId: number;
  joinDttm: string;
  leaveDttm: string | null;
}

const Contact = () => {
  const [search, setSearch] = useState("");
  const [newContactNickname, setNewContactNickname] = useState("");
  const [addError, setAddError] = useState("");

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const {
    data: contacts = [],
    refetch: refetchContacts,
  } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: getAllContacts,
    enabled: !!currentUser,
  });

  const { data: myChats = [] } = useQuery({
    queryKey: ["myChats"],
    queryFn: getAllMyChats,
    enabled: !!currentUser,
  });

  const { data: allChatMembers = [] } = useQuery({
    queryKey: ["allChatMembers"],
    queryFn: getAllChatMembers,
    enabled: !!currentUser,
  });

  const userRequests = useQueries({
    queries: contacts.map((contact) => ({
      queryKey: ["user", contact.userId],
      queryFn: () => getUserById(contact.userId),
      enabled: !!contact.userId,
    })),
  });

  const getChatIdWithUser = (userId: number): number | null => {
    for (const chat of myChats) {
      const members = allChatMembers.filter((m: ChatMember) => m.chatId === chat.chatId);
      const hasCompanion = members.some((m: ChatMember) => m.userId === userId);
      if (hasCompanion) return chat.chatId;
    }
    return null;
  };

  const filteredUsers = userRequests
    .map((res, i) => (res.isSuccess ? { contact: contacts[i], user: res.data } : null))
    .filter((entry): entry is { contact: Contact; user: User } => !!entry)
    .filter((entry) => entry.user.nickname.toLowerCase().includes(search.toLowerCase()));

  const addContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      setNewContactNickname("");
      setAddError("");
      refetchContacts();
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: () => {
      setAddError("Не удалось добавить контакт. Возможно, пользователь не найден.");
    },
  });

  const handleAddContact = () => {
    if (newContactNickname.trim()) {
      addContactMutation.mutate(newContactNickname.trim());
    }
  };

  return (
    <div>
      <div>
        <h2>Добавить контакты</h2>
        <input
          type="text"
          value={newContactNickname}
          onChange={(e) => setNewContactNickname(e.target.value)}
          placeholder="Никнейм нового контакта"
        />
        <button onClick={handleAddContact}>Добавить</button>
        {addError && <p style={{ color: "red" }}>{addError}</p>}
      </div>

      <h2>Мои контакты</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по нику"
      />

      {filteredUsers.length === 0 ? (
        <p>Нет контактов</p>
      ) : (
        <ul>
          {filteredUsers.map(({ user }) => {
            const chatId = getChatIdWithUser(user.userId);
            return (
              <li key={user.userId}>
                <span>{user.nickname} </span>
                {chatId ? (
                  <Link to={`/chat?id=${user.userId}&chatId=${chatId}`}>Перейти в чат</Link>
                ) : (
                  <span> (чата нет)</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Contact;
