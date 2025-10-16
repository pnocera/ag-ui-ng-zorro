# Architectural Boundaries Enforcement

This project uses ESLint with the `import/no-restricted-paths` rule to enforce clean architecture between the different packages.

## Enforced Dependencies

### Core Library (`@ag-ui/core`)
- **CAN import from**: External libraries, Node.js built-ins
- **CANNOT import from**: `@ag-ui/ng-zorro`, `@ag-ui/theming`
- **Purpose**: Contains core protocol logic and state management without UI dependencies

### NG-ZORRO Library (`@ag-ui/ng-zorro`)
- **CAN import from**: External libraries, `@ag-ui/core`, Node.js built-ins
- **CANNOT import from**: `@ag-ui/theming`
- **Purpose**: UI components built on top of NG-ZORRO and core functionality

### Theming Library (`@ag-ui/theming`)
- **CAN import from**: External libraries, Node.js built-ins
- **CANNOT import from**: `@ag-ui/core`, `@ag-ui/ng-zorro`
- **Purpose**: Shared styling and assets, should remain independent of business logic

### Schematics Library (`@ag-ui/schematics`)
- **CAN import from**: External libraries, Node.js built-ins
- **CANNOT import from**: `@ag-ui/core`, `@ag-ui/ng-zorro`, `@ag-ui/theming`
- **Purpose**: Angular CLI schematics with minimal dependencies

## ESLint Configuration

The architectural boundaries are enforced through the `eslint.config.js` file using the `import/no-restricted-paths` rule. Any violation will be caught during development and CI.

### Example Violations

```typescript
// ❌ BAD: Core importing from UI libraries
import { SomeComponent } from '@ag-ui/ng-zorro'; // ESLint Error
import { SomeTheme } from '@ag-ui/theming';     // ESLint Error

// ✅ GOOD: Core importing only external libraries
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// ❌ BAD: Theming importing from core or UI
import { CoreService } from '@ag-ui/core';         // ESLint Error
import { UIComponent } from '@ag-ui/ng-zorro';     // ESLint Error

// ✅ GOOD: NG-ZORRO importing from core
import { CoreService } from '@ag-ui/core';         // Allowed
import { NzButtonModule } from 'ng-zorro-antd';    // External library
```

## Running Linting

To check for architectural violations:

```bash
pnpm lint:check  # Check for issues without fixing
pnpm lint        # Check and auto-fix issues
```

## Benefits

1. **Clean Architecture**: Ensures dependencies flow in the right direction
2. **Maintainability**: Prevents circular dependencies and tight coupling
3. **Testability**: Core logic can be tested independently of UI concerns
4. **Bundle Optimization**: Allows for better tree-shaking and smaller bundles
5. **Developer Experience**: Immediate feedback when architectural boundaries are violated