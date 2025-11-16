# 功能规格说明：针对 GitHub 文件路径点亮工具菜单

**功能分支**: `003-file-path-tools`  
**创建日期**: 2025-11-16  
**状态**: 草稿  
**输入**: 用户描述："针对 GitHub 文件路径点亮工具菜单（githistory / nbviewer）- 在页面为 GitHub 仓库"具体文件路径"时动态启用相应工具菜单项；当路径不匹配时保持禁用。点击已启用的工具菜单，将当前文件 URL 转换为目标工具对应的跳转 URL 并打开。"

## 用户场景与测试 *(必填)*

### 用户故事 1 - 在文件页面启用 githistory 工具菜单项 (优先级: P1)

当用户浏览 GitHub 仓库中的任意文件页面时，githistory 工具菜单项应该被启用并高亮显示。用户点击该工具菜单项后，系统在新标签页打开对应的 githistory 历史视图，展示该文件的完整修改历史。

**优先级理由**: 这是核心功能，让用户能够快速访问文件历史记录，提供最直接的价值。githistory 适用于所有文件类型，覆盖最广泛的使用场景。

**独立测试**: 可通过在任意 GitHub 文件页面点击 githistory 工具完全测试，无需依赖其他功能。验证能否正确跳转到 github.githistory.xyz 对应页面。

**验收场景**:

1. **假设** 用户在 GitHub 上浏览文件 `https://github.com/owner/repo/blob/main/README.md`，**当** 用户打开工具菜单，**则** githistory 工具菜单项显示为启用状态（可点击、高亮）
2. **假设** githistory 工具菜单项已启用，**当** 用户点击该工具菜单项，**则** 在新标签页打开 `https://github.githistory.xyz/owner/repo/blob/main/README.md`
3. **假设** 用户在 GitHub 仓库主页 `https://github.com/owner/repo`，**当** 用户打开工具菜单，**则** githistory 工具菜单项显示为禁用状态（置灰、不可点击）
4. **假设** 用户在 GitHub 目录页 `https://github.com/owner/repo/tree/main/src`，**当** 用户打开工具菜单，**则** githistory 工具菜单项显示为禁用状态

---

### 用户故事 2 - 在 Notebook 文件页面启用 nbviewer 工具菜单项 (优先级: P1)

当用户浏览 GitHub 仓库中的 Jupyter Notebook 文件（.ipynb）页面时，nbviewer 工具菜单项应该被启用并高亮显示。用户点击该工具后，系统在新标签页打开对应的 nbviewer 渲染视图，提供更好的 Notebook 阅读体验。

**优先级理由**: 对于数据科学和机器学习用户来说，nbviewer 提供比 GitHub 原生更好的 Notebook 渲染体验，是关键功能。

**独立测试**: 可通过在 .ipynb 文件页面点击 nbviewer 工具完全测试，验证能否正确跳转到 nbviewer.org 对应页面并正确渲染 Notebook。

**验收场景**:

1. **假设** 用户在 GitHub 上浏览文件 `https://github.com/owner/repo/blob/main/notebook.ipynb`，**当** 用户打开工具菜单，**则** nbviewer 工具项显示为启用状态，githistory 也同时启用
2. **假设** nbviewer 工具已启用，**当** 用户点击该工具，**则** 在新标签页打开 `https://nbviewer.org/github/owner/repo/blob/main/notebook.ipynb`
3. **假设** 用户在 GitHub 上浏览非 .ipynb 文件（如 `README.md`），**当** 用户打开工具菜单，**则** nbviewer 工具项显示为禁用状态，但 githistory 保持启用
4. **假设** Notebook 文件名为大写扩展名 `DEMO.IPYNB`，**当** 用户打开工具菜单，**则** nbviewer 工具项仍显示为启用状态（大小写不敏感）

---

### 用户故事 3 - 处理 URL 编码与特殊字符 (优先级: P2)

当文件路径包含空格、中文字符或其他特殊字符时，系统应正确解析并转换 URL，确保跳转到工具站点后能正常访问文件。

**优先级理由**: 实际使用中常见包含空格或特殊字符的文件名，需要确保系统健壮性。但相比核心功能优先级较低。

**独立测试**: 可通过创建包含特殊字符的测试文件，验证 URL 转换是否正确处理编码。

**验收场景**:

1. **假设** 用户浏览文件路径包含空格的 Notebook `https://github.com/owner/repo/blob/main/my%20notebook.ipynb`，**当** 用户点击 nbviewer，**则** 跳转到 `https://nbviewer.org/github/owner/repo/blob/main/my%20notebook.ipynb`（保持 URL 编码）
2. **假设** 用户浏览文件路径包含中文的文件 `https://github.com/owner/repo/blob/main/%E6%96%87%E6%A1%A3.md`，**当** 用户点击 githistory，**则** 跳转到 `https://github.githistory.xyz/owner/repo/blob/main/%E6%96%87%E6%A1%A3.md`（保持原编码）
3. **假设** GitHub URL 包含查询参数（如行号） `https://github.com/owner/repo/blob/main/file.py?plain=1#L20`，**当** 用户点击 githistory，**则** 跳转到 `https://github.githistory.xyz/owner/repo/blob/main/file.py?plain=1#L20`（保留查询参数与哈希）

---

### 用户故事 4 - 支持 GitHub SPA 导航自动更新状态 (优先级: P2)

当用户在 GitHub 站内通过点击链接导航（SPA 模式，不刷新页面）时，工具菜单状态应自动更新，无需手动刷新页面。

**优先级理由**: GitHub 采用单页应用架构，用户站内导航不会触发页面刷新，需要监听路由变化以保持工具状态同步。这是用户体验的重要提升。

**独立测试**: 可通过在 GitHub 仓库内点击文件链接、面包屑导航等方式测试，观察工具菜单状态是否自动更新。

**验收场景**:

1. **假设** 用户在仓库主页，**当** 用户点击文件链接导航到文件页面（SPA 导航），**则** 工具菜单自动将 githistory 从禁用切换为启用
2. **假设** 用户在文件页面，**当** 用户点击面包屑导航回到目录页（SPA 导航），**则** 工具菜单自动将 githistory 从启用切换为禁用
3. **假设** 用户在普通文件页面，**当** 用户导航到 .ipynb 文件页面，**则** nbviewer 从禁用自动切换为启用

---

### 边界情况

- 当 URL 被系统包装（如 `<url>`）或附加标记（如 `url^token`）时，系统应提取纯净的 URL 进行解析（例如：从 Slack/Discord 复制的链接可能包含装饰符号）
- 当文件路径包含多个点号（如 `file.test.ipynb`）时，应正确识别扩展名为 `.ipynb`
- 当用户在非 github.com 域名（如 gitlab.com、gist.github.com）时，所有工具应保持禁用状态
- 当网络请求失败或目标工具站点不可用时，用户点击后应有合理的错误提示（通过浏览器默认行为处理）
- 当用户快速连续导航多个页面时，工具状态应能正确响应最新的 URL，避免状态不一致
- 当文件路径极长（超过 URL 长度限制）时，系统应能正常解析，跳转由浏览器或目标站点处理

## 需求定义 *(必填)*

### 功能需求

- **FR-001**: 系统必须在 GitHub 文件页面（URL 匹配 `https://github.com/{owner}/{repo}/blob/{ref}/{filepath}`）时将 githistory 工具设置为启用状态
- **FR-002**: 系统必须在非文件页面（仓库主页、目录页、其他页面类型）时将 githistory 工具设置为禁用状态
- **FR-003**: 系统必须在 GitHub Jupyter Notebook 文件页面（文件路径以 `.ipynb` 结尾，大小写不敏感）时将 nbviewer 工具设置为启用状态
- **FR-004**: 系统必须在非 Notebook 文件页面时将 nbviewer 工具设置为禁用状态
- **FR-005**: 系统必须在用户点击已启用的 githistory 工具时，在新标签页打开 `https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}` URL
- **FR-006**: 系统必须在用户点击已启用的 nbviewer 工具时，在新标签页打开 `https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}` URL
- **FR-007**: 系统必须在禁用状态的工具被点击时，不响应点击事件（通过 UI 样式与事件处理实现）
- **FR-008**: 系统必须在页面 URL 变化时（包括初始加载、浏览器前进/后退、SPA 路由切换）重新检测并更新工具状态
- **FR-009**: 系统必须正确解析并保留 GitHub URL 中的查询参数（如 `?plain=1`）与哈希片段（如 `#L20`），并在转换为 githistory URL 时透传这些参数
- **FR-010**: 系统必须在转换 URL 时保持原有的路径编码（如空格编码为 `%20`），不进行二次编码或解码
- **FR-011**: 系统必须支持识别大小写不敏感的 `.ipynb` 扩展名（如 `.IPYNB`、`.Ipynb`）
- **FR-012**: 系统必须在非 github.com 域名下将所有工具保持为禁用状态

### 关键实体

- **GitHub 文件 URL**: 表示 GitHub 上的具体文件路径，包含仓库所有者（owner）、仓库名（repo）、引用（ref，可以是分支名、标签名或提交哈希）、文件路径（filepath）等信息
- **工具状态**: 表示工具菜单项的启用/禁用状态，包括可点击性、视觉样式（高亮/置灰）、点击行为等属性
- **URL 解析结果**: 包含从 GitHub URL 提取的结构化信息（owner、repo、ref、filepath），用于判断工具状态和生成目标 URL

## 成功标准 *(必填)*

### 可衡量结果

- **SC-001**: 用户在任意 GitHub 文件页面可在 1 秒内看到 githistory 工具从禁用切换为启用状态（P95 延迟 ≤1s，通过 Performance API 测量）
- **SC-002**: 用户点击已启用的工具后，可在 2 秒内（取决于网络）成功打开目标工具站点的对应页面
- **SC-003**: 系统对 100% 的标准 GitHub 文件 URL 格式（`github.com/{owner}/{repo}/blob/{ref}/{filepath}`）能正确识别并启用对应工具
- **SC-004**: 系统对 100% 的非文件页面（仓库主页、目录页、非 GitHub 域名等）能正确禁用所有文件工具
- **SC-005**: 用户在 GitHub 站内导航时，工具状态能在 500 毫秒内自动更新，无需手动刷新页面（P95 延迟 ≤500ms，通过 Performance API 测量）
- **SC-006**: 系统对包含特殊字符（空格、中文、符号）的文件路径，能 100% 正确转换 URL 并成功跳转
- **SC-007**: 用户在启用的 nbviewer 工具点击后，能成功在 nbviewer.org 上查看 Notebook 的正确渲染结果（100% 成功率）
- **SC-008**: 工具禁用状态下，用户无法触发跳转操作（0% 误触发率）
