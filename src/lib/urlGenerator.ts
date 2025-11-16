import type { ToolEntry } from './config';
import type { FileContext, RepositoryContext } from './types';

/**
 * Generates a tool URL by replacing placeholders with context values
 * 支持 {owner}, {repo}, {ref}, {filepath} 占位符，并保留查询参数和哈希
 * Supports {owner}, {repo}, {ref}, {filepath} placeholders, preserves query and hash
 *
 * @param tool - Tool configuration with URL template
 * @param context - Repository or file context
 * @returns Generated URL with placeholders replaced
 *
 * @example
 * // Repository context (basic)
 * const tool = { name: 'GitHub.dev', urlTemplate: 'https://github.dev/{owner}/{repo}', order: 1 };
 * const context = { owner: 'microsoft', repo: 'vscode', currentUrl: '...' };
 * generateToolUrl(tool, context); // 'https://github.dev/microsoft/vscode'
 *
 * @example
 * // File context (with ref and filepath)
 * const tool = { name: 'githistory', urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}', order: 9 };
 * const context = { owner: 'microsoft', repo: 'vscode', ref: 'main', filePath: 'README.md', ... };
 * generateToolUrl(tool, context); // 'https://github.githistory.xyz/microsoft/vscode/blob/main/README.md'
 */
export function generateToolUrl(tool: ToolEntry, context: RepositoryContext | FileContext): string {
  let url = tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));

  // 如果是文件上下文，替换 {ref} 和 {filepath}
  // If file context, replace {ref} and {filepath} placeholders
  if ('ref' in context && 'filePath' in context) {
    // ref 需要编码（可能包含特殊字符）
    // Encode ref (may contain special characters like branch names with slashes)
    url = url.replace('{ref}', encodeURIComponent(context.ref));

    // filePath 已经是 URL 编码形式，直接使用（不进行二次编码）
    // filePath is already URL-encoded, use as-is (no double encoding)
    url = url.replace('{filepath}', context.filePath);

    // 附加查询参数和哈希（如果存在）
    // Append query and hash if present
    if (context.query) {
      url += context.query;
    }
    if (context.hash) {
      url += context.hash;
    }
  }

  return url;
}
