# Data Model: GitHub Switcher Sidebar

**Feature**: 002-github-switcher-sidebar  
**Date**: 2025-11-12  
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data structures and their relationships for the GitHub Switcher Sidebar extension. All entities are TypeScript interfaces with strict typing enabled.

---

## Core Entities

### 1. RepositoryContext

Represents the parsed GitHub repository information from the current page URL.

```typescript
/**
 * Repository context extracted from GitHub URL
 * @example { owner: 'microsoft', repo: 'vscode', currentUrl: 'https://github.com/microsoft/vscode/blob/main/README.md' }
 */
interface RepositoryContext {
  /** GitHub username or organization name */
  owner: string;
  
  /** Repository name */
  repo: string;
  
  /** Full URL of the current GitHub page */
  currentUrl: string;
}
```

**Validation Rules**:
- `owner`: Non-empty string, no slashes, max length 39 chars (GitHub username limit)
- `repo`: Non-empty string, no slashes, max length 100 chars (GitHub repo name limit)
- `currentUrl`: Valid HTTPS URL matching `^https?://(www\.)?github\.com/[^/]+/[^/]+(/.*)?$`

**Relationships**:
- Input for `generateToolUrl()` function
- Returned by `parseGitHubUrl()` function

**State Transitions**:
- Created: When user navigates to a valid GitHub repository page
- Updated: On GitHub SPA navigation (popstate, turbo:load events)
- Destroyed: When user navigates away from GitHub or to a non-repository page

---

### 2. ToolEntry

Represents a single third-party tool configuration.

```typescript
/**
 * Configuration for a third-party tool
 */
interface ToolEntry {
  /** Display name in the dropdown menu (English) */
  name: string;
  
  /** URL template with {owner} and {repo} placeholders */
  urlTemplate: string;
  
  /** Display order in dropdown (1-8) */
  order: number;
  
  /** Optional usage note (e.g., "optimal for .ipynb files") */
  note?: string;
}
```

**Validation Rules**:
- `name`: Non-empty string, max 50 chars
- `urlTemplate`: Must contain exactly one `{owner}` and one `{repo}` placeholder
- `order`: Integer 1-8 (inclusive), unique across all tools
- `note`: Optional string, max 100 chars

**Constant Configuration** (from FR-005, FR-007):
```typescript
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

**Relationships**:
- Used by `generateToolUrl()` to create final URLs
- Rendered in `ToolDropdown` component in order

**Immutability**:
- Static configuration (no runtime modifications)
- `as const` assertion ensures compile-time immutability

---

### 3. MenuState

Represents the current UI state of the dropdown menu.

```typescript
/**
 * UI state for the dropdown menu
 */
interface MenuState {
  /** Whether the menu is currently visible */
  isOpen: boolean;
  
  /** Menu positioning strategy */
  position: 'bottom-right' | 'top-right';
  
  /** Current keyboard navigation index (-1 = no focus) */
  focusedItemIndex: number;
}
```

**Validation Rules**:
- `isOpen`: Boolean (default: `false`)
- `position`: Enum `'bottom-right' | 'top-right'` (default: `'bottom-right'`)
- `focusedItemIndex`: Integer -1 to 7 (inclusive), where -1 means no item focused

**State Transitions**:
```
Initial State: { isOpen: false, position: 'bottom-right', focusedItemIndex: -1 }

User clicks sidebar button:
  isOpen: false → true
  position: Calculate based on viewport space
  focusedItemIndex: -1 (menu opens but no item focused initially)

User clicks outside menu:
  isOpen: true → false
  focusedItemIndex: -1 (reset on close)

User selects a tool:
  isOpen: true → false
  focusedItemIndex: -1 (reset on close)
  [Side effect: Open tool URL in new tab]

User presses Tab (keyboard navigation):
  focusedItemIndex: -1 → 0 → 1 → ... → 7 → (cycles or exits based on browser default)

Window resize while menu open:
  position: May recalculate if space constraints change
```

**Relationships**:
- Controlled by `SidebarButton` component
- Consumed by `ToolDropdown` component for rendering

---

### 4. UserPreferences

Represents user-configurable settings stored in chrome.storage.sync.

```typescript
/**
 * User preferences stored in chrome.storage.sync
 */
interface UserPreferences {
  /** Whether to open tool links in new tab (default: true per FR-008) */
  openInNewTab: boolean;
  
  /** List of enabled tool order numbers (default: all enabled) */
  enabledTools: number[];
}
```

**Validation Rules**:
- `openInNewTab`: Boolean (default: `true`)
- `enabledTools`: Array of integers 1-8, may be empty (hides all tools)

**Default Values**:
```typescript
const DEFAULT_PREFERENCES: UserPreferences = {
  openInNewTab: true,
  enabledTools: [1, 2, 3, 4, 5, 6, 7, 8]
};
```

**Storage**:
- Stored in `chrome.storage.sync` under key `preferences`
- Max size: <1KB (well within 8KB per-item quota)
- Synced across user's Chrome instances

**State Lifecycle**:
- Loaded on extension initialization
- Updated when user changes settings (future settings UI)
- Persisted automatically by Chrome storage API

**Relationships**:
- Read by `ToolDropdown` to filter visible tools
- Read by click handler to determine `target="_blank"` behavior

---

## Helper Types

### MenuPosition

```typescript
/**
 * Calculated menu position with coordinates
 */
interface MenuPosition {
  /** Absolute top position in pixels */
  top: number;
  
  /** Absolute left position in pixels */
  left: number;
  
  /** Positioning strategy used */
  position: 'bottom-right' | 'top-right';
}
```

**Usage**: Returned by `calculateMenuPosition()` utility function

---

### GeneratedToolLink

```typescript
/**
 * Tool with generated URL for current repository
 */
interface GeneratedToolLink {
  /** Tool configuration */
  tool: ToolEntry;
  
  /** Generated absolute URL */
  url: string;
  
  /** Whether this tool is enabled in user preferences */
  enabled: boolean;
}
```

**Usage**: Rendered list in `ToolDropdown` component

**Derivation**:
```typescript
function generateToolLinks(
  context: RepositoryContext,
  preferences: UserPreferences
): GeneratedToolLink[] {
  return TOOLS.map(tool => ({
    tool,
    url: generateToolUrl(tool, context),
    enabled: preferences.enabledTools.includes(tool.order)
  }));
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User navigates to GitHub repository page                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ parseGitHubUrl(url)    │
        │ Returns:               │
        │ RepositoryContext      │
        └────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Content script injected    │
    │ - Render SidebarButton     │
    │ - Initialize MenuState     │
    └────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ User clicks sidebar button         │
└────────┬───────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ calculateMenuPosition(buttonRect)       │
│ Returns: MenuPosition                   │
│ Updates: MenuState.position             │
└─────────┬───────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│ Load UserPreferences from storage            │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────┐
│ generateToolLinks(context, preferences)       │
│ For each TOOL:                                │
│   - generateToolUrl(tool, context)            │
│   - Check if enabled in preferences           │
│ Returns: GeneratedToolLink[]                  │
└───────────┬───────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────┐
│ Render ToolDropdown component              │
│ - Display enabled tools in order           │
│ - Apply MenuPosition                       │
│ - Set MenuState.isOpen = true              │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ User clicks a tool link            │
└────────┬───────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Open URL in new tab (if openInNewTab)   │
│ Close menu: MenuState.isOpen = false    │
└─────────────────────────────────────────┘
```

---

## Type Guards & Validation

### isValidRepositoryContext

```typescript
/**
 * Type guard to validate RepositoryContext
 */
function isValidRepositoryContext(ctx: unknown): ctx is RepositoryContext {
  if (typeof ctx !== 'object' || ctx === null) return false;
  
  const obj = ctx as RepositoryContext;
  
  return (
    typeof obj.owner === 'string' &&
    obj.owner.length > 0 &&
    obj.owner.length <= 39 &&
    !obj.owner.includes('/') &&
    
    typeof obj.repo === 'string' &&
    obj.repo.length > 0 &&
    obj.repo.length <= 100 &&
    !obj.repo.includes('/') &&
    
    typeof obj.currentUrl === 'string' &&
    /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+(\/.*)?$/.test(obj.currentUrl)
  );
}
```

---

## Entity Relationships Summary

```
┌──────────────────────┐
│  RepositoryContext   │─────────┐
│  - owner             │         │
│  - repo              │         │
│  - currentUrl        │         │
└──────────────────────┘         │
                                 │
                                 │ Input to
                                 │
                                 ▼
                       ┌──────────────────────┐
                       │  generateToolUrl()   │
                       └──────────┬───────────┘
                                  │
                                  │ Uses
                                  │
                                  ▼
┌──────────────────────┐    ┌─────────────────────┐
│     ToolEntry        │◄───│  TOOLS (constant)   │
│  - name              │    │  Array of 9 tools   │
│  - urlTemplate       │    └─────────────────────┘
│  - order             │
│  - note?             │
└──────────────────────┘
         │
         │ Rendered in
         │
         ▼
┌──────────────────────┐
│   ToolDropdown       │
│   (UI Component)     │
└──────────┬───────────┘
           │
           │ Controlled by
           │
           ▼
┌──────────────────────┐
│     MenuState        │
│  - isOpen            │
│  - position          │
│  - focusedItemIndex  │
└──────────────────────┘

┌──────────────────────┐
│  UserPreferences     │
│  - openInNewTab      │
│  - enabledTools      │
└──────────────────────┘
         │
         │ Filters
         │
         └──────────────────────────────┐
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ Tool visibility  │
                              │ Link target      │
                              └──────────────────┘
```

---

## Storage Schema

### chrome.storage.sync

```typescript
{
  "preferences": {
    "openInNewTab": true,
    "enabledTools": [1, 2, 3, 4, 5, 6, 7, 8]
  }
}
```

**Size**: ~80 bytes (well within 8KB limit)

**Sync Behavior**: Automatically synced across user's Chrome instances

---

## Summary

All data entities are:
- ✅ Strongly typed with TypeScript interfaces
- ✅ Validated with explicit rules
- ✅ Immutable where appropriate (`TOOLS` constant)
- ✅ Minimal in scope (no unnecessary fields)
- ✅ Well-documented with JSDoc comments
- ✅ Aligned with functional requirements (FR-001 through FR-022)

No database or complex state management needed. All entities are either:
1. Static configuration (`TOOLS`)
2. Derived from URL parsing (`RepositoryContext`)
3. Ephemeral UI state (`MenuState`)
4. Simple user preferences (`UserPreferences`)

Ready for contract definition and quickstart guide generation.
