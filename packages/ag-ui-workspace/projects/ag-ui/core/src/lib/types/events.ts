/**
 * Base interface for all AG-UI protocol events
 */
export interface BaseEvent {
  /** Event type discriminator */
  type: string;
  /** Optional numeric timestamp */
  timestamp?: number;
  /** Optional raw payload */
  rawEvent?: any;
}

// ================================
// MESSAGING EVENTS
// ================================

/**
 * Marks the beginning of a new text message from the assistant
 */
export interface TextMessageStartEvent extends BaseEvent {
  type: 'TEXT_MESSAGE_START';
  /** Unique identifier for this message */
  message_id: string;
  /** Role of the message sender (typically 'assistant') */
  role: 'assistant' | 'user' | 'system';
}

/**
 * Streams incremental content updates for a text message
 */
export interface TextMessageContentEvent extends BaseEvent {
  type: 'TEXT_MESSAGE_CONTENT';
  /** Unique identifier for the message being updated */
  message_id: string;
  /** Non-empty string delta content */
  delta: string;
}

/**
 * Marks the completion of a text message
 */
export interface TextMessageEndEvent extends BaseEvent {
  type: 'TEXT_MESSAGE_END';
  /** Unique identifier for the completed message */
  message_id: string;
}

// ================================
// TOOL CALL EVENTS
// ================================

/**
 * Marks the beginning of a tool call execution
 */
export interface ToolCallStartEvent extends BaseEvent {
  type: 'TOOL_CALL_START';
  /** Unique identifier for this tool call */
  tool_call_id: string;
  /** Name of the tool being called */
  tool_call_name: string;
  /** Optional parent message ID */
  parent_message_id?: string;
}

/**
 * Streams incremental argument updates for a tool call
 */
export interface ToolCallArgsEvent extends BaseEvent {
  type: 'TOOL_CALL_ARGS';
  /** Unique identifier for the tool call */
  tool_call_id: string;
  /** String delta for tool arguments */
  delta: string;
}

/**
 * Contains the result of a completed tool call
 */
export interface ToolCallResultEvent extends BaseEvent {
  type: 'TOOL_CALL_RESULT';
  /** Unique identifier for the tool call */
  tool_call_id: string;
  /** Result data from the tool execution */
  result: any;
}

/**
 * Marks the completion of a tool call
 */
export interface ToolCallEndEvent extends BaseEvent {
  type: 'TOOL_CALL_END';
  /** Unique identifier for the completed tool call */
  tool_call_id: string;
}

// ================================
// STATE EVENTS
// ================================

/**
 * Provides a complete snapshot of the current state
 */
export interface StateSnapshotEvent extends BaseEvent {
  type: 'STATE_SNAPSHOT';
  /** Complete state object */
  snapshot: Record<string, any>;
}

/**
 * Provides incremental state updates using JSON Patch format
 */
export interface StateDeltaEvent extends BaseEvent {
  type: 'STATE_DELTA';
  /** JSON Patch array for incremental updates */
  delta: JsonPatchOperation[];
}

/**
 * Provides a snapshot of all messages in the conversation
 */
export interface MessagesSnapshotEvent extends BaseEvent {
  type: 'MESSAGES_SNAPSHOT';
  /** Array of message objects */
  messages: Message[];
}

// ================================
// LIFECYCLE EVENTS
// ================================

/**
 * Marks the beginning of a new run/excution
 */
export interface RunStartedEvent extends BaseEvent {
  type: 'RUN_STARTED';
  /** Unique thread identifier */
  thread_id: string;
  /** Unique run identifier */
  run_id: string;
}

/**
 * Marks the successful completion of a run
 */
export interface RunFinishedEvent extends BaseEvent {
  type: 'RUN_FINISHED';
  /** Unique thread identifier */
  thread_id: string;
  /** Unique run identifier */
  run_id: string;
  /** Optional result data */
  result?: any;
}

/**
 * Indicates that a run encountered an error
 */
export interface RunErrorEvent extends BaseEvent {
  type: 'RUN_ERROR';
  /** Error message */
  message: string;
  /** Optional error code */
  code?: string;
}

/**
 * Marks the beginning of a step within a run
 */
export interface StepStartedEvent extends BaseEvent {
  type: 'STEP_STARTED';
  /** Name of the step */
  step_name: string;
}

/**
 * Marks the completion of a step within a run
 */
export interface StepFinishedEvent extends BaseEvent {
  type: 'STEP_FINISHED';
  /** Name of the step */
  step_name: string;
}

// ================================
// SUPPORTING TYPES
// ================================

/**
 * JSON Patch operation for state delta updates
 */
export interface JsonPatchOperation {
  /** Operation type: add, remove, replace, move, copy, or test */
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  /** JSON Pointer path */
  path: string;
  /** Source path for move/copy operations */
  from?: string;
  /** Value for add/replace/test operations */
  value?: any;
}

/**
 * Message object structure
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Message role */
  role: 'assistant' | 'user' | 'system';
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp?: number;
  /** Optional metadata */
  metadata?: Record<string, any>;
}

// ================================
// UNION TYPE
// ================================

/**
 * Union type for all AG-UI protocol events
 */
export type AGUIEvent = 
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallResultEvent
  | ToolCallEndEvent
  | StateSnapshotEvent
  | StateDeltaEvent
  | MessagesSnapshotEvent
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | StepStartedEvent
  | StepFinishedEvent;

/**
 * Type guard to check if an object is a valid AG-UI event
 */
export function isAGUIEvent(obj: any): obj is AGUIEvent {
  return obj && typeof obj === 'object' && typeof obj.type === 'string';
}

/**
 * Event type mapping for type-safe event handling
 */
export const EVENT_TYPES = {
  TEXT_MESSAGE_START: 'TEXT_MESSAGE_START',
  TEXT_MESSAGE_CONTENT: 'TEXT_MESSAGE_CONTENT',
  TEXT_MESSAGE_END: 'TEXT_MESSAGE_END',
  TOOL_CALL_START: 'TOOL_CALL_START',
  TOOL_CALL_ARGS: 'TOOL_CALL_ARGS',
  TOOL_CALL_RESULT: 'TOOL_CALL_RESULT',
  TOOL_CALL_END: 'TOOL_CALL_END',
  STATE_SNAPSHOT: 'STATE_SNAPSHOT',
  STATE_DELTA: 'STATE_DELTA',
  MESSAGES_SNAPSHOT: 'MESSAGES_SNAPSHOT',
  RUN_STARTED: 'RUN_STARTED',
  RUN_FINISHED: 'RUN_FINISHED',
  RUN_ERROR: 'RUN_ERROR',
  STEP_STARTED: 'STEP_STARTED',
  STEP_FINISHED: 'STEP_FINISHED'
} as const;