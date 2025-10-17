import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, fromEvent, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { AbstractAgent, AgentConfig, AgentStatus } from '../types/abstract-agent';
import { AGUIEvent, isAGUIEvent } from '../types/events';

/**
 * Configuration specific to HTTP-based agents
 */
export interface HttpAgentConfig extends AgentConfig {
  /** Optional endpoint path for SSE */
  sseEndpoint?: string;
  /** Optional endpoint path for regular HTTP requests */
  httpEndpoint?: string;
  /** Whether to use Server-Sent Events by default */
  useSSE?: boolean;
}

/**
 * Message options for HTTP requests
 */
export interface MessageOptions {
  /** Optional thread ID */
  thread_id?: string;
  /** Optional custom data */
  data?: any;
  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * HTTP-based implementation of AbstractAgent
 * Uses Angular's HttpClient for communication and supports both regular HTTP and Server-Sent Events
 */
export class HttpAgent extends AbstractAgent {
  private http = inject(HttpClient);
  private httpConfig: HttpAgentConfig;
  private abortController?: AbortController;
  private eventSource?: EventSource;

  constructor(config: HttpAgentConfig) {
    super(config);
    this.httpConfig = config;
  }

  /**
   * Connect to the HTTP agent endpoint
   * Tests the connection and sets up event listeners if using SSE
   */
  async connect(): Promise<void> {
    try {
      this.setStatus(AgentStatus.CONNECTING);

      // Test connection with a simple request
      const testUrl = this.buildUrl('/health');
      await this.http.get(testUrl, {
        headers: this.buildHeaders(),
        responseType: 'text'
      }).toPromise();

      // If using SSE, set up event source
      if (this.httpConfig.useSSE !== false) {
        this.setupEventSource();
      }

      this.setStatus(AgentStatus.CONNECTED);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from the HTTP agent
   * Closes any active connections and cleans up resources
   */
  async disconnect(): Promise<void> {
    try {
      // Cancel any ongoing requests
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = undefined;
      }

      // Close event source if using SSE
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = undefined;
      }

      this.setStatus(AgentStatus.DISCONNECTED);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Send a message to the agent
   * @param message The message to send
   * @param options Optional message configuration
   */
  async sendMessage(message: string, options: MessageOptions = {}): Promise<void> {
    try {
      this.setStatus(AgentStatus.RUNNING);

      const url = this.buildUrl(this.httpConfig.httpEndpoint || '/chat');
      const body = {
        message,
        thread_id: options.thread_id,
        stream: options.stream ?? true,
        ...options.data
      };

      if (options.stream !== false && this.httpConfig.useSSE !== false) {
        // Use streaming response
        await this.sendStreamingMessage(url, body);
      } else {
        // Use regular HTTP request
        await this.sendRegularMessage(url, body);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Send a custom event to the agent
   * @param event The custom event to send
   */
  async sendEvent(event: any): Promise<void> {
    try {
      const url = this.buildUrl('/events');
      await this.http.post(url, event, {
        headers: this.buildHeaders()
      }).toPromise();
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Setup EventSource for Server-Sent Events
   */
  private setupEventSource(): void {
    const sseUrl = this.buildUrl(this.httpConfig.sseEndpoint || '/events');
    
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (isAGUIEvent(data)) {
          this.emitEvent(data);
        }
      } catch (error) {
        console.warn('Failed to parse SSE event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.handleError('SSE connection error');
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
    };
  }

  /**
   * Send a streaming message request
   */
  private async sendStreamingMessage(url: string, body: any): Promise<void> {
    this.abortController = new AbortController();

    return new Promise((resolve, reject) => {
      this.http.post(url, body, {
        headers: this.buildHeaders(),
        responseType: 'text',
        reportProgress: true,
        observe: 'events'
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0) {
            // Handle SSE/streaming errors
            return this.handleStreamingResponse(error);
          }
          return throwError(() => error);
        }),
        finalize(() => {
          this.setStatus(AgentStatus.CONNECTED);
          this.abortController = undefined;
        })
      ).subscribe({
        next: (event) => {
          if (event.type === 0) {
            // Download progress
            console.log('Streaming progress:', event);
          } else if (event.type === 1) {
            // Response complete
            resolve();
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Send a regular (non-streaming) message request
   */
  private async sendRegularMessage(url: string, body: any): Promise<void> {
    const response = await this.http.post<any>(url, body, {
      headers: this.buildHeaders()
    }).toPromise();

    // Process response and emit events
    if (response && response.events) {
      for (const event of response.events) {
        if (isAGUIEvent(event)) {
          this.emitEvent(event);
        }
      }
    }
  }

  /**
   * Handle streaming response errors and attempt to parse events
   */
  private handleStreamingResponse(error: HttpErrorResponse): Observable<never> {
    if (error.error && error.error.text) {
      try {
        // Try to parse partial events from the error text
        const lines = error.error.text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            if (isAGUIEvent(data)) {
              this.emitEvent(data);
            }
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse streaming error:', parseError);
      }
    }
    return throwError(() => error);
  }

  /**
   * Build complete URL from base URL and endpoint
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.httpConfig.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Build HTTP headers including authentication
   */
  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Add API key if provided
    if (this.httpConfig.apiKey) {
      headers = headers.set('Authorization', `Bearer ${this.httpConfig.apiKey}`);
    }

    // Add custom headers
    if (this.httpConfig.headers) {
      for (const [key, value] of Object.entries(this.httpConfig.headers)) {
        headers = headers.set(key, value);
      }
    }

    return headers;
  }

  /**
   * Handle status changes specific to HTTP agent
   */
  protected override onStatusChange(oldStatus: AgentStatus, newStatus: AgentStatus): void {
    if (newStatus === AgentStatus.DISCONNECTED && this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  /**
   * Override destroy to clean up HTTP-specific resources
   */
  override destroy(): void {
    super.destroy();
    this.disconnect().catch(console.error);
  }
}