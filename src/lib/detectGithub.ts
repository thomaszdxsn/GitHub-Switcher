import type { FileContext, GitHubDetectionResult, RepositoryContext } from './types';

/**
 * Detects if the current page is a GitHub page
 * Checks if the hostname matches github.com or its subdomains
 *
 * @returns Detection result with URL details
 *
 * @example
 * const result = isGitHubPage();
 * if (result.isGitHub) {
 *   console.log('On GitHub:', result.pathname);
 * }
 */
export function isGitHubPage(): GitHubDetectionResult {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Check if hostname is github.com or a subdomain of github.com
  const isGitHub = hostname === 'github.com' || hostname.endsWith('.github.com');

  return {
    isGitHub,
    hostname,
    pathname,
  };
}

/**
 * Parses GitHub URL to extract repository context
 * Supports repository URLs and sub-paths (files, PRs, issues, etc.)
 *
 * @param url - GitHub URL to parse (defaults to current page URL)
 * @returns Repository context if valid repo URL, null otherwise
 *
 * @example
 * parseGitHubUrl('https://github.com/microsoft/vscode');
 * // { owner: 'microsoft', repo: 'vscode', currentUrl: '...' }
 *
 * parseGitHubUrl('https://github.com/microsoft/vscode/blob/main/README.md');
 * // { owner: 'microsoft', repo: 'vscode', currentUrl: '...' }
 *
 * parseGitHubUrl('https://github.com/explore');
 * // null (not a repo URL)
 */
export function parseGitHubUrl(url: string = window.location.href): RepositoryContext | null {
  // Pattern matches: https://github.com/{owner}/{repo}(/...)?
  const pattern = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)(\/.*)?$/;
  const match = url.match(pattern);

  if (!match) {
    return null;
  }

  const owner = match[2];
  const repo = match[3];

  // Validate owner and repo (basic checks)
  if (!owner || !repo || owner.length > 39 || repo.length > 100) {
    return null;
  }

  return {
    owner,
    repo,
    currentUrl: url,
  };
}

/**
 * 解析 GitHub 文件 URL，提取文件上下文信息
 * Parses GitHub file URL to extract file context
 * 仅匹配 blob 路径（文件页面），不匹配 tree（目录）或其他页面类型
 * Only matches blob paths (file pages), not tree (directories) or other page types
 *
 * @param url - GitHub file URL to parse (defaults to current page URL)
 * @returns File context if valid file URL, null otherwise
 *
 * @example
 * parseGitHubFileUrl('https://github.com/owner/repo/blob/main/README.md');
 * // { owner: 'owner', repo: 'repo', ref: 'main', filePath: 'README.md', extension: 'md', ... }
 *
 * parseGitHubFileUrl('https://github.com/owner/repo/tree/main/src');
 * // null (目录页面，非文件)
 *
 * parseGitHubFileUrl('https://github.com/owner/repo');
 * // null (仓库主页，非文件)
 */
export function parseGitHubFileUrl(url: string = window.location.href): FileContext | null {
  // 匹配模式: https://github.com/{owner}/{repo}/blob/{ref}/{filepath}
  // Pattern matches file pages only (blob, not tree)
  const pattern = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
  const match = url.match(pattern);

  if (!match) {
    return null;
  }

  const owner = match[2];
  const repo = match[3];
  const ref = match[4];
  let filePath = match[5];

  // 提取查询参数和哈希片段 Extract query and hash
  const urlObj = new URL(url);
  const query = urlObj.search || null;
  const hash = urlObj.hash || null;

  // 从 filePath 中移除查询参数和哈希 Remove query and hash from filePath
  filePath = filePath.split('?')[0].split('#')[0];

  // 提取扩展名（最后一个点号之后的部分，转为小写）
  // Extract extension (part after last dot, lowercase)
  const fileName = filePath.split('/').pop() || '';
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1).toLowerCase() : '';

  return {
    owner,
    repo,
    ref,
    filePath,
    extension,
    query,
    hash,
    currentUrl: url,
  };
}
