import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, takeUntil, map } from 'rxjs';
import { Message } from '@ag-ui/core';
import { AgentStateService, AgentState } from '@ag-ui/core';
import { MessageComponent, MessageState } from '../message';
import { ChatInputComponent, ChatInputState } from '../chat-input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgIf } from '@angular/common';

export interface AgChatConfig {
  agentName?: string;
  userName?: string;
  placeholder?: string;
  showTimestamps?: boolean;
  showHelpText?: boolean;
  enableVirtualScrolling?: boolean;
}

@Component({
  selector: 'ag-chat',
  standalone: true,
  imports: [
    MessageComponent, 
    ChatInputComponent,
    NzCardModule,
    NzListModule,
    NzBadgeModule,
    NzIconModule,
    NgIf
  ],
  template: `
    <div class="ag-chat">
      <nz-card 
        [nzBordered]="false"
        [nzBodyStyle]="{ padding: 0, height: '100%' }"
        class="ag-chat__card">
        
        <!-- Chat Header -->
        <div class="ag-chat__header" *ngIf="showHeader">
          <div class="ag-chat__title">
            <span nz-icon nzType="message" class="ag-chat__title-icon"></span>
            <h3>{{ title }}</h3>
          </div>
          
          <div class="ag-chat__status">
            <nz-badge 
              [nzStatus]="statusBadgeType"
              [nzText]="statusText"
              class="ag-chat__status-badge">
            </nz-badge>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="ag-chat__messages-container" #messagesContainer>
          <nz-list
            [nzDataSource]="messages()"
            [nzRenderItem]="messageTemplate"
            [nzLoading]="loading"
            class="ag-chat__messages-list">
            
            <ng-template #messageTemplate let-message>
              <ag-message
                [message]="message"
                [state]="getMessageState(message)"
                [agentName]="config.agentName || 'Assistant'"
                [userName]="config.userName || 'You'"
                class="ag-chat__message">
              </ag-message>
            </ng-template>
            
            <nz-list-empty *ngIf="messages().length === 0 && !loading">
              {{ emptyMessage }}
            </nz-list-empty>
          </nz-list>
        </div>

        <!-- Chat Input -->
        <ag-chat-input
          [state]="inputState"
          [placeholder]="config.placeholder || 'Type your message...'"
          [showHelpText]="config.showHelpText ?? true"
          (messageSent)="onMessageSent($event)"
          class="ag-chat__input">
        </ag-chat-input>
      </nz-card>
    </div>
  `,
  styles: [`
    .ag-chat {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .ag-chat__card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .ag-chat__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
    }

    .ag-chat__title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ag-chat__title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .ag-chat__title-icon {
      color: #1890ff;
    }

    .ag-chat__status-badge {
      font-size: 12px;
    }

    .ag-chat__messages-container {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
      background: #fff;
    }

    .ag-chat__messages-list {
      padding: 16px 20px;
      min-height: 100%;
    }

    .ag-chat__message {
      margin-bottom: 16px;
    }

    .ag-chat__message:last-child {
      margin-bottom: 0;
    }

    .ag-chat__input {
      border-top: 1px solid #f0f0f0;
    }

    /* Scrollbar styling */
    .ag-chat__messages-container::-webkit-scrollbar {
      width: 6px;
    }

    .ag-chat__messages-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .ag-chat__messages-container::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .ag-chat__messages-container::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Loading animation */
    .ag-chat__loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: #8c8c8c;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .ag-chat__header {
        padding: 12px 16px;
      }

      .ag-chat__messages-list {
        padding: 12px 16px;
      }

      .ag-chat__title h3 {
        font-size: 14px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() config: AgChatConfig = {};
  @Input() showHeader = true;
  @Input() title = 'Chat Assistant';
  @Input() emptyMessage = 'Start a conversation...';

  @Output() messageSent = new EventEmitter<string>();
  @Output() chatCleared = new EventEmitter<void>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private destroy$ = new Subject<void>();

agentState: Signal<AgentState | undefined>;
  messages: Signal<Message[]>;

  constructor(private agentStateService: AgentStateService) {
    this.agentState = toSignal(
      this.agentStateService.stateChanges$.pipe(takeUntil(this.destroy$))
    );
    
    this.messages = toSignal(
      this.agentStateService.stateChanges$.pipe(
        takeUntil(this.destroy$),
        map((state: AgentState | undefined) => state?.messages || [])
      ),
      { initialValue: [] }
    );
  }

  ngOnInit(): void {
    // Set default configuration
    this.config = {
      agentName: 'Assistant',
      userName: 'You',
      placeholder: 'Type your message...',
      showTimestamps: true,
      showHelpText: true,
      enableVirtualScrolling: false,
      ...this.config
    };

    // Subscribe to state changes
    this.agentStateService.stateChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => this.scrollToBottom(), 100);
      });
  }

  ngAfterViewInit(): void {
    // Initial scroll to bottom
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get loading(): boolean {
    const state = this.agentState();
    return state?.status === 'running';
  }

  get statusBadgeType(): string {
    const state = this.agentState();
    if (state?.status === 'error') return 'error';
    if (state?.status === 'running') return 'processing';
    if (state?.status === 'connected') return 'success';
    return 'default';
  }

  get statusText(): string {
    const state = this.agentState();
    if (state?.status === 'error') return 'Error';
    if (state?.status === 'running') return 'Running';
    if (state?.status === 'connected') return 'Connected';
    return 'Disconnected';
  }

  get inputState(): ChatInputState {
    const state = this.agentState();
    return {
      disabled: state?.status === 'running',
      loading: state?.status === 'running'
    };
  }

  get currentMessages(): Message[] {
    return this.messages() || [];
  }

  getMessageState(message: Message): MessageState {
    const state = this.agentState();
    const messages = state?.messages || [];
    const lastMessage = messages[messages.length - 1];
    const isLastMessage = lastMessage?.id === message.id;
    const isRunning = state?.status === 'running';
    const isAssistantMessage = message.role === 'assistant';
    
    return {
      isStreaming: isLastMessage && isRunning && isAssistantMessage && !message.content,
      isComplete: !isRunning || message.content !== undefined
    };
  }

  onMessageSent(message: string): void {
    this.messageSent.emit(message);
  }

  clearChat(): void {
    this.agentStateService.reset();
    this.chatCleared.emit();
  }

  scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  scrollToTop(): void {
    if (this.messagesContainer?.nativeElement) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = 0;
    }
  }

  focusInput(): void {
    // This would need to be implemented if we add a reference to the input component
  }
}