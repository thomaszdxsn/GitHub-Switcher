import { describe, expect, it } from 'vitest';
import { getToolDescription, TOOL_DESCRIPTIONS, TOOLS } from '../../src/lib/config';

describe('getToolDescription', () => {
  describe('Valid tool IDs (1-9)', () => {
    it('should return correct description for GitHub.dev (order 1)', () => {
      const result = getToolDescription(1);
      expect(result).toBe("GitHub's official online code editor for quick edits");
    });

    it('should return correct description for DeepWiki (order 2)', () => {
      const result = getToolDescription(2);
      expect(result).toBe('AI-powered documentation generator for code repositories');
    });

    it('should return correct description for CodeWiki (order 3)', () => {
      const result = getToolDescription(3);
      expect(result).toBe("Google's code visualization tool with interactive navigation");
    });

    it('should return correct description for CodeSandbox (order 4)', () => {
      const result = getToolDescription(4);
      expect(result).toBe('Online IDE with live preview for frontend projects');
    });

    it('should return correct description for StackBlitz (order 5)', () => {
      const result = getToolDescription(5);
      expect(result).toBe('Quick dev environment launcher with framework templates');
    });

    it('should return correct description for nbviewer (order 6)', () => {
      const result = getToolDescription(6);
      expect(result).toBe('Render Jupyter notebooks with better viewing experience');
    });

    it('should return correct description for gitdiagram (order 7)', () => {
      const result = getToolDescription(7);
      expect(result).toBe('Visualize Git repository branch relationships and history');
    });

    it('should return correct description for gitingest (order 8)', () => {
      const result = getToolDescription(8);
      expect(result).toBe('Package entire codebase into single text file for sharing');
    });

    it('should return correct description for githistory (order 9)', () => {
      const result = getToolDescription(9);
      expect(result).toBe('Visualize complete file modification history and evolution');
    });
  });

  describe('Invalid tool IDs', () => {
    it('should return fallback message for order 0', () => {
      const result = getToolDescription(0);
      expect(result).toBe('No description available');
    });

    it('should return fallback message for order 10', () => {
      const result = getToolDescription(10);
      expect(result).toBe('No description available');
    });

    it('should return fallback message for negative order', () => {
      const result = getToolDescription(-1);
      expect(result).toBe('No description available');
    });

    it('should return fallback message for very large order', () => {
      const result = getToolDescription(999);
      expect(result).toBe('No description available');
    });
  });

  describe('Description length validation (FR-003)', () => {
    it('should ensure all descriptions are 40-60 characters', () => {
      // Check all 9 tool descriptions
      for (let order = 1; order <= 9; order++) {
        const description = getToolDescription(order);
        expect(description.length).toBeGreaterThanOrEqual(40);
        expect(description.length).toBeLessThanOrEqual(60);
      }
    });

    it('should ensure TOOL_DESCRIPTIONS has exactly 9 entries', () => {
      const keys = Object.keys(TOOL_DESCRIPTIONS);
      expect(keys).toHaveLength(9);
    });

    it('should ensure all tool orders have descriptions', () => {
      // All TOOLS should have corresponding descriptions
      TOOLS.forEach((tool) => {
        const description = getToolDescription(tool.order);
        expect(description).not.toBe('No description available');
        expect(description.length).toBeGreaterThanOrEqual(40);
      });
    });
  });

  describe('Type safety', () => {
    it('should accept number type for toolOrder parameter', () => {
      const toolOrder: number = 5;
      const result = getToolDescription(toolOrder);
      expect(typeof result).toBe('string');
    });

    it('should return string type', () => {
      const result = getToolDescription(1);
      expect(typeof result).toBe('string');
    });
  });

  describe('Edge cases', () => {
    it('should handle decimal numbers by returning fallback', () => {
      const result = getToolDescription(1.5);
      expect(result).toBe('No description available');
    });

    it('should handle NaN by returning fallback', () => {
      const result = getToolDescription(Number.NaN);
      expect(result).toBe('No description available');
    });

    it('should handle Infinity by returning fallback', () => {
      const result = getToolDescription(Number.POSITIVE_INFINITY);
      expect(result).toBe('No description available');
    });
  });
});
