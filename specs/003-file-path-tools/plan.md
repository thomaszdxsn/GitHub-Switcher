# 实施计划：针对 GitHub 文件路径点亮工具菜单

**分支**: `003-file-path-tools` | **日期**: 2025-11-16 | **规格**: [spec.md](./spec.md)
**输入**: 来自 `specs/003-file-path-tools/spec.md` 的功能规格

**注意**: 此文档由 `/speckit.plan` 命令生成，记录技术实施方案。

## 概要

本功能为 GitHub Switcher 扩展的现有工具菜单增加路径感知能力，根据当前 GitHub 页面类型（文件页面、目录页面、仓库主页）动态启用或禁用特定工具菜单项。核心改进包括：

1. **githistory 工具**：仅在 GitHub 文件页面（blob 路径）启用，支持所有文件类型
2. **nbviewer 工具**：仅在 Jupyter Notebook 文件（.ipynb）页面启用
3. **URL 转换增强**：为文件级工具生成包含完整文件路径的目标 URL，支持特殊字符和查询参数保留
4. **SPA 导航支持**：监听 GitHub 单页应用路由变化，自动更新工具状态

技术方案采用"路径模式表驱动"架构，通过纯函数计算工具可用性，使用事件合并与缓存优化性能，确保在大型仓库中 P95 响应时间 ≤50ms。

## 技术背景

**语言/版本**: TypeScript 5.9.3（严格模式）  
**主要依赖**: Plasmo 0.90.5（Chrome Extension Manifest V3 框架）、无额外运行时依赖  
**存储方案**: chrome.storage.sync（用户偏好设置，已存在）  
**测试框架**: Vitest 4.0.8 + @vitest/coverage-v8（V8 覆盖率）  
**目标平台**: Chrome/Edge/Brave 浏览器（Manifest V3 兼容）  
**项目类型**: 浏览器扩展（Chrome Extension）- Content Script 与 UI 组件  
**性能目标**: 
  - 路径变更到菜单渲染 P95 ≤50ms
  - 规则评估计算耗时 ≤5ms
  - 首屏无阻塞（惰性加载）
**约束条件**: 
  - 不引入新三方依赖
  - 不修改现有 URL 结构与全局样式
  - Content Script 包大小增量 <2KB（gzipped）
  - 维持现有测试覆盖率 ≥80%
**规模/范围**: 
  - 支持 ≥2000 文件的大型仓库
  - 新增单元测试 ≥12 条
  - 影响 2 个工具（githistory、nbviewer）的 9 个工具菜单

## 章程合规性检查

*关卡：必须在阶段 0 研究前通过。在阶段 1 设计后重新检查。*

### I. 开源安全性 ✅

- ✅ 无私密信息（API 密钥、密码、个人数据）需要存储
- ✅ 所有配置为静态只读常量（TOOLS 配置表）
- ✅ 无需新增环境变量或密钥管理
- ✅ 用户数据仅限 chrome.storage.sync（已有工具启用偏好）

### II. 测试覆盖率要求 ✅

- ✅ 单元测试覆盖率目标：≥80%（当前项目 100%，需维持）
- ✅ 新增单元测试 ≥12 条（路径解析、URL 转换、工具状态判定）
- ✅ 集成测试：关键用户路径 100% 覆盖（P1 用户故事）
- ✅ 测试先行开发（TDD）：先编写测试，再实现功能
- ✅ CI 流程已配置（pnpm test、coverage 报告）

### III. 文档覆盖率 ✅

- ✅ 所有新增公共函数需 JSDoc 注释（参数、返回值、示例）
- ✅ README.md 需更新（新增工具行为说明）
- ✅ CHANGELOG.md 需记录破坏性变更（无，向后兼容）
- ✅ 用户文档：工具菜单智能启用功能说明
- ✅ 代码注释解释"为何"（业务规则），非"做什么"

### IV. 透明度与公共问责 ✅

- ✅ 所有技术决策公开（ADR 记录在 research.md）
- ✅ 功能讨论公开（GitHub Issues/PRs）
- ✅ 代码审查公开且建设性
- ✅ MIT 许可证已存在
- ✅ 贡献指南已存在（CONTRIBUTING.md）

### V. 文档语言标准 ✅

- ✅ 规格文档（spec.md）使用简体中文
- ✅ 实施计划（plan.md）使用简体中文
- ✅ 任务列表（tasks.md）将使用简体中文
- ✅ 代码注释（业务逻辑部分）使用简体中文
- ✅ Git commit messages 使用简体中文
- ✅ 用户文档（README、CHANGELOG）提供简体中文版本
- ✅ 代码标识符（变量名、函数名）保持英文
- ✅ 技术术语保留英文原文并附中文注释

**结论**: 所有章程关卡通过 ✅ 无违规项需要证明合理性。

## 项目结构

### 文档（此功能）

```text
specs/003-file-path-tools/
├── spec.md              # 功能规格说明（已完成）
├── plan.md              # 本文件（实施计划）
├── research.md          # 阶段 0 输出（技术研究与决策）
├── data-model.md        # 阶段 1 输出（数据模型设计）
├── quickstart.md        # 阶段 1 输出（快速开发指南）
├── contracts/           # 阶段 1 输出（接口契约）
│   └── tool-state.schema.json  # 工具状态接口定义
├── tasks.md             # 阶段 2 输出（任务清单，由 /speckit.tasks 生成）
└── checklists/
    └── requirements.md  # 规格质量检查清单（已完成）
```

### 源代码（仓库根目录）

```text
src/
├── lib/
│   ├── config.ts            # [修改] 工具配置，新增 enableCondition 字段
│   ├── detectGithub.ts      # [修改] GitHub URL 解析，新增 parseGitHubFileUrl()
│   ├── urlGenerator.ts      # [修改] URL 生成器，支持文件路径参数
│   ├── types.ts             # [修改] 类型定义，新增 FileContext、ToolState
│   ├── toolStateManager.ts  # [新增] 工具状态管理器（核心逻辑）
│   └── icons.ts             # [不变] 工具图标配置
├── ui/
│   ├── SidebarButton.ts     # [不变] 侧边栏按钮
│   └── ToolDropdown.ts      # [修改] 下拉菜单，支持禁用状态渲染
├── contents/
│   └── index.ts             # [修改] Content Script 主入口，集成状态管理
└── utils/
    ├── logger.ts            # [不变] 日志工具
    └── positioning.ts       # [不变] 菜单定位工具

tests/
├── unit/
│   ├── detectGithub.test.ts        # [修改] 新增文件路径解析测试
│   ├── urlGenerator.test.ts        # [修改] 新增文件 URL 生成测试
│   ├── toolStateManager.test.ts    # [新增] 工具状态管理器测试（≥12 条）
│   ├── logger.test.ts              # [不变] 日志测试
│   └── positioning.test.ts         # [不变] 定位测试
└── setup.ts                         # [不变] 测试配置
```

**结构决策**: 采用单项目结构（Chrome Extension），新增 `toolStateManager.ts` 模块作为核心状态管理器，通过纯函数计算工具可用性。修改现有模块以支持文件路径解析和 URL 生成，UI 组件支持禁用状态渲染。所有逻辑集中在 Content Script 层，无需后端或持久化存储（状态实时计算）。

## 复杂度追踪

> **本功能无章程违规项，此部分留空。**

所有章程合规性检查均通过，无需证明合理性。

---

## 阶段完成总结

### 阶段 0: 研究与技术决策 ✅

**输出文件**: [research.md](./research.md)

**完成内容**:
- ✅ GitHub 文件 URL 解析策略（正则表达式方案）
- ✅ 工具状态管理架构（纯函数 + Map 缓存）
- ✅ URL 生成策略（模板字符串扩展）
- ✅ UI 禁用状态渲染（置灰 + 禁用点击）
- ✅ GitHub SPA 导航监听（复用现有事件监听器）
- ✅ 测试策略（TDD、≥12 条测试、100% 覆盖率目标）
- ✅ 性能优化总结（防抖、缓存、批量渲染）

**关键决策**:
- 使用正则表达式解析 URL（性能 <1ms）
- 纯函数 + 缓存架构（零依赖、可测试）
- 模板字符串扩展支持文件路径（向后兼容）

### 阶段 1: 设计与契约 ✅

**输出文件**: 
- [data-model.md](./data-model.md)
- [contracts/tool-state.schema.json](./contracts/tool-state.schema.json)
- [quickstart.md](./quickstart.md)

**完成内容**:
- ✅ 数据模型定义（FileContext、ToolState、ToolEnableCondition）
- ✅ 接口契约（JSON Schema 定义）
- ✅ 快速开发指南（环境设置、核心模块、测试策略）
- ✅ 代理上下文更新（GitHub Copilot 指令）

**核心实体**:
1. `FileContext`: 文件上下文（8 字段）
2. `ToolState`: 工具状态（4 字段）
3. `ToolEnableCondition`: 启用条件（2 字段）
4. `ToolEntry`: 工具配置（新增 `enableCondition` 字段）

**接口契约**:
- `IToolStateManager.computeToolState()`: 计算单个工具状态
- `IToolStateManager.computeAllToolStates()`: 批量计算所有工具状态

### 重新评估章程合规性 ✅

**阶段 1 后重新检查**:

#### I. 开源安全性 ✅
- ✅ 无新增私密信息或密钥
- ✅ 所有配置为静态只读
- ✅ 无需环境变量

#### II. 测试覆盖率要求 ✅
- ✅ 新增单元测试计划：≥12 条
- ✅ TDD 开发流程已定义
- ✅ 覆盖率目标：新增代码 100%，整体 ≥80%

#### III. 文档覆盖率 ✅
- ✅ 所有新增接口已定义 JSON Schema
- ✅ quickstart.md 提供开发指南
- ✅ 代码注释规范已明确（JSDoc）

#### IV. 透明度与公共问责 ✅
- ✅ 所有技术决策记录在 research.md
- ✅ 架构决策透明且有理由支撑

#### V. 文档语言标准 ✅
- ✅ 所有文档使用简体中文
- ✅ 代码标识符保持英文
- ✅ 技术术语保留英文并附中文注释

**结论**: 阶段 1 设计后，所有章程关卡仍然通过 ✅ 无新增违规项。

---

## 下一步行动

**当前状态**: 计划阶段（Phase 2）完成 ✅

**准备就绪**: 
- ✅ 技术方案已确定
- ✅ 数据模型已设计
- ✅ 接口契约已定义
- ✅ 开发指南已编写

**下一步**: 执行 `/speckit.tasks` 命令生成任务清单（tasks.md）

```bash
# 生成任务清单
/speckit.tasks
```

**任务清单将包含**:
1. 开发任务（实现、测试、文档）
2. 验收检查清单
3. 部署与发布步骤

**预计工作量**:
- 开发时间：2-3 天
- 测试时间：1 天
- 文档更新：0.5 天
- **总计**：3.5-4.5 天
