import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AgChatComponent } from '@ag-ui/ng-zorro';
import { AgentStateService } from '@ag-ui/core';
import { GenerativeAgentService } from './services/generative-agent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AgChatComponent
  ],
  providers: [
    AgentStateService,
    GenerativeAgentService
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>AG-UI Generative Demo</h1>
        <p>Advanced demo showcasing dynamic UI generation and tool calls</p>
      </header>
      
      <main class="app-main">
        <div class="demo-content">
          <div class="demo-sidebar">
            <div class="control-panel">
              <h3>Demo Controls</h3>
              
              <div class="control-group">
                <label>Response Mode:</label>
                <select (change)="onModeChange($any($event.target).value)" [value]="responseMode">
                  <option value="simple">Simple Chat</option>
                  <option value="tools">Tool Calls</option>
                  <option value="forms">Form Generation</option>
                  <option value="dynamic">Dynamic UI</option>
                </select>
              </div>
              
              <div class="control-group">
                <button 
                  nz-button 
                  nzType="default" 
                  nzBlock
                  (click)="showStateInfo()"
                  class="info-button">
                  Show State Info
                </button>
                
                <button 
                  nz-button 
                  nzType="default" 
                  nzBlock
                  (click)="clearChat()"
                  class="clear-button">
                  Clear Chat
                </button>
              </div>
              
              <div class="control-group" *ngIf="currentMessage">
                <h4>Current Message</h4>
                <div class="state-info">
                  <p><strong>ID:</strong> {{ currentMessage.id }}</p>
                  <p><strong>Role:</strong> {{ currentMessage.role }}</p>
                  <p><strong>Content:</strong> {{ currentMessage.content?.substring(0, 100) }}{{ currentMessage.content?.length > 100 ? '...' : '' }}</p>
                </div>
              </div>
              
              <div class="control-group" *ngIf="activeToolCalls.size > 0">
                <h4>Active Tool Calls</h4>
                <div class="tool-calls">
                  @for (toolCall of activeToolCalls.values(); track toolCall.id) {
                    <div class="tool-call" [ngClass]="toolCall.status">
                      <p><strong>{{ toolCall.name }}</strong></p>
                      <p class="tool-args">{{ toolCall.args.substring(0, 50) }}{{ toolCall.args.length > 50 ? '...' : '' }}</p>
                      <span class="status">{{ toolCall.status }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div class="chat-section">
            <ag-chat
              [config]="chatConfig"
              [title]="chatTitle"
              (messageSent)="onMessageSent($event)">
            </ag-chat>
          </div>
        </div>
      </main>
      
      <footer class="app-footer">
        <p>AG-UI Generative Demo - Showcasing advanced capabilities</p>
      </footer>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  chatTitle = 'Generative AI Assistant';
  responseMode = 'simple';
  
  chatConfig = {
    agentName: 'Assistant',
    userName: 'You',
    placeholder: 'Try asking for tools, forms, or dynamic content...',
    showTimestamps: true,
    showHelpText: true,
    enableVirtualScrolling: true
  };

  currentMessage: any;
  activeToolCalls = new Map();

  constructor(
    private agentStateService: AgentStateService,
    private generativeAgentService: GenerativeAgentService
  ) {
    // Subscribe to state changes
    this.agentStateService.stateChanges$.subscribe(state => {
      if (state) {
        this.currentMessage = state.messages[state.messages.length - 1];
        this.activeToolCalls = state.activeToolCalls;
      }
    });
  }

  async onMessageSent(message: string): Promise<void> {
    await this.generativeAgentService.sendMessage(message, this.responseMode);
  }

  onModeChange(mode: string): void {
    this.responseMode = mode;
  }

  showStateInfo(): void {
    const state = this.agentStateService.getState();
    alert(`Current State:
Status: ${state.status}
Messages: ${state.messages.length}
Active Tool Calls: ${state.activeToolCalls.size}
Current Step: ${state.currentStep || 'None'}
Thread ID: ${state.threadId || 'None'}
Run ID: ${state.runId || 'None'}`);
  }

  clearChat(): void {
    this.agentStateService.reset();
  }
}