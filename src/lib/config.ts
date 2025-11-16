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

  /** Display order in dropdown (1-9) */
  order: number;

  /** Path to the tool's 16x16 icon (relative to assets/) */
  iconPath: string;

  /** Optional usage note (e.g., "optimal for .ipynb files") */
  note?: string;

  /** 启用条件：定义工具在何种页面类型下可用 Enable condition: defines when tool is available */
  enableCondition?: import('./types').ToolEnableCondition;
}

/**
 * Static configuration of supported tools (9 tools)
 * Ordered by display order in dropdown menu
 */
export const TOOLS: readonly ToolEntry[] = [
  {
    name: 'GitHub.dev',
    urlTemplate: 'https://github.dev/{owner}/{repo}',
    order: 1,
    iconPath: 'logo/github.dev-16x16.png',
  },
  {
    name: 'DeepWiki',
    urlTemplate: 'https://deepwiki.com/{owner}/{repo}',
    order: 2,
    iconPath: 'logo/deepwiki-16x16.png',
  },
  {
    name: 'CodeWiki',
    urlTemplate: 'https://codewiki.google/{owner}/{repo}',
    order: 3,
    iconPath: 'logo/codewiki-16x16.png',
  },
  {
    name: 'CodeSandbox',
    urlTemplate: 'https://githubbox.com/{owner}/{repo}',
    order: 4,
    iconPath: 'logo/codesandbox-16x16.png',
  },
  {
    name: 'StackBlitz',
    urlTemplate: 'https://stackblitz.com/github/{owner}/{repo}',
    order: 5,
    iconPath: 'logo/stackblitz-16x16.png',
  },
  {
    name: 'nbviewer',
    urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
    order: 6,
    iconPath: 'logo/nbviewer.org-16x16.png',
    note: 'optimal for .ipynb files',
    enableCondition: {
      requiresFilePath: true,
      fileExtensions: ['ipynb'], // 仅支持 Jupyter Notebook 文件 Only .ipynb files
    },
  },
  {
    name: 'gitdiagram',
    urlTemplate: 'https://gitdiagram.com/{owner}/{repo}',
    order: 7,
    iconPath: 'logo/gitdiagram.com-16x16.png',
  },
  {
    name: 'gitingest',
    urlTemplate: 'https://gitingest.com/{owner}/{repo}',
    order: 8,
    iconPath: 'logo/gitingest-16x16.png',
  },
  {
    name: 'githistory',
    urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
    order: 9,
    iconPath: 'logo/githistory-16x16.png',
    note: 'optimal for file/folder paths',
    enableCondition: {
      requiresFilePath: true,
      fileExtensions: [], // 空数组 = 支持所有文件扩展名 Empty array = all file extensions supported
    },
  },
] as const;
