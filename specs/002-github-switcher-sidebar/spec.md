# Feature Specification: GitHub Switcher Sidebar

**Feature Branch**: `002-github-switcher-sidebar`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "GitHub Switcher - 在GitHub页面注入侧边栏工具切换器"

## Clarifications

### Session 2025-11-12

- Q: Where should the "GitHub External Tools" list be defined and maintained? → A: Static configuration with specific tool list: GitHub.dev, DeepWiki, CodeSandbox, StackBlitz, nbviewer, gitdiagram, gitingest, githistory (in this order)
- Q: How should tools be ordered in the dropdown menu? → A: Display in the specific order provided in the external tools list
- Q: How should keyboard users navigate the menu? → A: Use default browser accessibility logic with tab key navigation between menu items
- Q: Should the button be always visible or appear on hover? → A: Button always visible when URL matches repository pattern; menu opens on click and closes when clicking elsewhere
- Q: What if there are 50+ tools in the list? → A: No performance optimization needed; tool count will remain small

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Tool Access from Repository Page (Priority: P1)

As a GitHub user viewing a repository, I want to quickly access third-party tools for that repository without manually editing URLs, so that I can analyze, explore, or work with the repository using my preferred tools.

**Why this priority**: This is the core value proposition - reducing manual URL manipulation and errors when accessing third-party tools. This story delivers immediate value by making the most common workflow (accessing tools from repo root) effortless.

**Independent Test**: Can be fully tested by navigating to any GitHub repository (e.g., `https://github.com/microsoft/vscode`), clicking the sidebar sidebar button, selecting a tool from the dropdown menu, and verifying that a new tab opens with the correct tool URL pointing to the same repository.

**Acceptance Scenarios**:

1. **Given** I am viewing `https://github.com/microsoft/vscode`, **When** I see the page, **Then** a vertical sidebar button appears on the left side of the page with English text (e.g., "Switcher" or "Open with…")
2. **Given** the sidebar button is visible, **When** I click it, **Then** a dropdown menu appears showing a list of third-party tools as text-only menu items
3. **Given** the dropdown menu is open, **When** I click on "deepwiki", **Then** a new browser tab opens to `https://deepwiki.com/microsoft/vscode` and the dropdown menu closes
4. **Given** the dropdown menu is open, **When** I click on any menu item, **Then** the selected tool opens in a new tab with the correct repository path and the original GitHub page remains unchanged

---

### User Story 2 - Access Tools from Repository Sub-paths (Priority: P2)

As a GitHub user viewing specific files or paths within a repository, I want to access third-party tools for the repository without navigating back to the root, so that I can maintain my current context while using external tools.

**Why this priority**: This extends the core functionality to work anywhere within a repository, not just the root page. While important, it's secondary to the basic root-level access.

**Independent Test**: Can be tested independently by navigating to a sub-path (e.g., `https://github.com/microsoft/vscode/blob/main/src/vs/editor/editor.api.ts`), verifying the sidebar button appears, clicking it, selecting a tool, and confirming the tool opens with the repository root path (not the file path).

**Acceptance Scenarios**:

1. **Given** I am viewing `https://github.com/owner/repo/blob/main/path/file.ts`, **When** the page loads, **Then** the sidebar button appears on the left side
2. **Given** the sidebar button is visible on a sub-path page, **When** I click it and select a tool, **Then** the tool opens to `https://[tool-domain]/owner/repo` (repository level only, ignoring the file path)
3. **Given** I am viewing any valid repository URL pattern `https://github.com/{owner}/{repo}/*`, **When** I interact with the switcher, **Then** it behaves identically to the repository root page

---

### User Story 3 - Dismiss Dropdown Menu (Priority: P3)

As a GitHub user with the dropdown menu open, I want to close it easily by clicking elsewhere or re-clicking the sidebar button, so that the menu doesn't obstruct my view when I don't need it.

**Why this priority**: This is a usability enhancement for the menu interaction. While important for good UX, the feature is still functional without sophisticated close behaviors.

**Independent Test**: Can be tested by opening the dropdown menu and verifying it closes when: (a) clicking anywhere outside the menu area, or (b) clicking the sidebar button again.

**Acceptance Scenarios**:

1. **Given** the dropdown menu is open, **When** I click on any area of the GitHub page outside the menu, **Then** the menu closes
2. **Given** the dropdown menu is open, **When** I click the sidebar button again, **Then** the menu closes
3. **Given** the dropdown menu is closed, **When** I click the sidebar button, **Then** the menu opens

---

### User Story 4 - Smart Menu Positioning (Priority: P3)

As a GitHub user with limited viewport space, I want the dropdown menu to position itself intelligently, so that it remains fully visible regardless of scroll position or window size.

**Why this priority**: This is a polish feature that improves the experience in edge cases but isn't critical for core functionality.

**Independent Test**: Can be tested by resizing the browser window to different heights, scrolling to different positions, and verifying the menu always appears fully within the viewport (preferably to the bottom-right, falling back to top-right when needed).

**Acceptance Scenarios**:

1. **Given** the sidebar button is near the top of the viewport with sufficient space below, **When** I click it, **Then** the dropdown menu appears to the bottom-right of the button
2. **Given** the sidebar button is near the bottom of the viewport with insufficient space below, **When** I click it, **Then** the dropdown menu appears to the top-right of the button
3. **Given** any viewport size and scroll position, **When** the menu is displayed, **Then** it is fully visible within the viewport without requiring scrolling

---

### Edge Cases

- What happens when the URL is `https://github.com/owner` (no repository)?
  - The sidebar button does NOT appear (no repository context)
  
- What happens when the URL is `https://github.com/explore` or other non-repository pages?
  - The sidebar button does NOT appear
  
- What happens when the user is on a repository URL that matches the pattern `https://github.com/{owner}/{repo}` but the repository doesn't exist?
  - The sidebar button still appears (URL pattern validation only, not API verification)
  
- What happens when a third-party tool site is down or unreachable?
  - This is outside the scope; the extension simply opens the URL in a new tab. Any errors are handled by the external site.
  
- What happens during client-side navigation (single-page app style) between repositories on GitHub?
  - The extension must listen to navigation events (pushState/popstate) and re-evaluate whether to show/hide the sidebar button based on the new URL

- What happens when a user selects nbviewer on a non-`.ipynb` file or githistory on a repository root?
  - All tools are always available in the menu regardless of current path or file type. Usage notes indicate optimal use cases but do not restrict availability.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a vertical sidebar button on the left side of the page when the current URL matches the pattern `^https?://(www\.)?github\.com/[^/]+/[^/]+(/.*)?$`
- **FR-002**: System MUST NOT display the sidebar button when the URL does not match the repository pattern (e.g., `github.com/explore`, `github.com/owner`)
- **FR-003**: System MUST parse the current GitHub URL to extract `{owner}` and `{repo}` components, ignoring any subsequent path segments
- **FR-004**: System MUST display a dropdown menu containing third-party tool options when the sidebar button is clicked
- **FR-005**: System MUST populate the dropdown menu with exactly these tools in order: (1) GitHub.dev, (2) DeepWiki, (3) CodeWiki, (4) CodeSandbox, (5) StackBlitz, (6) nbviewer, (7) gitdiagram, (8) gitingest, (9) githistory
- **FR-006**: System MUST display tool names as text-only menu items (no icons or logos)
- **FR-007**: System MUST generate tool URLs using these templates:
  - GitHub.dev: `github.dev/{owner}/{repo}`
  - DeepWiki: `deepwiki.com/{owner}/{repo}`
  - CodeWiki: `codewiki.google/{owner}/{repo}`
  - CodeSandbox: `githubbox.com/{owner}/{repo}`
  - StackBlitz: `stackblitz.com/github/{owner}/{repo}`
  - nbviewer: `nbviewer.org/github/{owner}/{repo}` (note: optimal for .ipynb files)
  - gitdiagram: `gitdiagram.com/{owner}/{repo}`
  - gitingest: `gitingest.com/{owner}/{repo}`
  - githistory: `github.githistory.xyz/{owner}/{repo}` (note: optimal for file/folder paths)
- **FR-008**: System MUST open selected tool URLs in a new browser tab using `target="_blank"` or equivalent
- **FR-009**: System MUST keep the current GitHub page open and unchanged after opening a tool in a new tab
- **FR-010**: System MUST close the dropdown menu after a tool is selected
- **FR-011**: System MUST close the dropdown menu when the user clicks anywhere outside the menu area
- **FR-012**: System MUST toggle the dropdown menu (close if open, open if closed) when the sidebar button is clicked
- **FR-013**: System MUST position the dropdown menu to the bottom-right of the sidebar button by default
- **FR-014**: System MUST reposition the dropdown menu to the top-right of the sidebar button when insufficient space exists below
- **FR-015**: System MUST ensure the dropdown menu remains fully visible within the viewport
- **FR-016**: System MUST use English text for all UI elements (button label and menu items)
- **FR-017**: System MUST apply unique CSS class prefixes to avoid style conflicts with GitHub's existing styles
- **FR-018**: System MUST use semantic HTML attributes (e.g., `role="button"`, `role="menu"`, `role="menuitem"`, `aria-expanded`, `aria-controls`) for accessibility
- **FR-019**: System MUST monitor client-side navigation events and update button visibility based on URL changes
- **FR-020**: System MUST position the sidebar button to utilize GitHub's existing whitespace/padding areas to minimize obstruction of content (30px width, minimal opacity until hover)
- **FR-021**: System MUST keep the sidebar button persistently visible (not on hover) when on a valid repository URL
- **FR-022**: System MUST support keyboard navigation through menu items using the Tab key following default browser accessibility behavior

### Key Entities

- **Repository Context**: Represents the current GitHub repository being viewed, consisting of:
  - `owner`: The GitHub username or organization name
  - `repo`: The repository name
  - `currentUrl`: The full URL of the current page
  
- **Tool Entry**: Represents a third-party tool option, consisting of:
  - `name`: Display name of the tool (English text)
  - `urlTemplate`: URL pattern with `{owner}` and `{repo}` placeholders
  - `order`: Display order in dropdown (1-9)
  - `note`: Optional usage note (e.g., "optimal for .ipynb files")
  - Supported tools (in display order):
    1. GitHub.dev - `https://github.dev/{owner}/{repo}`
    2. DeepWiki - `https://deepwiki.com/{owner}/{repo}`
    3. CodeWiki - `https://codewiki.google/{owner}/{repo}`
    4. CodeSandbox - `https://githubbox.com/{owner}/{repo}`
    5. StackBlitz - `https://stackblitz.com/github/{owner}/{repo}`
    6. nbviewer - `https://nbviewer.org/github/{owner}/{repo}` (optimal for .ipynb files)
    7. gitdiagram - `https://gitdiagram.com/{owner}/{repo}`
    8. gitingest - `https://gitingest.com/{owner}/{repo}`
    9. githistory - `https://github.githistory.xyz/{owner}/{repo}` (optimal for file/folder paths)
  
- **Dropdown Menu State**: Represents the current UI state, consisting of:
  - `isOpen`: Boolean indicating whether menu is visible
  - `position`: "bottom-right" or "top-right" based on available space
  - `focusedItemIndex`: Current keyboard navigation position (for accessibility)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access any third-party tool from a GitHub repository page with exactly 2 clicks (one to open menu, one to select tool)
- **SC-002**: The sidebar button appears within 500ms of page load or navigation on any valid GitHub repository URL
- **SC-003**: Tool URLs are correctly generated with proper `{owner}` and `{repo}` substitution for 100% of supported tools
- **SC-004**: The dropdown menu remains fully visible within the viewport in 100% of positioning scenarios (various window sizes and scroll positions)
- **SC-005**: The extension does not obstruct GitHub's primary content areas or interfere with existing GitHub functionality
- **SC-006**: Users can dismiss the dropdown menu through any of the defined interaction patterns (outside click, button re-click, or tool selection)
- **SC-007**: Screen readers can navigate and activate all UI components through keyboard and semantic markup
- **SC-008**: The feature works correctly across client-side navigation between different repositories without page reload
