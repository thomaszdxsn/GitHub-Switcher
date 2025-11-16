import type { ToolEntry } from './config';
import type { FileContext, RepositoryContext, ToolState } from './types';
import { generateToolUrl } from './urlGenerator';

/**
 * LRU 缓存：存储已计算的工具状态，避免重复计算
 * LRU Cache: Stores computed tool states to avoid recomputation
 * 最多缓存 100 条记录，插入时若超限则驱逐最旧条目，无 TTL 过期
 * Max 100 entries, evicts oldest on insertion when full, no TTL expiration
 */
const stateCache = new Map<string, ToolState>();
const MAX_CACHE_SIZE = 100;

/**
 * 生成缓存键：基于工具名和当前 URL
 * Generate cache key: based on tool name and current URL
 */
function getCacheKey(toolName: string, context: FileContext | RepositoryContext | null): string {
  const url = context?.currentUrl || 'null';
  return `${toolName}:${url}`;
}

/**
 * 清除缓存（用于测试）
 * Clear cache (for testing)
 */
export function clearCache(): void {
  stateCache.clear();
}

/**
 * 计算单个工具的启用状态
 * Computes the enabled state for a single tool
 *
 * 规则说明 Logic explanation:
 * 1. 如果工具没有 enableCondition，则总是启用 No condition = always enabled
 * 2. 如果工具需要 filePath 但上下文不是文件页面，则禁用 Requires file but context is null = disabled
 * 3. 如果工具限制了扩展名且当前文件扩展名不匹配，则禁用 Extension mismatch = disabled
 * 4. 其他情况启用 Otherwise enabled
 *
 * @param tool - 工具配置 Tool configuration
 * @param context - 文件上下文或 null（仓库主页/目录页）File context or null (repo/directory page)
 * @returns 工具状态 Tool state
 *
 * @example
 * const githistory = { name: 'githistory', urlTemplate: '...', enableCondition: { requiresFilePath: true } };
 * const fileContext = { owner: 'owner', repo: 'repo', ref: 'main', filePath: 'README.md', ... };
 * computeToolState(githistory, fileContext);
 * // { toolName: 'githistory', enabled: true, url: 'https://...', disabledReason: null }
 */
export function computeToolState(tool: ToolEntry, context: FileContext | null): ToolState {
  // 检查缓存 Check cache
  const cacheKey = getCacheKey(tool.name, context);
  const cached = stateCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 计算新状态 Compute new state
  const state = computeToolStateInternal(tool, context);

  // 缓存结果（LRU 驱逐）Cache result (LRU eviction)
  if (stateCache.size >= MAX_CACHE_SIZE) {
    // 删除最旧的条目（Map 保证插入顺序）Delete oldest entry (Map maintains insertion order)
    const firstKey = stateCache.keys().next().value;
    if (firstKey) {
      stateCache.delete(firstKey);
    }
  }
  stateCache.set(cacheKey, state);

  return state;
}

/**
 * 内部函数：实际计算工具状态（无缓存）
 * Internal function: actual state computation (no caching)
 */
function computeToolStateInternal(tool: ToolEntry, context: FileContext | null): ToolState {
  const toolName = tool.name;

  // 如果没有启用条件，总是启用 No enable condition = always enabled
  if (!tool.enableCondition) {
    // 尝试生成 URL Try to generate URL
    let url: string | null = null;
    if (context) {
      // 对于无 enableCondition 的工具，使用 RepositoryContext 生成 URL
      // For tools without enableCondition, use RepositoryContext to generate URL
      const repoContext: RepositoryContext = {
        owner: context.owner,
        repo: context.repo,
        currentUrl: context.currentUrl,
      };
      url = generateToolUrl(tool, repoContext);
    }

    return {
      toolName,
      enabled: true,
      url,
      disabledReason: null,
    };
  }

  // 检查是否需要文件路径 Check if file path is required
  if (tool.enableCondition.requiresFilePath && !context) {
    return {
      toolName,
      enabled: false,
      url: null,
      disabledReason: '仅适用于文件页面',
    };
  }

  // 检查扩展名限制 Check file extension restrictions
  if (tool.enableCondition.fileExtensions && tool.enableCondition.fileExtensions.length > 0) {
    // 有扩展名限制 Has extension restrictions
    if (!context) {
      return {
        toolName,
        enabled: false,
        url: null,
        disabledReason: '仅适用于文件页面',
      };
    }

    const allowedExtensions = tool.enableCondition.fileExtensions;
    const fileExtension = context.extension; // 已经是小写 Already lowercase

    if (!allowedExtensions.includes(fileExtension)) {
      // 扩展名不匹配 Extension mismatch
      const extensionList = allowedExtensions.map((ext) => `.${ext}`).join(', ');
      return {
        toolName,
        enabled: false,
        url: null,
        disabledReason: `仅适用于 ${extensionList} 文件`,
      };
    }
  }

  // 所有条件满足，启用工具 All conditions met, enable tool
  const url = context ? generateToolUrl(tool, context) : null;
  return {
    toolName,
    enabled: true,
    url,
    disabledReason: null,
  };
}

/**
 * 批量计算所有工具的状态
 * Computes states for all tools
 *
 * @param tools - 工具配置列表 List of tool configurations
 * @param context - 文件上下文或 null File context or null
 * @returns Map<工具名, 工具状态> Map of tool name to tool state
 *
 * @example
 * const tools = [{ name: 'githistory', ... }, { name: 'nbviewer', ... }];
 * const fileContext = { owner: 'owner', repo: 'repo', ref: 'main', filePath: 'notebook.ipynb', extension: 'ipynb', ... };
 * const states = computeAllToolStates(tools, fileContext);
 * states.get('githistory'); // { enabled: true, ... }
 * states.get('nbviewer'); // { enabled: true, ... }
 */
export function computeAllToolStates(
  tools: readonly ToolEntry[],
  context: FileContext | null
): Map<string, ToolState> {
  const result = new Map<string, ToolState>();

  for (const tool of tools) {
    const state = computeToolState(tool, context);
    result.set(tool.name, state);
  }

  return result;
}
