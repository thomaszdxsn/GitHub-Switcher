import type { UserPreferences } from './types';

/**
 * Default user preferences
 * Matches spec: FR-008 (new tab by default), all tools enabled
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  openInNewTab: true,
  enabledTools: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

/**
 * Loads user preferences from chrome.storage.sync
 * Returns default preferences if not found
 *
 * @returns Promise resolving to user preferences
 *
 * @example
 * const prefs = await loadPreferences();
 * if (prefs.openInNewTab) {
 *   window.open(url, '_blank');
 * }
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    // Get all keys from storage, then merge with defaults
    const result = await chrome.storage.sync.get(null);

    // Merge with defaults (storage values override defaults)
    const preferences: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      ...result,
    };

    return preferences;
  } catch (_error) {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Saves user preferences to chrome.storage.sync
 * Syncs preferences across Chrome instances
 *
 * @param preferences - User preferences to save
 * @returns Promise resolving when save is complete
 *
 * @example
 * await savePreferences({
 *   openInNewTab: false,
 *   enabledTools: [1, 2, 3]
 * });
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  await chrome.storage.sync.set(preferences);
}
