import { describe, expect, it } from 'vitest';
import { isGitHubPage, parseGitHubUrl } from '@/lib/detectGithub';

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
});
