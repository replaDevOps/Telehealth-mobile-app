import { nextGateState } from '../useRequireAuth';

describe('nextGateState', () => {
  it('opens sign-in when a guest first focuses the screen', () => {
    expect(nextGateState({ signedOut: true, suppressed: false })).toEqual({
      open: true,
      suppressed: true,
    });
  });

  it('leaves the guest alone on the focus caused by backing out', () => {
    // This is the whole point of the rule: backing out of Sign In re-focuses
    // the screen that opened it. Re-opening here would trap the user, since
    // the only way off the screen is the way that puts them back on it.
    expect(nextGateState({ signedOut: true, suppressed: true })).toEqual({
      open: false,
      suppressed: false,
    });
  });

  it('re-arms, so leaving and coming back prompts again', () => {
    const afterDecline = nextGateState({ signedOut: true, suppressed: true });
    expect(
      nextGateState({ signedOut: true, suppressed: afterDecline.suppressed }),
    ).toEqual({ open: true, suppressed: true });
  });

  it('never opens sign-in for a signed-in user', () => {
    expect(nextGateState({ signedOut: false, suppressed: false })).toEqual({
      open: false,
      suppressed: false,
    });
  });

  it('re-arms on sign-in, so a later sign-out still prompts', () => {
    // Signing in from the prompt returns to the screen with suppressed still
    // set; that must not linger and swallow the prompt after a later logout.
    const afterSignIn = nextGateState({ signedOut: false, suppressed: true });
    expect(afterSignIn.suppressed).toBe(false);
    expect(
      nextGateState({ signedOut: true, suppressed: afterSignIn.suppressed }),
    ).toEqual({ open: true, suppressed: true });
  });

  it('completes the decline-then-sign-in round trip without trapping', () => {
    let suppressed = false;
    const opens: boolean[] = [];

    // Guest opens the screen -> prompted.
    let step = nextGateState({ signedOut: true, suppressed });
    opens.push(step.open);
    suppressed = step.suppressed;

    // Declines -> back on the screen, not prompted again.
    step = nextGateState({ signedOut: true, suppressed });
    opens.push(step.open);
    suppressed = step.suppressed;

    // Leaves and returns -> prompted again, and this time signs in.
    step = nextGateState({ signedOut: true, suppressed });
    opens.push(step.open);
    suppressed = step.suppressed;

    step = nextGateState({ signedOut: false, suppressed });
    opens.push(step.open);

    expect(opens).toEqual([true, false, true, false]);
  });
});
