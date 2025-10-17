import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ChatInputComponent, ChatInputState } from './chat-input.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

describe('ChatInputComponent', () => {
  let component: ChatInputComponent;
  let fixture: ComponentFixture<ChatInputComponent>;
  let textareaElement: HTMLTextAreaElement;
  let sendButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChatInputComponent,
        FormsModule,
        NzButtonModule,
        NzInputModule,
        NzIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    textareaElement = fixture.debugElement.query(By.css('textarea')).nativeElement;
    sendButton = fixture.debugElement.query(By.css('button')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept state input', () => {
      const state: ChatInputState = { disabled: true, loading: true };
      component.state = state;
      fixture.detectChanges();

      expect(component.state).toBe(state);
      expect(textareaElement.disabled).toBeTruthy();
      expect(sendButton.disabled).toBeTruthy();
    });

    it('should accept placeholder input', () => {
      component.placeholder = 'Custom placeholder';
      fixture.detectChanges();

      expect(textareaElement.getAttribute('placeholder')).toBe('Custom placeholder');
    });

    it('should accept send button text input', () => {
      component.sendButtonText = 'Send Message';
      fixture.detectChanges();

      const sendText = fixture.debugElement.query(By.css('.send-text'));
      expect(sendText.nativeElement.textContent).toContain('Send Message');
    });

    it('should accept show help text input', () => {
      component.showHelpText = false;
      fixture.detectChanges();

      const helpElement = fixture.debugElement.query(By.css('.ag-chat-input__help'));
      expect(helpElement).toBeFalsy();
    });

    it('should accept help text input', () => {
      component.helpText = 'Custom help text';
      component.showHelpText = true;
      fixture.detectChanges();

      const helpElement = fixture.debugElement.query(By.css('.ag-chat-input__help'));
      expect(helpElement.nativeElement.textContent).toContain('Custom help text');
    });
  });

  describe('Form functionality', () => {
    it('should emit messageSent when form is submitted with valid message', () => {
      spyOn(component.messageSent, 'emit');
      
      component.message = 'Test message';
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('submit', null);

      expect(component.messageSent.emit).toHaveBeenCalledWith('Test message');
      expect(component.message).toBe('');
    });

    it('should not emit messageSent when form is submitted with empty message', () => {
      spyOn(component.messageSent, 'emit');
      
      component.message = '';
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('submit', null);

      expect(component.messageSent.emit).not.toHaveBeenCalled();
    });

    it('should not emit messageSent when disabled', () => {
      spyOn(component.messageSent, 'emit');
      
      component.state = { disabled: true, loading: false };
      component.message = 'Test message';
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('submit', null);

      expect(component.messageSent.emit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should send message on Enter key', () => {
      spyOn(component, 'sendMessage');
      
      component.message = 'Test message';
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      textareaElement.dispatchEvent(enterEvent);

      expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should not send message on Shift+Enter key', () => {
      spyOn(component, 'sendMessage');
      
      component.message = 'Test message';
      fixture.detectChanges();

      const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      textareaElement.dispatchEvent(shiftEnterEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send message on other keys', () => {
      spyOn(component, 'sendMessage');
      
      component.message = 'Test message';
      fixture.detectChanges();

      const otherKeyEvent = new KeyboardEvent('keydown', { key: 'a' });
      textareaElement.dispatchEvent(otherKeyEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter key', () => {
      const preventDefaultSpy = jasmine.createSpy('preventDefault');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(enterEvent, 'preventDefault', { value: preventDefaultSpy });
      
      component.message = 'Test message';
      fixture.detectChanges();

      textareaElement.dispatchEvent(enterEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Button state', () => {
    it('should disable send button when message is empty', () => {
      component.message = '';
      fixture.detectChanges();

      expect(sendButton.disabled).toBeTruthy();
    });

    it('should disable send button when message is whitespace only', () => {
      component.message = '   ';
      fixture.detectChanges();

      expect(sendButton.disabled).toBeTruthy();
    });

    it('should enable send button when message has content', () => {
      component.message = 'Test message';
      fixture.detectChanges();

      expect(sendButton.disabled).toBeFalsy();
    });

    it('should disable send button when disabled state', () => {
      component.state = { disabled: true, loading: false };
      component.message = 'Test message';
      fixture.detectChanges();

      expect(sendButton.disabled).toBeTruthy();
    });

    it('should show loading state when loading', () => {
      component.state = { disabled: false, loading: true };
      fixture.detectChanges();

      const loadingIcon = fixture.debugElement.query(By.css('[nz-icon][nzType="loading"]'));
      expect(loadingIcon).toBeTruthy();
    });

    it('should show send icon when not loading', () => {
      component.state = { disabled: false, loading: false };
      fixture.detectChanges();

      const sendIcon = fixture.debugElement.query(By.css('[nz-icon][nzType="send"]'));
      expect(sendIcon).toBeTruthy();
    });
  });

  describe('Textarea state', () => {
    it('should disable textarea when disabled state', () => {
      component.state = { disabled: true, loading: false };
      fixture.detectChanges();

      expect(textareaElement.disabled).toBeTruthy();
    });

    it('should enable textarea when not disabled', () => {
      component.state = { disabled: false, loading: false };
      fixture.detectChanges();

      expect(textareaElement.disabled).toBeFalsy();
    });

    it('should update message when textarea value changes', () => {
      component.message = '';
      fixture.detectChanges();

      textareaElement.value = 'New message';
      textareaElement.dispatchEvent(new Event('input'));

      expect(component.message).toBe('New message');
    });
  });

  describe('Public methods', () => {
    it('clearInput should clear the message', () => {
      component.message = 'Test message';
      component.clearInput();

      expect(component.message).toBe('');
    });

    it('focusInput should focus the textarea', () => {
      const focusSpy = spyOn(textareaElement, 'focus');
      component.focusInput();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const form = fixture.debugElement.query(By.css('form'));
      const textarea = fixture.debugElement.query(By.css('textarea'));
      const button = fixture.debugElement.query(By.css('button'));

      expect(form).toBeTruthy();
      expect(textarea).toBeTruthy();
      expect(button).toBeTruthy();
    });

    it('should have proper button type', () => {
      expect(sendButton.getAttribute('type')).toBe('submit');
    });

    it('should have placeholder for accessibility', () => {
      expect(textareaElement.getAttribute('placeholder')).toBeTruthy();
    });

    it('should show help text for accessibility when enabled', () => {
      component.showHelpText = true;
      fixture.detectChanges();

      const helpElement = fixture.debugElement.query(By.css('.ag-chat-input__help'));
      expect(helpElement).toBeTruthy();
      expect(helpElement.nativeElement.textContent).toContain('Press Enter to send');
    });
  });

  describe('Output events', () => {
    it('should emit inputChanged when message changes', () => {
      spyOn(component.inputChanged, 'emit');
      
      component.message = 'Test message';
      component.onInputChange();

      expect(component.inputChanged.emit).toHaveBeenCalledWith('Test message');
    });

    it('should emit messageSent with trimmed message', () => {
      spyOn(component.messageSent, 'emit');
      
      component.message = '  Test message  ';
      component.sendMessage();

      expect(component.messageSent.emit).toHaveBeenCalledWith('Test message');
    });

    it('should not emit messageSent for empty message', () => {
      spyOn(component.messageSent, 'emit');
      
      component.message = '';
      component.sendMessage();

      expect(component.messageSent.emit).not.toHaveBeenCalled();
    });
  });
});

// Integration test for accessibility
@Component({
  standalone: true,
  imports: [
    ChatInputComponent,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule
  ],
  template: `
    <ag-chat-input
      [state]="state"
      [placeholder]="placeholder"
      [sendButtonText]="sendButtonText"
      [showHelpText]="showHelpText"
      [helpText]="helpText"
      (messageSent)="onMessageSent($event)"
      (inputChanged)="onInputChanged($event)">
    </ag-chat-input>
  `
})
class TestHostComponent {
  state: ChatInputState = { disabled: false, loading: false };
  placeholder = 'Type your message...';
  sendButtonText = 'Send';
  showHelpText = true;
  helpText = 'Press Enter to send';

  lastMessageSent = '';
  lastInputChange = '';

  onMessageSent(message: string) {
    this.lastMessageSent = message;
  }

  onInputChanged(message: string) {
    this.lastInputChange = message;
  }
}

describe('ChatInputComponent Integration', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should integrate properly with host component', () => {
    const textarea = fixture.debugElement.query(By.css('textarea'));
    const button = fixture.debugElement.query(By.css('button'));
    const form = fixture.debugElement.query(By.css('form'));

    expect(textarea).toBeTruthy();
    expect(button).toBeTruthy();
    expect(form).toBeTruthy();
  });

  it('should send message from host component', () => {
    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    textarea.value = 'Test integration';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);

    expect(component.lastMessageSent).toBe('Test integration');
  });

  it('should reflect host component state changes', () => {
    component.state = { disabled: true, loading: true };
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(textarea.disabled).toBeTruthy();
    expect(button.disabled).toBeTruthy();
  });
});