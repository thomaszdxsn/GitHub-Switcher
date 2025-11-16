# 数据模型：工具管理设置页面

**功能分支**: `004-tool-management`  
**创建日期**: 2025-11-16  
**状态**: 草稿

## 核心数据模型

### UserPreferences（用户偏好设置）

```typescript
/**
 * 用户偏好设置（存储在 chrome.storage.sync）
 */
interface UserPreferences {
  /** 是否在新标签页打开工具链接（现有字段） */
  openInNewTab: boolean;

  /** 启用的工具 ID 列表（现有字段） */
  enabledTools: number[];

  /** 工具顺序数组（新增字段，可选） */
  toolOrder?: number[];
}

/**
 * 默认用户偏好设置
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  openInNewTab: true,
  enabledTools: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 所有工具默认启用
  toolOrder: undefined, // 可选字段，如果不存在则使用 TOOLS 数组的 order 字段
};
```

**字段说明**:
- `openInNewTab`: 布尔值，控制工具链接是否在新标签页打开（现有功能）
- `enabledTools`: 数字数组，存储启用的工具 ID（对应 TOOLS 数组的 order 字段）
- `toolOrder`: 可选数字数组，存储工具的自定义顺序（数组元素为工具 ID，顺序即为显示顺序）

**数据约束**:
- `enabledTools` 和 `toolOrder` 中的数字必须在 1-9 范围内（对应 9 个工具）
- `enabledTools` 不允许重复 ID
- `enabledTools` 至少包含 1 个工具 ID（FR-011 约束）
- `toolOrder` 是可选字段，如果不存在则使用默认顺序（TOOLS 数组的 order 字段 1-9）
- `toolOrder` 如果存在，必须包含所有 9 个唯一工具 ID（1-9，无重复，无缺失）

---

### ToolEntry（工具配置）

```typescript
/**
 * 工具静态配置（定义在 TOOLS 数组中）
 */
interface ToolEntry {
  /** 工具名称（英文） */
  name: string;

  /** URL 模板，包含 {owner} 和 {repo} 占位符 */
  urlTemplate: string;

  /** 默认显示顺序（1-9） */
  order: number;

  /** 工具图标路径（相对于 assets/） */
  iconPath: string;

  /** 可选的使用提示（如 "optimal for .ipynb files"） */
  note?: string;

  /** 启用条件（定义工具在何种页面类型下可用） */
  enableCondition?: ToolEnableCondition;
}
```

**字段说明**:
- `name`: 工具的显示名称，用于工具菜单和设置页面
- `urlTemplate`: 工具的 URL 模板，用于生成跳转链接
- `order`: 工具的默认显示顺序（1 表示默认排在第 1 位）
- `iconPath`: 工具的 16x16 图标路径
- `note`: 可选的使用提示，用于工具菜单（如 "optimal for .ipynb files"）
- `enableCondition`: 可选的启用条件，定义工具在何种页面类型下可用（如 nbviewer 仅在 .ipynb 文件页面可用）

---

### ToolDescription（工具描述）

```typescript
/**
 * 工具描述映射（硬编码在代码中）
 */
const TOOL_DESCRIPTIONS: Record<number, string> = {
  1: 'GitHub 官方在线编辑器，支持直接在浏览器中编辑代码',
  2: 'AI 驱动的代码库文档生成工具，快速理解项目结构',
  3: 'Google 出品的代码库可视化工具,提供交互式代码导航',
  4: '在线 IDE，支持实时运行和预览前端项目',
  5: '快速启动在线开发环境，支持多种框架和模板',
  6: 'Jupyter Notebook 在线查看器，提供更好的 .ipynb 文件渲染体验',
  7: '可视化展示 Git 仓库的分支关系与提交历史',
  8: '将整个代码库打包为单个文本文件，方便分享和分析',
  9: '可视化展示文件的完整修改历史与版本演进',
};

/**
 * 获取工具描述
 * @param toolId - 工具 ID（1-9）
 * @returns 工具的简短描述（20-30 个汉字）
 */
function getToolDescription(toolId: number): string {
  return TOOL_DESCRIPTIONS[toolId] || '暂无描述';
}
```

**字段说明**:
- `TOOL_DESCRIPTIONS`: 工具 ID 到描述文本的映射
- 每个描述长度控制在 20-30 个汉字，简洁明了

---

### ToolItem（工具项 UI 模型）

```typescript
/**
 * 工具项 UI 模型（在设置页面中展示）
 */
interface ToolItemViewModel {
  /** 工具 ID（1-9） */
  id: number;

  /** 工具名称 */
  name: string;

  /** 工具图标 URL */
  iconUrl: string;

  /** 工具描述 */
  description: string;

  /** 是否启用 */
  enabled: boolean;

  /** 在列表中的位置（基于 toolOrder） */
  position: number;
}
```

**字段说明**:
- `id`: 工具的唯一标识符（对应 TOOLS 数组的 order 字段）
- `name`: 工具名称，用于 UI 显示
- `iconUrl`: 工具图标的完整 URL（chrome-extension://...）
- `description`: 工具的简短描述，用于帮助用户识别用途
- `enabled`: 工具的启用/禁用状态（从 enabledTools 读取）
- `position`: 工具在列表中的显示位置（从 toolOrder 读取，或使用默认 order）

---

## 数据流

### 加载用户配置

```
用户打开设置页面
    ↓
调用 loadPreferences()
    ↓
从 chrome.storage.sync 读取数据
    ↓
数据校验（检查重复 ID、无效 ID）
    ↓
如果数据有效，返回 UserPreferences
    ↓
如果数据无效或不存在，返回 DEFAULT_PREFERENCES
    ↓
基于 toolOrder（或默认 order）对工具排序
    ↓
基于 enabledTools 过滤工具
    ↓
生成 ToolItemViewModel 数组
    ↓
渲染工具列表 UI
```

### 保存工具顺序

```
用户拖拽工具完成
    ↓
SortableJS 触发 onEnd 事件
    ↓
从 DOM 提取新的工具顺序（基于 data-tool-id）
    ↓
生成新的 toolOrder 数组（如 [2, 1, 3, 5, 4, 6, 7, 8, 9]）
    ↓
调用 saveToolOrder(newOrder)
    ↓
读取当前 UserPreferences
    ↓
更新 toolOrder 字段
    ↓
调用 savePreferences()
    ↓
保存到 chrome.storage.sync
    ↓
chrome.storage.sync 自动同步到其他 Chrome 实例
    ↓
Content Script 监听 chrome.storage.onChanged 事件
    ↓
重新渲染工具菜单（基于新的 toolOrder）
```

### 切换工具启用/禁用

```
用户点击开关按钮
    ↓
调用 toggleToolEnabled(toolId, newState)
    ↓
读取当前 UserPreferences
    ↓
如果 newState 为 true，将 toolId 添加到 enabledTools
    ↓
如果 newState 为 false，从 enabledTools 移除 toolId
    ↓
调用 savePreferences()
    ↓
保存到 chrome.storage.sync
    ↓
更新开关按钮的视觉状态（CSS 类切换）
    ↓
chrome.storage.sync 自动同步到其他 Chrome 实例
    ↓
Content Script 监听 chrome.storage.onChanged 事件
    ↓
重新渲染工具菜单（只显示 enabledTools 中的工具）
```

### 重置为默认配置

```
用户点击"重置为默认"按钮
    ↓
显示确认对话框："确定要重置为默认配置吗？此操作不可撤销。"
    ↓
用户点击"确定"
    ↓
调用 resetToDefault()
    ↓
调用 savePreferences(DEFAULT_PREFERENCES)
    ↓
保存默认配置到 chrome.storage.sync
    ↓
刷新设置页面 UI（重新渲染工具列表）
    ↓
chrome.storage.sync 自动同步到其他 Chrome 实例
    ↓
Content Script 监听 chrome.storage.onChanged 事件
    ↓
重新渲染工具菜单（显示所有工具，按默认顺序）
```

---

## 数据校验规则

### toolOrder 校验

```typescript
/**
 * 校验 toolOrder 数组
 * @param toolOrder - 待校验的工具顺序数组
 * @returns 校验是否通过
 */
function validateToolOrder(toolOrder: number[] | undefined): boolean {
  // 如果 toolOrder 不存在，返回 true（使用默认顺序）
  if (!toolOrder) return true;

  // 检查是否包含所有 9 个工具 ID
  if (toolOrder.length !== 9) return false;

  // 检查是否包含重复 ID（使用 Set 去重）
  if (new Set(toolOrder).size !== 9) return false;

  // 检查是否包含无效 ID（不在 1-9 范围内）
  for (const id of toolOrder) {
    if (id < 1 || id > 9) return false;
  }

  return true;
}
```

### enabledTools 校验

```typescript
/**
 * 校验 enabledTools 数组
 * @param enabledTools - 待校验的启用工具数组
 * @returns 校验是否通过
 */
function validateEnabledTools(enabledTools: number[]): boolean {
  // enabledTools 可以为空数组（所有工具禁用）
  if (enabledTools.length === 0) return true;

  // 检查是否包含重复 ID
  if (new Set(enabledTools).size !== enabledTools.length) return false;

  // 检查是否包含无效 ID（不在 1-9 范围内）
  for (const id of enabledTools) {
    if (id < 1 || id > 9) return false;
  }

  return true;
}
```

---

## 存储结构

### chrome.storage.sync 数据示例

**默认配置**（首次安装）:
```json
{
  "openInNewTab": true,
  "enabledTools": [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
```

**自定义配置示例 1**（调整顺序，禁用部分工具）:
```json
{
  "openInNewTab": true,
  "enabledTools": [1, 2, 3, 5, 7, 9],
  "toolOrder": [2, 1, 3, 5, 7, 9, 4, 6, 8]
}
```
- 含义: DeepWiki 排在第 1 位，GitHub.dev 排在第 2 位，CodeSandbox、nbviewer、gitingest 被禁用

**自定义配置示例 2**（仅保留 2 个工具）:
```json
{
  "openInNewTab": false,
  "enabledTools": [1, 9],
  "toolOrder": [1, 9, 2, 3, 4, 5, 6, 7, 8]
}
```
- 含义: 只启用 GitHub.dev 和 githistory，其他工具禁用，在当前标签页打开链接

### 数据大小估算

- `openInNewTab`: 1 字节（布尔值）
- `enabledTools`: 最多 18 字节（9 个数字，每个 2 字节）
- `toolOrder`: 最多 18 字节（9 个数字，每个 2 字节）
- JSON 序列化开销: 约 50 字节（字段名、括号、逗号等）
- **总计**: 约 87 字节（<< 8KB 单键值对限制）

---

## 版本兼容性

### 从 v0.3.0 升级到 v0.4.0

**场景**: 用户从不支持 toolOrder 的旧版本升级到 v0.4.0

**处理逻辑**:
```typescript
async function loadPreferences(): Promise<UserPreferences> {
  const result = await chrome.storage.sync.get(DEFAULT_PREFERENCES);
  const prefs = result as UserPreferences;

  // 如果 toolOrder 不存在，生成默认顺序（基于 TOOLS 数组的 order 字段）
  if (!prefs.toolOrder) {
    prefs.toolOrder = TOOLS.map((tool) => tool.order).sort((a, b) => a - b);
    // 可选：自动保存默认 toolOrder 到 chrome.storage.sync
    // await savePreferences(prefs);
  }

  return prefs;
}
```

**结果**: 用户升级后，工具顺序保持为默认顺序（1-9），无需手动配置

---

### 未来新增工具时的数据迁移

**场景**: v0.5.0 新增第 10 个工具（如 "GitPod"）

**处理逻辑**:
```typescript
async function loadPreferences(): Promise<UserPreferences> {
  const result = await chrome.storage.sync.get(DEFAULT_PREFERENCES);
  const prefs = result as UserPreferences;

  // 检测是否有新工具未包含在 toolOrder 中
  const allToolIds = TOOLS.map((tool) => tool.order);
  const missingToolIds = allToolIds.filter((id) => !prefs.toolOrder?.includes(id));

  if (missingToolIds.length > 0) {
    // 将新工具添加到 toolOrder 末尾
    prefs.toolOrder = [...(prefs.toolOrder || []), ...missingToolIds];
    
    // 将新工具添加到 enabledTools（默认启用）
    prefs.enabledTools = [...prefs.enabledTools, ...missingToolIds];
    
    // 保存更新后的配置
    await savePreferences(prefs);
  }

  return prefs;
}
```

**结果**: 新工具自动添加到用户配置的末尾，默认启用，用户可在设置页面调整顺序或禁用

---

## 总结

本数据模型定义了工具管理功能的核心数据结构，包括:
- **UserPreferences**: 用户偏好设置（存储在 chrome.storage.sync）
- **ToolEntry**: 工具静态配置（定义在 TOOLS 数组）
- **ToolDescription**: 工具描述映射（硬编码）
- **ToolItemViewModel**: 工具项 UI 模型（用于渲染）

通过扩展现有的 `UserPreferences` 类型（新增 `toolOrder` 字段），实现了工具顺序的自定义功能，同时保持了向后兼容性（`toolOrder` 为可选字段）。

数据校验规则确保了配置数据的完整性和有效性，避免因数据损坏导致工具菜单异常。版本兼容性逻辑确保了从旧版本升级和未来新增工具时的平滑过渡。

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**审核状态**: 待审核
