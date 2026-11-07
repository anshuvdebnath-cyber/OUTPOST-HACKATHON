/**
 * Security, input sanitization, and data validation utilities for Grantly.
 * Protects client-side state, search queries, profile forms, and CSV/ICS exports
 * against injection, malformed payloads, and out-of-range numeric values.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML special characters to prevent XSS in rendered or exported strings.
 */
export function escapeHtml(raw: string): string {
  return String(raw ?? '').replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/**
 * Sanitizes free-text user input by stripping control characters, script tags,
 * and excessive whitespace while enforcing a safe maximum length.
 */
export function sanitizeTextInput(input: string, maxLength = 160): string {
  const cleaned = String(input ?? '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .split('')
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes search queries for safe substring and keyword matching.
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeTextInput(query, 120).trimStart();
}

/**
 * Validates and clamps numeric inputs (such as academic percentage or family income).
 */
export function sanitizeNumericInput(
  value: number | string | null | undefined,
  min: number,
  max: number,
): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
}

/**
 * Verifies that an external scholarship portal URL uses a safe `https:` or `http:` protocol.
 */
export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
