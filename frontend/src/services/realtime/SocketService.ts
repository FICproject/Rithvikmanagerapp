import { io, Socket } from 'socket.io-client';
import { ENV } from '../../constants/env';

export type SocketEventType =
  | 'vendor.updated'
  | 'vendor.location.updated'
  | 'task.created'
  | 'task.assigned'
  | 'task.updated'
  | 'task.status.updated'
  | 'issue.created'
  | 'issue.updated'
  | 'issue.status.updated'
  | 'issue.escalated'
  | 'issue.resolved'
  | 'connection.status';

export interface RealtimeEventPayload<T = any> {
  type: SocketEventType;
  entityId: string;
  scope?: {
    stateId?: string;
    districtId?: string;
    divisionId?: string;
    pincodeId?: string;
  };
  data?: T;
  changedFields?: string[];
  timestamp?: string;
}

export type SocketEventHandler<T = any> = (payload: RealtimeEventPayload<T>) => void;
export type ConnectionStatusHandler = (isConnected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private isExplicitlyClosed: boolean = false;
  private listeners: Map<string, Set<SocketEventHandler>> = new Map();
  private connectionStatusListeners: Set<ConnectionStatusHandler> = new Set();
  private reconnectSubscribers: Set<() => void> = new Set();

  /**
   * Determine socket backend URL. Uses localhost:3000 (which is reversed via adb to the phone)
   * or the base URL without /api/v1
   */
  private getSocketUrl(): string {
    const apiBase = ENV.apiBaseUrl;
    if (apiBase.includes('localhost') || apiBase.includes('10.0.2.2') || apiBase.includes('192.168.')) {
      return apiBase.replace('/api/v1', '');
    }
    // Default to port 3000 for local test/dev server
    return 'http://localhost:3000';
  }

  /**
   * Connect to Socket.IO backend with authenticated JWT token.
   * Single authenticated socket connection for the entire application.
   */
  connect(token: string, scope?: Record<string, any>) {
    if (this.socket && this.currentToken === token && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.currentToken = token;
    this.isExplicitlyClosed = false;

    const socketUrl = this.getSocketUrl();
    console.log(`[SocketService] Connecting to ${socketUrl} with JWT...`);

    this.socket = io(socketUrl, {
      auth: { token },
      query: {
        token,
        ...(scope ? { scope: JSON.stringify(scope) } : {}),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to real-time server with socket id:', this.socket?.id);
      this.notifyConnectionStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected from server. Reason:', reason);
      this.notifyConnectionStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.log('[SocketService] Connection attempt status:', error.message);
      this.notifyConnectionStatus(false);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`[SocketService] Reconnected on attempt ${attempt}. Triggering authoritative sync.`);
      this.notifyConnectionStatus(true);
      this.reconnectSubscribers.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.warn('[SocketService] Error in reconnect subscriber:', e);
        }
      });
    });

    // Wire up all domain events
    const allEvents: SocketEventType[] = [
      'vendor.updated',
      'vendor.location.updated',
      'task.created',
      'task.assigned',
      'task.updated',
      'task.status.updated',
      'issue.created',
      'issue.updated',
      'issue.status.updated',
      'issue.escalated',
      'issue.resolved',
    ];

    allEvents.forEach((eventName) => {
      this.socket?.on(eventName, (payload: RealtimeEventPayload) => {
        console.log(`[SocketService] Received real-time event: ${eventName}`, payload);
        this.dispatch(eventName, payload);
      });
    });
  }

  /**
   * Disconnect socket on logout.
   */
  disconnect() {
    this.isExplicitlyClosed = true;
    if (this.socket) {
      console.log('[SocketService] Disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
    this.notifyConnectionStatus(false);
  }

  /**
   * Check if real-time socket is actively connected.
   */
  isConnected(): boolean {
    return !!(this.socket && this.socket.connected);
  }

  /**
   * Subscribe to specific domain events.
   * Returns an unsubscribe function.
   */
  subscribe<T = any>(event: SocketEventType, handler: SocketEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  /**
   * Subscribe to connection online/offline status changes.
   */
  subscribeToConnectionStatus(handler: ConnectionStatusHandler): () => void {
    this.connectionStatusListeners.add(handler);
    handler(this.isConnected());
    return () => {
      this.connectionStatusListeners.delete(handler);
    };
  }

  /**
   * Subscribe to re-connection events to trigger authoritative REST fetches.
   */
  onReconnect(callback: () => void): () => void {
    this.reconnectSubscribers.add(callback);
    return () => {
      this.reconnectSubscribers.delete(callback);
    };
  }

  /**
   * Dispatch incoming socket event to registered listeners.
   */
  private dispatch(event: string, payload: RealtimeEventPayload) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (e) {
          console.warn(`[SocketService] Error executing handler for ${event}:`, e);
        }
      });
    }
  }

  private notifyConnectionStatus(isConnected: boolean) {
    this.connectionStatusListeners.forEach((handler) => {
      try {
        handler(isConnected);
      } catch (e) {
        console.warn('[SocketService] Error notifying connection status:', e);
      }
    });
  }
}

export const socketService = new SocketService();
