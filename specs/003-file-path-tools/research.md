# 技术研究：针对 GitHub 文件路径点亮工具菜单

**功能**: 003-file-path-tools  
**日期**: 2025-11-16  
**目的**: 解决技术实施中的未知项，评估方案选择，记录技术决策

## 研究概述

本文档记录为实施"文件路径感知工具菜单"功能所需的技术研究，包括 GitHub URL 解析策略、工具状态管理架构、性能优化方案和测试策略。

---

## 决策 1: GitHub 文件 URL 解析策略

### 背景

需要准确识别 GitHub 页面类型（文件页面 vs 目录页面 vs 仓库主页），并提取文件路径、扩展名等信息用于工具启用判定。

### 调研内容

**GitHub URL 模式分析**:
- 文件页面: `https://github.com/{owner}/{repo}/blob/{ref}/{filepath}`
- 目录页面: `https://github.com/{owner}/{repo}/tree/{ref}/{dirpath}`
- 仓库主页: `https://github.com/{owner}/{repo}` (可能带 trailing slash)
- 其他页面: `/issues`, `/pulls`, `/wiki`, `/settings` 等

**关键观察**:
1. `blob` 路径段明确标识文件页面，`tree` 标识目录页面
2. `ref` 可以是分支名（main）、标签名（v1.0.0）或完整 commit hash
3. `filepath` 可能包含多级目录、空格（编码为 %20）、特殊字符
4. GitHub 保留原始 URL 编码，不会二次编码

### 方案评估

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **A. 正则表达式解析** | 简单直接、性能好（<1ms）、易测试 | 需要处理多种边界情况 | ✅ **选择** |
| B. URL API + 路径分割 | 标准 API、自动处理编码 | 需要额外逻辑判断页面类型 | ❌ |
| C. DOM 查询（检测页面元素） | 最准确反映实际页面类型 | 依赖 DOM 加载、性能差、不可靠 | ❌ |

### 最终决策

**选择方案 A: 正则表达式解析**

**实施细节**:
```typescript
// 文件页面模式
const FILE_PATTERN = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;

// 提取组：
// match[1] = owner
// match[2] = repo
// match[3] = ref (分支/标签/commit)
// match[4] = filepath (可能包含 URL 编码)
```

**扩展名提取**:
```typescript
// 从 filepath 提取扩展名（大小写不敏感）
const ext = filepath.split('/').pop()?.split('.').pop()?.toLowerCase() || '';
```

**理由**:
- **性能**: 正则匹配在 V8 引擎中高度优化，单次匹配 <1ms
- **可靠性**: URL 模式固定，正则可完全覆盖
- **可测试性**: 纯函数，无副作用，100% 可单元测试
- **兼容性**: 无需等待 DOM 或异步操作

**替代方案拒绝理由**:
- 方案 B 虽然使用标准 API，但仍需正则判断 `blob` vs `tree`，无实质简化
- 方案 C 不可靠（GitHub SPA 可能延迟渲染），且违反"纯函数优先"原则

---

## 决策 2: 工具状态管理架构

### 背景

需要高效计算并缓存工具启用状态，支持多规则匹配、优先级归并、事件合并和失效策略。

### 调研内容

**架构模式对比**:
1. **响应式状态管理**（如 MobX、Vue Reactivity）: 自动追踪依赖，响应式更新
2. **事件驱动 + 状态机**: 明确的状态转换，可预测性强
3. **纯函数 + 缓存**: 输入 → 输出映射，使用 Map 缓存结果

**性能要求分析**:
- 大型仓库（2000+ 文件）下，用户快速导航可能触发 100+ 次路径变更/秒
- 需要防抖（debounce）合并事件，避免重复计算
- 缓存命中率目标 >95%（同一路径重复访问）

### 方案评估

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **A. 纯函数 + Map 缓存** | 简单、可测试、无依赖、性能可控 | 需要手动管理缓存失效 | ✅ **选择** |
| B. MobX/Vue Reactivity | 自动化响应式、开发效率高 | 引入新依赖（违反约束）、包大小增加 | ❌ |
| C. 状态机（XState） | 状态转换可视化、类型安全 | 过度工程化、学习曲线高 | ❌ |

### 最终决策

**选择方案 A: 纯函数 + Map 缓存**

**核心接口设计**:
```typescript
interface ToolStateManager {
  /**
   * 计算工具的启用状态（纯函数）
   * @param tool - 工具配置
   * @param context - 文件上下文（URL、路径、扩展名等）
   * @returns 工具状态（enabled/disabled + 原因）
   */
  computeToolState(tool: ToolEntry, context: FileContext): ToolState;

  /**
   * 批量计算所有工具状态（带缓存）
   * @param context - 文件上下文
   * @returns 所有工具的状态映射
   */
  computeAllToolStates(context: FileContext): Map<string, ToolState>;
}
```

**缓存策略**:
```typescript
// 缓存 Key: URL hash (SHA-256 前 8 位)
// 缓存 Value: Map<toolName, ToolState>
// 失效条件: URL 变更或规则配置变更
const cache = new Map<string, Map<string, ToolState>>();

// 简化版（避免引入 crypto 库）
function getCacheKey(url: string): string {
  return url.slice(0, 100); // 使用 URL 前缀作为 key
}
```

**事件合并（防抖）**:
```typescript
// 使用 50ms 防抖窗口，合并连续的 URL 变更事件
let debounceTimer: number | null = null;

function onUrlChange(newUrl: string) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    updateToolStates(newUrl);
  }, 50);
}
```

**理由**:
- **性能**: 纯函数计算 <5ms，缓存命中 <0.1ms，满足 P95 ≤50ms 目标
- **可测试性**: 100% 可单元测试，无副作用
- **零依赖**: 无需引入新库，包大小增量 <2KB
- **可维护性**: 逻辑集中在单一模块，易于理解和扩展

**替代方案拒绝理由**:
- 方案 B 引入新依赖（违反约束条件："不引入新三方依赖"）
- 方案 C 过度复杂，当前功能的状态转换简单（enabled ↔ disabled），不需要完整状态机

---

## 决策 3: URL 生成策略（文件路径支持）

### 背景

githistory 和 nbviewer 需要包含完整文件路径的目标 URL，需要保留原始编码、查询参数和哈希片段。

### 调研内容

**现有实现分析**:
- 当前 `generateToolUrl()` 只替换 `{owner}` 和 `{repo}` 占位符
- 不支持文件路径、分支名、查询参数

**目标 URL 模式**:
```text
githistory: https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}{?query}{#hash}
nbviewer:   https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}
```

### 方案评估

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **A. 模板字符串扩展** | 向后兼容、灵活、易扩展 | 需要修改 ToolEntry 类型 | ✅ **选择** |
| B. 专用文件 URL 生成器 | 类型安全、独立测试 | 代码重复、两套 API | ❌ |
| C. URL 对象拼接 | 标准 API、自动编码 | 需要额外逻辑处理占位符 | ❌ |

### 最终决策

**选择方案 A: 模板字符串扩展**

**修改 ToolEntry 接口**:
```typescript
export interface ToolEntry {
  name: string;
  urlTemplate: string;  // 支持更多占位符
  order: number;
  iconPath: string;
  note?: string;
  
  // 新增：启用条件（可选）
  enableCondition?: {
    requiresFilePath?: boolean;      // 需要文件路径（如 githistory）
    fileExtensions?: string[];       // 特定扩展名（如 .ipynb）
  };
}
```

**扩展 URL 生成逻辑**:
```typescript
function generateToolUrl(tool: ToolEntry, context: FileContext): string {
  let url = tool.urlTemplate
    .replace('{owner}', encodeURIComponent(context.owner))
    .replace('{repo}', encodeURIComponent(context.repo));

  // 如果工具需要文件路径
  if (tool.enableCondition?.requiresFilePath && context.filePath) {
    url = url
      .replace('{ref}', context.ref || 'main')
      .replace('{filepath}', context.filePath);  // 保留原编码
    
    // 保留查询参数和哈希
    if (context.query) url += context.query;
    if (context.hash) url += context.hash;
  }

  return url;
}
```

**理由**:
- **向后兼容**: 现有工具配置无需修改，新占位符可选
- **灵活性**: 支持未来新增其他占位符（如 `{branch}`、`{commit}`）
- **代码复用**: 单一 `generateToolUrl()` 函数处理所有工具
- **易测试**: 纯函数，输入输出明确

**替代方案拒绝理由**:
- 方案 B 导致代码重复，违反 DRY 原则
- 方案 C 使用 URL API 需要先构造基础 URL，再替换占位符，反而更复杂

---

## 决策 4: UI 禁用状态渲染

### 背景

需要在下拉菜单中区分启用/禁用工具，提供视觉反馈和交互行为差异。

### 调研内容

**UI 设计模式**:
1. **完全隐藏**: 不显示禁用的工具
2. **置灰 + 禁用点击**: 显示但不可点击
3. **置灰 + Tooltip 提示**: 显示原因（如"仅适用于文件页面"）

**可访问性要求**:
- ARIA 属性标记禁用状态（`aria-disabled="true"`）
- 键盘导航应跳过禁用项（`tabindex="-1"`）
- 屏幕阅读器应朗读禁用状态

### 方案评估

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| A. 完全隐藏 | 界面简洁、无干扰 | 用户不知道存在其他工具 | ❌ |
| **B. 置灰 + 禁用点击** | 平衡可见性与交互性 | 无法解释禁用原因 | ✅ **选择** |
| C. 置灰 + Tooltip | 用户友好、教育性强 | 实现复杂、增加包大小 | ❌ (可作为未来增强) |

### 最终决策

**选择方案 B: 置灰 + 禁用点击**

**CSS 样式实现**:
```css
.__github-switcher-menu-link[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.__github-switcher-menu-link[aria-disabled="true"] .menu-icon {
  filter: grayscale(100%);
}
```

**DOM 结构调整**:
```typescript
// 为禁用工具添加 ARIA 属性
if (!toolState.enabled) {
  anchor.setAttribute('aria-disabled', 'true');
  anchor.setAttribute('tabindex', '-1');
  anchor.removeAttribute('href');  // 阻止导航
}
```

**理由**:
- **用户体验**: 用户可以看到所有工具，了解扩展的完整功能
- **简单实现**: 仅需 CSS + 条件属性，无需额外库
- **性能**: 无额外 DOM 节点或事件监听器
- **可访问性**: 符合 ARIA 最佳实践

**替代方案拒绝理由**:
- 方案 A 隐藏工具会降低功能可发现性，用户可能不知道某些工具存在
- 方案 C 引入 Tooltip 需要额外库（如 Tippy.js）或自定义实现，增加包大小和复杂度

---

## 决策 5: GitHub SPA 导航监听

### 背景

GitHub 采用 Turbo（前身为 Turbolinks）实现 SPA 导航，页面切换不触发完整刷新，需要监听路由变化事件。

### 调研内容

**GitHub SPA 事件分析**:
```javascript
// GitHub 触发的导航事件
'turbo:load'        // Turbo 页面加载完成
'turbo:render'      // Turbo 渲染完成
'popstate'          // 浏览器前进/后退
'pushstate'         // 编程式导航（非标准事件）
```

**现有实现**:
- 项目已在 `contents/index.ts` 中监听 `popstate` 和 `turbo:load`
- 可复用现有事件监听机制

### 方案评估

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **A. 复用现有监听器** | 零额外代码、统一事件处理 | 依赖现有实现 | ✅ **选择** |
| B. 新增独立监听器 | 解耦、独立控制 | 代码重复、可能重复触发 | ❌ |
| C. MutationObserver 监听 URL 变化 | 最可靠、捕获所有变化 | 性能开销大、过度工程化 | ❌ |

### 最终决策

**选择方案 A: 复用现有事件监听器**

**实施细节**:
```typescript
// contents/index.ts 中已有的监听器
window.addEventListener('popstate', handleNavigation);
document.addEventListener('turbo:load', handleNavigation);

function handleNavigation() {
  const currentUrl = window.location.href;
  const fileContext = parseGitHubFileUrl(currentUrl);
  
  // 更新工具状态
  updateToolStates(fileContext);
}
```

**理由**:
- **代码复用**: 无需新增监听器，利用现有基础设施
- **性能**: 统一事件处理，避免重复计算
- **可维护性**: 集中管理导航逻辑

**替代方案拒绝理由**:
- 方案 B 导致重复监听，可能触发两次状态更新
- 方案 C 使用 MutationObserver 监听 URL 是反模式（URL 不是 DOM 变更）

---

## 决策 6: 测试策略

### 背景

需要确保 ≥80% 单元测试覆盖率，新增 ≥12 条测试用例，覆盖所有关键路径。

### 调研内容

**测试类型规划**:
1. **单元测试**: 纯函数逻辑（URL 解析、状态计算、URL 生成）
2. **集成测试**: UI 组件渲染（菜单启用/禁用状态）
3. **端到端测试**: 完整用户流程（暂不实施，可作为未来增强）

**测试覆盖率目标**:
- `detectGithub.ts`: 100%（关键路径）
- `urlGenerator.ts`: 100%（关键路径）
- `toolStateManager.ts`: 100%（新增核心模块）
- `ToolDropdown.ts`: ≥80%（UI 渲染逻辑）

### 测试用例规划

**detectGithub.test.ts（新增测试）**:
```typescript
describe('parseGitHubFileUrl', () => {
  it('应正确解析标准文件 URL', () => {
    const url = 'https://github.com/owner/repo/blob/main/README.md';
    expect(parseGitHubFileUrl(url)).toEqual({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
      filePath: 'README.md',
      extension: 'md',
    });
  });

  it('应正确解析 .ipynb 文件（大小写不敏感）', () => {
    const url = 'https://github.com/owner/repo/blob/main/notebook.IPYNB';
    expect(parseGitHubFileUrl(url).extension).toBe('ipynb');
  });

  it('应正确解析包含空格的文件路径', () => {
    const url = 'https://github.com/owner/repo/blob/main/my%20file.md';
    expect(parseGitHubFileUrl(url).filePath).toBe('my%20file.md');
  });

  it('应拒绝目录 URL', () => {
    const url = 'https://github.com/owner/repo/tree/main/src';
    expect(parseGitHubFileUrl(url)).toBeNull();
  });

  it('应拒绝仓库主页 URL', () => {
    const url = 'https://github.com/owner/repo';
    expect(parseGitHubFileUrl(url)).toBeNull();
  });
});
```

**toolStateManager.test.ts（新增 ≥12 条测试）**:
```typescript
describe('ToolStateManager', () => {
  describe('githistory 工具', () => {
    it('应在文件页面启用', () => { /* ... */ });
    it('应在目录页面禁用', () => { /* ... */ });
    it('应在仓库主页禁用', () => { /* ... */ });
    it('应支持所有文件扩展名', () => { /* ... */ });
  });

  describe('nbviewer 工具', () => {
    it('应在 .ipynb 文件页面启用', () => { /* ... */ });
    it('应在非 .ipynb 文件页面禁用', () => { /* ... */ });
    it('应支持大小写不敏感扩展名', () => { /* ... */ });
    it('应在目录页面禁用', () => { /* ... */ });
  });

  describe('URL 生成', () => {
    it('应生成正确的 githistory URL', () => { /* ... */ });
    it('应生成正确的 nbviewer URL', () => { /* ... */ });
    it('应保留查询参数和哈希', () => { /* ... */ });
    it('应正确处理 URL 编码的文件路径', () => { /* ... */ });
  });
});
```

**urlGenerator.test.ts（新增测试）**:
```typescript
describe('generateToolUrl - 文件路径支持', () => {
  it('应为 githistory 生成包含文件路径的 URL', () => { /* ... */ });
  it('应为 nbviewer 生成包含文件路径的 URL', () => { /* ... */ });
  it('应保留原始 URL 编码', () => { /* ... */ });
  it('应附加查询参数', () => { /* ... */ });
});
```

### 最终决策

**测试策略**:
1. **TDD 开发**: 先编写测试，再实现功能（红-绿-重构循环）
2. **覆盖率目标**: 新增代码 100% 覆盖率，整体维持 ≥80%
3. **测试数量**: 新增 ≥12 条单元测试（实际可能 15+ 条）
4. **CI 集成**: 所有测试必须通过才能合并 PR

**理由**:
- **质量保证**: TDD 确保代码可测试性和正确性
- **回归防护**: 完整测试覆盖避免未来改动引入 bug
- **文档价值**: 测试用例作为功能使用示例

---

## 性能优化总结

**关键优化点**:
1. **纯函数计算**: 所有状态计算为纯函数，无副作用，易于缓存
2. **防抖合并**: 50ms 防抖窗口，合并连续事件
3. **缓存策略**: URL 前缀作为缓存 key，命中率 >95%
4. **惰性加载**: 规则表静态配置，无需异步加载
5. **批量渲染**: 状态更新后一次性重渲染菜单，避免多次 DOM 操作

**预期性能**:
- 路径变更到菜单渲染 P95: 40-50ms（满足 ≤50ms 要求）
- 规则评估计算耗时: 3-5ms（满足 ≤5ms 要求）
- 包大小增量: 1.5-2KB gzipped（满足 <2KB 要求）

---

## 依赖与风险

**依赖项**:
- ✅ 现有 `detectGithub.ts` 模块（需扩展）
- ✅ 现有 `urlGenerator.ts` 模块（需扩展）
- ✅ 现有 SPA 导航监听机制（可复用）
- ✅ Vitest 测试框架（已配置）

**风险评估**:

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| GitHub 改变 URL 模式 | 高 | 使用灵活的正则模式，易于更新 |
| 性能不达标（大型仓库） | 中 | 缓存 + 防抖 + 性能测试验证 |
| 测试覆盖率不足 | 低 | TDD 开发，CI 强制检查覆盖率 |
| 与现有功能冲突 | 低 | 集成测试验证，保持向后兼容 |

---

## 结论

所有技术研究已完成，无遗留未知项。所有决策均有明确理由和替代方案评估，可进入阶段 1（设计与契约）。

**准备就绪**: ✅ 可开始编写 `data-model.md` 和 `contracts/`。
