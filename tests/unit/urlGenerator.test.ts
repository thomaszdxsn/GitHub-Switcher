import { describe, expect, it } from 'vitest';
import { TOOLS, type ToolEntry } from '../../src/lib/config';
import type { RepositoryContext } from '../../src/lib/types';
import { generateToolUrl } from '../../src/lib/urlGenerator';

describe('generateToolUrl', () => {
  const mockContext: RepositoryContext = {
    owner: 'microsoft',
    repo: 'vscode',
    currentUrl: 'https://github.com/microsoft/vscode',
  };

  it('should replace {owner} and {repo} placeholders correctly', () => {
    const tool: ToolEntry = {
      name: 'TestTool',
      urlTemplate: 'https://example.com/{owner}/{repo}',
      order: 1,
      iconPath: 'logo/test-16x16.png',
    };

    const result = generateToolUrl(tool, mockContext);
    expect(result).toBe('https://example.com/microsoft/vscode');
  });

  it('should handle GitHub.dev template correctly', () => {
    const tool: ToolEntry = {
      name: 'GitHub.dev',
      urlTemplate: 'https://github.dev/{owner}/{repo}',
      order: 1,
      iconPath: 'logo/github.dev-16x16.png',
    };

    const result = generateToolUrl(tool, mockContext);
    expect(result).toBe('https://github.dev/microsoft/vscode');
  });

  it('should handle StackBlitz template with github prefix', () => {
    const tool: ToolEntry = {
      name: 'StackBlitz',
      urlTemplate: 'https://stackblitz.com/github/{owner}/{repo}',
      order: 4,
      iconPath: 'logo/stackblitz-16x16.png',
    };

    const result = generateToolUrl(tool, mockContext);
    expect(result).toBe('https://stackblitz.com/github/microsoft/vscode');
  });

  it('should encode special characters in owner name', () => {
    const context: RepositoryContext = {
      owner: 'owner/with/slashes',
      repo: 'repo',
      currentUrl: 'https://github.com/owner/with/slashes/repo',
    };

    const tool: ToolEntry = {
      name: 'TestTool',
      urlTemplate: 'https://example.com/{owner}/{repo}',
      order: 1,
      iconPath: 'logo/test-16x16.png',
    };

    const result = generateToolUrl(tool, context);
    expect(result).toBe('https://example.com/owner%2Fwith%2Fslashes/repo');
  });

  it('should encode special characters in repo name', () => {
    const context: RepositoryContext = {
      owner: 'owner',
      repo: 'repo name with spaces',
      currentUrl: 'https://github.com/owner/repo%20name%20with%20spaces',
    };

    const tool: ToolEntry = {
      name: 'TestTool',
      urlTemplate: 'https://example.com/{owner}/{repo}',
      order: 1,
      iconPath: 'logo/test-16x16.png',
    };

    const result = generateToolUrl(tool, context);
    expect(result).toBe('https://example.com/owner/repo%20name%20with%20spaces');
  });

  it('should handle all production tools correctly', () => {
    // Use actual production tools from config
    TOOLS.forEach((tool) => {
      const result = generateToolUrl(tool, mockContext);
      expect(result).toContain('microsoft/vscode');
      expect(result).toMatch(/^https:\/\//);
      // Ensure placeholders are replaced
      expect(result).not.toContain('{owner}');
      expect(result).not.toContain('{repo}');
    });
  });

  it('should generate CodeWiki URL correctly', () => {
    const tool: ToolEntry = {
      name: 'CodeWiki',
      urlTemplate: 'https://codewiki.google/{owner}/{repo}',
      order: 3,
      iconPath: 'logo/codewiki-16x16.png',
    };

    const result = generateToolUrl(tool, mockContext);
    expect(result).toBe('https://codewiki.google/microsoft/vscode');
  });

  it('should handle CodeWiki with special characters in repo name', () => {
    const context: RepositoryContext = {
      owner: 'Lencerf',
      repo: 'vscode-beancount',
      currentUrl: 'https://github.com/Lencerf/vscode-beancount',
    };

    const tool: ToolEntry = {
      name: 'CodeWiki',
      urlTemplate: 'https://codewiki.google/{owner}/{repo}',
      order: 3,
      iconPath: 'logo/codewiki-16x16.png',
    };

    const result = generateToolUrl(tool, context);
    expect(result).toBe('https://codewiki.google/Lencerf/vscode-beancount');
  });

  it('should handle empty owner gracefully', () => {
    const context: RepositoryContext = {
      owner: '',
      repo: 'repo',
      currentUrl: 'https://github.com//repo',
    };

    const tool: ToolEntry = {
      name: 'TestTool',
      urlTemplate: 'https://example.com/{owner}/{repo}',
      order: 1,
      iconPath: 'logo/test-16x16.png',
    };

    const result = generateToolUrl(tool, context);
    expect(result).toBe('https://example.com//repo');
  });

  it('should handle empty repo gracefully', () => {
    const context: RepositoryContext = {
      owner: 'owner',
      repo: '',
      currentUrl: 'https://github.com/owner/',
    };

    const tool: ToolEntry = {
      name: 'TestTool',
      urlTemplate: 'https://example.com/{owner}/{repo}',
      order: 1,
      iconPath: 'logo/test-16x16.png',
    };

    const result = generateToolUrl(tool, context);
    expect(result).toBe('https://example.com/owner/');
  });
});
