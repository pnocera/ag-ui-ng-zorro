import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Message } from '@ag-ui/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface MessageState {
  isStreaming: boolean;
  isComplete: boolean;
}

@Component({
  selector: 'ag-message',
  standalone: true,
  imports: [CommonModule, NzAvatarModule, NzTagModule],
  template: `
    <div class="ag-message" [class.ag-message--user]="isUserMessage" [class.ag-message--agent]="isAgentMessage">
      <div class="ag-message__avatar">
        <nz-avatar [nzSrc]="avatarSrc" [nzText]="avatarText" [nzIcon]="avatarIcon"></nz-avatar>
      </div>
      
      <div class="ag-message__content">
        <div class="ag-message__header">
          <span class="ag-message__author">{{ authorName }}</span>
          <nz-tag 
            *ngIf="showStatus" 
            [nzColor]="statusColor"
            class="ag-message__status">
            {{ statusText }}
          </nz-tag>
          <span class="ag-message__timestamp" *ngIf="message.timestamp">
            {{ formattedTimestamp }}
          </span>
        </div>
        
        <div class="ag-message__body" [innerHTML]="renderedContent"></div>
      </div>
    </div>
  `,
  styles: [`
    .ag-message {
      display: flex;
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }

    .ag-message:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }

    .ag-message--user {
      flex-direction: row-reverse;
      background: #f0f7ff;
      border: 1px solid #d4e4fc;
    }

    .ag-message--agent {
      flex-direction: row;
      background: #fafafa;
      border: 1px solid #f0f0f0;
    }

    .ag-message__avatar {
      flex-shrink: 0;
      margin: 0 12px;
    }

    .ag-message--user .ag-message__avatar {
      margin-left: 0;
    }

    .ag-message--agent .ag-message__avatar {
      margin-right: 0;
    }

    .ag-message__content {
      flex: 1;
      min-width: 0;
    }

    .ag-message__header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      gap: 8px;
    }

    .ag-message--user .ag-message__header {
      justify-content: flex-end;
    }

    .ag-message__author {
      font-weight: 600;
      font-size: 14px;
      color: #262626;
    }

    .ag-message__status {
      font-size: 12px;
    }

    .ag-message__timestamp {
      font-size: 12px;
      color: #8c8c8c;
      margin-left: auto;
    }

    .ag-message--user .ag-message__timestamp {
      margin-left: 0;
      margin-right: auto;
    }

    .ag-message__body {
      line-height: 1.6;
      color: #262626;
      word-wrap: break-word;
    }

    .ag-message__body :deep(p) {
      margin: 0 0 8px 0;
    }

    .ag-message__body :deep(p:last-child) {
      margin-bottom: 0;
    }

    .ag-message__body :deep(pre) {
      background: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      line-height: 1.45;
    }

    .ag-message__body :deep(code) {
      background: #f6f8fa;
      border-radius: 3px;
      padding: 2px 4px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
    }

    .ag-message__body :deep(blockquote) {
      margin: 16px 0;
      padding: 0 16px;
      color: #6b7280;
      border-left: 4px solid #e5e7eb;
    }

    .ag-message__body :deep(ul), .ag-message__body :deep(ol) {
      margin: 8px 0;
      padding-left: 24px;
    }

    .ag-message__body :deep(li) {
      margin: 4px 0;
    }

    .ag-message__body :deep(a) {
      color: #1890ff;
      text-decoration: none;
    }

    .ag-message__body :deep(a:hover) {
      text-decoration: underline;
    }

    .ag-message__body :deep(table) {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
    }

    .ag-message__body :deep(th), .ag-message__body :deep(td) {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
    }

    .ag-message__body :deep(th) {
      background: #f9fafb;
      font-weight: 600;
    }

    .ag-message--streaming .ag-message__body::after {
      content: '▋';
      animation: blink 1s infinite;
      color: #1890ff;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent implements OnChanges {
  @Input() message!: Message;
  @Input() state: MessageState = { isStreaming: false, isComplete: true };
  @Input() agentName = 'Agent';
  @Input() userName = 'You';

  // Placeholder for i18n
  private readonly ROLE_LABELS = {
    assistant: this.agentName,
    user: this.userName,
    system: 'System'
  };

  private readonly STATUS_LABELS = {
    streaming: 'Streaming...',
    complete: 'Complete',
    error: 'Error'
  };

  @HostBinding('class.ag-message--streaming') 
  get isStreaming() {
    return this.state.isStreaming;
  }

  get isUserMessage(): boolean {
    return this.message.role === 'user';
  }

  get isAgentMessage(): boolean {
    return this.message.role === 'assistant' || this.message.role === 'system';
  }

  get authorName(): string {
    return this.ROLE_LABELS[this.message.role as keyof typeof this.ROLE_LABELS] || this.message.role;
  }

  get showStatus(): boolean {
    return this.state.isStreaming || !this.state.isComplete;
  }

  get statusColor(): string {
    if (this.state.isStreaming) return 'processing';
    if (!this.state.isComplete) return 'error';
    return 'success';
  }

  get statusText(): string {
    if (this.state.isStreaming) return this.STATUS_LABELS.streaming;
    if (!this.state.isComplete) return this.STATUS_LABELS.error;
    return this.STATUS_LABELS.complete;
  }

  get formattedTimestamp(): string {
    if (!this.message.timestamp) return '';
    
    const date = new Date(this.message.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  get avatarSrc(): string | undefined {
    // Could be extended to support custom avatar URLs
    return undefined;
  }

  get avatarText(): string {
    if (this.isUserMessage) {
      return this.userName.charAt(0).toUpperCase();
    }
    return this.agentName.charAt(0).toUpperCase();
  }

  get avatarIcon(): string | undefined {
    if (this.isAgentMessage) {
      return 'robot';
    }
    return undefined;
  }

  renderedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] || changes['state']) {
      this.renderContent();
    }
  }

  private renderContent(): void {
    const html = this.markdownToHtml(this.message.content);
    this.renderedContent = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Basic markdown to HTML conversion
    let html = markdown
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Blockquotes
      .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    // Lists
    html = html
      // Unordered lists
      .replace(/<p>\* (.*)<\/p>/g, '<ul><li>$1</li></ul>')
      .replace(/<\/ul><ul>/g, '')
      // Ordered lists
      .replace(/<p>\d+\. (.*)<\/p>/g, '<ol><li>$1</li></ol>')
      .replace(/<\/ol><ol>/g, '');

    // Tables
    const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/g;
    html = html.replace(tableRegex, (match, header, body) => {
      const headers = header.split('|').map((h: string) => `<th>${h.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').slice(1, -1).map((c: string) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    return html;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}