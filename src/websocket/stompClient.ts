import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_ENDPOINTS } from '@/constants/api';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

type StateChangeListener = (state: ConnectionState) => void;

/**
 * Singleton STOMP client with SockJS fallback.
 *
 * Authentication: The HttpOnly JWT cookie is automatically included in the
 * WebSocket/SockJS handshake by the browser. No manual header manipulation
 * is needed. The backend's WebsocketAuthInterceptor reads the cookie from
 * the CONNECT frame.
 */
class StompClientManager {
  private client: Client | null = null;
  private state: ConnectionState = 'disconnected';
  private stateListeners: Set<StateChangeListener> = new Set();
  private reconnectDelay = 5000;
  private maxReconnectDelay = 30000;

  private setState(newState: ConnectionState): void {
    this.state = newState;
    this.stateListeners.forEach((listener) => listener(newState));
  }

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected' && (this.client?.connected ?? false);
  }

  onStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  connect(): void {
    if (this.client?.active) {
      return; // already connecting or connected
    }

    this.setState('connecting');

    this.client = new Client({
      webSocketFactory: () => {
        const SockJSConstructor =
          typeof SockJS === 'function'
            ? SockJS
            : (SockJS as unknown as { default: typeof SockJS }).default;
        return new SockJSConstructor(WS_ENDPOINTS.SOCKJS) as WebSocket;
      },

      // JWT cookie is sent automatically in the SockJS handshake —
      // the browser includes all matching cookies without any action here.

      reconnectDelay: this.reconnectDelay,

      onConnect: () => {
        this.reconnectDelay = 5000; // reset backoff on successful connection
        this.setState('connected');
      },

      onDisconnect: () => {
        this.setState('disconnected');
      },

      onStompError: (frame) => {
        console.error('[STOMP] Broker error:', frame.headers['message']);
        this.setState('error');
      },

      onWebSocketError: (_event) => {
        this.setState('error');
        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate().catch(() => {
        // Ignore deactivation errors during cleanup
      });
    }
    this.client = null;
    this.setState('disconnected');
  }

  getClient(): Client | null {
    return this.client;
  }
}

// Export as a singleton so the entire application shares one connection
export const stompClientManager = new StompClientManager();
