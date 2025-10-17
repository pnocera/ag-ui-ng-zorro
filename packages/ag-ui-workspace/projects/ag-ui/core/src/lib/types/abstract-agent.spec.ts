import { TestBed } from '@angular/core/testing';
import { AbstractAgent, AgentConfig, AgentStatus } from './abstract-agent';
import { AGUIEvent, TextMessageStartEvent } from './events';

// Test implementation of AbstractAgent for testing purposes
class TestAgent extends AbstractAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.setStatus(AgentStatus.CONNECTED);
  }

  async disconnect(): Promise<void> {
    this.setStatus(AgentStatus.DISCONNECTED);
  }

  async sendMessage(message: string, options?: any): Promise<void> {
    this.setStatus(AgentStatus.RUNNING);
    
    this.emitEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: 'test-msg-1',
      role: 'assistant'
    } as TextMessageStartEvent);
  }

  async sendEvent(event: any): Promise<void> {
    this.emitEvent(event);
  }
}

describe('AbstractAgent', () => {
  let agent: TestAgent;
  let mockConfig: AgentConfig;

  beforeEach(() => {
    mockConfig = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-api-key',
      headers: { 'Custom-Header': 'test-value' },
      timeout: 30000
    };

    agent = new TestAgent(mockConfig);
  });

  afterEach(() => {
    agent.destroy();
  });

  describe('Constructor', () => {
    it('should create agent with provided config', () => {
      expect(agent.getConfig()).toEqual(mockConfig);
      expect(agent.getStatus()).toBe(AgentStatus.IDLE);
    });

    it('should create event stream observable', () => {
      expect(agent.events).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should return a copy of config', () => {
      const config = agent.getConfig();
      config.baseUrl = 'modified-url';
      
      expect(agent.getConfig().baseUrl).toBe('https://api.example.com');
    });

    it('should update config correctly', () => {
      agent.updateConfig({ timeout: 60000 });
      expect(agent.getConfig().timeout).toBe(60000);
      
      agent.updateConfig({ baseUrl: 'https://new-api.example.com' });
      expect(agent.getConfig().baseUrl).toBe('https://new-api.example.com');
      expect(agent.getConfig().timeout).toBe(60000);
    });
  });

  describe('Event Emission', () => {
    it('should emit events to event stream', (done) => {
      const testEvent: TextMessageStartEvent = {
        type: 'TEXT_MESSAGE_START',
        message_id: 'test-msg-123',
        role: 'assistant'
      };

      agent.events.subscribe(event => {
        expect(event).toEqual(testEvent);
        expect(event.timestamp).toBeDefined();
        done();
      });

      // Send a message which should emit an event
      agent.sendMessage('test');
    });
  });

  describe('Abstract Methods', () => {
    it('should implement required abstract methods', async () => {
      await agent.connect();
      expect(agent.getStatus()).toBe(AgentStatus.CONNECTED);

      await agent.sendMessage('Hello');
      expect(agent.getStatus()).toBe(AgentStatus.RUNNING);

      await agent.sendEvent({ type: 'TEST_EVENT' });

      await agent.disconnect();
      expect(agent.getStatus()).toBe(AgentStatus.DISCONNECTED);
    });
  });

  describe('Cleanup', () => {
    it('should handle multiple destroy calls gracefully', () => {
      expect(() => {
        agent.destroy();
        agent.destroy();
        agent.destroy();
      }).not.toThrow();
    });
  });
});