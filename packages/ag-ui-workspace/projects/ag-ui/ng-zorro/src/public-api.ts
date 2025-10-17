/*
 * Public API Surface of ng-zorro
 */

// Export all components and utilities
export * from './lib/ng-zorro';

// Export individual components for tree-shaking
export { AgChatComponent } from './lib/components/ag-chat';
export { MessageComponent } from './lib/components/message';
export { ChatInputComponent } from './lib/components/chat-input';

// Export types
export type { AgChatConfig } from './lib/components/ag-chat';
export type { MessageState } from './lib/components/message';
export type { ChatInputState } from './lib/components/chat-input';
