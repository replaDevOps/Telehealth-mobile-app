import {
  parseAgentCount,
  hasNoAgentsAvailable,
} from '../resolveAgentAvailability';

describe('parseAgentCount', () => {
  it('reads the count out of an availability message', () => {
    expect(parseAgentCount('2 customer support agents are available')).toBe(2);
    expect(parseAgentCount('1 customer support agent is available')).toBe(1);
    expect(parseAgentCount('0 customer support agents are available')).toBe(0);
  });

  it('still understands the older "doctor" wording', () => {
    expect(parseAgentCount('2 doctors are available for this consultation')).toBe(2);
    expect(parseAgentCount('0 doctors are available')).toBe(0);
  });

  it('is case insensitive', () => {
    expect(parseAgentCount('3 Customer Support Agents Are Available')).toBe(3);
  });

  it('returns null when there is no count to read', () => {
    expect(parseAgentCount(undefined)).toBeNull();
    expect(parseAgentCount(null)).toBeNull();
    expect(parseAgentCount('')).toBeNull();
    expect(parseAgentCount('agents are available')).toBeNull();
  });
});

describe('hasNoAgentsAvailable', () => {
  it('blocks connecting only when the count is genuinely zero', () => {
    expect(hasNoAgentsAvailable('0 customer support agents are available')).toBe(true);
    expect(hasNoAgentsAvailable('0 doctors are available')).toBe(true);
  });

  // Regression: the check used to ask whether the message contained the
  // substring '0 customer support agent', which is equally true of "10
  // customer support agents". Any count ending in zero disabled the
  // "Connect With Customer Support" button, so tapping it did nothing.
  it('treats counts ending in zero as available', () => {
    expect(hasNoAgentsAvailable('10 customer support agents are available')).toBe(false);
    expect(hasNoAgentsAvailable('20 customer support agents are available')).toBe(false);
    expect(hasNoAgentsAvailable('100 customer support agents are available')).toBe(false);
    expect(hasNoAgentsAvailable('30 doctors are available')).toBe(false);
  });

  it('allows connecting for ordinary non-zero counts', () => {
    expect(hasNoAgentsAvailable('1 customer support agent is available')).toBe(false);
    expect(hasNoAgentsAvailable('7 customer support agents are available')).toBe(false);
  });

  it('falls back to the nested doctors message', () => {
    expect(hasNoAgentsAvailable(undefined, '0 customer support agents are available')).toBe(true);
    expect(hasNoAgentsAvailable(undefined, '4 customer support agents are available')).toBe(false);
  });

  it('prefers the top-level message over the nested one', () => {
    expect(hasNoAgentsAvailable('5 customer support agents are available', '0 agents')).toBe(false);
  });

  // An unreadable message must not strand the user: letting the request through
  // surfaces a real server error, while guessing "none available" leaves a
  // permanently disabled button and no way to retry.
  it('assumes agents are available when the message cannot be read', () => {
    expect(hasNoAgentsAvailable(undefined, undefined)).toBe(false);
    expect(hasNoAgentsAvailable('Agents are standing by')).toBe(false);
  });
});
