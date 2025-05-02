const getAllMyChats = async() => {
    const response = await fetch("api/chat_member/my")
    const chats = response.json()
    return chats
}

const getAllChatMembers = async () => {
    const response = await fetch("/api/chat_member/all")
    return await response.json()
  }

interface Chat {
  members: number[];
}

export const createChat = async (chat: Chat) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chat),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать чат");
  }
};


export { getAllMyChats, getAllChatMembers }