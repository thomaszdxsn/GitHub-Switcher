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

  /** Custom tool order (optional, defaults to TOOLS array order 1-9) */
  toolOrder?: number[];
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

/**
 * 文件上下文：从 GitHub URL 解析出的文件页面信息
 * File context parsed from GitHub URL for file pages
 * @example { owner: 'microsoft', repo: 'vscode', ref: 'main', filePath: 'src/index.ts', extension: 'ts', query: '?plain=1', hash: '#L20', currentUrl: '...' }
 */
export interface FileContext {
  /** 仓库所有者（用户名或组织名） Repository owner (username or organization) */
  owner: string;

  /** 仓库名称 Repository name */
  repo: string;

  /** Git 引用（分支/标签/commit hash） Git reference (branch/tag/commit) */
  ref: string;

  /** 文件路径（相对于仓库根目录，保留 URL 编码） File path relative to repo root (URL-encoded) */
  filePath: string;

  /** 文件扩展名（小写，不含点号） File extension (lowercase, without dot) */
  extension: string;

  /** URL 查询字符串（含 ?） URL query string (with ?) */
  query: string | null;

  /** URL 哈希片段（含 #） URL hash fragment (with #) */
  hash: string | null;

  /** 完整 GitHub URL Full GitHub URL */
  currentUrl: string;
}

/**
 * 工具状态：单个工具在特定文件上下文下的启用状态
 * Tool state: enabled/disabled status for a tool in specific file context
 */
export interface ToolState {
  /** 工具名称（唯一标识） Tool name (unique identifier) */
  toolName: string;

  /** 是否启用 Whether the tool is enabled */
  enabled: boolean;

  /** 生成的目标 URL（仅在 enabled=true 时有值） Generated target URL (only when enabled) */
  url: string | null;

  /** 禁用原因（仅在 enabled=false 时有值） Reason for being disabled (only when disabled) */
  disabledReason: string | null;
}

/**
 * 工具启用条件：声明式描述工具可用范围
 * Tool enable condition: declarative definition of tool availability
 */
export interface ToolEnableCondition {
  /** 是否需要文件路径（区分文件页面 vs 仓库主页） Whether file path is required */
  requiresFilePath?: boolean;

  /** 支持的文件扩展名列表（小写，不含点号）；空数组表示支持所有扩展名 Supported file extensions (lowercase, no dot); empty = all */
  fileExtensions?: string[];
}
