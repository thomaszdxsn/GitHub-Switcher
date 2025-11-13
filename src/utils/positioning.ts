import type { MenuPosition } from '../lib/types';

/**
 * Calculates the optimal position for the dropdown menu
 * based on the button position and available viewport space
 *
 * @param buttonRect - Button's bounding rectangle
 * @param menuHeight - Height of the dropdown menu in pixels
 * @returns Position with coordinates and strategy (bottom-right or top-right)
 *
 * @example
 * const buttonRect = button.getBoundingClientRect();
 * const position = calculateMenuPosition(buttonRect, 300);
 * menu.style.top = `${position.top}px`;
 * menu.style.left = `${position.left}px`;
 */
export function calculateMenuPosition(buttonRect: DOMRect, menuHeight: number): MenuPosition {
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - buttonRect.bottom;

  if (spaceBelow >= menuHeight) {
    // Sufficient space below - use bottom-right positioning
    return {
      top: buttonRect.bottom,
      left: buttonRect.right,
      position: 'bottom-right',
    };
  } else {
    // Insufficient space below - use top-right positioning
    return {
      top: buttonRect.top - menuHeight,
      left: buttonRect.right,
      position: 'top-right',
    };
  }
}
