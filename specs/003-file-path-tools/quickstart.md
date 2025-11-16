# 快速开发指南：针对 GitHub 文件路径点亮工具菜单

**功能**: 003-file-path-tools  
**日期**: 2025-11-16  
**目的**: 为开发者提供快速上手指南，包括开发环境设置、核心模块说明和测试策略

---

## 开发环境设置

### 前置要求

- **Node.js**: ≥18.0.0
- **pnpm**: 9.5.0（项目使用 pnpm 作为包管理器）
- **浏览器**: Chrome/Edge/Brave（Manifest V3 支持）
- **编辑器**: VS Code（推荐，已配置 TypeScript 和 Biome）

### 初始化步骤

```bash
# 1. 克隆仓库并切换到功能分支
git clone https://github.com/thomaszdxsn/GitHub-Switcher.git
cd GitHub-Switcher
git checkout 003-file-path-tools

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器（带热重载）
pnpm dev

# 4. 在浏览器中加载扩展
# Chrome: 打开 chrome://extensions/
# 启用"开发者模式" -> 点击"加载已解压的扩展程序"
# 选择 build/chrome-mv3-dev/ 目录
```

### 开发工具

```bash
# 类型检查
pnpm typecheck

# 代码格式化
pnpm format

# 代码检查
pnpm lint
pnpm lint:fix

# 运行测试
pnpm test
pnpm test:watch        # 监听模式
pnpm test:coverage     # 覆盖率报告
```

---

## 核心模块说明

### 1. 文件路径解析（`src/lib/detectGithub.ts`）

**功能**: 解析 GitHub URL，提取文件上下文信息

**关键函数**:

```typescript
/**
 * 解析 GitHub 文件 URL（新增函数）
 * @param url - GitHub 文件页面 URL
 * @returns FileContext 或 null（非文件页面）
 */
export function parseGitHubFileUrl(url: string = window.location.href): FileContext | null {
  // 匹配模式: https://github.com/{owner}/{repo}/blob/{ref}/{filepath}
  const pattern = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
  const match = url.match(pattern);
  
  if (!match) return null;
  
  const [, owner, repo, ref, filePath] = match;
  
  // 提取扩展名（小写，不含点号）
  const extension = filePath.split('/').pop()?.split('.').pop()?.toLowerCase() || '';
  
  // 提取查询参数和哈希
  const urlObj = new URL(url);
  const query = urlObj.search || null;
  const hash = urlObj.hash || null;
  
  return {
    owner,
    repo,
    ref,
    filePath: filePath.split('?')[0].split('#')[0],  // 移除查询和哈希
    extension,
    query,
    hash,
    currentUrl: url,
  };
}
```

**测试示例**:

```typescript
// tests/unit/detectGithub.test.ts
describe('parseGitHubFileUrl', () => {
  it('应正确解析标准文件 URL', () => {
    const url = 'https://github.com/owner/repo/blob/main/README.md';
    const result = parseGitHubFileUrl(url);
    
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
      filePath: 'README.md',
      extension: 'md',
      query: null,
      hash: null,
      currentUrl: url,
    });
  });
  
  it('应拒绝目录 URL', () => {
    const url = 'https://github.com/owner/repo/tree/main/src';
    expect(parseGitHubFileUrl(url)).toBeNull();
  });
});
```

---

### 2. 工具状态管理器（`src/lib/toolStateManager.ts`）【新增】

**功能**: 计算工具启用状态的核心逻辑

**接口定义**:

```typescript
export interface IToolStateManager {
  computeToolState(tool: ToolEntry, context: FileContext | null): ToolState;
  computeAllToolStates(context: FileContext | null): Map<string, ToolState>;
}
```

**实现示例**:

```typescript
export class ToolStateManager implements IToolStateManager {
  private cache = new Map<string, Map<string, ToolState>>();
  
  /**
   * 计算单个工具的状态（纯函数）
   */
  public computeToolState(tool: ToolEntry, context: FileContext | null): ToolState {
    // 如果没有启用条件，工具始终启用
    if (!tool.enableCondition) {
      return {
        toolName: tool.name,
        enabled: true,
        url: this.generateUrl(tool, context),
        disabledReason: null,
      };
    }
    
    const { requiresFilePath, fileExtensions } = tool.enableCondition;
    
    // 需要文件路径但未提供 -> 禁用
    if (requiresFilePath && !context) {
      return {
        toolName: tool.name,
        enabled: false,
        url: null,
        disabledReason: '仅适用于文件页面',
      };
    }
    
    // 检查扩展名限制
    if (context && fileExtensions && fileExtensions.length > 0) {
      const matchesExtension = fileExtensions.includes(context.extension);
      if (!matchesExtension) {
        return {
          toolName: tool.name,
          enabled: false,
          url: null,
          disabledReason: `仅适用于 ${fileExtensions.map(e => '.' + e).join(', ')} 文件`,
        };
      }
    }
    
    // 所有条件满足 -> 启用
    return {
      toolName: tool.name,
      enabled: true,
      url: this.generateUrl(tool, context),
      disabledReason: null,
    };
  }
  
  /**
   * 批量计算所有工具状态（带缓存）
   */
  public computeAllToolStates(context: FileContext | null): Map<string, ToolState> {
    const cacheKey = context?.currentUrl.slice(0, 100) || 'null';
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // 计算所有工具状态
    const states = new Map<string, ToolState>();
    for (const tool of TOOLS) {
      states.set(tool.name, this.computeToolState(tool, context));
    }
    
    // 更新缓存（LRU 策略）
    if (this.cache.size >= 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, states);
    
    return states;
  }
  
  private generateUrl(tool: ToolEntry, context: FileContext | null): string | null {
    if (!context) {
      // 无文件上下文，仅替换 {owner} 和 {repo}
      return tool.urlTemplate
        .replace('{owner}', context?.owner || '')
        .replace('{repo}', context?.repo || '');
    }
    
    // 替换所有占位符
    let url = tool.urlTemplate
      .replace('{owner}', encodeURIComponent(context.owner))
      .replace('{repo}', encodeURIComponent(context.repo))
      .replace('{ref}', context.ref)
      .replace('{filepath}', context.filePath);  // 保留原编码
    
    // 附加查询参数和哈希
    if (context.query) url += context.query;
    if (context.hash) url += context.hash;
    
    return url;
  }
}
```

**测试示例**:

```typescript
// tests/unit/toolStateManager.test.ts
describe('ToolStateManager', () => {
  const manager = new ToolStateManager();
  
  describe('githistory 工具', () => {
    const githistoryTool: ToolEntry = {
      name: 'githistory',
      urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
      order: 9,
      iconPath: 'logo/githistory-16x16.png',
      enableCondition: {
        requiresFilePath: true,
        fileExtensions: [],
      },
    };
    
    it('应在文件页面启用', () => {
      const context: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'README.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/README.md',
      };
      
      const state = manager.computeToolState(githistoryTool, context);
      
      expect(state.enabled).toBe(true);
      expect(state.url).toBe('https://github.githistory.xyz/owner/repo/blob/main/README.md');
      expect(state.disabledReason).toBeNull();
    });
    
    it('应在仓库主页禁用', () => {
      const state = manager.computeToolState(githistoryTool, null);
      
      expect(state.enabled).toBe(false);
      expect(state.url).toBeNull();
      expect(state.disabledReason).toBe('仅适用于文件页面');
    });
  });
});
```

---

### 3. URL 生成器（`src/lib/urlGenerator.ts`）【修改】

**修改内容**: 支持文件路径占位符

**修改前**:

```typescript
export function generateToolUrl(tool: ToolEntry, context: RepositoryContext): string {
  return tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));
}
```

**修改后**:

```typescript
export function generateToolUrl(tool: ToolEntry, context: RepositoryContext | FileContext): string {
  let url = tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));
  
  // 如果上下文包含文件路径信息
  if ('filePath' in context) {
    url = url
      .replace('{ref}', context.ref)
      .replace('{filepath}', context.filePath);  // 保留原编码
    
    // 附加查询参数和哈希
    if (context.query) url += context.query;
    if (context.hash) url += context.hash;
  }
  
  return url;
}
```

---

### 4. 工具配置（`src/lib/config.ts`）【修改】

**修改内容**: 为 githistory 和 nbviewer 添加 `enableCondition`

```typescript
export const TOOLS: readonly ToolEntry[] = [
  // ... 其他工具保持不变 ...
  
  {
    name: 'nbviewer',
    urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
    order: 6,
    iconPath: 'logo/nbviewer.org-16x16.png',
    note: 'optimal for .ipynb files',
    enableCondition: {
      requiresFilePath: true,
      fileExtensions: ['ipynb'],
    },
  },
  {
    name: 'githistory',
    urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
    order: 9,
    iconPath: 'logo/githistory-16x16.png',
    note: 'optimal for file/folder paths',
    enableCondition: {
      requiresFilePath: true,
      fileExtensions: [],  // 空数组 = 支持所有扩展名
    },
  },
] as const;
```

---

### 5. 下拉菜单（`src/ui/ToolDropdown.ts`）【修改】

**修改内容**: 支持禁用状态渲染

**关键变更**:

```typescript
// 修改 createMenu 方法
private createMenu(toolStates: Map<string, ToolState>): HTMLUListElement {
  const menu = document.createElement('ul');
  menu.className = '__github-switcher-dropdown-menu';
  
  // 遍历所有工具状态
  for (const [toolName, state] of toolStates) {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    
    if (state.enabled) {
      // 启用状态
      anchor.href = state.url!;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.setAttribute('tabindex', '0');
    } else {
      // 禁用状态
      anchor.setAttribute('aria-disabled', 'true');
      anchor.setAttribute('tabindex', '-1');
      anchor.removeAttribute('href');
      
      // 可选：添加 title 显示禁用原因
      if (state.disabledReason) {
        anchor.title = state.disabledReason;
      }
    }
    
    // ... 添加图标和文本 ...
    
    li.appendChild(anchor);
    menu.appendChild(li);
  }
  
  return menu;
}
```

**CSS 样式更新**:

```css
/* 禁用状态样式 */
.__github-switcher-menu-link[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.__github-switcher-menu-link[aria-disabled="true"] .__github-switcher-menu-icon {
  filter: grayscale(100%);
}
```

---

### 6. Content Script 主入口（`src/contents/index.ts`）【修改】

**修改内容**: 集成工具状态管理器

```typescript
import { ToolStateManager } from '~/lib/toolStateManager';
import { parseGitHubFileUrl } from '~/lib/detectGithub';

// 全局状态
let toolStateManager: ToolStateManager | null = null;
let dropdown: ToolDropdown | null = null;

async function initialize() {
  toolStateManager = new ToolStateManager();
  
  // 初始化 UI
  updateToolStates();
  
  // 监听 URL 变化
  window.addEventListener('popstate', handleNavigation);
  document.addEventListener('turbo:load', handleNavigation);
}

function handleNavigation() {
  updateToolStates();
}

function updateToolStates() {
  const currentUrl = window.location.href;
  const fileContext = parseGitHubFileUrl(currentUrl);
  
  // 计算所有工具状态
  const toolStates = toolStateManager!.computeAllToolStates(fileContext);
  
  // 更新 UI（如果菜单已打开）
  if (dropdown?.isVisible()) {
    dropdown.updateStates(toolStates);
  }
}

// 初始化
(async function main() {
  try {
    await initialize();
  } catch (error) {
    console.error('[GitHub-Switcher] 初始化失败:', error);
  }
})();
```

---

## 测试策略

### TDD 开发流程

1. **编写测试**（红色阶段）
   ```bash
   # 创建测试文件
   touch tests/unit/toolStateManager.test.ts
   
   # 编写测试用例
   pnpm test:watch  # 监听模式
   ```

2. **实现功能**（绿色阶段）
   ```bash
   # 创建源文件
   touch src/lib/toolStateManager.ts
   
   # 实现功能直到测试通过
   ```

3. **重构优化**（重构阶段）
   ```bash
   # 优化代码，确保测试仍通过
   pnpm test
   pnpm lint:fix
   ```

### 测试覆盖率要求

- **新增代码**: 100% 覆盖率
- **修改代码**: 保持原有覆盖率
- **整体项目**: ≥80% 覆盖率

```bash
# 生成覆盖率报告
pnpm test:coverage

# 查看 HTML 报告
open coverage/index.html
```

### 关键测试用例

**必须包含的测试场景**:

1. ✅ 普通文件页面（启用 githistory）
2. ✅ Notebook 文件页面（启用 githistory 和 nbviewer）
3. ✅ 目录页面（禁用文件工具）
4. ✅ 仓库主页（禁用文件工具）
5. ✅ 大小写不敏感扩展名（.IPYNB）
6. ✅ URL 编码的文件路径（空格、中文）
7. ✅ 保留查询参数和哈希
8. ✅ 非 GitHub 域名（禁用所有工具）
9. ✅ 缓存命中与失效
10. ✅ 防抖合并事件
11. ✅ 多规则冲突（优先级测试）
12. ✅ 边界条件（极长路径、特殊字符）

---

## 调试技巧

### 1. 开发者工具日志

```typescript
import { logger } from '~/utils/logger';

// 在关键路径添加日志
logger.info('解析文件上下文:', fileContext);
logger.debug('计算工具状态:', toolStates);
logger.warn('缓存命中失败，重新计算');
```

### 2. Chrome DevTools 断点

1. 打开 Chrome DevTools (F12)
2. 切换到 Sources 面板
3. 在 `chrome-extension://...` 下找到源文件
4. 设置断点调试

### 3. 扩展重新加载

```bash
# 方法 1: 在扩展管理页面点击"重新加载"
# 方法 2: 使用快捷键（需配置）
# 方法 3: 重启开发服务器（会自动重新加载）
pnpm dev
```

---

## 常见问题

### Q1: 工具状态未更新？

**检查清单**:
- ✅ 是否监听了 `popstate` 和 `turbo:load` 事件？
- ✅ `parseGitHubFileUrl()` 是否正确解析 URL？
- ✅ 缓存是否正确失效？

**调试方法**:
```typescript
console.log('Current URL:', window.location.href);
console.log('File Context:', parseGitHubFileUrl());
console.log('Tool States:', toolStateManager.computeAllToolStates(context));
```

### Q2: 测试覆盖率不足？

**解决方法**:
```bash
# 生成覆盖率报告并查看未覆盖行
pnpm test:coverage
open coverage/index.html

# 补充缺失的测试用例
```

### Q3: 扩展加载失败？

**检查清单**:
- ✅ `build/chrome-mv3-dev/` 目录是否存在？
- ✅ `manifest.json` 是否有语法错误？
- ✅ 权限配置是否正确？

**解决方法**:
```bash
# 清理并重新构建
rm -rf build/
pnpm dev
```

---

## 下一步

1. **阅读完整规格**: [spec.md](./spec.md)
2. **理解技术决策**: [research.md](./research.md)
3. **查看数据模型**: [data-model.md](./data-model.md)
4. **开始 TDD 开发**: 编写第一个测试用例！

---

## 联系方式

- **项目仓库**: https://github.com/thomaszdxsn/GitHub-Switcher
- **问题反馈**: 提交 GitHub Issue
- **贡献指南**: 参见 CONTRIBUTING.md
