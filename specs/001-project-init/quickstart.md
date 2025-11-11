# Quickstart: Browser Extension Project Setup

**Feature**: 001-project-init  
**Date**: 2025-11-11  
**Audience**: Developers setting up the GitHub-Switcher extension

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 18.x or 20.x ([Download](https://nodejs.org/))
- **pnpm**: Version 8.x or later
  ```bash
  npm install -g pnpm@latest
  ```
- **Git**: For version control
- **Chrome Browser**: For loading the extension
- **Code Editor**: VS Code recommended with TypeScript support

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GitHub-Switcher.git
cd GitHub-Switcher
```

### 2. Install Dependencies

```bash
pnpm install
```

This will:
- Install all Node.js dependencies
- Set up Husky Git hooks automatically
- Create `pnpm-lock.yaml` for reproducible builds

**Expected Time**: ~30 seconds (depending on internet speed)

---

## Development Workflow

### Start Development Server

```bash
pnpm dev
```

This command:
- Starts Plasmo development server at `http://localhost:1234`
- Enables hot reload (auto-refresh on file changes)
- Builds extension to `build/chrome-mv3-dev/`
- Watches for file changes in `src/`

**Output**:
```
🟣 Plasmo v0.x.x
🔨 Building extension for chrome-mv3...
✅ Build complete: build/chrome-mv3-dev/
🔄 Watching for changes...
```

**Keep this terminal running** during development.

---

### Load Extension in Chrome

#### Method 1: Development Mode (Recommended)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `build/chrome-mv3-dev/` directory
5. Extension should appear in the list with green "Enabled" status

#### Method 2: Production Build

```bash
pnpm build
```

Then load `build/chrome-mv3-prod/` using the same steps above.

---

### Verify Installation

1. Navigate to any GitHub repository: https://github.com/microsoft/typescript
2. Open Chrome DevTools (`Cmd+Option+I` on Mac, `Ctrl+Shift+I` on Windows)
3. Check the **Console** tab
4. You should see:
   ```
   [GitHub-Switcher] content loaded@abc1234
   [GitHub-Switcher] GitHub page detected: /microsoft/typescript
   [GitHub-Switcher] Injection disabled by feature flag
   ```

If you see these messages, the extension is working! ✅

---

## Common Commands

### Code Quality

```bash
# Run linter (Biome)
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Check code formatting (Prettier)
pnpm run format:check

# Auto-format code
pnpm run format

# TypeScript type checking
pnpm run typecheck
```

### Testing

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage
```

**Coverage Reports**: Generated in `coverage/` directory (gitignored)

### Building

```bash
# Development build (with hot reload)
pnpm dev

# Production build (optimized, no hot reload)
pnpm build

# Build output location:
# - Development: build/chrome-mv3-dev/
# - Production: build/chrome-mv3-prod/
```

---

## Git Workflow

### Pre-commit Hooks

When you commit code, Husky automatically runs:

```bash
✓ Linting (biome check)
✓ Formatting (prettier --check)
✓ Type checking (tsc --noEmit)
```

If any check fails, the commit is **blocked**. Fix the issues and try again.

### Commit Message Format

Follow conventional commits (recommended but not enforced initially):

```
feat: add GitHub page detection
fix: resolve hot reload issue
docs: update README with new instructions
chore: update dependencies
```

---

## Project Structure

```
GitHub-Switcher/
├── src/
│   ├── contents/              # Content scripts (auto-injected)
│   │   └── index.ts          # Entry point for GitHub pages
│   ├── lib/
│   │   ├── detectGithub.ts   # GitHub detection logic
│   │   ├── config.ts         # Feature flags
│   │   └── types.ts          # TypeScript types
│   └── utils/
│       └── logger.ts         # Logging utility
├── tests/
│   ├── unit/                 # Unit tests
│   └── setup.ts              # Test configuration
├── build/                    # Build output (gitignored)
├── specs/                    # Feature specifications
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD configuration
├── manifest.json             # Extension manifest (generated)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── biome.json                # Biome linter config
├── .prettierrc               # Prettier formatter config
└── README.md                 # Main documentation
```

---

## Troubleshooting

### Extension not loading

**Problem**: "Could not load extension" error in Chrome

**Solutions**:
1. Check that `build/chrome-mv3-dev/` directory exists
2. Run `pnpm dev` to regenerate the build
3. Verify `manifest.json` exists in build directory
4. Check Chrome DevTools **Extensions** tab for detailed errors

---

### Hot reload not working

**Problem**: File changes don't trigger extension reload

**Solutions**:
1. Ensure `pnpm dev` is running
2. Check browser console for WebSocket connection errors
3. Some changes require **manual reload**:
   - Manifest changes
   - Permission changes
   - Background script modifications
4. Click the **refresh icon** on the extension card in `chrome://extensions/`

---

### Pre-commit hooks failing

**Problem**: `git commit` blocked by hooks

**Solutions**:
```bash
# Run linter and auto-fix
pnpm run lint:fix

# Auto-format code
pnpm run format

# Check TypeScript errors
pnpm run typecheck
```

Fix reported errors, then retry commit.

---

### pnpm install errors

**Problem**: Dependency installation fails

**Solutions**:
1. Delete `node_modules/` and `pnpm-lock.yaml`
2. Clear pnpm cache: `pnpm store prune`
3. Re-run: `pnpm install`
4. Verify pnpm version: `pnpm --version` (should be 8.x)

---

## Next Steps

After successful setup:

1. ✅ Extension loads in Chrome without errors
2. ✅ Console shows detection message on GitHub pages
3. ✅ Pre-commit hooks are working
4. ✅ Tests run successfully

**You're ready to start developing features!**

### Future Features to Implement

- UI components (popup, options page)
- GitHub API integration
- DOM manipulation (when `ENABLE_INJECT` is enabled)
- User preferences storage
- Advanced page detection

See `specs/` directory for detailed feature specifications.

---

## Getting Help

- **Issues**: https://github.com/your-username/GitHub-Switcher/issues
- **Discussions**: https://github.com/your-username/GitHub-Switcher/discussions
- **Contributing**: See `CONTRIBUTING.md`

---

## Performance Expectations

Based on success criteria (SC-001 through SC-006):

| Task | Target Time | Actual |
|------|-------------|--------|
| Project setup (clone + install + build) | < 5 minutes | ⏱️ Test on your machine |
| Extension load | Instant | ✅ No errors |
| Lint command | < 10 seconds | ⏱️ Run `pnpm run lint` |
| Test command | Instant | ✅ (minimal tests initially) |
| Build command | < 30 seconds | ⏱️ Run `pnpm build` |
| Pre-commit checks | < 20 seconds | ⏱️ Try a commit |

If your times exceed these targets, check:
- Hardware specs (SSD recommended)
- Node.js version (20.x is fastest)
- No other heavy processes running

---

**Happy Coding!** 🚀
