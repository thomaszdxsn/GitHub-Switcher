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

/**
 * Feature flags for the extension
 */
export interface FeatureFlags {
  /** Whether DOM injection is enabled */
  ENABLE_INJECT: boolean;
}
