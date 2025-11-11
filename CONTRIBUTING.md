# Contributing to GitHub-Switcher

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/GitHub-Switcher.git
   cd GitHub-Switcher
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Code Style

This project enforces strict code quality standards:

- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Linting**: Biome checks code quality
- **Formatting**: Prettier enforces consistent style
- **Pre-commit hooks**: Automatically run checks before each commit

### Making Changes

1. **Write your code** following the project's code style
2. **Add tests** for new functionality (test-first approach recommended)
3. **Run quality checks** locally:
   ```bash
   pnpm run lint
   pnpm run format:check
   pnpm run typecheck
   pnpm test
   ```
4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

Pre-commit hooks will automatically run linting, formatting checks, and type checking.

### Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic changes)
- `refactor:` - Code refactoring (no functional changes)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, build config)

**Examples**:
```
feat: add GitHub repository switcher button
fix: correct detection for GitHub Enterprise URLs
docs: update installation instructions
test: add tests for logger utility
```

### Testing

- **Unit tests**: Required for all business logic
- **Coverage**: Aim for ≥80% code coverage
- **Run tests**: `pnpm test` before committing
- **Test locally**: Load the extension in Chrome and verify functionality

### Pull Request Process

1. **Update documentation** if needed (README, CHANGELOG)
2. **Ensure all tests pass** and coverage meets requirements
3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Create a Pull Request** on GitHub
5. **Address review feedback** if requested
6. **Wait for approval** from project maintainers

### PR Requirements

Your PR must:
- ✅ Pass all CI checks (linting, formatting, tests, build)
- ✅ Include tests for new functionality
- ✅ Update documentation if behavior changes
- ✅ Follow the project's code style
- ✅ Have a clear description of changes
- ✅ Reference related issues (if applicable)

## Project Structure

Understanding the codebase:

- **`src/contents/`**: Content scripts injected into GitHub pages
- **`src/lib/`**: Core library code (detection logic, config, types)
- **`src/utils/`**: Utility functions (logging, helpers)
- **`tests/unit/`**: Unit tests
- **`.github/workflows/`**: CI/CD configuration

## Code Guidelines

### TypeScript

- Use **strict type checking** (no `any` types)
- Define **interfaces** for all data structures
- Add **TSDoc comments** for all public functions
- Use **path aliases** (`@/` → `src/`)

**Example**:
```typescript
/**
 * Detects if the current page is a GitHub page
 * @returns Detection result with URL details
 */
export function isGitHubPage(): GitHubDetectionResult {
  // Implementation
}
```

### Logging

Always use the centralized logger:

```typescript
import { log, warn, error } from '@/utils/logger';

log('Info message', { data: 'value' });
warn('Warning message');
error('Error message', new Error('details'));
```

### Feature Flags

Check feature flags before DOM manipulation:

```typescript
import { ENABLE_INJECT } from '@/lib/config';

if (ENABLE_INJECT) {
  // Only modify DOM if explicitly enabled
}
```

### Error Handling

- **Never throw unhandled errors** in content scripts
- **Use try-catch** for operations that may fail
- **Log errors** using the logger utility

```typescript
try {
  // Risky operation
} catch (err) {
  error('Operation failed', err);
}
```

## Reporting Issues

### Bug Reports

When reporting bugs, include:
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Browser version** and extension version
- **Console errors** (if any)
- **Screenshots** (if applicable)

### Feature Requests

When requesting features:
- **Describe the use case** and problem it solves
- **Explain the expected behavior**
- **Consider alternatives** you've explored

## Questions?

If you have questions:
- **Check the README** for setup and usage instructions
- **Search existing issues** on GitHub
- **Open a new issue** with the question label

## Recognition

Contributors will be:
- Listed in the project's contributor list
- Credited in release notes (for significant contributions)
- Acknowledged in the community

Thank you for contributing! 🎉
