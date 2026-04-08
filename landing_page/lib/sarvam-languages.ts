/**
 * Sarvam AI Translate — Supported Languages
 * Model: sarvam-translate:v1
 * Supports all 22 scheduled languages of India + English
 */

export interface SarvamLanguage {
  code: string          // internal code used in our app (e.g. "hi")
  sarvamCode: string    // Sarvam API language code (e.g. "hi-IN")
  name: string          // English name
  native: string        // Native script name
  script: string        // Script name
}

export const SARVAM_LANGUAGES: SarvamLanguage[] = [
  { code: "en", sarvamCode: "en-IN", name: "English", native: "English", script: "Latin" },
  { code: "kn", sarvamCode: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada" },
  { code: "hi", sarvamCode: "hi-IN", name: "Hindi", native: "हिन्दी", script: "Devanagari" },
  { code: "bn", sarvamCode: "bn-IN", name: "Bengali", native: "বাংলা", script: "Bengali" },
  { code: "ta", sarvamCode: "ta-IN", name: "Tamil", native: "தமிழ்", script: "Tamil" },
  { code: "te", sarvamCode: "te-IN", name: "Telugu", native: "తెలుగు", script: "Telugu" },
  { code: "ml", sarvamCode: "ml-IN", name: "Malayalam", native: "മലയാളം", script: "Malayalam" },
  { code: "mr", sarvamCode: "mr-IN", name: "Marathi", native: "मराठी", script: "Devanagari" },
  { code: "gu", sarvamCode: "gu-IN", name: "Gujarati", native: "ગુજરાતી", script: "Gujarati" },
  { code: "pa", sarvamCode: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi" },
  { code: "od", sarvamCode: "od-IN", name: "Odia", native: "ଓଡ଼ିଆ", script: "Odia" },
  { code: "as", sarvamCode: "as-IN", name: "Assamese", native: "অসমীয়া", script: "Bengali" },
  { code: "ur", sarvamCode: "ur-IN", name: "Urdu", native: "اردو", script: "Nastaliq" },
  { code: "mai", sarvamCode: "mai-IN", name: "Maithili", native: "मैथिली", script: "Devanagari" },
  { code: "sa", sarvamCode: "sa-IN", name: "Sanskrit", native: "संस्कृतम्", script: "Devanagari" },
  { code: "ks", sarvamCode: "ks-IN", name: "Kashmiri", native: "كٲشُر", script: "Nastaliq" },
  { code: "ne", sarvamCode: "ne-IN", name: "Nepali", native: "नेपाली", script: "Devanagari" },
  { code: "sd", sarvamCode: "sd-IN", name: "Sindhi", native: "سنڌي", script: "Arabic" },
  { code: "kok", sarvamCode: "kok-IN", name: "Konkani", native: "कोंकणी", script: "Devanagari" },
  { code: "doi", sarvamCode: "doi-IN", name: "Dogri", native: "डोगरी", script: "Devanagari" },
  { code: "mni", sarvamCode: "mni-IN", name: "Manipuri", native: "মৈতৈলোন্", script: "Bengali" },
  { code: "brx", sarvamCode: "brx-IN", name: "Bodo", native: "बड़ो", script: "Devanagari" },
  { code: "sat", sarvamCode: "sat-IN", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Ol Chiki" },
]

/** Map from our internal code → SarvamLanguage */
export const LANGUAGE_MAP = new Map(
  SARVAM_LANGUAGES.map((l) => [l.code, l])
)

/** Get the Sarvam API code for a given internal language code */
export function getSarvamCode(code: string): string {
  return LANGUAGE_MAP.get(code)?.sarvamCode || "en-IN"
}

/** Get native name for an internal language code */
export function getNativeName(code: string): string {
  return LANGUAGE_MAP.get(code)?.native || code
}

/** All language codes */
export const ALL_LANGUAGE_CODES = SARVAM_LANGUAGES.map((l) => l.code)
