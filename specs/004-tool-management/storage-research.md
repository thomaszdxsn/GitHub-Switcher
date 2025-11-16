# Chrome Extension Storage 最佳实践研究

**功能分支**: `004-tool-management`  
**创建日期**: 2025-11-16  
**研究目的**: 为工具管理功能设计健壮的 Chrome Storage 数据持久化方案

---

## 1. Chrome Storage 配额限制与管理策略

### 1.1 配额限制详解

#### chrome.storage.sync 限制

| 限制项 | 配额值 | 说明 |
|--------|--------|------|
| **总存储空间** | 100 KB | 所有键值对总大小上限 |
| **单个键值对大小** | 8 KB | 单个 key-value 对的最大字节数 |
| **最大键数量** | 512 个 | 存储的键总数上限 |
| **最大值大小（单键）** | 8,192 字节 | 单个值的字节数上限 |
| **写操作频率** | 120 次/分钟 | 防止滥用的写入频率限制 |
| **写操作突发** | 2 次/秒 | 短时间内的最大写入频率 |

**超限行为**:
- 超过配额时 `chrome.storage.sync.set()` 抛出 `QUOTA_BYTES_PER_ITEM` 错误
- 超过写入频率时操作被节流（throttled），返回错误
- 不影响 `chrome.storage.sync.get()` 读取操作

#### chrome.storage.local 限制

| 限制项 | 配额值 | 说明 |
|--------|--------|------|
| **总存储空间** | 10 MB | 默认上限（可通过 unlimitedStorage 权限扩展） |
| **单个键值对大小** | 无限制 | 仅受总存储空间限制 |
| **最大键数量** | 无限制 | 仅受总存储空间限制 |
| **写操作频率** | 无限制 | 本地存储无频率限制 |

**特点**:
- 数据仅存储在本地，不跨设备同步
- 适合存储大量数据或高频写入场景
- 卸载扩展时数据会被清除（除非使用 unlimitedStorage）

---

### 1.2 配额管理策略

#### 策略 1: 数据压缩与精简

**当前数据大小估算**（工具管理功能）:

```typescript
// UserPreferences 数据示例
const sampleData = {
  openInNewTab: true,          // 1 字节（布尔值）
  enabledTools: [1,2,3,4,5,6,7,8,9], // 18 字节（9个数字）
  toolOrder: [1,2,3,4,5,6,7,8,9]     // 18 字节（9个数字）
};

// JSON 序列化后大小
const jsonString = JSON.stringify(sampleData);
// {"openInNewTab":true,"enabledTools":[1,2,3,4,5,6,7,8,9],"toolOrder":[1,2,3,4,5,6,7,8,9]}
// 约 87 字节 << 8 KB 限制 ✅
```

**优化建议**:
- ✅ 当前数据模型已足够精简（87 字节 vs 8 KB 限制）
- ✅ 使用数字 ID 而非字符串（节省空间）
- ⚠️ 未来如果新增字段，考虑使用缩写键名（如 `ot` 代替 `openInNewTab`）

#### 策略 2: 拆分存储

**场景**: 如果未来工具数量增加到 50+ 个，单个键值对可能超过 8 KB

**解决方案**:
```typescript
// 方案 A: 按功能拆分
await chrome.storage.sync.set({
  'toolConfig.order': [1, 2, 3, ...],    // 工具顺序
  'toolConfig.enabled': [1, 2, 3, ...],  // 启用状态
  'generalSettings': { openInNewTab: true } // 通用设置
});

// 方案 B: 按数据类型拆分
await chrome.storage.sync.set({
  'config.v1': { openInNewTab: true },
  'tools.v1': { order: [...], enabled: [...] }
});
```

**当前结论**: 暂不需要拆分（数据量小），保留为单个键值对 `UserPreferences`

---

### 1.3 配额监控与告警

**实现配额检查工具**:

```typescript
/**
 * 检查 chrome.storage.sync 使用情况
 * @returns 存储使用统计信息
 */
async function getStorageUsage(): Promise<{
  bytesInUse: number;
  quotaBytes: number;
  percentUsed: number;
}> {
  return new Promise((resolve) => {
    chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
      const quotaBytes = chrome.storage.sync.QUOTA_BYTES; // 102400 (100KB)
      const percentUsed = (bytesInUse / quotaBytes) * 100;
      
      resolve({
        bytesInUse,
        quotaBytes,
        percentUsed: Math.round(percentUsed * 100) / 100
      });
    });
  });
}

/**
 * 在设置页面显示存储使用情况（仅开发模式）
 */
async function displayStorageUsage() {
  const usage = await getStorageUsage();
  console.log(`[Storage] Used: ${usage.bytesInUse} / ${usage.quotaBytes} bytes (${usage.percentUsed}%)`);
  
  // 当使用率超过 80% 时显示警告
  if (usage.percentUsed > 80) {
    console.warn('[Storage] Storage usage exceeds 80%, consider cleanup or compression');
  }
}
```

**告警策略**:
- 使用率 > 80%: 控制台警告
- 使用率 > 95%: UI 显示提示，建议用户重置配置或减少启用的工具
- 达到 100%: 阻止新增配置，显示错误消息

---

## 2. Storage.sync 与 Storage.local 回退策略

### 2.1 回退场景分析

**需要回退到 local 的场景**:

1. **同步功能被禁用**: 用户在 Chrome 设置中禁用了同步功能
2. **配额超限**: sync 存储空间已满
3. **写入频率超限**: 短时间内过多写入操作被节流
4. **网络异常**: sync 同步失败（罕见）
5. **隐私模式**: 某些浏览器模式下 sync 不可用

### 2.2 回退模式设计

#### 模式 1: 主动回退（Fallback Pattern）

```typescript
/**
 * 保存用户偏好设置（优先使用 sync，失败时回退到 local）
 * @param preferences - 用户偏好设置
 * @returns Promise resolving when save is complete
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    // 尝试保存到 chrome.storage.sync
    await chrome.storage.sync.set(preferences);
    logger.info('[Storage] Preferences saved to chrome.storage.sync');
  } catch (error) {
    // 如果 sync 失败，回退到 chrome.storage.local
    logger.warn('[Storage] Failed to save to sync, falling back to local:', error);
    
    try {
      await chrome.storage.local.set(preferences);
      logger.info('[Storage] Preferences saved to chrome.storage.local (fallback)');
      
      // 标记当前使用 local 存储（用于读取时判断）
      await chrome.storage.local.set({ '__use_local_storage': true });
    } catch (localError) {
      logger.error('[Storage] Failed to save to both sync and local:', localError);
      throw new Error('Storage save failed');
    }
  }
}
```

#### 模式 2: 智能读取（Smart Load Pattern）

```typescript
/**
 * 加载用户偏好设置（自动检测使用 sync 还是 local）
 * @returns Promise resolving to user preferences
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    // 检查是否被标记为使用 local 存储
    const localFlag = await chrome.storage.local.get('__use_local_storage');
    
    if (localFlag.__use_local_storage) {
      // 从 local 读取
      const result = await chrome.storage.local.get(DEFAULT_PREFERENCES);
      logger.info('[Storage] Preferences loaded from chrome.storage.local');
      return result as UserPreferences;
    }
    
    // 从 sync 读取
    const result = await chrome.storage.sync.get(DEFAULT_PREFERENCES);
    logger.info('[Storage] Preferences loaded from chrome.storage.sync');
    return result as UserPreferences;
    
  } catch (error) {
    logger.error('[Storage] Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}
```

#### 模式 3: 双写策略（Dual-Write Pattern）

**场景**: 确保数据安全，同时写入 sync 和 local

```typescript
/**
 * 双写策略：同时保存到 sync 和 local
 * @param preferences - 用户偏好设置
 */
export async function savePreferencesDualWrite(preferences: UserPreferences): Promise<void> {
  const syncPromise = chrome.storage.sync.set(preferences).catch(error => {
    logger.warn('[Storage] Sync write failed:', error);
  });
  
  const localPromise = chrome.storage.local.set(preferences).catch(error => {
    logger.warn('[Storage] Local write failed:', error);
  });
  
  // 等待至少一个写入成功
  await Promise.any([syncPromise, localPromise]);
  logger.info('[Storage] Preferences saved (dual-write)');
}
```

**权衡**:
- ✅ 优点: 数据冗余，即使 sync 失败也有本地备份
- ⚠️ 缺点: 增加写入开销，可能触发 sync 频率限制

---

### 2.3 推荐方案

**当前项目推荐**: **主动回退模式（Fallback Pattern）**

**理由**:
1. 当前数据量小（87 字节），sync 配额足够
2. 工具配置写入频率低（用户手动调整），不会触发频率限制
3. 主动回退在 sync 失败时自动切换到 local，对用户透明
4. 避免双写带来的额外写入开销

**实施建议**:
- 在 `src/lib/storage.ts` 中实现主动回退逻辑
- 在设置页面添加存储状态指示器（显示当前使用 sync 还是 local）
- 提供"强制切换到 local"选项（高级设置），应对同步问题

---

## 3. Storage.onChanged 事件处理与实时同步

### 3.1 事件监听架构

**场景**: 用户在 Chrome 实例 A 修改配置，实例 B 需要自动更新 UI

```
Chrome 实例 A (设置页面)               Chrome 实例 B (Content Script)
        |                                       |
   用户拖拽工具                                  |
        ↓                                       |
 savePreferences()                               |
        ↓                                       |
chrome.storage.sync.set()                       |
        ↓                                       |
  ════════════════════════════════════════════════
  chrome.storage.sync.onChanged event (跨实例同步)
  ════════════════════════════════════════════════
        |                                       ↓
        |                         chrome.storage.onChanged 监听器
        |                                       ↓
        |                              loadPreferences()
        |                                       ↓
        |                              重新渲染工具菜单
```

### 3.2 监听器实现模式

#### 模式 1: 设置页面监听（Options Page）

```typescript
/**
 * 设置页面监听 storage 变化（用于多标签页同步）
 */
export function watchStorageChanges(callback: (newPrefs: UserPreferences) => void): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    // 仅监听 sync 存储区域的变化
    if (areaName !== 'sync') return;
    
    // 检查是否是 UserPreferences 相关字段
    const relevantFields = ['openInNewTab', 'enabledTools', 'toolOrder'];
    const hasRelevantChange = relevantFields.some(field => field in changes);
    
    if (!hasRelevantChange) return;
    
    // 重新加载配置并触发回调
    loadPreferences().then(newPrefs => {
      logger.info('[Storage] Preferences changed, reloading...', changes);
      callback(newPrefs);
    });
  });
}

// 使用示例（在设置页面）
watchStorageChanges((newPrefs) => {
  // 重新渲染工具列表 UI
  renderToolList(newPrefs);
});
```

#### 模式 2: Content Script 监听

```typescript
/**
 * Content Script 监听 storage 变化（用于更新工具菜单）
 */
export function watchStorageChanges(
  callback: (newPrefs: UserPreferences) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName !== 'sync') return;
    
    const relevantFields = ['enabledTools', 'toolOrder'];
    const hasRelevantChange = relevantFields.some(field => field in changes);
    
    if (!hasRelevantChange) return;
    
    loadPreferences().then(callback);
  };
  
  chrome.storage.onChanged.addListener(listener);
  
  // 返回清理函数（用于组件卸载时移除监听器）
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

// 使用示例（在 Content Script）
const unwatch = watchStorageChanges((newPrefs) => {
  // 重新渲染工具下拉菜单
  if (toolDropdown) {
    toolDropdown.unmount();
    toolDropdown = new ToolDropdown(newPrefs);
    toolDropdown.mount();
  }
});

// 在页面卸载时清理
window.addEventListener('beforeunload', () => {
  unwatch();
});
```

---

### 3.3 去抖动优化（Debounce）

**问题**: 用户快速拖拽多个工具时，每次拖拽都会触发 `onChanged` 事件，导致频繁重渲染

**解决方案**: 使用防抖（debounce）延迟处理

```typescript
/**
 * 防抖函数（300ms 延迟）
 * @param func - 待防抖的函数
 * @param delay - 延迟时间（毫秒）
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 设置页面监听（带防抖）
 */
export function watchStorageChanges(callback: (newPrefs: UserPreferences) => void): void {
  const debouncedCallback = debounce((newPrefs: UserPreferences) => {
    logger.info('[Storage] Applying debounced preferences update');
    callback(newPrefs);
  }, 300); // 300ms 防抖
  
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;
    
    const relevantFields = ['openInNewTab', 'enabledTools', 'toolOrder'];
    const hasRelevantChange = relevantFields.some(field => field in changes);
    
    if (!hasRelevantChange) return;
    
    loadPreferences().then(debouncedCallback);
  });
}
```

**效果**:
- 用户在 300ms 内连续拖拽 5 次，只触发 1 次 UI 重渲染
- 减少不必要的 DOM 操作，提升性能

---

### 3.4 变化检测优化

**优化点**: 仅在字段实际变化时触发回调

```typescript
/**
 * 深度比较两个对象是否相等
 */
function deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * 带变化检测的监听器
 */
export function watchStorageChanges(callback: (newPrefs: UserPreferences) => void): void {
  let lastPrefs: UserPreferences | null = null;
  
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;
    
    loadPreferences().then(newPrefs => {
      // 仅在配置实际变化时触发回调
      if (lastPrefs && deepEqual(lastPrefs, newPrefs)) {
        logger.info('[Storage] Preferences unchanged, skipping callback');
        return;
      }
      
      logger.info('[Storage] Preferences changed, triggering callback');
      lastPrefs = newPrefs;
      callback(newPrefs);
    });
  });
}
```

---

## 4. 错误处理与重试策略

### 4.1 常见存储错误

| 错误类型 | Chrome 错误码 | 触发场景 | 恢复策略 |
|---------|--------------|---------|---------|
| **QUOTA_BYTES** | QuotaExceededError | 存储空间已满 | 清理旧数据或压缩 |
| **QUOTA_BYTES_PER_ITEM** | QuotaExceededError | 单个键值对超过 8KB | 拆分数据或压缩 |
| **RATE_LIMIT** | (无明确错误码) | 写入频率超限 | 延迟重试 |
| **SYNC_DISABLED** | (无明确错误码) | 用户禁用同步 | 回退到 local |
| **NETWORK_ERROR** | NetworkError | 网络异常 | 自动重试 3 次 |

### 4.2 错误处理模式

#### 模式 1: 带重试的保存函数

```typescript
/**
 * 带重试逻辑的保存函数
 * @param preferences - 用户偏好设置
 * @param maxRetries - 最大重试次数
 */
export async function savePreferencesWithRetry(
  preferences: UserPreferences,
  maxRetries = 3
): Promise<void> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await chrome.storage.sync.set(preferences);
      logger.info(`[Storage] Saved successfully on attempt ${attempt + 1}`);
      return;
      
    } catch (error: any) {
      attempt++;
      
      // 检查错误类型
      if (error.message?.includes('QUOTA')) {
        // 配额错误，不重试，直接回退到 local
        logger.error('[Storage] Quota exceeded, falling back to local');
        await chrome.storage.local.set(preferences);
        await chrome.storage.local.set({ '__use_local_storage': true });
        return;
      }
      
      if (attempt >= maxRetries) {
        logger.error(`[Storage] Failed after ${maxRetries} attempts:`, error);
        throw new Error('Failed to save preferences after retries');
      }
      
      // 指数退避（Exponential Backoff）
      const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
      logger.warn(`[Storage] Retry ${attempt}/${maxRetries} after ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

#### 模式 2: 错误边界（Error Boundary）

```typescript
/**
 * 存储操作错误边界
 */
export class StorageErrorBoundary {
  private errorCount = 0;
  private lastErrorTime = 0;
  private readonly ERROR_THRESHOLD = 5;
  private readonly ERROR_WINDOW = 60000; // 1 分钟
  
  /**
   * 执行存储操作并捕获错误
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      this.reset(); // 成功时重置错误计数
      return result;
      
    } catch (error) {
      this.recordError();
      
      // 如果错误频率过高，进入降级模式
      if (this.shouldDegrade()) {
        logger.error('[Storage] Too many errors, entering degraded mode');
        return this.handleDegradedMode();
      }
      
      throw error;
    }
  }
  
  private recordError(): void {
    const now = Date.now();
    
    // 如果距离上次错误超过窗口期，重置计数
    if (now - this.lastErrorTime > this.ERROR_WINDOW) {
      this.errorCount = 0;
    }
    
    this.errorCount++;
    this.lastErrorTime = now;
  }
  
  private shouldDegrade(): boolean {
    return this.errorCount >= this.ERROR_THRESHOLD;
  }
  
  private handleDegradedMode(): any {
    // 降级模式：使用内存缓存，不持久化
    logger.warn('[Storage] Using in-memory cache (degraded mode)');
    return DEFAULT_PREFERENCES;
  }
  
  private reset(): void {
    this.errorCount = 0;
  }
}

// 使用示例
const errorBoundary = new StorageErrorBoundary();

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  await errorBoundary.execute(() => chrome.storage.sync.set(preferences));
}
```

---

### 4.3 数据回滚策略

**场景**: 保存新配置失败，需要回滚到上一次的有效配置

```typescript
/**
 * 带回滚功能的保存函数
 */
export async function savePreferencesWithRollback(
  newPreferences: UserPreferences
): Promise<void> {
  // 1. 备份当前配置
  const backup = await loadPreferences();
  
  try {
    // 2. 尝试保存新配置
    await chrome.storage.sync.set(newPreferences);
    logger.info('[Storage] Preferences saved successfully');
    
  } catch (error) {
    // 3. 如果失败，回滚到备份配置
    logger.error('[Storage] Save failed, rolling back:', error);
    
    try {
      await chrome.storage.sync.set(backup);
      logger.info('[Storage] Rollback successful');
    } catch (rollbackError) {
      logger.error('[Storage] Rollback failed:', rollbackError);
    }
    
    throw error;
  }
}
```

---

## 5. 数据校验与损坏恢复

### 5.1 数据校验规则

```typescript
/**
 * 校验用户偏好设置的完整性
 */
export function validatePreferences(prefs: any): {
  valid: boolean;
  errors: string[];
  corrected: UserPreferences;
} {
  const errors: string[] = [];
  const corrected: UserPreferences = { ...DEFAULT_PREFERENCES };
  
  // 1. 检查 openInNewTab 字段
  if (typeof prefs.openInNewTab !== 'boolean') {
    errors.push('openInNewTab must be a boolean');
  } else {
    corrected.openInNewTab = prefs.openInNewTab;
  }
  
  // 2. 检查 enabledTools 字段
  if (!Array.isArray(prefs.enabledTools)) {
    errors.push('enabledTools must be an array');
  } else {
    // 过滤无效 ID（不在 1-9 范围内）
    const validIds = prefs.enabledTools.filter((id: any) => 
      typeof id === 'number' && id >= 1 && id <= 9
    );
    
    // 去重
    corrected.enabledTools = [...new Set(validIds)];
    
    if (corrected.enabledTools.length !== prefs.enabledTools.length) {
      errors.push('enabledTools contains invalid or duplicate IDs');
    }
  }
  
  // 3. 检查 toolOrder 字段（可选）
  if (prefs.toolOrder !== undefined) {
    if (!Array.isArray(prefs.toolOrder)) {
      errors.push('toolOrder must be an array');
    } else {
      // 必须包含所有 9 个工具 ID
      const validOrder = prefs.toolOrder.filter((id: any) => 
        typeof id === 'number' && id >= 1 && id <= 9
      );
      
      if (validOrder.length === 9 && new Set(validOrder).size === 9) {
        corrected.toolOrder = validOrder;
      } else {
        errors.push('toolOrder must contain all 9 unique tool IDs');
        corrected.toolOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 恢复默认顺序
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    corrected
  };
}
```

### 5.2 自动修复策略

```typescript
/**
 * 加载并自动修复损坏的配置
 */
export async function loadPreferencesWithAutoFix(): Promise<{
  preferences: UserPreferences;
  fixed: boolean;
  errors: string[];
}> {
  try {
    const rawData = await chrome.storage.sync.get(null); // 读取所有数据
    const validation = validatePreferences(rawData);
    
    if (validation.valid) {
      // 数据完整，直接返回
      return {
        preferences: validation.corrected,
        fixed: false,
        errors: []
      };
    }
    
    // 数据损坏，使用修复后的版本
    logger.warn('[Storage] Data corrupted, auto-fixing:', validation.errors);
    
    // 保存修复后的配置
    await chrome.storage.sync.set(validation.corrected);
    
    return {
      preferences: validation.corrected,
      fixed: true,
      errors: validation.errors
    };
    
  } catch (error) {
    logger.error('[Storage] Failed to load preferences:', error);
    return {
      preferences: DEFAULT_PREFERENCES,
      fixed: true,
      errors: ['Failed to read from storage']
    };
  }
}
```

### 5.3 用户通知策略

```typescript
/**
 * 在设置页面显示修复通知
 */
export function showFixNotification(errors: string[]): void {
  const notification = document.createElement('div');
  notification.className = '__github-switcher-notification';
  notification.innerHTML = `
    <div class="notification-icon">⚠️</div>
    <div class="notification-content">
      <strong>配置数据异常已自动修复</strong>
      <ul>
        ${errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
      <p>已恢复为默认设置，您可以重新自定义配置。</p>
    </div>
    <button class="notification-close">关闭</button>
  `;
  
  document.body.appendChild(notification);
  
  // 5 秒后自动关闭
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
```

---

## 6. 防抖写入实现（300ms Debounce）

### 6.1 防抖函数实现

```typescript
/**
 * 通用防抖函数
 * @param func - 待防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    // 清除上一个定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // 设置新的定时器
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}
```

### 6.2 拖拽场景应用

```typescript
/**
 * 工具管理类（设置页面）
 */
export class ToolManager {
  private currentPreferences: UserPreferences;
  
  // 创建防抖保存函数（300ms）
  private debouncedSave = debounce(
    async (prefs: UserPreferences) => {
      try {
        await savePreferences(prefs);
        logger.info('[ToolManager] Preferences auto-saved (debounced)');
      } catch (error) {
        logger.error('[ToolManager] Auto-save failed:', error);
      }
    },
    300
  );
  
  constructor(initialPrefs: UserPreferences) {
    this.currentPreferences = initialPrefs;
  }
  
  /**
   * 拖拽结束时调用（会触发防抖保存）
   */
  onDragEnd(newOrder: number[]): void {
    this.currentPreferences.toolOrder = newOrder;
    
    // 立即更新 UI（不等待保存完成）
    this.renderToolList(this.currentPreferences);
    
    // 触发防抖保存
    this.debouncedSave(this.currentPreferences);
  }
  
  /**
   * 切换工具启用状态（会触发防抖保存）
   */
  toggleTool(toolId: number): void {
    const index = this.currentPreferences.enabledTools.indexOf(toolId);
    
    if (index >= 0) {
      // 禁用工具
      this.currentPreferences.enabledTools.splice(index, 1);
    } else {
      // 启用工具
      this.currentPreferences.enabledTools.push(toolId);
    }
    
    // 立即更新 UI
    this.renderToolList(this.currentPreferences);
    
    // 触发防抖保存
    this.debouncedSave(this.currentPreferences);
  }
  
  private renderToolList(prefs: UserPreferences): void {
    // UI 渲染逻辑
  }
}
```

**效果**:
- 用户快速拖拽 10 次工具，只触发 1 次 `chrome.storage.sync.set()`
- 用户在 300ms 内连续点击 5 个开关，只触发 1 次保存
- 减少对 Chrome Storage API 的调用频率，避免触发频率限制

---

### 6.3 立即保存模式（Immediate Save）

**场景**: 某些关键操作需要立即保存，不使用防抖

```typescript
export class ToolManager {
  private debouncedSave = debounce(/* ... */, 300);
  
  /**
   * 重置为默认配置（立即保存，不防抖）
   */
  async resetToDefault(): Promise<void> {
    this.currentPreferences = { ...DEFAULT_PREFERENCES };
    
    // 立即保存（不使用防抖）
    await savePreferences(this.currentPreferences);
    logger.info('[ToolManager] Reset to default, saved immediately');
    
    // 更新 UI
    this.renderToolList(this.currentPreferences);
  }
}
```

---

## 7. 数据迁移策略

### 7.1 版本化数据模型

```typescript
/**
 * 带版本号的用户偏好设置
 */
interface VersionedPreferences {
  /** 数据模型版本 */
  version: number;
  
  /** 用户偏好设置 */
  data: UserPreferences;
  
  /** 最后更新时间（ISO8601） */
  updatedAt: string;
}

/**
 * 当前版本号
 */
const CURRENT_VERSION = 1;
```

### 7.2 迁移函数

```typescript
/**
 * 从 v0 迁移到 v1（新增 toolOrder 字段）
 */
function migrateV0ToV1(oldData: any): UserPreferences {
  return {
    openInNewTab: oldData.openInNewTab ?? true,
    enabledTools: oldData.enabledTools ?? [1, 2, 3, 4, 5, 6, 7, 8, 9],
    toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9] // 新增字段，使用默认顺序
  };
}

/**
 * 自动迁移到最新版本
 */
export async function loadPreferencesWithMigration(): Promise<UserPreferences> {
  const rawData = await chrome.storage.sync.get(null);
  
  // 检查版本号
  const version = rawData.version ?? 0;
  
  if (version === CURRENT_VERSION) {
    // 已是最新版本，直接返回
    return rawData.data as UserPreferences;
  }
  
  // 执行迁移
  logger.info(`[Storage] Migrating from v${version} to v${CURRENT_VERSION}`);
  
  let migratedData: UserPreferences;
  
  switch (version) {
    case 0:
      migratedData = migrateV0ToV1(rawData);
      break;
    default:
      logger.error(`[Storage] Unknown version ${version}, using default`);
      migratedData = DEFAULT_PREFERENCES;
  }
  
  // 保存迁移后的数据
  const versionedData: VersionedPreferences = {
    version: CURRENT_VERSION,
    data: migratedData,
    updatedAt: new Date().toISOString()
  };
  
  await chrome.storage.sync.set(versionedData);
  logger.info('[Storage] Migration completed');
  
  return migratedData;
}
```

### 7.3 未来版本迁移示例

**场景**: v2 新增工具分类字段

```typescript
interface UserPreferencesV2 {
  openInNewTab: boolean;
  enabledTools: number[];
  toolOrder: number[];
  toolCategories?: Record<number, string>; // 新增字段
}

function migrateV1ToV2(oldData: UserPreferences): UserPreferencesV2 {
  return {
    ...oldData,
    toolCategories: {
      1: 'editor',
      2: 'documentation',
      3: 'documentation',
      // ...
    }
  };
}
```

---

## 8. 总结与最佳实践

### 8.1 推荐架构

```typescript
// src/lib/storage.ts (扩展版)

import type { UserPreferences } from './types';
import { logger } from '../utils/logger';

// ============ 默认配置 ============
export const DEFAULT_PREFERENCES: UserPreferences = {
  openInNewTab: true,
  enabledTools: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9]
};

// ============ 核心 API ============

/**
 * 加载用户偏好设置（带自动修复）
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_PREFERENCES);
    const validation = validatePreferences(result);
    
    if (!validation.valid) {
      logger.warn('[Storage] Auto-fixing corrupted data:', validation.errors);
      await chrome.storage.sync.set(validation.corrected);
    }
    
    return validation.corrected;
  } catch (error) {
    logger.error('[Storage] Failed to load, using default:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * 保存用户偏好设置（带回退）
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    await chrome.storage.sync.set(preferences);
    logger.info('[Storage] Preferences saved to sync');
  } catch (error) {
    logger.warn('[Storage] Sync failed, falling back to local:', error);
    await chrome.storage.local.set(preferences);
    await chrome.storage.local.set({ '__use_local_storage': true });
  }
}

/**
 * 监听配置变化（带防抖）
 */
export function watchStorageChanges(
  callback: (newPrefs: UserPreferences) => void
): () => void {
  const debouncedCallback = debounce(callback, 300);
  
  const listener = (changes: any, areaName: string) => {
    if (areaName !== 'sync') return;
    
    const relevantFields = ['enabledTools', 'toolOrder'];
    const hasChange = relevantFields.some(field => field in changes);
    
    if (hasChange) {
      loadPreferences().then(debouncedCallback);
    }
  };
  
  chrome.storage.onChanged.addListener(listener);
  
  return () => chrome.storage.onChanged.removeListener(listener);
}

// ============ 辅助函数 ============

function validatePreferences(prefs: any): {
  valid: boolean;
  errors: string[];
  corrected: UserPreferences;
} {
  // 实现见 5.1 节
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  // 实现见 6.1 节
}
```

---

### 8.2 关键实践要点

| 实践要点 | 说明 | 优先级 |
|---------|------|--------|
| ✅ **主动回退** | sync 失败时自动切换到 local | P0 |
| ✅ **数据校验** | 读取时自动验证并修复损坏数据 | P0 |
| ✅ **防抖写入** | 300ms 防抖，避免频繁写入 | P1 |
| ✅ **监听同步** | 监听 storage.onChanged 实现跨实例同步 | P1 |
| ✅ **错误重试** | 使用指数退避策略重试失败操作 | P2 |
| ✅ **配额监控** | 监控存储使用率，超过 80% 告警 | P2 |
| ✅ **版本迁移** | 支持数据模型版本化与自动迁移 | P3 |

---

### 8.3 性能指标

| 指标 | 目标值 | 测量方法 |
|-----|--------|---------|
| **读取延迟** | <50ms (P95) | `performance.now()` 测量 `loadPreferences()` |
| **写入延迟** | <100ms (P95) | `performance.now()` 测量 `savePreferences()` |
| **跨实例同步** | <5s (P95) | 实例 A 保存后，实例 B 收到 `onChanged` 事件 |
| **防抖延迟** | 300ms | 拖拽结束后 300ms 触发保存 |
| **数据大小** | <1KB | JSON.stringify() 后的字节数 |

---

### 8.4 测试清单

- [ ] **功能测试**
  - [ ] 首次安装时使用默认配置
  - [ ] 保存配置后刷新页面，配置保持
  - [ ] 跨 Chrome 实例同步（实例 A 修改，实例 B 自动更新）
  
- [ ] **错误处理测试**
  - [ ] 模拟 sync 配额超限，自动回退到 local
  - [ ] 模拟数据损坏（手动修改 storage），自动修复
  - [ ] 模拟网络异常，重试 3 次后回退
  
- [ ] **性能测试**
  - [ ] 快速拖拽 10 次工具，验证防抖（只触发 1 次保存）
  - [ ] 测量 `loadPreferences()` 延迟 <50ms
  - [ ] 测量跨实例同步延迟 <5s
  
- [ ] **边界测试**
  - [ ] toolOrder 包含重复 ID，自动修复
  - [ ] enabledTools 为空数组，允许（所有工具禁用）
  - [ ] 旧版本数据（无 toolOrder 字段），自动迁移

---

**文档版本**: v1.0  
**最后更新**: 2025-11-16  
**审核状态**: 待审核
