# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (v0.4.0 - Tool Management & Customization)
- **Tool Management Settings Page**: New options page for customizing tool visibility and order
  - **Enable/Disable Individual Tools**: Toggle any of the 9 tools on/off via checkbox switches
    - At least 1 tool must remain enabled (safety constraint - FR-011)
    - Changes sync instantly across all open GitHub tabs
    - Real-time updates to the sidebar menu without page refresh
  - **Drag-and-Drop Reordering**: Rearrange tools in the sidebar menu via drag handles
    - Powered by SortableJS library (8KB gzipped)
    - Visual feedback with smooth animations (150ms, opacity 0.4 ghost effect)
    - New order persists in `chrome.storage.sync` and syncs across devices
  - **Reset to Defaults Button**: One-click restoration of original settings
    - Confirmation dialog (bilingual: Chinese + English) prevents accidental resets
    - Restores all 9 tools to enabled state with default order [1-9]
  - **Data Validation & Error Recovery**: Automatic detection and repair of corrupted settings
    - Warning banner displays when invalid data detected
    - Auto-recovery to default configuration if `toolOrder` or `enabledTools` invalid
    - User can dismiss warning banner after reading
- **Settings Access Points**:
  - Right-click extension icon → "Options" context menu
  - `chrome://extensions/` → "GitHub-Switcher" → "Options" button
- **Real-Time Synchronization** (via `chrome.storage.sync`):
  - Preferences sync across all Chrome instances signed in to same Google account
  - Changes propagate within 5-10 seconds (Chrome's built-in sync delay)
  - Works across Windows, macOS, Linux, and ChromeOS
  - Sidebar menu updates automatically when settings changed in options page
- **Storage Optimization**: Efficient data model
  - Total storage size: ~100 bytes (enabledTools: ~40B, toolOrder: ~40B, openInNewTab: ~5B)
  - Far below chrome.storage.sync 5KB limit (NFR-004 compliance)
- **Accessibility Enhancements**:
  - ARIA labels for drag handles ("拖拽以调整顺序")
  - ARIA labels for toggle switches ("启用/禁用 {toolName}")
  - ARIA label for reset button ("重置为默认配置 / Reset to defaults")
  - Full keyboard navigation support (Tab, Enter, Space keys)
  - Screen reader announcements for state changes
- **Tool Descriptions**: 40-60 character English descriptions for each tool
  - Displayed in settings page below tool name
  - Helps users understand tool purpose before enabling/disabling
- **Manual Testing Documentation**:
  - PHASE2_MANUAL_TEST.md: 12 test cases for enable/disable, reset, data validation
  - PHASE3_MANUAL_TEST.md: 10 test cases for drag-drop, ordering, performance

### Added (Smart Tool Enabling - Context-Aware Menu)
- **Smart Tool Enabling (Context-Aware Menu)**: Tools automatically enable/disable based on page type
  - File-aware tools (githistory, nbviewer) only enabled on file pages (`blob/` URLs)
  - Extension-specific filtering: nbviewer only enabled for `.ipynb` files
  - Visual feedback: disabled tools shown with 50% opacity and cursor:not-allowed
  - Click interception: disabled tools cannot be accidentally activated
  - Preserves URL query parameters and hashes in generated tool links
- **File URL Parsing**: New `parseGitHubFileUrl()` function extracts file context
  - Parses owner, repo, ref (branch/tag), file path, extension from GitHub blob URLs
  - Supports special characters (spaces, Chinese characters, etc.) with proper encoding
  - Returns `null` for non-file pages (repository home, directories, PRs, issues)
- **Tool State Management**: New `toolStateManager` module for conditional tool availability
  - LRU cache (max 100 entries) to optimize repeated state computations
  - Declarative `enableCondition` configuration per tool
  - `computeToolState()` and `computeAllToolStates()` functions for state calculation
- **Enhanced URL Generation**: Extended `generateToolUrl()` to support file-specific placeholders
  - New placeholders: `{ref}` (branch/tag), `{filepath}` (file path)
  - Backward compatible with existing repository-only tools
  - Query and hash preservation for file URLs
- **CodeWiki Integration**: New third-party tool for AI-enhanced code and documentation browsing
  - Accessible at `https://codewiki.google/{owner}/{repo}`
  - Positioned below DeepWiki in the tool menu (3rd position)
  - Includes dedicated unit tests for URL generation and special character handling

### Changed (v0.4.0)
- **UI Components**:
  - ToolDropdown now accepts `toolOrder` parameter in `show()` and `updateTools()` methods
  - New `sortToolsByOrder()` helper function sorts tools based on user preferences
  - Menu items render in custom order specified by user
- **Data Model**:
  - `UserPreferences` extended with `toolOrder?: number[]` field (stores custom order)
  - Default `toolOrder` is `undefined` (falls back to [1,2,3,4,5,6,7,8,9])
- **Storage Functions** (optionsStateManager):
  - `saveToolOrder(toolOrder)`: Validates and saves custom order (must contain all 9 unique IDs 1-9)
  - `toggleToolEnabled(toolId, enabled)`: Prevents disabling last tool (throws error if attempted)
  - `resetToDefault()`: Resets `enabledTools` to [1-9], `toolOrder` to undefined
  - `validateToolConfiguration(config)`: Auto-repairs invalid `toolOrder` or `enabledTools`
  - `getToolOrder(preferences)`: Returns custom order or default [1-9]
- **Content Script Updates**:
  - `openMenu()` now passes `preferences.toolOrder` to `toolDropdown.show()`
  - `handleStorageChange()` detects `toolOrder` changes and updates menu in real-time
- **Test Coverage Improvements**:
  - Unit tests: 127 tests passing (up from 89)
  - Coverage: 97.01% statements, 92.7% branches, 100% functions
  - New tests for `saveToolOrder()`, `toggleToolEnabled()`, `resetToDefault()`, `validateToolConfiguration()`

### Changed (Smart Tool Enabling)
- Tool configurations updated with `enableCondition` field:
  - **githistory**: `requiresFilePath: true, fileExtensions: []` (all files)
  - **nbviewer**: `requiresFilePath: true, fileExtensions: ['ipynb']` (notebook files only)
- URL templates updated for file-aware tools:
  - **githistory**: Now includes `/blob/{ref}/{filepath}` for file-specific history
  - **nbviewer**: Now includes `/blob/{ref}/{filepath}` for direct notebook rendering
- UI updated to render enabled/disabled states with opacity and ARIA attributes
- Content script now uses file context detection for intelligent tool state computation
- Tool count increased from 8 to 9
- Updated tool order: CodeSandbox through githistory now numbered 4-9 (previously 3-8)
- Default enabled tools list now includes all 9 tools `[1, 2, 3, 4, 5, 6, 7, 8, 9]`

### Fixed
- **Tool State Manager**: Now correctly handles `RepositoryContext` in addition to `FileContext`
  - Fixed issue where tools without `enableCondition` were disabled on repository homepage
  - Tools like GitHub.dev, DeepWiki, CodeWiki now work correctly on repository pages
  - Added 5 new test cases to prevent regression (89 total tests → 127 total)
- **Context Detection**: Content script now passes `RepositoryContext` on repo pages instead of `null`
  - Enables proper URL generation for repository-level tools
  - File-aware tools (githistory, nbviewer) correctly disabled on non-file pages

### Security & Performance (v0.4.0)
- **No New Permissions Required**: Uses existing `storage` permission for sync
- **No Network Requests**: All logic runs locally in browser
- **Minimal Bundle Size Impact**:
  - SortableJS: +8KB gzipped
  - Options page: ~15KB uncompressed (first-time load only)
  - Content script: Still 4.4KB gzipped (no change)
- **Fast Settings Persistence**: chrome.storage.sync write delay <500ms (P95)
- **E2E Testing**: Automated tests replaced with comprehensive manual testing checklists
  - Chrome Extension E2E setup complexity avoided
  - Manual tests ensure functionality across platforms (Windows, macOS, Linux)

## [1.0.0] - 2025-11-13

### Added
- **Sidebar Tool Menu**: Fixed-position sidebar button on GitHub repository pages
  - Quick access to 9 third-party developer tools (GitHub.dev, DeepWiki, CodeWiki, CodeSandbox, StackBlitz, nbviewer, gitdiagram, gitingest, githistory)
  - Smart menu positioning that adapts to viewport constraints (bottom-right preferred, top-right fallback)
  - Automatic window resize handling for repositioning open menus
- **Repository Context Support**: Works on all repository pages including sub-paths (files, PRs, issues, folders)
  - Automatically extracts owner/repo from any GitHub URL
  - Always uses repository root URL when opening tools
- **User Interaction**: Intuitive menu dismissal
  - Click outside menu to close
  - Re-click sidebar button to toggle
  - Automatic cleanup on page navigation
- **GitHub SPA Navigation**: Seamless integration with GitHub's single-page app architecture
  - Handles Turbo/PJAX navigation events
  - Updates button visibility when navigating between repository and non-repository pages
  - Supports browser back/forward navigation
- **Accessibility**: Full keyboard and screen reader support
  - ARIA attributes (aria-label, aria-expanded, aria-controls, aria-haspopup)
  - Menu role semantics (role="menu", role="menuitem")
  - Keyboard navigation with Tab key
  - Focus management for screen readers
- **Performance**: Optimized bundle size
  - Content script: 14KB uncompressed, 4.4KB gzipped
  - Native DOM implementation (no React/framework overhead)
  - Fast initialization (<100ms button injection)
  - Smooth dropdown rendering (<500ms)
- **Code Quality**: 100% test coverage for core utilities
  - URL generator tests (8/8 passing)
  - Positioning logic tests (8/8 passing)
  - GitHub URL parser tests (15/15 passing)
  - Logger utility tests (8/8 passing)
  - Total: 39 unit tests passing

### Technical Details
- TypeScript 5.x with strict mode enforcement
- Plasmo 0.90.5 (Manifest V3 framework)
- Native DOM manipulation (no React/Vue/frameworks)
- CSS isolation using `__github-switcher` class prefix
- chrome.storage.sync for user preferences
- Biome linter and Prettier formatter integration
- Vitest testing framework with v8 coverage

## [0.1.0] - 2025-11-11

### Added
- Project initialization with browser extension skeleton
- Chrome Manifest V3 support
- TypeScript with strict type checking
- Development workflow with hot reload
- Linting and formatting tools
- Test infrastructure setup
