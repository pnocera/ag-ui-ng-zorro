# AG-UI + NG-ZORRO Angular 20 Monorepo

A modern Angular 20 monorepo implementing the AG-UI protocol with NG-ZORRO components, built with PNPM workspaces.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build

# Run linting and formatting
pnpm lint
pnpm format
```

## 📦 Packages

### Libraries
- **@ag-ui/core** - Core AG-UI protocol logic and state management
- **@ag-ui/ng-zorro** - UI components built on NG-ZORRO
- **@ag-ui/theming** - Shared styling and theming system
- **@ag-ui/schematics** - Angular CLI schematics for project setup

### Examples
- **basic-chat** - Basic chat application example
- **generative-ui-demo** - Dynamic form and generative UI showcase

## 🛠 Development

### Testing Individual Packages
```bash
# Test specific packages from workspace root
pnpm test:core
pnpm test:ng-zorro
pnpm test:theming
pnpm test:schematics

# Or test directly from workspace
cd packages/ag-ui-workspace
npx ng test @ag-ui/core --watch=false
```

### Building Libraries
```bash
pnpm build:core
pnpm build:ng-zorro
pnpm build:theming
pnpm build:schematics
```

## 🏗 Architecture

This monorepo enforces strict architectural boundaries:
- **Core** contains only business logic and state management
- **NG-ZORRO** provides UI components that depend on Core
- **Theming** remains independent of other packages
- **Schematics** has minimal dependencies for CLI integration

## 📋 Requirements

- Node.js >= 18.13.0
- PNPM >= 8.0.0
- Angular 20

## 🧪 Testing

Tests use Karma with Jasmine. Zone.js polyfills are configured for Angular compatibility.

## 📜 License

Private project - all rights reserved.