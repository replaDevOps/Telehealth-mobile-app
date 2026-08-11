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
 * Converts a city name from English to Arabic
 */
export const translateCityToArabic = (cityName: string | null | undefined): string => {
  if (!cityName) return '';
  const trimmed = cityName.trim();
  const lower = trimmed.toLowerCase();

  const englishToArabicMap: { [key: string]: string } = {
    'riyadh': 'الرياض',
    'jeddah': 'جدة',
    'makkah': 'مكة المكرمة',
    'mecca': 'مكة المكرمة',
    'madinah': 'المدينة المنورة',
    'medina': 'المدينة المنورة',
    'dammam': 'الدمام',
    'khobar': 'الخبر',
    'al khobar': 'الخبر',
    'taif': 'الطائف',
    'buraydah': 'بريدة',
    'tabuk': 'تبوك',
    'khamis mushait': 'خميس مشيط',
    'hail': 'حائل',
    'najran': 'نجران',
    'jazan': 'جازان',
    'yanbu': 'ينبع',
    'abha': 'أبها',
    'sakaka': 'سكاكا',
  };

  return englishToArabicMap[lower] || trimmed;
};

/**
 * Returns localized city name according to app language (Arabic / English)
 */
export const localizeCityName = (cityName: string | null | undefined, isArabic: boolean): string => {
  if (!cityName) return '';
  if (isArabic) {
    return translateCityToArabic(cityName);
  }
  return translateCityToEnglish(cityName);
};

/**
 * Utility function to pass through clinic metadata (name, specialty/category, address).
 * Dynamic data from the backend is returned as-is.
 */
export const localizeClinicText = (
  text: string | null | undefined,
  _isArabic?: boolean
): string => {
  if (!text) return '';
  return text;
};

