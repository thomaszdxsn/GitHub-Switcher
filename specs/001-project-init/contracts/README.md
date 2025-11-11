# API Contracts: Browser Extension Project Initialization

**Feature**: 001-project-init  
**Date**: 2025-11-11  
**Status**: Complete

## Overview

This feature is a project scaffolding task with no traditional HTTP APIs. However, we define "contracts" for internal module interfaces and extension messaging (if needed in future).

## Internal Module Contracts

### GitHub Detection Module

**Module**: `src/lib/detectGithub.ts`

**Function**: `isGitHubPage()`

**Contract**:
```typescript
/**
 * Detects if the current page is a GitHub page
 * 
 * @returns {GitHubDetectionResult} Detection result with URL details
 * 
 * @example
 * const result = isGitHubPage();
 * if (result.isGitHub) {
 *   console.log('On GitHub:', result.pathname);
 * }
 */
export function isGitHubPage(): GitHubDetectionResult;

interface GitHubDetectionResult {
  isGitHub: boolean;      // true if URL matches GitHub.com domain
  hostname: string;       // window.location.hostname
  pathname: string;       // window.location.pathname
}
```

**Behavior**:
- **Input**: None (reads from `window.location`)
- **Output**: Object with `isGitHub` boolean and URL details
- **Side Effects**: None (pure function)
- **Error Handling**: Never throws, returns `isGitHub: false` if uncertain

**Test Coverage Required**:
- ✅ Returns true for `https://github.com/user/repo`
- ✅ Returns true for `https://github.com/user/repo/blob/main/file.ts`
- ✅ Returns false for `https://gitlab.com/user/repo`
- ✅ Returns false for `https://example.com`
- ✅ Returns true for GitHub subdomains (e.g., `gist.github.com`)

---

### Logger Utility

**Module**: `src/utils/logger.ts`

**Function**: `log()`, `warn()`, `error()`

**Contract**:
```typescript
/**
 * Centralized logging utility for extension
 * Prefixes all messages with [GitHub-Switcher]
 * 
 * @param message - Message to log
 * @param ...args - Additional arguments (JSON stringified)
 */
export function log(message: string, ...args: any[]): void;
export function warn(message: string, ...args: any[]): void;
export function error(message: string, ...args: any[]): void;
```

**Behavior**:
- **Input**: Message string and optional arguments
- **Output**: Console output with `[GitHub-Switcher]` prefix
- **Side Effects**: Writes to browser console
- **Error Handling**: Catches stringify errors for args

**Example**:
```typescript
import { log, warn, error } from '@/utils/logger';

log('Content script loaded', { commit: 'abc123' });
// Console: [GitHub-Switcher] Content script loaded {"commit":"abc123"}

warn('Feature flag disabled', { flag: 'ENABLE_INJECT' });
// Console: [GitHub-Switcher] Feature flag disabled {"flag":"ENABLE_INJECT"}

error('Failed to detect page', new Error('Invalid URL'));
// Console: [GitHub-Switcher] Failed to detect page Error: Invalid URL
```

---

### Feature Flags Module

**Module**: `src/lib/config.ts`

**Exports**: Configuration constants

**Contract**:
```typescript
/**
 * Global feature flags and configuration
 * Read from environment variables at build time
 */
export const ENABLE_INJECT: boolean;  // Default: false
export const COMMIT_HASH: string;      // Git commit or 'dev'
export const IS_DEV: boolean;          // NODE_ENV === 'development'
```

**Behavior**:
- **Values**: Set at build time from environment variables
- **Immutability**: All exports are constants (readonly)
- **Defaults**: 
  - `ENABLE_INJECT`: `false`
  - `COMMIT_HASH`: `'dev'` (overridden in production builds)
  - `IS_DEV`: `true` in dev mode, `false` in production

---

## Content Script Entry Point

**Module**: `src/contents/index.ts`

**Execution**: Automatically injected by Chrome when page matches manifest patterns

**Contract**:
```typescript
/**
 * Content script entry point
 * Runs on GitHub pages matching manifest.content_scripts.matches
 * 
 * Behavior:
 * 1. Logs loading message with commit hash
 * 2. Detects GitHub page type
 * 3. If ENABLE_INJECT is true, mounts UI (future)
 * 4. Otherwise, does nothing (no DOM modifications)
 */

// Pseudo-code flow:
void async function main() {
  log('content loaded@' + COMMIT_HASH);
  
  const detection = isGitHubPage();
  if (!detection.isGitHub) {
    warn('Not on GitHub page, exiting');
    return;
  }
  
  log('GitHub page detected:', detection.pathname);
  
  if (ENABLE_INJECT) {
    // Future: createButton() / mount()
    log('Injection enabled (future implementation)');
  } else {
    log('Injection disabled by feature flag');
  }
}();
```

**Expected Console Output** (default behavior):
```
[GitHub-Switcher] content loaded@abc1234
[GitHub-Switcher] GitHub page detected: /microsoft/typescript
[GitHub-Switcher] Injection disabled by feature flag
```

---

## Chrome Extension API Usage

### Manifest Content Scripts

**API**: `chrome.runtime.getManifest()`

**Contract**:
```typescript
// Read manifest at runtime (if needed)
const manifest = chrome.runtime.getManifest();
console.log(manifest.version); // "0.1.0"
```

**Permissions Required**: None (built-in)

---

### Message Passing (Future)

**Reserved for future features**. No messaging implemented in initial iteration.

**Future Contract**:
```typescript
// Background ↔ Content Script messaging (deferred)
chrome.runtime.sendMessage(
  { type: 'DETECTION', payload: { isGitHub: true } },
  (response) => { /* ... */ }
);
```

---

## Build Scripts Contract

### pnpm Scripts

**Required Scripts** (package.json):

```json
{
  "scripts": {
    "dev": "plasmo dev",
    "build": "cross-env PLASMO_PUBLIC_COMMIT_HASH=$(git rev-parse --short HEAD) plasmo build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "biome check src",
    "lint:fix": "biome check --apply src",
    "format": "prettier --write src",
    "format:check": "prettier --check src",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

**Behavior**:
- `dev`: Starts development server with hot reload on `http://localhost:1234`
- `build`: Compiles extension to `build/chrome-mv3-prod/` with git commit hash
- `test`: Runs all tests once with coverage report
- `lint`: Checks code quality (exits non-zero on errors)
- `format:check`: Verifies code formatting (exits non-zero if unformatted)
- `typecheck`: TypeScript compilation check without emitting files

**Exit Codes**:
- `0`: Success
- `1`: Linting/formatting/type errors found
- `130`: User interrupted (Ctrl+C)

---

## Pre-commit Hook Contract

**File**: `.husky/pre-commit`

**Contract**:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm run lint || exit 1
pnpm run format:check || exit 1
pnpm run typecheck || exit 1

echo "✅ Pre-commit checks passed"
```

**Behavior**:
- Runs before every `git commit`
- Blocks commit if any check fails
- Provides immediate feedback on code quality

---

## GitHub Actions CI Contract

**File**: `.github/workflows/ci.yml`

**Contract**:
```yaml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run format:check
      - run: pnpm run typecheck
      - run: pnpm run test:coverage
      - run: pnpm run build
```

**Behavior**:
- Triggered on: push to any branch, pull request
- Validates: linting, formatting, types, tests, build
- Fails if: any step exits non-zero
- Artifacts: None (just validation)

---

## Summary

This feature has no external HTTP APIs. All "contracts" are internal TypeScript module interfaces that enforce:
- Type safety via TypeScript interfaces
- Behavioral expectations via JSDoc comments
- Test coverage requirements
- Build and quality gate behaviors

Future features will extend these contracts with:
- Extension message passing
- Chrome storage APIs
- GitHub API integration
- UI component interfaces
