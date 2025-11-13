# GitHub-Switcher

A Chrome browser extension that adds a convenient sidebar button to GitHub repository pages, providing quick access to third-party developer tools.

## Features

### Sidebar Tool Menu

When viewing any GitHub repository, a sidebar button appears on the left side of the page. Click it to access a dropdown menu with 8 third-party tools:

- **GitHub.dev** - Open repository in VS Code for the Web
- **DeepWiki** - AI-powered documentation explorer
- **CodeSandbox** - Online code editor and development environment
- **StackBlitz** - Instant full-stack web development environment
- **nbviewer** (Jupyter Notebook viewer) - View Jupyter notebooks with better rendering
- **gitdiagram** - Visualize repository structure as diagrams
- **gitingest** - Analyze repository metrics and insights
- **githistory** - Visualize file history and evolution

**Key Features:**
- ✅ Works on all GitHub repository pages (including sub-paths like files, PRs, issues)
- ✅ Smart menu positioning - adapts to viewport constraints
- ✅ Easy dismissal - click outside menu or re-click button to close
- ✅ Keyboard accessible with ARIA attributes
- ✅ Handles GitHub SPA navigation - updates automatically when navigating between repositories

### Permissions Explained

This extension requires the following permissions:

- **`https://github.com/*/*`** - Access to GitHub repository pages to inject the sidebar button
- **`storage`** - Store user preferences (which tools to show, whether to open in new tab)

**Privacy**: This extension does NOT:
- Collect or transmit any user data
- Access private repositories without your permission
- Track browsing history or activity
- Make network requests to third-party servers

All functionality runs locally in your browser. The extension only injects UI elements and opens tool URLs when you click a menu item.

## Prerequisites

- **Node.js**: Version 20.x or later
- **pnpm**: Version 8.x or later
- **Chrome Browser**: For loading and testing the extension

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd GitHub-Switcher
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Build the extension**:
   ```bash
   pnpm build
   ```

## Development Workflow

### Development Mode

Start the development server with hot reload:

```bash
pnpm dev
```

This will:
- Start a development server on `http://localhost:1234`
- Watch for file changes and automatically rebuild
- Enable hot reload for the extension (manifest/permission changes require manual reload)

### Build for Production

Build the extension with git commit hash:

```bash
pnpm build
```

Output will be in `build/chrome-mv3-prod/` directory.

### Code Quality

Run linting:
```bash
pnpm lint
```

Fix linting issues:
```bash
pnpm lint:fix
```

Check formatting:
```bash
pnpm format:check
```

Auto-format code:
```bash
pnpm format
```

Type check:
```bash
pnpm typecheck
```

### Testing

Run tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

Generate coverage report:
```bash
pnpm run test:coverage
```

**Coverage targets**: The project enforces 80% code coverage for lines, functions, branches, and statements. Coverage reports are generated in the `coverage/` directory and include:
- `coverage/index.html` - HTML coverage report (open in browser)
- `coverage/coverage-final.json` - JSON format for CI/CD
- Console output showing coverage summary

**Viewing coverage**: After running `pnpm run test:coverage`, open `coverage/index.html` in your browser to see detailed line-by-line coverage.

## Load Extension in Chrome

1. **Build the extension**:
   ```bash
   pnpm build
   ```

2. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-prod/` directory

4. **Verify installation**:
   - Extension should appear in the extensions list
   - Navigate to `https://github.com` and open the browser console
   - You should see `[GitHub-Switcher] content loaded@<commit>` message

## Verify Installation

After loading the extension:

1. Navigate to any GitHub repository (e.g., `https://github.com/microsoft/typescript`)
2. Open the browser console (F12 → Console tab)
3. You should see:
   ```
   [GitHub-Switcher] content loaded@<commit-hash>
   [GitHub-Switcher] GitHub page detected: /microsoft/typescript
   [GitHub-Switcher] Injection disabled by feature flag
   ```

If you see these messages, the extension is working correctly!

## Troubleshooting

### Extension doesn't load

- **Check browser console for errors**: Open DevTools and look for error messages
- **Verify build output**: Ensure `build/chrome-mv3-prod/` directory exists and contains `manifest.json`
- **Check Chrome version**: Extension requires Chrome with Manifest V3 support

### Manifest generation

**Note**: Plasmo automatically generates `manifest.json` from `package.json` metadata. You don't need to create this file manually. The manifest is generated during the build process.

### Common Issues

#### Corrupted node_modules

If you encounter dependency issues:
```bash
pnpm install --force
```

This will delete `node_modules/` and reinstall all dependencies.

#### Browser compatibility

This extension is built for **Chrome with Manifest V3**. For browser compatibility:
- Check [Plasmo documentation](https://docs.plasmo.com) for supported browser versions
- Manifest V3 requires Chrome 88+ or Edge 88+

#### Hot reload not working

Hot reload works for:
- TypeScript/JavaScript file changes
- CSS changes

Hot reload **does NOT work** for:
- Manifest changes (permissions, content_scripts, etc.)
- Extension icon changes

For these changes, you must manually reload the extension in `chrome://extensions/`.

#### Build errors

If you encounter build errors:
1. Run `pnpm typecheck` to check for TypeScript errors
2. Run `pnpm lint` to check for code quality issues
3. Clear build cache: `rm -rf build/ .plasmo/` and rebuild

## Project Structure

```
GitHub-Switcher/
├── src/
│   ├── contents/           # Content scripts
│   │   └── index.ts       # Main content script
│   ├── lib/               # Core library code
│   │   ├── config.ts      # Feature flags and config
│   │   ├── detectGithub.ts # GitHub page detection
│   │   └── types.ts       # TypeScript type definitions
│   └── utils/             # Utility functions
│       └── logger.ts      # Logging utility
├── tests/
│   ├── unit/              # Unit tests
│   └── setup.ts           # Test configuration
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── build/                 # Build output (gitignored)
├── package.json           # Project metadata and scripts
├── tsconfig.json          # TypeScript configuration
├── biome.json            # Biome linter configuration
├── .prettierrc           # Prettier formatter configuration
├── vitest.config.ts      # Vitest test configuration
└── README.md             # This file
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.
