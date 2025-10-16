
# Angular 20 + AG-UI + NG-ZORRO Library Enhanced Implementation Plan (PNPM Workspace)

## Project Overview

This document provides a comprehensive, enhanced plan for creating a production-ready Angular 20 library that implements the AG-UI protocol and integrates with the NG-ZORRO component library. This plan is specifically adapted for a **PNPM Workspace monorepo**, emphasizing efficient dependency management and flexible task orchestration. The library will enable Angular developers to build sophisticated, AI-driven applications with enterprise-grade UI components.

## Target Architecture

### Repository Structure (PNPM Workspace)

The project will be structured as a PNPM Workspace monorepo. This approach provides lightning-fast, disk-space-efficient dependency installation and powerful scripting capabilities for managing multiple projects.

```
/
├── pnpm-workspace.yaml          # Defines the location of projects in the monorepo
├── package.json                 # Root workspace config with shared devDependencies and scripts
├── .eslintrc.json               # Monorepo-wide ESLint configuration
├── prettier.config.js           # Monorepo-wide Prettier configuration
├── tsconfig.base.json           # Shared TypeScript configuration for all projects
├── docs/                        # Project documentation (guides, concepts)
└── packages/                    # All projects/packages reside here
    ├── angular-workspace/       # A standard multi-project Angular CLI workspace
    │   ├── package.json         # (Minimal, mostly for Angular CLI)
    │   ├── angular.json         # Angular CLI configuration for all Angular projects
    │   ├── tsconfig.json        # Workspace-level TS config
    │   └── projects/
    │       ├── ag-ui-ng-zorro/  # Main UI library (depends on 'core' and 'theming')
    │       │   ├── package.json # Defines library name, peerDeps, and scripts
    │       │   ├── ng-package.json
    │       │   └── src/ ...
    │       ├── core/            # Core protocol logic (no UI dependencies)
    │       │   ├── package.json
    │       │   └── src/ ...
    │       ├── theming/         # Shared styling and assets
    │       │   ├── package.json
    │       │   └── src/ ...
    │       └── schematics/      # ng add, ng generate, ng update schematics
    │           ├── package.json
    │           └── src/ ...
    └── examples/                # Demo applications (each is a separate package)
        ├── basic-chat/
        │   ├── package.json
        │   └── angular.json
        └── generative-ui-demo/
            ├── package.json
            └── angular.json
```

## Core Implementation Phases, Milestones, and Micro-Tasks

### Phase 1: Foundation & Architecture (Week 1)

**Milestone:** A fully configured PNPM monorepo with an integrated Angular workspace, strict architectural rules, a robust testing foundation, and a flexible theming strategy.

*   **Micro-Task 1.1: Initialize PNPM Workspace**
    *   [ ] Run `pnpm init` to create the root `package.json`.
    *   [ ] Create the `pnpm-workspace.yaml` file with content: `packages:\n  - 'packages/**'\n  - 'packages/angular-workspace/projects/**'`.
    *   [ ] Create the `packages/` directory.
*   **Micro-Task 1.2: Set Up Angular CLI Workspace**
    *   [ ] Navigate into `packages/` and create the `angular-workspace` directory.
    *   [ ] Inside `packages/angular-workspace`, run `ng new --create-application=false` to set up a multi-project Angular workspace.
    *   [ ] Generate the `ag-ui-ng-zorro` UI library: `ng generate library @ag-ui/ng-zorro`.
    *   [ ] Generate the `core` logic library: `ng generate library @ag-ui/core`.
    *   [ ] Generate the `theming` assets library: `ng generate library @ag-ui/theming`.
    *   [ ] Generate the `schematics` project: `ng generate library @ag-ui/schematics`.
*   **Micro-Task 1.3: Enforce Architectural Boundaries**
    *   [ ] Install `eslint-plugin-import` in the root `package.json`.
    *   [ ] Configure `.eslintrc.json` with `import/no-restricted-paths` rules to enforce dependencies (e.g., prevent `@ag-ui/core` from importing from `@ag-ui/ng-zorro`).
*   **Micro-Task 1.4: Setup Tooling and DX**
    *   [ ] Configure Prettier and ESLint at the monorepo root.
    *   [ ] Set up Husky pre-commit hooks in the root `package.json` to run linting and formatting.
    *   [ ] Configure the root `tsconfig.base.json` with strict mode enabled, and have all project-level `tsconfig.json` files extend from it.
*   **Micro-Task 1.5: Integrate NG-ZORRO and Theming**
    *   [ ] Add `ng-zorro-antd` as a peer dependency to `packages/angular-workspace/projects/ag-ui-ng-zorro/package.json`.
    *   [ ] In the `theming` library, define a base set of CSS custom properties for colors, spacing, and typography.
    *   [ ] Document how consumers can override these properties for custom themes.
*   **Micro-Task 1.6: Configure Testing Suite**
    *   [ ] Configure Jest for all libraries within the `angular.json` file.
    *   [ ] Create root-level scripts in `package.json` to run tests for all packages: `"test": "pnpm -r --stream test"`.
    *   [ ] Set up Cypress for E2E testing of the `examples` applications.
    *   [ ] Integrate `jest-axe` for accessibility testing in unit tests.
    *   [ ] Set up a placeholder for visual regression testing (e.g., Percy project creation).

---

### Phase 2: Core Services & Protocol Implementation (Week 2)

**Milestone:** A functional, framework-agnostic `@ag-ui/core` library that handles AG-UI protocol, state management, and data transport.

*   **Micro-Task 2.1: Port AG-UI Protocol**
    *   [ ] Define all AG-UI event types (`BaseEvent`, etc.) in the `core` library's types folder.
    *   [ ] Implement the `AbstractAgent` base class as an abstract injectable service.
*   **Micro-Task 2.2: Implement HttpAgent Service**
    *   [ ] Create `HttpAgent` service in the `core` library.
    *   [ ] Use Angular's `HttpClient` for all HTTP requests to support interceptors and advanced features.
    *   [ ] Implement SSE and binary protocol handling, returning an `Observable<BaseEvent>`.
*   **Micro-Task 2.3: Formalize State Management**
    *   [ ] Design `AgentStateService` in the `core` library.
    *   [ ] Use Angular Signals for reactive state properties (e.g., `status = signal<AgentStatus>('idle')`).
    *   [ ] **Decision Point:** Evaluate and select a Signal-based store pattern (e.g., build a simple one, or adopt `@ngrx/signals`'s `signalStore` for structure).
    *   [ ] Create methods for processing the event stream and updating the state (`processEvent(event: BaseEvent)`).
*   **Micro-Task 2.4: Implement Transport Layers**
    *   [ ] Create a `WebSocketService` for real-time communication.
    *   [ ] Ensure all services are transport-agnostic and configurable via DI.
*   **Micro-Task 2.5: Unit Test the Core Library**
    *   [ ] Write Jest unit tests for `HttpAgent`, mocking `HttpClient`.
    *   [ ] Write unit tests for `AgentStateService`, ensuring state transitions are correct.
    *   [ ] Run tests using `pnpm --filter @ag-ui/core test`.
    *   [ ] Achieve >95% test coverage for the `core` library.

---

### Phase 3: Chat Interface Components (Week 3)

**Milestone:** A complete, themeable, and accessible set of chat components within the `@ag-ui/ng-zorro` library.

*   **Micro-Task 3.1: Develop `AgChatComponent`**
    *   [ ] Create the main container component using `nz-card` and `nz-list`.
    *   [ ] Implement `OnPush` change detection strategy.
    *   [ ] Add inputs for `agent` and `messages`, and an output for `messageSent`.
    *   [ ] Implement auto-scrolling and virtual scrolling for message display.
*   **Micro-Task 3.2: Develop `MessageComponent`**
    *   [ ] Create the component to render individual messages using `nz-avatar` and `nz-tag`.
    *   [ ] Implement markdown-to-HTML rendering for message content.
    *   [ ] Add support for different message authors (user, agent) and states (streaming, complete).
    *   [ ] Add placeholders for i18n on static text (e.g., roles).
*   **Micro-Task 3.3: Develop `ChatInputComponent`**
    *   [ ] Create the input form using `nz-input` (textarea) and `nz-button`.
    *   [ ] Implement auto-resizing and keyboard shortcuts (e.g., Enter to send).
    *   [ ] Add support for disabled state while the agent is responding.
*   **Micro-Task 3.4: Integrate Components with State Management**
    *   [ ] In `AgChatComponent`, inject `AgentStateService` from `@ag-ui/core`.
    *   [ ] Use `toSignal` to convert the agent's observable event stream for consumption in component templates.
*   **Micro-Task 3.5: Component Testing**
    *   [ ] Write Angular `TestBed` tests for each chat component.
    *   [ ] Test all `@Input`s, `@Output`s, and user interactions.
    *   [ ] Run accessibility checks with `jest-axe` on rendered components.

---

### Phase 4: Agent State & Generative UI Components (Week 4)

**Milestone:** Visual components for displaying agent status, tool calls, and dynamically generated UI from agent payloads.

*   **Micro-Task 4.1: Develop Agent State Components**
    *   [ ] Implement `AgentStatusComponent` using `nz-badge` and `nz-spin`.
    *   [ ] Implement `ToolCallComponent` using `nz-steps` and `nz-progress`.
    *   [ ] Implement `StateViewerComponent` using `nz-table` or a JSON tree viewer.
*   **Micro-Task 4.2: Develop `DynamicFormComponent`**
    *   [ ] Create the component that accepts a JSON schema `@Input`.
    *   [ ] Implement a flexible component mapping service that maps schema types to NG-ZORRO form components.
    *   [ ] Ensure the mapping is overridable by the consumer via DI.
    *   [ ] Integrate `nz-form` for layout and real-time validation.
*   **Micro-Task 4.3: Develop Data Display & Action Components**
    *   [ ] Implement `DataDisplayComponent` using `nz-table`.
    *   [ ] Implement `ActionPanelComponent` using `nz-button-group`.
*   **Micro-Task 4.4: Component Testing and Integration**
    *   [ ] Write `TestBed` tests for all new components.
    *   [ ] Create a `generative-ui-demo` example application to test the integration.

---

### Phase 5: Advanced Features & Refinements (Week 5)

**Milestone:** Implementation of Human-in-the-Loop patterns, robust error handling, and comprehensive accessibility.

*   **Micro-Task 5.1: Human-in-the-Loop (HITL) Support**
    *   [ ] Create a service that uses `NzModalService` to display confirmation prompts.
    *   [ ] Design components for HITL forms that can be dynamically rendered inside modals.
*   **Micro-Task 5.2: Real-time Streaming and Error Handling**
    *   [ ] Enhance `MessageComponent` with a streaming text animation.
    *   [ ] Create a global `ErrorHandlerService` that can display errors using `nz-message`.
    *   [ ] Implement error boundary components to gracefully handle component-level failures.
*   **Micro-Task 5.3: Accessibility Polish**
    *   [ ] Conduct a full review of all components for WCAG 2.1 AA compliance.
    *   [ ] Ensure all interactive elements are keyboard navigable and tested with screen readers.

---

### Phase 6: Developer Experience & Schematics (Week 6)

**Milestone:** A radically simple onboarding experience through the implementation of Angular CLI schematics in the `@ag-ui/schematics` package.

*   **Micro-Task 6.1: Create `ng add` Schematic**
    *   [ ] Set up the `@ag-ui/schematics` project.
    *   [ ] Write the `ng-add` schematic to automate project setup (add peer dependencies, configure NG-ZORRO, set up providers, add theme imports).
*   **Micro-Task 6.2: Create `ng generate` Schematics**
    *   [ ] Implement a schematic `ng g @ag-ui/ng-zorro:chat-view` that scaffolds a fully configured chat component.
*   **Micro-Task 6.3: Implement `ng update` Schematic**
    *   [ ] Create a basic `ng-update` schematic to handle future migrations.
*   **Micro-Task 6.4: Test Schematics**
    *   [ ] Write unit tests for the schematics.
    *   [ ] Test schematics by running them against a blank Angular application.

---

### Phase 7: Documentation & Testing Polish (Week 7)

**Milestone:** A comprehensive documentation site with interactive examples and a fully-tested, stable codebase.

*   **Micro-Task 7.1: Set Up Documentation Tools**
    *   [ ] Integrate Storybook for Angular into its own package within the workspace.
    *   [ ] Integrate Compodoc to automatically generate API documentation from TSDoc comments.
*   **Micro-Task 7.2: Write Component Stories and Documentation**
    *   [ ] Write stories for every component, covering all major use cases.
    *   [ ] Write comprehensive guides in the `docs/` folder.
    *   [ ] Ensure 100% of the public API is documented with TSDoc comments.
*   **Micro-Task 7.3: Finalize Testing Suite**
    *   [ ] Complete the E2E test suite with Cypress.
    *   [ ] Implement visual regression tests with Percy by snapshotting all Storybook stories.
    *   [ ] Run `pnpm --filter "...[origin/main]" test` to test only affected packages during development.
*   **Micro-Task 7.4: Performance Optimization**
    *   [ ] Analyze the final bundle size of the libraries.
    *   [ ] Use `ng-packagr` analytics to ensure proper tree-shaking.

---

### Phase 8: Build, Release & Community Launch (Week 8)

**Milestone:** All libraries are published to npm, documentation is live, and a community announcement has been made.

*   **Micro-Task 8.1: Configure Build & Release Pipeline**
    *   [ ] Create a CI/CD pipeline (e.g., GitHub Actions) that runs `pnpm install` and `pnpm test` on every PR.
    *   [ ] Use PNPM's filtering for changed packages to speed up CI: `pnpm -r test --filter "...[origin/main]"`.
    *   [ ] Implement `changesets` or `semantic-release` to automate versioning, changelog generation, and npm publishing.
*   **Micro-Task 8.2: Final Integration Testing**
    *   [ ] Build all libraries using a root script: `"build": "pnpm -r --stream build"`.
    *   [ ] Test the `examples` applications using the local builds from `dist/`.
*   **Micro-Task 8.3: Publish Official Release**
    *   [ ] Merge to the main branch to trigger the release pipeline.
    *   [ ] Verify the packages (`@ag-ui/core`, `@ag-ui/ng-zorro`, etc.) are correctly published on npm.
*   **Micro-Task 8.4: Launch Documentation and Announce**
    *   [ ] Deploy the Storybook documentation to a public URL (e.g., GitHub Pages).
    *   [ ] Write a launch announcement highlighting the library's features.
*   **Micro-Task 8.5: Post-Release Planning**
    *   [ ] Triage incoming GitHub issues and PRs.
    *   [ ] Formalize the Q1 2025 roadmap based on initial feedback.

