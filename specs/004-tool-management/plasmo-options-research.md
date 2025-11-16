# Plasmo Options Page 研究文档

**研究目标**: 为 GitHub-Switcher 扩展构建工具管理设置页面 (Options Page)

**技术栈**: Plasmo 0.90.5 + TypeScript + Native DOM (无 React)

---

## 1. Plasmo Options Page 文件结构模式

### 1.1 基础文件命名约定

Plasmo 框架通过**约定优于配置 (Convention over Configuration)** 的方式自动识别 options 页面:

```
src/
  options.ts        # 根目录文件（推荐用于非 React 项目）
  options/
    index.ts        # 或使用目录结构
```

**关键发现**:
- 文件名必须为 `options.ts` 或 `options.tsx`
- React 项目使用 `.tsx` 导出默认 React 组件
- Native DOM 项目使用 `.ts` 直接操作 DOM
- Plasmo 会自动将该文件打包为 options 页面并配置到 manifest

### 1.2 Native DOM 实现模式 (推荐)

由于我们的项目使用 Native DOM (非 React)，应参考以下模式:

```typescript
// src/options.ts
/**
 * Options page entry point - Native DOM implementation
 */

// 初始化函数
function initializeOptionsPage(): void {
  const container = document.createElement('div');
  container.className = '__github-switcher-options';
  
  // 构建 UI
  container.innerHTML = `
    <h1>GitHub Switcher Settings</h1>
    <div class="__github-switcher-options__section">
      <!-- Settings UI -->
    </div>
  `;
  
  document.body.appendChild(container);
  
  // 添加事件监听器
  setupEventListeners();
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeOptionsPage);
```

---

## 2. Manifest 配置

### 2.1 自动配置 (Plasmo 默认行为)

Plasmo 检测到 `options.ts` 文件后会**自动**在 manifest 中添加:

```json
{
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  }
}
```

**关键点**:
- 无需手动配置 manifest
- `open_in_tab: true` 表示在新标签页中打开
- 生成的 HTML 文件路径为 `options.html`

### 2.2 手动覆盖配置 (可选)

如需自定义 options 页面行为，可在 `package.json` 中覆盖:

```json
{
  "manifest": {
    "options_ui": {
      "page": "options.html",
      "open_in_tab": false  // 改为嵌入式弹窗
    }
  }
}
```

**注意**: Manifest V3 建议使用 `options_ui` 而非已废弃的 `options_page`

---

## 3. 组件架构 (Native DOM)

### 3.1 推荐的组件化模式

参考现有 `SidebarButton` 和 `ToolDropdown` 的设计模式:

```
src/
  options.ts                    # 主入口
  ui/
    OptionsPage/
      OptionsContainer.ts       # 页面容器组件
      ToolList.ts               # 工具列表组件
      ToolItem.ts               # 单个工具项组件
      ToggleSwitch.ts           # 开关控件组件
      DragHandle.ts             # 拖拽句柄组件
  lib/
    optionsStorage.ts           # Options 页面专用存储逻辑
```

### 3.2 组件类模板

```typescript
// src/ui/OptionsPage/ToolItem.ts
export class ToolItem {
  private element: HTMLDivElement | null = null;
  
  constructor(
    private toolName: string,
    private enabled: boolean,
    private order: number
  ) {}
  
  public mount(parent: HTMLElement): void {
    this.injectStyles();
    this.element = this.createElement();
    parent.appendChild(this.element);
  }
  
  public unmount(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
  
  private injectStyles(): void {
    if (document.getElementById('__github-switcher-tool-item-styles')) return;
    
    const style = document.createElement('style');
    style.id = '__github-switcher-tool-item-styles';
    style.textContent = `
      .__github-switcher-tool-item {
        /* CSS 规则 */
      }
    `;
    document.head.appendChild(style);
  }
  
  private createElement(): HTMLDivElement {
    const item = document.createElement('div');
    item.className = '__github-switcher-tool-item';
    // ... 构建 DOM
    return item;
  }
}
```

---

## 4. 样式最佳实践

### 4.1 CSS 前缀隔离要求

**必须遵守**: 所有 class 名使用 `__github-switcher-` 前缀，避免与 GitHub 网站样式冲突

```css
/* 正确 ✅ */
.__github-switcher-options { }
.__github-switcher-options__section { }
.__github-switcher-tool-item { }
.__github-switcher-tool-item--disabled { }

/* 错误 ❌ */
.options { }
.tool-item { }
```

### 4.2 样式注入方式

**方案 1: 内联样式注入 (推荐)**

```typescript
private injectStyles(): void {
  const styleId = '__github-switcher-options-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* CSS 内容 */
  `;
  document.head.appendChild(style);
}
```

**优点**:
- 与现有 `SidebarButton`、`ToolDropdown` 模式一致
- 样式隔离性好
- 避免 CSS 模块打包复杂度

**方案 2: 外部 CSS 文件 (不推荐)**

虽然 Plasmo 支持 CSS 模块 (`import styles from './options.module.css'`)，但我们的项目不使用 CSS 模块，应保持架构一致性。

### 4.3 BEM 命名规范

遵循 BEM (Block Element Modifier) 模式:

```css
/* Block */
.__github-switcher-options { }

/* Element */
.__github-switcher-options__header { }
.__github-switcher-options__tool-list { }
.__github-switcher-options__tool-item { }

/* Modifier */
.__github-switcher-options__tool-item--disabled { }
.__github-switcher-options__tool-item--dragging { }
```

---

## 5. Storage 通信机制

### 5.1 Chrome Storage API

使用 `chrome.storage.sync` 实现 options 页面与 content script 的通信:

```typescript
// 保存设置 (Options 页面)
await chrome.storage.sync.set({
  enabledTools: [1, 2, 3, 5],
  toolOrder: [1, 5, 2, 3]
});

// 监听变化 (Content Script)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabledTools) {
    console.log('Enabled tools changed:', changes.enabledTools.newValue);
    // 重新渲染工具列表
  }
});
```

### 5.2 Storage 事件流

```
┌─────────────────┐
│  Options Page   │
│  (用户操作)      │
└────────┬────────┘
         │ chrome.storage.sync.set()
         ▼
┌─────────────────┐
│  Chrome Storage │
│  (sync area)    │
└────────┬────────┘
         │ onChanged event
         ▼
┌─────────────────┐
│ Content Script  │
│ (监听变化)       │
└─────────────────┘
```

### 5.3 集成现有 storage.ts

复用项目中的 `src/lib/storage.ts`:

```typescript
// src/lib/storage.ts (已存在)
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  await chrome.storage.sync.set(preferences);
}

export async function loadPreferences(): Promise<UserPreferences> {
  const result = await chrome.storage.sync.get(DEFAULT_PREFERENCES);
  return result as UserPreferences;
}

// src/options.ts (新增)
import { savePreferences, loadPreferences } from '@/lib/storage';

async function handleSave() {
  await savePreferences({
    enabledTools: [1, 2, 3],
    openInNewTab: true
  });
}
```

---

## 6. Build 优化最佳实践

### 6.1 Bundle 分析

当前项目 content script 打包体积:
- 未压缩: 14KB
- Gzipped: 4.4KB

Options 页面目标:
- 未压缩: < 30KB (包含 SortableJS)
- Gzipped: < 10KB

### 6.2 代码分割策略

**动态导入 SortableJS** (仅在 options 页面加载):

```typescript
// src/options.ts
async function initializeDragAndDrop() {
  const { default: Sortable } = await import('sortablejs');
  
  Sortable.create(listElement, {
    animation: 150,
    handle: '.__github-switcher-drag-handle'
  });
}
```

**避免重复打包**:
- Content script 和 options 页面共享的工具类 (如 `storage.ts`) 会被 Plasmo 自动优化
- 无需手动配置 code splitting

### 6.3 Tree Shaking 检查

确保 TypeScript 配置启用 tree shaking:

```jsonc
// tsconfig.json (已配置)
{
  "compilerOptions": {
    "module": "ESNext",           // ✅ 支持 tree shaking
    "moduleResolution": "bundler" // ✅ Plasmo 推荐
  }
}
```

### 6.4 Production Build 检查命令

```bash
# 构建生产版本
pnpm build

# 检查打包体积
ls -lh build/chrome-mv3-prod/

# 分析 manifest
cat build/chrome-mv3-prod/manifest.json | jq .options_ui
```

---

## 7. 性能优化技巧

### 7.1 延迟加载 (Lazy Loading)

仅在用户交互时加载重量级功能:

```typescript
// 页面加载时: 只加载基础 UI
document.addEventListener('DOMContentLoaded', () => {
  renderBasicUI();
});

// 用户点击"启用拖拽排序"时: 动态加载 SortableJS
async function enableDragAndDrop() {
  if (!sortableInstance) {
    const { default: Sortable } = await import('sortablejs');
    sortableInstance = Sortable.create(listElement, { ... });
  }
}
```

### 7.2 虚拟滚动 (可选)

如果未来工具数量 > 50，考虑虚拟滚动优化渲染性能

### 7.3 防抖与节流

```typescript
// 保存设置时使用防抖
import { debounce } from '@/utils/debounce';

const saveSettings = debounce(async (settings) => {
  await savePreferences(settings);
}, 500);
```

---

## 8. 常见问题与解决方案

### 8.1 Options 页面不显示

**问题**: 创建 `options.ts` 后扩展未显示设置页面

**解决方案**:
1. 确保文件名正确: `options.ts` (不是 `option.ts`)
2. 重启开发服务器: `pnpm dev`
3. 检查 `build/chrome-mv3-dev/manifest.json` 是否包含 `options_ui` 字段
4. 手动刷新扩展: Chrome 扩展管理页 -> 点击"刷新"按钮

### 8.2 Storage 数据不同步

**问题**: Options 页面修改设置后 content script 未更新

**解决方案**:
1. 检查是否使用 `chrome.storage.sync.set()` (不是 `localStorage`)
2. 确保 content script 添加了 `chrome.storage.onChanged` 监听器
3. 验证权限: `package.json` 的 `manifest.permissions` 包含 `"storage"`

### 8.3 样式冲突

**问题**: Options 页面样式与浏览器默认样式冲突

**解决方案**:
1. 所有 class 使用 `__github-switcher-` 前缀
2. 使用 CSS Reset:
```css
.__github-switcher-options * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

### 8.4 TypeScript 类型错误

**问题**: `chrome.storage` 类型未定义

**解决方案**:
```typescript
// tsconfig.json (已配置)
{
  "compilerOptions": {
    "types": ["chrome", "node"]
  }
}
```

### 8.5 热重载 (HMR) 失效

**问题**: 修改 `options.ts` 后需要手动刷新

**解决方案**:
- Options 页面不支持内容脚本级别的 HMR
- 开发时: 修改代码 -> 关闭 options 标签页 -> 重新打开
- 或使用 `pnpm dev` 的自动重载功能 (需重启扩展)

---

## 9. 实施步骤建议

基于研究结果，推荐以下实施顺序:

### Phase 1: 基础架构 (1-2天)
1. 创建 `src/options.ts` 入口文件
2. 创建 `src/ui/OptionsPage/` 组件目录
3. 实现基础页面布局和样式
4. 测试 options 页面显示和基础交互

### Phase 2: 数据绑定 (1-2天)
5. 集成 `storage.ts` 实现设置加载/保存
6. 实现工具列表渲染
7. 实现开关按钮功能
8. 测试与 content script 的数据同步

### Phase 3: 高级功能 (2-3天)
9. 集成 SortableJS 实现拖拽排序
10. 实现拖拽状态持久化
11. 添加键盘快捷键支持
12. 性能优化和 bundle 体积检查

### Phase 4: 测试与文档 (1天)
13. 编写单元测试 (Vitest)
14. 手动测试各种场景
15. 更新 README 和用户文档

---

## 10. 参考资源

### 官方文档
- [Plasmo Extension Pages](https://docs.plasmo.com/framework/ext-pages)
- [Plasmo Storage API](https://docs.plasmo.com/framework/storage)
- [Plasmo Manifest Override](https://docs.plasmo.com/framework/customization/manifest)

### 示例代码
- [with-options-ui](https://github.com/PlasmoHQ/examples/tree/main/with-options-ui) - React 版本
- [with-storage](https://github.com/PlasmoHQ/examples/tree/main/with-storage) - Storage 同步示例

### Chrome API
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Options UI](https://developer.chrome.com/docs/extensions/develop/ui/options-page)

---

## 附录: 完整示例代码

### A.1 Options 页面入口 (src/options.ts)

```typescript
/**
 * Options page for GitHub Switcher
 * Native DOM implementation (no React)
 */

import { loadPreferences, savePreferences } from '@/lib/storage';
import { TOOLS } from '@/lib/config';
import type { UserPreferences } from '@/lib/types';

// 主容器
let container: HTMLDivElement | null = null;

/**
 * 初始化 options 页面
 */
async function initialize(): Promise<void> {
  injectStyles();
  container = createContainer();
  document.body.appendChild(container);
  
  // 加载用户设置
  const preferences = await loadPreferences();
  renderToolList(preferences);
  
  // 绑定事件
  setupEventListeners();
}

/**
 * 注入样式
 */
function injectStyles(): void {
  const styleId = '__github-switcher-options-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .__github-switcher-options {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    
    .__github-switcher-options__header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #d1d5da;
    }
    
    .__github-switcher-options__tool-list {
      list-style: none;
      padding: 0;
    }
    
    .__github-switcher-options__tool-item {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: #f6f8fa;
      border: 1px solid #d1d5da;
      border-radius: 6px;
      cursor: move;
    }
    
    .__github-switcher-options__tool-item--disabled {
      opacity: 0.5;
    }
    
    .__github-switcher-drag-handle {
      margin-right: 12px;
      cursor: grab;
    }
    
    .__github-switcher-toggle {
      margin-left: auto;
    }
  `;
  document.head.appendChild(style);
}

/**
 * 创建容器元素
 */
function createContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.className = '__github-switcher-options';
  div.innerHTML = `
    <div class="__github-switcher-options__header">
      <h1>GitHub Switcher Settings</h1>
      <p>管理第三方工具的显示和排序</p>
    </div>
    <ul class="__github-switcher-options__tool-list" id="tool-list">
      <!-- 工具列表将在这里渲染 -->
    </ul>
  `;
  return div;
}

/**
 * 渲染工具列表
 */
function renderToolList(preferences: UserPreferences): void {
  const listElement = document.getElementById('tool-list');
  if (!listElement) return;
  
  listElement.innerHTML = '';
  
  TOOLS.forEach(tool => {
    const enabled = preferences.enabledTools.includes(tool.order);
    
    const li = document.createElement('li');
    li.className = '__github-switcher-options__tool-item';
    li.dataset.order = String(tool.order);
    
    if (!enabled) {
      li.classList.add('__github-switcher-options__tool-item--disabled');
    }
    
    li.innerHTML = `
      <span class="__github-switcher-drag-handle">☰</span>
      <span>${tool.name}</span>
      <label class="__github-switcher-toggle">
        <input type="checkbox" ${enabled ? 'checked' : ''} data-order="${tool.order}">
      </label>
    `;
    
    listElement.appendChild(li);
  });
}

/**
 * 设置事件监听器
 */
function setupEventListeners(): void {
  // 监听开关按钮
  document.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'checkbox' && target.dataset.order) {
      await handleToggleChange(target);
    }
  });
}

/**
 * 处理工具开关切换
 */
async function handleToggleChange(checkbox: HTMLInputElement): Promise<void> {
  const order = Number(checkbox.dataset.order);
  const preferences = await loadPreferences();
  
  if (checkbox.checked) {
    // 启用工具
    if (!preferences.enabledTools.includes(order)) {
      preferences.enabledTools.push(order);
    }
  } else {
    // 禁用工具
    preferences.enabledTools = preferences.enabledTools.filter(o => o !== order);
  }
  
  await savePreferences(preferences);
  
  // 更新 UI
  const listItem = checkbox.closest('.__github-switcher-options__tool-item');
  if (listItem) {
    listItem.classList.toggle('__github-switcher-options__tool-item--disabled', !checkbox.checked);
  }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initialize);
```

### A.2 扩展 UserPreferences 类型 (src/lib/types.ts)

```typescript
// 新增字段用于工具排序
export interface UserPreferences {
  openInNewTab: boolean;
  enabledTools: number[];      // 已启用工具的 order 列表
  toolOrder?: number[];         // (可选) 自定义排序
}
```

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**作者**: GitHub Copilot  
**适用于**: Plasmo 0.90.5 + TypeScript 5.x + Native DOM
