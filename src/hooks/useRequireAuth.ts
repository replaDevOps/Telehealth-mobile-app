import { useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// Imported from the module rather than the @store barrel: the barrel also
// pulls in the location store, and with it the geolocation native module.
import useAuthStore from '@store/useAuthStore';

/**
 * Every unauthenticated dead end in the app leads to the same place: the real
 * Sign In screen. No alerts, no toasts, no per-surface placeholder wording —
 * a guest who hits a wall always sees the same screen, whether the wall was a
 * button (useRequireAuth) or a whole screen (useSignInGateOnFocus).
 */
const openSignIn = (navigation: any) => {
  // Root-level navigate: the Auth stack is a sibling of Main, so this works
  // from anywhere inside the tabs, and Main stays mounted underneath so
  // returnFromAuth can drop the user back where they were.
  navigation.navigate('Auth', { screen: 'SignIn' });
};

/**
 * Gate for the actions a guest cannot perform: adding to the cart, checking
 * out, and contacting a clinic. Everything else in the marketplace stays open.
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   if (!requireAuth()) return;   // sign-in opened, caller stops here
 *
 * Returns true when the user is signed in, so the caller may proceed. Returns
 * false after sending them to sign in.
 */
export const useRequireAuth = () => {
  const navigation = useNavigation<any>();
  // The absence of a token is the whole test: it covers both a guest who never
  // signed in and a session that expired underneath the user.
  const token = useAuthStore(state => state.auth?.token);

  return useCallback((): boolean => {
    if (token) {
      return true;
    }

    openSignIn(navigation);
    return false;
  }, [token, navigation]);
};

/**
 * Decides what a focus event on a fully-gated screen should do.
 *
 * Split out from the hook because the re-arm rule is the part that can trap a
 * user, and it is worth testing directly. Backing out of the Sign In screen
 * re-focuses the screen that opened it; without suppressing that one focus,
 * it opens Sign In again and the user can never return to where they were.
 */
export function nextGateState({
  signedOut,
  suppressed,
}: {
  signedOut: boolean;
  suppressed: boolean;
}): { open: boolean; suppressed: boolean } {
  // Signed in: nothing to gate, and re-arm for a future sign-out.
  if (!signedOut) return { open: false, suppressed: false };
  // This is the focus caused by backing out. Let it through, and re-arm so
  // that leaving and coming back prompts again.
  if (suppressed) return { open: false, suppressed: false };
  return { open: true, suppressed: true };
}

/**
 * Gate for screens that are nothing but authenticated content — Cart, History,
 * Settings, Notifications. Opening one as a guest goes straight to Sign In.
 *
 * Usage (at the top of the screen component):
 *   useSignInGateOnFocus();
 *
 * The screen still renders <SignInPrompt /> for the signed-out case: that is
 * what the user lands back on if they decline, and it stays put because the
 * returning focus is suppressed.
 */
export const useSignInGateOnFocus = () => {
  // Auto-redirection on focus is disabled so guest users see <SignInPrompt /> first
  // and only navigate to Sign In when pressing the "Sign In" button.
};
