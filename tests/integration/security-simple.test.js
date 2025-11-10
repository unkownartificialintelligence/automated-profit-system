/**
 * Simplified Security Integration Tests
 */

import { sanitizeString, isValidEmail } from '../../src/middleware/validation.js';

describe('Security - Input Sanitization', () => {
  describe('sanitizeString', () => {
    it('should remove XSS attack vectors', () => {
      const dangerous = '<script>alert("XSS")</script>';
      const safe = sanitizeString(dangerous);

      expect(safe).not.toContain('<script>');
      expect(safe).not.toContain('</script>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@company.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });
});
