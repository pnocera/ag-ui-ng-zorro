import { Injectable, inject } from '@angular/core';
import { Observable, Subject, throwError, timer } from 'rxjs';
import { catchError, map, takeWhile, retry, delayWhen } from 'rxjs/operators';
import { AGUIEvent, isAGUIEvent } from '../types/events';
import { AgentStatus } from '../types/abstract-agent';

/**
 * WebSocket connection status
 */
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  /** WebSocket URL */
  url: string;
  /** Optional protocols to use */
  protocols?: string | string[];
  /** Whether to automatically reconnect on disconnection */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  /** Initial reconnection delay in milliseconds */
  reconnectDelay?: number;
  /** Maximum reconnection delay in milliseconds */
  maxReconnectDelay?: number;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Optional authentication token */
  authToken?: string;
  /** Optional custom headers */
  headers?: Record<string, string>;
}

/**
 * WebSocket message types
 */
export interface WebSocketMessage {
  type: 'event' | 'message' | 'custom';
  data: any;
  id?: string;
  timestamp?: number;
}

/**
 * WebSocket service for real-time AG-UI communication
 * Provides transport-agnostic WebSocket functionality with reconnection support
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private config: WebSocketConfig;
  private socket?: WebSocket;
  private status = WebSocketStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private connectionTimeoutId?: any;

  // Subject for outgoing messages
  private messageSubject = new Subject<WebSocketMessage>();
  
  // Subject for incoming AG-UI events
  private eventSubject = new Subject<AGUIEvent>();
  
  // Subject for connection status changes
  private statusSubject = new Subject<WebSocketStatus>();
  
  // Subject for connection errors
  private errorSubject = new Subject<Error>();

  /**
   * Observable for AG-UI events
   */
  readonly events$ = this.eventSubject.asObservable();

  /**
   * Observable for connection status changes
   */
  readonly status$ = this.statusSubject.asObservable();

  /**
   * Observable for connection errors
   */
  readonly errors$ = this.errorSubject.asObservable();

  /**
   * Current connection status
   */
  get currentStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Whether the WebSocket is connected
   */
  get isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED;
  }

  constructor() {
    // Default configuration
    this.config = {
      url: '',
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      connectionTimeout: 10000
    };
  }

  /**
   * Configure the WebSocket service
   */
  configure(config: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Connect to the WebSocket server
   */
  connect(config?: Partial<WebSocketConfig>): Promise<void> {
    if (config) {
      this.configure(config);
    }

    if (this.status === WebSocketStatus.CONNECTED || 
        this.status === WebSocketStatus.CONNECTING) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.setStatus(WebSocketStatus.CONNECTING);
        this.createWebSocket();
        
        const onOpen = () => {
          this.clearConnectionTimeout();
          this.setStatus(WebSocketStatus.CONNECTED);
          this.reconnectAttempts = 0;
          this.setupEventListeners();
          resolve();
        };

        const onError = (error: Event) => {
          this.clearConnectionTimeout();
          this.handleError(new Error('WebSocket connection failed'));
          reject(error);
        };

        // Set up connection timeout
        this.connectionTimeoutId = setTimeout(() => {
          if (this.status === WebSocketStatus.CONNECTING) {
            this.handleError(new Error('WebSocket connection timeout'));
            reject(new Error('Connection timeout'));
          }
        }, this.config.connectionTimeout);

        // Set up initial event listeners
        this.socket!.onopen = onOpen;
        this.socket!.onerror = onError;

      } catch (error) {
        this.handleError(error as Error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.clearConnectionTimeout();
    
    if (this.socket) {
      this.socket.close(1000, 'Disconnected by client');
      this.socket = undefined;
    }
    
    this.setStatus(WebSocketStatus.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: WebSocketMessage): void {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket is not connected');
    }

    try {
      const messageToSend = {
        ...message,
        timestamp: message.timestamp || Date.now()
      };

      this.socket.send(JSON.stringify(messageToSend));
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Send an AG-UI event
   */
  sendEvent(event: AGUIEvent): void {
    this.send({
      type: 'event',
      data: event
    });
  }

  /**
   * Send a text message
   */
  sendMessage(message: string, id?: string): void {
    this.send({
      type: 'message',
      data: { message },
      id
    });
  }

  /**
   * Send custom data
   */
  sendCustom(data: any, id?: string): void {
    this.send({
      type: 'custom',
      data,
      id
    });
  }

  /**
   * Get observable for specific event types
   */
  onEvent<T extends AGUIEvent>(eventType: T['type']): Observable<T> {
    return this.events$.pipe(
      map((event): T | null => {
        return event.type === eventType ? event as T : null;
      }),
      (obs) => obs.pipe(
        map(event => event as T) // Type assertion since we filter nulls next
      )
    );
  }

  /**
   * Create a new WebSocket connection
   */
  private createWebSocket(): void {
    let url = this.config.url;
    
    // Add auth token as query parameter if provided
    if (this.config.authToken) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${encodeURIComponent(this.config.authToken)}`;
    }

    // Create WebSocket with protocols if provided
    this.socket = this.config.protocols 
      ? new WebSocket(url, this.config.protocols)
      : new WebSocket(url);
  }

  /**
   * Set up event listeners for the WebSocket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      // Connection already handled in connect()
    };

    this.socket.onclose = (event) => {
      this.setStatus(WebSocketStatus.DISCONNECTED);
      
      if (event.code !== 1000 && this.config.autoReconnect) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      this.handleError(new Error('WebSocket error occurred'));
    };

    this.socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'event':
          if (isAGUIEvent(message.data)) {
            this.eventSubject.next(message.data);
          } else {
            console.warn('Received invalid AG-UI event:', message.data);
          }
          break;
        case 'message':
          // Handle custom messages
          this.messageSubject.next(message);
          break;
        case 'custom':
          // Handle custom data
          this.messageSubject.next(message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Attempt to reconnect the WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      this.handleError(new Error('Maximum reconnection attempts reached'));
      return;
    }

    this.setStatus(WebSocketStatus.RECONNECTING);
    this.reconnectAttempts++;

    // Calculate delay with exponential backoff
    const baseDelay = this.config.reconnectDelay || 1000;
    const maxDelay = this.config.maxReconnectDelay || 30000;
    const delay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts - 1), maxDelay);

    timer(delay).subscribe(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    });
  }

  /**
   * Update and emit connection status
   */
  private setStatus(newStatus: WebSocketStatus): void {
    const oldStatus = this.status;
    this.status = newStatus;
    
    if (oldStatus !== newStatus) {
      this.statusSubject.next(newStatus);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('WebSocket error:', error);
    this.setStatus(WebSocketStatus.ERROR);
    this.errorSubject.next(error);
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = undefined;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    
    this.eventSubject.complete();
    this.statusSubject.complete();
    this.errorSubject.complete();
    this.messageSubject.complete();
  }
}