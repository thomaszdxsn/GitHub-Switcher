import type { ToolEntry } from './config';
import type { RepositoryContext } from './types';

/**
 * Generates a tool URL by replacing {owner} and {repo} placeholders
 * with values from the repository context
 *
 * @param tool - Tool configuration with URL template
 * @param context - Repository context with owner and repo
 * @returns Generated URL with placeholders replaced and encoded
 *
 * @example
 * const tool = { name: 'GitHub.dev', urlTemplate: 'https://github.dev/{owner}/{repo}', order: 1 };
 * const context = { owner: 'microsoft', repo: 'vscode', currentUrl: '...' };
 * generateToolUrl(tool, context); // 'https://github.dev/microsoft/vscode'
 */
export function generateToolUrl(tool: ToolEntry, context: RepositoryContext): string {
  return tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));
}
