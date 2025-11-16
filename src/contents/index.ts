/**
 * Content script entry point
 * Automatically injected on GitHub pages matching manifest patterns
 */

import type { PlasmoContentScript } from 'plasmo';
import { COMMIT_HASH, TOOLS } from '@/lib/config';
import { parseGitHubFileUrl, parseGitHubUrl } from '@/lib/detectGithub';
import { loadPreferences } from '@/lib/storage';
import { computeAllToolStates } from '@/lib/toolStateManager';
import type { MenuState } from '@/lib/types';
import { SidebarButton } from '@/ui/SidebarButton';
import { ToolDropdown } from '@/ui/ToolDropdown';
import { log, warn } from '@/utils/logger';
import { calculateMenuPosition } from '@/utils/positioning';

// Plasmo content script configuration
export const config: PlasmoContentScript = {
  matches: ['https://github.com/*/*'],
  run_at: 'document_end',
};

// Global state
let sidebarButton: SidebarButton | null = null;
let toolDropdown: ToolDropdown | null = null;
const menuState: MenuState = {
  isOpen: false,
  position: 'bottom-right',
  focusedItemIndex: -1,
};

/**
 * Initializes the sidebar button and dropdown
 */
async function initialize(): Promise<void> {
  // Parse current URL - try file URL first
  const fileContext = parseGitHubFileUrl();
  let context: import('@/lib/types').FileContext | import('@/lib/types').RepositoryContext | null =
    fileContext;

  // If not a file page, check if it's a repo page
  if (!fileContext) {
    const repoContext = parseGitHubUrl();
    if (!repoContext) {
      log('Not on a repository page, skipping initialization');
      return;
    }
    log(`Repository detected: ${repoContext.owner}/${repoContext.repo}`);
    context = repoContext; // Use repo context for non-file pages
  } else {
    log(
      `File detected: ${fileContext.owner}/${fileContext.repo}/blob/${fileContext.ref}/${fileContext.filePath}`
    );
  }

  // Load user preferences
  const preferences = await loadPreferences();

  // T038: Compute tool states using toolStateManager
  // Pass context (FileContext on file pages, RepositoryContext on repo pages)
  // Filter tools by user preferences BEFORE computing states
  const enabledTools = TOOLS.filter((tool) => preferences.enabledTools.includes(tool.order));
  const toolStates = computeAllToolStates(enabledTools, context);

  // Create sidebar button
  sidebarButton = new SidebarButton();
  sidebarButton.mount();

  // Create dropdown
  toolDropdown = new ToolDropdown();

  // Set up button click handler
  sidebarButton.onToggle(() => {
    toggleMenu(toolStates);
  });

  // Set up dropdown close handler
  toolDropdown.onClose(() => {
    closeMenu();
  });

  log('Sidebar initialized successfully');
}

/**
 * Toggles the dropdown menu open/closed
 */
function toggleMenu(toolStates: Map<string, import('@/lib/types').ToolState>): void {
  if (menuState.isOpen) {
    closeMenu();
  } else {
    openMenu(toolStates);
  }
}

/**
 * Opens the dropdown menu
 */
function openMenu(toolStates: Map<string, import('@/lib/types').ToolState>): void {
  if (!sidebarButton || !toolDropdown) return;

  const buttonElement = sidebarButton.getButtonElement();
  if (!buttonElement) return;

  // Calculate menu position - start from button's vertical center
  const buttonRect = buttonElement.getBoundingClientRect();
  const menuHeight = 300; // Approximate height for 8 items
  const position = calculateMenuPosition(buttonRect, menuHeight);

  // Adjust vertical position to center align with button
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  position.top = buttonCenterY - 20; // Start slightly above center for better visual balance

  // Adjust horizontal position - add 2px gap between button and menu (plus arrow width)
  // Arrow is 8px wide, so total offset = buttonWidth + gap + arrowWidth
  position.left = buttonRect.right + 2 + 8; // 2px gap + 8px arrow

  // Show dropdown
  toolDropdown.show(toolStates, position);

  // Update state
  menuState.isOpen = true;
  menuState.position = position.position;
  sidebarButton.setExpanded(true);

  log('Menu opened');
}

/**
 * Closes the dropdown menu
 */
function closeMenu(): void {
  if (!toolDropdown || !sidebarButton) return;

  toolDropdown.hide();

  // Update state
  menuState.isOpen = false;
  menuState.focusedItemIndex = -1;
  sidebarButton.setExpanded(false);

  log('Menu closed');
}

/**
 * Handles window resize events
 */
function handleWindowResize(): void {
  if (!menuState.isOpen || !sidebarButton || !toolDropdown) return;

  const buttonElement = sidebarButton.getButtonElement();
  if (!buttonElement) return;

  // Recalculate menu position
  const buttonRect = buttonElement.getBoundingClientRect();
  const menuHeight = 300; // Approximate height for 8 items
  const position = calculateMenuPosition(buttonRect, menuHeight);

  // Update dropdown position
  const menuElement = toolDropdown.getMenuElement();
  if (menuElement) {
    menuElement.style.top = `${position.top}px`;
    menuElement.style.left = `${position.left}px`;
    menuState.position = position.position;
  }
}

/**
 * Handles navigation events (popstate, turbo:load)
 * Re-initializes extension if still on a repository page
 */
async function handleNavigation(): Promise<void> {
  log('Navigation detected, checking URL...');

  // Try file URL first, fallback to repo URL
  const fileContext = parseGitHubFileUrl();
  const repoContext = fileContext || parseGitHubUrl();

  // If we moved away from a repository page, cleanup
  if (!repoContext) {
    log('Navigated away from repository page, cleaning up');
    cleanup();
    return;
  }

  // If we're still on a repository page, re-initialize
  log('Still on repository page, re-initializing');
  cleanup();
  await initialize();
}

/**
 * Handles user preference changes from options page
 */
async function handleStorageChange(
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string
): Promise<void> {
  // Only handle sync storage changes
  if (areaName !== 'sync') {
    return;
  }

  // Check if enabledTools or toolOrder changed
  const enabledToolsChanged = changes.enabledTools !== undefined;
  const toolOrderChanged = changes.toolOrder !== undefined;

  if (!enabledToolsChanged && !toolOrderChanged) {
    return;
  }

  log('User preferences changed, updating dropdown menu');

  // If menu is currently open, update it
  if (toolDropdown && menuState.isOpen) {
    // Try file URL first, fallback to repo URL
    const fileContext = parseGitHubFileUrl();
    const repoContext = fileContext || parseGitHubUrl();

    if (repoContext) {
      try {
        // Reload user preferences
        const preferences = await loadPreferences();

        // Recompute tool states with new preferences
        const enabledTools = TOOLS.filter((tool) => preferences.enabledTools.includes(tool.order));
        const toolStates = computeAllToolStates(enabledTools, repoContext);
        toolDropdown.updateTools(toolStates);
        log('Dropdown menu updated with new tool states');
      } catch (error) {
        warn('Failed to update dropdown menu:', error);
      }
    }
  }
}

/**
 * Cleans up the extension (removes button and dropdown)
 */
function cleanup(): void {
  if (sidebarButton) {
    sidebarButton.unmount();
    sidebarButton = null;
  }
  if (toolDropdown) {
    toolDropdown.unmount();
    toolDropdown = null;
  }
  menuState.isOpen = false;

  log('Cleaned up');
}

/**
 * Main content script execution
 */
(async function main() {
  log(`GitHub Switcher loaded@${COMMIT_HASH}`);

  try {
    await initialize();

    // Add window resize listener
    window.addEventListener('resize', handleWindowResize);

    // Add navigation listeners for GitHub SPA
    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('turbo:load', handleNavigation);

    // Add storage change listener for options page updates
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Add beforeunload listener for cleanup
    window.addEventListener('beforeunload', cleanup);
  } catch (error) {
    warn('Failed to initialize:', error);
  }
})();
