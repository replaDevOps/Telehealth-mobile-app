import { parseStoredLanguage } from '../language';

describe('parseStoredLanguage', () => {
  it('reads a bare value, as ProfileSetting writes it', () => {
    expect(parseStoredLanguage('ar')).toBe('ar');
    expect(parseStoredLanguage('en')).toBe('en');
  });

  it('reads a JSON-quoted value, as storeData writes it', () => {
    // LanguageScreen persists through storeData, which JSON.stringifies. Both
    // shapes are already on devices, so both have to keep working.
    expect(parseStoredLanguage('"ar"')).toBe('ar');
    expect(parseStoredLanguage('"en"')).toBe('en');
  });

  it('tolerates stray whitespace and casing', () => {
    expect(parseStoredLanguage('  ar  ')).toBe('ar');
    expect(parseStoredLanguage('"AR"')).toBe('ar');
  });

  it('reports no choice when nothing is stored', () => {
    expect(parseStoredLanguage(null)).toBeNull();
    expect(parseStoredLanguage(undefined)).toBeNull();
    expect(parseStoredLanguage('')).toBeNull();
  });

  it('rejects unsupported or corrupt values instead of passing them on', () => {
    // changeLanguage would silently fall back to English for these, which is
    // indistinguishable from the bug being fixed.
    expect(parseStoredLanguage('fr')).toBeNull();
    expect(parseStoredLanguage('{"lang":"ar"}')).toBeNull();
    expect(parseStoredLanguage('undefined')).toBeNull();
    expect(parseStoredLanguage('null')).toBeNull();
  });
});
