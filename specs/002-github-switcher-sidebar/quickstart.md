# Quickstart Guide: GitHub Switcher Sidebar

**Feature**: 002-github-switcher-sidebar  
**Date**: 2025-11-12  
**Audience**: Developers implementing this feature

## Prerequisites

Before starting implementation, ensure you have:

- ✅ Node.js 18+ and npm/pnpm installed
- ✅ Chrome or Edge browser (latest stable) for testing
- ✅ TypeScript 5.x knowledge (strict mode)
- ✅ Basic understanding of Chrome Extension Manifest V3
- ✅ Familiarity with Plasmo framework (recommended: read [Plasmo docs](https://docs.plasmo.com))

---

## Project Setup

### 1. Verify Existing Configuration

The project is already initialized with:
- ✅ `package.json` with Plasmo, TypeScript, Vitest dependencies
- ✅ `tsconfig.json` with strict type checking
- ✅ `biome.json` for linting
- ✅ `vitest.config.ts` for testing
- ✅ Existing `src/lib/detectGithub.ts` (URL parser)
- ✅ Existing `tests/unit/detectGithub.test.ts`

### 2. Install Dependencies (if needed)

```bash
pnpm install
```

### 3. Verify Development Environment

```bash
# Run linter
pnpm run lint

# Run type checking
pnpm run type-check

# Run existing tests
pnpm test
```

All commands should pass before starting feature implementation.

---

## Implementation Workflow (Test-Driven Development)

### Phase 1: URL Generation & Positioning Logic (Pure Functions)

**Objective**: Implement and test URL generation and menu positioning before any UI work.

#### Step 1.1: Tool URL Generator

**Create**: `src/lib/urlGenerator.ts`

**Test first**: `tests/unit/urlGenerator.test.ts`

```typescript
// tests/unit/urlGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { generateToolUrl } from '../src/lib/urlGenerator';
import type { ToolEntry, RepositoryContext } from '../src/lib/types';

describe('generateToolUrl', () => {
  it('replaces placeholders correctly', () => {
    const tool: ToolEntry = {
      name: 'DeepWiki',
      urlTemplate: 'https://deepwiki.com/{owner}/{repo}',
      order: 2
    };
    
    const context: RepositoryContext = {
      owner: 'microsoft',
      repo: 'vscode',
      currentUrl: 'https://github.com/microsoft/vscode'
    };
    
    expect(generateToolUrl(tool, context)).toBe('https://deepwiki.com/microsoft/vscode');
  });
  
  it('encodes special characters', () => {
    const tool: ToolEntry = {
      name: 'Test',
      urlTemplate: 'https://example.com/{owner}/{repo}',
      order: 1
    };
    
    const context: RepositoryContext = {
      owner: 'my-org',
      repo: 'my.project',
      currentUrl: 'https://github.com/my-org/my.project'
    };
    
    const result = generateToolUrl(tool, context);
    expect(result).toBe('https://example.com/my-org/my.project');
  });
  
  // Add more test cases...
});
```

**Then implement**: `src/lib/urlGenerator.ts`

```typescript
// src/lib/urlGenerator.ts
import type { ToolEntry, RepositoryContext } from './types';

export function generateToolUrl(
  tool: ToolEntry,
  context: RepositoryContext
): string {
  return tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));
}
```

**Run tests**: `pnpm test urlGenerator`

---

#### Step 1.2: Menu Positioning Logic

**Create**: `src/utils/positioning.ts`

**Test first**: `tests/unit/positioning.test.ts`

```typescript
// tests/unit/positioning.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateMenuPosition } from '../src/utils/positioning';

describe('calculateMenuPosition', () => {
  // Mock window.innerHeight
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800
    });
  });
  
  it('positions menu bottom-right when sufficient space below', () => {
    const buttonRect = new DOMRect(0, 100, 40, 200); // x, y, width, height
    const menuHeight = 300;
    
    const position = calculateMenuPosition(buttonRect, menuHeight);
    
    expect(position).toEqual({
      top: 300, // buttonRect.bottom
      left: 40,  // buttonRect.right
      position: 'bottom-right'
    });
  });
  
  it('positions menu top-right when insufficient space below', () => {
    const buttonRect = new DOMRect(0, 600, 40, 200);
    const menuHeight = 300;
    
    const position = calculateMenuPosition(buttonRect, menuHeight);
    
    expect(position).toEqual({
      top: 300, // buttonRect.top - menuHeight = 600 - 300
      left: 40,
      position: 'top-right'
    });
  });
  
  // Add more test cases...
});
```

**Then implement**: `src/utils/positioning.ts`

```typescript
// src/utils/positioning.ts
export interface MenuPosition {
  top: number;
  left: number;
  position: 'bottom-right' | 'top-right';
}

export function calculateMenuPosition(
  buttonRect: DOMRect,
  menuHeight: number
): MenuPosition {
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - buttonRect.bottom;
  
  if (spaceBelow >= menuHeight) {
    return {
      top: buttonRect.bottom,
      left: buttonRect.right,
      position: 'bottom-right'
    };
  } else {
    return {
      top: buttonRect.top - menuHeight,
      left: buttonRect.right,
      position: 'top-right'
    };
  }
}
```

**Run tests**: `pnpm test positioning`

---

#### Step 1.3: Update Tool Configuration

**Update**: `src/lib/config.ts`

Add the complete tool list as specified in the spec:

```typescript
// src/lib/config.ts
import type { ToolEntry } from './types';

export const TOOLS: readonly ToolEntry[] = [
  {
    name: 'GitHub.dev',
    urlTemplate: 'https://github.dev/{owner}/{repo}',
    order: 1
  },
  {
    name: 'DeepWiki',
    urlTemplate: 'https://deepwiki.com/{owner}/{repo}',
    order: 2
  },
  {
    name: 'CodeSandbox',
    urlTemplate: 'https://githubbox.com/{owner}/{repo}',
    order: 3
  },
  {
    name: 'StackBlitz',
    urlTemplate: 'https://stackblitz.com/github/{owner}/{repo}',
    order: 4
  },
  {
    name: 'nbviewer',
    urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}',
    order: 5,
    note: 'optimal for .ipynb files'
  },
  {
    name: 'gitdiagram',
    urlTemplate: 'https://gitdiagram.com/{owner}/{repo}',
    order: 6
  },
  {
    name: 'gitingest',
    urlTemplate: 'https://gitingest.com/{owner}/{repo}',
    order: 7
  },
  {
    name: 'githistory',
    urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}',
    order: 8,
    note: 'optimal for file/folder paths'
  }
] as const;
```

---

#### Step 1.4: Update Type Definitions

**Update**: `src/lib/types.ts`

```typescript
// src/lib/types.ts

export interface RepositoryContext {
  owner: string;
  repo: string;
  currentUrl: string;
}

export interface ToolEntry {
  name: string;
  urlTemplate: string;
  order: number;
  note?: string;
}

export interface MenuState {
  isOpen: boolean;
  position: 'bottom-right' | 'top-right';
  focusedItemIndex: number;
}

export interface UserPreferences {
  openInNewTab: boolean;
  enabledTools: number[];
}

export interface GeneratedToolLink {
  tool: ToolEntry;
  url: string;
  enabled: boolean;
}
```

---

### Phase 2: UI Components (Native DOM)

**Objective**: Build UI components using native DOM APIs (no React/Vue/framework).

#### Step 2.1: Sidebar Button Component

**Create**: `src/ui/SidebarButton.ts`

```typescript
// src/ui/SidebarButton.ts
import type { MenuState } from '../lib/types';

export class SidebarButton {
  private container: HTMLDivElement;
  private button: HTMLButtonElement;
  private state: MenuState = {
    isOpen: false,
    position: 'bottom-right',
    focusedItemIndex: -1
  };
  
  constructor(private onToggle: (state: MenuState) => void) {
    this.container = this.createContainer();
    this.button = this.createButton();
    this.injectStyles();
    this.attachEventListeners();
  }
  
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = '__github-switcher-container';
    return container;
  }
  
  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = '__github-switcher-button';
    button.textContent = 'Open with…';
    button.setAttribute('aria-label', 'Open GitHub tools menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'gs-tools-menu');
    
    this.container.appendChild(button);
    return button;
  }
  
  private injectStyles(): void {
    // Only inject once
    if (document.getElementById('__github-switcher-button-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = '__github-switcher-button-styles';
    style.textContent = `
      .__github-switcher-button {
        position: fixed;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10000;
        
        padding: 12px 8px;
        background: #24292f;
        color: #ffffff;
        border: 1px solid #30363d;
        border-left: none;
        border-radius: 0 6px 6px 0;
        
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .__github-switcher-button:hover {
        background: #30363d;
      }
      
      .__github-switcher-button:focus {
        outline: 2px solid #0969da;
        outline-offset: 2px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  private attachEventListeners(): void {
    this.button.addEventListener('click', () => this.handleClick());
  }
  
  private handleClick(): void {
    this.state.isOpen = !this.state.isOpen;
    this.button.setAttribute('aria-expanded', String(this.state.isOpen));
    this.onToggle(this.state);
  }
  
  public mount(parent: HTMLElement = document.body): void {
    parent.appendChild(this.container);
  }
  
  public unmount(): void {
    this.container.remove();
  }
  
  public getRect(): DOMRect {
    return this.button.getBoundingClientRect();
  }
  
  public setState(newState: Partial<MenuState>): void {
    this.state = { ...this.state, ...newState };
    this.button.setAttribute('aria-expanded', String(this.state.isOpen));
  }
}
```

---

#### Step 2.2: Tool Dropdown Component

**Create**: `src/ui/ToolDropdown.ts`

```typescript
// src/ui/ToolDropdown.ts
import type { GeneratedToolLink } from '../lib/types';
import type { MenuPosition } from '../utils/positioning';

export class ToolDropdown {
  private container: HTMLDivElement;
  private backdrop: HTMLDivElement | null = null;
  private menu: HTMLUListElement | null = null;
  
  constructor(
    private tools: GeneratedToolLink[],
    private onClose: () => void
  ) {
    this.container = this.createContainer();
    this.injectStyles();
  }
  
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = '__github-switcher-dropdown-container';
    return container;
  }
  
  private injectStyles(): void {
    // Only inject once
    if (document.getElementById('__github-switcher-dropdown-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = '__github-switcher-dropdown-styles';
    style.textContent = `
      .__github-switcher-dropdown-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background: transparent;
      }
      
      .__github-switcher-dropdown-menu {
        position: fixed;
        z-index: 10001;
        
        min-width: 200px;
        max-width: 300px;
        margin: 0;
        padding: 8px 0;
        
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
        
        list-style: none;
      }
      
      .__github-switcher-dropdown-menu li {
        margin: 0;
        padding: 0;
      }
      
      .__github-switcher-dropdown-menu a {
        display: block;
        padding: 8px 16px;
        
        color: #24292f;
        text-decoration: none;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        
        transition: background-color 0.1s;
      }
      
      .__github-switcher-dropdown-menu a:hover {
        background: #f6f8fa;
      }
      
      .__github-switcher-dropdown-menu a:focus {
        outline: 2px solid #0969da;
        outline-offset: -2px;
      }
      
      .__github-switcher-tool-note {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: #656d76;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  private createBackdrop(): HTMLDivElement {
    const backdrop = document.createElement('div');
    backdrop.className = '__github-switcher-dropdown-backdrop';
    backdrop.addEventListener('click', () => this.onClose());
    return backdrop;
  }
  
  private createMenu(position: MenuPosition): HTMLUListElement {
    const menu = document.createElement('ul');
    menu.id = 'gs-tools-menu';
    menu.className = '__github-switcher-dropdown-menu';
    menu.setAttribute('role', 'menu');
    menu.style.top = `${position.top}px`;
    menu.style.left = `${position.left}px`;
    
    const enabledTools = this.tools.filter(t => t.enabled);
    
    enabledTools.forEach(({ tool, url }) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      
      const link = document.createElement('a');
      link.href = url;
      link.textContent = tool.name;
      link.setAttribute('role', 'menuitem');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      if (tool.note) {
        const note = document.createElement('span');
        note.className = '__github-switcher-tool-note';
        note.textContent = tool.note;
        link.appendChild(note);
      }
      
      link.addEventListener('click', () => this.onClose());
      
      li.appendChild(link);
      menu.appendChild(li);
    });
    
    return menu;
  }
  
  public show(position: MenuPosition): void {
    // Clean up existing elements
    this.hide();
    
    // Create and mount backdrop
    this.backdrop = this.createBackdrop();
    this.container.appendChild(this.backdrop);
    
    // Create and mount menu
    this.menu = this.createMenu(position);
    this.container.appendChild(this.menu);
  }
  
  public hide(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }
  
  public mount(parent: HTMLElement = document.body): void {
    parent.appendChild(this.container);
  }
  
  public unmount(): void {
    this.hide();
    this.container.remove();
  }
  
  public isVisible(): boolean {
    return this.menu !== null;
  }
}
```

---

#### Step 2.3: Style Injection Notes

**CSS Organization**:
- All styles are injected into `<head>` with unique IDs to prevent duplication
- Class names use `__github-switcher` prefix for isolation
- High z-index values (9999-10001) to stay above GitHub's UI
- Styles check for existing injection via `getElementById` before adding

**Alternative Approach - External CSS File**:

If you prefer separate `.css` files instead of inline styles:

**Create**: `src/ui/styles.css`

```css
.__github-switcher-button {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10000;
  /* ... rest of styles ... */
}

.__github-switcher-dropdown-menu {
  /* ... menu styles ... */
}
```

**Import in TypeScript**:

```typescript
import styleText from './styles.css?inline';

const style = document.createElement('style');
style.id = '__github-switcher-styles';
style.textContent = styleText;
document.head.appendChild(style);
```

**Note**: The `?inline` suffix tells Plasmo to import CSS as a string.

---

### Phase 3: Content Script Integration

### Phase 3: Content Script Integration

**Objective**: Inject UI components into GitHub pages using native DOM mounting.

#### Step 3.1: Main Content Script

**Create**: `src/contents/index.ts`

```typescript
import { isGitHubRepositoryPage } from '../lib/detectGithub';
import { parseGitHubUrl, generateToolUrl } from '../lib/urlUtils';
import { loadPreferences } from '../lib/preferences';
import { calculateMenuPosition } from '../utils/positioning';
import { SidebarButton } from '../ui/SidebarButton';
import { ToolDropdown } from '../ui/ToolDropdown';
import { TOOLS } from '../lib/config';
import type { MenuState, GeneratedToolLink } from '../lib/types';

// Plasmo content script configuration
export const config = {
  matches: ['https://github.com/*', 'https://www.github.com/*']
};

let sidebarButton: SidebarButton | null = null;
let toolDropdown: ToolDropdown | null = null;
let currentState: MenuState = {
  isOpen: false,
  position: 'bottom-right',
  focusedItemIndex: -1
};

/**
 * Initialize the extension UI
 */
async function init(): Promise<void> {
  // Check if on repository page
  if (!isGitHubRepositoryPage(window.location.href)) {
    console.debug('[GitHub-Switcher] Not a repository page, skipping');
    return;
  }
  
  // Parse repository context
  const repoContext = parseGitHubUrl(window.location.href);
  if (!repoContext) {
    console.error('[GitHub-Switcher] Failed to parse GitHub URL');
    return;
  }
  
  // Load user preferences
  const prefs = await loadPreferences();
  
  // Generate tool links
  const toolLinks: GeneratedToolLink[] = TOOLS.map(tool => {
    const visible = prefs.visibleTools?.[tool.name] ?? true;
    return {
      tool,
      url: generateToolUrl(tool, repoContext),
      enabled: visible
    };
  }).sort((a, b) => a.tool.order - b.tool.order);
  
  // Create sidebar button
  sidebarButton = new SidebarButton((newState) => handleToggle(newState));
  sidebarButton.mount();
  
  // Create dropdown (initially hidden)
  toolDropdown = new ToolDropdown(toolLinks, () => handleClose());
  toolDropdown.mount();
  
  console.info('[GitHub-Switcher] Initialized successfully');
}

/**
 * Handle menu toggle
 */
function handleToggle(newState: MenuState): void {
  currentState = newState;
  
  if (!toolDropdown || !sidebarButton) return;
  
  if (currentState.isOpen) {
    // Calculate menu position
    const buttonRect = sidebarButton.getRect();
    const position = calculateMenuPosition(buttonRect, currentState.position);
    
    // Show dropdown
    toolDropdown.show(position);
  } else {
    // Hide dropdown
    toolDropdown.hide();
  }
}

/**
 * Handle menu close
 */
function handleClose(): void {
  currentState.isOpen = false;
  
  if (sidebarButton) {
    sidebarButton.setState({ isOpen: false });
  }
  
  if (toolDropdown) {
    toolDropdown.hide();
  }
}

/**
 * Clean up on page unload
 */
function cleanup(): void {
  if (sidebarButton) {
    sidebarButton.unmount();
    sidebarButton = null;
  }
  
  if (toolDropdown) {
    toolDropdown.unmount();
    toolDropdown = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on unload
window.addEventListener('beforeunload', cleanup);

// Handle SPA navigation (GitHub uses Turbo/PJAX)
document.addEventListener('turbo:load', () => {
  cleanup();
  init();
});
```

**Test**: `tests/integration/content-script.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Content Script Integration', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://github.com/facebook/react'
    });
    
    document = dom.window.document;
    window = dom.window as unknown as Window;
    
    // Mock global objects
    global.document = document;
    global.window = window;
  });
  
  afterEach(() => {
    dom.window.close();
  });
  
  it('should inject sidebar button on repository pages', async () => {
    // Import and initialize
    await import('../../src/contents/index');
    
    // Wait for DOM mutations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check for button container
    const container = document.querySelector('.__github-switcher-container');
    expect(container).toBeTruthy();
    
    // Check button
    const button = container?.querySelector('button.__github-switcher-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Open with…');
    
    // Check styles injected
    const styles = document.getElementById('__github-switcher-button-styles');
    expect(styles).toBeTruthy();
  });
  
  it('should not inject on non-repository pages', async () => {
    // Change URL to non-repo page
    Object.defineProperty(window, 'location', {
      value: { href: 'https://github.com/explore' },
      writable: true
    });
    
    await import('../../src/contents/index');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const container = document.querySelector('.__github-switcher-container');
    expect(container).toBeNull();
  });
});
```

---

### Phase 4: Development & Testing

#### Step 4.1: Run Development Server

```bash
pnpm dev
```

This starts Plasmo in development mode with hot reload.

#### Step 4.2: Load Extension in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/chrome-mv3-dev` directory

#### Step 4.3: Test on GitHub

1. Navigate to any GitHub repository (e.g., `https://github.com/microsoft/vscode`)
2. Verify sidebar button appears on the left
3. Click button → verify dropdown menu appears
4. Click a tool link → verify it opens in new tab with correct URL
5. Test edge cases:
   - Navigate to `github.com/explore` → button should NOT appear
   - Navigate within repository using GitHub's UI → button should update correctly

#### Step 4.4: Run Unit Tests

```bash
pnpm test
```

Verify ≥80% coverage:

```bash
pnpm test --coverage
```

#### Step 4.5: Manual Testing Checklist

- [ ] Button appears on repository pages only (FR-001, FR-002)
- [ ] Button positioned on left side without obstructing content (FR-020)
- [ ] Dropdown shows all 8 tools in correct order (FR-005)
- [ ] Tool URLs are correctly generated (FR-007, SC-003)
- [ ] Links open in new tab (FR-008)
- [ ] Dropdown closes when clicking outside (FR-011)
- [ ] Dropdown repositions when near bottom of viewport (FR-014, SC-004)
- [ ] Tab key navigation works (FR-022, SC-007)
- [ ] Screen reader announces button and menu items (SC-007)
- [ ] No console errors (Constitution requirement)

---

## Production Build

### Build for Production

```bash
pnpm build
```

Output: `build/chrome-mv3-prod/`

### Verify Production Bundle

```bash
# Check bundle size
du -sh build/chrome-mv3-prod/

# Should be ≤40KB gzipped (updated target for native DOM)
gzip -c build/chrome-mv3-prod/contents.*.js | wc -c
```

### Test Production Build

1. Load `build/chrome-mv3-prod` in Chrome (same steps as dev)
2. Verify all functionality works
3. Check performance:
   - Open Chrome DevTools → Performance
   - Record while opening dropdown
   - Verify button injection ≤100ms
   - Verify dropdown appearance ≤500ms
   - Verify no long tasks >50ms

---

## Troubleshooting

### Button doesn't appear

- Check URL matches pattern: `https://github.com/*/*` (two path segments)
- Open DevTools console for errors
- Verify content script is injected: `document.querySelector('.__github-switcher-container')`
- Check if styles injected: `document.getElementById('__github-switcher-button-styles')`

### Dropdown positioned incorrectly

- Inspect `calculateMenuPosition` output in console
- Check `window.innerHeight` value
- Verify button `getBoundingClientRect()` returns correct values

### Tests failing

- Run `pnpm install` to ensure dependencies are up to date
- Check `vitest.config.ts` matches project configuration
- Run tests in watch mode: `pnpm test --watch`

### Linter errors

```bash
# Auto-fix
pnpm run lint --fix
```

### CSS styles not applying

- Check that styles are injected into `<head>`: `document.getElementById('__github-switcher-button-styles')`
- Verify class names use `__github-switcher` prefix
- Check for CSS conflicts using DevTools inspector
- Ensure z-index values are high enough (10000+)
- Look for `!important` overrides from GitHub's styles

---


---

## Production Build

### Build for Production

```bash
pnpm build
```

Output: `build/chrome-mv3-prod/`

### Verify Production Bundle

```bash
# Check bundle size
du -sh build/chrome-mv3-prod/

# Should be ≤80KB gzipped
gzip -c build/chrome-mv3-prod/contents.*.js | wc -c
```

### Test Production Build

1. Load `build/chrome-mv3-prod` in Chrome (same steps as dev)
2. Verify all functionality works
3. Check performance:
   - Open Chrome DevTools → Performance
   - Record while opening dropdown
   - Verify no long tasks >50ms

---

## Troubleshooting

### Button doesn't appear

- Check URL matches pattern: `https://github.com/*/*` (two path segments)
- Open DevTools console for errors
- Verify content script is injected: `document.querySelector('.gs-sidebar-button')`

### Dropdown positioned incorrectly

- Inspect `calculateMenuPosition` output in console
- Check `window.innerHeight` value
- Verify button `getBoundingClientRect()` returns correct values

### Tests failing

- Run `pnpm install` to ensure dependencies are up to date
- Check `vitest.config.ts` matches project configuration
- Run tests in watch mode: `pnpm test --watch`

### Linter errors

```bash
# Auto-fix
pnpm run lint --fix

# Check specific file
pnpm biome check src/lib/urlGenerator.ts
```

---

## Next Steps

After implementing this feature:

1. **Code Review**: Submit PR following CONTRIBUTING.md guidelines
2. **Documentation**: Update README.md with installation instructions
3. **User Testing**: Have team members test in their workflows
4. **Performance**: Run Lighthouse audit to verify <150ms first render
5. **Accessibility**: Test with screen reader (macOS VoiceOver or NVDA)

---

## Resources

- [Plasmo Framework Docs](https://docs.plasmo.com)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Vitest Documentation](https://vitest.dev/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Feature Spec](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/README.md)

---

**Estimated Time**: 4-6 hours (assuming familiarity with Plasmo and TypeScript)

**Complexity**: Medium (content script injection, DOM manipulation, positioning logic)

**Risk Areas**: GitHub's dynamic DOM structure (test across multiple GitHub page types)
