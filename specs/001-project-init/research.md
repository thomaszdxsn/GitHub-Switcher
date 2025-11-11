# Research: Browser Extension Project Initialization

**Feature**: 001-project-init  
**Date**: 2025-11-11  
**Status**: Complete

## Overview

This document contains research findings for setting up a TypeScript-based browser extension using Plasmo framework, with Biome for linting and Prettier for formatting.

## Research Tasks

### 1. Plasmo Framework Structure and Best Practices

**Decision**: Use Plasmo framework as the build tool and development environment

**Rationale**:
- Plasmo is specifically designed for browser extension development with first-class TypeScript support
- Built-in hot reload for development mode (addresses FR-006)
- Automatic Manifest V3 generation from code structure
- Handles bundling, TypeScript compilation, and browser-specific polyfills
- Supports content scripts with minimal configuration
- Active community and well-documented

**Alternatives Considered**:
- **Manual webpack/vite setup**: More configuration overhead, no extension-specific optimizations
- **WXT framework**: Similar to Plasmo but less mature ecosystem
- **Bare TypeScript compilation**: Requires manual manifest management, no hot reload

**Implementation Notes**:
- Plasmo uses `src/contents/` directory for content scripts (not `src/content/`)
- Content scripts are auto-detected by file location
- Hot reload works via WebSocket connection between extension and dev server
- Build output goes to `build/chrome-mv3-dev/` or `build/chrome-mv3-prod/`

### 2. Biome vs ESLint for Linting

**Decision**: Use Biome for linting and formatting (replacing ESLint + Prettier combination)

**Rationale**:
- Biome is a fast, all-in-one tool (linter + formatter) written in Rust
- Significantly faster than ESLint (10-100x in benchmarks)
- Built-in TypeScript support without plugins
- Single configuration file (`biome.json`)
- Compatible with Prettier rules but faster
- Native pre-commit hook support
- Growing adoption in modern TypeScript projects

**Alternatives Considered**:
- **ESLint + Prettier**: Traditional approach, more plugins available, but slower and requires two tools
- **Prettier alone**: Only formatting, no linting
- **ESLint alone**: Formatting less sophisticated than Prettier/Biome

**Implementation Notes**:
- Use `biome check` for both linting and formatting in CI
- Use `biome format --write` for auto-fixing
- Configure strict rules aligned with TypeScript strict mode
- Pre-commit hook: `biome check --apply`

**UPDATE**: Based on user requirements, we'll use **Biome for linting** and **Prettier for formatting** separately:
- Biome handles code quality checks
- Prettier handles code formatting
- Both run in pre-commit hooks via Husky
- Rationale: Prettier is more mature for formatting consistency across team/tools

### 3. TypeScript Path Aliases Configuration

**Decision**: Use `@/*` path alias mapping to `src/*`

**Rationale**:
- Cleaner imports: `import { detect } from '@/lib/detectGithub'` vs `import { detect } from '../../lib/detectGithub'`
- Easier refactoring (paths don't break when moving files)
- Industry standard convention
- Supported by both TypeScript and build tools (Plasmo, Vite, webpack)

**Implementation Notes**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 4. Hot Reload Implementation for Content Scripts

**Decision**: Leverage Plasmo's built-in hot reload with fallback to manual refresh instructions

**Rationale**:
- Plasmo's hot reload works automatically in dev mode
- Uses WebSocket to detect file changes
- Automatically reloads extension without browser restart
- Limitations: Some changes (manifest, permissions) require manual reload
- For initial iteration, documented manual reload as fallback is acceptable

**Implementation Notes**:
- Run `pnpm dev` to start development server with hot reload
- Extension connects to `ws://localhost:1234` (default Plasmo port)
- Console logging confirms connection status
- Manual reload still required for: manifest changes, permission changes, background script initialization

### 5. Minimal Permissions for GitHub.com Access

**Decision**: Manifest permissions limited to GitHub.com domain only

**Rationale**:
- Follows principle of least privilege (constitution security requirement)
- No `activeTab`, `tabs`, or broad host permissions
- Only content script injection on GitHub.com pages
- No background permissions initially

**Implementation**:
```json
{
  "content_scripts": [{
    "matches": ["*://github.com/*", "*://*.github.com/*"],
    "js": ["content.js"]
  }],
  "permissions": []
}
```

**Alternatives Considered**:
- `activeTab`: Too broad, allows access to all tabs
- `<all_urls>`: Unnecessary and security risk
- Specific subdomain patterns: Current approach covers main site and subdomains

### 6. Husky Pre-commit Hook Configuration

**Decision**: Use Husky v8+ with pnpm for Git hooks

**Rationale**:
- Industry standard for Git hooks in Node.js projects
- Automatic setup with `pnpm dlx husky-init`
- Enforces quality gates before commit (constitution requirement)
- Simple `.husky/pre-commit` script
- Works with pnpm out of the box

**Implementation**:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm run lint
pnpm run format:check
pnpm run typecheck
```

**Alternatives Considered**:
- **lint-staged**: More granular (only checks staged files), adds complexity
- **simple-git-hooks**: Lighter than Husky, less features
- **Manual Git hooks**: No package management, hard to share across team

### 7. GitHub Actions CI/CD Workflow

**Decision**: GitHub Actions with matrix testing and caching

**Rationale**:
- Free for public repositories (open source requirement)
- Native GitHub integration
- Caching support for pnpm dependencies
- Parallel job execution
- Clear transparency for open source

**Implementation**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run format:check
      - run: pnpm run typecheck
      - run: pnpm run test
      - run: pnpm run build
```

### 8. Smoke Test Strategy for Extension Loading

**Decision**: Console logging with git commit hash for verification

**Rationale**:
- Simple, no additional testing infrastructure needed for initial verification
- Visible in browser DevTools console
- Confirms script injection and execution
- Git commit hash proves built version matches source

**Implementation**:
```typescript
// src/contents/index.ts
const COMMIT_HASH = process.env.PLASMO_PUBLIC_COMMIT_HASH || 'dev';
console.log(`GitHub-Switcher content loaded @ ${COMMIT_HASH}`);
```

Build script injects commit hash:
```json
{
  "scripts": {
    "build": "cross-env PLASMO_PUBLIC_COMMIT_HASH=$(git rev-parse --short HEAD) plasmo build"
  }
}
```

**Verification Steps**:
1. Load extension in Chrome
2. Navigate to github.com repository or file page
3. Open DevTools console
4. Verify message: "GitHub-Switcher content loaded @ abc1234"

### 9. ENABLE_INJECT Feature Flag Pattern

**Decision**: Use environment variable with default false

**Rationale**:
- Explicitly disables DOM manipulation by default
- Easy to toggle for future features
- Runtime check prevents accidental injection
- Documented in code and README

**Implementation**:
```typescript
// src/lib/config.ts
export const ENABLE_INJECT = process.env.PLASMO_PUBLIC_ENABLE_INJECT === 'true';

// src/contents/index.ts
import { ENABLE_INJECT } from '@/lib/config';

if (ENABLE_INJECT) {
  createButton(); // Future implementation
  mount();        // Future implementation
}
```

### 10. Testing Framework Selection

**Decision**: Vitest for unit testing

**Rationale**:
- Vite-based (fast, modern)
- Native ESM support
- Compatible with TypeScript out of the box
- Same configuration syntax as Jest (easy migration if needed)
- Built-in coverage reporting (c8)
- Faster than Jest for TypeScript projects

**Implementation Notes**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // For DOM testing if needed
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**Alternatives Considered**:
- **Jest**: More mature, larger ecosystem, but slower for TypeScript
- **Mocha + Chai**: Requires more setup, less integrated
- **No tests initially**: Violates constitution test coverage mandate

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Language | TypeScript | 5.x | Type safety, modern features, spec requirement |
| Framework | Plasmo | Latest | Extension-specific tooling, hot reload, MV3 support |
| Package Manager | pnpm | 8.x | Efficient disk usage, fast installs, spec requirement |
| Linter | Biome | Latest | Fast Rust-based linting |
| Formatter | Prettier | Latest | Industry standard formatting |
| Test Framework | Vitest | Latest | Fast, modern, TypeScript-native |
| Git Hooks | Husky | 8.x | Quality gate enforcement |
| CI/CD | GitHub Actions | N/A | Free for open source, native integration |
| Target Browser | Chrome | MV3 | Spec requirement |

## Open Questions Resolved

All technical unknowns have been researched and resolved. Ready to proceed to Phase 1 (Design & Contracts).
