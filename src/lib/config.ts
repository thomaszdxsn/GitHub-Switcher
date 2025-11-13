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

/**
 * Configuration for a third-party tool
 */
export interface ToolEntry {
  /** Display name in the dropdown menu (English) */
  name: string;

  /** URL template with {owner} and {repo} placeholders */
  urlTemplate: string;

  /** Display order in dropdown (1-8) */
  order: number;

  /** Optional usage note (e.g., "optimal for .ipynb files") */
  note?: string;
}

/**
 * Static configuration of supported tools (8 tools)
 * Ordered by display order in dropdown menu
 */
export const TOOLS: readonly ToolEntry[] = [
  {
    name: 'GitHub.dev',
    urlTemplate: 'https://github.dev/{owner}/{repo}',
    order: 1,
  },
  {
    name: 'DeepWiki',
    urlTemplate: 'https://deepwiki.com/{owner}/{repo}',
    order: 2,
  },
  {
    name: 'CodeSandbox',
    urlTemplate: 'https://githubbox.com/{owner}/{repo}',
    order: 3,
  },
  {
    name: 'StackBlitz',
    urlTemplate: 'https://stackblitz.com/github/{owner}/{repo}',
    order: 4,
  },
  {
    name: 'nbviewer',
    urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}',
    order: 5,
    note: 'optimal for .ipynb files',
  },
  {
    name: 'gitdiagram',
    urlTemplate: 'https://gitdiagram.com/{owner}/{repo}',
    order: 6,
  },
  {
    name: 'gitingest',
    urlTemplate: 'https://gitingest.com/{owner}/{repo}',
    order: 7,
  },
  {
    name: 'githistory',
    urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}',
    order: 8,
    note: 'optimal for file/folder paths',
  },
] as const;
