# SortableJS 与 Native DOM 集成研究报告

**功能分支**: `004-tool-management`  
**创建日期**: 2025-11-16  
**研究目的**: 为工具管理设置页面的拖拽排序功能提供技术指导

---

## 1. Native DOM 集成最佳实践

### 1.1 基础初始化模式

SortableJS 与 Native DOM 集成非常简单，无需任何框架依赖：

```typescript
import Sortable from 'sortablejs';

// 获取容器元素
const toolListElement = document.getElementById('tool-list');

// 初始化 Sortable
const sortable = Sortable.create(toolListElement, {
  // 拖拽手柄（仅手柄可拖拽，避免误触）
  handle: '.tool-drag-handle',
  
  // 动画时长（150ms 为推荐值）
  animation: 150,
  
  // 视觉反馈 CSS 类
  ghostClass: '__github-switcher-tool-ghost',      // 拖拽副本
  chosenClass: '__github-switcher-tool-chosen',    // 被选中的工具
  dragClass: '__github-switcher-tool-drag',        // 拖拽中的工具
  
  // 可拖拽元素选择器
  draggable: '.tool-item',
  
  // 数据属性（用于序列化）
  dataIdAttr: 'data-tool-id',
  
  // 事件回调
  onEnd: (evt) => {
    // 拖拽完成后保存新顺序
    const newOrder = sortable.toArray(); // ['1', '2', '3', ...]
    saveToolOrder(newOrder.map(Number));
  }
});
```

**关键点**:
- ✅ 使用 `handle` 选项指定拖拽手柄，避免整个工具项都可拖拽（提升用户体验）
- ✅ 使用 `dataIdAttr` 配置数据属性名，便于序列化和反序列化
- ✅ 使用 `animation` 提供平滑的移动动画（建议 150ms）
- ✅ 提供清晰的视觉反馈类（ghost、chosen、drag）

---

### 1.2 HTML 结构要求

```html
<ul id="tool-list" class="__github-switcher-tool-list">
  <li class="tool-item" data-tool-id="1">
    <span class="tool-drag-handle" aria-label="拖拽以调整顺序">⋮⋮</span>
    <img src="icon.svg" alt="Tool Icon" class="tool-icon" />
    <div class="tool-info">
      <span class="tool-name">GitHub.dev</span>
      <span class="tool-description">GitHub's official online code editor</span>
    </div>
    <label class="tool-toggle">
      <input type="checkbox" checked />
    </label>
  </li>
  <!-- 更多工具项... -->
</ul>
```

**要求**:
- ✅ 每个工具项必须有唯一的 `data-tool-id` 属性（对应 TOOLS 数组中的 order 字段）
- ✅ 拖拽手柄使用独立元素（`.tool-drag-handle`），添加 `aria-label` 提升无障碍性
- ✅ 使用语义化的 HTML 结构（`<ul>` + `<li>`）

---

## 2. 关键事件处理

### 2.1 推荐使用 `onEnd` 事件

**最佳实践**: 仅监听 `onEnd` 事件，避免频繁保存。

```typescript
const sortable = Sortable.create(toolListElement, {
  onEnd: (evt) => {
    // evt.oldIndex: 拖拽前的索引（从 0 开始）
    // evt.newIndex: 拖拽后的索引（从 0 开始）
    // evt.item: 被拖拽的 HTMLElement
    // evt.from: 源列表（如果跨列表拖拽）
    // evt.to: 目标列表（如果跨列表拖拽）
    
    console.log(`工具从位置 ${evt.oldIndex} 移动到 ${evt.newIndex}`);
    
    // 获取新顺序（数组）
    const newOrder = sortable.toArray(); // ['1', '2', '3', ...]
    
    // 保存到 chrome.storage.sync
    debounceSaveToolOrder(newOrder.map(Number));
  }
});
```

**为什么选择 `onEnd`**:
- ✅ 只在拖拽完成后触发一次，避免拖拽过程中频繁触发
- ✅ 提供完整的拖拽信息（oldIndex、newIndex、item）
- ✅ 符合用户预期（松开鼠标 = 保存操作）

**避免使用的事件**:
- ❌ `onChange`: 拖拽过程中频繁触发，可能导致性能问题
- ❌ `onUpdate`: 仅在同一列表内移动时触发，语义不明确
- ❌ `onMove`: 每次移动都触发，过于频繁

---

### 2.2 防抖保存（Debounce）

虽然 `onEnd` 只触发一次，但用户可能连续拖拽多次，建议使用防抖技术：

```typescript
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debounceSaveToolOrder(newOrder: number[]) {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    try {
      await saveToolOrder(newOrder);
      console.log('工具顺序已保存:', newOrder);
    } catch (error) {
      console.error('保存失败:', error);
      // 显示错误提示
    } finally {
      saveTimeout = null;
    }
  }, 300); // 300ms 防抖延迟
}
```

**优势**:
- ✅ 用户连续拖拽时，只保存最后一次操作
- ✅ 避免触发 chrome.storage.sync 的速率限制（120 次/分钟）
- ✅ 提升性能，减少不必要的写入

---

### 2.3 其他有用的事件

**`onStart` - 拖拽开始**:
```typescript
onStart: (evt) => {
  console.log('开始拖拽:', evt.oldIndex);
  // 可选: 添加全局拖拽状态（如禁用页面滚动）
}
```

**`onMove` - 拖拽移动（可用于限制拖拽行为）**:
```typescript
onMove: (evt, originalEvent) => {
  // evt.dragged: 被拖拽的元素
  // evt.related: 当前悬停的目标元素
  // evt.willInsertAfter: 是否将元素插入到目标元素后面
  
  // 返回 false 取消拖拽
  // 返回 -1 插入到目标元素前面
  // 返回 1 插入到目标元素后面
  // 返回 true 或 undefined 保持默认行为
  
  return true; // 允许拖拽
}
```

---

## 3. 视觉反馈实现

### 3.1 推荐的视觉反馈 CSS

```css
/* 拖拽手柄样式 */
.tool-drag-handle {
  cursor: grab;
  color: #6e7781;
  font-size: 16px;
  padding: 4px;
  user-select: none;
  transition: color 0.2s ease;
}

.tool-drag-handle:hover {
  color: #24292f;
}

.tool-drag-handle:active {
  cursor: grabbing;
}

/* 拖拽副本（Ghost Element） */
.__github-switcher-tool-ghost {
  opacity: 0.4;
  background: #f6f8fa;
  border: 2px dashed #d0d7de;
}

/* 被选中的工具（Chosen Element） */
.__github-switcher-tool-chosen {
  background: #ddf4ff;
  border-color: #54aeff;
  box-shadow: 0 0 0 3px rgba(84, 174, 255, 0.2);
}

/* 拖拽中的工具（Drag Element） */
.__github-switcher-tool-drag {
  opacity: 0.8;
  transform: rotate(2deg);
  cursor: grabbing;
}

/* 目标位置高亮（需要自定义实现） */
.tool-item.drop-target {
  border-top: 3px solid #0969da;
}

/* 平滑过渡动画 */
.tool-item {
  transition: transform 0.15s ease, background-color 0.15s ease;
}
```

**视觉反馈层次**:
1. **拖拽前**: 手柄显示 `cursor: grab`，鼠标悬停时颜色变深
2. **选中工具**: 背景色变为蓝色（`__github-switcher-tool-chosen`）
3. **拖拽中**: 
   - 原位置显示半透明虚线框（`__github-switcher-tool-ghost`）
   - 跟随鼠标的元素半透明并稍微旋转（`__github-switcher-tool-drag`）
4. **目标位置**: 在目标位置上方显示蓝色边框（可选，需自定义）

---

### 3.2 目标位置高亮（自定义实现）

SortableJS 不直接提供目标位置高亮，需要通过 `onMove` 事件手动实现：

```typescript
let lastTarget: HTMLElement | null = null;

const sortable = Sortable.create(toolListElement, {
  onMove: (evt) => {
    // 移除上一个目标的高亮
    if (lastTarget) {
      lastTarget.classList.remove('drop-target');
    }
    
    // 高亮当前目标
    const target = evt.related as HTMLElement;
    if (target) {
      target.classList.add('drop-target');
      lastTarget = target;
    }
    
    return true;
  },
  
  onEnd: () => {
    // 拖拽结束后移除高亮
    if (lastTarget) {
      lastTarget.classList.remove('drop-target');
      lastTarget = null;
    }
  }
});
```

---

## 4. 无障碍支持（Accessibility）

### 4.1 ARIA 属性

```html
<ul id="tool-list" role="list" aria-label="可排序的工具列表">
  <li class="tool-item" role="listitem" data-tool-id="1">
    <span 
      class="tool-drag-handle" 
      role="button"
      aria-label="拖拽以调整 GitHub.dev 的顺序"
      aria-describedby="tool-1-desc"
      tabindex="0">
      ⋮⋮
    </span>
    <div id="tool-1-desc" class="tool-info">
      <span class="tool-name">GitHub.dev</span>
      <span class="tool-description">GitHub's official online code editor</span>
    </div>
  </li>
</ul>
```

**关键 ARIA 属性**:
- ✅ `role="list"` 和 `role="listitem"`: 明确语义化
- ✅ `aria-label`: 为拖拽手柄提供清晰的说明
- ✅ `aria-describedby`: 关联工具描述，屏幕阅读器可读取
- ✅ `tabindex="0"`: 使拖拽手柄可通过键盘聚焦

---

### 4.2 键盘导航（可选，需自定义实现）

SortableJS 不原生支持键盘拖拽，需要手动实现：

```typescript
// 监听拖拽手柄的键盘事件
const handles = document.querySelectorAll('.tool-drag-handle');

handles.forEach((handle) => {
  handle.addEventListener('keydown', (e) => {
    const toolItem = handle.closest('.tool-item') as HTMLElement;
    if (!toolItem) return;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveItemUp(toolItem);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveItemDown(toolItem);
        break;
    }
  });
});

function moveItemUp(item: HTMLElement) {
  const prev = item.previousElementSibling;
  if (prev) {
    item.parentNode?.insertBefore(item, prev);
    // 保存新顺序
    const newOrder = sortable.toArray();
    debounceSaveToolOrder(newOrder.map(Number));
    // 保持焦点
    (item.querySelector('.tool-drag-handle') as HTMLElement)?.focus();
  }
}

function moveItemDown(item: HTMLElement) {
  const next = item.nextElementSibling;
  if (next) {
    item.parentNode?.insertBefore(next, item);
    // 保存新顺序
    const newOrder = sortable.toArray();
    debounceSaveToolOrder(newOrder.map(Number));
    // 保持焦点
    (item.querySelector('.tool-drag-handle') as HTMLElement)?.focus();
  }
}
```

**键盘快捷键建议**:
- ⬆️ `ArrowUp` 或 `Ctrl+↑`: 将工具向上移动一位
- ⬇️ `ArrowDown` 或 `Ctrl+↓`: 将工具向下移动一位
- 🔤 `Space` 或 `Enter`: 选中工具（用于多选拖拽，可选功能）

---

### 4.3 屏幕阅读器支持

```typescript
// 在拖拽完成后，使用 ARIA Live Region 通知屏幕阅读器
const sortable = Sortable.create(toolListElement, {
  onEnd: (evt) => {
    const toolName = evt.item.querySelector('.tool-name')?.textContent;
    const newIndex = evt.newIndex + 1; // 用户理解的索引从 1 开始
    
    // 创建或更新 ARIA Live Region
    let liveRegion = document.getElementById('sortable-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sortable-live-region';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = `${toolName} 已移动到位置 ${newIndex}`;
    
    // 保存新顺序
    const newOrder = sortable.toArray();
    debounceSaveToolOrder(newOrder.map(Number));
  }
});
```

---

## 5. 性能优化

### 5.1 使用 `requestAnimationFrame` 优化 DOM 更新

SortableJS 内部已使用 `requestAnimationFrame`，但如果需要在事件回调中进行额外的 DOM 更新，建议手动优化：

```typescript
const sortable = Sortable.create(toolListElement, {
  onEnd: (evt) => {
    requestAnimationFrame(() => {
      // 更新 UI（如更新顺序编号）
      updateToolNumbers();
      
      // 保存新顺序
      const newOrder = sortable.toArray();
      debounceSaveToolOrder(newOrder.map(Number));
    });
  }
});

function updateToolNumbers() {
  const toolItems = document.querySelectorAll('.tool-item');
  toolItems.forEach((item, index) => {
    const numberEl = item.querySelector('.tool-number');
    if (numberEl) {
      numberEl.textContent = String(index + 1);
    }
  });
}
```

---

### 5.2 避免拖拽过程中的重排（Reflow）

**最佳实践**:
- ✅ 使用 `transform` 和 `opacity` 进行动画（触发 GPU 加速）
- ❌ 避免在拖拽过程中修改 `width`、`height`、`margin` 等会触发重排的属性

```css
/* ✅ 推荐: 使用 transform */
.tool-item {
  transition: transform 0.15s ease;
}

.__github-switcher-tool-drag {
  transform: scale(1.05) rotate(2deg);
}

/* ❌ 避免: 修改 width/height */
.__github-switcher-tool-drag {
  width: 105%; /* 触发重排 */
}
```

---

### 5.3 限制动画时长

```typescript
const sortable = Sortable.create(toolListElement, {
  animation: 150, // 推荐 100-200ms
  
  // 使用 CSS 缓动函数
  easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)', // Material Design 标准缓动
});
```

**动画时长建议**:
- 🚀 **100ms**: 快速响应，适合短距离移动
- ⚡ **150ms**: 平衡速度与流畅度（推荐）
- 🎨 **200ms**: 更平滑的视觉效果，适合长距离移动
- ❌ **>300ms**: 过慢，用户体验不佳

---

### 5.4 防抖与节流

**防抖（Debounce）**: 用于保存操作（见 2.2 节）

**节流（Throttle）**: 用于频繁触发的事件（如 `onMove`）

```typescript
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 使用节流优化 onMove
const sortable = Sortable.create(toolListElement, {
  onMove: throttle((evt) => {
    console.log('拖拽移动:', evt.related);
    // 执行高开销操作（如重新计算布局）
  }, 100), // 每 100ms 最多触发一次
});
```

---

## 6. 常见陷阱与解决方案

### 6.1 ❌ 陷阱 1: 拖拽手柄被子元素遮挡

**问题**: 如果拖拽手柄内部有其他元素（如图标），拖拽可能失效。

**解决方案**: 为手柄添加 `pointer-events: none` 给子元素。

```html
<span class="tool-drag-handle">
  <svg class="drag-icon">...</svg> <!-- 可能遮挡点击事件 -->
</span>
```

```css
.tool-drag-handle svg {
  pointer-events: none; /* 确保事件穿透到手柄 */
}
```

---

### 6.2 ❌ 陷阱 2: 动态添加的工具项无法拖拽

**问题**: 如果在初始化 Sortable 后动态添加新工具，新工具无法拖拽。

**解决方案**: 重新渲染整个列表，或使用 `sortable.option()` 更新配置。

```typescript
// 方案 A: 重新渲染列表（推荐）
function addNewTool(tool: Tool) {
  // 更新数据
  tools.push(tool);
  
  // 重新渲染整个列表
  renderToolList(tools);
  
  // 重新初始化 Sortable
  if (sortable) {
    sortable.destroy();
  }
  sortable = Sortable.create(toolListElement, config);
}

// 方案 B: 使用 DOM API 手动添加（不推荐，可能导致状态不同步）
function addNewToolManually(tool: Tool) {
  const newItem = createToolElement(tool);
  toolListElement.appendChild(newItem);
  // Sortable 会自动识别新元素
}
```

---

### 6.3 ❌ 陷阱 3: 拖拽副本（Ghost）样式不生效

**问题**: `ghostClass` 指定的 CSS 类样式不显示。

**原因**: SortableJS 会克隆元素作为拖拽副本，但克隆的元素可能丢失某些 CSS 样式（如伪元素）。

**解决方案**: 使用内联样式或全局 CSS 类，避免依赖复杂的 CSS 选择器。

```css
/* ✅ 推荐: 使用简单的全局类 */
.__github-switcher-tool-ghost {
  opacity: 0.4 !important; /* 使用 !important 确保生效 */
  background: #f6f8fa !important;
}

/* ❌ 避免: 使用伪元素（可能丢失） */
.__github-switcher-tool-ghost::before {
  content: '拖拽中'; /* 可能不显示 */
}
```

---

### 6.4 ❌ 陷阱 4: 触摸设备上拖拽失效

**问题**: 在移动设备上，拖拽无法触发。

**原因**: 触摸事件与滚动事件冲突。

**解决方案**: 配置 `delayOnTouchOnly` 和 `touchStartThreshold`。

```typescript
const sortable = Sortable.create(toolListElement, {
  delay: 100, // 延迟 100ms 开始拖拽（避免与点击冲突）
  delayOnTouchOnly: true, // 仅在触摸设备上启用延迟
  touchStartThreshold: 10, // 触摸点移动 10px 后才开始拖拽
});
```

---

### 6.5 ❌ 陷阱 5: `toArray()` 返回错误的顺序

**问题**: `sortable.toArray()` 返回的数组与实际 DOM 顺序不一致。

**原因**: `dataIdAttr` 配置错误，或 HTML 元素缺少对应的属性。

**解决方案**: 确保每个工具项都有正确的 `data-tool-id` 属性。

```html
<!-- ✅ 正确 -->
<li class="tool-item" data-tool-id="1">...</li>
<li class="tool-item" data-tool-id="2">...</li>

<!-- ❌ 错误: 缺少 data-tool-id -->
<li class="tool-item">...</li>
```

```typescript
// ✅ 正确配置
const sortable = Sortable.create(toolListElement, {
  dataIdAttr: 'data-tool-id', // 必须与 HTML 属性名一致
});

// 获取顺序
const order = sortable.toArray(); // ['1', '2', '3', ...]
```

---

### 6.6 ❌ 陷阱 6: 拖拽过程中页面滚动异常

**问题**: 拖拽时页面自动滚动，导致拖拽体验不佳。

**解决方案**: 配置 `scroll` 和 `scrollSensitivity`。

```typescript
const sortable = Sortable.create(toolListElement, {
  scroll: true, // 启用智能滚动
  scrollSensitivity: 30, // 鼠标距离边界 30px 时触发滚动
  scrollSpeed: 10, // 滚动速度（像素/帧）
  
  // 如果工具列表在固定高度的容器中
  // 需要指定滚动容器
  // scrollContainer: document.getElementById('tool-container'),
});
```

---

## 7. 完整示例代码

### 7.1 TypeScript 实现

```typescript
// src/ui/ToolList.ts
import Sortable from 'sortablejs';
import type { Tool } from '@/lib/types';
import { saveToolOrder } from '@/lib/storage';

export class ToolList {
  private container: HTMLElement | null = null;
  private sortable: Sortable | null = null;
  private tools: Tool[] = [];
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(tools: Tool[]) {
    this.tools = tools;
  }

  /**
   * 挂载工具列表到 DOM
   */
  public mount(parentElement: HTMLElement): void {
    this.injectStyles();
    this.container = this.createContainer();
    this.renderTools();
    this.initSortable();
    
    parentElement.appendChild(this.container);
  }

  /**
   * 卸载工具列表
   */
  public unmount(): void {
    if (this.sortable) {
      this.sortable.destroy();
      this.sortable = null;
    }
    
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.container = null;
  }

  /**
   * 创建容器元素
   */
  private createContainer(): HTMLElement {
    const ul = document.createElement('ul');
    ul.id = '__github-switcher-tool-list';
    ul.className = '__github-switcher-tool-list';
    ul.setAttribute('role', 'list');
    ul.setAttribute('aria-label', '可排序的工具列表');
    return ul;
  }

  /**
   * 渲染工具列表
   */
  private renderTools(): void {
    if (!this.container) return;
    
    // 清空容器
    this.container.innerHTML = '';
    
    // 渲染每个工具
    this.tools.forEach((tool) => {
      const toolItem = this.createToolItem(tool);
      this.container!.appendChild(toolItem);
    });
  }

  /**
   * 创建单个工具项
   */
  private createToolItem(tool: Tool): HTMLElement {
    const li = document.createElement('li');
    li.className = 'tool-item';
    li.setAttribute('role', 'listitem');
    li.setAttribute('data-tool-id', String(tool.order));
    
    // 拖拽手柄
    const handle = document.createElement('span');
    handle.className = 'tool-drag-handle';
    handle.setAttribute('role', 'button');
    handle.setAttribute('aria-label', `拖拽以调整 ${tool.name} 的顺序`);
    handle.setAttribute('tabindex', '0');
    handle.textContent = '⋮⋮';
    
    // 工具图标
    const icon = document.createElement('img');
    icon.className = 'tool-icon';
    icon.src = tool.iconUrl || '';
    icon.alt = `${tool.name} icon`;
    icon.width = 16;
    icon.height = 16;
    
    // 工具信息
    const info = document.createElement('div');
    info.className = 'tool-info';
    info.id = `tool-${tool.order}-desc`;
    
    const name = document.createElement('span');
    name.className = 'tool-name';
    name.textContent = tool.name;
    
    const description = document.createElement('span');
    description.className = 'tool-description';
    description.textContent = tool.description || '';
    
    info.appendChild(name);
    info.appendChild(description);
    
    // 启用/禁用开关
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'tool-toggle';
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = tool.enabled;
    toggleInput.addEventListener('change', (e) => {
      this.handleToggleChange(tool, (e.target as HTMLInputElement).checked);
    });
    
    toggleLabel.appendChild(toggleInput);
    
    // 组装元素
    li.appendChild(handle);
    li.appendChild(icon);
    li.appendChild(info);
    li.appendChild(toggleLabel);
    
    // 添加键盘导航
    handle.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e, li);
    });
    
    return li;
  }

  /**
   * 初始化 Sortable
   */
  private initSortable(): void {
    if (!this.container) return;
    
    let lastTarget: HTMLElement | null = null;
    
    this.sortable = Sortable.create(this.container, {
      handle: '.tool-drag-handle',
      animation: 150,
      easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      ghostClass: '__github-switcher-tool-ghost',
      chosenClass: '__github-switcher-tool-chosen',
      dragClass: '__github-switcher-tool-drag',
      draggable: '.tool-item',
      dataIdAttr: 'data-tool-id',
      
      // 智能滚动
      scroll: true,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      
      // 触摸设备支持
      delay: 100,
      delayOnTouchOnly: true,
      touchStartThreshold: 10,
      
      onStart: (evt) => {
        console.log('开始拖拽:', evt.oldIndex);
      },
      
      onMove: (evt) => {
        // 移除上一个目标的高亮
        if (lastTarget) {
          lastTarget.classList.remove('drop-target');
        }
        
        // 高亮当前目标
        const target = evt.related as HTMLElement;
        if (target) {
          target.classList.add('drop-target');
          lastTarget = target;
        }
        
        return true;
      },
      
      onEnd: (evt) => {
        // 移除高亮
        if (lastTarget) {
          lastTarget.classList.remove('drop-target');
          lastTarget = null;
        }
        
        // 更新 ARIA Live Region
        const toolName = evt.item.querySelector('.tool-name')?.textContent;
        const newIndex = evt.newIndex! + 1;
        this.updateLiveRegion(`${toolName} 已移动到位置 ${newIndex}`);
        
        // 获取新顺序并保存
        const newOrder = this.sortable!.toArray().map(Number);
        this.debounceSaveToolOrder(newOrder);
        
        console.log('拖拽完成. 旧位置:', evt.oldIndex, '新位置:', evt.newIndex);
      }
    });
  }

  /**
   * 处理启用/禁用切换
   */
  private handleToggleChange(tool: Tool, enabled: boolean): void {
    console.log(`工具 ${tool.name} ${enabled ? '启用' : '禁用'}`);
    // 调用 storage API 保存启用状态
    // TODO: 实现 toggleToolEnabled(tool.order, enabled)
  }

  /**
   * 处理键盘导航
   */
  private handleKeyboardNavigation(e: KeyboardEvent, toolItem: HTMLElement): void {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.moveItemUp(toolItem);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveItemDown(toolItem);
        break;
    }
  }

  /**
   * 向上移动工具项
   */
  private moveItemUp(item: HTMLElement): void {
    const prev = item.previousElementSibling;
    if (prev) {
      item.parentNode?.insertBefore(item, prev);
      this.saveAfterKeyboardMove(item);
    }
  }

  /**
   * 向下移动工具项
   */
  private moveItemDown(item: HTMLElement): void {
    const next = item.nextElementSibling;
    if (next) {
      item.parentNode?.insertBefore(next, item);
      this.saveAfterKeyboardMove(item);
    }
  }

  /**
   * 键盘移动后保存并保持焦点
   */
  private saveAfterKeyboardMove(item: HTMLElement): void {
    // 保存新顺序
    const newOrder = this.sortable!.toArray().map(Number);
    this.debounceSaveToolOrder(newOrder);
    
    // 保持焦点
    (item.querySelector('.tool-drag-handle') as HTMLElement)?.focus();
    
    // 更新 ARIA Live Region
    const toolName = item.querySelector('.tool-name')?.textContent;
    const newIndex = Array.from(item.parentNode!.children).indexOf(item) + 1;
    this.updateLiveRegion(`${toolName} 已移动到位置 ${newIndex}`);
  }

  /**
   * 防抖保存工具顺序
   */
  private debounceSaveToolOrder(newOrder: number[]): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        await saveToolOrder(newOrder);
        console.log('工具顺序已保存:', newOrder);
      } catch (error) {
        console.error('保存失败:', error);
        // TODO: 显示错误提示
      } finally {
        this.saveTimeout = null;
      }
    }, 300);
  }

  /**
   * 更新 ARIA Live Region（屏幕阅读器通知）
   */
  private updateLiveRegion(message: string): void {
    let liveRegion = document.getElementById('sortable-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sortable-live-region';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
  }

  /**
   * 注入样式
   */
  private injectStyles(): void {
    if (document.getElementById('__github-switcher-tool-list-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = '__github-switcher-tool-list-styles';
    style.textContent = `
      .__github-switcher-tool-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .tool-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        margin-bottom: 8px;
        background: #ffffff;
        transition: transform 0.15s ease, background-color 0.15s ease;
      }

      .tool-drag-handle {
        cursor: grab;
        color: #6e7781;
        font-size: 16px;
        padding: 4px;
        margin-right: 12px;
        user-select: none;
        transition: color 0.2s ease;
      }

      .tool-drag-handle:hover {
        color: #24292f;
      }

      .tool-drag-handle:active {
        cursor: grabbing;
      }

      .tool-icon {
        width: 16px;
        height: 16px;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .tool-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .tool-name {
        font-size: 14px;
        font-weight: 600;
        color: #24292f;
      }

      .tool-description {
        font-size: 12px;
        color: #656d76;
        margin-top: 2px;
      }

      .tool-toggle {
        margin-left: 16px;
      }

      /* 拖拽副本 */
      .__github-switcher-tool-ghost {
        opacity: 0.4 !important;
        background: #f6f8fa !important;
        border: 2px dashed #d0d7de !important;
      }

      /* 被选中的工具 */
      .__github-switcher-tool-chosen {
        background: #ddf4ff !important;
        border-color: #54aeff !important;
        box-shadow: 0 0 0 3px rgba(84, 174, 255, 0.2) !important;
      }

      /* 拖拽中的工具 */
      .__github-switcher-tool-drag {
        opacity: 0.8 !important;
        transform: rotate(2deg) !important;
        cursor: grabbing !important;
      }

      /* 目标位置高亮 */
      .tool-item.drop-target {
        border-top: 3px solid #0969da !important;
      }

      @media (prefers-color-scheme: dark) {
        .tool-item {
          background: #22272e;
          border-color: #444c56;
        }

        .tool-name {
          color: #adbac7;
        }

        .tool-description {
          color: #768390;
        }

        .__github-switcher-tool-ghost {
          background: #2d333b !important;
        }

        .__github-switcher-tool-chosen {
          background: #1c2a38 !important;
          border-color: #388bfd !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
```

---

### 7.2 使用示例

```typescript
// src/pages/options.ts
import { ToolList } from '@/ui/ToolList';
import { loadToolConfiguration } from '@/lib/storage';
import { TOOLS } from '@/lib/config';

async function init() {
  // 加载用户配置
  const config = await loadToolConfiguration();
  
  // 根据用户配置排序工具
  const sortedTools = config.toolOrder
    ? config.toolOrder.map(id => TOOLS.find(t => t.order === id)!)
    : TOOLS;
  
  // 创建并挂载工具列表
  const toolList = new ToolList(sortedTools);
  const container = document.getElementById('tool-list-container');
  if (container) {
    toolList.mount(container);
  }
}

init();
```

---

## 8. 推荐的项目集成步骤

### 步骤 1: 安装 SortableJS

```bash
pnpm add sortablejs
pnpm add -D @types/sortablejs
```

### 步骤 2: 创建 ToolList 组件

参考第 7.1 节的完整示例代码。

### 步骤 3: 创建设置页面 HTML

```html
<!-- src/pages/options.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>GitHub Switcher - 工具管理</title>
</head>
<body>
  <header>
    <h1>工具管理</h1>
    <p>拖拽工具可调整顺序，开关可启用/禁用工具</p>
  </header>
  
  <main>
    <div id="tool-list-container"></div>
  </main>
  
  <footer>
    <button id="reset-button">重置为默认</button>
  </footer>
  
  <script type="module" src="./options.ts"></script>
</body>
</html>
```

### 步骤 4: 配置 Plasmo manifest

```json
// package.json
{
  "manifest": {
    "options_ui": {
      "page": "pages/options.html",
      "open_in_tab": true
    }
  }
}
```

### 步骤 5: 测试

```bash
pnpm dev
```

在 Chrome 中打开 `chrome://extensions/`，点击扩展的"详细信息"，然后点击"扩展程序选项"。

---

## 9. 参考资料

### 官方文档
- **SortableJS GitHub**: https://github.com/SortableJS/Sortable
- **SortableJS API 文档**: https://github.com/SortableJS/Sortable#options
- **Chrome Extension Options UI**: https://developer.chrome.com/docs/extensions/mv3/options/

### 示例项目
- **Todoist (使用 SortableJS)**: https://todoist.com
- **Trello (类似拖拽体验)**: https://trello.com

### 无障碍标准
- **ARIA Authoring Practices (Sortable)**: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- **Material Design - Lists**: https://m3.material.io/components/lists/overview

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**作者**: GitHub Copilot  
**审核状态**: 待审核
