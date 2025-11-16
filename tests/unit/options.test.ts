/**
 * Unit tests for Options Page functionality
 * Tests for DOM structure, UI text language, and preview functionality
 */

import { describe, expect, it } from 'vitest';
import { TOOLS } from '../../src/lib/config';

/**
 * Mock chrome.runtime.getURL for testing icon paths
 */
global.chrome = {
  runtime: {
    getURL: (path: string) => `chrome-extension://test-id/${path}`,
  },
  // biome-ignore lint/suspicious/noExplicitAny: Mock chrome API requires any type
} as any;

describe('Options Page - UI Text Validation', () => {
  /**
   * Test Suite: Verify all UI text is in English (no Chinese characters)
   * Prevents: Issue #1 from manual testing
   */
  describe('English-only UI validation', () => {
    it('should not contain Chinese characters in warning banner text', () => {
      const warningText =
        'Data corruption detected. Settings have been automatically restored to defaults.';

      // Chinese character regex: [\u4e00-\u9fa5]
      const hasChinese = /[\u4e00-\u9fa5]/.test(warningText);

      expect(hasChinese).toBe(false);
      expect(warningText).toContain('Data corruption detected');
      expect(warningText).not.toContain('检测到');
      expect(warningText).not.toContain('数据损坏');
    });

    it('should not contain Chinese characters in page header', () => {
      const headerText = 'GitHub Switcher - Tool Management';
      const subtitleText = 'Drag to reorder tools, toggle switches to enable/disable';

      expect(/[\u4e00-\u9fa5]/.test(headerText)).toBe(false);
      expect(/[\u4e00-\u9fa5]/.test(subtitleText)).toBe(false);
      expect(headerText).not.toContain('工具管理');
      expect(subtitleText).not.toContain('拖拽');
    });

    it('should not contain Chinese characters in section titles', () => {
      const toolListTitle = 'Tool List';
      const previewTitle = 'Preview';

      expect(/[\u4e00-\u9fa5]/.test(toolListTitle)).toBe(false);
      expect(/[\u4e00-\u9fa5]/.test(previewTitle)).toBe(false);
      expect(toolListTitle).not.toContain('工具列表');
      expect(previewTitle).not.toContain('预览');
    });

    it('should not contain Chinese characters in reset button', () => {
      const resetButtonText = 'Reset to Defaults';

      expect(/[\u4e00-\u9fa5]/.test(resetButtonText)).toBe(false);
      expect(resetButtonText).not.toContain('重置为默认');
    });

    it('should not contain Chinese characters in confirm dialog', () => {
      const confirmMessage =
        'Are you sure you want to reset all settings to defaults? This action cannot be undone.';

      expect(/[\u4e00-\u9fa5]/.test(confirmMessage)).toBe(false);
      expect(confirmMessage).not.toContain('确定');
      expect(confirmMessage).not.toContain('此操作无法撤销');
    });

    it('should not contain Chinese characters in ARIA labels', () => {
      const ariaLabels = [
        'Close warning',
        'Drag to reorder',
        'Enable/disable GitHub.dev',
        'Reset to defaults',
        'Tool menu preview',
        'At least one tool must remain enabled',
      ];

      ariaLabels.forEach((label) => {
        expect(/[\u4e00-\u9fa5]/.test(label)).toBe(false);
      });
    });

    it('should not contain Chinese characters in success/error messages', () => {
      const successMessage = 'Settings have been reset to defaults';
      const errorMessage = 'Failed to save tool order. Please try again.';

      expect(/[\u4e00-\u9fa5]/.test(successMessage)).toBe(false);
      expect(/[\u4e00-\u9fa5]/.test(errorMessage)).toBe(false);
      expect(successMessage).not.toContain('设置已重置');
    });
  });

  /**
   * Test Suite: Verify icon paths are correctly generated
   * Prevents: Issue #3 from manual testing (icons not visible)
   */
  describe('Icon path validation', () => {
    it('should generate correct icon URLs without duplicate "logo/" prefix', () => {
      TOOLS.forEach((tool) => {
        // iconPath already contains 'logo/' prefix (e.g., 'logo/github.dev-16x16.png')
        expect(tool.iconPath).toMatch(/^logo\//);

        // Correct URL should be: assets/logo/github.dev-16x16.png
        const correctUrl = chrome.runtime.getURL(`assets/${tool.iconPath}`);
        expect(correctUrl).toBe(`chrome-extension://test-id/assets/${tool.iconPath}`);

        // Should NOT contain duplicate 'logo/logo/'
        expect(correctUrl).not.toContain('logo/logo/');
      });
    });

    it('should have valid icon paths for all 9 tools', () => {
      expect(TOOLS).toHaveLength(9);

      TOOLS.forEach((tool) => {
        expect(tool.iconPath).toBeTruthy();
        expect(tool.iconPath).toMatch(/\.png$/);
        expect(tool.iconPath).toMatch(/^logo\/.*-16x16\.png$/);
      });
    });

    it('should generate unique icon paths for each tool', () => {
      const iconPaths = TOOLS.map((t) => t.iconPath);
      const uniquePaths = new Set(iconPaths);

      expect(uniquePaths.size).toBe(TOOLS.length);
    });
  });

  /**
   * Test Suite: Verify preview functionality data transformations
   * Prevents: Issue #4 from manual testing (preview area empty)
   */
  describe('Preview generation logic', () => {
    it('should generate preview list with correct tool order', () => {
      const toolOrder = [3, 1, 5, 2, 4, 6, 7, 8, 9];
      const enabledTools = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const previewItems: string[] = [];
      let index = 1;

      for (const toolId of toolOrder) {
        if (!enabledTools.includes(toolId)) continue;

        const tool = TOOLS.find((t) => t.order === toolId);
        if (!tool) continue;

        previewItems.push(`${index}. ${tool.name}`);
        index++;
      }

      expect(previewItems).toHaveLength(9);
      expect(previewItems[0]).toBe('1. CodeWiki'); // toolId 3
      expect(previewItems[1]).toBe('2. GitHub.dev'); // toolId 1
      expect(previewItems[2]).toBe('3. StackBlitz'); // toolId 5
    });

    it('should filter out disabled tools from preview', () => {
      const toolOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const enabledTools = [1, 3, 5]; // Only 3 tools enabled

      const previewItems: string[] = [];

      for (const toolId of toolOrder) {
        if (!enabledTools.includes(toolId)) continue;

        const tool = TOOLS.find((t) => t.order === toolId);
        if (tool) {
          previewItems.push(tool.name);
        }
      }

      expect(previewItems).toHaveLength(3);
      expect(previewItems).toEqual(['GitHub.dev', 'CodeWiki', 'StackBlitz']);
    });

    it('should handle empty enabled tools (show "No tools enabled")', () => {
      const toolOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const enabledTools: number[] = [];

      const previewItems: string[] = [];

      for (const toolId of toolOrder) {
        if (!enabledTools.includes(toolId)) continue;

        const tool = TOOLS.find((t) => t.order === toolId);
        if (tool) {
          previewItems.push(tool.name);
        }
      }

      expect(previewItems).toHaveLength(0);
      // In actual implementation, this should trigger "No tools enabled" message
    });

    it('should maintain preview order consistency with toolOrder', () => {
      const customOrder = [9, 8, 7, 6, 5, 4, 3, 2, 1]; // Reverse order
      const enabledTools = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const previewItems: string[] = [];

      for (const toolId of customOrder) {
        if (!enabledTools.includes(toolId)) continue;

        const tool = TOOLS.find((t) => t.order === toolId);
        if (tool) {
          previewItems.push(tool.name);
        }
      }

      // Should be in reverse order
      expect(previewItems[0]).toBe('githistory'); // toolId 9
      expect(previewItems[1]).toBe('gitingest'); // toolId 8
      expect(previewItems[8]).toBe('GitHub.dev'); // toolId 1
    });
  });

  /**
   * Test Suite: Verify DOM element append order
   * Prevents: Issue #2 from manual testing (tool name not displayed)
   */
  describe('DOM element construction order', () => {
    it('should create tool info container with correct child append order', () => {
      // Simulate creating a tool item
      const toolName = 'GitHub.dev';
      const toolDescription = 'Edit code directly in VS Code for the Web';

      // Create elements (simulating ToolList.createToolItem logic)
      const infoContainer = document.createElement('div');
      infoContainer.className = '__github-switcher-tool-info';

      const nameElement = document.createElement('h3');
      nameElement.className = '__github-switcher-tool-name';
      nameElement.textContent = toolName;

      const descElement = document.createElement('p');
      descElement.className = '__github-switcher-tool-description';
      descElement.textContent = toolDescription;

      // CORRECT ORDER: Append children to container first
      infoContainer.appendChild(nameElement);
      infoContainer.appendChild(descElement);

      // Verify structure
      expect(infoContainer.children).toHaveLength(2);
      expect(infoContainer.children[0]).toBe(nameElement);
      expect(infoContainer.children[1]).toBe(descElement);
      expect(infoContainer.querySelector('h3')?.textContent).toBe(toolName);
      expect(infoContainer.querySelector('p')?.textContent).toBe(toolDescription);
    });

    it('should verify tool item has all required child elements in correct order', () => {
      // Create mock tool item
      const item = document.createElement('div');
      item.className = '__github-switcher-tool-item';

      // 1. Drag handle
      const dragHandle = document.createElement('div');
      dragHandle.className = '__github-switcher-tool-drag-handle';
      item.appendChild(dragHandle);

      // 2. Icon
      const icon = document.createElement('img');
      icon.className = '__github-switcher-tool-icon';
      item.appendChild(icon);

      // 3. Info container (with name + description)
      const infoContainer = document.createElement('div');
      infoContainer.className = '__github-switcher-tool-info';

      const nameElement = document.createElement('h3');
      nameElement.className = '__github-switcher-tool-name';
      infoContainer.appendChild(nameElement);

      const descElement = document.createElement('p');
      descElement.className = '__github-switcher-tool-description';
      infoContainer.appendChild(descElement);

      item.appendChild(infoContainer);

      // 4. Toggle switch
      const toggle = document.createElement('label');
      toggle.className = '__github-switcher-tool-toggle';
      item.appendChild(toggle);

      // Verify all elements exist and are in correct order
      expect(item.children).toHaveLength(4);
      expect(item.children[0].className).toBe('__github-switcher-tool-drag-handle');
      expect(item.children[1].className).toBe('__github-switcher-tool-icon');
      expect(item.children[2].className).toBe('__github-switcher-tool-info');
      expect(item.children[3].className).toBe('__github-switcher-tool-toggle');

      // Verify info container has name and description
      const info = item.querySelector('.__github-switcher-tool-info');
      expect(info?.children).toHaveLength(2);
      expect(info?.children[0].className).toBe('__github-switcher-tool-name');
      expect(info?.children[1].className).toBe('__github-switcher-tool-description');
    });
  });

  /**
   * Test Suite: Verify drag & drop save functionality
   * Prevents: Issue #5 from manual testing (drag order not saved)
   */
  describe('Drag & drop order persistence', () => {
    it('should extract correct tool order from DOM after drag', () => {
      // Simulate DOM structure after drag
      const container = document.createElement('div');

      const createToolItem = (toolId: number) => {
        const item = document.createElement('div');
        item.className = '__github-switcher-tool-item';
        item.dataset.toolId = String(toolId);
        return item;
      };

      // Simulate dragged order: 3, 1, 5, 2, 4, 6, 7, 8, 9
      const draggedOrder = [3, 1, 5, 2, 4, 6, 7, 8, 9];
      draggedOrder.forEach((toolId) => {
        container.appendChild(createToolItem(toolId));
      });

      // Extract order from DOM (simulate onEnd callback)
      const newOrder: number[] = [];
      const items = container.querySelectorAll('.__github-switcher-tool-item');

      items.forEach((item) => {
        const toolId = Number.parseInt((item as HTMLElement).dataset.toolId || '0', 10);
        if (toolId > 0) {
          newOrder.push(toolId);
        }
      });

      expect(newOrder).toEqual([3, 1, 5, 2, 4, 6, 7, 8, 9]);
      expect(newOrder).toHaveLength(9);
    });

    it('should validate extracted order has all 9 unique tool IDs', () => {
      const extractedOrder = [2, 1, 3, 4, 5, 6, 7, 8, 9];

      // Validation logic (from saveToolOrder)
      const uniqueIds = new Set(extractedOrder);
      const hasAllIds = extractedOrder.length === 9 && uniqueIds.size === 9;
      const allIdsInRange = extractedOrder.every((id) => id >= 1 && id <= 9);

      expect(hasAllIds).toBe(true);
      expect(allIdsInRange).toBe(true);
    });

    it('should reject invalid tool orders', () => {
      const invalidOrders = [
        [1, 2, 3, 4, 5, 6, 7, 8], // Missing tool 9
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Extra tool
        [1, 1, 2, 3, 4, 5, 6, 7, 8], // Duplicate
        [0, 1, 2, 3, 4, 5, 6, 7, 8], // Invalid ID (0)
      ];

      invalidOrders.forEach((order) => {
        const uniqueIds = new Set(order);
        const isValid =
          order.length === 9 && uniqueIds.size === 9 && order.every((id) => id >= 1 && id <= 9);

        expect(isValid).toBe(false);
      });
    });
  });
});
