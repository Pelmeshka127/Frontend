interface Message {
  messageId: number;
  senderId: number;
  chatId: number;
  contentId: number;
  sendDttm: string;
  read: boolean;
  replyToMessageId?: number | null;
  updatedDttm?: Date | null;
}

const getMessages = async (chatId: number) => {
  const response = await fetch(`/api/message?chatId=${chatId}`);
  const messages = await response.json();
  const messagesWithContent = await Promise.all(
      messages.map(async (message: Message) => {
          const contentResponse = await fetch(`/api/content?id=${message.contentId}`);
          const contentData = await contentResponse.json();
          return {
              ...message,
              content: contentData.text
          };
      })
  );
  return messagesWithContent;
};

interface SendMessageRequest {
  chatId: number;
  senderId: number;
  text: string;
}

const sendMessage = async (chatId: number, senderId: number, text: string) => {
  const requestBody: SendMessageRequest = {
    chatId,
    senderId,
    text
  };

  const response = await fetch(`/api/message?chatId=${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const newMessage = await response.json();
  return newMessage;
};

// Новый тип сообщения с текстом
export interface MessageWithTextDto {
  messageId: number;
  senderId: number;
  chatId: number;
  text: string;
  sendDttm: string;
  isRead: boolean;
  replyToMessageId?: number | null;
  updatedDttm?: string | null;
}

// Получить последние N сообщений
export const getLastNMessagesWithText = async (chatId: number, n: number): Promise<MessageWithTextDto[]> => {
  const response = await fetch(`/api/message/with-text/last?chatId=${chatId}&n=${n}`);
  if (!response.ok) throw new Error('Failed to fetch last N messages');
  return response.json();
};

// Получить N сообщений до messageId (экран вверх)
export const getNMessagesBeforeMessageWithText = async (chatId: number, messageId: number, n: number): Promise<MessageWithTextDto[]> => {
  const response = await fetch(`/api/message/with-text/before?chatId=${chatId}&messageId=${messageId}&n=${n}`);
  if (!response.ok) throw new Error('Failed to fetch messages before messageId');
  return response.json();
};

export { getMessages, sendMessage };