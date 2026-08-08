/**
 * Utility function to convert Urdu city names to English
 * Common Saudi Arabian cities mapping
 */
const cityTranslationMap: { [key: string]: string } = {
  // Common Urdu/Arabic city names to English
  'مكة': 'Makkah',
  'مكة المكرمة': 'Makkah',
  'مكہ': 'Makkah',
  'مكہ مكرمہ': 'Makkah',
  'المدينة': 'Madinah',
  'المدينة المنورة': 'Madinah',
  'مدینہ': 'Madinah',
  'مدینہ منورہ': 'Madinah',
  'جدة': 'Jeddah',
  'جدہ': 'Jeddah',
  'الرياض': 'Riyadh',
  'رياض': 'Riyadh',
  'الدمام': 'Dammam',
  'دمام': 'Dammam',
  'الخبر': 'Khobar',
  'خبر': 'Khobar',
  'الطائف': 'Taif',
  'طائف': 'Taif',
  'بريدة': 'Buraydah',
  'بريده': 'Buraydah',
  'تبوك': 'Tabuk',
  'خميس مشيط': 'Khamis Mushait',
  'حائل': 'Hail',
  'نجران': 'Najran',
  'جازان': 'Jazan',
  'ينبع': 'Yanbu',
  'أبها': 'Abha',
  'سكاكا': 'Sakaka',
};

/**
 * Converts a city name from Urdu/Arabic to English
 * @param cityName - The city name in Urdu/Arabic
 * @returns The city name in English, or the original if no translation found
 */
export const translateCityToEnglish = (cityName: string | null | undefined): string => {
  if (!cityName) return '';
  
  const trimmedCity = cityName.trim();
  
  // Check if it's already in English (contains only English characters)
  const isEnglish = /^[a-zA-Z0-9\s,.-]+$/.test(trimmedCity);
  if (isEnglish) {
    return trimmedCity;
  }
  
  // Try to find translation
  const translation = cityTranslationMap[trimmedCity];
  if (translation) {
    return translation;
  }
  
  // If no translation found, return original (might be mixed or already English)
  return trimmedCity;
};

/**
 * Utility function to localize clinic metadata (name, specialty/category, address) when the UI is in Arabic.
 * Maps English fields returned by the API to natural Arabic copy.
 */
export const localizeClinicText = (
  text: string | null | undefined,
  isArabic: boolean
): string => {
  if (!text) return '';
  if (!isArabic) return text;

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct exact mappings for names, specialties, and addresses
  const exactMap: { [key: string]: string } = {
    'riyadh dental and dermatology clinic': 'عيادة الرياض لطب الأسنان والجلدية',
    'riyadh dental and dermatology': 'عيادة الرياض لطب الأسنان والجلدية',
    'dermatology': 'جلدية',
    'dentistry': 'أسنان',
    'dentist group': 'مجموعة الأسنان',
    'service 101': 'خدمة 101',
    'service 102': 'خدمة 102',
    'acne treatment': 'علاج حب الشباب',
    'microneedling facial prp': 'جلسة نيدلينج للوجه مع بلازما',
    'scar subcision': 'تقطير الندبات',
    'botox': 'بوتوكس',
    'both': 'جلدية / أسنان',
    'general': 'عام',
    'group': 'مجموعة',
    'riyadh': 'الرياض',
    'commercial market rd, b-block block b': 'طريق السوق التجاري، ب-بلوك بلوك ب',
    'location not available': 'الموقع غير متوفر',
  };

  if (exactMap[lower]) {
    return exactMap[lower];
  }

  // 2. Phrase/word mapping for partial values (like addresses or combined titles)
  let translated = trimmed;

  // Replace common city names
  translated = translated.replace(/\bRiyadh\b/gi, 'الرياض');
  translated = translated.replace(/\bJeddah\b/gi, 'جدة');
  translated = translated.replace(/\bMakkah\b/gi, 'مكة المكرمة');
  translated = translated.replace(/\bMadinah\b/gi, 'المدينة المنورة');
  translated = translated.replace(/\bDammam\b/gi, 'الدمام');
  translated = translated.replace(/\bKhobar\b/gi, 'الخبر');
  translated = translated.replace(/\bTaif\b/gi, 'الطائف');

  // Replace street/block address components
  translated = translated.replace(/\bCommercial Market Rd\b/gi, 'طريق السوق التجاري');
  translated = translated.replace(/\bB-Block\b/gi, 'ب-بلوك');
  translated = translated.replace(/\bBlock B\b/gi, 'بلوك ب');
  translated = translated.replace(/\bRoad\b/gi, 'طريق');
  translated = translated.replace(/\bStreet\b/gi, 'شارع');
  translated = translated.replace(/\bSt\b/gi, 'شارع');
  translated = translated.replace(/\bRd\b/gi, 'طريق');
  translated = translated.replace(/\bDistrict\b/gi, 'حي');
  translated = translated.replace(/\bCity\b/gi, 'مدينة');

  // Replace specialties and words in titles
  translated = translated.replace(/\bDental and Dermatology Clinic\b/gi, 'عيادة طب الأسنان والجلدية');
  translated = translated.replace(/\bDental and Dermatology\b/gi, 'عيادة الرياض لطب الأسنان والجلدية');
  translated = translated.replace(/\bDentist Group\b/gi, 'مجموعة الأسنان');
  translated = translated.replace(/\bService (\d+)\b/gi, 'خدمة $1');
  translated = translated.replace(/\bDental\b/gi, 'طب الأسنان');
  translated = translated.replace(/\bDermatology\b/gi, 'جلدية');
  translated = translated.replace(/\bDentistry\b/gi, 'أسنان');
  translated = translated.replace(/\bClinic\b/gi, 'عيادة');

  return translated;
};
