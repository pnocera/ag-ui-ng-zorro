import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgChatComponent } from '@ag-ui/ng-zorro';
import { AgentStateService } from '@ag-ui/core';
import { MockAgentService } from './services/mock-agent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AgChatComponent
  ],
  providers: [
    AgentStateService,
    MockAgentService
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>AG-UI Basic Chat Example</h1>
        <p>A simple chat interface demonstrating AG-UI components</p>
      </header>
      
      <main class="app-main">
        <div class="chat-container">
          <ag-chat
            [config]="chatConfig"
            [title]="chatTitle"
            (messageSent)="onMessageSent($event)">
          </ag-chat>
        </div>
      </main>
      
      <footer class="app-footer">
        <p>Powered by AG-UI with NG-ZORRO</p>
      </footer>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  chatTitle = 'Basic Chat Assistant';
  chatConfig = {
    agentName: 'Assistant',
    userName: 'You',
    placeholder: 'Type your message here...',
    showTimestamps: true,
    showHelpText: true,
    enableVirtualScrolling: false
  };

  constructor(
    private agentStateService: AgentStateService,
    private mockAgentService: MockAgentService
  ) {}

  async onMessageSent(message: string): Promise<void> {
    // Send message to mock agent service
    await this.mockAgentService.sendMessage(message);
  }
}