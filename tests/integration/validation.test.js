/**
 * Integration Tests - Input Validation
 */

import { sanitizeString, isValidEmail } from '../../src/middleware/validation.js';

describe('Input Validation Middleware', () => {
  describe('sanitizeString', () => {
    it('should remove XSS characters', () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeString(input);

      expect(output).not.toContain('<');
      expect(output).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const output = sanitizeString(input);

      expect(output).toBe('hello world');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('name.surname@company.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
});
