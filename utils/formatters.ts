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

  // ── Handle "None" or "N/A" strings returned by some LLMs ──────────────────
  if (typeof text === 'string') {
    const lower = text.trim().toLowerCase();
    if (lower === 'none' || lower === 'n/a' || lower === 'null' || lower === 'undefined') {
      return "";
    }
  }

  // ── Real JS array (Supabase jsonb array column) ──────────────────────────
  if (Array.isArray(text)) {
    return text
      .filter(Boolean)
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        // If the array contains objects, recurse or try to extract a text field
        if (typeof item === 'object') {
          return cleanArrayString(item);
        }
        return String(item);
      })
      .filter(Boolean)
      .join('\n\n');
  }

  // ── Plain object (Supabase jsonb object column) ──────────────────────────
  if (typeof text === 'object') {
    // Try known text-holder keys first (expanded list)
    const knownKeys = [
      'text', 'value', 'description', 'advice', 'content', 'items', 
      'treatment', 'remedy', 'remedies', 'chemical', 'organic', 'prevention',
      'solution', 'management'
    ];
    for (const key of knownKeys) {
      if (text[key]) return cleanArrayString(text[key]);
    }
    // Last resort: join all string/array values
    const values = Object.values(text)
      .map(v => (typeof v === 'string' || Array.isArray(v) || typeof v === 'object') ? cleanArrayString(v) : "")
      .filter(v => v !== "");
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
          return parsed.map(i => cleanArrayString(i)).filter(Boolean).join('\n\n');
        }
      } catch {
        // Python-style ['text'] — strip brackets
        const content = cleaned.substring(1, cleaned.length - 1).trim();
        if (!content) return "";

        // Attempt to split by comma, but be careful of commas inside quotes
        // Simple heuristic: if it contains ', ' or ", " it's likely a list
        const separator = content.includes("', '") ? "', '" : content.includes('", "') ? '", "' : null;
        
        if (separator) {
          return content
            .split(separator)
            .map(item => {
              let i = item.trim();
              if (i.startsWith("'") || i.startsWith('"')) i = i.substring(1);
              if (i.endsWith("'") || i.endsWith('"')) i = i.substring(0, i.length - 1);
              return cleanArrayString(i);
            })
            .filter(Boolean)
            .join('\n\n');
        }

        // Single item in brackets like ['text']
        let i = content;
        if ((i.startsWith("'") && i.endsWith("'")) || (i.startsWith('"') && i.endsWith('"'))) {
          i = i.substring(1, i.length - 1);
        }
        return i.replace(/\\'/g, "'").replace(/\\"/g, '"');
      }
    }

    return cleaned;
  }

  return String(text);
};


