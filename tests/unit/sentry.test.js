/**
 * Sentry Error Monitoring Tests
 */

import { isSentryEnabled } from '../../src/utils/sentry.js';

describe('Sentry Error Monitoring', () => {
  it('should indicate Sentry status', () => {
    const enabled = isSentryEnabled();
    expect(typeof enabled).toBe('boolean');
  });

  it('should be disabled without DSN', () => {
    // In test environment without SENTRY_DSN, should be disabled
    if (!process.env.SENTRY_DSN) {
      const enabled = isSentryEnabled();
      expect(enabled).toBe(false);
    }
  });
});
