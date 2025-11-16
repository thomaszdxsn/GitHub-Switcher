import { beforeEach, describe, expect, it } from 'vitest';
import type { ToolEntry } from '@/lib/config';
import { clearCache, computeAllToolStates, computeToolState } from '@/lib/toolStateManager';
import type { FileContext } from '@/lib/types';

describe('toolStateManager', () => {
  beforeEach(() => {
    // 清除缓存，确保每个测试独立 Clear cache for test isolation
    clearCache();
  });

  // T020: 文件页面启用 githistory（≥2 个测试）
  describe('githistory tool on file pages', () => {
    const githistoryTool: ToolEntry = {
      name: 'githistory',
      urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
      order: 9,
      iconPath: 'logo/githistory-16x16.png',
      enableCondition: {
        requiresFilePath: true,
        fileExtensions: [], // 空数组 = 支持所有扩展名
      },
    };

    it('should enable githistory on markdown file page', () => {
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

      const result = computeToolState(githistoryTool, fileContext);

      expect(result.enabled).toBe(true);
      expect(result.toolName).toBe('githistory');
      expect(result.url).toBe('https://github.githistory.xyz/microsoft/vscode/blob/main/README.md');
      expect(result.disabledReason).toBeNull();
    });

    it('should enable githistory on TypeScript file page', () => {
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

      const result = computeToolState(githistoryTool, fileContext);

      expect(result.enabled).toBe(true);
      expect(result.url).toBe(
        'https://github.githistory.xyz/facebook/react/blob/main/packages/react/src/React.js'
      );
    });

    it('should enable githistory on files with no extension', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'Dockerfile',
        extension: '',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/Dockerfile',
      };

      const result = computeToolState(githistoryTool, fileContext);

      expect(result.enabled).toBe(true);
    });
  });

  // T021: 非文件页面禁用 githistory（≥2 个测试）
  describe('githistory tool on non-file pages', () => {
    const githistoryTool: ToolEntry = {
      name: 'githistory',
      urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
      order: 9,
      iconPath: 'logo/githistory-16x16.png',
      enableCondition: {
        requiresFilePath: true,
        fileExtensions: [],
      },
    };

    it('should disable githistory on repository homepage (null context)', () => {
      const result = computeToolState(githistoryTool, null);

      expect(result.enabled).toBe(false);
      expect(result.toolName).toBe('githistory');
      expect(result.url).toBeNull();
      expect(result.disabledReason).toBe('仅适用于文件页面');
    });

    it('should disable githistory when context is null (directory page)', () => {
      const result = computeToolState(githistoryTool, null);

      expect(result.enabled).toBe(false);
      expect(result.disabledReason).toBe('仅适用于文件页面');
    });
  });

  // T022: .ipynb 文件启用 nbviewer（≥2 个测试）
  describe('nbviewer tool on .ipynb files', () => {
    const nbviewerTool: ToolEntry = {
      name: 'nbviewer',
      urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
      order: 6,
      iconPath: 'logo/nbviewer.org-16x16.png',
      enableCondition: {
        requiresFilePath: true,
        fileExtensions: ['ipynb'],
      },
    };

    it('should enable nbviewer on .ipynb file page', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'notebook.ipynb',
        extension: 'ipynb',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/notebook.ipynb',
      };

      const result = computeToolState(nbviewerTool, fileContext);

      expect(result.enabled).toBe(true);
      expect(result.toolName).toBe('nbviewer');
      expect(result.url).toBe('https://nbviewer.org/github/owner/repo/blob/main/notebook.ipynb');
      expect(result.disabledReason).toBeNull();
    });

    it('should enable nbviewer on nested .ipynb file', () => {
      const fileContext: FileContext = {
        owner: 'user',
        repo: 'data-science',
        ref: 'main',
        filePath: 'notebooks/analysis.ipynb',
        extension: 'ipynb',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/user/data-science/blob/main/notebooks/analysis.ipynb',
      };

      const result = computeToolState(nbviewerTool, fileContext);

      expect(result.enabled).toBe(true);
      expect(result.url).toBe(
        'https://nbviewer.org/github/user/data-science/blob/main/notebooks/analysis.ipynb'
      );
    });
  });

  // T023: 非 .ipynb 文件禁用 nbviewer（≥2 个测试）
  describe('nbviewer tool on non-.ipynb files', () => {
    const nbviewerTool: ToolEntry = {
      name: 'nbviewer',
      urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
      order: 6,
      iconPath: 'logo/nbviewer.org-16x16.png',
      enableCondition: {
        requiresFilePath: true,
        fileExtensions: ['ipynb'],
      },
    };

    it('should disable nbviewer on .md file', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'README.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/README.md',
      };

      const result = computeToolState(nbviewerTool, fileContext);

      expect(result.enabled).toBe(false);
      expect(result.toolName).toBe('nbviewer');
      expect(result.url).toBeNull();
      expect(result.disabledReason).toBe('仅适用于 .ipynb 文件');
    });

    it('should disable nbviewer on .py file', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'script.py',
        extension: 'py',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/script.py',
      };

      const result = computeToolState(nbviewerTool, fileContext);

      expect(result.enabled).toBe(false);
      expect(result.disabledReason).toBe('仅适用于 .ipynb 文件');
    });

    it('should disable nbviewer on null context (repository page)', () => {
      const result = computeToolState(nbviewerTool, null);

      expect(result.enabled).toBe(false);
      expect(result.disabledReason).toBe('仅适用于文件页面');
    });
  });

  // T024: 大小写不敏感扩展名（≥2 个测试）
  describe('case-insensitive extension matching', () => {
    const nbviewerTool: ToolEntry = {
      name: 'nbviewer',
      urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
      order: 6,
      iconPath: 'logo/nbviewer.org-16x16.png',
      enableCondition: {
        requiresFilePath: true,
        fileExtensions: ['ipynb'],
      },
    };

    it('should enable nbviewer on .IPYNB (uppercase)', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'DEMO.IPYNB',
        extension: 'ipynb', // parseGitHubFileUrl 已经转为小写
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/DEMO.IPYNB',
      };

      const result = computeToolState(nbviewerTool, fileContext);

      expect(result.enabled).toBe(true);
    });

    it('should enable nbviewer on .Ipynb (mixed case)', () => {
      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'Demo.Ipynb',
        extension: 'ipynb', // parseGitHubFileUrl 已经转为小写
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/Demo.Ipynb',
      };

      const result = computeToolState(nbviewerTool, fileContext);

      expect(result.enabled).toBe(true);
    });
  });

  // T025: 批量计算所有工具状态（≥1 个测试）
  describe('computeAllToolStates', () => {
    it('should compute states for all tools at once', () => {
      const tools: ToolEntry[] = [
        {
          name: 'GitHub.dev',
          urlTemplate: 'https://github.dev/{owner}/{repo}',
          order: 1,
          iconPath: 'logo/github.dev-16x16.png',
          // 无 enableCondition = 总是启用
        },
        {
          name: 'githistory',
          urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
          order: 9,
          iconPath: 'logo/githistory-16x16.png',
          enableCondition: {
            requiresFilePath: true,
            fileExtensions: [],
          },
        },
        {
          name: 'nbviewer',
          urlTemplate: 'https://nbviewer.org/github/{owner}/{repo}/blob/{ref}/{filepath}',
          order: 6,
          iconPath: 'logo/nbviewer.org-16x16.png',
          enableCondition: {
            requiresFilePath: true,
            fileExtensions: ['ipynb'],
          },
        },
      ];

      const fileContext: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'notebook.ipynb',
        extension: 'ipynb',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/notebook.ipynb',
      };

      const result = computeAllToolStates(tools, fileContext);

      expect(result.size).toBe(3);
      expect(result.get('GitHub.dev')?.enabled).toBe(true); // 无条件 = 总是启用
      expect(result.get('githistory')?.enabled).toBe(true); // 文件页面启用
      expect(result.get('nbviewer')?.enabled).toBe(true); // .ipynb 文件启用
    });

    it('should disable file-specific tools on repository page', () => {
      const tools: ToolEntry[] = [
        {
          name: 'GitHub.dev',
          urlTemplate: 'https://github.dev/{owner}/{repo}',
          order: 1,
          iconPath: 'logo/github.dev-16x16.png',
        },
        {
          name: 'githistory',
          urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
          order: 9,
          iconPath: 'logo/githistory-16x16.png',
          enableCondition: {
            requiresFilePath: true,
            fileExtensions: [],
          },
        },
      ];

      const result = computeAllToolStates(tools, null);

      expect(result.size).toBe(2);
      expect(result.get('GitHub.dev')?.enabled).toBe(true); // 无条件 = 总是启用
      expect(result.get('githistory')?.enabled).toBe(false); // 需要文件路径
    });
  });

  // T026: 缓存机制（≥1 个测试）
  describe('caching mechanism', () => {
    it('should reuse cached result for same URL', () => {
      const githistoryTool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
        enableCondition: {
          requiresFilePath: true,
          fileExtensions: [],
        },
      };

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

      // 第一次调用 - 计算并缓存
      const result1 = computeToolState(githistoryTool, fileContext);
      // 第二次调用 - 从缓存读取
      const result2 = computeToolState(githistoryTool, fileContext);

      // 结果应该相同
      expect(result1).toEqual(result2);
      expect(result1.enabled).toBe(true);
      expect(result2.enabled).toBe(true);
    });

    it('should compute new result for different URL (no cache hit)', () => {
      const githistoryTool: ToolEntry = {
        name: 'githistory',
        urlTemplate: 'https://github.githistory.xyz/{owner}/{repo}/blob/{ref}/{filepath}',
        order: 9,
        iconPath: 'logo/githistory-16x16.png',
        enableCondition: {
          requiresFilePath: true,
          fileExtensions: [],
        },
      };

      const fileContext1: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file1.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/file1.md',
      };

      const fileContext2: FileContext = {
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file2.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/file2.md',
      };

      const result1 = computeToolState(githistoryTool, fileContext1);
      const result2 = computeToolState(githistoryTool, fileContext2);

      // 两个结果应该不同（不同的 URL）
      expect(result1.url).not.toBe(result2.url);
      expect(result1.url).toContain('file1.md');
      expect(result2.url).toContain('file2.md');
    });
  });

  // 测试无启用条件的工具（总是启用）
  describe('tools without enable conditions', () => {
    it('should always enable tools without enableCondition', () => {
      const githubDevTool: ToolEntry = {
        name: 'GitHub.dev',
        urlTemplate: 'https://github.dev/{owner}/{repo}',
        order: 1,
        iconPath: 'logo/github.dev-16x16.png',
        // 无 enableCondition
      };

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

      const resultWithFile = computeToolState(githubDevTool, fileContext);
      const resultWithNull = computeToolState(githubDevTool, null);

      expect(resultWithFile.enabled).toBe(true);
      expect(resultWithNull.enabled).toBe(true);
    });
  });
});
