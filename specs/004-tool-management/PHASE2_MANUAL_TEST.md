# Phase 2 手动测试检查清单

**测试日期**: 待定  
**测试范围**: 004-tool-management Phase 2 Content Script 联动  
**测试环境**: Chrome Extension (Development Build)

---

## 前置条件

1. ✅ Phase 1 所有测试通过
2. ✅ 开发服务器已启动 (`pnpm dev`)
3. ✅ Chrome 浏览器已安装扩展 (加载 `build/chrome-mv3-dev` 目录)
4. ✅ 已在 GitHub 仓库页面上测试基本功能（侧边栏按钮和工具菜单）

---

## 测试用例

### TC-P2-001: 初始状态同步测试

**步骤**:
1. 打开选项页面，禁用任意 2-3 个工具（如 githistory, nbviewer）
2. 保持选项页面打开
3. 新标签页打开任意 GitHub 仓库页面（如 `https://github.com/facebook/react`）
4. 点击右侧悬浮按钮打开工具菜单

**预期结果**:
- ✅ 工具菜单只显示已启用的工具
- ✅ 被禁用的工具不显示在菜单中
- ✅ 工具顺序与选项页面一致
- ✅ 菜单渲染正常，无样式错误

**实际结果**: _____________

---

### TC-P2-002: 实时禁用工具测试

**步骤**:
1. 打开 GitHub 仓库页面，点击悬浮按钮打开工具菜单（保持菜单打开）
2. 切换到选项页面标签页
3. 禁用一个当前启用的工具（如 GitHub.dev）
4. 立即切换回 GitHub 页面（不要关闭菜单）

**预期结果**:
- ✅ 工具菜单自动更新，被禁用的工具消失
- ✅ 更新延迟 ≤ 500ms
- ✅ 菜单保持打开状态
- ✅ 菜单位置不变
- ✅ 其他工具顺序不变
- ✅ 无控制台错误

**实际结果**: _____________

---

### TC-P2-003: 实时启用工具测试

**步骤**:
1. 打开 GitHub 仓库页面，点击悬浮按钮打开工具菜单（保持菜单打开）
2. 切换到选项页面标签页
3. 启用一个当前禁用的工具（如之前禁用的 GitHub.dev）
4. 立即切换回 GitHub 页面（不要关闭菜单）

**预期结果**:
- ✅ 工具菜单自动更新，新启用的工具出现
- ✅ 工具插入到正确的顺序位置（按 toolOrder 排序）
- ✅ 更新延迟 ≤ 500ms
- ✅ 菜单保持打开状态
- ✅ 菜单位置不变
- ✅ 无控制台错误

**实际结果**: _____________

---

### TC-P2-004: 菜单关闭状态更新测试

**步骤**:
1. 打开 GitHub 仓库页面，不要打开工具菜单
2. 切换到选项页面，修改工具启用状态（禁用 2-3 个工具）
3. 切换回 GitHub 页面，点击悬浮按钮打开菜单

**预期结果**:
- ✅ 菜单显示最新的工具列表
- ✅ 被禁用的工具不显示
- ✅ 工具顺序正确
- ✅ 所有启用的工具 URL 生成正确

**实际结果**: _____________

---

### TC-P2-005: 多次快速切换测试

**步骤**:
1. 打开 GitHub 仓库页面，保持工具菜单打开
2. 切换到选项页面
3. 快速连续切换工具状态：
   - 禁用工具 A
   - 等待 200ms
   - 启用工具 A
   - 等待 200ms
   - 禁用工具 B
   - 等待 200ms
   - 启用工具 B
4. 观察 GitHub 页面的菜单变化

**预期结果**:
- ✅ 菜单正确响应每次变化
- ✅ 无竞态条件（race condition）
- ✅ 无多余的 DOM 操作或闪烁
- ✅ 最终状态与选项页面一致
- ✅ 无控制台错误或警告

**实际结果**: _____________

---

### TC-P2-006: 跨多个 GitHub 标签页测试

**步骤**:
1. 打开 3 个不同的 GitHub 仓库标签页（如 react, vue, angular）
2. 在每个标签页打开工具菜单（保持全部打开）
3. 切换到选项页面，禁用一个工具（如 CodeWiki）
4. 依次切换回 3 个 GitHub 标签页

**预期结果**:
- ✅ 所有 3 个标签页的菜单都自动更新
- ✅ 被禁用的工具在所有标签页中都消失
- ✅ 各标签页的工具 URL 仍然正确（根据各自仓库上下文生成）
- ✅ 无性能问题或延迟

**实际结果**: _____________

---

### TC-P2-007: Storage 事件监听器正确性测试

**步骤**:
1. 打开 GitHub 仓库页面，保持菜单打开
2. 打开 Chrome DevTools → Console
3. 执行代码手动修改 storage:
   ```javascript
   chrome.storage.sync.set({
     enabledTools: [1, 2, 3]  // 只启用前 3 个工具
   });
   ```
4. 观察菜单变化

**预期结果**:
- ✅ 菜单自动更新为只显示前 3 个工具
- ✅ Console 输出日志: "User preferences changed, updating dropdown menu"
- ✅ Console 输出日志: "Dropdown menu updated with new tool states"
- ✅ 无错误

**实际结果**: _____________

---

### TC-P2-008: Storage Area 过滤测试

**步骤**:
1. 打开 GitHub 仓库页面，保持菜单打开
2. 打开 Chrome DevTools → Console
3. 执行代码修改 local storage (非 sync):
   ```javascript
   chrome.storage.local.set({
     enabledTools: [1, 2, 3]
   });
   ```
4. 观察菜单

**预期结果**:
- ✅ 菜单不发生任何变化（storage listener 只监听 sync storage）
- ✅ Console 无更新日志
- ✅ 工具列表保持原状

**实际结果**: _____________

---

### TC-P2-009: Edge Case - 仅修改 openInNewTab 设置

**步骤**:
1. 打开 GitHub 仓库页面，保持菜单打开
2. 切换到选项页面
3. 仅修改 "在新标签页打开工具" 设置（不修改工具启用状态）
4. 观察 GitHub 页面菜单

**预期结果**:
- ✅ 菜单不发生任何变化（storage listener 只响应 enabledTools 和 toolOrder 变化）
- ✅ Console 无更新日志（handleStorageChange 提前返回）
- ✅ 无不必要的重渲染

**实际结果**: _____________

---

### TC-P2-010: updateTools() 方法鲁棒性测试

**步骤**:
1. 打开 GitHub 仓库页面
2. 不要打开工具菜单（菜单未渲染）
3. 切换到选项页面，修改工具启用状态
4. 切换回 GitHub 页面

**预期结果**:
- ✅ 无控制台错误（updateTools 检查菜单是否存在）
- ✅ updateTools 方法提前返回（菜单未渲染）
- ✅ 点击悬浮按钮后，菜单显示最新状态

**实际结果**: _____________

---

### TC-P2-011: GitHub SPA 导航兼容性测试

**步骤**:
1. 打开 GitHub 仓库页面（如 `facebook/react`）
2. 禁用一些工具（如只保留前 5 个工具）
3. 在 GitHub 页面内导航到其他页面（点击 Issues、Pull Requests 标签）
4. 返回仓库主页，打开工具菜单

**预期结果**:
- ✅ 导航后工具菜单仍然正确显示
- ✅ storage listener 仍然有效
- ✅ 修改选项后菜单仍然能实时更新
- ✅ 无重复初始化或内存泄漏

**实际结果**: _____________

---

### TC-P2-012: 性能测试 - 配置保存延迟

**步骤**:
1. 打开 GitHub 仓库页面，保持工具菜单打开
2. 切换到选项页面
3. 使用秒表计时：点击切换开关 → 观察 GitHub 菜单更新
4. 重复 5 次，记录平均延迟

**预期结果**:
- ✅ 平均延迟 ≤ 500ms（NFR-003）
- ✅ 最大延迟 ≤ 800ms
- ✅ 无明显卡顿或延迟感

**实际结果**: _____________  
**实测延迟**: _____ ms (平均)

---

## 测试总结

**通过率**: _____ / 12  
**严重问题**: _____  
**一般问题**: _____  
**建议改进**: _____

**签名**: _____________  
**日期**: _____________

---

## 附录：调试技巧

### 查看 Console 日志
```javascript
// src/contents/index.ts 会输出以下日志：
// 1. "User preferences changed, updating dropdown menu"
// 2. "Dropdown menu updated with new tool states"
// 3. "Failed to update dropdown menu: [error]"
```

### 检查 Storage 数据
```javascript
// 在 DevTools Console 执行
chrome.storage.sync.get(null, (data) => console.log(data));
```

### 强制触发更新
```javascript
// 手动触发 storage 变化事件
chrome.storage.sync.set({
  enabledTools: [1, 2, 3, 4, 5]
});
```
