import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { AgChatComponent, AgChatConfig } from './ag-chat.component';
import { MessageComponent, MessageState } from '../message';
import { ChatInputComponent, ChatInputState } from '../chat-input';
import { AgentStateService } from '@ag-ui/core';
import { Message } from '@ag-ui/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';

describe('AgChatComponent', () => {
  let component: AgChatComponent;
  let fixture: ComponentFixture<AgChatComponent>;
  let mockAgentStateService: jasmine.SpyObj<AgentStateService>;
  let stateChangeSubject: Subject<any>;

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now()
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'Hi there!',
      timestamp: Date.now()
    }
  ];

  const mockAgentState = {
    status: 'connected',
    threadId: 'thread-1',
    runId: 'run-1',
    messages: mockMessages,
    state: {},
    activeToolCalls: new Map(),
    currentStep: null,
    error: null,
    isConnected: true,
    isRunning: false,
    hasError: false,
    messageCount: 2,
    activeToolCallCount: 0,
    currentMessage: mockMessages[mockMessages.length - 1]
  };

  beforeEach(async () => {
    stateChangeSubject = new Subject();
    
    mockAgentStateService = jasmine.createSpyObj('AgentStateService', [], {
      stateChanges$: stateChangeSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        AgChatComponent,
        MessageComponent,
        ChatInputComponent,
        NzCardModule,
        NzListModule,
        NzBadgeModule,
        NzIconModule
      ],
      providers: [
        { provide: AgentStateService, useValue: mockAgentStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept config input', () => {
      const config: AgChatConfig = {
        agentName: 'Test Agent',
        userName: 'Test User',
        placeholder: 'Test placeholder',
        showTimestamps: false,
        showHelpText: false,
        enableVirtualScrolling: true
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.config).toBe(config);
    });

    it('should accept showHeader input', () => {
      component.showHeader = false;
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('.ag-chat__header'));
      expect(header).toBeFalsy();
    });

    it('should accept title input', () => {
      component.title = 'Custom Chat Title';
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.ag-chat__title h3'));
      expect(titleElement.nativeElement.textContent).toContain('Custom Chat Title');
    });

    it('should accept emptyMessage input', () => {
      component.emptyMessage = 'No messages yet';
      fixture.detectChanges();

      // Need to trigger empty state
      stateChangeSubject.next({ messages: [] });
      fixture.detectChanges();

      const emptyElement = fixture.debugElement.query(By.css('nz-list-empty'));
      expect(emptyElement.nativeElement.textContent).toContain('No messages yet');
    });
  });

  describe('State management', () => {
    it('should update messages when state changes', () => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();

      expect(component.messages()).toEqual(mockMessages);
    });

    it('should reflect running state', () => {
      const runningState = { ...mockAgentState, isRunning: true, status: 'running' };
      stateChangeSubject.next(runningState);
      fixture.detectChanges();

      expect(component.loading).toBeTruthy();
      expect(component.statusBadgeType).toBe('processing');
      expect(component.statusText).toBe('Running');
    });

    it('should reflect error state', () => {
      const errorState = { ...mockAgentState, hasError: true, status: 'error' };
      stateChangeSubject.next(errorState);
      fixture.detectChanges();

      expect(component.statusBadgeType).toBe('error');
      expect(component.statusText).toBe('Error');
    });

    it('should reflect connected state', () => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();

      expect(component.statusBadgeType).toBe('success');
      expect(component.statusText).toBe('Connected');
    });

    it('should reflect disconnected state', () => {
      const disconnectedState = { ...mockAgentState, isConnected: false, status: 'idle' };
      stateChangeSubject.next(disconnectedState);
      fixture.detectChanges();

      expect(component.statusBadgeType).toBe('default');
      expect(component.statusText).toBe('Disconnected');
    });
  });

  describe('Input state management', () => {
    it('should disable input when agent is running', () => {
      const runningState = { ...mockAgentState, isRunning: true };
      stateChangeSubject.next(runningState);
      fixture.detectChanges();

      const inputState = component.inputState;
      expect(inputState.disabled).toBeTruthy();
      expect(inputState.loading).toBeTruthy();
    });

    it('should enable input when agent is not running', () => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();

      const inputState = component.inputState;
      expect(inputState.disabled).toBeFalsy();
      expect(inputState.loading).toBeFalsy();
    });
  });

  describe('Message rendering', () => {
    beforeEach(() => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();
    });

    it('should render messages in list', () => {
      const messageElements = fixture.debugElement.queryAll(By.css('ag-message'));
      expect(messageElements.length).toBe(mockMessages.length);
    });

    it('should pass correct message to each message component', () => {
      const messageElements = fixture.debugElement.queryAll(By.css('ag-message'));
      
      messageElements.forEach((messageElement, index) => {
        const messageComponent = messageElement.componentInstance;
        expect(messageComponent.message).toBe(mockMessages[index]);
      });
    });

    it('should pass correct state to streaming message', () => {
      const streamingState = { 
        ...mockAgentState, 
        isRunning: true,
        currentMessage: mockMessages[0]
      };
      stateChangeSubject.next(streamingState);
      fixture.detectChanges();

      const messageElements = fixture.debugElement.queryAll(By.css('ag-message'));
      const firstMessageComponent = messageElements[0].componentInstance;
      const messageState = firstMessageComponent.state;
      
      expect(messageState.isStreaming).toBeTruthy();
      expect(messageState.isComplete).toBeFalsy();
    });

    it('should pass correct state to completed message', () => {
      const streamingState = { 
        ...mockAgentState, 
        isRunning: true,
        currentMessage: mockMessages[0]
      };
      stateChangeSubject.next(streamingState);
      fixture.detectChanges();

      const messageElements = fixture.debugElement.queryAll(By.css('ag-message'));
      const secondMessageComponent = messageElements[1].componentInstance;
      const messageState = secondMessageComponent.state;
      
      expect(messageState.isStreaming).toBeFalsy();
      expect(messageState.isComplete).toBeTruthy();
    });
  });

  describe('Output events', () => {
    it('should emit messageSent when input sends message', () => {
      spyOn(component.messageSent, 'emit');
      
      component.onMessageSent('Test message');
      
      expect(component.messageSent.emit).toHaveBeenCalledWith('Test message');
    });

    it('should emit chatCleared when chat is cleared', () => {
      spyOn(component.chatCleared, 'emit');
      spyOn(mockAgentStateService, 'reset');
      
      component.clearChat();
      
      expect(mockAgentStateService.reset).toHaveBeenCalled();
      expect(component.chatCleared.emit).toHaveBeenCalled();
    });
  });

  describe('Scrolling functionality', () => {
    beforeEach(() => {
      spyOn(component, 'scrollToBottom');
    });

    it('should scroll to bottom on state changes', () => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.scrollToBottom).toHaveBeenCalled();
      }, 150);
    });
  });

  describe('Configuration defaults', () => {
    it('should set default configuration values', () => {
      expect(component.config.agentName).toBe('Assistant');
      expect(component.config.userName).toBe('You');
      expect(component.config.placeholder).toBe('Type your message...');
      expect(component.config.showTimestamps).toBeTruthy();
      expect(component.config.showHelpText).toBeTruthy();
      expect(component.config.enableVirtualScrolling).toBeFalsy();
    });

    it('should merge custom config with defaults', () => {
      component.config = { agentName: 'Custom Agent' };
      fixture.detectChanges();

      expect(component.config.agentName).toBe('Custom Agent');
      expect(component.config.userName).toBe('You'); // Should retain default
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const chatElement = fixture.debugElement.query(By.css('.ag-chat'));
      const cardElement = fixture.debugElement.query(By.css('nz-card'));
      const headerElement = fixture.debugElement.query(By.css('.ag-chat__header'));
      const messagesContainer = fixture.debugElement.query(By.css('.ag-chat__messages-container'));

      expect(chatElement).toBeTruthy();
      expect(cardElement).toBeTruthy();
      expect(headerElement).toBeTruthy();
      expect(messagesContainer).toBeTruthy();
    });

    it('should have proper heading structure', () => {
      const titleElement = fixture.debugElement.query(By.css('.ag-chat__title h3'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.tagName.toLowerCase()).toBe('h3');
    });

    it('should show status badge for screen readers', () => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();

      const statusBadge = fixture.debugElement.query(By.css('.ag-chat__status-badge'));
      expect(statusBadge).toBeTruthy();
      expect(statusBadge.nativeElement.textContent).toContain('Connected');
    });
  });

  describe('Empty state', () => {
    it('should show empty message when no messages', () => {
      stateChangeSubject.next({ messages: [] });
      fixture.detectChanges();

      const emptyElement = fixture.debugElement.query(By.css('nz-list-empty'));
      expect(emptyElement).toBeTruthy();
      expect(emptyElement.nativeElement.textContent).toContain('Start a conversation...');
    });

    it('should not show empty message when messages exist', () => {
      stateChangeSubject.next(mockAgentState);
      fixture.detectChanges();

      const emptyElement = fixture.debugElement.query(By.css('nz-list-empty'));
      expect(emptyElement).toBeFalsy();
    });
  });

  describe('Header functionality', () => {
    it('should show header when showHeader is true', () => {
      component.showHeader = true;
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('.ag-chat__header'));
      expect(header).toBeTruthy();
    });

    it('should hide header when showHeader is false', () => {
      component.showHeader = false;
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('.ag-chat__header'));
      expect(header).toBeFalsy();
    });

    it('should display title icon', () => {
      const titleIcon = fixture.debugElement.query(By.css('.ag-chat__title-icon'));
      expect(titleIcon).toBeTruthy();
      expect(titleIcon.nativeElement.getAttribute('nztype')).toBe('message');
    });
  });

  describe('Message input integration', () => {
    it('should pass correct config to chat input', () => {
      component.config = {
        placeholder: 'Custom placeholder',
        showHelpText: false
      };
      fixture.detectChanges();

      const chatInput = fixture.debugElement.query(By.css('ag-chat-input'));
      const chatInputComponent = chatInput.componentInstance;
      
      expect(chatInputComponent.placeholder).toBe('Custom placeholder');
      expect(chatInputComponent.showHelpText).toBeFalsy();
    });

    it('should pass correct state to chat input', () => {
      const runningState = { ...mockAgentState, isRunning: true };
      stateChangeSubject.next(runningState);
      fixture.detectChanges();

      const chatInput = fixture.debugElement.query(By.css('ag-chat-input'));
      const chatInputComponent = chatInput.componentInstance;
      
      expect(chatInputComponent.state.disabled).toBeTruthy();
      expect(chatInputComponent.state.loading).toBeTruthy();
    });
  });
});

// Integration test for accessibility
@Component({
  standalone: true,
  imports: [
    AgChatComponent,
    MessageComponent,
    ChatInputComponent,
    NzCardModule,
    NzListModule,
    NzBadgeModule,
    NzIconModule
  ],
  template: `
    <ag-chat
      [config]="config"
      [showHeader]="showHeader"
      [title]="title"
      [emptyMessage]="emptyMessage"
      (messageSent)="onMessageSent($event)"
      (chatCleared)="onChatCleared()">
    </ag-chat>
  `
})
class TestHostComponent {
  config: AgChatConfig = {
    agentName: 'Test Agent',
    userName: 'Test User'
  };
  showHeader = true;
  title = 'Test Chat';
  emptyMessage = 'No messages';

  lastMessageSent = '';

  onMessageSent(message: string) {
    this.lastMessageSent = message;
  }

  onChatCleared() {
    // Handle chat cleared
  }
}

describe('AgChatComponent Integration', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let mockAgentStateService: jasmine.SpyObj<AgentStateService>;
  let stateChangeSubject: Subject<any>;

  beforeEach(async () => {
    stateChangeSubject = new Subject();
    
    mockAgentStateService = jasmine.createSpyObj('AgentStateService', ['reset'], {
      stateChanges$: stateChangeSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: AgentStateService, useValue: mockAgentStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should integrate properly with host component', () => {
    const chatElement = fixture.debugElement.query(By.css('ag-chat'));
    expect(chatElement).toBeTruthy();
  });

  it('should reflect host component configuration', () => {
    const chatElement = fixture.debugElement.query(By.css('ag-chat'));
    const chatComponent = chatElement.componentInstance;
    
    expect(chatComponent.config.agentName).toBe('Test Agent');
    expect(chatComponent.title).toBe('Test Chat');
  });

  it('should emit events to host component', () => {
    const chatElement = fixture.debugElement.query(By.css('ag-chat'));
    const chatComponent = chatElement.componentInstance;
    
    chatComponent.onMessageSent('Integration test message');
    
    expect(component.lastMessageSent).toBe('Integration test message');
  });

  it('should handle state changes properly', () => {
    const mockState = {
      status: 'connected',
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi!' }
      ],
      isConnected: true,
      isRunning: false,
      hasError: false
    };

    stateChangeSubject.next(mockState);
    fixture.detectChanges();

    const messages = fixture.debugElement.queryAll(By.css('ag-message'));
    expect(messages.length).toBe(2);
  });
});