/**
 * Cleans up stringified arrays (e.g. "['Something']" or '["Something"]') 
 * and returns a clean, human-readable string.
 * Also handles actual arrays if they slip through the JSON parsing.
 */
export const cleanArrayString = (text: any): string => {
  if (!text) return "";
  
  // If it's already an array, join it
  if (Array.isArray(text)) {
    return text.filter(Boolean).join('\n\n');
  }
  
  if (typeof text === 'string') {
    let cleaned = text.trim();
    
    // Check if it looks like an array: ["Something"] or ['Something']
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
      try {
        // Try parsing valid JSON ["..."]
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).join('\n\n');
        }
      } catch (e) {
        // Fallback for Python-style ['...'] or malformed JSON
        // Remove the outer brackets
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        
        // Remove leading/trailing quotes if they exist
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || 
            (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
          cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        
        // Unescape internal quotes if necessary (basic cleanup)
        return cleaned.replace(/\\'/g, "'").replace(/\\"/g, '"');
      }
    }
    return cleaned;
  }
  
  return String(text);
};
