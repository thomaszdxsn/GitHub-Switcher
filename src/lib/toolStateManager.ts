import type { ToolEntry } from './config';
import type { FileContext, RepositoryContext, ToolState } from './types';
import { generateToolUrl } from './urlGenerator';

/**
 * 工具状态管理器：计算工具在不同页面上下文中的启用/禁用状态
 * Tool State Manager: Computes enabled/disabled state of tools based on page context
 *
 * 核心功能 Core Features:
 * - 支持文件上下文（FileContext）和仓库上下文（RepositoryContext）
 * - 根据 enableCondition 规则判断工具可用性
 * - LRU 缓存优化重复计算（最多 100 条）
 * - 大小写不敏感的文件扩展名匹配
 *
 * 使用场景 Use Cases:
 * - 文件页面: 传入 FileContext，文件相关工具（githistory, nbviewer）可启用
 * - 仓库主页: 传入 RepositoryContext，仓库级工具（GitHub.dev, DeepWiki 等）可启用
 * - 其他页面: 传入 null，只有无条件工具可启用
 *
 * @module toolStateManager
 */

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
 * @param context - 文件上下文、仓库上下文或 null File context, repository context, or null
 * @returns 工具状态 Tool state
 *
 * @example
 * const githistory = { name: 'githistory', urlTemplate: '...', enableCondition: { requiresFilePath: true } };
 * const fileContext = { owner: 'owner', repo: 'repo', ref: 'main', filePath: 'README.md', ... };
 * computeToolState(githistory, fileContext);
 * // { toolName: 'githistory', enabled: true, url: 'https://...', disabledReason: null }
 */
export function computeToolState(
  tool: ToolEntry,
  context: FileContext | RepositoryContext | null
): ToolState {
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
function computeToolStateInternal(
  tool: ToolEntry,
  context: FileContext | RepositoryContext | null
): ToolState {
  const toolName = tool.name;

  // 如果没有启用条件，总是启用 No enable condition = always enabled
  if (!tool.enableCondition) {
    // 生成 URL（支持仓库和文件上下文）Generate URL (supports both repo and file context)
    const url = context ? generateToolUrl(tool, context) : null;

    return {
      toolName,
      enabled: true,
      url,
      disabledReason: null,
    };
  }

  // 检查是否需要文件路径 Check if file path is required
  const isFileContext = context && 'filePath' in context;
  if (tool.enableCondition.requiresFilePath && !isFileContext) {
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
    if (!isFileContext) {
      return {
        toolName,
        enabled: false,
        url: null,
        disabledReason: '仅适用于文件页面',
      };
    }

    const allowedExtensions = tool.enableCondition.fileExtensions;
    const fileExtension = (context as FileContext).extension; // 已经是小写 Already lowercase

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
 * @param context - 文件上下文、仓库上下文或 null File context, repository context, or null
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
  context: FileContext | RepositoryContext | null
): Map<string, ToolState> {
  const result = new Map<string, ToolState>();

  for (const tool of tools) {
    const state = computeToolState(tool, context);
    result.set(tool.name, state);
  }

  return result;
}
