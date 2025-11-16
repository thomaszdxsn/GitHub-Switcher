import { TOOLS } from './config';
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences } from './storage';
import type { UserPreferences } from './types';

/**
 * Options page specific tool configuration management
 * Handles user preferences for tool ordering and enabling/disabling
 */

/**
 * Validates and sanitizes user tool configuration
 * Repairs corrupted data by removing duplicates and invalid IDs
 *
 * @param config - User configuration to validate
 * @returns Sanitized configuration or default if unrepairable
 */
export function validateToolConfiguration(config: UserPreferences): UserPreferences {
  // Validate enabledTools
  const validEnabledTools = Array.from(
    new Set(config.enabledTools.filter((id) => id >= 1 && id <= 9))
  );

  // Ensure at least 1 tool is enabled (FR-011 constraint)
  if (validEnabledTools.length === 0) {
    return DEFAULT_PREFERENCES;
  }

  // Validate toolOrder if it exists
  let validToolOrder: number[] | undefined = config.toolOrder;
  if (config.toolOrder) {
    const uniqueOrder = Array.from(new Set(config.toolOrder));
    const validOrder = uniqueOrder.filter((id) => id >= 1 && id <= 9);

    // toolOrder must contain all 9 tools if it exists
    if (validOrder.length !== 9) {
      validToolOrder = undefined; // Fall back to default order
    } else {
      validToolOrder = validOrder;
    }
  }

  return {
    ...config,
    enabledTools: validEnabledTools,
    toolOrder: validToolOrder,
  };
}

/**
 * Loads and validates user tool configuration
 * Returns default config if data is corrupted
 *
 * @returns Promise resolving to {config, hasWarning}
 */
export async function loadToolConfigurationForOptions(): Promise<{
  config: UserPreferences;
  hasWarning: boolean;
}> {
  const rawConfig = await loadPreferences();
  const validatedConfig = validateToolConfiguration(rawConfig);

  // Check if validation changed anything (data corruption detected)
  const hasWarning = JSON.stringify(rawConfig) !== JSON.stringify(validatedConfig);

  return {
    config: validatedConfig,
    hasWarning,
  };
}

/**
 * Saves tool order to storage
 * Validates order contains all 9 unique tool IDs
 *
 * @param toolOrder - New tool order array
 */
export async function saveToolOrder(toolOrder: number[]): Promise<void> {
  // Validate: must contain all 9 unique IDs
  const uniqueIds = Array.from(new Set(toolOrder));
  if (uniqueIds.length !== 9 || !uniqueIds.every((id) => id >= 1 && id <= 9)) {
    throw new Error('Invalid tool order: must contain all 9 unique tool IDs (1-9)');
  }

  const currentPrefs = await loadPreferences();
  await savePreferences({
    ...currentPrefs,
    toolOrder,
  });
}

/**
 * Toggles a tool's enabled/disabled state
 * Prevents disabling the last enabled tool (FR-011)
 *
 * @param toolId - Tool ID to toggle (1-9)
 * @param enabled - New enabled state
 * @throws Error if trying to disable the last enabled tool
 */
export async function toggleToolEnabled(toolId: number, enabled: boolean): Promise<void> {
  const currentPrefs = await loadPreferences();

  // Create new enabledTools array
  let newEnabledTools: number[];
  if (enabled) {
    // Add tool if not already enabled
    newEnabledTools = currentPrefs.enabledTools.includes(toolId)
      ? currentPrefs.enabledTools
      : [...currentPrefs.enabledTools, toolId];
  } else {
    // Remove tool from enabled list
    newEnabledTools = currentPrefs.enabledTools.filter((id) => id !== toolId);

    // FR-011: Prevent disabling the last tool
    if (newEnabledTools.length === 0) {
      throw new Error('至少需要保留一个工具启用');
    }
  }

  await savePreferences({
    ...currentPrefs,
    enabledTools: newEnabledTools,
  });
}

/**
 * Resets tool configuration to default state
 * All tools enabled, default order (1-9)
 */
export async function resetToDefault(): Promise<void> {
  await savePreferences(DEFAULT_PREFERENCES);
}

/**
 * Gets the current tool order
 * Returns custom order if set, otherwise default order (1-9)
 *
 * @param preferences - User preferences
 * @returns Array of tool IDs in display order
 */
export function getToolOrder(preferences: UserPreferences): number[] {
  return preferences.toolOrder || TOOLS.map((tool) => tool.order);
}
