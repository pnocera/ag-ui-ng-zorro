import { Injectable } from '@angular/core';
import { AgentStateService } from '@ag-ui/core';
import { AGUIEvent, TextMessageStartEvent, TextMessageContentEvent, TextMessageEndEvent, RunStartedEvent, RunFinishedEvent } from '@ag-ui/core';
import { Subject, delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockAgentService {
  constructor(private agentStateService: AgentStateService) {}

  async sendMessage(message: string): Promise<void> {
    // Simulate processing delay
    await this.delay(1000);

    // Start the run
    this.agentStateService.processEvent({
      type: 'RUN_STARTED',
      thread_id: 'thread-' + Date.now(),
      run_id: 'run-' + Date.now()
    } as RunStartedEvent);

    // Add user message
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: 'msg-user-' + Date.now(),
      role: 'user',
      timestamp: Date.now()
    } as TextMessageStartEvent);

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: 'msg-user-' + Date.now(),
      delta: message
    } as TextMessageContentEvent);

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_END',
      message_id: 'msg-user-' + Date.now()
    } as TextMessageEndEvent);

    // Simulate agent thinking
    await this.delay(500);

    // Generate assistant response
    const response = this.generateResponse(message);
    const messageId = 'msg-assistant-' + Date.now();

    // Start assistant message
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: messageId,
      role: 'assistant',
      timestamp: Date.now()
    } as TextMessageStartEvent);

    // Simulate streaming response
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      await this.delay(50);
      const delta = (i > 0 ? ' ' : '') + words[i];
      this.agentStateService.processEvent({
        type: 'TEXT_MESSAGE_CONTENT',
        message_id: messageId,
        delta: delta
      } as TextMessageContentEvent);
    }

    // End assistant message
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_END',
      message_id: messageId
    } as TextMessageEndEvent);

    // Finish the run
    this.agentStateService.processEvent({
      type: 'RUN_FINISHED',
      thread_id: 'thread-' + Date.now(),
      run_id: 'run-' + Date.now()
    } as RunFinishedEvent);
  }

  private generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple rule-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I help you today?';
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing well, thank you for asking! I'm here to assist you with any questions you might have.";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return 'Goodbye! Feel free to come back anytime you need assistance.';
    }
    
    if (lowerMessage.includes('help')) {
      return 'I can help you with various topics. Try asking me questions about programming, general knowledge, or just have a conversation with me!';
    }
    
    if (lowerMessage.includes('weather')) {
      return "I'm sorry, I don't have access to real-time weather data. You might want to check a weather service for current conditions.";
    }
    
    if (lowerMessage.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    
    if (lowerMessage.includes('name')) {
      return "I'm a chat assistant powered by AG-UI. I'm here to help demonstrate the capabilities of the AG-UI library.";
    }
    
    // Default response
    const defaultResponses = [
      "That's an interesting point! Tell me more about what you're thinking.",
      "I understand. Is there anything specific you'd like to explore further?",
      "Thanks for sharing that with me. How can I help you with this topic?",
      "That's a great question! Let me think about the best way to respond.",
      "I appreciate you reaching out. What would you like to discuss next?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}