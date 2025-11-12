# Research: GitHub Switcher Sidebar

**Feature**: 002-github-switcher-sidebar  
**Date**: 2025-11-12  
**Phase**: 0 (Outline & Research)

## Overview

This document consolidates research findings for implementing the GitHub Switcher Sidebar extension. All technical decisions are based on the specified technology stack: TypeScript + Plasmo (MV3) + native CSS, targeting Chrome/Edge latest stable versions.

---

## Research Tasks

### 1. Plasmo Framework Content Script Injection Best Practices

**Decision**: Use Plasmo's declarative content script approach with `export const config` for URL matching

**Rationale**:
- Plasmo provides built-in TypeScript support with automatic type generation
- Declarative `config.matches` patterns are more maintainable than manifest.json editing
- Hot module replacement (HMR) works seamlessly with content scripts during development
- Automatic bundle optimization handles code splitting and tree shaking

**Implementation Approach**:
```typescript
// src/contents/index.ts
export const config: PlasmoContentScript = {
  matches: ["https://github.com/*/*"],
  run_at: "document_end"
}
```

**Alternatives Considered**:
- Manual manifest.json editing: Rejected because Plasmo's declarative approach is type-safe and less error-prone
- document_start timing: Rejected because GitHub's SPA needs DOM to be ready before injection

**References**:
- [Plasmo Content Scripts Documentation](https://docs.plasmo.com/framework/content-scripts)
- [Manifest V3 Content Script Guidelines](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

---

### 2. GitHub URL Pattern Matching & Parsing

**Decision**: Use regex pattern `^https?://(www\.)?github\.com/([^/]+)/([^/]+)(/.*)?$` with capture groups

**Rationale**:
- Captures owner (group 2) and repo (group 3) in a single pass
- Handles both www and non-www variants
- Supports both http/https (though GitHub redirects http to https)
- Allows trailing paths (files, PRs, issues) while ignoring them
- More performant than URL parsing + string splitting for this specific case

**Implementation Approach**:
```typescript
export function parseGitHubUrl(url: string): RepositoryContext | null {
  const pattern = /^https?:\/\/(www\.)?github\.com\/([^\/]+)\/([^\/]+)(\/.*)?$/;
  const match = url.match(pattern);
  
  if (!match) return null;
  
  return {
    owner: match[2],
    repo: match[3],
    currentUrl: url
  };
}
```

**Edge Cases Handled**:
- `github.com/owner` → Returns null (no repo)
- `github.com/explore` → Returns null (not a repo URL)
- `github.com/owner/repo/blob/main/file.ts` → Returns `{owner, repo}` (ignores path)

**Alternatives Considered**:
- URL API parsing: Rejected because regex is simpler and more explicit for this single-domain case
- String splitting on `/`: Rejected because less robust for handling edge cases

**References**:
- Existing implementation in `src/lib/detectGithub.ts` can be reused/enhanced

---

#### Decision 6: Content Script CSS Isolation Strategy

**Context**: Content scripts inject UI into GitHub pages. CSS styles must not conflict with GitHub's existing styles or affect page layout.

**Options Evaluated**:
1. **CSS class name prefix `__github-switcher`** ✅
   - Pros: Simple to implement and understand
   - Pros: No special DOM APIs needed
   - Pros: Easy to debug in DevTools
   - Cons: Requires defensive CSS for complete isolation
   
2. Shadow DOM with `mode: 'open'`
   - Pros: Perfect CSS isolation
   - Cons: More complex setup and event handling
   - Cons: Overkill for simple extension UI

3. CSS Modules with Plasmo
   - Pros: Automatic scoping at build time
   - Cons: Adds build complexity
   - Cons: Still injects into global scope

**Decision**: Use **CSS class name prefix `__github-switcher`**

**Rationale**:
- Simple and straightforward implementation
- Easy to understand and maintain
- Sufficient isolation with proper CSS specificity
- No need for complex Shadow DOM setup
- Easier debugging - styles visible in DevTools inspector
- Prefix `__github-switcher` clearly indicates extension ownership

**Implementation**:
```typescript
// Create container
const container = document.createElement('div');
container.className = '__github-switcher-container';

// Create button
const button = document.createElement('button');
button.className = '__github-switcher-button';

// Inject styles into document head
const style = document.createElement('style');
style.textContent = `
  .__github-switcher-container {
    /* Container styles */
  }
  
  .__github-switcher-button {
    /* Button styles - use specific selectors */
  }
`;

document.head.appendChild(style);
container.appendChild(button);
document.body.appendChild(container);
```

**CSS Best Practices**:
- Prefix all class names with `__github-switcher`
- Use specific selectors to increase specificity
- Avoid `!important` unless absolutely necessary
- Reset styles explicitly on components to avoid inheritance

---

### 4. Client-Side Navigation Detection (GitHub SPA)

**Decision**: Listen to both `popstate` and custom GitHub navigation events (turbo:load or similar)

**Rationale**:
- GitHub uses Turbo (formerly Turbolinks) for SPA-style navigation
- `popstate` handles browser back/forward buttons
- Turbo emits custom events on page transitions without full reload
- Must re-evaluate URL pattern and show/hide button on each navigation

**Implementation Approach**:
```typescript
// Monitor GitHub's SPA navigation
function initNavigationListener() {
  // Initial check
  updateButtonVisibility();
  
  // Browser back/forward
  window.addEventListener('popstate', updateButtonVisibility);
  
  // GitHub Turbo navigation
  document.addEventListener('turbo:load', updateButtonVisibility);
  
  // Fallback: observe URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      updateButtonVisibility();
    }
  }).observe(document, { subtree: true, childList: true });
}
```

**Alternatives Considered**:
- MutationObserver only: Rejected because it's less efficient than event listeners
- setInterval polling: Rejected because it wastes CPU cycles
- Navigation API: Rejected because it's not yet supported in all target browsers

**References**:
- [Turbo Documentation](https://turbo.hotwired.dev/)
- [GitHub's frontend tech stack](https://github.blog/2018-09-06-removing-jquery-from-github-frontend/)

---

### 5. Dropdown Menu Positioning Algorithm

**Decision**: Calculate position dynamically using `getBoundingClientRect()` with bottom-right preference

**Rationale**:
- Button position is fixed, but dropdown needs to stay in viewport
- Bottom-right is default (common pattern for dropdowns)
- If insufficient space below (button.bottom + menuHeight > window.innerHeight), switch to top-right
- Ensures 100% visibility as per SC-004

**Implementation Approach**:
```typescript
function calculateMenuPosition(
  buttonRect: DOMRect,
  menuHeight: number
): { top: number; left: number; position: 'bottom-right' | 'top-right' } {
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - buttonRect.bottom;
  
  if (spaceBelow >= menuHeight) {
    // Bottom-right
    return {
      top: buttonRect.bottom,
      left: buttonRect.right,
      position: 'bottom-right'
    };
  } else {
    // Top-right
    return {
      top: buttonRect.top - menuHeight,
      left: buttonRect.right,
      position: 'top-right'
    };
  }
}
```

**Edge Cases**:
- Button near screen edge: Menu left position may need adjustment (not in spec, defer)
- Window resize: Re-calculate position on resize event
- Scroll: Button is fixed, so scroll doesn't affect menu position

**Alternatives Considered**:
- CSS-only positioning (position: absolute): Rejected because it can't dynamically choose top vs bottom
- Popper.js library: Rejected per project constraints (no third-party UI libraries)

---

### 6. Keyboard Navigation & Accessibility

**Decision**: Use native HTML semantic markup with ARIA attributes, rely on browser default Tab behavior

**Rationale**:
- Spec explicitly states "use default browser accessibility logic with tab key navigation"
- Semantic HTML (`<button>`, `<ul>`, `<li>`, `<a>`) provides built-in keyboard support
- ARIA attributes enhance screen reader experience without custom JavaScript
- No custom keyboard event handlers needed (keeps code simple)

**Implementation Approach**:
```html
<!-- Sidebar Button -->
<button
  class="gs-sidebar-button"
  aria-label="Open GitHub tools menu"
  aria-expanded="false"
  aria-controls="gs-tools-menu"
>
  Open with…
</button>

<!-- Dropdown Menu -->
<ul
  id="gs-tools-menu"
  role="menu"
  class="gs-dropdown-menu"
  hidden
>
  <li role="none">
    <a href="https://github.dev/owner/repo" role="menuitem" target="_blank">
      GitHub.dev
    </a>
  </li>
  <!-- ... more items -->
</ul>
```

**ARIA Attributes**:
- `role="button"` on trigger (implicit for `<button>`)
- `role="menu"` on dropdown container
- `role="menuitem"` on each link
- `aria-expanded` to indicate menu state
- `aria-controls` to link button with menu

**Alternatives Considered**:
- Custom keyboard handlers (arrow keys, Enter, Escape): Rejected because spec doesn't require it
- Focus trap in menu: Rejected because Tab navigation should allow escaping menu naturally

**References**:
- [WAI-ARIA Authoring Practices: Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/)
- [MDN: Using ARIA: Roles, states, and properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques)

---

### 7. Performance Optimization for Content Scripts

**Decision**: Lazy load components, minimize bundle size, use `requestIdleCallback` for non-critical work

**Rationale**:
- Performance budget: ≤150ms first render, ≤80KB gzipped, <50ms long tasks
- Plasmo handles code splitting automatically
- Content script should only inject button initially; dropdown HTML created on first click
- Icons/assets inlined as data URIs to reduce HTTP requests (N/A since no icons per spec)

**Implementation Approach**:
```typescript
// Lazy render dropdown on first button click
let dropdownRendered = false;

button.addEventListener('click', () => {
  if (!dropdownRendered) {
    renderDropdown(); // Creates DOM elements for menu
    dropdownRendered = true;
  }
  toggleMenu();
});

// Use requestIdleCallback for non-critical initialization
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Pre-calculate menu positioning for faster first open
    cacheMenuDimensions();
  });
}
```

**Bundle Size Strategies**:
- Tree-shake unused Plasmo features
- Minify CSS with cssnano
- Avoid large dependencies (already enforced: no UI libraries)

**Alternatives Considered**:
- Render dropdown immediately: Rejected because it wastes resources if user never clicks button
- Service worker for caching: Rejected because extension has no network requests to cache

**References**:
- [Chrome Extension Performance Best Practices](https://developer.chrome.com/docs/extensions/mv3/performance/)
- [Web Vitals for Extensions](https://web.dev/vitals/)

---

### 8. Tool URL Template Generation

**Decision**: Define tools as static configuration array with template strings, use simple string replacement

**Rationale**:
- Only 8 tools, all with simple `{owner}/{repo}` patterns
- No need for complex URL builder library
- Template string approach is readable and maintainable
- Type-safe with TypeScript interfaces

**Implementation Approach**:
```typescript
// src/lib/config.ts
export const TOOLS: ToolEntry[] = [
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
  // ... 6 more tools
];

// src/lib/urlGenerator.ts
export function generateToolUrl(
  tool: ToolEntry,
  context: RepositoryContext
): string {
  return tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));
}
```

**Security Considerations**:
- `encodeURIComponent` prevents XSS if owner/repo contains special characters
- All URLs use https:// protocol
- No user input accepted (owner/repo parsed from trusted github.com URL)

**Alternatives Considered**:
- URL template library (uri-templates): Rejected because overkill for 2 simple placeholders
- Template literals: Rejected because template strings are clearer and easier to test

---

### 9. User Preferences Storage

**Decision**: Use `chrome.storage.sync` with minimal schema (one boolean for "open in new tab")

**Rationale**:
- Spec mentions "开新标签/显示项开关" (open new tab / show item toggles)
- `storage.sync` keeps preferences across Chrome instances
- Minimal data (<1KB) fits within sync quota (100KB total, 8KB per item)
- No sensitive data stored

**Implementation Approach**:
```typescript
// Default preferences
const DEFAULT_PREFS = {
  openInNewTab: true, // FR-008 specifies new tab by default
  enabledTools: [1, 2, 3, 4, 5, 6, 7, 8] // All tools enabled by default
};

// Load preferences
async function loadPreferences(): Promise<UserPreferences> {
  const result = await chrome.storage.sync.get(DEFAULT_PREFS);
  return result as UserPreferences;
}

// Save preferences (for future settings UI)
async function savePreferences(prefs: UserPreferences): Promise<void> {
  await chrome.storage.sync.set(prefs);
}
```

**Storage Schema**:
```typescript
interface UserPreferences {
  openInNewTab: boolean;
  enabledTools: number[]; // Tool order numbers (1-8)
}
```

**Alternatives Considered**:
- `chrome.storage.local`: Rejected because sync is better UX for multi-device users
- localStorage: Rejected because not available in content scripts, requires messaging

---

### 10. Testing Strategy

**Decision**: Vitest for unit tests (≥80% coverage), manual E2E testing in Chrome/Edge

**Rationale**:
- Vitest is already configured in project
- Unit tests cover: URL parsing, tool URL generation, positioning logic
- Manual testing necessary for browser-specific behavior (content script injection, DOM manipulation)
- No E2E framework (Playwright/Puppeteer) needed for this small feature scope

**Test Coverage Targets**:
- `detectGithub.ts`: 100% (critical path, already has tests)
- `urlGenerator.ts`: 100% (critical path, simple to test)
- `positioning.ts`: ≥80% (edge cases for viewport positioning)
- UI components: Manual testing only (no UI testing library per constraints)

**Test Cases**:
```typescript
// URL Parser Tests
describe('parseGitHubUrl', () => {
  it('parses valid repo URLs', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo')).toEqual({
      owner: 'owner',
      repo: 'repo',
      currentUrl: 'https://github.com/owner/repo'
    });
  });
  
  it('handles sub-paths', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo/blob/main/file.ts'))
      .toEqual({ owner: 'owner', repo: 'repo', currentUrl: '...' });
  });
  
  it('returns null for non-repo URLs', () => {
    expect(parseGitHubUrl('https://github.com/explore')).toBeNull();
  });
});

// Tool URL Generator Tests
describe('generateToolUrl', () => {
  it('replaces placeholders correctly', () => {
    const tool = { urlTemplate: 'https://example.com/{owner}/{repo}' };
    const context = { owner: 'test', repo: 'project' };
    expect(generateToolUrl(tool, context)).toBe('https://example.com/test/project');
  });
  
  it('encodes special characters', () => {
    const context = { owner: 'user/org', repo: 'repo name' };
    expect(generateToolUrl(tool, context)).toContain('user%2Forg');
  });
});
```

**Alternatives Considered**:
- Playwright E2E: Rejected because too heavyweight for this feature scope
- Jest: Rejected because Vitest is already configured and faster

---

## Summary of Decisions

| Area | Decision | Status |
|------|----------|--------|
| Framework | Plasmo with declarative content scripts | ✅ Confirmed |
| URL Parsing | Regex with capture groups | ✅ Confirmed |
| CSS Isolation | Class prefix `gs-` + Plasmo scoping | ✅ Confirmed |
| Navigation | popstate + Turbo events + MutationObserver | ✅ Confirmed |
| Positioning | Dynamic calculation (bottom-right preferred) | ✅ Confirmed |
| Accessibility | Native HTML semantics + ARIA | ✅ Confirmed |
| Performance | Lazy rendering, <80KB bundle, <150ms render | ✅ Confirmed |
| URL Generation | Template strings with simple replacement | ✅ Confirmed |
| Storage | chrome.storage.sync with minimal schema | ✅ Confirmed |
| Testing | Vitest (unit) + manual (integration) | ✅ Confirmed |

All NEEDS CLARIFICATION items from Technical Context have been resolved. Ready for Phase 1 (Design & Contracts).
