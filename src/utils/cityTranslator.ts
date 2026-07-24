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
