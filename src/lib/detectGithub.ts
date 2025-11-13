import type { GitHubDetectionResult, RepositoryContext } from './types';

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
