import { isNotificationOn } from '../notificationStatus';

describe('isNotificationOn', () => {
  it('passes booleans through', () => {
    expect(isNotificationOn(true)).toBe(true);
    expect(isNotificationOn(false)).toBe(false);
  });

  it('reads numeric flags', () => {
    expect(isNotificationOn(1)).toBe(true);
    expect(isNotificationOn(0)).toBe(false);
  });

  it('reads the string forms the API actually sends', () => {
    expect(isNotificationOn('1')).toBe(true);
    expect(isNotificationOn('true')).toBe(true);
    // The reason this helper exists: both of these are truthy strings in JS,
    // so `!!raw` would switch notifications back on for a user who turned
    // them off.
    expect(isNotificationOn('0')).toBe(false);
    expect(isNotificationOn('false')).toBe(false);
    expect(isNotificationOn('FALSE')).toBe(false);
  });

  it('treats a missing value as off', () => {
    expect(isNotificationOn(null)).toBe(false);
    expect(isNotificationOn(undefined)).toBe(false);
    expect(isNotificationOn('')).toBe(false);
    expect(isNotificationOn('   ')).toBe(false);
    expect(isNotificationOn('null')).toBe(false);
  });
});
