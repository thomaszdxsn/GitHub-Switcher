# 合约与接口定义：工具管理设置页面

**功能分支**: `004-tool-management`  
**创建日期**: 2025-11-16  
**状态**: 已完成

本文档定义了工具管理功能的公共接口、数据合约和集成契约。

## JSON Schema 文件

本目录包含以下 JSON Schema 文件，用于验证数据结构：

### 1. `tool-config.schema.json`
定义 `UserToolConfiguration` 数据模型（存储在 chrome.storage.sync/local）

**验证规则**:
- `toolOrder`: 数组，长度 9，元素为 1-9 的唯一整数
- `enabledTools`: 数组，长度 1-9，元素为 1-9 的唯一整数（至少 1 个）
- `meta`: 包含 version（≥1）、updatedAt（ISO 8601）、source（枚举值）

**使用示例**:
```typescript
import Ajv from 'ajv';
import schema from './tool-config.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

const isValid = validate({
  toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  enabledTools: [1, 2, 3],
  meta: {
    version: 1,
    updatedAt: '2025-11-16T10:30:00.000Z',
    source: 'options'
  }
});

if (!isValid) {
  console.error('Validation errors:', validate.errors);
}
```

### 2. `tool-definition.schema.json`
定义 `ToolDefinition` 数据模型（硬编码在 src/lib/config.ts）

**验证规则**:
- `id`: 整数，范围 1-9
- `name`: 字符串，长度 1-30
- `description`: 字符串，长度 40-60
- `icon`: 字符串，SVG 或 Data URL
- `urlTemplate`: 字符串，必须包含 `{owner}` 和 `{repo}` 占位符
- `defaultOrder`: 整数，范围 1-9

**使用示例**:
```typescript
const toolDef: ToolDefinition = {
  id: 1,
  name: 'GitHub.dev',
  description: "GitHub's official online code editor for quick edits",
  icon: '<svg>...</svg>',
  urlTemplate: 'https://github.dev/{owner}/{repo}',
  defaultOrder: 1
};
```

## 公共 API

### 存储 API

#### `loadToolConfiguration()`

加载用户工具配置（包含顺序和启用状态）

**签名**:
```typescript
async function loadToolConfiguration(): Promise<UserToolConfiguration>
```

**返回值**:
```typescript
interface UserToolConfiguration {
  toolOrder: number[];      // 工具顺序数组（1-9）
  enabledTools: number[];   // 启用的工具 ID 列表
}
```

**行为**:
1. 从 `chrome.storage.sync` 读取配置
2. 如果 `toolOrder` 不存在，生成默认顺序
3. 校验数据完整性（去重、过滤无效 ID）
4. 如果数据损坏，返回默认配置并触发警告

**错误处理**:
- 无法访问 `chrome.storage.sync`: 返回默认配置
- 数据格式错误: 返回默认配置并记录警告

---

#### `saveToolOrder()`

保存工具顺序到存储

**签名**:
```typescript
async function saveToolOrder(toolOrder: number[]): Promise<void>
```

**参数**:
- `toolOrder`: 工具顺序数组，包含 1-9 的所有数字（无重复）

**前置条件**:
- `toolOrder.length === 9`
- `toolOrder` 包含 1-9 的所有数字
- 无重复 ID

**后置条件**:
- `chrome.storage.sync` 中的 `toolOrder` 字段已更新
- 触发 `chrome.storage.onChanged` 事件

**错误处理**:
- 参数校验失败: 抛出 `Error('Invalid toolOrder')`
- 存储写入失败: 抛出 `Error('Failed to save toolOrder')`

---

#### `toggleToolEnabled()`

切换工具启用/禁用状态

**签名**:
```typescript
async function toggleToolEnabled(toolId: number, enabled: boolean): Promise<void>
```

**参数**:
- `toolId`: 工具 ID（1-9）
- `enabled`: 启用状态（true = 启用, false = 禁用）

**前置条件**:
- `1 <= toolId <= 9`

**后置条件**:
- 如果 `enabled === true`，`enabledTools` 包含 `toolId`
- 如果 `enabled === false`，`enabledTools` 不包含 `toolId`
- `chrome.storage.sync` 中的 `enabledTools` 字段已更新
- 触发 `chrome.storage.onChanged` 事件

**错误处理**:
- 参数校验失败: 抛出 `Error('Invalid toolId or enabled')`
- 存储写入失败: 抛出 `Error('Failed to toggle tool')`

---

#### `resetToDefault()`

重置为默认配置

**签名**:
```typescript
async function resetToDefault(): Promise<void>
```

**前置条件**:
- 用户已确认重置操作（通过确认对话框）

**后置条件**:
- `chrome.storage.sync` 中的配置恢复为 `DEFAULT_PREFERENCES`
- `toolOrder` 恢复为默认顺序（1, 2, 3, ..., 9）
- `enabledTools` 恢复为所有工具启用（[1, 2, 3, 4, 5, 6, 7, 8, 9]）
- 触发 `chrome.storage.onChanged` 事件

**错误处理**:
- 用户取消重置: 不执行任何操作
- 存储写入失败: 抛出 `Error('Failed to reset configuration')`

---

### UI API

#### `ToolListRenderer.render()`

渲染工具列表到 DOM

**签名**:
```typescript
class ToolListRenderer {
  render(preferences: UserPreferences): void
}
```

**参数**:
- `preferences`: 用户偏好设置（包含 `toolOrder` 和 `enabledTools`）

**行为**:
1. 清空工具列表容器
2. 根据 `toolOrder` 排序工具
3. 为每个工具创建工具项 DOM 元素
4. 初始化 SortableJS 拖拽功能
5. 为开关按钮添加事件监听器

**前置条件**:
- DOM 中存在 `#tool-list` 容器

**后置条件**:
- 工具列表 DOM 已渲染
- 拖拽功能已激活
- 开关按钮已绑定事件

---

#### `getToolDescription()`

获取工具描述

**签名**:
```typescript
function getToolDescription(toolId: number): string
```

**参数**:
- `toolId`: 工具 ID（1-9）

**返回值**:
- 工具的简短描述（20-30 汉字）

**行为**:
1. 从 `TOOL_DESCRIPTIONS` 映射中查找描述
2. 如果找不到，返回 "暂无描述"

**错误处理**:
- 无效的 `toolId`: 返回 "暂无描述"

---

## 数据合约

### UserPreferences

**存储位置**: `chrome.storage.sync`

**数据结构**:
```typescript
interface UserPreferences {
  openInNewTab: boolean;     // 是否在新标签页打开工具链接
  enabledTools: number[];    // 启用的工具 ID 列表
  toolOrder?: number[];      // 工具顺序数组（可选）
}
```

**约束**:
- `enabledTools`: 数组元素必须在 1-9 范围内，无重复
- `toolOrder`: 如果存在，必须包含 1-9 的所有数字，无重复

**默认值**:
```json
{
  "openInNewTab": true,
  "enabledTools": [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
```

**版本兼容性**:
- v0.3.0 → v0.4.0: 新增 `toolOrder` 字段（可选），向后兼容
- 如果 `toolOrder` 不存在，使用 `TOOLS` 数组的默认顺序

---

### ToolEntry

**定义位置**: `src/lib/config.ts`

**数据结构**:
```typescript
interface ToolEntry {
  name: string;              // 工具名称
  urlTemplate: string;       // URL 模板
  order: number;             // 默认显示顺序（1-9）
  iconPath: string;          // 图标路径
  note?: string;             // 可选的使用提示
  enableCondition?: ToolEnableCondition;  // 启用条件
}
```

**约束**:
- `order`: 必须在 1-9 范围内，不重复
- `iconPath`: 必须指向有效的 16x16 图标文件

**不变性**: `TOOLS` 数组为 `readonly`，不可修改

---

### ToolDescription

**定义位置**: `src/lib/toolDescriptions.ts`

**数据结构**:
```typescript
const TOOL_DESCRIPTIONS: Record<number, string> = {
  1: '描述文本（20-30 汉字）',
  2: '描述文本（20-30 汉字）',
  // ... 其他工具
};
```

**约束**:
- 键: 工具 ID（1-9）
- 值: 简短描述（20-30 个汉字）

**不变性**: `TOOL_DESCRIPTIONS` 为常量，不可修改

---

## 事件合约

### chrome.storage.onChanged

**触发时机**:
- 用户在设置页面调整工具顺序（`toolOrder` 变化）
- 用户在设置页面切换工具启用状态（`enabledTools` 变化）
- 用户在设置页面重置配置（`toolOrder` 和 `enabledTools` 同时变化）

**事件数据**:
```typescript
chrome.storage.onChanged.addListener((changes, areaName) => {
  // changes: { [key: string]: { oldValue: any, newValue: any } }
  // areaName: 'sync' | 'local' | 'managed'
  
  if (areaName === 'sync') {
    if (changes.toolOrder) {
      // 工具顺序已变化，重新渲染工具菜单
    }
    if (changes.enabledTools) {
      // 启用工具列表已变化，重新渲染工具菜单
    }
  }
});
```

**消费者**:
- Content Script (`src/contents/index.ts`): 监听配置变化，动态更新工具菜单
- Options Page (`src/options/index.ts`): 监听配置变化，同步多标签页状态

---

### SortableJS onEnd 事件

**触发时机**:
- 用户完成拖拽操作（松开鼠标）

**事件数据**:
```typescript
sortable.onEnd = (evt: SortableEvent) => {
  // evt.oldIndex: 拖拽前的索引
  // evt.newIndex: 拖拽后的索引
  // evt.item: 被拖拽的 DOM 元素
};
```

**处理逻辑**:
1. 从 DOM 提取新的工具顺序（基于 `data-tool-id` 属性）
2. 调用 `saveToolOrder(newOrder)` 保存到 chrome.storage.sync

---

## 集成契约

### 与 Content Script 的集成

**契约**:
1. Content Script 必须监听 `chrome.storage.onChanged` 事件
2. 当 `toolOrder` 或 `enabledTools` 变化时，Content Script 必须重新渲染工具菜单
3. 工具菜单的渲染顺序必须与 `toolOrder` 一致
4. 工具菜单只显示 `enabledTools` 中的工具

**接口**:
```typescript
// Content Script 中的接口
class ToolDropdown {
  updateTools(enabledTools: number[]): void;
  updateToolOrder(toolOrder: number[]): void;
}
```

---

### 与现有 storage 模块的集成

**契约**:
1. 扩展 `UserPreferences` 类型以支持 `toolOrder` 字段
2. `DEFAULT_PREFERENCES` 保持向后兼容（`toolOrder` 为可选）
3. `loadPreferences()` 必须处理 `toolOrder` 不存在的情况
4. `savePreferences()` 必须支持保存 `toolOrder` 字段

**接口**:
```typescript
// src/lib/storage.ts 中的接口（扩展）
export async function loadPreferences(): Promise<UserPreferences>;
export async function savePreferences(preferences: UserPreferences): Promise<void>;
```

---

### 与 TOOLS 配置的集成

**契约**:
1. `toolOrder` 中的数字必须对应 `TOOLS` 数组中的 `order` 字段
2. 新增工具时，必须更新 `TOOLS` 数组，并为新工具分配唯一的 `order`
3. 新增工具时，必须在 `TOOL_DESCRIPTIONS` 中添加描述

**接口**:
```typescript
// src/lib/config.ts 中的接口（只读）
export const TOOLS: readonly ToolEntry[];

// src/lib/toolDescriptions.ts 中的接口（只读）
export const TOOL_DESCRIPTIONS: Record<number, string>;
```

---

## 性能合约

### 拖拽性能

**承诺**:
- 拖拽响应延迟 ≤50ms（P95）
- 使用 `requestAnimationFrame` 优化 DOM 更新
- 避免在拖拽过程中频繁写入 chrome.storage.sync（使用防抖）

**衡量方式**:
- 使用 Performance API 测量拖拽开始到 DOM 更新的延迟

---

### 存储性能

**承诺**:
- chrome.storage.sync 保存延迟 ≤500ms（P95）
- 批量更新（同时修改 `toolOrder` 和 `enabledTools`）合并为一次写入

**衡量方式**:
- 使用 Performance API 测量 `chrome.storage.sync.set()` 调用的延迟

---

### 渲染性能

**承诺**:
- 设置页面加载时间 ≤200ms（P95，包含从 storage 读取配置的时间）
- 工具列表渲染延迟 ≤100ms（P95）

**衡量方式**:
- 使用 Performance API 测量从 `DOMContentLoaded` 到工具列表渲染完成的时间

---

## 安全合约

### XSS 防护

**承诺**:
- 所有用户输入（如工具描述）必须经过 HTML 转义
- 使用 `textContent` 而非 `innerHTML` 插入文本内容

**实现**:
```typescript
// 安全的文本插入
element.textContent = toolDescription;

// 不安全的文本插入（禁止使用）
// element.innerHTML = toolDescription;
```

---

### 数据校验

**承诺**:
- 所有从 chrome.storage.sync 读取的数据必须经过校验
- 校验失败时，恢复为默认配置并显示警告

**实现**:
```typescript
function validateToolOrder(toolOrder: number[] | undefined): boolean {
  if (!toolOrder) return true;
  if (toolOrder.length !== 9) return false;
  if (new Set(toolOrder).size !== 9) return false;
  for (const id of toolOrder) {
    if (id < 1 || id > 9) return false;
  }
  return true;
}
```

---

## 测试合约

### 单元测试

**承诺**:
- 所有公共 API 必须有单元测试覆盖
- 测试覆盖率 ≥80%

**测试文件**:
- `tests/unit/toolActions.test.ts`
- `tests/unit/toolDescriptions.test.ts`
- `tests/unit/storage.test.ts`（扩展现有测试）

---

### E2E 测试

**承诺**:
- 核心用户流程必须有 E2E 测试覆盖
- 测试工具: Playwright

**测试文件**:
- `tests/e2e/drag-and-drop.test.ts`
- `tests/e2e/toggle-enabled.test.ts`
- `tests/e2e/reset-config.test.ts`

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**审核状态**: 待审核
