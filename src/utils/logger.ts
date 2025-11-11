/**
 * Centralized logging utility for the extension
 * All log messages are prefixed with [GitHub-Switcher]
 */

const PREFIX = '[GitHub-Switcher]';

/**
 * Format additional arguments for logging
 */
function formatArgs(args: unknown[]): string {
  if (args.length === 0) return '';
  try {
    return ` ${args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')}`;
  } catch (_error) {
    return ' [Error stringifying arguments]';
  }
}

/**
 * Log an info message
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function log(message: string, ...args: unknown[]): void {
  // biome-ignore lint/suspicious/noConsole: Logger utility requires console
  console.log(PREFIX, message + formatArgs(args));
}

/**
 * Log a warning message
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function warn(message: string, ...args: unknown[]): void {
  // biome-ignore lint/suspicious/noConsole: Logger utility requires console
  console.warn(PREFIX, message + formatArgs(args));
}

/**
 * Log an error message
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function error(message: string, ...args: unknown[]): void {
  // biome-ignore lint/suspicious/noConsole: Logger utility requires console
  console.error(PREFIX, message + formatArgs(args));
}
