import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  isValidExternalUrl,
  sanitizeNumericInput,
  sanitizeSearchQuery,
  sanitizeTextInput,
} from '../security';

describe('security & data sanitization utilities', () => {
  it('escapes HTML special characters against XSS', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
    );
  });

  it('strips HTML tags and javascript: URIs from text inputs', () => {
    expect(sanitizeTextInput('<b>Ananya</b> javascript:alert(1)')).toBe('Ananya alert(1)');
    expect(sanitizeSearchQuery('   engineering <img src=x>')).toBe('engineering ');
  });

  it('clamps numeric inputs within valid bounds', () => {
    expect(sanitizeNumericInput('88', 0, 100)).toBe(88);
    expect(sanitizeNumericInput(150, 0, 100)).toBe(100);
    expect(sanitizeNumericInput(-10, 0, 100)).toBe(0);
    expect(sanitizeNumericInput('', 0, 100)).toBeNull();
  });

  it('validates external URLs safely', () => {
    expect(isValidExternalUrl('https://scholarships.gov.in')).toBe(true);
    expect(isValidExternalUrl('javascript:alert(1)')).toBe(false);
  });
});
