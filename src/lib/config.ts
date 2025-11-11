/**
 * Global configuration and feature flags
 * Values are injected at build time from environment variables
 */

/**
 * Git commit hash for version tracking
 * Injected at build time, defaults to 'dev' in development
 */
export const COMMIT_HASH = process.env.PLASMO_PUBLIC_COMMIT_HASH || 'dev';

/**
 * Whether the extension is running in development mode
 */
export const IS_DEV = process.env.NODE_ENV === 'development';
