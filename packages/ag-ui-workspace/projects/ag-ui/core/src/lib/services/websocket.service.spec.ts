import { TestBed } from '@angular/core/testing';
import { WebSocketService, WebSocketConfig, WebSocketStatus } from './websocket.service';

// Mock WebSocket for testing
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(public url: string, public protocols?: string | string[]) {}

  send(data: string): void {
    // Mock implementation
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      const closeEvent = new CloseEvent('close', { code: code || 1000, reason: reason || '' });
      this.onclose(closeEvent);
    }
  }

  // Helper methods for testing
  triggerOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  triggerError(error: Event): void {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

// Store original WebSocket
const OriginalWebSocket = (globalThis as any).WebSocket;

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockConfig: WebSocketConfig;

  beforeEach(() => {
    // Mock global WebSocket
    (globalThis as any).WebSocket = MockWebSocket as any;

    mockConfig = {
      url: 'wss://api.example.com/ws',
      autoReconnect: false
    };

    TestBed.configureTestingModule({
      providers: [WebSocketService]
    });

    service = TestBed.inject(WebSocketService);
    service.configure(mockConfig);
  });

  afterEach(() => {
    service.destroy();
    // Restore original WebSocket
    (globalThis as any).WebSocket = OriginalWebSocket;
  });

  describe('Configuration', () => {
    it('should accept configuration on construction', () => {
      expect(service.currentStatus).toBe(WebSocketStatus.DISCONNECTED);
    });
  });

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      const connectPromise = service.connect();

      // Simulate WebSocket opening
      const mockWebSocket = new MockWebSocket(mockConfig.url);
      mockWebSocket.triggerOpen();

      await connectPromise;
      expect(service.currentStatus).toBe(WebSocketStatus.CONNECTED);
    });

    it('should disconnect successfully', async () => {
      // First connect
      await service.connect();
      expect(service.currentStatus).toBe(WebSocketStatus.CONNECTED);

      // Then disconnect
      service.disconnect();
      expect(service.currentStatus).toBe(WebSocketStatus.DISCONNECTED);
    });
  });

  describe('Message Sending', () => {
    beforeEach(async () => {
      await service.connect();
      // Mock connection established
    });

    it('should throw error when not connected', () => {
      service.disconnect();
      
      expect(() => {
        service.sendMessage('test');
      }).toThrowError('WebSocket is not connected');
    });
  });

  describe('Status Changes', () => {
    it('should emit status changes', (done) => {
      const statuses: WebSocketStatus[] = [];
      
      service.status$.subscribe(status => {
        statuses.push(status);
        if (statuses.length >= 1) {
          expect(statuses[0]).toBe(WebSocketStatus.CONNECTING);
          done();
        }
      });

      service.connect();
    });
  });

  describe('Cleanup', () => {
    it('should handle multiple destroy calls gracefully', () => {
      expect(() => {
        service.destroy();
        service.destroy();
        service.destroy();
      }).not.toThrow();
    });
  });

  describe('Utility Properties', () => {
    it('should report connection status correctly', () => {
      expect(service.isConnected).toBe(false);
    });
  });
});