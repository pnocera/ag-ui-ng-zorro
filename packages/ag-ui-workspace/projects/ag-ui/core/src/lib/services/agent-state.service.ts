import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { 
  AGUIEvent, 
  Message, 
  StateDeltaEvent, 
  TextMessageStartEvent, 
  TextMessageContentEvent, 
  TextMessageEndEvent, 
  ToolCallStartEvent, 
  ToolCallArgsEvent,
  ToolCallResultEvent, 
  ToolCallEndEvent,
  RunStartedEvent, 
  RunFinishedEvent, 
  RunErrorEvent,
  StepStartedEvent,
  StepFinishedEvent,
  StateSnapshotEvent,
  MessagesSnapshotEvent
} from '../types/events';
import { AgentStatus } from '../types/abstract-agent';

/**
 * Interface for agent state
 */
export interface AgentState {
  /** Current agent status */
  status: AgentStatus;
  /** Current thread ID */
  threadId: string | null;
  /** Current run ID */
  runId: string | null;
  /** Messages in the conversation */
  messages: Message[];
  /** Current state snapshot */
  state: Record<string, any>;
  /** Active tool calls */
  activeToolCalls: Map<string, ToolCallState>;
  /** Current step name */
  currentStep: string | null;
  /** Error information */
  error: ErrorInfo | null;
}

/**
 * Interface for tool call state
 */
export interface ToolCallState {
  /** Tool call ID */
  id: string;
  /** Tool name */
  name: string;
  /** Arguments accumulated so far */
  args: string;
  /** Tool call status */
  status: 'pending' | 'running' | 'completed' | 'error';
  /** Result when completed */
  result?: any;
  /** Parent message ID */
  parentMessageId?: string;
}

/**
 * Interface for error information
 */
export interface ErrorInfo {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Error timestamp */
  timestamp: number;
}

/**
 * State management service for AG-UI agents
 * Uses Angular Signals for reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class AgentStateService {
  // Core state signals
  private status = signal<AgentStatus>(AgentStatus.IDLE);
  private threadId = signal<string | null>(null);
  private runId = signal<string | null>(null);
  private messages = signal<Message[]>([]);
  private state = signal<Record<string, any>>({});
  private activeToolCalls = signal<Map<string, ToolCallState>>(new Map());
  private currentStep = signal<string | null>(null);
  private error = signal<ErrorInfo | null>(null);

  // Computed signals
  readonly isConnected = computed(() => 
    this.status() === AgentStatus.CONNECTED || this.status() === AgentStatus.RUNNING
  );

  readonly isRunning = computed(() => 
    this.status() === AgentStatus.RUNNING
  );

  readonly hasError = computed(() => 
    this.status() === AgentStatus.ERROR
  );

  readonly messageCount = computed(() => 
    this.messages().length
  );

  readonly activeToolCallCount = computed(() => 
    this.activeToolCalls().size
  );

  readonly currentMessage = computed(() => {
    const msgs = this.messages();
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  });

  // Observable for state changes
  private stateChangeSubject = new Subject<AgentState>();
  readonly stateChanges$: Observable<AgentState> = this.stateChangeSubject.asObservable();

  // Observable for specific event types
  private eventSubject = new Subject<AGUIEvent>();
  readonly events$ = this.eventSubject.asObservable();

  /**
   * Get current complete state
   */
  getState(): AgentState {
    return {
      status: this.status(),
      threadId: this.threadId(),
      runId: this.runId(),
      messages: this.messages(),
      state: this.state(),
      activeToolCalls: this.activeToolCalls(),
      currentStep: this.currentStep(),
      error: this.error()
    };
  }

  /**
   * Process an AG-UI event and update state accordingly
   */
  processEvent(event: AGUIEvent): void {
    // Emit the event
    this.eventSubject.next(event);

    // Process based on event type
    switch (event.type) {
      case 'RUN_STARTED':
        this.handleRunStarted(event);
        break;
      case 'RUN_FINISHED':
        this.handleRunFinished(event);
        break;
      case 'RUN_ERROR':
        this.handleRunError(event);
        break;
      case 'STEP_STARTED':
        this.handleStepStarted(event);
        break;
      case 'STEP_FINISHED':
        this.handleStepFinished(event);
        break;
      case 'TEXT_MESSAGE_START':
        this.handleTextMessageStart(event);
        break;
      case 'TEXT_MESSAGE_CONTENT':
        this.handleTextMessageContent(event);
        break;
      case 'TEXT_MESSAGE_END':
        this.handleTextMessageEnd(event);
        break;
      case 'TOOL_CALL_START':
        this.handleToolCallStart(event);
        break;
      case 'TOOL_CALL_ARGS':
        this.handleToolCallArgs(event);
        break;
      case 'TOOL_CALL_RESULT':
        this.handleToolCallResult(event);
        break;
      case 'TOOL_CALL_END':
        this.handleToolCallEnd(event);
        break;
      case 'STATE_SNAPSHOT':
        this.handleStateSnapshot(event);
        break;
      case 'STATE_DELTA':
        this.handleStateDelta(event);
        break;
      case 'MESSAGES_SNAPSHOT':
        this.handleMessagesSnapshot(event);
        break;
      default:
        console.warn('Unknown event type:', (event as any).type);
    }

    // Emit state change
    this.stateChangeSubject.next(this.getState());
  }

  /**
   * Reset all state to initial values
   */
  reset(): void {
    this.status.set(AgentStatus.IDLE);
    this.threadId.set(null);
    this.runId.set(null);
    this.messages.set([]);
    this.state.set({});
    this.activeToolCalls.set(new Map());
    this.currentStep.set(null);
    this.error.set(null);
    
    this.stateChangeSubject.next(this.getState());
  }

  /**
   * Update status manually
   */
  setStatus(status: AgentStatus): void {
    this.status.set(status);
    this.stateChangeSubject.next(this.getState());
  }

  /**
   * Get observable for specific event types
   */
  onEvent<T extends AGUIEvent>(eventType: T['type']): Observable<T> {
    return this.events$.pipe(
      filter((event): event is T => event.type === eventType)
    );
  }

  // Private event handlers

  private handleRunStarted(event: RunStartedEvent): void {
    this.threadId.set(event.thread_id);
    this.runId.set(event.run_id);
    this.status.set(AgentStatus.RUNNING);
    this.error.set(null);
  }

  private handleRunFinished(event: RunFinishedEvent): void {
    this.status.set(AgentStatus.CONNECTED);
    // Keep threadId and runId for reference
  }

  private handleRunError(event: RunErrorEvent): void {
    this.status.set(AgentStatus.ERROR);
    this.error.set({
      message: event.message,
      code: event.code,
      timestamp: Date.now()
    });
  }

  private handleStepStarted(event: StepStartedEvent): void {
    this.currentStep.set(event.step_name);
  }

  private handleStepFinished(event: StepFinishedEvent): void {
    this.currentStep.set(null);
  }

  private handleTextMessageStart(event: TextMessageStartEvent): void {
    const newMessage: Message = {
      id: event.message_id,
      role: event.role,
      content: '',
      timestamp: event.timestamp
    };

    this.messages.update(messages => [...messages, newMessage]);
  }

  private handleTextMessageContent(event: TextMessageContentEvent): void {
    this.messages.update(messages => 
      messages.map(msg => 
        msg.id === event.message_id 
          ? { ...msg, content: msg.content + event.delta }
          : msg
      )
    );
  }

  private handleTextMessageEnd(event: TextMessageEndEvent): void {
    // Message is already complete, no action needed
    // Could trigger additional processing if needed
  }

  private handleToolCallStart(event: ToolCallStartEvent): void {
    const toolCall: ToolCallState = {
      id: event.tool_call_id,
      name: event.tool_call_name,
      args: '',
      status: 'pending',
      parentMessageId: event.parent_message_id
    };

    this.activeToolCalls.update(calls => new Map(calls).set(event.tool_call_id, toolCall));
  }

  private handleToolCallArgs(event: ToolCallArgsEvent): void {
    this.activeToolCalls.update(calls => {
      const newCalls = new Map(calls);
      const toolCall = newCalls.get(event.tool_call_id);
      if (toolCall) {
        toolCall.args += event.delta;
        toolCall.status = 'running';
      }
      return newCalls;
    });
  }

  private handleToolCallResult(event: ToolCallResultEvent): void {
    this.activeToolCalls.update(calls => {
      const newCalls = new Map(calls);
      const toolCall = newCalls.get(event.tool_call_id);
      if (toolCall) {
        toolCall.result = event.result;
        toolCall.status = 'completed';
      }
      return newCalls;
    });
  }

  private handleToolCallEnd(event: ToolCallEndEvent): void {
    this.activeToolCalls.update(calls => {
      const newCalls = new Map(calls);
      const toolCall = newCalls.get(event.tool_call_id);
      if (toolCall && toolCall.status !== 'completed') {
        toolCall.status = 'error';
      }
      return newCalls;
    });
  }

  private handleStateSnapshot(event: StateSnapshotEvent): void {
    this.state.set(event.snapshot);
  }

  private handleStateDelta(event: StateDeltaEvent): void {
    this.state.update(currentState => {
      // Apply JSON patch operations
      let newState = { ...currentState };
      for (const operation of event.delta) {
        newState = this.applyJsonPatch(newState, operation);
      }
      return newState;
    });
  }

  private handleMessagesSnapshot(event: MessagesSnapshotEvent): void {
    this.messages.set(event.messages);
  }

  /**
   * Apply a single JSON patch operation
   */
  private applyJsonPatch(obj: any, operation: any): any {
    const newObj = { ...obj };
    
    switch (operation.op) {
      case 'add':
        this.setNestedProperty(newObj, operation.path, operation.value);
        break;
      case 'remove':
        this.removeNestedProperty(newObj, operation.path);
        break;
      case 'replace':
        this.setNestedProperty(newObj, operation.path, operation.value);
        break;
      case 'move':
        const value = this.getNestedProperty(newObj, operation.from);
        this.removeNestedProperty(newObj, operation.from);
        this.setNestedProperty(newObj, operation.path, value);
        break;
      case 'copy':
        const copiedValue = this.getNestedProperty(newObj, operation.from);
        this.setNestedProperty(newObj, operation.path, copiedValue);
        break;
      case 'test':
        if (this.getNestedProperty(newObj, operation.path) !== operation.value) {
          throw new Error('JSON patch test operation failed');
        }
        break;
    }
    
    return newObj;
  }

  /**
   * Helper to set nested property using JSON Pointer path
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('/').slice(1); // Remove first empty element
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Helper to get nested property using JSON Pointer path
   */
  private getNestedProperty(obj: any, path: string): any {
    const keys = path.split('/').slice(1); // Remove first empty element
    let current = obj;
    
    for (const key of keys) {
      if (current == null || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Helper to remove nested property using JSON Pointer path
   */
  private removeNestedProperty(obj: any, path: string): void {
    const keys = path.split('/').slice(1); // Remove first empty element
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        return;
      }
      current = current[key];
    }
    
    delete current[keys[keys.length - 1]];
  }
}