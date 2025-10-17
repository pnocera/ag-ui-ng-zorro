import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MessageComponent, MessageState } from './message.component';
import { Message } from '@ag-ui/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  const mockMessage: Message = {
    id: 'test-message-1',
    role: 'assistant',
    content: 'Hello, this is a test message',
    timestamp: Date.now()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageComponent, NzAvatarModule, NzTagModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept message input', () => {
      component.message = mockMessage;
      fixture.detectChanges();
      
      expect(component.message).toBe(mockMessage);
    });

    it('should accept state input', () => {
      const state: MessageState = { isStreaming: true, isComplete: false };
      component.state = state;
      fixture.detectChanges();
      
      expect(component.state).toBe(state);
    });

    it('should accept agent name input', () => {
      component.agentName = 'Test Agent';
      fixture.detectChanges();
      
      expect(component.agentName).toBe('Test Agent');
    });

    it('should accept user name input', () => {
      component.userName = 'Test User';
      fixture.detectChanges();
      
      expect(component.userName).toBe('Test User');
    });
  });

  describe('Message rendering', () => {
    it('should render message content', () => {
      component.message = mockMessage;
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.textContent).toContain(mockMessage.content);
    });

    it('should render author name for assistant message', () => {
      component.message = mockMessage;
      component.agentName = 'Test Agent';
      fixture.detectChanges();

      const authorElement = fixture.debugElement.query(By.css('.ag-message__author'));
      expect(authorElement.nativeElement.textContent).toContain('Test Agent');
    });

    it('should render author name for user message', () => {
      const userMessage: Message = { ...mockMessage, role: 'user' };
      component.message = userMessage;
      component.userName = 'Test User';
      fixture.detectChanges();

      const authorElement = fixture.debugElement.query(By.css('.ag-message__author'));
      expect(authorElement.nativeElement.textContent).toContain('Test User');
    });

    it('should render timestamp when provided', () => {
      const timestamp = new Date('2023-01-01T12:00:00').getTime();
      component.message = { ...mockMessage, timestamp };
      fixture.detectChanges();

      const timestampElement = fixture.debugElement.query(By.css('.ag-message__timestamp'));
      expect(timestampElement).toBeTruthy();
      expect(timestampElement.nativeElement.textContent).toContain('12:00');
    });

    it('should not render timestamp when not provided', () => {
      const messageWithoutTimestamp: Message = { ...mockMessage, timestamp: undefined };
      component.message = messageWithoutTimestamp;
      fixture.detectChanges();

      const timestampElement = fixture.debugElement.query(By.css('.ag-message__timestamp'));
      expect(timestampElement).toBeFalsy();
    });
  });

  describe('Message styling', () => {
    it('should apply user message styling for user role', () => {
      const userMessage: Message = { ...mockMessage, role: 'user' };
      component.message = userMessage;
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.ag-message'));
      expect(messageElement.nativeElement.classList.contains('ag-message--user')).toBeTruthy();
      expect(messageElement.nativeElement.classList.contains('ag-message--agent')).toBeFalsy();
    });

    it('should apply agent message styling for assistant role', () => {
      component.message = mockMessage;
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.ag-message'));
      expect(messageElement.nativeElement.classList.contains('ag-message--agent')).toBeTruthy();
      expect(messageElement.nativeElement.classList.contains('ag-message--user')).toBeFalsy();
    });

    it('should apply agent message styling for system role', () => {
      const systemMessage: Message = { ...mockMessage, role: 'system' };
      component.message = systemMessage;
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.ag-message'));
      expect(messageElement.nativeElement.classList.contains('ag-message--agent')).toBeTruthy();
      expect(messageElement.nativeElement.classList.contains('ag-message--user')).toBeFalsy();
    });

    it('should apply streaming class when state is streaming', () => {
      component.message = mockMessage;
      component.state = { isStreaming: true, isComplete: false };
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.ag-message'));
      expect(messageElement.nativeElement.classList.contains('ag-message--streaming')).toBeTruthy();
    });
  });

  describe('Status display', () => {
    it('should show status tag when streaming', () => {
      component.message = mockMessage;
      component.state = { isStreaming: true, isComplete: false };
      fixture.detectChanges();

      const statusTag = fixture.debugElement.query(By.css('.ag-message__status'));
      expect(statusTag).toBeTruthy();
      expect(statusTag.nativeElement.textContent).toContain('Streaming...');
    });

    it('should show status tag when incomplete', () => {
      component.message = mockMessage;
      component.state = { isStreaming: false, isComplete: false };
      fixture.detectChanges();

      const statusTag = fixture.debugElement.query(By.css('.ag-message__status'));
      expect(statusTag).toBeTruthy();
      expect(statusTag.nativeElement.textContent).toContain('Error');
    });

    it('should not show status tag when complete', () => {
      component.message = mockMessage;
      component.state = { isStreaming: false, isComplete: true };
      fixture.detectChanges();

      const statusTag = fixture.debugElement.query(By.css('.ag-message__status'));
      expect(statusTag).toBeFalsy();
    });
  });

  describe('Avatar display', () => {
    it('should render avatar with correct text for user message', () => {
      const userMessage: Message = { ...mockMessage, role: 'user' };
      component.message = userMessage;
      component.userName = 'John';
      fixture.detectChanges();

      const avatar = fixture.debugElement.query(By.css('nz-avatar'));
      expect(avatar).toBeTruthy();
      expect(avatar.nativeElement.getAttribute('nztext')).toBe('J');
    });

    it('should render avatar with correct text for agent message', () => {
      component.message = mockMessage;
      component.agentName = 'Assistant';
      fixture.detectChanges();

      const avatar = fixture.debugElement.query(By.css('nz-avatar'));
      expect(avatar).toBeTruthy();
      expect(avatar.nativeElement.getAttribute('nztext')).toBe('A');
    });

    it('should render avatar with robot icon for agent message', () => {
      component.message = mockMessage;
      fixture.detectChanges();

      const avatar = fixture.debugElement.query(By.css('nz-avatar'));
      expect(avatar).toBeTruthy();
      expect(avatar.nativeElement.getAttribute('nzicon')).toBe('robot');
    });
  });

  describe('Markdown rendering', () => {
    it('should render bold text correctly', () => {
      component.message = { ...mockMessage, content: 'This is **bold** text' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).toContain('<strong>bold</strong>');
    });

    it('should render italic text correctly', () => {
      component.message = { ...mockMessage, content: 'This is *italic* text' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).toContain('<em>italic</em>');
    });

    it('should render code blocks correctly', () => {
      component.message = { ...mockMessage, content: '```\ncode block\n```' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).toContain('<pre><code>code block</code></pre>');
    });

    it('should render inline code correctly', () => {
      component.message = { ...mockMessage, content: 'This is `inline code`' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).toContain('<code>inline code</code>');
    });

    it('should render links correctly', () => {
      component.message = { ...mockMessage, content: '[link](https://example.com)' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).toContain('<a href="https://example.com" target="_blank" rel="noopener">link</a>');
    });

    it('should render blockquotes correctly', () => {
      component.message = { ...mockMessage, content: '> This is a quote' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).toContain('<blockquote>This is a quote</blockquote>');
    });

    it('should escape HTML in content', () => {
      component.message = { ...mockMessage, content: '<script>alert("xss")</script>' };
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      expect(contentElement.nativeElement.innerHTML).not.toContain('<script>');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      component.message = mockMessage;
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.ag-message'));
      expect(messageElement.nativeElement.getAttribute('role')).toBeFalsy(); // No explicit role needed
    });

    it('should have semantic structure', () => {
      component.message = mockMessage;
      fixture.detectChanges();

      const authorElement = fixture.debugElement.query(By.css('.ag-message__author'));
      const contentElement = fixture.debugElement.query(By.css('.ag-message__body'));
      
      expect(authorElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
    });
  });
});

// Integration test for accessibility
@Component({
  standalone: true,
  imports: [MessageComponent, NzAvatarModule, NzTagModule],
  template: `
    <ag-message
      [message]="message"
      [state]="state"
      [agentName]="agentName"
      [userName]="userName">
    </ag-message>
  `
})
class TestHostComponent {
  message: Message = {
    id: 'test',
    role: 'assistant',
    content: 'Test content'
  };
  state: MessageState = { isStreaming: false, isComplete: true };
  agentName = 'Agent';
  userName = 'User';
}

describe('MessageComponent Integration', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  it('should render message with all features', () => {
    fixture.detectChanges();

    const messageElement = fixture.debugElement.query(By.css('.ag-message'));
    expect(messageElement).toBeTruthy();

    const avatar = fixture.debugElement.query(By.css('nz-avatar'));
    expect(avatar).toBeTruthy();

    const author = fixture.debugElement.query(By.css('.ag-message__author'));
    expect(author.nativeElement.textContent).toContain('Agent');

    const content = fixture.debugElement.query(By.css('.ag-message__body'));
    expect(content.nativeElement.textContent).toContain('Test content');
  });
});