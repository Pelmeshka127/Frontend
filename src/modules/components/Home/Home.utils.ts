// Типы
export interface ChatMember {
  chatId: number;
  userId: number;
  joinDttm: string;
  leaveDttm: string | null;
}

export interface User {
  userId: number;
  nickname: string;
  firstname?: string;
  secondname?: string;
  profilePictureLink?: string;
}

export interface ChatWithCompanion {
  chatId: number;
  companion: User;
}

export interface Contact {
  ownerId: number;
  userId: number;
}

export interface UserData {
  userId: number;
  darkTheme: boolean;
  showDateOfBirth: boolean;
  chatYourselfDefault: boolean;
  contactAutoAccept: boolean;
}

export interface UserData {
  currentUser: User;
  myChats: ChatMember[];
  allChatMembers: ChatMember[];
  companions: User[];
  contacts: Contact[];
}

// Вспомогательные функции
export function getChatIdWithUser(myChats: ChatMember[], allChatMembers: ChatMember[], userId: number): number | null {
  for (const chat of myChats) {
    const members = allChatMembers.filter((m) => m.chatId === chat.chatId);
    const hasCompanion = members.some((m) => m.userId === userId);
    if (hasCompanion) return chat.chatId;
  }
  return null;
}

export function mapChatsWithCompanions(
  myChats: ChatMember[],
  allChatMembers: ChatMember[],
  companions: User[],
  currentUser: User
): ChatWithCompanion[] {
  return myChats.map((chat) => {
    // Получаем всех участников чата
    const members = allChatMembers.filter((m) => m.chatId === chat.chatId);

    // Если в чате только currentUser — это чат с самим собой
    if (members.length === 1 && members[0].userId === currentUser.userId) {
      return { chatId: chat.chatId, companion: currentUser };
    }

    // Ищем собеседника (не currentUser)
    const companionMember = members.find((m) => m.userId !== currentUser.userId);
    if (!companionMember) return null;

    // Ищем пользователя среди companions
    const companion = companions.find((c) => c.userId === companionMember.userId);
    if (!companion) return null;

    return { chatId: chat.chatId, companion };
  }).filter((c): c is ChatWithCompanion => !!c);
} 