# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-11-13

### Added
- **Sidebar Tool Menu**: Fixed-position sidebar button on GitHub repository pages
  - Quick access to 8 third-party developer tools (GitHub.dev, DeepWiki, CodeSandbox, StackBlitz, nbviewer, gitdiagram, gitingest, githistory)
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
