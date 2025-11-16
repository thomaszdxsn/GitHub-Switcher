import { describe, expect, it } from 'vitest';
import { isGitHubPage, parseGitHubFileUrl, parseGitHubUrl } from '@/lib/detectGithub';

describe('detectGithub', () => {
  describe('isGitHubPage', () => {
    it('returns true for github.com', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'github.com',
          pathname: '/microsoft/typescript',
        },
        writable: true,
        configurable: true,
      });

      const result = isGitHubPage();

      expect(result.isGitHub).toBe(true);
      expect(result.hostname).toBe('github.com');
      expect(result.pathname).toBe('/microsoft/typescript');
    });

    it('returns true for github.com repository pages', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'github.com',
          pathname: '/user/repo/blob/main/file.ts',
        },
        writable: true,
        configurable: true,
      });

      const result = isGitHubPage();

      expect(result.isGitHub).toBe(true);
      expect(result.pathname).toBe('/user/repo/blob/main/file.ts');
    });

    it('returns false for gitlab.com', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'gitlab.com',
          pathname: '/user/repo',
        },
        writable: true,
        configurable: true,
      });

      const result = isGitHubPage();

      expect(result.isGitHub).toBe(false);
      expect(result.hostname).toBe('gitlab.com');
    });

    it('returns false for non-GitHub domains', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'example.com',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const result = isGitHubPage();

      expect(result.isGitHub).toBe(false);
      expect(result.hostname).toBe('example.com');
    });

    it('returns true for GitHub subdomains', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'gist.github.com',
          pathname: '/user/abc123',
        },
        writable: true,
        configurable: true,
      });

      const result = isGitHubPage();

      expect(result.isGitHub).toBe(true);
      expect(result.hostname).toBe('gist.github.com');
    });

    it('returns true for api.github.com', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'api.github.com',
          pathname: '/users/octocat',
        },
        writable: true,
        configurable: true,
      });

      const result = isGitHubPage();

      expect(result.isGitHub).toBe(true);
      expect(result.hostname).toBe('api.github.com');
    });
  });

  describe('parseGitHubUrl', () => {
    it('parses basic repository URL', () => {
      const result = parseGitHubUrl('https://github.com/microsoft/vscode');

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        currentUrl: 'https://github.com/microsoft/vscode',
      });
    });

    it('parses repository URL with blob path', () => {
      const result = parseGitHubUrl(
        'https://github.com/microsoft/vscode/blob/main/src/vs/editor/editor.api.ts'
      );

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        currentUrl: 'https://github.com/microsoft/vscode/blob/main/src/vs/editor/editor.api.ts',
      });
    });

    it('parses repository URL with tree path', () => {
      const result = parseGitHubUrl('https://github.com/facebook/react/tree/main/packages');

      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react',
        currentUrl: 'https://github.com/facebook/react/tree/main/packages',
      });
    });

    it('parses repository URL with pull request', () => {
      const result = parseGitHubUrl('https://github.com/microsoft/vscode/pull/123');

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        currentUrl: 'https://github.com/microsoft/vscode/pull/123',
      });
    });

    it('parses repository URL with issues', () => {
      const result = parseGitHubUrl('https://github.com/microsoft/vscode/issues/456');

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        currentUrl: 'https://github.com/microsoft/vscode/issues/456',
      });
    });

    it('returns null for non-repository URLs', () => {
      expect(parseGitHubUrl('https://github.com/explore')).toBeNull();
      expect(parseGitHubUrl('https://github.com/microsoft')).toBeNull();
      expect(parseGitHubUrl('https://github.com')).toBeNull();
    });

    it('handles www subdomain', () => {
      const result = parseGitHubUrl('https://www.github.com/microsoft/vscode');

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        currentUrl: 'https://www.github.com/microsoft/vscode',
      });
    });

    it('handles http protocol', () => {
      const result = parseGitHubUrl('http://github.com/microsoft/vscode');

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        currentUrl: 'http://github.com/microsoft/vscode',
      });
    });

    it('returns null for invalid owner/repo names', () => {
      // Owner too long (>39 chars)
      const longOwner = 'a'.repeat(40);
      expect(parseGitHubUrl(`https://github.com/${longOwner}/repo`)).toBeNull();

      // Repo too long (>100 chars)
      const longRepo = 'r'.repeat(101);
      expect(parseGitHubUrl(`https://github.com/owner/${longRepo}`)).toBeNull();
    });
  });

  describe('parseGitHubFileUrl', () => {
    // T008: 标准文件 URL 解析（≥3 个测试）
    it('parses standard file URL with main branch', () => {
      const result = parseGitHubFileUrl('https://github.com/microsoft/vscode/blob/main/README.md');

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        ref: 'main',
        filePath: 'README.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/microsoft/vscode/blob/main/README.md',
      });
    });

    it('parses file URL with nested path', () => {
      const result = parseGitHubFileUrl(
        'https://github.com/facebook/react/blob/main/packages/react/src/React.js'
      );

      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react',
        ref: 'main',
        filePath: 'packages/react/src/React.js',
        extension: 'js',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/facebook/react/blob/main/packages/react/src/React.js',
      });
    });

    it('parses file URL with tag reference', () => {
      const result = parseGitHubFileUrl(
        'https://github.com/microsoft/vscode/blob/v1.0.0/src/index.ts'
      );

      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode',
        ref: 'v1.0.0',
        filePath: 'src/index.ts',
        extension: 'ts',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/microsoft/vscode/blob/v1.0.0/src/index.ts',
      });
    });

    it('parses file URL with commit hash', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/a1b2c3d4e5f6/file.txt');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'a1b2c3d4e5f6',
        filePath: 'file.txt',
        extension: 'txt',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/a1b2c3d4e5f6/file.txt',
      });
    });

    // T009: 非文件 URL 返回 null（≥3 个测试）
    it('returns null for repository homepage', () => {
      expect(parseGitHubFileUrl('https://github.com/microsoft/vscode')).toBeNull();
    });

    it('returns null for directory page (tree)', () => {
      expect(parseGitHubFileUrl('https://github.com/microsoft/vscode/tree/main/src')).toBeNull();
    });

    it('returns null for other page types (issues, PRs, wiki)', () => {
      expect(parseGitHubFileUrl('https://github.com/microsoft/vscode/issues')).toBeNull();
      expect(parseGitHubFileUrl('https://github.com/microsoft/vscode/pull/123')).toBeNull();
      expect(parseGitHubFileUrl('https://github.com/microsoft/vscode/wiki')).toBeNull();
    });

    it('returns null for non-GitHub domains', () => {
      expect(parseGitHubFileUrl('https://gitlab.com/owner/repo/blob/main/file.md')).toBeNull();
      expect(parseGitHubFileUrl('https://example.com/file.txt')).toBeNull();
    });

    it('returns null for gist.github.com', () => {
      expect(parseGitHubFileUrl('https://gist.github.com/user/abc123')).toBeNull();
    });

    // T010: 特殊字符与 URL 编码处理（≥4 个测试）
    it('handles file path with spaces (URL encoded as %20)', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/main/my%20file.md');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'my%20file.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/my%20file.md',
      });
    });

    it('handles file path with Chinese characters', () => {
      const result = parseGitHubFileUrl(
        'https://github.com/owner/repo/blob/main/%E6%96%87%E6%A1%A3.md'
      );

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: '%E6%96%87%E6%A1%A3.md',
        extension: 'md',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/%E6%96%87%E6%A1%A3.md',
      });
    });

    it('preserves query parameters', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/main/file.py?plain=1');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.py',
        extension: 'py',
        query: '?plain=1',
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/file.py?plain=1',
      });
    });

    it('preserves hash fragment (line numbers)', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/main/file.js#L20-L30');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.js',
        extension: 'js',
        query: null,
        hash: '#L20-L30',
        currentUrl: 'https://github.com/owner/repo/blob/main/file.js#L20-L30',
      });
    });

    it('preserves both query parameters and hash', () => {
      const result = parseGitHubFileUrl(
        'https://github.com/owner/repo/blob/main/file.py?plain=1#L20'
      );

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.py',
        extension: 'py',
        query: '?plain=1',
        hash: '#L20',
        currentUrl: 'https://github.com/owner/repo/blob/main/file.py?plain=1#L20',
      });
    });

    it('handles files with multiple dots in name', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/main/file.test.ipynb');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'file.test.ipynb',
        extension: 'ipynb',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/file.test.ipynb',
      });
    });

    it('handles files with no extension', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/main/Dockerfile');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'Dockerfile',
        extension: '',
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/Dockerfile',
      });
    });

    it('normalizes extension to lowercase', () => {
      const result = parseGitHubFileUrl('https://github.com/owner/repo/blob/main/DEMO.IPYNB');

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        ref: 'main',
        filePath: 'DEMO.IPYNB',
        extension: 'ipynb', // 扩展名应为小写
        query: null,
        hash: null,
        currentUrl: 'https://github.com/owner/repo/blob/main/DEMO.IPYNB',
      });
    });
  });
});
