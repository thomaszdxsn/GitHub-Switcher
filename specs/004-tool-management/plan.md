# 实施计划：工具管理设置页面

**分支**: `004-tool-management` | **日期**: 2025-11-16 | **规格**: [spec.md](./spec.md)
**输入**: 来自 `/specs/004-tool-management/spec.md` 的功能规格

**注意**: 此模板由 `/speckit.plan` 命令填充。查看 `.specify/templates/commands/plan.md` 了解执行流程。

## 概要

**主要需求**: 新增浏览器扩展的设置页面（Options Page），允许用户对 9 个第三方工具进行拖拽排序和启用/禁用切换。每个工具显示名称、图标、简短英文描述（40-60 字符）。菜单页面根据用户配置动态显示工具列表。

**技术方案**:
- **前端框架**: Plasmo options page + Native DOM + TypeScript
- **存储方案**: chrome.storage.sync（跨设备同步），降级到 chrome.storage.local
- **拖拽库**: SortableJS (8KB gzipped)
- **样式方案**: 自定义 CSS，使用 `__github-switcher-` 前缀隔离
- **数据模型**: Tool {id, name, desc, enabled, order}, SettingsMeta {version, updatedAt}
- **核心约束**: 至少保留 1 个工具启用；自动保存（去抖 300ms）；首屏渲染 ≤200ms

## 技术背景

<!--
  需要行动：将此部分内容替换为项目的技术细节。
  这里的结构以建议性质呈现，用于指导迭代过程。
-->

**语言/版本**: TypeScript 5.x (strict mode enabled)
**主要依赖**: Plasmo 0.90.5 (Manifest V3), SortableJS 1.15.x, Chrome Extension APIs
**存储方案**: chrome.storage.sync (primary, 100KB quota), chrome.storage.local (fallback)
**测试框架**: Vitest + @testing-library/dom (unit tests), manual E2E testing
**目标平台**: Chrome 90+ (Manifest V3 compatible browsers)
**项目类型**: 单项目 (Chrome Extension) - 扩展现有扩展功能
**性能目标**: 首屏渲染 ≤200ms (10 工具基准), 拖拽响应 ≤50ms (P95), 持久化 ≤50ms (均摊)
**约束条件**: 主线程长任务 <16ms, storage 写入去抖 300ms, 至少 1 个工具启用
**规模/范围**: 9 个工具初始配置, 支持未来扩展, 单用户本地配置 (<5KB data)

## 章程合规性检查

*关卡：必须在阶段 0 研究前通过。在阶段 1 设计后重新检查。*

### I. 开源安全 ✅
- **状态**: 通过
- **验证**: 功能仅使用 chrome.storage API，不涉及外部网络请求、API 密钥或敏感信息。所有配置存储在用户本地浏览器。
- **行动**: 无需额外措施

### II. 测试覆盖要求 ✅
- **状态**: 已规划（Phase 1 后）
- **目标**: 
  - 单元测试覆盖率 ≥80%（核心工具：loadToolConfiguration, saveToolOrder, toggleToolEnabled, resetToDefault）
  - 集成测试：100% 关键用户路径（拖拽排序 → 保存 → 菜单页刷新）
  - Contract 测试：storage 数据格式校验（Tool, SettingsMeta schema）
- **已交付**:
  - JSON Schema: `tool-config.schema.json`, `tool-definition.schema.json`
  - 测试策略: 详见 `data-model.md` 测试用例部分
- **行动**: Phase 2 生成 tasks.md 时包含测试任务

### III. 文档覆盖 ✅
- **状态**: 已完成
- **已交付**:
  - ✅ spec.md（功能规格，含 5 个用户故事）
  - ✅ plan.md（本实施计划）
  - ✅ research.md（SortableJS、Chrome Storage、Plasmo 技术研究）
  - ✅ data-model.md（数据模型详细定义，含验证规则）
  - ✅ quickstart.md（开发者快速上手指南）
  - ✅ contracts/ 目录（2 个 JSON Schema 文件 + README）
- **待补充**:
  - 更新 README.md（新增"工具管理"功能说明）- Phase 2 实施后
  - 更新 CHANGELOG.md（版本发布时）- Phase 2 实施后
- **行动**: Phase 2 tasks.md 中包含文档更新任务

### IV. 透明度与公开责任 ✅
- **状态**: 通过
- **验证**: 所有功能规格、实施计划、代码变更均在公开仓库中，开发决策记录在 spec.md 的 Clarifications 部分（5 个澄清问答）。
- **行动**: 无需额外措施

### V. 文档语言标准 ✅
- **状态**: 通过
- **验证**: spec.md, plan.md, research.md, data-model.md, quickstart.md 均使用简体中文编写，技术术语保留英文原文并附中文注释。
- **行动**: 后续 tasks.md 及代码注释保持中文标准

---

**合规性总结**: 所有 5 项章程要求均已通过，无需额外缓解措施。可安全进入 Phase 2（任务分解）。

## 项目结构

### 文档（此功能）

```text
specs/[###-feature]/
├── plan.md              # 本文件（/speckit.plan 命令输出）
├── research.md          # 阶段 0 输出（/speckit.plan 命令）
├── data-model.md        # 阶段 1 输出（/speckit.plan 命令）
├── quickstart.md        # 阶段 1 输出（/speckit.plan 命令）
├── contracts/           # 阶段 1 输出（/speckit.plan 命令）
└── tasks.md             # 阶段 2 输出（/speckit.tasks 命令 - 不由 /speckit.plan 创建）
```

### 源代码（仓库根目录）
<!--
  需要行动：将下面的占位符树替换为此功能的具体布局。
  删除未使用的选项，并用真实路径扩展选定的结构（例如 apps/admin、packages/something）。
  交付的计划不得包含选项标签。
-->

```text
src/
├── options/                 # 新增：Options Page (设置页面)
│   ├── index.html          # Options 页面 HTML 模板
│   ├── index.ts            # Options 页面入口脚本
│   ├── components/         # Options 页面 UI 组件
│   │   ├── ToolList.ts     # 工具列表组件（拖拽排序）
│   │   ├── ToolItem.ts     # 单个工具项组件（开关、句柄）
│   │   ├── PreviewArea.ts  # 预览区域组件（实时预览菜单效果）
│   │   └── ResetButton.ts  # 重置按钮组件
│   └── styles/
│       └── options.css     # Options 页面样式（BEM + __github-switcher- 前缀）
├── contents/               # 现有：Content Script
│   └── index.ts            # 现有工具菜单渲染（需集成 storage 读取）
├── lib/                    # 现有：核心库
│   ├── config.ts           # 现有工具配置（9 个工具定义 + 新增 TOOL_DESCRIPTIONS 常量）
│   ├── storage.ts          # 现有存储模块（需扩展 toolOrder 字段）
│   ├── toolStateManager.ts # 新增：工具状态管理（CRUD 操作）
│   └── types.ts            # 现有类型定义（需扩展 UserPreferences, SettingsMeta）
├── ui/                     # 现有：UI 组件
│   ├── SidebarButton.ts    # 现有侧边栏按钮
│   └── ToolDropdown.ts     # 现有工具下拉菜单（需集成动态排序/过滤）
└── utils/
    └── logger.ts           # 现有日志工具（添加 [options] 前缀）

tests/
├── unit/
│   ├── toolStateManager.test.ts  # 新增：状态管理单元测试
│   ├── storage.test.ts           # 扩展：storage 模块测试（toolOrder）
│   └── components/               # 新增：Options 组件测试
│       ├── ToolList.test.ts
│       └── ToolItem.test.ts
├── integration/                   # 新增：集成测试
│   └── options-menu-sync.test.ts # Options 页 ↔ 菜单页同步测试
└── contract/                      # 新增：Contract 测试
    └── storage-schema.test.ts    # Storage 数据格式校验

specs/004-tool-management/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
└── contracts/           # Phase 1 输出
    ├── tool-config.schema.json      # Tool 配置 JSON Schema
    └── settings-meta.schema.json    # SettingsMeta JSON Schema
```

**结构决策**: 选择单项目结构（选项 1），因为这是 Chrome Extension 单体项目。新增 `src/options/` 目录用于 Options Page，扩展现有 `src/lib/storage.ts` 和 `src/ui/ToolDropdown.ts` 以支持动态配置。所有组件使用 Native DOM + TypeScript，保持与现有代码库一致。

## 复杂度追踪

> **仅当章程合规性检查存在必须证明合理的违规时才填写**

**无违规项** - 所有章程要求均已满足，无需复杂度追踪。

---

## 阶段执行总结

### Phase 0: 研究与技术选型 ✅
**状态**: 已完成  
**输出**:
- `research.md` (500 行) - 综合 3 个子代理的研究成果
  - SortableJS 集成模式（事件处理、视觉反馈、无障碍支持）
  - Chrome Storage 最佳实践（配额管理、回退策略、数据验证）
  - Plasmo Options Page 架构（文件结构、组件模式、性能优化）

**关键决策**:
1. ✅ 选择 SortableJS（8KB gzipped）而非原生 Drag and Drop API
2. ✅ 采用 chrome.storage.sync + local 回退策略
3. ✅ 使用 Plasmo Native DOM 模式（无 React 依赖）
4. ✅ 自定义 CSS + BEM 命名（`__github-switcher-` 前缀）
5. ✅ 预览区域禁用点击（仅视觉预览）

### Phase 1: 设计与合约 ✅
**状态**: 已完成  
**输出**:
- `data-model.md` - 详细数据模型定义（含验证规则、状态转换）
- `contracts/tool-config.schema.json` - UserToolConfiguration JSON Schema
- `contracts/tool-definition.schema.json` - ToolDefinition JSON Schema
- `contracts/README.md` - 合约文档更新（JSON Schema 使用说明）
- `quickstart.md` - 开发者快速上手指南（已存在，无需重新生成）
- `.github/copilot-instructions.md` - Agent 上下文更新完成

**数据模型**:
```typescript
interface UserToolConfiguration {
  toolOrder: number[];        // [1-9] 唯一整数数组
  enabledTools: number[];     // [1-9] 至少 1 个
  meta: SettingsMeta;         // 版本、时间戳、来源
}
```

**验证规则**: 6 类检查（类型、去重、范围、长度、至少 1 个启用、ISO 8601 时间戳）

### Phase 2: 任务分解 ⏭️
**状态**: 未开始（需执行 `/speckit.tasks` 命令）  
**预期输出**:
- `tasks.md` - 可执行任务列表（按优先级和依赖关系排序）
- 每个任务包含：验收标准、预计工时、依赖项、测试要求

---

## 下一步行动

**立即可执行**: 运行 `/speckit.tasks` 命令生成任务分解文档

**命令**:
```bash
# 在 GitHub Copilot Chat 中执行
/speckit.tasks
```

**预期结果**:
- 生成 `specs/004-tool-management/tasks.md`
- 包含 15-20 个可执行任务
- 优先级排序：P1 核心功能 → P2 辅助功能 → P3 优化项
- 每个任务 ≤1 天工作量

**实施路线图参考** (来自 spec.md):
1. Phase 1: 设置页面基础框架 (1-2 天)
2. Phase 2: 启用/禁用功能 (1 天)
3. Phase 3: 拖拽排序功能 (2-3 天)
4. Phase 4: 重置功能与边界情况 (1 天)
5. Phase 5: 测试与优化 (1-2 天)
6. Phase 6: 文档与发布 (1 天)

**总计**: 7-10 天
