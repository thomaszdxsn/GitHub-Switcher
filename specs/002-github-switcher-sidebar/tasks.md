# Tasks: GitHub Switcher Sidebar

**Feature Branch**: `002-github-switcher-sidebar`  
**Input**: Design documents from `/specs/002-github-switcher-sidebar/`  
**Date**: 2025-11-12

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript/Plasmo configuration

- [X] T001 Verify Plasmo framework is installed and configured in package.json
- [X] T002 Verify TypeScript 5.x with strict mode is configured in tsconfig.json
- [X] T003 [P] Verify Biome linter configuration in biome.json
- [X] T004 [P] Verify Vitest test framework configuration in vitest.config.ts
- [X] T005 [P] Create extension icons in assets/ (icon-16.png, icon-48.png, icon-128.png)
- [X] T006 Review existing src/lib/detectGithub.ts for URL parsing functionality
- [X] T007 Review existing src/lib/types.ts for base type definitions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and types that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Enhance RepositoryContext type in src/lib/types.ts with validation rules
- [X] T009 [P] Create ToolEntry interface and TOOLS constant array in src/lib/config.ts (9 tools: GitHub.dev, DeepWiki, CodeWiki, CodeSandbox, StackBlitz, nbviewer, gitdiagram, gitingest, githistory)
- [X] T010 [P] Create MenuState interface in src/lib/types.ts (isOpen, position, focusedItemIndex)
- [X] T011 [P] Create UserPreferences interface in src/lib/types.ts (openInNewTab, enabledTools)
- [X] T012 [P] Create MenuPosition helper type in src/lib/types.ts
- [X] T013 [P] Create GeneratedToolLink helper type in src/lib/types.ts
- [X] T014 Create test file tests/unit/urlGenerator.test.ts with test cases for tool URL generation
- [X] T015 Implement generateToolUrl() function in src/lib/urlGenerator.ts (template string replacement with encoding)
- [X] T016 Run tests for generateToolUrl() and verify 100% coverage: pnpm test tests/unit/urlGenerator.test.ts
- [X] T017 Create test file tests/unit/positioning.test.ts with test cases for menu positioning logic
- [X] T018 Implement calculateMenuPosition() function in src/utils/positioning.ts (dynamic bottom-right/top-right calculation)
- [X] T019 Run tests for calculateMenuPosition() and verify ≥80% coverage: pnpm test tests/unit/positioning.test.ts
- [X] T020 Create loadPreferences() function in src/lib/storage.ts using chrome.storage.sync
- [X] T021 [P] Create savePreferences() function in src/lib/storage.ts using chrome.storage.sync

**Checkpoint**: Foundation ready - all utilities and types are tested and working. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Quick Tool Access from Repository Page (Priority: P1) 🎯 MVP

**Goal**: Display a sidebar sidebar button on GitHub repository pages that opens a dropdown menu with 9 third-party tools. Clicking a tool opens it in a new tab.

**Independent Test**: Navigate to https://github.com/microsoft/vscode, verify button appears on left side, click button to open dropdown menu showing 9 tools in order, click "DeepWiki" and verify new tab opens to https://deepwiki.com/microsoft/vscode

### Implementation for User Story 1

- [X] T022 [P] [US1] Create SidebarButton class in src/ui/SidebarButton.ts (native DOM, no React) with createContainer(), createButton(), injectStyles(), mount(), unmount() methods
- [X] T023 [P] [US1] Create ToolDropdown class in src/ui/ToolDropdown.ts (native DOM, no React) with createMenu(), show(), hide(), mount(), unmount() methods
- [X] T024 [US1] Implement content script initialization in src/contents/index.ts that checks URL pattern, parses repository context, and creates sidebar button
- [X] T025 [US1] Add click handler in SidebarButton.ts that toggles MenuState and calls onToggle callback
- [X] T026 [US1] Implement menu rendering in ToolDropdown.ts that generates tool links using generateToolUrl() and renders as list items
- [X] T027 [US1] Add link click handler in ToolDropdown.ts that opens URL in new tab using chrome.tabs.create() and closes menu
- [X] T028 [US1] Add CSS styles for button in SidebarButton.ts using __github-switcher-button class prefix (fixed position, left side, vertical text)
- [X] T029 [US1] Add CSS styles for dropdown in ToolDropdown.ts using __github-switcher-dropdown-menu class prefix (menu positioning, item styling)
- [x] T030 [US1] Test manually on https://github.com/microsoft/vscode: button appears, menu opens, tool links work

**Checkpoint**: User Story 1 is fully functional - button appears on repository pages, menu opens with correct tools, links open in new tabs

---

## Phase 4: User Story 2 - Access Tools from Repository Sub-paths (Priority: P2)

**Goal**: Ensure the sidebar button appears on repository sub-paths (files, folders, PRs, issues) and always uses the repository root URL for tools.

**Independent Test**: Navigate to https://github.com/microsoft/vscode/blob/main/src/vs/editor/editor.api.ts, verify button appears, click button and select a tool, verify tool opens to https://[tool-domain]/microsoft/vscode (not the file path)

### Implementation for User Story 2

- [X] T031 [US2] Enhance parseGitHubUrl() in src/lib/detectGithub.ts to ignore path segments after owner/repo (handle /blob/, /tree/, /issues/, /pull/ patterns)
- [X] T032 [US2] Add test cases in tests/unit/detectGithub.test.ts for sub-path URLs (blob, tree, issues, pull requests)
- [X] T033 [US2] Run tests and verify parseGitHubUrl() correctly extracts owner/repo from sub-paths: pnpm test tests/unit/detectGithub.test.ts
- [x] T034 [US2] Test manually on https://github.com/facebook/react/blob/main/packages/react/index.js: button appears, tools use repository root URL

**Checkpoint**: User Story 2 is complete - button works on any repository sub-path, tools always use repository root

---

## Phase 5: User Story 3 - Dismiss Dropdown Menu (Priority: P3)

**Goal**: Allow users to close the dropdown menu by clicking outside it or re-clicking the sidebar button.

**Independent Test**: Open dropdown menu, click anywhere on GitHub page outside menu area and verify menu closes; open menu again, click sidebar button and verify menu closes

### Implementation for User Story 3

- [X] T035 [US3] Add backdrop element in ToolDropdown.ts with __github-switcher-dropdown-backdrop class
- [X] T036 [US3] Add click event listener on backdrop that calls onClose() callback to close menu
- [X] T037 [US3] Enhance button click handler in SidebarButton.ts to toggle isOpen state (close if open, open if closed)
- [X] T038 [US3] Add CSS for backdrop in ToolDropdown.ts (fixed position, full viewport, transparent, z-index below menu)
- [x] T039 [US3] Test manually: click outside menu to close, click button again to close

**Checkpoint**: User Story 3 is complete - menu can be dismissed by clicking outside or re-clicking button

---

## Phase 6: User Story 4 - Smart Menu Positioning (Priority: P3)

**Goal**: Position dropdown menu intelligently based on available viewport space (bottom-right preferred, top-right fallback).

**Independent Test**: Resize browser window to small height, scroll so button is near bottom of viewport, click button and verify menu appears above button (top-right); scroll to top, click button and verify menu appears below button (bottom-right)

### Implementation for User Story 4

- [X] T040 [US4] Integrate calculateMenuPosition() in content script index.ts to get button rect and calculate menu position before showing dropdown
- [X] T041 [US4] Pass MenuPosition to ToolDropdown.show() method and apply top/left CSS properties to menu element
- [X] T042 [US4] Add window resize listener in content script that recalculates position if menu is open
- [x] T043 [US4] Test manually: resize window, scroll to different positions, verify menu stays within viewport

**Checkpoint**: User Story 4 is complete - menu positioning adapts to viewport constraints

---

## Phase 7: Navigation & Edge Cases (Cross-Story Enhancements)

**Purpose**: Handle GitHub SPA navigation and edge cases across all user stories

- [X] T044 Add popstate event listener in src/contents/index.ts to detect browser back/forward navigation
- [X] T045 Add turbo:load event listener in src/contents/index.ts to detect GitHub SPA navigation
- [X] T046 Implement cleanup() function in src/contents/index.ts to remove button and menu on navigation away from repository pages
- [X] T047 Add beforeunload event listener to cleanup on page unload
- [x] T048 Test manually: navigate between repositories using GitHub UI, verify button updates correctly
- [x] T049 Test manually: navigate to non-repository pages (github.com/explore, github.com/owner), verify button does NOT appear
- [x] T050 Test manually: use browser back/forward buttons, verify button visibility updates

---

## Phase 8: Accessibility & Polish

**Purpose**: Ensure keyboard navigation and screen reader support work correctly

- [X] T051 Add ARIA attributes to button in SidebarButton.ts (aria-label, aria-expanded, aria-controls)
- [X] T052 Add ARIA attributes to menu in ToolDropdown.ts (role="menu", role="menuitem")
- [X] T053 Add ARIA attributes to menu items in ToolDropdown.ts (role="none" on li, role="menuitem" on links)
- [x] T054 Test keyboard navigation: Tab key should navigate through menu items
- [x] T055 Test with screen reader (VoiceOver/NVDA): verify button and menu items are announced correctly
- [X] T056 Run Biome linter and fix any issues: pnpm run lint
- [X] T057 Run TypeScript type checking and fix any errors: pnpm run build
- [X] T058 Run all unit tests and verify ≥80% coverage: pnpm test -- --coverage
- [X] T059 Review quickstart.md and verify all examples match actual implementation
- [X] T060 Update README.md with installation instructions, permissions explanation, and usage guide

---

## Phase 9: Production Build & Validation

**Purpose**: Final build and manual testing before release

- [X] T061 Build production bundle: pnpm build
- [X] T062 Verify production bundle size ≤40KB gzipped: gzip -c build/chrome-mv3-prod/contents.*.js | wc -c
- [x] T063 Load production build in Chrome and test all user stories (US1-US4)
- [x] T064 Measure performance: button injection ≤100ms, dropdown appearance ≤500ms
- [x] T065 Test on Chrome latest stable version
- [x] T066 Test on Edge latest stable version
- [x] T067 Verify no console errors or warnings in production build
- [X] T068 Run constitution compliance check: verify all gates pass
- [X] T069 Validate all UI text is in English: button label, menu items, and optional notes (FR-016)
- [X] T070 Validate dropdown menu displays only text (no icons) for all 9 tools (FR-007)
- [X] T071 Create CHANGELOG.md entry for this feature
- [X] T072 Update .github/copilot-instructions.md with final technology summary

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories ✅ MVP
  - User Story 2 (Phase 4): Can start after Foundational - Depends on parseGitHubUrl() from US1 but independently testable
  - User Story 3 (Phase 5): Can start after Foundational - Depends on ToolDropdown from US1 but independently testable
  - User Story 4 (Phase 6): Can start after Foundational - Depends on calculateMenuPosition() from Foundational, integrates with US1
- **Navigation (Phase 7)**: Depends on US1 completion (needs content script structure)
- **Accessibility (Phase 8)**: Depends on US1-US4 completion (polishes existing components)
- **Production (Phase 9)**: Depends on all previous phases completion

### User Story Independence

- **US1 (P1)**: Fully independent - delivers core value (MVP)
- **US2 (P2)**: Independent from US3/US4 - enhances URL parsing from US1
- **US3 (P3)**: Independent from US2/US4 - enhances menu interaction from US1
- **US4 (P3)**: Independent from US2/US3 - enhances menu positioning from US1

### Within Each User Story

- UI components (SidebarButton, ToolDropdown) before content script integration
- CSS styles alongside component implementation
- Manual testing after all tasks in user story complete

### Parallel Opportunities

**Setup Phase (Phase 1)**:
```bash
T003 (Biome) || T004 (Vitest) || T005 (Icons)
```

**Foundational Phase (Phase 2)**:
```bash
# Type definitions (all parallel):
T009 (ToolEntry) || T010 (MenuState) || T011 (UserPreferences) || T012 (MenuPosition) || T013 (GeneratedToolLink)

# Implementation (after types):
T014-T016 (URL generator tests + implementation)
T017-T019 (Positioning tests + implementation)
T020-T021 (Storage functions)
```

**User Story 1 (Phase 3)**:
```bash
# UI Components (parallel):
T022 (SidebarButton) || T023 (ToolDropdown)

# Styles (parallel with components):
T028 (Button CSS) || T029 (Dropdown CSS)

# Integration (sequential):
T024 → T025 → T026 → T027 → T030
```

**Cross-Story Parallelization** (if team capacity allows):
```bash
# After Foundational completes, these can start in parallel:
Phase 3 (US1) || Phase 4 (US2) || Phase 5 (US3) || Phase 6 (US4)
```

---

## Implementation Strategy

### MVP First (Recommended)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. ✅ Complete Phase 3: User Story 1 (MVP - core functionality)
4. **STOP and VALIDATE**: Load extension in Chrome, test on multiple repositories
5. Optional: Deploy MVP for early feedback

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Ready! 🎯**
3. Add User Story 2 → Test independently → Sub-path support
4. Add User Story 3 → Test independently → Better UX (dismissal)
5. Add User Story 4 → Test independently → Better UX (positioning)
6. Add Navigation & Accessibility → Production ready

### Parallel Team Strategy

With multiple developers:

1. **Team**: Complete Setup + Foundational together
2. **Once Foundational completes**:
   - Developer A: User Story 1 (T022-T030) - MVP priority
   - Developer B: User Story 2 (T031-T034) - Can work in parallel
   - Developer C: User Story 3 (T035-T039) - Can work in parallel
   - Developer D: User Story 4 (T040-T043) - Can work in parallel
3. **Merge & Integrate**: Each story should work independently
4. **Team**: Navigation + Accessibility + Production together

---

## Task Summary

- **Total Tasks**: 72
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 14 tasks (CRITICAL PATH)
- **Phase 3 (User Story 1 - MVP)**: 9 tasks ⭐
- **Phase 4 (User Story 2)**: 4 tasks
- **Phase 5 (User Story 3)**: 5 tasks
- **Phase 6 (User Story 4)**: 4 tasks
- **Phase 7 (Navigation)**: 7 tasks
- **Phase 8 (Accessibility)**: 10 tasks
- **Phase 9 (Production)**: 12 tasks

**Parallel Opportunities**: 18 tasks marked [P]

**MVP Scope**: Phases 1-3 (30 tasks) deliver core value

**Independent Stories**: Each user story (US1-US4) can be tested independently

---

## Notes

- ✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- ✅ Tasks organized by user story for independent implementation
- ✅ Each user story has clear goal and independent test criteria
- ✅ No test tasks included (tests not explicitly requested in spec, following TDD mandate for critical paths only)
- ✅ Foundation phase (Phase 2) BLOCKS all user stories - must complete first
- ✅ MVP = Phases 1-3 (Setup + Foundational + User Story 1)
- ✅ User stories can be parallelized after Foundational phase
- ✅ File paths use actual project structure from plan.md
- ✅ Native DOM approach (no React) reflected in task descriptions
- ✅ CSS isolation uses `__github-switcher` prefix (not Shadow DOM)
