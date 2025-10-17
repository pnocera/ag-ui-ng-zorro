import { Injectable } from '@angular/core';
import { AgentStateService } from '@ag-ui/core';
import { 
  AGUIEvent, 
  TextMessageStartEvent, 
  TextMessageContentEvent, 
  TextMessageEndEvent, 
  RunStartedEvent, 
  RunFinishedEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallResultEvent,
  ToolCallEndEvent,
  StepStartedEvent,
  StepFinishedEvent
} from '@ag-ui/core';

@Injectable({
  providedIn: 'root'
})
export class GenerativeAgentService {
  constructor(private agentStateService: AgentStateService) {}

  async sendMessage(message: string, mode: string): Promise<void> {
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

    // Generate response based on mode
    switch (mode) {
      case 'tools':
        await this.generateToolCallResponse(message);
        break;
      case 'forms':
        await this.generateFormResponse(message);
        break;
      case 'dynamic':
        await this.generateDynamicUIResponse(message);
        break;
      default:
        await this.generateSimpleResponse(message);
    }

    // Finish the run
    this.agentStateService.processEvent({
      type: 'RUN_FINISHED',
      thread_id: 'thread-' + Date.now(),
      run_id: 'run-' + Date.now()
    } as RunFinishedEvent);
  }

  private async generateSimpleResponse(message: string): Promise<void> {
    await this.delay(800);
    
    const response = this.generateResponse(message);
    const messageId = 'msg-assistant-' + Date.now();

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: messageId,
      role: 'assistant',
      timestamp: Date.now()
    } as TextMessageStartEvent);

    // Stream the response
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      await this.delay(40);
      const delta = (i > 0 ? ' ' : '') + words[i];
      this.agentStateService.processEvent({
        type: 'TEXT_MESSAGE_CONTENT',
        message_id: messageId,
        delta: delta
      } as TextMessageContentEvent);
    }

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_END',
      message_id: messageId
    } as TextMessageEndEvent);
  }

  private async generateToolCallResponse(message: string): Promise<void> {
    const messageId = 'msg-assistant-' + Date.now();
    
    // Start assistant response
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: messageId,
      role: 'assistant',
      timestamp: Date.now()
    } as TextMessageStartEvent);

    await this.delay(500);

    // Start explaining what we're doing
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: messageId,
      delta: "I'll help you with that request. Let me use some tools to get the information you need.\n\n"
    } as TextMessageContentEvent);

    // Start tool call
    const toolCallId = 'tool-' + Date.now();
    this.agentStateService.processEvent({
      type: 'TOOL_CALL_START',
      tool_call_id: toolCallId,
      tool_call_name: 'web_search',
      parent_message_id: messageId
    } as ToolCallStartEvent);

    // Start step
    this.agentStateService.processEvent({
      type: 'STEP_STARTED',
      step_name: 'Searching web for relevant information'
    } as StepStartedEvent);

    await this.delay(300);

    // Stream tool arguments
    const toolArgs = JSON.stringify({
      query: message,
      max_results: 5,
      include_sources: true
    });
    
    for (let i = 0; i < toolArgs.length; i++) {
      await this.delay(30);
      this.agentStateService.processEvent({
        type: 'TOOL_CALL_ARGS',
        tool_call_id: toolCallId,
        delta: toolArgs[i]
      } as ToolCallArgsEvent);
    }

    await this.delay(1000);

    // Provide tool result
    const toolResult = {
      results: [
        {
          title: "Understanding " + message,
          snippet: "This is a comprehensive explanation of " + message + " with detailed information.",
          url: "https://example.com/understanding-" + message.toLowerCase().replace(/\s+/g, '-')
        },
        {
          title: "Best practices for " + message,
          snippet: "Learn the best practices and common patterns related to " + message + ".",
          url: "https://example.com/best-practices-" + message.toLowerCase().replace(/\s+/g, '-')
        }
      ],
      total_results: 2
    };

    this.agentStateService.processEvent({
      type: 'TOOL_CALL_RESULT',
      tool_call_id: toolCallId,
      result: toolResult
    } as ToolCallResultEvent);

    this.agentStateService.processEvent({
      type: 'TOOL_CALL_END',
      tool_call_id: toolCallId
    } as ToolCallEndEvent);

    this.agentStateService.processEvent({
      type: 'STEP_FINISHED',
      step_name: 'Searching web for relevant information'
    } as StepFinishedEvent);

    await this.delay(300);

    // Continue with response
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: messageId,
      delta: `I found some helpful information about "${message}":\n\n`
    } as TextMessageContentEvent);

    await this.delay(200);

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: messageId,
      delta: `📊 **Search Results:**\n`
    } as TextMessageContentEvent);

    toolResult.results.forEach((result: any, index: number) => {
      this.agentStateService.processEvent({
        type: 'TEXT_MESSAGE_CONTENT',
        message_id: messageId,
        delta: `${index + 1}. **${result.title}**\n   ${result.snippet}\n   🔗 [Read more](${result.url})\n\n`
      } as TextMessageContentEvent);
    });

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: messageId,
      delta: `Would you like me to search for more specific information or help you with something else?`
    } as TextMessageContentEvent);

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_END',
      message_id: messageId
    } as TextMessageEndEvent);
  }

  private async generateFormResponse(message: string): Promise<void> {
    const messageId = 'msg-assistant-' + Date.now();
    
    // Start assistant response
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: messageId,
      role: 'assistant',
      timestamp: Date.now()
    } as TextMessageStartEvent);

    await this.delay(500);

    const formDescription = this.generateFormDescription(message);
    
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: messageId,
      delta: formDescription
    } as TextMessageContentEvent);

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_END',
      message_id: messageId
    } as TextMessageEndEvent);
  }

  private async generateDynamicUIResponse(message: string): Promise<void> {
    const messageId = 'msg-assistant-' + Date.now();
    
    // Start assistant response
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_START',
      message_id: messageId,
      role: 'assistant',
      timestamp: Date.now()
    } as TextMessageStartEvent);

    await this.delay(500);

    const dynamicContent = this.generateDynamicContent(message);
    
    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      message_id: messageId,
      delta: dynamicContent
    } as TextMessageContentEvent);

    this.agentStateService.processEvent({
      type: 'TEXT_MESSAGE_END',
      message_id: messageId
    } as TextMessageEndEvent);
  }

  private generateFormDescription(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('form')) {
      return `I can help you create a contact form! Here's a form schema I generated:

\`\`\`json
{
  "title": "Contact Us",
  "fields": [
    {
      "name": "name",
      "label": "Full Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your full name"
    },
    {
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "placeholder": "your.email@example.com"
    },
    {
      "name": "subject",
      "label": "Subject",
      "type": "select",
      "required": true,
      "options": [
        {"value": "general", "label": "General Inquiry"},
        {"value": "support", "label": "Technical Support"},
        {"value": "feedback", "label": "Feedback"},
        {"value": "other", "label": "Other"}
      ]
    },
    {
      "name": "message",
      "label": "Message",
      "type": "textarea",
      "required": true,
      "placeholder": "Type your message here...",
      "rows": 4
    }
  ]
}
\`\`\`

This form can be dynamically rendered using the AG-UI form components. Would you like me to show you how to integrate this into your application?`;
    }
    
    return `I can generate various types of forms based on your requirements. Here's a general form structure:

\`\`\`json
{
  "title": "Dynamic Form",
  "description": "Generated based on your request: ${message}",
  "fields": [
    {
      "name": "field1",
      "label": "Input Field",
      "type": "text",
      "required": true
    }
  ]
}
\`\`\`

Try asking for specific form types like "contact form", "registration form", or "survey form"!`;
  }

  private generateDynamicContent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('analytics')) {
      return `I can generate a dynamic dashboard layout for you! Here's what I'm thinking:

## 📊 Analytics Dashboard

**Layout Components:**
- **Header Section**: Title, date range selector, user menu
- **KPI Cards**: 4 key metrics with trend indicators
- **Charts Section**: Line chart for trends, bar chart for comparisons
- **Data Table**: Sortable, filterable data grid
- **Sidebar**: Navigation menu with active state

**Dynamic Elements:**
- Real-time data updates every 30 seconds
- Interactive chart tooltips and legends
- Responsive grid layout (12-column system)
- Theme switching capability
- Export functionality (CSV, PDF)

**State Management:**
- Loading states during data fetch
- Error handling with retry mechanism
- Data caching and invalidation
- User preferences persistence

Would you like me to provide the specific component code or focus on a particular section?`;
    }
    
    return `I can create dynamic UI components based on your requirements. Here are some examples of what I can generate:

**Available Dynamic Components:**
- 📋 Forms and input components
- 📊 Charts and data visualizations  
- 📱 Responsive layouts
- 🎨 Theme-able interfaces
- 🔧 Configuration panels
- 📄 Document viewers
- 🗂️ Data tables with sorting/filtering
- 🎯 Interactive wizards

Try asking for specific components like "dashboard", "form", "table", "chart", or describe the interface you need!`;
  }

  private generateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm the Generative AI Assistant. I can demonstrate various capabilities including tool calls, form generation, and dynamic UI creation. What would you like to explore today?";
    }
    
    if (lowerMessage.includes('capabilities') || lowerMessage.includes('what can you do')) {
      return "I can demonstrate several advanced capabilities:\n\n🛠️ **Tool Calls**: Simulate external API calls with progress tracking\n📋 **Form Generation**: Create dynamic form schemas based on requirements\n🎨 **Dynamic UI**: Generate interface layouts and components\n📊 **Data Visualization**: Create charts and dashboards\n🔄 **State Management**: Show real-time state updates\n\nTry the different response modes to see each capability in action!";
    }
    
    if (lowerMessage.includes('tool') || lowerMessage.includes('api')) {
      return "Switch to 'Tool Calls' mode to see me demonstrate external API integration with real-time progress tracking, error handling, and result processing.";
    }
    
    if (lowerMessage.includes('form') || lowerMessage.includes('input')) {
      return "Switch to 'Form Generation' mode to see me create dynamic form schemas with various field types, validation rules, and responsive layouts.";
    }
    
    if (lowerMessage.includes('dynamic') || lowerMessage.includes('ui') || lowerMessage.includes('interface')) {
      return "Switch to 'Dynamic UI' mode to see me generate interactive interfaces, layouts, and components with real-time updates.";
    }
    
    return "I'm here to help you explore AG-UI's advanced capabilities! You can:\n\n• Try different response modes using the dropdown\n• Ask about specific features (tools, forms, dynamic UI)\n• Watch the state information in real-time\n• See how I handle complex interactions\n\nWhat would you like to explore?";
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}