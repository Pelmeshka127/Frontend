import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;
let subscriptions: any[] = [];
let isSubscribed = false;
let lastUserId: number | null = null;
let lastChatIds: number[] = [];

export function connectWebSocket(onMessage?: (msg: string) => void) {
  if (stompClient) {
    if (stompClient.connected) return stompClient;
    // Если клиент есть, но не подключён — активируем
    if (!stompClient.active) stompClient.activate();
    return stompClient;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/api/ws'),
    reconnectDelay: 5000,
    debug: (str) => console.log(str),
  });

  stompClient.onConnect = () => {
    console.log('[WS] Connected');
    // Подписки будут устанавливаться через subscribeToUserEvents
    // if (onMessage) {
    //   // Пример подписки на эхо-топик
    //   subscriptions.push(
    //     stompClient?.subscribe('/topic/echo', (message) => {
    //       onMessage(message.body);
    //     })
    //   );
    // }
  };

  stompClient.onStompError = (frame) => {
    console.error('[WS] Broker error:', frame.headers['message']);
    console.error('[WS] Details:', frame.body);
  };

  stompClient.activate();
  return stompClient;
}

export function subscribeToUserEvents(userId: number, chatIds: number[], onMessage: (topic: string, body: string) => void) {
  if (
    isSubscribed &&
    lastUserId === userId &&
    Array.isArray(lastChatIds) &&
    chatIds.length === lastChatIds.length &&
    chatIds.every((id, i) => id === lastChatIds[i])
  ) {
    console.log('[WS] Уже подписаны на эти топики, повторная подписка не требуется');
    return;
  }
  if (!stompClient || !stompClient.connected) {
    console.warn('[WS] Not connected yet, cannot subscribe');
    return;
  }
  // Отписываемся от старых подписок
  subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  subscriptions = [];

  // Подписка на новые сообщения в каждом чате
  chatIds.forEach(chatId => {
    subscriptions.push(
      stompClient!.subscribe(`/topic/chat/${chatId}/messages`, (message) => {
        console.log('[WS subscribe] topic: chat-message, raw message:', message);
        let parsedBody = message.body;
        // Если это массив с STOMP-сообщением (SockJS), парсим
        try {
          if (typeof parsedBody === 'string' && parsedBody.startsWith('a[')) {
            const arr = JSON.parse(parsedBody);
            if (Array.isArray(arr) && arr.length > 0) {
              const str = arr[0];
              // STOMP: ищем двойной перевод строки (\n\n), после него идёт JSON
              const jsonStart = str.indexOf('\n\n');
              if (jsonStart !== -1) {
                let jsonStr = str.slice(jsonStart + 2);
                // Убираем \u0000 на конце
                if (jsonStr.endsWith('\u0000')) jsonStr = jsonStr.slice(0, -1);
                parsedBody = jsonStr;
              }
            }
          }
        } catch (e) {
          console.error('[WS subscribe] parse error:', e);
        }
        onMessage('chat-message', parsedBody);
      })
    );
  });
  // Подписка на создание новых чатов для пользователя
  subscriptions.push(
    stompClient!.subscribe(`/topic/user/${userId}/new-chat`, (message) => {
      console.log('[WS subscribe] topic: new-chat, raw message:', message);
      let parsedBody = message.body;
      // Если это массив с STOMP-сообщением (SockJS), парсим
      try {
        if (typeof parsedBody === 'string' && parsedBody.startsWith('a[')) {
          const arr = JSON.parse(parsedBody);
          if (Array.isArray(arr) && arr.length > 0) {
            const str = arr[0];
            // STOMP: ищем двойной перевод строки (\n\n), после него идёт JSON
            const jsonStart = str.indexOf('\n\n');
            if (jsonStart !== -1) {
              let jsonStr = str.slice(jsonStart + 2);
              // Убираем \u0000 на конце
              if (jsonStr.endsWith('\u0000')) jsonStr = jsonStr.slice(0, -1);
              parsedBody = jsonStr;
            }
          }
        }
      } catch (e) {
        console.error('[WS subscribe] new-chat parse error:', e);
      }
      onMessage('new-chat', parsedBody);
    })
  );
  // Подписка на добавление в контакты
  subscriptions.push(
    stompClient!.subscribe(`/topic/user/${userId}/added-to-contacts`, (message) => {
      console.log('[WS subscribe] topic: added-to-contacts, raw message:', message);
      onMessage('added-to-contacts', message.body);
    })
  );
  isSubscribed = true;
  lastUserId = userId;
  lastChatIds = [...chatIds];
}

export function disconnectWebSocket() {
  subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  subscriptions = [];
  stompClient?.deactivate();
  stompClient = null;
  isSubscribed = false;
  lastUserId = null;
  lastChatIds = [];
}
