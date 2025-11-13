# API Contracts: GitHub Switcher Sidebar

**Feature**: 002-github-switcher-sidebar  
**Date**: 2025-11-12  
**Phase**: 1 (Design & Contracts)

## Overview

This extension has **no external API contracts** as it operates entirely client-side within the browser. This document defines the internal module contracts (function signatures and behavior) that serve as the "API" between components.

---

## Internal Module Contracts

### 1. URL Parser Contract

**Module**: `src/lib/detectGithub.ts`

#### Function: `parseGitHubUrl`

**Signature**:
```typescript
function parseGitHubUrl(url: string): RepositoryContext | null
```

**Purpose**: Extract owner and repository name from a GitHub URL

**Input Contract**:
- `url`: Any string (expected to be a valid URL, but handles invalid input gracefully)

**Output Contract**:
- Returns `RepositoryContext` object if URL matches pattern `^https?://(www\.)?github\.com/[^/]+/[^/]+(/.*)?$`
- Returns `null` if URL does not match pattern
- Never throws exceptions

**Behavior Contract**:
- MUST handle URLs with or without `www.` prefix
- MUST handle URLs with or without trailing paths (e.g., `/blob/main/file.ts`)
- MUST extract exactly 2 path segments as owner and repo
- MUST ignore query parameters and hash fragments
- MUST return null for:
  - Non-GitHub URLs (e.g., `https://example.com`)
  - GitHub URLs without repository (e.g., `https://github.com/owner`)
  - GitHub non-repository pages (e.g., `https://github.com/explore`)

**Examples**:
```typescript
// Valid repository URLs
parseGitHubUrl('https://github.com/microsoft/vscode')
// → { owner: 'microsoft', repo: 'vscode', currentUrl: '...' }

parseGitHubUrl('https://github.com/owner/repo/blob/main/src/index.ts')
// → { owner: 'owner', repo: 'repo', currentUrl: '...' }

parseGitHubUrl('https://www.github.com/user/project')
// → { owner: 'user', repo: 'project', currentUrl: '...' }

// Invalid URLs
parseGitHubUrl('https://github.com/owner')
// → null

parseGitHubUrl('https://github.com/explore')
// → null

parseGitHubUrl('https://example.com')
// → null
```

**Test Coverage**: 100% (critical path)

---

### 2. Tool URL Generator Contract

**Module**: `src/lib/urlGenerator.ts`

#### Function: `generateToolUrl`

**Signature**:
```typescript
function generateToolUrl(tool: ToolEntry, context: RepositoryContext): string
```

**Purpose**: Generate a fully-qualified URL for a tool using repository context

**Input Contract**:
- `tool`: Valid `ToolEntry` object with `urlTemplate` containing `{owner}` and `{repo}` placeholders
- `context`: Valid `RepositoryContext` object with non-empty `owner` and `repo` fields

**Output Contract**:
- Returns a string with a valid HTTPS URL
- MUST replace `{owner}` with `encodeURIComponent(context.owner)`
- MUST replace `{repo}` with `encodeURIComponent(context.repo)`
- Never throws exceptions (assumes valid input per contract)

**Behavior Contract**:
- MUST URL-encode owner and repo to prevent injection attacks
- MUST preserve the protocol scheme from `urlTemplate` (all templates use `https://`)
- MUST handle special characters in owner/repo names safely

**Examples**:
```typescript
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

generateToolUrl(tool, context)
// → 'https://deepwiki.com/microsoft/vscode'

// With special characters
const specialContext: RepositoryContext = {
  owner: 'my-org',
  repo: 'my.project',
  currentUrl: 'https://github.com/my-org/my.project'
};

generateToolUrl(tool, specialContext)
// → 'https://deepwiki.com/my-org/my.project'
```

**Security**: MUST prevent XSS by encoding owner/repo values

**Test Coverage**: 100% (critical path)

---

### 3. Menu Positioning Contract

**Module**: `src/utils/positioning.ts`

#### Function: `calculateMenuPosition`

**Signature**:
```typescript
function calculateMenuPosition(
  buttonRect: DOMRect,
  menuHeight: number
): MenuPosition
```

**Purpose**: Calculate optimal dropdown menu position based on button location and available viewport space

**Input Contract**:
- `buttonRect`: DOMRect from `button.getBoundingClientRect()`
- `menuHeight`: Number representing menu height in pixels (must be > 0)

**Output Contract**:
- Returns `MenuPosition` object with `top`, `left`, and `position` fields
- `top` and `left` are absolute pixel values
- `position` is either `'bottom-right'` or `'top-right'`

**Behavior Contract**:
- MUST prefer `'bottom-right'` positioning (menu appears below button)
- MUST use `'top-right'` positioning if insufficient space below button
- Insufficient space defined as: `window.innerHeight - buttonRect.bottom < menuHeight`
- `left` value MUST be `buttonRect.right` (menu appears to the right of button)
- `top` value for bottom-right: `buttonRect.bottom`
- `top` value for top-right: `buttonRect.top - menuHeight`

**Examples**:
```typescript
// Button near top of viewport (plenty of space below)
const buttonRect = new DOMRect(0, 100, 40, 200); // x, y, width, height
const menuHeight = 300;

calculateMenuPosition(buttonRect, menuHeight)
// → { top: 300, left: 40, position: 'bottom-right' }

// Button near bottom of viewport (insufficient space below)
// Assume window.innerHeight = 800
const bottomButtonRect = new DOMRect(0, 600, 40, 200);

calculateMenuPosition(bottomButtonRect, menuHeight)
// → { top: 300, left: 40, position: 'top-right' }
// (600 - 300 = 300)
```

**Test Coverage**: ≥80%

---

### 4. Preferences Storage Contract

**Module**: `src/lib/storage.ts` (to be created)

#### Function: `loadPreferences`

**Signature**:
```typescript
async function loadPreferences(): Promise<UserPreferences>
```

**Purpose**: Load user preferences from chrome.storage.sync

**Input Contract**: None

**Output Contract**:
- Returns Promise resolving to `UserPreferences` object
- MUST return default preferences if no stored data exists
- Never rejects (returns defaults on error)

**Behavior Contract**:
- MUST use `chrome.storage.sync.get()` API
- MUST merge stored data with defaults (handle partial data)
- MUST validate stored data (ensure enabledTools contains only valid tool orders 1-8)

**Default Values**:
```typescript
{
  openInNewTab: true,
  enabledTools: [1, 2, 3, 4, 5, 6, 7, 8]
}
```

**Examples**:
```typescript
// No stored data
await loadPreferences()
// → { openInNewTab: true, enabledTools: [1,2,3,4,5,6,7,8] }

// Stored data exists
await loadPreferences()
// → { openInNewTab: false, enabledTools: [1,3,5,7] }
```

---

#### Function: `savePreferences`

**Signature**:
```typescript
async function savePreferences(prefs: UserPreferences): Promise<void>
```

**Purpose**: Save user preferences to chrome.storage.sync

**Input Contract**:
- `prefs`: Valid `UserPreferences` object

**Output Contract**:
- Returns Promise resolving to `void` on success
- May reject with error if storage quota exceeded (unlikely given small data size)

**Behavior Contract**:
- MUST use `chrome.storage.sync.set()` API
- MUST validate input before saving
- MUST handle storage errors gracefully (log but don't crash)

**Examples**:
```typescript
await savePreferences({
  openInNewTab: false,
  enabledTools: [1, 2, 3]
})
// → void (preferences saved)
```

---

## Chrome Extension API Contracts

While not external APIs, the extension relies on Chrome Extension APIs with specific contracts:

### chrome.storage.sync

**Usage**: Store user preferences

**Contract**:
- Max size per item: 8KB (we use ~80 bytes)
- Total quota: 100KB (we use <1KB)
- Max items: 512 (we use 1 item)
- Automatic sync across devices

**Permissions Required**: Declared in manifest.json

---

### chrome.tabs

**Usage**: Open tool URLs in new tabs

**Contract**:
```typescript
chrome.tabs.create({
  url: string,
  active?: boolean
})
```

**Behavior**: Opens URL in new tab, optionally brings tab to front

**Permissions Required**: `activeTab` permission

---

### Content Script Host Permissions

**Usage**: Inject content script into GitHub pages

**Contract**:
```json
{
  "host_permissions": ["https://github.com/*"]
}
```

**Scope**: Allows content script to run on all github.com pages

---

## Event Contracts

### Navigation Events

The extension listens to browser navigation events to detect URL changes:

#### Event: `popstate`

**Contract**:
- Fired when user clicks browser back/forward buttons
- Payload: `PopStateEvent` (not used, we just re-check current URL)
- Handler MUST call `parseGitHubUrl(location.href)` to update context

#### Event: `turbo:load`

**Contract**:
- Fired by GitHub's Turbo framework on SPA navigation
- Payload: None
- Handler MUST call `parseGitHubUrl(location.href)` to update context

---

## Component Contracts

### SidebarButton Component

**Purpose**: Render the fixed-position sidebar button

**Props**: None (reads from global context)

**Behavior Contract**:
- MUST render only when current URL matches repository pattern
- MUST have ARIA attributes: `aria-label`, `aria-expanded`, `aria-controls`
- MUST toggle menu visibility on click
- MUST apply class prefix `gs-sidebar-button`

---

### ToolDropdown Component

**Purpose**: Render the dropdown menu with tool links

**Props**:
```typescript
interface ToolDropdownProps {
  tools: GeneratedToolLink[];
  isOpen: boolean;
  position: MenuPosition;
  onClose: () => void;
}
```

**Behavior Contract**:
- MUST render only enabled tools (filter by `tool.enabled`)
- MUST render tools in order (sort by `tool.order`)
- MUST apply ARIA attributes: `role="menu"`, `role="menuitem"`
- MUST close menu on link click
- MUST close menu when clicking outside (via `onClose` callback)
- MUST apply class prefix `gs-dropdown-menu`
- MUST position using `position.top` and `position.left`

---

## Summary

All internal contracts are:
- ✅ Strongly typed with TypeScript
- ✅ Documented with clear input/output specifications
- ✅ Testable (unit tests can verify contract compliance)
- ✅ Side-effect free where possible (pure functions)
- ✅ Error-safe (return null/defaults instead of throwing)

No external REST/GraphQL APIs. All functionality is client-side using:
- URL parsing (built-in URL API + regex)
- DOM manipulation (native browser APIs)
- Chrome Extension APIs (storage, tabs, content scripts)

Ready for quickstart guide and implementation.
