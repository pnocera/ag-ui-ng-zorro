import { 
  BaseEvent, 
  TextMessageStartEvent, 
  ToolCallStartEvent, 
  AGUIEvent,
  isAGUIEvent,
  EVENT_TYPES,
  Message
} from './events';

describe('AG-UI Event Types', () => {
  describe('BaseEvent', () => {
    it('should create a valid BaseEvent', () => {
      const event: BaseEvent = {
        type: 'TEST_EVENT',
        timestamp: Date.now(),
        rawEvent: { custom: 'data' }
      };

      expect(event.type).toBe('TEST_EVENT');
      expect(event.timestamp).toBeDefined();
      expect(event.rawEvent).toEqual({ custom: 'data' });
    });

    it('should create a minimal BaseEvent', () => {
      const event: BaseEvent = {
        type: 'TEST_EVENT'
      };

      expect(event.type).toBe('TEST_EVENT');
      expect(event.timestamp).toBeUndefined();
      expect(event.rawEvent).toBeUndefined();
    });
  });

  describe('Messaging Events', () => {
    it('should create a valid TextMessageStartEvent', () => {
      const event: TextMessageStartEvent = {
        type: 'TEXT_MESSAGE_START',
        message_id: 'msg-123',
        role: 'assistant',
        timestamp: 1234567890
      };

      expect(event.type).toBe('TEXT_MESSAGE_START');
      expect(event.message_id).toBe('msg-123');
      expect(event.role).toBe('assistant');
      expect(event.timestamp).toBe(1234567890);
    });
  });

  describe('Tool Call Events', () => {
    it('should create a valid ToolCallStartEvent', () => {
      const event: ToolCallStartEvent = {
        type: 'TOOL_CALL_START',
        tool_call_id: 'tool-456',
        tool_call_name: 'search_web',
        parent_message_id: 'msg-123'
      };

      expect(event.type).toBe('TOOL_CALL_START');
      expect(event.tool_call_id).toBe('tool-456');
      expect(event.tool_call_name).toBe('search_web');
      expect(event.parent_message_id).toBe('msg-123');
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify valid AG-UI events', () => {
      const validEvent: TextMessageStartEvent = {
        type: 'TEXT_MESSAGE_START',
        message_id: 'msg-123',
        role: 'assistant'
      };

      expect(isAGUIEvent(validEvent)).toBe(true);
    });

    it('should reject invalid objects', () => {
      expect(isAGUIEvent(null)).toBe(false);
      expect(isAGUIEvent(undefined)).toBe(false);
      expect(isAGUIEvent({})).toBe(false);
      expect(isAGUIEvent({ type: 123 })).toBe(false);
      expect(isAGUIEvent('not an object')).toBe(false);
    });

    it('should reject objects with missing type', () => {
      const invalidEvent = {
        message_id: 'msg-123',
        role: 'assistant'
      };

      expect(isAGUIEvent(invalidEvent)).toBe(false);
    });
  });

  describe('Event Type Constants', () => {
    it('should contain all expected event types', () => {
      expect(EVENT_TYPES.TEXT_MESSAGE_START).toBe('TEXT_MESSAGE_START');
      expect(EVENT_TYPES.TOOL_CALL_START).toBe('TOOL_CALL_START');
      expect(EVENT_TYPES.RUN_STARTED).toBe('RUN_STARTED');
      expect(EVENT_TYPES.STATE_SNAPSHOT).toBe('STATE_SNAPSHOT');
    });
  });

  describe('Supporting Types', () => {
    it('should create a valid Message', () => {
      const message: Message = {
        id: 'msg-123',
        role: 'user',
        content: 'Hello, AI!',
        timestamp: Date.now(),
        metadata: { source: 'web' }
      };

      expect(message.id).toBe('msg-123');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, AI!');
      expect(message.timestamp).toBeDefined();
      expect(message.metadata).toEqual({ source: 'web' });
    });
  });

  describe('Event Union Type', () => {
    it('should accept all valid event types', () => {
      const events: AGUIEvent[] = [
        {
          type: 'TEXT_MESSAGE_START',
          message_id: 'msg-1',
          role: 'assistant'
        },
        {
          type: 'TOOL_CALL_START',
          tool_call_id: 'tool-1',
          tool_call_name: 'search'
        },
        {
          type: 'RUN_STARTED',
          thread_id: 'thread-1',
          run_id: 'run-1'
        }
      ];

      expect(events.length).toBe(3);
      events.forEach(event => {
        expect(isAGUIEvent(event)).toBe(true);
      });
    });
  });
});