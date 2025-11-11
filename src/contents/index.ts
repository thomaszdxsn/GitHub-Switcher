/**
 * Content script entry point
 * Automatically injected on GitHub pages matching manifest patterns
 */

import { COMMIT_HASH, ENABLE_INJECT } from '@/lib/config';
import { isGitHubPage } from '@/lib/detectGithub';
import { log, warn } from '@/utils/logger';

/**
 * Main content script execution
 */
(async function main() {
  // Log extension loading
  log(`content loaded@${COMMIT_HASH}`);

  // Detect GitHub page
  const detection = isGitHubPage();
  if (!detection.isGitHub) {
    warn('Not on GitHub page, exiting');
    return;
  }

  log('GitHub page detected:', detection.pathname);

  // Check feature flag for DOM injection
  if (ENABLE_INJECT) {
    log('Injection enabled (future implementation)');
    // Future: DOM manipulation, button creation, etc.
  } else {
    log('Injection disabled by feature flag');
  }
})();
