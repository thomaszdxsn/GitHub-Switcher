import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { error, log, warn } from '@/utils/logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log()', () => {
    it('should log messages with [GitHub-Switcher] prefix', () => {
      log('Test message');

      expect(console.log).toHaveBeenCalledWith('[GitHub-Switcher]', 'Test message');
    });

    it('logs message with additional arguments', () => {
      log('Test', { key: 'value' });

      expect(console.log).toHaveBeenCalledWith('[GitHub-Switcher]', 'Test {"key":"value"}');
    });

    it('logs message with multiple arguments', () => {
      log('Test', 'arg1', 123);

      expect(console.log).toHaveBeenCalledWith('[GitHub-Switcher]', 'Test arg1 123');
    });
  });

  describe('warn', () => {
    it('logs warning message with prefix', () => {
      warn('Warning message');

      expect(console.warn).toHaveBeenCalledWith('[GitHub-Switcher]', 'Warning message');
    });

    it('logs warning with additional arguments', () => {
      warn('Warning', { flag: 'ENABLE_INJECT' });

      expect(console.warn).toHaveBeenCalledWith(
        '[GitHub-Switcher]',
        'Warning {"flag":"ENABLE_INJECT"}'
      );
    });
  });

  describe('error', () => {
    it('logs error message with prefix', () => {
      error('Error message');

      expect(console.error).toHaveBeenCalledWith('[GitHub-Switcher]', 'Error message');
    });

    it('logs error with Error object', () => {
      const err = new Error('Test error');
      error('Failed', err);

      expect(console.error).toHaveBeenCalled();
      const callArgs = (console.error as ReturnType<typeof vi.spyOn>).mock.calls[0];
      expect(callArgs[0]).toBe('[GitHub-Switcher]');
      expect(callArgs[1]).toContain('Failed');
      // Error objects stringify to {} but contain the error in the original args
    });

    it('handles stringification errors gracefully', () => {
      const circular: { self?: unknown } = {};
      circular.self = circular;

      error('Circular', circular);

      expect(console.error).toHaveBeenCalled();
    });
  });
});
