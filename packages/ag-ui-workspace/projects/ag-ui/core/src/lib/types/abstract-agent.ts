import { Injectable, EventEmitter, Output, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AGUIEvent } from '../types/events';

/**
 * Agent status enumeration
 */
export enum AgentStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RUNNING = 'running',
  ERROR = 'error',
  DISCONNECTED = 'disconnected'
}

/**
 * Agent configuration interface
 */
export interface AgentConfig {
  /** Base URL for the agent endpoint */
  baseUrl: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Optional headers to include in requests */
  headers?: Record<string, string>;
  /** Timeout for requests in milliseconds */
  timeout?: number;
  /** Whether to use binary protocol if available */
  useBinary?: boolean;
}

/**
 * Abstract base class for all AG-UI protocol agents
 * Provides the core interface and common functionality for connecting to AI agents
 */
@Injectable({
  providedIn: 'root'
})
export abstract class AbstractAgent {
  /**
   * Event stream for all AG-UI protocol events
   */
  @Output() events: Observable<AGUIEvent>;

  /**
   * Event emitter for internal use
   */
  protected eventSubject = new Subject<AGUIEvent>();

  /**
   * Current agent status
   */
  protected status = AgentStatus.IDLE;

  /**
   * Agent configuration
   */
  protected config: AgentConfig;

  /**
   * Constructor for AbstractAgent
   * @param config Agent configuration
   */
  constructor(config: AgentConfig) {
    this.config = config;
    this.events = this.eventSubject.asObservable();
  }

  /**
   * Get the current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get the agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Update the agent configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Connect to the agent
   * Must be implemented by concrete agents
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnect from the agent
   * Must be implemented by concrete agents
   */
  abstract disconnect(): Promise<void>;

  /**
   * Send a message to the agent
   * Must be implemented by concrete agents
   */
  abstract sendMessage(message: string, options?: any): Promise<void>;

  /**
   * Send a custom event to the agent
   * Optional implementation for agents that support custom events
   */
  abstract sendEvent(event: any): Promise<void>;

  /**
   * Emit an event to the event stream
   * @param event The AG-UI event to emit
   */
  protected emitEvent(event: AGUIEvent): void {
    // Add timestamp if not provided
    if (event.timestamp === undefined) {
      event.timestamp = Date.now();
    }
    this.eventSubject.next(event);
  }

  /**
   * Set the agent status
   * @param newStatus The new status
   */
  protected setStatus(newStatus: AgentStatus): void {
    const oldStatus = this.status;
    this.status = newStatus;
    
    // Emit status change event if needed
    this.onStatusChange(oldStatus, newStatus);
  }

  /**
   * Handle status changes
   * Override in subclasses for custom status handling
   */
  protected onStatusChange(oldStatus: AgentStatus, newStatus: AgentStatus): void {
    // Default implementation does nothing
    // Subclasses can override for custom logic
  }

  /**
   * Handle errors
   * @param error The error to handle
   */
  protected handleError(error: Error | string): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    console.error('Agent error:', errorMessage);
    this.setStatus(AgentStatus.ERROR);
    
    // Emit error event
    this.emitEvent({
      type: 'RUN_ERROR',
      message: errorMessage
    });
  }

  /**
   * Cleanup resources
   * Call this when the agent is no longer needed
   */
  destroy(): void {
    this.eventSubject.complete();
  }

  /**
   * Check if the agent is connected and ready
   */
  isConnected(): boolean {
    return this.status === AgentStatus.CONNECTED || this.status === AgentStatus.RUNNING;
  }

  /**
   * Check if the agent is currently running
   */
  isRunning(): boolean {
    return this.status === AgentStatus.RUNNING;
  }

  /**
   * Check if the agent is in an error state
   */
  hasError(): boolean {
    return this.status === AgentStatus.ERROR;
  }
}