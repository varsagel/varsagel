
const PHONE_REGEX = /(?:(?:\+?90|0)?\s*[5]\d{2}[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2})|(?:\d[\s-]*){10,}/;

const STRONG_PROFANITY = [
  "amk",
  "amq",
  "aq",
  "amcik",
  "amcuk",
  "sik",
  "sikis",
  "sikmek",
  "sikeyim",
  "sikerim",
  "siker",
  "siktir",
  "yarrak",
  "yarak",
  "orospu",
  "orospucocugu",
  "pic",
  "ibne",
  "yavsak",
  "gavat",
  "kaltak",
  "kancik",
  "surtuk",
  "pezevenk",
  "pust",
  "kahpe",
  "oc",
  "got",
  "bok",
  "serefsiz",
  "haysiyetsiz",
  "namussuz",
  "puşt",
  "orospuçocuğu",
];

const MILD_PROFANITY = [
  "aptal",
  "salak",
  "gerizekali",
  "gerizekalı",
  "mal",
  "dangalak",
  "dangala",
  "beyinsiz",
  "ahmak",
  "budala",
  "kaba",
];

const normalizeForFilter = (value: string) => {
  let s = String(value || "").toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s
    .replace(/[ıİ]/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
  s = s
    .replace(/[0]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[8]/g, "b")
    .replace(/[9]/g, "g");
  s = s.replace(/[^a-z]+/g, "");
  return s;
};

const normalizeTokens = (value: string) => {
  let s = String(value || "").toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s
    .replace(/[ıİ]/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
  s = s
    .replace(/[0]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[8]/g, "b")
    .replace(/[9]/g, "g");
  s = s.replace(/[^a-z]+/g, " ").trim();
  return s ? s.split(/\s+/g) : [];
};

const NUMBER_WORDS = [
  "sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz",
  "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan",
  "yüz", "bin", "milyon", "milyar"
];

const NUMBER_WORD_REGEX = new RegExp(`\\b(?:${NUMBER_WORDS.join("|")})\\b`, "i");
const PRICE_KEYWORDS = /(?:fiyat|ücret|bedel|tutar|pazarlık|tl|t\.?\s*l\.?|lira|₺|try)/i;
const PHONE_KEYWORDS = /(?:telefon|tel|gsm|whatsapp|wp|numara|no|iletişim|ara(?:y?n|yin)?|ulaş(?:ın)?)/i;
const COMPLAINT_KEYWORDS = /(?:şikayet|şikâyet|cimer|tüketici\s*hak|savcılık|karakol)/i;

export function validateContent(
  text: string,
  options?: { blockPhone?: boolean; blockPrice?: boolean; blockComplaint?: boolean }
): { isValid: boolean; error?: string } {
  if (!text) return { isValid: true };
  const { blockPhone = true, blockPrice = false, blockComplaint = false } = options || {};
  const lowerText = text.toLowerCase();
  const hasDigit = /\d/.test(text);
  const hasNumberWord = NUMBER_WORD_REGEX.test(lowerText);

  if (blockPhone && (PHONE_REGEX.test(text) || (PHONE_KEYWORDS.test(lowerText) && (hasDigit || hasNumberWord)))) {
    return { isValid: false, error: "Telefon numarası paylaşımı güvenlik nedeniyle yasaktır." };
  }

  if (blockPrice && PRICE_KEYWORDS.test(lowerText) && (hasDigit || hasNumberWord)) {
    return { isValid: false, error: "Fiyat veya ücret paylaşımı güvenlik nedeniyle yasaktır." };
  }

  if (blockComplaint && COMPLAINT_KEYWORDS.test(lowerText)) {
    return { isValid: false, error: "Şikayet/tehdit içerikli mesajlara izin verilmez." };
  }

  const normalized = normalizeForFilter(lowerText);
  const normalizedCollapsed = normalized.replace(/([a-z])\1+/g, "$1");
  const tokens = normalizeTokens(lowerText);

  const hasStrong = STRONG_PROFANITY.some(
    (w) =>
      normalized.includes(normalizeForFilter(w)) ||
      normalizedCollapsed.includes(normalizeForFilter(w))
  );
  if (hasStrong) {
    return { isValid: false, error: "İçeriğiniz uygunsuz ifadeler içeriyor." };
  }

  const mildSet = new Set(MILD_PROFANITY.map((w) => normalizeForFilter(w)));
  if (tokens.some((t) => mildSet.has(normalizeForFilter(t)))) {
    return { isValid: false, error: "İçeriğiniz uygunsuz ifadeler içeriyor." };
  }

  return { isValid: true };
}
