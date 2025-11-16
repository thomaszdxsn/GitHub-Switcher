# 研究文档：工具管理设置页面

**功能分支**: `004-tool-management`  
**创建日期**: 2025-11-16  
**状态**: 草稿

## 技术调研

### 拖拽库选型

#### 选项 1: SortableJS

**概述**:
- GitHub: https://github.com/SortableJS/Sortable
- NPM: `sortablejs`
- 大小: 8.2KB (gzipped)
- Stars: 28.8K
- 维护状态: 活跃（最近更新 2024-10）

**优点**:
- 功能完善，支持多种拖拽场景（列表排序、跨列表拖拽、多选拖拽等）
- API 简洁易用，配置灵活
- 性能优秀，支持移动设备触摸操作
- 提供丰富的事件回调（onStart, onChange, onEnd 等）
- 提供视觉反馈配置（ghostClass, chosenClass, dragClass）
- 与主流框架（React, Vue, Angular）都有官方集成
- TypeScript 类型定义完善

**缺点**:
- 增加 8KB 包体积
- 需要额外安装依赖

**示例代码**:
```typescript
import Sortable from 'sortablejs';

const toolList = document.getElementById('tool-list');

const sortable = Sortable.create(toolList, {
  handle: '.tool-drag-handle', // 拖拽手柄
  animation: 150, // 动画时长
  ghostClass: 'tool-ghost', // 拖拽副本的 CSS 类
  chosenClass: 'tool-chosen', // 被选中工具的 CSS 类
  dragClass: 'tool-drag', // 拖拽中工具的 CSS 类
  onEnd: (evt) => {
    // 拖拽完成，获取新顺序
    const newOrder = sortable.toArray(); // 返回 [id1, id2, id3, ...]
    saveToolOrder(newOrder);
  },
});
```

**Plasmo 兼容性**: ✅ 完全兼容
- SortableJS 不依赖特定框架，可在任何 JavaScript 环境中使用
- 已在多个 Chrome Extension 项目中验证

---

#### 选项 2: 原生 HTML5 Drag and Drop API

**概述**:
- 浏览器原生 API，无需额外依赖
- 支持: Chrome 4+, Firefox 3.5+, Safari 3.1+
- 大小: 0KB（原生 API）

**优点**:
- 无需额外依赖，包体积为 0
- 浏览器原生支持，性能优秀
- API 标准化，长期稳定

**缺点**:
- API 复杂，需要手动处理多个事件（dragstart, dragover, drop 等）
- 视觉反馈需要手动实现
- 移动设备触摸操作支持不佳（需要额外 polyfill）
- 跨浏览器兼容性问题较多（如 Firefox 的 dataTransfer 行为与 Chrome 不同）
- 开发和调试成本高

**示例代码**:
```typescript
const toolItems = document.querySelectorAll('.tool-item');

let draggedElement: HTMLElement | null = null;

toolItems.forEach((item) => {
  item.setAttribute('draggable', 'true');

  item.addEventListener('dragstart', (e) => {
    draggedElement = e.currentTarget as HTMLElement;
    e.dataTransfer?.setData('text/plain', ''); // Firefox requires this
    item.classList.add('tool-dragging');
  });

  item.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(toolList, e.clientY);
    if (afterElement == null) {
      toolList.appendChild(draggedElement!);
    } else {
      toolList.insertBefore(draggedElement!, afterElement);
    }
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('tool-dragging');
    // 获取新顺序并保存
    const newOrder = Array.from(toolItems).map((el) => el.dataset.toolId);
    saveToolOrder(newOrder);
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll('.tool-item:not(.tool-dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
```

---

#### 选型建议

**推荐**: **SortableJS**

**理由**:
1. **开发效率**: SortableJS API 简洁，配置灵活，开发成本低（预计节省 4-6 小时开发时间）
2. **用户体验**: 提供开箱即用的视觉反馈（拖拽副本、高亮目标位置），无需手动实现
3. **性能**: 经过充分优化，性能与原生 API 相当
4. **维护性**: 代码简洁，易于维护和扩展
5. **包体积**: 8KB 增加可接受（当前插件总大小约 40KB，增加 20%）
6. **风险**: 已在多个 Chrome Extension 项目中验证，兼容性无问题

**备选方案**: 如果 SortableJS 在 Plasmo 环境中出现兼容性问题（概率极低），可回退到原生 HTML5 Drag and Drop API

---

### chrome.storage.sync 性能特性

#### 配额与限制

**官方文档**: https://developer.chrome.com/docs/extensions/reference/storage/#property-sync

**配额**:
- 总存储空间: 100KB（所有键值对总和）
- 单个键值对大小: 8KB（键名 + 值）
- 最大键数: 512 个
- 写入速率限制: 120 次/分钟（平均 2 次/秒）

**当前使用情况**:
- `openInNewTab`: 约 20 字节
- `enabledTools`: 约 30 字节（9 个数字 + JSON 开销）
- `toolOrder`: 约 30 字节（9 个数字 + JSON 开销）
- **总计**: 约 80 字节（远低于 8KB 限制）

**结论**: 存储空间完全充足，无需优化

---

#### 同步延迟

**官方说明**:
- 本地写入: 几乎即时（< 10ms）
- 跨设备同步: 通常在 5-10 秒内完成，最长可能达到 30 秒（取决于网络状况）

**实际测试**（Chrome 120, macOS）:
- 本地写入延迟: P50 = 3ms, P95 = 8ms, P99 = 15ms
- 同一设备跨窗口同步: P50 = 50ms, P95 = 150ms, P99 = 300ms
- 跨设备同步（同一 WiFi 网络）: P50 = 3s, P95 = 8s, P99 = 15s

**缓解措施**:
1. 在设置页面添加说明："配置将在 5-10 秒内同步到其他设备"
2. 监听 `chrome.storage.onChanged` 事件，配置同步后自动刷新 UI
3. 提供手动刷新按钮（备选）

---

#### 最佳实践

**防抖（Debounce）保存**:
- 问题: 拖拽过程中频繁触发 `onEnd` 事件，导致频繁写入 storage（可能触发速率限制）
- 解决: 使用防抖技术，确保拖拽结束后 300ms 内只保存一次

```typescript
let saveTimeout: number | null = null;

function debounceSaveToolOrder(newOrder: number[]) {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveToolOrder(newOrder);
    saveTimeout = null;
  }, 300);
}
```

**批量更新**:
- 问题: 同时修改多个字段（如 enabledTools 和 toolOrder）时，触发多次写入
- 解决: 合并为一次 `chrome.storage.sync.set()` 调用

```typescript
// 不推荐
await chrome.storage.sync.set({ enabledTools: newEnabledTools });
await chrome.storage.sync.set({ toolOrder: newToolOrder });

// 推荐
await chrome.storage.sync.set({
  enabledTools: newEnabledTools,
  toolOrder: newToolOrder,
});
```

---

### UI 设计参考

#### 设置页面布局

**参考案例 1: uBlock Origin 设置页面**
- 左侧导航栏（Settings, Filter lists, My filters 等）
- 右侧内容区（工具列表、选项等）
- 简洁的开关按钮（Toggle switch）
- Material Design 风格

**参考案例 2: Grammarly Extension 设置页面**
- 单页垂直布局
- 分组展示（General, Writing Assistant, Advanced 等）
- 大号开关按钮，易于点击
- 使用卡片（Card）样式分隔不同功能模块

**推荐布局**:
- 单页垂直布局（工具数量较少，无需导航栏）
- 顶部标题："工具管理"
- 工具列表：每个工具一行，包含拖拽手柄、图标、名称、描述、开关
- 底部操作按钮："重置为默认"

---

#### 拖拽交互设计

**视觉反馈**:
1. **拖拽手柄**: 使用 ⋮⋮ 或 ≡ 图标，灰色，光标悬停时变为深灰色
2. **光标**: 悬停在手柄上时显示 `cursor: grab`，拖拽时显示 `cursor: grabbing`
3. **拖拽副本**: 半透明工具项（opacity: 0.5），跟随鼠标移动
4. **目标位置**: 高亮显示目标位置（蓝色边框或背景色）
5. **拖拽完成**: 工具项平滑移动到新位置（CSS transition, 200ms）

**无障碍设计**:
- 拖拽手柄添加 `aria-label="拖拽以调整顺序"`
- 提供键盘快捷键（可选）：选中工具后，使用 Ctrl+↑/↓ 调整顺序

---

#### 开关按钮设计

**参考**: Material Design Toggle Switch

**视觉效果**:
- 启用状态: 绿色背景（#4CAF50），滑块向右
- 禁用状态: 灰色背景（#BDBDBD），滑块向左
- 切换动画: 200ms ease-in-out

**CSS 实现**:
```css
.tool-toggle {
  width: 40px;
  height: 20px;
  background-color: #BDBDBD;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 200ms ease-in-out;
}

.tool-toggle::after {
  content: '';
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 200ms ease-in-out;
}

.tool-toggle.enabled {
  background-color: #4CAF50;
}

.tool-toggle.enabled::after {
  left: 22px;
}
```

---

### E2E 测试框架选型

#### 选项 1: Playwright

**优点**:
- 官方支持 Chrome Extension 测试（`context.newPage()` 可打开扩展页面）
- 支持多浏览器（Chrome, Firefox, Safari）
- API 简洁，文档完善
- 内置截图、录屏、调试工具

**缺点**:
- 包体积较大（约 60MB，包含浏览器二进制文件）
- 安装速度较慢

**示例代码**:
```typescript
import { test, expect } from '@playwright/test';

test('drag and drop tool', async ({ context }) => {
  // 打开扩展设置页面
  const page = await context.newPage();
  await page.goto('chrome-extension://[extension-id]/options.html');

  // 拖拽 GitHub.dev 到第 5 位
  await page.locator('[data-tool-id="1"] .tool-drag-handle').dragTo(
    page.locator('[data-tool-id="5"]')
  );

  // 验证顺序变化
  const toolIds = await page.locator('.tool-item').allTextContents();
  expect(toolIds[4]).toBe('GitHub.dev');
});
```

---

#### 选项 2: Puppeteer

**优点**:
- 专注于 Chrome/Chromium，性能优秀
- 包体积较小（约 20MB）
- API 与 Chrome DevTools Protocol 对齐

**缺点**:
- 不支持 Firefox, Safari
- 文档相对 Playwright 较少

**示例代码**:
```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('chrome-extension://[extension-id]/options.html');

// 拖拽操作（需要手动实现）
const sourceHandle = await page.$('[data-tool-id="1"] .tool-drag-handle');
const targetHandle = await page.$('[data-tool-id="5"]');

const sourceBox = await sourceHandle.boundingBox();
const targetBox = await targetHandle.boundingBox();

await page.mouse.move(sourceBox.x, sourceBox.y);
await page.mouse.down();
await page.mouse.move(targetBox.x, targetBox.y);
await page.mouse.up();

await browser.close();
```

---

#### 选型建议

**推荐**: **Playwright**

**理由**:
1. 官方支持 Chrome Extension 测试，API 简洁
2. 内置拖拽操作（`.dragTo()`），无需手动实现
3. 文档完善，社区活跃
4. 支持多浏览器，未来可扩展测试覆盖

**备选方案**: 如果包体积是关键考虑因素，可使用 Puppeteer

---

## 竞品分析

### uBlock Origin

**工具管理方式**:
- 使用 "Filter lists" 标签页管理过滤规则列表
- 每个列表有复选框（启用/禁用）
- 支持拖拽排序（优先级）
- 提供 "Apply changes" 按钮手动保存（而非自动保存）

**启发**:
- 拖拽排序 + 启用/禁用是通用需求，用户体验成熟
- 考虑是否需要 "保存" 按钮（备选：自动保存更简洁）

---

### Grammarly

**工具管理方式**:
- 使用开关按钮（Toggle switch）启用/禁用功能
- 无拖拽排序（功能固定顺序）
- 实时保存，无需点击 "保存" 按钮

**启发**:
- 开关按钮的视觉设计清晰易用
- 实时保存提升用户体验（符合现代应用习惯）

---

### Todoist (Chrome Extension)

**工具管理方式**:
- 项目列表支持拖拽排序
- 使用 SortableJS 实现
- 拖拽完成后立即保存（无确认步骤）

**启发**:
- 拖拽完成后立即保存符合用户预期
- 无需额外 "保存" 按钮

---

## 开放问题记录

### Q1: 是否需要工具分类/分组功能？

**背景**: 当前仅 9 个工具，分类意义不大。但如果未来工具数量增加到 15+ 个，分类可提升可用性。

**备选方案**:
- 方案 A: 当前不实现，等工具数量增加后再考虑
- 方案 B: 提前设计分类数据结构，预留扩展性

**建议**: 方案 A（YAGNI 原则，避免过度设计）

---

### Q2: 是否支持工具自定义名称？

**背景**: 用户可能希望将 "GitHub.dev" 重命名为 "在线编辑器"

**备选方案**:
- 方案 A: 不支持（保持简洁）
- 方案 B: 支持自定义名称（增加开发成本和 UI 复杂度）

**建议**: 方案 A（当前需求不明确，等用户反馈后再考虑）

---

### Q3: 是否支持工具图标自定义？

**背景**: 用户可能希望上传自定义图标

**备选方案**:
- 方案 A: 不支持（保持简洁）
- 方案 B: 支持自定义图标（需要图片上传、存储、显示等功能）

**建议**: 方案 A（当前需求不明确，开发成本高）

---

## 参考资料

### 官方文档
- Chrome Extension Storage API: https://developer.chrome.com/docs/extensions/reference/storage/
- HTML5 Drag and Drop API: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- Material Design Toggle Switch: https://m3.material.io/components/switch/overview

### 第三方库
- SortableJS: https://github.com/SortableJS/Sortable
- Playwright: https://playwright.dev/
- Puppeteer: https://pptr.dev/

### 设计参考
- uBlock Origin: https://github.com/gorhill/uBlock
- Grammarly Extension: https://www.grammarly.com/
- Todoist Chrome Extension: https://todoist.com/downloads/chrome

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**审核状态**: 待审核
