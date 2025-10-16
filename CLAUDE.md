# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm install` - Install dependencies for the entire monorepo
- `pnpm build` - Build all packages in the monorepo
- `pnpm test` - Run all tests across packages
- `pnpm test:watch` - Run tests in watch mode across all packages
- `pnpm test:coverage` - Run tests with coverage reporting

### Code Quality
- `pnpm lint` - Run ESLint and auto-fix issues
- `pnpm lint:check` - Check for linting issues without fixing
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Package-Specific Commands
- `pnpm build:core` - Build only the @ag-ui/core package
- `pnpm build:ng-zorro` - Build only the @ag-ui/ng-zorro package  
- `pnpm build:theming` - Build only the @ag-ui/theming package
- `pnpm build:schematics` - Build only the @ag-ui/schematics package
- `pnpm test:core` - Test only the @ag-ui/core package
- `pnpm test:ng-zorro` - Test only the @ag-ui/ng-zorro package
- `pnpm test:theming` - Test only the @ag-ui/theming package
- `pnpm test:schematics` - Test only the @ag-ui/schematics package

### Individual Package Testing
For testing individual packages directly from the workspace:
- `cd packages/ag-ui-workspace && npx ng test @ag-ui/core --watch=false`
- `cd packages/ag-ui-workspace && npx ng test @ag-ui/ng-zorro --watch=false`
- `cd packages/ag-ui-workspace && npx ng test @ag-ui/theming --watch=false`
- `cd packages/ag-ui-workspace && npx ng test @ag-ui/schematics --watch=false`

## Architecture

This is a PNPM monorepo containing Angular 20 libraries that implement the AG-UI protocol with NG-ZORRO components.

### Monorepo Structure
```
packages/
├── ag-ui-workspace/          # Angular CLI workspace with library projects
│   ├── projects/
│   │   ├── ag-ui/core/       # Core protocol logic, no UI dependencies
│   │   ├── ag-ui/ng-zorro/   # UI components built on NG-ZORRO
│   │   ├── ag-ui/theming/    # Shared styling and theming
│   │   └── ag-ui/schematics/ # Angular CLI schematics
└── examples/                 # Demo applications
    ├── basic-chat/
    └── generative-ui-demo/
```

### Architectural Boundaries
The project enforces strict dependency rules via ESLint `import/no-restricted-paths`:

- **@ag-ui/core**: Can only import external libraries, cannot import from other @ag-ui packages
- **@ag-ui/ng-zorro**: Can import from @ag-ui/core and external libraries
- **@ag-ui/theming**: Must remain independent, cannot import from @ag-ui/core or @ag-ui/ng-zorro  
- **@ag-ui/schematics**: Can only import external libraries

These boundaries ensure clean architecture and proper dependency flow.

### Technology Stack
- **Framework**: Angular 20 with standalone components
- **UI Library**: NG-ZORRO (Ant Design for Angular)
- **Build System**: Angular CLI with ng-packagr
- **Testing**: Karma with Jasmine (Angular 20's Jest builder is experimental)
- **Package Manager**: PNPM with workspace support
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Change Detection**: Zone.js (required for Angular 20 testing)

### Key Implementation Details
- Uses Angular Signals for reactive state management
- Testing uses Karma with `@angular/build:karma` builder (Jest dependencies removed)
- Zone.js polyfills configured for all test environments
- TypeScript configurations extend from `tsconfig.base.json`
- All libraries use `@angular/build:ng-packagr` for building
- Karma configuration shared across all packages via `karma.conf.js`

## Development Notes

### Package Management
- Use PNPM workspaces for efficient dependency management
- All commands should be run from the root directory
- Use `pnpm -r` to run commands across all packages
- Use `pnpm --filter <package-name>` to target specific packages

### Testing Strategy
- Unit tests use Karma with Jasmine and Angular testing utilities
- Zone.js polyfills required for all test environments
- Test files should be co-located with source files (*.spec.ts)
- Coverage reports available via `pnpm test:coverage`
- Use `--watch=false` flag for CI/automated testing
- All library packages have working test suites configured

### Code Style
- ESLint enforces architectural boundaries and code quality
- Prettier handles code formatting
- Import ordering follows ESLint configuration
- TypeScript strict mode enabled via base configuration

### Known Limitations & Solutions
- **Zone.js Required**: Angular 20 testing requires Zone.js polyfills (`zone.js`, `zone.js/testing`)
- **NG-ZORRO Version**: Updated to 20.3.1 to resolve peer dependency issues with Angular 20
- **Jest Builder Issues**: Angular 20's experimental Jest builder is unstable - resolved: switched to Karma with Jasmine
- **SCSS Export Issues**: Don't export SCSS files from TypeScript `public-api.ts` - solution: remove SCSS exports

### Troubleshooting Common Issues
- **Test Failures**: Ensure Zone.js polyfills are configured in `angular.json` test options
- **Build Errors**: Check that SCSS files aren't exported from TypeScript files
- **Module Not Found**: Verify all dependencies are installed and versions are compatible
- **Jest Dependencies**: Removed - use Karma with Jasmine for testing instead