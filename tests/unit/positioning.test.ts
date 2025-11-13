import { beforeEach, describe, expect, it } from 'vitest';
import { calculateMenuPosition } from '../../src/utils/positioning';

describe('calculateMenuPosition', () => {
  const createMockRect = (top: number, bottom: number, left: number, right: number): DOMRect => ({
    top,
    bottom,
    left,
    right,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  });

  beforeEach(() => {
    // Mock window size
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  it('should position menu bottom-right when sufficient space below', () => {
    const buttonRect = createMockRect(100, 150, 10, 50);
    const menuHeight = 300;

    const result = calculateMenuPosition(buttonRect, menuHeight);

    expect(result.position).toBe('bottom-right');
    expect(result.top).toBe(buttonRect.bottom);
    expect(result.left).toBe(buttonRect.right);
  });

  it('should position menu top-right when insufficient space below', () => {
    // Button near bottom of viewport
    const buttonRect = createMockRect(650, 700, 10, 50);
    const menuHeight = 300;

    const result = calculateMenuPosition(buttonRect, menuHeight);

    expect(result.position).toBe('top-right');
    expect(result.top).toBe(buttonRect.top - menuHeight);
    expect(result.left).toBe(buttonRect.right);
  });

  it('should handle exact space match (menu fits exactly)', () => {
    const buttonRect = createMockRect(100, 150, 10, 50);
    const menuHeight = 650; // Exactly fits (window.innerHeight - button.bottom = 650)

    const result = calculateMenuPosition(buttonRect, menuHeight);

    expect(result.position).toBe('bottom-right');
    expect(result.top).toBe(buttonRect.bottom);
  });

  it('should handle button at very top of viewport', () => {
    const buttonRect = createMockRect(0, 50, 10, 50);
    const menuHeight = 300;

    const result = calculateMenuPosition(buttonRect, menuHeight);

    expect(result.position).toBe('bottom-right');
    expect(result.top).toBe(50);
    expect(result.left).toBe(buttonRect.right);
  });

  it('should handle button at very bottom of viewport', () => {
    const buttonRect = createMockRect(750, 800, 10, 50);
    const menuHeight = 300;

    const result = calculateMenuPosition(buttonRect, menuHeight);

    expect(result.position).toBe('top-right');
    expect(result.top).toBe(750 - 300);
    expect(result.left).toBe(buttonRect.right);
  });

  it('should handle very tall menu', () => {
    const buttonRect = createMockRect(100, 150, 10, 50);
    const menuHeight = 600;

    const result = calculateMenuPosition(buttonRect, menuHeight);

    expect(result.position).toBe('bottom-right');
    expect(result.top).toBe(buttonRect.bottom);
  });

  it('should handle small viewport', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 400,
    });

    const buttonRect = createMockRect(250, 300, 10, 50);
    const menuHeight = 200;

    const result = calculateMenuPosition(buttonRect, menuHeight);

    // Only 100px below button, but menu needs 200px
    expect(result.position).toBe('top-right');
    expect(result.top).toBe(50); // 250 - 200
  });

  it('should return correct position object structure', () => {
    const buttonRect = createMockRect(100, 150, 10, 50);
    const result = calculateMenuPosition(buttonRect, 300);

    expect(result).toHaveProperty('top');
    expect(result).toHaveProperty('left');
    expect(result).toHaveProperty('position');
    expect(typeof result.top).toBe('number');
    expect(typeof result.left).toBe('number');
    expect(['bottom-right', 'top-right']).toContain(result.position);
  });
});
