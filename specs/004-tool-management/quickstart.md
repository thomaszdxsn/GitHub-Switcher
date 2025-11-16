# 快速开始：工具管理设置页面

**功能分支**: `004-tool-management`  
**创建日期**: 2025-11-16  
**目标受众**: 新加入项目的开发者

## 功能概述

本功能为 GitHub-Switcher 浏览器插件新增设置页面的"工具管理"模块，允许用户：
1. **拖拽排序**: 通过拖拽调整工具在菜单中的显示顺序，将常用工具排在最前面
2. **启用/禁用**: 通过开关按钮隐藏不需要的工具，简化菜单界面
3. **查看描述**: 每个工具显示一句简短描述，帮助用户识别其用途
4. **重置配置**: 一键恢复为默认配置（所有工具启用，默认顺序）

## 5 分钟快速上手

### 1. 环境准备

确保已安装以下工具：
```bash
# Node.js 18+
node --version  # 应输出 v18.0.0 或更高

# pnpm 8+
pnpm --version  # 应输出 8.0.0 或更高

# Chrome 浏览器 120+
google-chrome --version  # 应输出 120.0.0.0 或更高
```

### 2. 克隆仓库并安装依赖

```bash
# 克隆仓库
git clone https://github.com/thomaszdxsn/GitHub-Switcher.git
cd GitHub-Switcher

# 切换到功能分支
git checkout 004-tool-management

# 安装依赖（包括新增的 SortableJS）
pnpm install
```

### 3. 启动开发服务器

```bash
# 启动 Plasmo 开发服务器（支持热重载）
pnpm dev
```

**输出示例**:
```
🟣 Plasmo v0.90.5
🔵 Starting dev server...
✅ Extension built in 2.3s
📦 Build output: build/chrome-mv3-dev/
```

### 4. 加载插件到 Chrome

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的 "开发者模式"
3. 点击 "加载已解压的扩展程序"
4. 选择 `build/chrome-mv3-dev/` 目录
5. 插件加载成功，记下扩展 ID（如 `abcdefghijklmnopqrstuvwxyz123456`）

### 5. 打开设置页面

**方式 1**: 右键点击浏览器工具栏中的插件图标，选择 "选项"

**方式 2**: 直接访问 `chrome-extension://[你的扩展ID]/options.html`

**预期结果**: 看到设置页面，显示 9 个工具的列表，每个工具包含图标、名称、描述和开关按钮

### 6. 测试拖拽排序

1. 在设置页面，将鼠标悬停在工具项左侧的拖拽手柄（⋮⋮ 图标）
2. 按住鼠标左键，拖拽工具到新位置
3. 松开鼠标，工具移动到新位置
4. 打开 GitHub 任意仓库页面（如 `https://github.com/facebook/react`）
5. 点击右侧侧边栏的工具按钮，查看工具菜单
6. 验证工具顺序与设置页面一致

### 7. 测试启用/禁用

1. 在设置页面，点击某个工具的开关按钮（如 CodeSandbox）
2. 开关切换到禁用状态（灰色背景，滑块向左）
3. 打开 GitHub 页面，点击工具按钮
4. 验证 CodeSandbox 不再显示在工具菜单中
5. 返回设置页面，重新启用 CodeSandbox
6. 刷新 GitHub 页面，验证 CodeSandbox 重新出现在工具菜单中

### 8. 测试重置功能

1. 在设置页面，自定义工具顺序和启用/禁用状态
2. 点击底部的 "重置为默认" 按钮
3. 在确认对话框中点击 "确定"
4. 验证工具列表恢复为默认顺序（GitHub.dev, DeepWiki, CodeWiki, ...）
5. 验证所有工具恢复为启用状态

## 项目结构导航

```
GitHub-Switcher/
├── src/
│   ├── options/                  # 设置页面（新增）
│   │   ├── index.html           # 设置页面 HTML
│   │   ├── index.ts             # 设置页面主入口
│   │   ├── styles.css           # 设置页面样式
│   │   ├── ToolListRenderer.ts  # 工具列表渲染器
│   │   └── toolActions.ts       # 工具操作函数（保存顺序、切换启用等）
│   ├── lib/
│   │   ├── toolDescriptions.ts  # 工具描述映射（新增）
│   │   ├── storage.ts           # 用户配置存储（扩展 toolOrder 字段）
│   │   └── types.ts             # TypeScript 类型定义（扩展 UserPreferences）
│   ├── contents/
│   │   └── index.ts             # Content Script（监听配置变化，更新工具菜单）
│   └── ui/
│       └── ToolDropdown.ts      # 工具下拉菜单（支持动态顺序）
├── tests/
│   ├── unit/
│   │   ├── toolActions.test.ts  # 工具操作函数测试（新增）
│   │   └── toolDescriptions.test.ts  # 工具描述测试（新增）
│   └── e2e/
│       ├── drag-and-drop.test.ts  # 拖拽排序 E2E 测试（新增）
│       └── toggle-enabled.test.ts  # 启用/禁用 E2E 测试（新增）
├── specs/
│   └── 004-tool-management/     # 本功能的规格文档
│       ├── spec.md              # 功能规格说明
│       ├── plan.md              # 实施计划
│       ├── tasks.md             # 任务清单
│       ├── data-model.md        # 数据模型
│       ├── research.md          # 技术调研
│       └── quickstart.md        # 快速开始（本文档）
└── package.json                 # 依赖配置（新增 sortablejs）
```

## 关键文件说明

### `src/options/index.html`

设置页面的 HTML 结构，包含：
- 页面标题："工具管理"
- 工具列表容器（`#tool-list`）
- 重置按钮（`#reset-button`）

### `src/options/ToolListRenderer.ts`

工具列表渲染器，负责：
- 读取 `UserPreferences`（包括 `toolOrder` 和 `enabledTools`）
- 根据 `toolOrder` 排序工具
- 为每个工具创建 DOM 元素（图标、名称、描述、拖拽手柄、开关按钮）
- 初始化 SortableJS 拖拽功能

### `src/options/toolActions.ts`

工具操作函数，包括：
- `saveToolOrder(toolOrder)`: 保存工具顺序到 chrome.storage.sync
- `toggleToolEnabled(toolId, enabled)`: 切换工具启用/禁用状态
- `resetToDefault()`: 重置为默认配置

### `src/lib/toolDescriptions.ts`

工具描述映射，定义每个工具的简短描述（20-30 汉字）：
```typescript
export const TOOL_DESCRIPTIONS: Record<number, string> = {
  1: 'GitHub 官方在线编辑器，支持直接在浏览器中编辑代码',
  2: 'AI 驱动的代码库文档生成工具，快速理解项目结构',
  // ... 其他工具描述
};
```

### `src/lib/types.ts`

TypeScript 类型定义，扩展 `UserPreferences` 类型：
```typescript
interface UserPreferences {
  openInNewTab: boolean;      // 现有字段
  enabledTools: number[];     // 现有字段
  toolOrder?: number[];       // 新增字段（可选）
}
```

## 开发工作流

### 1. 代码编辑

使用 VS Code 或其他编辑器打开项目，编辑代码：
```bash
# 打开 VS Code
code .

# 编辑文件（如 src/options/ToolListRenderer.ts）
```

### 2. 热重载

`pnpm dev` 启动后，文件保存时会自动重新构建：
```
✅ Rebuilt in 0.5s
```

在 Chrome 中，点击扩展页面的 "刷新" 按钮（或 Ctrl+R）即可看到最新代码

### 3. 运行测试

```bash
# 运行所有单元测试
pnpm test

# 运行单元测试并生成覆盖率报告
pnpm test -- --coverage

# 运行测试并监听文件变化（开发模式）
pnpm test:watch

# 运行 E2E 测试（需先启动 dev 服务器）
pnpm test:e2e
```

### 4. 代码检查

```bash
# 运行 Biome linter
pnpm run lint

# 自动修复 linting 问题
pnpm run lint:fix

# 运行 TypeScript 类型检查
pnpm run typecheck

# 运行 Prettier 格式化
pnpm run format
```

### 5. 构建生产版本

```bash
# 构建生产版本
pnpm build

# 输出目录: build/chrome-mv3-prod/
```

## 常见问题

### Q1: 拖拽功能不工作

**可能原因**:
- SortableJS 未正确初始化
- 拖拽手柄的 CSS 选择器错误

**解决方法**:
1. 检查控制台是否有错误日志
2. 验证 SortableJS 配置中的 `handle` 选择器是否正确（应为 `.tool-drag-handle`）
3. 检查拖拽手柄是否有正确的 CSS 类和 `cursor: grab` 样式

---

### Q2: 工具菜单未更新

**可能原因**:
- chrome.storage.onChanged 事件监听器未正确注册
- Content Script 未重新渲染工具菜单

**解决方法**:
1. 打开 Chrome DevTools → Application → Storage → Chrome Extension Storage
2. 验证 `toolOrder` 或 `enabledTools` 是否已更新
3. 检查 Content Script 的 `chrome.storage.onChanged` 监听器是否正常工作
4. 刷新 GitHub 页面（Ctrl+R）

---

### Q3: 设置页面样式错乱

**可能原因**:
- CSS 类名冲突
- CSS 文件未正确加载

**解决方法**:
1. 验证所有 CSS 类名是否使用 `__github-switcher-` 前缀
2. 检查 `src/options/styles.css` 是否正确引入到 `index.html`
3. 打开 Chrome DevTools → Elements，检查 DOM 结构和样式

---

### Q4: 测试失败

**可能原因**:
- 测试数据设置不正确
- Mock 函数未正确配置

**解决方法**:
1. 运行 `pnpm test -- --reporter=verbose` 查看详细错误信息
2. 检查测试文件中的 Mock 配置（如 `chrome.storage.sync.get`）
3. 验证测试数据是否符合 `UserPreferences` 类型定义

---

## 下一步

### 学习更多
- 阅读 [spec.md](./spec.md) 了解完整的功能规格
- 阅读 [plan.md](./plan.md) 了解实施计划和阶段划分
- 阅读 [tasks.md](./tasks.md) 了解详细的任务清单
- 阅读 [data-model.md](./data-model.md) 了解数据模型和存储结构
- 阅读 [research.md](./research.md) 了解技术调研和选型理由

### 开始开发
1. 查看 [tasks.md](./tasks.md) 中的任务清单，选择一个未开始的任务
2. 在任务清单中标记任务为 "进行中"
3. 创建功能分支（如 `git checkout -b feature/task-001`）
4. 编写代码并提交（遵循 Conventional Commits 规范）
5. 运行测试和代码检查
6. 提交 Pull Request 并请求代码审查

### 获取帮助
- 查看项目 README: [/README.md](../../README.md)
- 查看贡献指南: [/CONTRIBUTING.md](../../CONTRIBUTING.md)
- 提交 GitHub Issue: https://github.com/thomaszdxsn/GitHub-Switcher/issues

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**维护者**: 开发团队
