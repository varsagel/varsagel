
const PHONE_REGEX = /(?:(?:\+?90|0)?\s*[5]\d{2}[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2})|(?:\d[\s-]*){10,}/;

const BAD_WORDS = [
  "amk", "aq", "sik", "yarrak", "oç", "orospu", "piç", "siktir", "göt", "meme",
  "amcık", "yavşak", "kahpe", "ibne", "gavat", "kaltak", "sürtük"
];

export function validateContent(text: string): { isValid: boolean; error?: string } {
  if (!text) return { isValid: true };

  // Phone number check
  if (PHONE_REGEX.test(text)) {
    return { isValid: false, error: "Telefon numarası paylaşımı güvenlik nedeniyle yasaktır." };
  }

  // Bad words check
  const lowerText = text.toLowerCase();
  for (const word of BAD_WORDS) {
    // Simple check: word boundaries or direct inclusion
    // Using regex for word boundaries to avoid false positives (e.g., "sikke" contains "sik" but is valid)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText) || BAD_WORDS.some(w => lowerText.includes(w) && w.length > 4)) {
       // Fallback simple include for longer bad words, strict regex for short ones
       if (regex.test(lowerText)) {
         return { isValid: false, error: "İçeriğiniz uygunsuz ifadeler içeriyor." };
       }
    }
  }
  
  // Extra check for specific short bad words that might be caught loosely
  const strictBadWords = ["amk", "aq", "oç", "piç"];
  for (const word of strictBadWords) {
      if (lowerText.split(/\s+/).includes(word)) {
          return { isValid: false, error: "İçeriğiniz uygunsuz ifadeler içeriyor." };
      }
  }

  return { isValid: true };
}
