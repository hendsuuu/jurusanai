/**
 * Input sanitization utilities for user-provided text that will be
 * passed to AI prompts or rendered in PDFs/emails.
 *
 * Purpose: prevent prompt injection, HTML injection, and ensure clean
 * data flows through the system.
 */

/**
 * Strip HTML tags, script content, and dangerous characters from user input.
 * Preserves normal text, numbers, and common punctuation.
 */
export function sanitizeText(input: string): string {
  return (
    input
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove potential script injections
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      // Remove null bytes
      .replace(/\0/g, "")
      // Collapse multiple whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Sanitize a city/location name. Only allows letters, numbers, spaces,
 * hyphens, periods, and common Indonesian characters.
 */
export function sanitizeLocation(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s\-.,()'/]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100); // Max 100 chars for a city name
}

/**
 * Sanitize all string fields in a wizard/recommendation input object.
 * Returns a new object with sanitized values.
 */
export function sanitizeWizardInput<T extends Record<string, unknown>>(
  input: T
): T {
  const result = { ...input };

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string") {
      if (key === "locationCity") {
        (result as Record<string, unknown>)[key] = sanitizeLocation(value);
      } else {
        (result as Record<string, unknown>)[key] = sanitizeText(value).slice(0, 200);
      }
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((v) =>
        typeof v === "string" ? sanitizeText(v).slice(0, 200) : v
      );
    }
  }

  return result;
}
