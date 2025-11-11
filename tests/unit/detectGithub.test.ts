import { describe, expect, it } from 'vitest';
import { isGitHubPage } from '@/lib/detectGithub';

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
});
