import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

export interface ChatInputState {
  disabled: boolean;
  loading: boolean;
}

@Component({
  selector: 'ag-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzIconModule],
  template: `
    <div class="ag-chat-input" [class.ag-chat-input--disabled]="state.disabled">
      <form (ngSubmit)="onSubmit()" class="ag-chat-input__form">
        <div class="ag-chat-input__container">
          <textarea
            #textarea
            nz-input
            [nzAutosize]="{ minRows: 1, maxRows: 8 }"
            [disabled]="state.disabled"
            [placeholder]="placeholder"
            [(ngModel)]="message"
            (ngModelChange)="onInputChange()"
            (keydown)="onKeyDown($event)"
            class="ag-chat-input__textarea"
            style="resize: none;"
          ></textarea>
          
          <button 
            nz-button 
            type="submit"
            nzType="primary"
            [nzLoading]="state.loading"
            [disabled]="state.disabled || !message.trim()"
            class="ag-chat-input__send">
            <span nz-icon nzType="send" *ngIf="!state.loading"></span>
            <span class="send-text">{{ sendButtonText }}</span>
          </button>
        </div>
        
        <div class="ag-chat-input__help" *ngIf="showHelpText">
          <small>{{ helpText }}</small>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .ag-chat-input {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
    }

    .ag-chat-input--disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .ag-chat-input__form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ag-chat-input__container {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .ag-chat-input__textarea {
      flex: 1;
      min-height: 32px;
    }

    .ag-chat-input__send {
      flex-shrink: 0;
      height: auto;
      min-height: 32px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .send-text {
      margin-left: 4px;
    }

    .ag-chat-input__help {
      color: #8c8c8c;
      font-size: 12px;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .ag-chat-input {
        padding: 12px;
      }
      
      .ag-chat-input__container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .ag-chat-input__send {
        width: 100%;
        justify-content: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent implements AfterViewInit {
  @Input() state: ChatInputState = { disabled: false, loading: false };
  @Input() placeholder = 'Type your message...';
  @Input() sendButtonText = 'Send';
  @Input() showHelpText = true;
  @Input() helpText = 'Press Enter to send, Shift+Enter for new line';

  @Output() messageSent = new EventEmitter<string>();
  @Output() inputChanged = new EventEmitter<string>();

  @ViewChild('textarea', { static: true }) textareaElement!: ElementRef;

  message: string = '';

  ngAfterViewInit(): void {
    // Focus the textarea when component initializes
    if (this.textareaElement?.nativeElement) {
      this.textareaElement.nativeElement.focus();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Handle keyboard shortcuts
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.message.trim() && !this.state.disabled) {
        this.sendMessage();
      }
    }
  }

  onSubmit(): void {
    if (this.message.trim() && !this.state.disabled) {
      this.sendMessage();
    }
  }

  private sendMessage(): void {
    const messageContent = this.message.trim();
    if (messageContent) {
      this.messageSent.emit(messageContent);
      this.message = '';
      
      // Re-focus the textarea after sending
      setTimeout(() => {
        if (this.textareaElement?.nativeElement) {
          this.textareaElement.nativeElement.focus();
        }
      });
    }
  }

  onInputChange(): void {
    this.inputChanged.emit(this.message);
  }

  clearInput(): void {
    this.message = '';
    if (this.textareaElement?.nativeElement) {
      this.textareaElement.nativeElement.focus();
    }
  }

  focusInput(): void {
    if (this.textareaElement?.nativeElement) {
      this.textareaElement.nativeElement.focus();
    }
  }
}