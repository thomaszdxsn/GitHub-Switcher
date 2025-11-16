import { describe, expect, it } from 'vitest';
import { TOOLS, type ToolEntry } from '../../src/lib/config';
import type { FileContext, RepositoryContext } from '../../src/lib/types';
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

  // T013: 文件路径参数替换（{ref}, {filepath}，≥2 个测试）
  describe('file path parameter replacement', () => {
    it('should replace {ref} and {filepath} placeholders with FileContext', () => {
      const fileContext: FileContext = {
        owner: 'microsoft',
        repo: 'vscode',
        ref: 'main',
        filePath: 'README.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/microsoft/vscode/blob/main/README.md',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe('https://github.githistory.xyz/microsoft/vscode/blob/main/README.md');
    });

    it('should handle nested file paths', () => {
      const fileContext: FileContext = {
        owner: 'facebook',
        repo: 'react',
        ref: 'main',
        filePath: 'packages/react/src/React.js',
        extension: 'js',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/facebook/react/blob/main/packages/react/src/React.js',
      };

      const tool: ToolEntry = {
        name: 'nbviewer',
        urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 6,
        iconPath: 'logo/nbviewer.org-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe(
        'https://nbviewer.org/github/facebook/react/blob/main/packages/react/src/React.js'
      );
    });

    it('should work with tag or commit hash refs', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'v1.0.0',
        filePath: 'src/index.ts',
        extension: 'ts',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/v1.0.0/src/index.ts',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe('https://github.githistory.xyz/owner/repo/blob/v1.0.0/src/index.ts');
    });
  });

  // T014: 查询参数与哈希保留（≥2 个测试）
  describe('query parameters and hash preservation', () => {
    it('should preserve query parameters in generated URL', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.py',
        extension: 'py',
        query: '?plain=1',
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/file.py?plain=1',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe('https://github.githistory.xyz/owner/repo/blob/main/file.py?plain=1');
    });

    it('should preserve hash fragment in generated URL', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.js',
        extension: 'js',
        query: null,
        hash: '#L20-L30',
        currentUrl: 'https://github.com/owner/repo/blob/main/file.js#L20-L30',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe('https://github.githistory.xyz/owner/repo/blob/main/file.js#L20-L30');
    });

    it('should preserve both query and hash', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.py',
        extension: 'py',
        query: '?plain=1',
        hash: '#L20',
        currentUrl: 'https://github.com/owner/repo/blob/main/file.py?plain=1#L20',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe('https://github.githistory.xyz/owner/repo/blob/main/file.py?plain=1#L20');
    });
  });

  // T015: URL 编码保持（不二次编码，≥1 个测试）
  describe('URL encoding preservation', () => {
    it('should preserve URL encoding in file paths (no double encoding)', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'my%20file.md', // 已编码的空格
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/my%20file.md',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      // 应保持 %20，不应变成 %2520（二次编码）
      expect(result).toBe('https://github.githistory.xyz/owner/repo/blob/main/my%20file.md');
      expect(result).not.toContain('%2520');
    });

    it('should preserve Chinese characters in encoded form', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: '%E6%96%87%E6%A1%A3.md', // 已编码的中文
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/%E6%96%87%E6%A1%A3.md',
      };

      const tool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      // 应保持原始编码
      expect(result).toBe(
        'https://github.githistory.xyz/owner/repo/blob/main/%E6%96%87%E6%A1%A3.md'
      );
    });

    it('should handle tools without file path placeholders (backward compatibility)', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/file.md',
      };

      // 旧工具模板不包含 {ref} 和 {filepath}
      const tool: ToolEntry = {
        name: 'GitHub.dev',
        urlTemplate: 'https://github.dev/{owner}/{repo}',
        order: 1,
        iconPath: 'logo/github.dev-16x16.png',
      };

      const result = generateToolUrl(tool, fileContext);
      expect(result).toBe('https://github.dev/owner/repo');
    });
  });
});
