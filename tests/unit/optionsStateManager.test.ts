/**
 * Unit tests for optionsStateManager
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as optionsStateManager from '@/lib/optionsStateManager';
import * as storage from '@/lib/storage';

// Mock storage module
vi.mock('@/lib/storage', () => ({
  loadPreferences: vi.fn(),
  savePreferences: vi.fn(),
  DEFAULT_PREFERENCES: {
    enabledTools: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    openInNewTab: false,
  },
}));

describe('optionsStateManager', () => {
  const DEFAULT_PREFS = {
    enabledTools: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    openInNewTab: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('toggleToolEnabled', () => {
    it('should enable a disabled tool (add to enabledTools)', async () => {
      // Mock current state: tool 1 is disabled
      const currentPreferences = {
        enabledTools: [2, 3, 4, 5, 6, 7, 8, 9],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };
      vi.mocked(storage.loadPreferences).mockResolvedValue(currentPreferences);
      vi.mocked(storage.savePreferences).mockResolvedValue();

      // Enable tool 1 (enabled = true)
      await optionsStateManager.toggleToolEnabled(1, true);

      // Should save with tool 1 added
      expect(storage.savePreferences).toHaveBeenCalledWith({
        enabledTools: [2, 3, 4, 5, 6, 7, 8, 9, 1],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      });
    });

    it('should disable an enabled tool (remove from enabledTools)', async () => {
      // Mock current state: all tools enabled
      const currentPreferences = {
        enabledTools: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };
      vi.mocked(storage.loadPreferences).mockResolvedValue(currentPreferences);
      vi.mocked(storage.savePreferences).mockResolvedValue();

      // Disable tool 1 (enabled = false)
      await optionsStateManager.toggleToolEnabled(1, false);

      // Should save with tool 1 removed
      expect(storage.savePreferences).toHaveBeenCalledWith({
        enabledTools: [2, 3, 4, 5, 6, 7, 8, 9],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      });
    });

    it('should throw error when disabling the last enabled tool', async () => {
      // Mock current state: only tool 1 is enabled
      const currentPreferences = {
        enabledTools: [1],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };
      vi.mocked(storage.loadPreferences).mockResolvedValue(currentPreferences);

      // Attempt to disable the last tool (enabled = false)
      await expect(optionsStateManager.toggleToolEnabled(1, false)).rejects.toThrow(
        '至少需要保留一个工具启用'
      );

      // Should NOT save anything
      expect(storage.savePreferences).not.toHaveBeenCalled();
    });

    it('should not change enabledTools when enabling already enabled tool', async () => {
      // Mock current state: tool 1 is already enabled
      const currentPreferences = {
        enabledTools: [1, 2, 3],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };
      vi.mocked(storage.loadPreferences).mockResolvedValue(currentPreferences);
      vi.mocked(storage.savePreferences).mockResolvedValue();

      // Enable tool 1 again (enabled = true)
      await optionsStateManager.toggleToolEnabled(1, true);

      // Should save with same enabledTools (no duplicate)
      expect(storage.savePreferences).toHaveBeenCalledWith({
        enabledTools: [1, 2, 3],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      });
    });
  });

  describe('loadToolConfigurationForOptions', () => {
    it('should load tool configuration with user preferences', async () => {
      const mockPreferences = {
        enabledTools: [1, 3, 5],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: true,
      };
      vi.mocked(storage.loadPreferences).mockResolvedValue(mockPreferences);

      const result = await optionsStateManager.loadToolConfigurationForOptions();

      expect(result.config.enabledTools).toEqual([1, 3, 5]);
      expect(result.config.toolOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(storage.loadPreferences).toHaveBeenCalledTimes(1);
    });

    it('should use default values when preferences have corrupted data', async () => {
      // Corrupted data: empty enabledTools
      const corruptedPrefs = {
        enabledTools: [],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };
      vi.mocked(storage.loadPreferences).mockResolvedValue(corruptedPrefs);

      const result = await optionsStateManager.loadToolConfigurationForOptions();

      // Should return default preferences
      expect(result.config.enabledTools).toEqual(DEFAULT_PREFS.enabledTools);
      expect(result.config.toolOrder).toEqual(DEFAULT_PREFS.toolOrder);
      expect(result.hasWarning).toBe(false); // No warning if enabledTools was empty
    });
  });

  describe('saveToolOrder', () => {
    it('should save new tool order to storage', async () => {
      const currentPreferences = DEFAULT_PREFS;
      vi.mocked(storage.loadPreferences).mockResolvedValue(currentPreferences);
      vi.mocked(storage.savePreferences).mockResolvedValue();

      const newOrder = [9, 8, 7, 6, 5, 4, 3, 2, 1];
      await optionsStateManager.saveToolOrder(newOrder);

      expect(storage.savePreferences).toHaveBeenCalledWith({
        enabledTools: DEFAULT_PREFS.enabledTools,
        toolOrder: newOrder,
        openInNewTab: false,
      });
    });

    it('should throw error for invalid tool order (missing tools)', async () => {
      const invalidOrder = [1, 2, 3]; // Only 3 tools

      await expect(optionsStateManager.saveToolOrder(invalidOrder)).rejects.toThrow(
        'Invalid tool order: must contain all 9 unique tool IDs (1-9)'
      );

      expect(storage.savePreferences).not.toHaveBeenCalled();
    });

    it('should throw error for invalid tool order (duplicate tools)', async () => {
      const invalidOrder = [1, 1, 2, 3, 4, 5, 6, 7, 8]; // Duplicate 1, missing 9

      await expect(optionsStateManager.saveToolOrder(invalidOrder)).rejects.toThrow(
        'Invalid tool order: must contain all 9 unique tool IDs (1-9)'
      );

      expect(storage.savePreferences).not.toHaveBeenCalled();
    });
  });

  describe('resetToDefault', () => {
    it('should reset to default configuration', async () => {
      vi.mocked(storage.savePreferences).mockResolvedValue();

      await optionsStateManager.resetToDefault();

      expect(storage.savePreferences).toHaveBeenCalledWith(storage.DEFAULT_PREFERENCES);
    });
  });

  describe('getToolOrder', () => {
    it('should return custom tool order when set', () => {
      const mockPreferences = {
        enabledTools: DEFAULT_PREFS.enabledTools,
        toolOrder: [3, 2, 1, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };

      const result = optionsStateManager.getToolOrder(mockPreferences);

      expect(result).toEqual([3, 2, 1, 4, 5, 6, 7, 8, 9]);
    });

    it('should return default order when toolOrder is undefined', () => {
      const mockPreferences = {
        enabledTools: DEFAULT_PREFS.enabledTools,
        toolOrder: undefined,
        openInNewTab: false,
      };

      const result = optionsStateManager.getToolOrder(mockPreferences);

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('validateToolConfiguration', () => {
    it('should return valid configuration unchanged', () => {
      const validConfig = {
        enabledTools: [1, 2, 3],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };

      const result = optionsStateManager.validateToolConfiguration(validConfig);

      expect(result).toEqual(validConfig);
    });

    it('should fix invalid enabledTools (invalid IDs)', () => {
      const invalidConfig = {
        enabledTools: [1, 2, 10, -1, 5], // 10 and -1 are invalid
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };

      const result = optionsStateManager.validateToolConfiguration(invalidConfig);

      expect(result.enabledTools).toEqual([1, 2, 5]); // Invalid IDs removed
      expect(result.toolOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should fix invalid toolOrder (missing tools)', () => {
      const invalidConfig = {
        enabledTools: [1, 2, 3],
        toolOrder: [1, 2, 3], // Missing tools 4-9
        openInNewTab: false,
      };

      const result = optionsStateManager.validateToolConfiguration(invalidConfig);

      expect(result.enabledTools).toEqual([1, 2, 3]);
      expect(result.toolOrder).toBeUndefined(); // Resets to undefined (default)
    });

    it('should fix empty enabledTools to default', () => {
      const invalidConfig = {
        enabledTools: [],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };

      const result = optionsStateManager.validateToolConfiguration(invalidConfig);

      // Should return DEFAULT_PREFERENCES
      expect(result).toEqual(storage.DEFAULT_PREFERENCES);
    });

    it('should remove duplicate tool IDs from enabledTools', () => {
      const invalidConfig = {
        enabledTools: [1, 2, 2, 3, 3, 3],
        toolOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        openInNewTab: false,
      };

      const result = optionsStateManager.validateToolConfiguration(invalidConfig);

      expect(result.enabledTools).toEqual([1, 2, 3]); // Duplicates removed
    });
  });
});
