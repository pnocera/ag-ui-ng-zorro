# AG-UI Generative UI Demo

An advanced demonstration showcasing AG-UI's dynamic UI generation capabilities, tool calls, and complex state management.

## Overview

This example demonstrates AG-UI's advanced features including:

- **Dynamic UI Generation**: Create interfaces based on user input
- **Tool Call Visualization**: Real-time tool execution with progress tracking
- **Form Generation**: Dynamic form schemas based on requirements
- **State Management**: Complex state visualization and monitoring
- **Interactive Demonstrations**: Multiple response modes and capabilities

## Features

### Response Modes

1. **Simple Chat**: Basic conversational interface
2. **Tool Calls**: Simulated API calls with real-time progress
3. **Form Generation**: Dynamic form schema creation
4. **Dynamic UI**: Interface layout and component generation

### Interactive Elements

- **Real-time State Monitoring**: View current agent state, messages, and tool calls
- **Progress Tracking**: Watch tool calls execute with status updates
- **Responsive Design**: Works seamlessly across devices
- **Advanced Styling**: Modern UI with animations and transitions

## Usage

### Running the Application

```bash
# From the root directory
pnpm install

# Navigate to the generative-ui-demo example
cd packages/examples/generative-ui-demo

# Serve the application
pnpm serve

# Or use Angular CLI directly
npx ng serve
```

The application will be available at `http://localhost:4201`

### Building the Application

```bash
# Build for production
npx ng build

# Build for development with watch mode
npx ng build --watch --configuration development
```

### Running Tests

```bash
# Run unit tests
npx ng test
```

## Architecture

### Components

- **AppComponent**: Main application with sidebar controls and chat interface
- **GenerativeAgentService**: Advanced mock agent with multiple response modes
- **State Visualization**: Real-time display of agent state and tool calls

### Key Files

- `src/app/app.component.ts`: Main interface with controls and state display
- `src/app/services/generative-agent.service.ts`: Advanced mock agent implementation
- `src/app/app.config.ts`: Angular application configuration

## Response Modes Explained

### 1. Simple Chat Mode
Basic conversational interface similar to the basic-chat example, but with enhanced responses and capabilities.

### 2. Tool Calls Mode
Demonstrates external API integration:

- **Web Search Tool**: Simulates searching for information
- **Progress Tracking**: Shows tool call status (pending → running → completed)
- **Step Indicators**: Displays current execution steps
- **Result Processing**: Formats and presents tool results

**Example Usage:**
- "search for information about React"
- "find best practices for TypeScript"
- "look up Angular documentation"

### 3. Form Generation Mode
Creates dynamic form schemas based on user requirements:

- **Contact Forms**: Name, email, subject, message fields
- **Registration Forms**: User registration with various input types
- **Survey Forms**: Questionnaires with different field types
- **JSON Schema Output**: Machine-readable form definitions

**Example Usage:**
- "create a contact form"
- "generate a registration form"
- "make a survey form"

### 4. Dynamic UI Mode
Generates interface layouts and component descriptions:

- **Dashboards**: Analytics interfaces with charts and metrics
- **Layout Components**: Grid systems, navigation, headers
- **Interactive Elements**: Buttons, menus, modals, wizards
- **Component Descriptions**: Detailed UI specifications

**Example Usage:**
- "show me a dashboard layout"
- "create a data visualization interface"
- "design an admin panel"

## State Visualization

The demo includes a comprehensive state visualization panel showing:

### Current Message Information
- Message ID, role, and content preview
- Real-time updates as messages are processed

### Active Tool Calls
- Tool name and arguments
- Execution status (pending, running, completed, error)
- Color-coded status indicators

### Agent State
- Connection status
- Message count
- Current execution step
- Thread and run IDs

## Technical Implementation

### Tool Call Simulation

The tool call system simulates realistic API interactions:

```typescript
// Tool call lifecycle
1. TOOL_CALL_START → Initialize tool execution
2. STEP_STARTED → Begin processing step
3. TOOL_CALL_ARGS → Stream arguments in real-time
4. TOOL_CALL_RESULT → Provide results after processing
5. TOOL_CALL_END → Complete tool execution
6. STEP_FINISHED → Finish processing step
```

### Form Generation

Forms are generated as JSON schemas with comprehensive field definitions:

```typescript
{
  "title": "Form Title",
  "fields": [
    {
      "name": "fieldName",
      "label": "Display Label",
      "type": "text|email|select|textarea",
      "required": boolean,
      "options": [...] // For select fields
    }
  ]
}
```

### State Management

Utilizes AG-UI's reactive state management with:
- Angular Signals for reactive updates
- Real-time state synchronization
- Event-driven architecture
- Type-safe state interfaces

## Customization

### Adding New Response Patterns

Edit `src/app/services/generative-agent.service.ts` to add new response logic:

```typescript
// Add new patterns in respective mode methods
if (lowerMessage.includes('your-pattern')) {
  return this.generateCustomResponse(message);
}
```

### Extending Tool Calls

Add new tools by extending the tool call simulation:

```typescript
private async simulateCustomTool(message: string): Promise<void> {
  // Implement custom tool logic
}
```

### Styling Customization

Modify `src/app/app.component.scss` to customize:
- Layout and spacing
- Color schemes and theming
- Animation and transitions
- Responsive breakpoints

## Advanced Features

### Real-time Updates
The demo showcases real-time state updates through:
- Streaming message content
- Progressive tool call execution
- Live status indicators
- Dynamic UI updates

### Error Handling
Includes robust error handling for:
- Tool call failures
- Network simulation errors
- State synchronization issues
- Graceful degradation

### Performance Optimization
Features performance optimizations like:
- Efficient state updates
- Optimized rendering cycles
- Memory management
- Responsive design patterns

## Development Notes

- Built with Angular 20 standalone components
- Uses AG-UI's reactive state management
- Integrates seamlessly with NG-ZORRO components
- Includes comprehensive error handling
- Features responsive design for all devices

## Comparison with Basic Chat

| Feature | Basic Chat | Generative Demo |
|---------|------------|-----------------|
| Simplicity | ✅ Simple, focused | ❌ Complex, feature-rich |
| State Visualization | ❌ Basic | ✅ Comprehensive |
| Tool Calls | ❌ None | ✅ Full simulation |
| Form Generation | ❌ None | ✅ Dynamic schemas |
| UI Generation | ❌ None | ✅ Layout & components |
| Response Modes | ❌ Single mode | ✅ 4 different modes |
| Learning Curve | ✅ Easy | ❌ Advanced |

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure workspace dependencies are installed
2. **Port Conflicts**: Default port is 4201, change if needed
3. **Performance**: Tool call simulations may be resource-intensive
4. **State Issues**: Clear chat to reset state if needed

### Debug Mode

Use the "Show State Info" button to inspect current agent state and diagnose issues.

### Performance Tips

- Close the demo when not in use (tool simulations run continuously)
- Use "Clear Chat" to reset state and free memory
- Refresh the page if state becomes inconsistent

## Next Steps

After exploring this demo:

1. **Review the Code**: Study the implementation patterns
2. **Extend Functionality**: Add new response modes or tools
3. **Integrate Real APIs**: Replace mock services with real ones
4. **Customize UI**: Modify styling and layout
5. **Build Your Own**: Create your own AG-UI applications

## Contributing

This demo serves as both documentation and inspiration for building AG-UI applications. Feel free to extend it with new features and capabilities!