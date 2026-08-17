import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export const APP_LANGUAGE_KEY = 'selectedLanguage';

export type AppLanguage = 'en' | 'ar';

const SUPPORTED: readonly AppLanguage[] = ['en', 'ar'];

/**
 * Reads a persisted language choice.
 *
 * Two writers disagreed on the format: `storeData` JSON-stringifies, so it
 * wrote `"ar"` with quotes, while ProfileSetting called setItem directly and
 * wrote a bare `ar`. Both shapes exist on devices already, so both are
 * accepted here rather than migrated. Anything else - a corrupt value, an
 * unsupported code - is treated as "no choice recorded", because handing
 * i18n.changeLanguage a bogus code silently falls back to English anyway.
 *
 * Pure so the parsing rules can be tested without touching storage.
 */
export function parseStoredLanguage(raw: string | null | undefined): AppLanguage | null {
  if (!raw) return null;

  const unquoted = raw.trim().replace(/^"|"$/g, '').trim().toLowerCase();
  return SUPPORTED.includes(unquoted as AppLanguage)
    ? (unquoted as AppLanguage)
    : null;
}

/**
 * Reduces whatever i18n reports to one of the two languages the app ships.
 * i18n.language can carry a region ("en-US", "ar-SA") depending on how it was
 * set, and only the base code is ever persisted.
 */
export function normalizeLanguage(lang: string | undefined | null): AppLanguage {
  const base = (lang ?? '').split(/[-_]/)[0].toLowerCase();
  return base === 'ar' ? 'ar' : 'en';
}

/**
 * Switches the app language and remembers it. The only supported way to
 * change language.
 *
 * Two of the four places that changed language used to call
 * i18n.changeLanguage directly and never persist, so choosing Arabic from
 * Settings or the header dropdown lasted exactly as long as the session.
 */
export async function setAppLanguage(lang: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(APP_LANGUAGE_KEY, lang);
  } catch (e) {
    // The language still changed for this session; only persistence failed.
    console.warn('[language] Failed to persist language choice', e);
  }
}

/**
 * Applies the stored language at startup. Returns the choice that was found,
 * or null when none was recorded - Splash uses that to decide whether the
 * user still needs to pick one.
 *
 * Deliberately does NOT fall back to changeLanguage('en'). i18n already
 * initialises to English, so forcing it here only created a path that could
 * overwrite a real choice.
 */
export async function restoreAppLanguage(): Promise<AppLanguage | null> {
  try {
    const stored = parseStoredLanguage(await AsyncStorage.getItem(APP_LANGUAGE_KEY));
    if (stored && stored !== i18n.language) {
      await i18n.changeLanguage(stored);
    }
    return stored;
  } catch (e) {
    console.warn('[language] Failed to restore language choice', e);
    return null;
  }
}
