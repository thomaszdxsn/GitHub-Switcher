/**
 * Tool icons encoded as base64 data URLs
 * Generated from 16x16 PNG files in assets/logo/
 */

import codesandboxIcon from 'data-base64:~assets/logo/codesandbox-16x16.png';
import codewikiIcon from 'data-base64:~assets/logo/codewiki-16x16.png';
import deepwikiIcon from 'data-base64:~assets/logo/deepwiki-16x16.png';
import gitdiagramIcon from 'data-base64:~assets/logo/gitdiagram.com-16x16.png';
import githistoryIcon from 'data-base64:~assets/logo/githistory-16x16.png';
import githubDevIcon from 'data-base64:~assets/logo/github.dev-16x16.png';
import gitingestIcon from 'data-base64:~assets/logo/gitingest-16x16.png';
import nbviewerIcon from 'data-base64:~assets/logo/nbviewer.org-16x16.png';
import stackblitzIcon from 'data-base64:~assets/logo/stackblitz-16x16.png';

/**
 * Map of tool names to their icon data URLs
 */
export const TOOL_ICONS: Record<string, string> = {
  'GitHub.dev': githubDevIcon,
  DeepWiki: deepwikiIcon,
  CodeWiki: codewikiIcon,
  CodeSandbox: codesandboxIcon,
  StackBlitz: stackblitzIcon,
  nbviewer: nbviewerIcon,
  gitdiagram: gitdiagramIcon,
  gitingest: gitingestIcon,
  githistory: githistoryIcon,
};
