# Implementation Plan: GitHub Switcher Sidebar

**Branch**: `002-github-switcher-sidebar` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-github-switcher-sidebar/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Summary**: 
Implement a browser extension that injects a persistent sidebar button on GitHub repository pages. When clicked, the button displays a dropdown menu with 8 third-party tools (GitHub.dev, DeepWiki, CodeSandbox, StackBlitz, nbviewer, gitdiagram, gitingest, githistory). Users can select any tool to open the current repository in that tool via a new browser tab. The extension uses TypeScript with Plasmo framework (Manifest V3), native CSS (no UI libraries), URL/DOM parsing only (no GitHub API calls), and targets Chrome/Edge latest stable versions.

## Technical Context

**Language/Version**: TypeScript 5.x with strict type checking enabled  
**Primary Dependencies**: 
- Plasmo (browser extension framework for Manifest V3)
- Biome (linter)
- Prettier (formatter)
- Vitest (testing framework)

**UI Approach**: Native DOM manipulation (no React/Vue/framework)
- `document.createElement` for element creation
- Native event listeners for interactivity
- CSS class prefix `__github-switcher` for style isolation

**Storage**: chrome.storage.sync for user preferences only (open in new tab toggle, menu item visibility toggles)  
**Testing**: Vitest for unit tests, manual testing for integration (Chrome/Edge latest stable)  
**Target Platform**: Desktop browsers (Chrome/Edge latest stable versions), Manifest V3 extension  
**Project Type**: Browser extension (content script injection, native DOM rendering)  
**Performance Goals**: 
- Button injection ≤100ms (no framework overhead)
- Content script bundle size ≤40KB (gzip, without React)
- Zero long tasks (all tasks <50ms)
- Button appears within 500ms of page load

**Constraints**: 
- No UI frameworks (native DOM + TypeScript only)
- No third-party CSS libraries (native CSS with `__github-switcher` class prefix for isolation)
- No GitHub API calls (URL/DOM parsing only)
- No server-side components
- Minimum permissions (activeTab, host_permissions for https://github.com/* only)
- Zero console errors in production
- ESLint/TypeScript checks must pass
- Unit test coverage ≥80% for critical paths

**Scale/Scope**: 
- 8 static tool entries (no dynamic configuration)
- Single domain target (github.com, no GitHub Enterprise support)
- Desktop only (no mobile adaptation)
- English UI text (spec-defined, browser language following)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Open Source Security ✅

- **Status**: PASS
- **Evidence**: 
  - No API keys, passwords, or private data required
  - All configuration is static tool URL templates (public)
  - Extension operates entirely client-side with public GitHub URLs
  - No backend services or private infrastructure
- **Action Items**: None

### II. Test Coverage Mandate ⚠️

- **Status**: PLANNED (will pass after Phase 1)
- **Evidence**: 
  - Unit test coverage target: ≥80% for URL parsing, tool generation, state management
  - Integration test coverage: 100% of critical user paths (manual testing Chrome/Edge)
  - Contract test coverage: N/A (no public APIs exposed)
- **Action Items**: 
  - Phase 1: Define test cases for URL parser, tool link generator, menu state manager
  - Phase 2: Implement tests before production code (TDD)
  - CI: Add coverage reporting to verify ≥80% threshold

### III. Documentation Coverage ✅

- **Status**: PASS (in progress)
- **Evidence**: 
  - Feature spec complete with user scenarios and acceptance criteria
  - Implementation plan in progress
  - Deliverable includes README (installation, permissions, usage)
- **Action Items**: 
  - Phase 1: Complete quickstart.md with setup instructions
  - Phase 2: Add inline code comments explaining URL parsing logic
  - Pre-release: Verify README installation steps

### IV. Transparency & Public Accountability ✅

- **Status**: PASS
- **Evidence**: 
  - Open source project with public repository
  - All decisions documented in spec and plan
  - Feature development tracked in public branch
  - No private communication channels for technical decisions
- **Action Items**: None

### Quality Gates Summary

**Pre-Commit Gates**:
- ✅ Biome linting must pass (no errors)
- ✅ TypeScript type checking must pass (strict mode)
- ⚠️ Local tests must pass (to be implemented in Phase 2)
- ✅ Secret detection: N/A (no secrets in project)

**CI/CD Gates**:
- ⚠️ All tests must pass (to be implemented)
- ⚠️ Coverage ≥80% (to be implemented)
- ✅ Documentation builds: N/A (Markdown only)
- ✅ Security scans: Dependency vulnerabilities check via npm audit

**Constitution Compliance**: ✅ READY FOR PHASE 0 (2 items planned for Phase 1-2)

---

## Phase 0: Research Complete ✅

All technical unknowns have been resolved. See [research.md](./research.md) for detailed findings:

1. ✅ Plasmo framework content script injection patterns
2. ✅ GitHub URL parsing strategy (regex with capture groups)
3. ✅ CSS isolation approach (class prefix + Plasmo scoping)
4. ✅ Client-side navigation detection (popstate + Turbo events)
5. ✅ Dropdown positioning algorithm (dynamic calculation)
6. ✅ Keyboard navigation & accessibility (semantic HTML + ARIA)
7. ✅ Performance optimization (lazy loading, bundle size)
8. ✅ Tool URL template generation (simple string replacement)
9. ✅ User preferences storage (chrome.storage.sync)
10. ✅ Testing strategy (Vitest unit tests + manual E2E)

**Output**: [research.md](./research.md) with all decisions documented

---

## Phase 1: Design & Contracts Complete ✅

All design artifacts have been generated:

1. ✅ **Data Model**: [data-model.md](./data-model.md)
   - 4 core entities: RepositoryContext, ToolEntry, MenuState, UserPreferences
   - 2 helper types: MenuPosition, GeneratedToolLink
   - Static tool configuration (8 tools)
   - Complete validation rules and state transitions

2. ✅ **API Contracts**: [contracts/README.md](./contracts/README.md)
   - 4 internal module contracts (URL parser, URL generator, positioning, storage)
   - Chrome Extension API contracts (storage.sync, tabs, content scripts)
   - Event contracts (navigation listeners)
   - Component contracts (SidebarButton, ToolDropdown)

3. ✅ **Quickstart Guide**: [quickstart.md](./quickstart.md)
   - TDD workflow with step-by-step implementation
   - Test examples for all critical functions
   - Component code templates with styling
   - Development and production build instructions
   - Troubleshooting guide

4. ✅ **Agent Context Updated**: `.github/copilot-instructions.md`
   - Added TypeScript 5.x with strict checking
   - Added chrome.storage.sync database
   - Preserved manual additions

**Output**: All Phase 1 artifacts complete

---

## Constitution Re-Check (Post-Design) ✅

### I. Open Source Security ✅
- **Status**: PASS (no changes from Phase 0)
- All configuration remains public and client-side

### II. Test Coverage Mandate ✅
- **Status**: READY FOR IMPLEMENTATION
- Test files defined in quickstart.md:
  - `tests/unit/urlGenerator.test.ts` (100% target)
  - `tests/unit/positioning.test.ts` (≥80% target)
  - Existing `tests/unit/detectGithub.test.ts` (100%)
- TDD workflow documented with example tests
- Coverage verification: `pnpm test --coverage`

### III. Documentation Coverage ✅
- **Status**: PASS
- Comprehensive documentation complete:
  - Feature spec with user scenarios
  - Implementation plan (this file)
  - Research decisions with rationale
  - Data model with validation rules
  - API contracts with examples
  - Quickstart guide with code templates
- Ready for README.md update in Phase 2

### IV. Transparency & Public Accountability ✅
- **Status**: PASS (no changes from Phase 0)
- All work tracked in public branch and documents

**Final Compliance**: ✅ ALL GATES PASS - Ready for Phase 2 (Task Breakdown)

## Project Structure

### Documentation (this feature)

```text
specs/002-github-switcher-sidebar/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── README.md        # API contracts (N/A for this extension, minimal placeholder)
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (already exists)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── contents/
│   └── index.ts              # Content script: inject sidebar button, handle GitHub page detection
├── lib/
│   ├── config.ts             # Tool definitions (8 tools with URL templates, order, notes)
│   ├── detectGithub.ts       # URL parser: extract owner/repo from github.com URLs
│   ├── types.ts              # TypeScript interfaces: RepositoryContext, ToolEntry, MenuState
│   └── urlGenerator.ts       # NEW: Generate tool URLs from templates + context
├── ui/
│   ├── SidebarButton.ts      # NEW: Native DOM button component (no React)
│   └── ToolDropdown.ts       # NEW: Native DOM dropdown component (no React)
├── utils/
│   ├── logger.ts             # Development logging utility
│   └── positioning.ts        # NEW: Menu positioning logic (bottom-right vs top-right)

tests/
├── unit/
│   ├── detectGithub.test.ts  # URL parser tests (existing)
│   ├── urlGenerator.test.ts  # NEW: Tool URL generation tests
│   ├── positioning.test.ts   # NEW: Menu positioning logic tests
│   └── logger.test.ts        # Logger tests (existing)
└── setup.ts                  # Test configuration

assets/
├── icon-16.png               # Extension icon (16x16)
├── icon-48.png               # Extension icon (48x48)
└── icon-128.png              # Extension icon (128x128)

build/                        # Plasmo build output (chrome-mv3-dev, chrome-mv3-prod)
package.json                  # Dependencies and scripts
tsconfig.json                 # TypeScript configuration (strict mode)
biome.json                    # Biome linter configuration
vitest.config.ts              # Vitest test configuration
README.md                     # Installation, permissions, usage documentation
```

**Structure Decision**: Browser extension structure using Plasmo framework with **native DOM rendering** (no React). Content script (`src/contents/index.ts`) handles GitHub page detection and injects UI components with CSS class prefix `__github-switcher` for style isolation. UI components (`src/ui/`) are plain TypeScript classes that use `document.createElement` for element creation. Styling is injected into `<head>` with prefixed class names to avoid conflicts with GitHub's CSS. Tests follow the existing pattern in `tests/unit/` with ≥80% coverage for URL parsing, tool generation, and positioning logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. All quality gates are either passing or planned for implementation during Phase 1-2 as per standard TDD workflow.
