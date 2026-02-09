/**
 * Format an ISO date string to the user's local date (device timezone).
 * Uses the app's locale so the date appears in the format expected where the app is used.
 */
export function formatDateLocal(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format an ISO date-time string to a readable date and time (e.g. "15 January 2024, 2:30 pm").
 * Uses separate date and time formatting so the time displays correctly across devices.
 */
export function formatDateTimeLocal(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const datePart = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format an ISO date-time string as "MM/DD/YYYY hh:mm am/pm" (e.g. "10/02/2025 11:05 am").
 */
export function formatDateWithTimeShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const datePart = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  } catch {
    return dateStr;
  }
}

/**
 * Capitalize only the first letter of each word; rest lowercase.
 * e.g. "DERMATOLOGY" -> "Dermatology", "SKIN CARE" -> "Skin Care"
 */
export function capitalizeWords(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
