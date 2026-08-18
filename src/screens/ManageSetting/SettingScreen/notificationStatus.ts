/**
 * Whether push notifications are on, from whatever the profile endpoint sent.
 *
 * `notificationStatus` is typed `string | boolean | null` because the API has
 * returned all of them. A plain `!!` is wrong: the string "0" and the string
 * "false" are both truthy in JS, so a user who had switched notifications off
 * would see the toggle come back on.
 */
export const isNotificationOn = (raw: unknown): boolean => {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;
  if (typeof raw === 'string') {
    const value = raw.trim().toLowerCase();
    return value !== '' && value !== '0' && value !== 'false' && value !== 'null';
  }
  return false;
};
