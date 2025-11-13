/**
 * Type definitions for GitHub-Switcher extension
 */

/**
 * Result of GitHub page detection
 */
export interface GitHubDetectionResult {
  /** Whether the current page is a GitHub page */
  isGitHub: boolean;
  /** Current page hostname */
  hostname: string;
  /** Current page pathname */
  pathname: string;
}

/**
 * Repository context extracted from GitHub URL
 * @example { owner: 'microsoft', repo: 'vscode', currentUrl: 'https://github.com/microsoft/vscode/blob/main/README.md' }
 */
export interface RepositoryContext {
  /** GitHub username or organization name (max 39 chars, no slashes) */
  owner: string;

  /** Repository name (max 100 chars, no slashes) */
  repo: string;

  /** Full URL of the current GitHub page */
  currentUrl: string;
}

/**
 * UI state for the dropdown menu
 */
export interface MenuState {
  /** Whether the menu is currently visible */
  isOpen: boolean;

  /** Menu positioning strategy */
  position: 'bottom-right' | 'top-right';

  /** Current keyboard navigation index (-1 = no focus) */
  focusedItemIndex: number;
}

/**
 * User preferences stored in chrome.storage.sync
 */
export interface UserPreferences {
  /** Whether to open tool links in new tab (default: true per FR-008) */
  openInNewTab: boolean;

  /** List of enabled tool order numbers (default: all enabled) */
  enabledTools: number[];
}

/**
 * Calculated menu position with coordinates
 */
export interface MenuPosition {
  /** Absolute top position in pixels */
  top: number;

  /** Absolute left position in pixels */
  left: number;

  /** Positioning strategy used */
  position: 'bottom-right' | 'top-right';
}

/**
 * Tool with generated URL for current repository
 */
export interface GeneratedToolLink {
  /** Tool configuration */
  tool: import('./config').ToolEntry;

  /** Generated absolute URL */
  url: string;

  /** Whether this tool is enabled in user preferences */
  enabled: boolean;
}

/**
 * Log message structure
 */
export interface LogMessage {
  /** Log level */
  level: 'info' | 'warn' | 'error';
  /** Log message content */
  message: string;
  /** Timestamp when message was created */
  timestamp: number;
}
