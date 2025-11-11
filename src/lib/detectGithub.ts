import type { GitHubDetectionResult } from './types';

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
