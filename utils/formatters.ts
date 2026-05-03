/**
 * Cleans up any value returned from Supabase and returns a human-readable string.
 * Handles:
 *  - null / undefined          → ""
 *  - Real JS arrays            → joined with newlines
 *  - JSONB objects             → extracts known text fields, or joins values
 *  - Stringified JSON arrays   → ["text"] or ['text'] → plain text
 *  - Plain strings             → returned as-is
 */
export const cleanArrayString = (text: any): string => {
  if (text === null || text === undefined) return "";

  // ── Real JS array (Supabase jsonb array column) ──────────────────────────
  if (Array.isArray(text)) {
    return text
      .filter(Boolean)
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        // If the array contains objects, try to extract a text field
        if (typeof item === 'object') {
          return item.text || item.value || item.description || item.advice || JSON.stringify(item);
        }
        return String(item);
      })
      .join('\n\n');
  }

  // ── Plain object (Supabase jsonb object column) ──────────────────────────
  if (typeof text === 'object') {
    // Try known text-holder keys first
    const knownKeys = ['text', 'value', 'description', 'advice', 'content', 'items'];
    for (const key of knownKeys) {
      if (text[key]) return cleanArrayString(text[key]);
    }
    // Last resort: join all string values
    const values = Object.values(text).filter((v): v is string => typeof v === 'string');
    return values.join('\n\n') || "";
  }

  // ── String handling ───────────────────────────────────────────────────────
  if (typeof text === 'string') {
    let cleaned = text.trim();

    // Check if it looks like a stringified array: ["text"] or ['text']
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).join('\n\n');
        }
      } catch {
        // Python-style ['text'] — strip brackets and outer quotes
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        if (
          (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
          (cleaned.startsWith('"') && cleaned.endsWith('"'))
        ) {
          cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        return cleaned.replace(/\\'/g, "'").replace(/\\"/g, '"');
      }
    }

    return cleaned;
  }

  return String(text);
};

