/**
 * Unit Tests - Logger
 */

import logger from '../../src/utils/logger.js';

describe('Logger Utility', () => {
  it('should have required logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should have helper methods', () => {
    expect(logger.logError).toBeDefined();
    expect(logger.logSecurityEvent).toBeDefined();
    expect(logger.logBusinessEvent).toBeDefined();
    expect(logger.logRequest).toBeDefined();
  });

  it('should log without throwing errors', () => {
    expect(() => {
      logger.info('Test info message');
      logger.error('Test error message');
      logger.warn('Test warning message');
    }).not.toThrow();
  });

  it('should have stream for Morgan integration', () => {
    expect(logger.stream).toBeDefined();
    expect(logger.stream.write).toBeDefined();
  });
});
