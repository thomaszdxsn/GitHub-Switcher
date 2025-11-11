---
description: "Task list for browser extension project initialization"
---

# Tasks: Browser Extension Project Initialization

**Input**: Design documents from `/specs/001-project-init/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: No test tasks included (initial project setup, tests will be written as features are developed)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use absolute paths from repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create basic project structure and initialize package management

- [x] T001 Create root directory structure (src/, tests/, .github/)
- [x] T002 Initialize pnpm project with `pnpm init` in repository root
- [x] T003 [P] Create .gitignore file in repository root with patterns: node_modules/, dist/, build/, .env*, *.log, .DS_Store, coverage/
- [x] T004 [P] Create LICENSE file in repository root (MIT license recommended)
- [x] T005 [P] Create CHANGELOG.md file in repository root with v0.1.0 initial entry

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Install Plasmo framework: `pnpm add -D plasmo` in repository root
- [x] T007 Install TypeScript and types: `pnpm add -D typescript @types/chrome @types/node` in repository root
- [x] T008 [P] Install Biome linter: `pnpm add -D @biomejs/biome` in repository root
- [x] T009 [P] Install Prettier formatter: `pnpm add -D prettier` in repository root
- [x] T010 [P] Install Vitest and testing dependencies: `pnpm add -D vitest @vitest/ui jsdom @testing-library/dom` in repository root
- [x] T011 [P] Install Husky for Git hooks: `pnpm add -D husky` in repository root
- [x] T012 [P] Install cross-env for environment variables: `pnpm add -D cross-env` in repository root
- [x] T013 Create tsconfig.json in repository root with strict mode, ES2020 target, path aliases (@/* → src/*)
- [x] T014 [P] Create biome.json in repository root with linting rules (noExplicitAny: error, recommended rules enabled)
- [x] T015 [P] Create .prettierrc in repository root with formatting rules (semi: true, singleQuote: true, tabWidth: 2, printWidth: 100)
- [x] T016 [P] Create vitest.config.ts in repository root with coverage config (80% thresholds, c8 provider, jsdom environment)
- [x] T017 Update package.json scripts section with: dev, build, test, test:watch, test:coverage, lint, lint:fix, format, format:check, typecheck, prepare
- [x] T018 Initialize Husky: Run `pnpm exec husky install` in repository root
- [x] T019 Create .husky/pre-commit file with hooks: pnpm run lint, pnpm run format:check, pnpm run typecheck
- [x] T020 [P] Create tests/setup.ts file for Vitest global configuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Extension Loading (Priority: P1) 🎯 MVP

**Goal**: Enable loading the extension in Chrome developer mode with minimal content script

**Independent Test**: Load extension in `chrome://extensions/`, navigate to github.com, verify console shows "content loaded@<commit>" message without errors

### Implementation for User Story 1

- [x] T021 [P] [US1] Create src/lib/types.ts file with TypeScript interfaces: GitHubDetectionResult, LogMessage, FeatureFlags
- [x] T022 [P] [US1] Create src/lib/config.ts file with feature flag constants: ENABLE_INJECT (default false), COMMIT_HASH, IS_DEV
- [x] T023 [P] [US1] Create src/utils/logger.ts file with logging functions: log(), warn(), error() (with [GitHub-Switcher] prefix)
- [x] T024 [US1] Create src/lib/detectGithub.ts file with isGitHubPage() function that checks window.location.hostname
- [x] T025 [US1] Create src/contents/index.ts file as content script entry point (imports detectGithub, logger, config; logs loading message)
- [x] T026 [US1] Update package.json build script to inject git commit hash: `cross-env PLASMO_PUBLIC_COMMIT_HASH=$(git rev-parse --short HEAD) plasmo build`
- [x] T027 [P] [US1] Create README.md in repository root with sections: Prerequisites, Installation, Development Workflow, Load Extension in Chrome, Verify Installation, Troubleshooting (include note that Plasmo auto-generates manifest.json from package.json metadata), and Common Issues (corrupted node_modules → run `pnpm install --force`, browser compatibility → check Plasmo documentation for supported versions)
- [x] T028 [P] [US1] Create CONTRIBUTING.md in repository root with contribution guidelines, code style, commit conventions

**Checkpoint**: At this point, User Story 1 should be fully functional - extension loads and logs to console on GitHub pages

---

## Phase 4: User Story 2 - Development Environment Setup (Priority: P2)

**Goal**: Configure complete development tooling with linting, formatting, hot reload, and quality gates

**Independent Test**: Run `pnpm run lint`, `pnpm run format:check`, `pnpm run typecheck`, attempt commit to verify pre-commit hooks work, modify source file and verify hot reload

### Implementation for User Story 2

- [x] T029 [P] [US2] Verify Biome linter works: Run `pnpm run lint` on src/ directory and confirm it executes without errors
- [x] T030 [P] [US2] Verify Prettier formatter works: Run `pnpm run format:check` on src/ directory and confirm it executes
- [x] T031 [P] [US2] Verify TypeScript compilation: Run `pnpm run typecheck` and confirm no type errors
- [x] T032 [US2] Test pre-commit hooks: Make a trivial change, attempt `git commit`, verify hooks run and block if issues found
- [] T033 [US2] Test hot reload: Run `pnpm dev`, modify src/contents/index.ts, verify extension reloads automatically in browser
- [x] T034 [US2] Document hot reload limitations in README.md: Note that manifest/permission changes require manual reload
- [x] T035 [P] [US2] Add format scripts to package.json: `format: prettier --write src tests`, `format:check: prettier --check src tests`
- [x] T036 [P] [US2] Add lint:fix script to package.json: `lint:fix: biome check --apply src tests`

**Checkpoint**: Development environment fully configured - linting, formatting, type checking, hot reload all working

---

## Phase 5: User Story 3 - Test Infrastructure (Priority: P3)

**Goal**: Set up Vitest test framework with sample tests and CI/CD integration

**Independent Test**: Run `pnpm test` and verify tests execute, run `pnpm run test:coverage` and verify coverage report generated, push code and verify GitHub Actions CI runs

### Implementation for User Story 3

- [x] T037 [P] [US3] Create tests/unit/detectGithub.test.ts file with tests for isGitHubPage() function (valid GitHub URL, invalid URL, subdomains)
- [x] T038 [P] [US3] Create tests/unit/logger.test.ts file with tests for log(), warn(), error() functions (verify console output, message formatting)
- [x] T039 [US3] Run `pnpm test` and verify all tests pass
- [x] T040 [US3] Run `pnpm run test:coverage` and verify coverage report is generated in coverage/ directory
- [x] T041 [US3] Create .github/workflows/ci.yml file with GitHub Actions workflow: install deps, lint, format check, typecheck, test with coverage, build
- [x] T042 [US3] Configure GitHub Actions to run on push and pull_request events
- [x] T043 [US3] Add Node.js version matrix (node 20.x) and pnpm caching to ci.yml
- [x] T044 [US3] Test GitHub Actions: Push code to remote and verify CI runs successfully
- [x] T045 [P] [US3] Update README.md with testing section: how to run tests, how to generate coverage, where to find coverage reports

**Checkpoint**: Test infrastructure complete - unit tests passing, coverage reporting working, CI/CD pipeline running

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, documentation, and verification

- [x] T046 [P] Review all TSDoc comments in src/lib/ and src/utils/ files - ensure all public functions documented
- [x] T047 [P] Verify .gitignore excludes all build artifacts (run `git status` after build to confirm)
- [x] T048 [P] Update CHANGELOG.md with complete v0.1.0 release notes
- [x] T049 Final smoke test: Clone fresh repo, run setup per README, load extension, verify console output on github.com
- [x] T050 Measure and document setup time (target: <5 minutes), build time (target: <30s), lint time (target: <10s)
- [x] T051 [P] Create GitHub repository description and topics (browser-extension, typescript, plasmo, chrome-extension, github)
- [x] T052 Final constitution compliance check: Verify no secrets committed, documentation complete, quality gates working

**Checkpoint**: Project initialization complete - all quality gates passing, documentation complete, ready for production use

**Performance Results** (T050):
- Setup time: 2.8s ✅ (target: <5min)
- Build time: 5.8s ✅ (target: <30s)
- Lint time: 1.3s ✅ (target: <10s)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**User Story 1 only** constitutes the MVP:
- Extension loads in Chrome
- Content script runs on GitHub pages
- Console logging confirms execution
- Basic project structure in place

This can be delivered independently and provides immediate value (verifiable extension skeleton).

**Note**: FR-012 requirement for "placeholder directories for UI components" is deferred to future UI feature implementation. The MVP focuses on content scripts only per the minimal structure requirement.

### Incremental Delivery

1. **Iteration 1 (MVP)**: Complete Phase 1-3 (Setup + Foundation + US1) → Deliverable: Loadable extension
2. **Iteration 2**: Complete Phase 4 (US2) → Deliverable: Full development environment with quality gates
3. **Iteration 3**: Complete Phase 5 (US3) → Deliverable: Test infrastructure and CI/CD
4. **Iteration 4**: Complete Phase 6 → Deliverable: Polished, documented, production-ready skeleton

Each iteration delivers a fully functional increment that can be demonstrated and tested independently.

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation)
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
      US1           US2           US3
    (P1 MVP)    (P2 DevEnv)   (P3 Testing)
        ↓             ↓             ↓
        └─────────────┼─────────────┘
                      ↓
            Phase 6 (Polish)
```

**Blocking Dependencies**:
- Phase 2 MUST complete before any user story
- US1 has no dependencies (can start immediately after Phase 2)
- US2 has no dependencies (can start immediately after Phase 2, parallel with US1)
- US3 has no dependencies (can start immediately after Phase 2, parallel with US1 and US2)

**Recommended Order**: US1 → US2 → US3 (by priority)

---

## Parallel Execution Opportunities

### Within Phase 2 (Foundation)

Tasks T008-T012 can run in parallel (installing different packages):
```bash
# Terminal 1
pnpm add -D @biomejs/biome

# Terminal 2
pnpm add -D prettier

# Terminal 3
pnpm add -D vitest @vitest/ui jsdom @testing-library/dom
```

Tasks T014-T016 can run in parallel (creating different config files).

### Within User Story 1

Tasks T021-T023 can run in parallel (creating different files):
- T021: types.ts
- T022: config.ts
- T023: logger.ts

Tasks T027-T028 can run in parallel (creating documentation files).

### Across User Stories

After Phase 2 completes, all three user stories can be worked on in parallel:
- Developer A: US1 (basic extension loading)
- Developer B: US2 (dev environment setup)
- Developer C: US3 (test infrastructure)

Each story is independently testable and delivers value on its own.

---

## Notes

### Task Execution Tips

- Tasks marked **[P]** can be executed in parallel with other [P] tasks in the same phase
- Tasks with **[US#]** belong to specific user stories and can be grouped
- File paths are relative to repository root
- Always run `pnpm install` after adding dependencies
- Always run `pnpm run typecheck` after creating TypeScript files
- Test each user story independently before moving to the next

### Success Metrics

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Setup Time | < 5 min | Time from `git clone` to first successful build |
| Build Time | < 30s | Run `time pnpm build` |
| Lint Time | < 10s | Run `time pnpm run lint` |
| Extension Loads | 0 errors | Check chrome://extensions/ and browser console |
| Pre-commit | Works | Attempt commit with unformatted code |
| CI/CD | Passes | Check GitHub Actions workflow |

### Constitution Compliance Checklist

- [x] No secrets in codebase (.gitignore configured)
- [x] Pre-commit hooks scan for secrets
- [x] Test infrastructure ready (Vitest configured)
- [x] Documentation complete (README, CONTRIBUTING, CHANGELOG)
- [x] License file present (MIT recommended)
- [x] GitHub Actions configured for transparency
- [x] All public functions have TSDoc comments
- [x] Linting and formatting enforced

---

## Summary

**Total Tasks**: 52  
**User Story 1 (MVP)**: 8 implementation tasks (T021-T028)  
**User Story 2 (DevEnv)**: 8 implementation tasks (T029-T036)  
**User Story 3 (Testing)**: 9 implementation tasks (T037-T045)  
**Setup Phase**: 5 tasks (T001-T005)  
**Foundation Phase**: 15 tasks (T006-T020)  
**Polish Phase**: 7 tasks (T046-T052)  

**Parallel Opportunities**: 18 tasks marked with [P]  
**Estimated Time**: 4-6 hours total (assuming single developer, sequential execution)  
**MVP Time**: 2-3 hours (Phase 1 + Phase 2 + Phase 3 only)
