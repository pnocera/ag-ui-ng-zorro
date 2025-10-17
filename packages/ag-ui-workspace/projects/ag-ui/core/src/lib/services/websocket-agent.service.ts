import { Injectable, inject } from '@angular/core';
import { AbstractAgent, AgentConfig, AgentStatus } from '../types/abstract-agent';
import { AGUIEvent, isAGUIEvent } from '../types/events';
import { WebSocketService, WebSocketConfig } from './websocket.service';
import { firstValueFrom } from 'rxjs';

/**
 * Configuration specific to WebSocket-based agents
 */
export interface WebSocketAgentConfig extends AgentConfig {
  /** WebSocket URL */
  wsUrl: string;
  /** Optional WebSocket protocols */
  protocols?: string | string[];
  /** Whether to automatically reconnect */
  autoReconnect?: boolean;
  /** Authentication token */
  authToken?: string;
}

/**
 * WebSocket-based implementation of AbstractAgent
 * Uses WebSocketService for real-time communication
 */
export class WebSocketAgent extends AbstractAgent {
  private webSocketService = inject(WebSocketService);
  private wsConfig: WebSocketAgentConfig;

  constructor(config: WebSocketAgentConfig) {
    super(config);
    this.wsConfig = config;
    this.setupWebSocket();
  }

  /**
   * Connect to the WebSocket agent
   */
  async connect(): Promise<void> {
    try {
      this.setStatus(AgentStatus.CONNECTING);

      const wsConfig: WebSocketConfig = {
        url: this.wsConfig.wsUrl,
        protocols: this.wsConfig.protocols,
        autoReconnect: this.wsConfig.autoReconnect ?? true,
        authToken: this.wsConfig.authToken
      };

      await this.webSocketService.connect(wsConfig);
      this.setStatus(AgentStatus.CONNECTED);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from the WebSocket agent
   */
  async disconnect(): Promise<void> {
    try {
      this.webSocketService.disconnect();
      this.setStatus(AgentStatus.DISCONNECTED);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Send a message to the agent
   */
  async sendMessage(message: string, options?: any): Promise<void> {
    try {
      this.setStatus(AgentStatus.RUNNING);
      
      const messageData = {
        type: 'message',
        message,
        thread_id: options?.thread_id,
        ...options
      };

      this.webSocketService.sendCustom(messageData);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Send a custom event to the agent
   */
  async sendEvent(event: any): Promise<void> {
    try {
      this.webSocketService.sendEvent(event);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Setup WebSocket event handling
   */
  private setupWebSocket(): void {
    // Forward WebSocket events to agent event stream
    this.webSocketService.events$.subscribe(event => {
      this.emitEvent(event);
    });

    // Handle connection status changes
    this.webSocketService.status$.subscribe(status => {
      switch (status) {
        case 'connected':
          if (this.status !== AgentStatus.RUNNING) {
            this.setStatus(AgentStatus.CONNECTED);
          }
          break;
        case 'disconnected':
        case 'error':
          if (this.status !== AgentStatus.DISCONNECTED) {
            this.setStatus(AgentStatus.ERROR);
          }
          break;
        case 'reconnecting':
          this.setStatus(AgentStatus.CONNECTING);
          break;
      }
    });

    // Handle WebSocket errors
    this.webSocketService.errors$.subscribe(error => {
      this.handleError(error);
    });
  }

  /**
   * Override destroy to clean up WebSocket resources
   */
  override destroy(): void {
    super.destroy();
    this.webSocketService.destroy();
  }
}