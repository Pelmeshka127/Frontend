import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export function connectWebSocket(onMessage?: (msg: string) => void) {
  if (stompClient && stompClient.connected) return stompClient;

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/api/ws'),
    reconnectDelay: 5000,
    debug: (str) => console.log(str), 
  });

  stompClient.onConnect = () => {
    console.log('[WS] Connected');
    // Пример подписки на эхо-топик
    stompClient?.subscribe('/topic/echo', (message) => {
      console.log('[WS] Received:', message.body);
      onMessage?.(message.body);
    });
    // Пример отправки эхо-сообщения
    stompClient?.publish({ destination: '/app/echo', body: 'Hello, echo!' });
  };

  stompClient.onStompError = (frame) => {
    console.error('[WS] Broker error:', frame.headers['message']);
    console.error('[WS] Details:', frame.body);
  };

  stompClient.activate();
  return stompClient;
}

export function disconnectWebSocket() {
  stompClient?.deactivate();
  stompClient = null;
}