# GitHub-Switcher Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-15

## 文档语言要求 (Documentation Language Requirement)

**所有项目文档必须使用简体中文编写**，包括但不限于：
- 功能规格 (spec.md)
- 实施计划 (plan.md)
- 任务列表 (tasks.md)
- 代码注释（业务逻辑部分）
- Git commit messages
- README、CHANGELOG 等用户文档

**例外**：代码标识符（变量名、函数名、类名）保持英文，技术术语可保留英文原文并附中文注释。

## Active Technologies
- **Chrome Extension**: Plasmo 0.90.5 (Manifest V3 framework) for browser extension development
- **Language**: TypeScript 5.x with strict type checking enabled
- **Build & Dev Tools**: pnpm package manager, cross-env for environment variables
- **Code Quality**: Biome (linter), Prettier (formatter)
- **Testing**: Vitest with v8 coverage (100% coverage on core utilities)
- **UI Architecture**: Native DOM manipulation (no React/framework) with CSS class prefix `__github-switcher` for isolation
- **Storage**: chrome.storage.sync for user preferences (open in new tab toggle, enabled tools list)
- **Navigation**: GitHub SPA navigation support (popstate, turbo:load event listeners)
- **Accessibility**: ARIA attributes for keyboard navigation and screen reader support

## Project Structure

```text
src/
  contents/          # Content scripts injected into GitHub pages
    index.ts        # Main content script entry point
  lib/              # Core library code
    config.ts       # Tool configuration and feature flags
    detectGithub.ts # GitHub URL parsing and validation
    storage.ts      # User preferences management
    types.ts        # TypeScript type definitions
    urlGenerator.ts # Tool URL generation logic
  ui/               # UI components (native DOM)
    SidebarButton.ts  # Fixed-position sidebar button
    ToolDropdown.ts   # Dropdown menu with tool links
  utils/            # Utility functions
    logger.ts       # Logging utility
    positioning.ts  # Menu positioning logic
tests/
  unit/             # Unit tests for core utilities
    detectGithub.test.ts  # GitHub URL parser tests (15 tests)
    urlGenerator.test.ts  # URL generator tests (8 tests)
    positioning.test.ts   # Positioning logic tests (8 tests)
    logger.test.ts        # Logger tests (8 tests)
  setup.ts          # Test configuration
build/
  chrome-mv3-prod/  # Production build output (40KB total, 4.4KB gzipped content script)
```

## Commands

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build production bundle

# Code Quality
pnpm run lint         # Run Biome linter
pnpm run lint:fix     # Auto-fix linting issues
pnpm run typecheck    # Run TypeScript type checking
pnpm run format       # Auto-format with Prettier

# Testing
pnpm test                 # Run all tests
pnpm test -- --coverage   # Run tests with coverage report
pnpm test:watch           # Run tests in watch mode
```

## Code Style

- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Native DOM**: Use `document.createElement`, no JSX or framework-specific syntax
- **CSS Isolation**: All class names must use `__github-switcher-` prefix
- **Event Handling**: Use `addEventListener` with proper cleanup in unmount methods
- **Async Operations**: Always use `async/await`, handle errors with try-catch
- **Testing**: Aim for ≥80% code coverage, use descriptive test names
- **Comments**: JSDoc comments for all exported functions and classes
- **Imports**: Use TypeScript path aliases (@/ for src/)

## Architecture Patterns

### Component Pattern (Native DOM)
```typescript
export class ComponentName {
  private element: HTMLElement | null = null;
  
  constructor(private config: Config) {}
  
  public mount(): void {
    this.injectStyles();
    this.element = this.createElement();
    document.body.appendChild(this.element);
  }
  
  public unmount(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
  
  private injectStyles(): void {
    if (document.getElementById('unique-style-id')) return;
    const style = document.createElement('style');
    style.id = 'unique-style-id';
    style.textContent = `/* CSS here */`;
    document.head.appendChild(style);
  }
}
```

### Content Script Pattern (Plasmo)
```typescript
import type { PlasmoContentScript } from 'plasmo';

export const config: PlasmoContentScript = {
  matches: ['https://github.com/*/*'],
  run_at: 'document_end'
};

// Global state
let component: Component | null = null;

async function initialize() {
  // Initialization logic
}

(async function main() {
  try {
    await initialize();
    // Add event listeners
  } catch (error) {
    console.error('[Extension] Failed:', error);
  }
})();
```

## Recent Changes
- **2025-11-15** (003-codewiki-integration): Added CodeWiki as 9th tool
  - Added CodeWiki tool configuration (https://codewiki.google/{owner}/{repo})
  - Positioned CodeWiki below DeepWiki in tool menu (order: 3)
  - Updated all tool orders (CodeSandbox 3→4, StackBlitz 4→5, etc.)
  - Added CodeWiki-specific unit tests (2 new test cases)
  - Updated documentation (README, STORE_LISTING, spec, CHANGELOG)
  - Maintained 100% test coverage (41 tests passing)

- **2025-11-12** (002-github-switcher-sidebar): Complete implementation of sidebar tool menu feature
  - Added sidebar button component with vertical text and fixed positioning
  - Added dropdown menu component with 9 third-party tools
  - Implemented smart menu positioning (bottom-right/top-right adaptation)
  - Added window resize handling for menu repositioning
  - Implemented GitHub SPA navigation support (popstate, turbo:load)
  - Added full accessibility support (ARIA attributes, keyboard navigation)
  - Achieved 100% test coverage on core utilities (39 tests passing)
  - Production bundle: 14KB uncompressed, 4.4KB gzipped

- **2025-11-11** (001-project-init): Initial project setup
  - Added TypeScript 5.x with strict type checking
  - Configured Plasmo framework, Biome linter, Prettier formatter
  - Set up Vitest testing framework
  - Created development workflow with hot reload

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
