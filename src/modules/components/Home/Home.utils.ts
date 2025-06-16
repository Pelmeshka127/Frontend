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

export function mapChatsWithCompanions(myChats: ChatMember[], allChatMembers: ChatMember[], companions: User[], currentUser: User): ChatWithCompanion[] {
  return myChats.map((chat) => {
    const companion = allChatMembers
      .filter((m) => m.chatId === chat.chatId && m.userId !== currentUser.userId)
      .map((m) => companions.find((c) => c.userId === m.userId))
      .find(Boolean);
    return companion
      ? { chatId: chat.chatId, companion }
      : null;
  }).filter((c): c is ChatWithCompanion => !!c);
} 