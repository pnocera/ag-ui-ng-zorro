# AG-UI Basic Chat Example

A simple chat interface demonstrating the core functionality of AG-UI with NG-ZORRO components.

## Overview

This example shows how to:

- Set up a basic chat interface using `AgChatComponent`
- Integrate with `AgentStateService` for state management
- Create a mock agent service for demonstration
- Handle message sending and receiving
- Configure chat appearance and behavior

## Features

- **Simple Chat Interface**: Clean, minimal UI for chat interactions
- **Mock Agent Service**: Simulated responses for demonstration purposes
- **State Management**: Real-time state updates using Angular Signals
- **Responsive Design**: Works on desktop and mobile devices
- **NG-ZORRO Integration**: Beautiful UI components out of the box

## Usage

### Running the Application

```bash
# From the root directory
pnpm install

# Navigate to the basic-chat example
cd packages/examples/basic-chat

# Serve the application
pnpm serve

# Or use Angular CLI directly
npx ng serve
```

The application will be available at `http://localhost:4200`

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

- **AppComponent**: Main application component with chat interface
- **MockAgentService**: Simulates agent responses for demonstration

### Key Files

- `src/app/app.component.ts`: Main chat interface
- `src/app/services/mock-agent.service.ts`: Mock agent implementation
- `src/app/app.config.ts`: Angular application configuration

### Dependencies

- `@ag-ui/core`: Core AG-UI functionality and state management
- `@ag-ui/ng-zorro`: NG-ZORRO-based UI components
- `@ag-ui/theming`: Shared styling and theming utilities
- `ng-zorro-antd`: Ant Design components for Angular

## Chat Configuration

The chat interface can be customized through the `chatConfig` object:

```typescript
chatConfig = {
  agentName: 'Assistant',        // Name displayed for agent messages
  userName: 'You',              // Name displayed for user messages
  placeholder: 'Type your message here...',  // Input placeholder text
  showTimestamps: true,         // Show message timestamps
  showHelpText: true,           // Show help text below input
  enableVirtualScrolling: false // Enable virtual scrolling for long chats
};
```

## Mock Agent Responses

The mock agent service provides rule-based responses for common queries:

- **Greetings**: "hello", "hi", "hey"
- **Status**: "how are you"
- **Farewell**: "bye", "goodbye"
- **Help**: "help"
- **Time**: "what time", "current time"
- **Identity**: "name", "who are you"

For other inputs, it provides contextual default responses to simulate natural conversation.

## Customization

### Adding New Response Rules

Edit `src/app/services/mock-agent.service.ts` and add new patterns to the `generateResponse` method:

```typescript
if (lowerMessage.includes('your-pattern')) {
  return 'Your custom response here';
}
```

### Styling

The application uses SCSS for styling. Modify `src/app/app.component.scss` to customize the appearance.

### Theming

The application uses AG-UI theming utilities. You can customize colors, spacing, and other design tokens through the theming system.

## Development Notes

- This is a standalone Angular application using Angular 20
- Uses Zone.js for change detection
- Compatible with the AG-UI monorepo architecture
- Includes all necessary polyfills and configuration

## Next Steps

After exploring this basic example, try the **Generative UI Demo** to see advanced features like:

- Tool call demonstrations
- Dynamic form generation
- Complex state visualization
- Interactive UI generation

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `pnpm install`
2. **Port Conflicts**: Change the serve port in `package.json` scripts
3. **Missing Dependencies**: Run `pnpm install` from the root directory

### Getting Help

- Check the AG-UI documentation for detailed API reference
- Review the generative-ui-demo for advanced usage patterns
- Ensure all workspace dependencies are properly installed