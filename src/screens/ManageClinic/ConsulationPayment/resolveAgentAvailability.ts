/**
 * Reads how many support agents the findDoctors API reported as available.
 *
 * The count only ever arrives as free text on the response message, e.g.
 * "10 customer support agents are available for this consultation", so it has
 * to be parsed back out. Returns null when the message carries no count.
 */
export function parseAgentCount(message?: unknown): number | null {
  if (message === null || message === undefined) {
    return null;
  }

  const match = String(message)
    .toLowerCase()
    .match(/(\d+)\s+(?:customer support agents?|agents?|doctors?)\b/);

  return match ? Number(match[1]) : null;
}

/**
 * Whether the connect button should be blocked because nobody is available.
 *
 * Prefers the top-level message and falls back to the nested one from the
 * findDoctors payload. A message with no readable count is treated as
 * available: attempting the booking surfaces a real server error, whereas
 * assuming "none" leaves a permanently disabled button and no way to retry.
 */
export function hasNoAgentsAvailable(
  message?: unknown,
  fallbackMessage?: unknown,
): boolean {
  const count = parseAgentCount(message) ?? parseAgentCount(fallbackMessage);
  return count === 0;
}
