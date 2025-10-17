import { TestBed } from '@angular/core/testing';
import { AgentStateService } from './agent-state.service';
import { AgentStatus } from '../types/abstract-agent';
import { 
  TextMessageStartEvent, 
  RunStartedEvent 
} from '../types/events';

describe('AgentStateService', () => {
  let service: AgentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentStateService]
    });
    service = TestBed.inject(AgentStateService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('Initial State', () => {
    it('should start with correct initial state', () => {
      const state = service.getState();
      
      expect(state.status).toBe(AgentStatus.IDLE);
      expect(state.threadId).toBeNull();
      expect(state.runId).toBeNull();
      expect(state.messages).toEqual([]);
      expect(state.state).toEqual({});
      expect(state.activeToolCalls).toEqual(new Map());
      expect(state.currentStep).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should have correct computed signals', () => {
      expect(service.isConnected()).toBe(false);
      expect(service.isRunning()).toBe(false);
      expect(service.hasError()).toBe(false);
      expect(service.messageCount()).toBe(0);
      expect(service.activeToolCallCount()).toBe(0);
      expect(service.currentMessage()).toBeNull();
    });
  });

  describe('Status Management', () => {
    it('should update status correctly', () => {
      service.setStatus(AgentStatus.CONNECTED);
      expect(service.getState().status).toBe(AgentStatus.CONNECTED);
      expect(service.isConnected()).toBe(true);
      expect(service.isRunning()).toBe(false);
      expect(service.hasError()).toBe(false);

      service.setStatus(AgentStatus.RUNNING);
      expect(service.getState().status).toBe(AgentStatus.RUNNING);
      expect(service.isConnected()).toBe(true);
      expect(service.isRunning()).toBe(true);
      expect(service.hasError()).toBe(false);

      service.setStatus(AgentStatus.ERROR);
      expect(service.getState().status).toBe(AgentStatus.ERROR);
      expect(service.isConnected()).toBe(false);
      expect(service.isRunning()).toBe(false);
      expect(service.hasError()).toBe(true);
    });
  });

  describe('Event Processing', () => {
    it('should handle TEXT_MESSAGE_START event', () => {
      const event: TextMessageStartEvent = {
        type: 'TEXT_MESSAGE_START',
        message_id: 'msg-123',
        role: 'assistant',
        timestamp: 1234567890
      };

      service.processEvent(event);

      const state = service.getState();
      expect(state.messages.length).toBe(1);
      expect(state.messages[0]).toEqual({
        id: 'msg-123',
        role: 'assistant',
        content: '',
        timestamp: 1234567890
      });
    });

    it('should handle RUN_STARTED event', () => {
      const event: RunStartedEvent = {
        type: 'RUN_STARTED',
        thread_id: 'thread-123',
        run_id: 'run-456'
      };

      service.processEvent(event);

      const state = service.getState();
      expect(state.threadId).toBe('thread-123');
      expect(state.runId).toBe('run-456');
      expect(state.status).toBe(AgentStatus.RUNNING);
      expect(state.error).toBeNull();
    });

    it('should emit state changes for each processed event', () => {
      const stateChanges: any[] = [];
      service.stateChanges$.subscribe(state => stateChanges.push(state));

      service.processEvent({
        type: 'RUN_STARTED',
        thread_id: 'thread-123',
        run_id: 'run-456'
      });

      expect(stateChanges.length).toBe(1);
      expect(stateChanges[0].status).toBe(AgentStatus.RUNNING);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state to initial values', () => {
      // Set up some state
      service.setStatus(AgentStatus.RUNNING);
      service.processEvent({
        type: 'RUN_STARTED',
        thread_id: 'thread-123',
        run_id: 'run-456'
      });
      service.processEvent({
        type: 'TEXT_MESSAGE_START',
        message_id: 'msg-1',
        role: 'assistant'
      });

      // Reset
      service.reset();

      const state = service.getState();
      expect(state.status).toBe(AgentStatus.IDLE);
      expect(state.threadId).toBeNull();
      expect(state.runId).toBeNull();
      expect(state.messages).toEqual([]);
      expect(state.state).toEqual({});
      expect(state.activeToolCalls).toEqual(new Map());
      expect(state.currentStep).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});