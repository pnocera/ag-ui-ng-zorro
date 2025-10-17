import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpAgent, HttpAgentConfig } from './http-agent.service';
import { AgentStatus } from '../types/abstract-agent';

describe('HttpAgent', () => {
  let agent: HttpAgent;
  let httpMock: HttpTestingController;
  let mockConfig: HttpAgentConfig;

  beforeEach(() => {
    mockConfig = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-api-key',
      useSSE: false
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: []
    });

    httpMock = TestBed.inject(HttpTestingController);
    agent = new HttpAgent(mockConfig);
  });

  afterEach(() => {
    httpMock.verify();
    agent.destroy();
  });

  describe('Constructor', () => {
    it('should create HttpAgent with provided config', () => {
      expect(agent.getStatus()).toBe(AgentStatus.IDLE);
      expect(agent.getConfig()).toEqual(mockConfig);
    });
  });

  describe('URL Building', () => {
    it('should build URLs correctly', () => {
      const url = (agent as any).buildUrl('/test');
      expect(url).toBe('https://api.example.com/test');
    });
  });

  describe('Header Building', () => {
    it('should build headers with API key', () => {
      const headers = (agent as any).buildHeaders();
      expect(headers.get('Authorization')).toBe('Bearer test-api-key');
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
    });
  });

  describe('Connection Management', () => {
    it('should connect successfully with health check', async () => {
      const connectPromise = agent.connect();

      const healthReq = httpMock.expectOne('https://api.example.com/health');
      expect(healthReq.request.method).toBe('GET');
      expect(healthReq.request.headers.get('Authorization')).toBe('Bearer test-api-key');
      healthReq.flush('OK');

      await connectPromise;
      expect(agent.getStatus()).toBe(AgentStatus.CONNECTED);
    });

    it('should handle connection failure', async () => {
      const connectPromise = agent.connect();

      const healthReq = httpMock.expectOne('https://api.example.com/health');
      healthReq.flush('Connection failed', { status: 500, statusText: 'Internal Server Error' });

      await expectAsync(connectPromise).toBeRejected();
      expect(agent.getStatus()).toBe(AgentStatus.ERROR);
    });

    it('should disconnect successfully', async () => {
      // First connect
      await agent.connect();
      const healthReq = httpMock.expectOne('https://api.example.com/health');
      healthReq.flush('OK');
      expect(agent.getStatus()).toBe(AgentStatus.CONNECTED);

      // Then disconnect
      await agent.disconnect();
      expect(agent.getStatus()).toBe(AgentStatus.DISCONNECTED);
    });
  });

  describe('Message Sending', () => {
    beforeEach(async () => {
      // Connect agent before sending messages
      const connectPromise = agent.connect();
      const healthReq = httpMock.expectOne('https://api.example.com/health');
      healthReq.flush('OK');
      await connectPromise;
    });

    it('should send message with options', async () => {
      const options = {
        thread_id: 'thread-123',
        data: { custom: 'value' },
        stream: false
      };

      const messagePromise = agent.sendMessage('Hello, world!', options);

      const messageReq = httpMock.expectOne('https://api.example.com/chat');
      expect(messageReq.request.method).toBe('POST');
      expect(messageReq.request.body).toEqual({
        message: 'Hello, world!',
        thread_id: 'thread-123',
        stream: false,
        custom: 'value'
      });

      messageReq.flush({ success: true });
      await messagePromise;
    });
  });
});