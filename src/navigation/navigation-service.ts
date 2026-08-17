import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from './types';

/**
 * Imperative navigation, callable from anywhere — event handlers, stores, the
 * API client, push handlers.
 *
 * Deliberately a leaf module: it pulls in no screen and no navigator. Screens
 * import these helpers, and root-navigation.tsx imports the screens, so
 * defining them alongside the navigator would close a require cycle. (Two
 * bottom sheets already dodge that cycle with an inline
 * `require('@navigation/root-navigation')`; new code should import from here
 * instead.) root-navigation.tsx re-exports everything below, so existing
 * import paths keep working.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Sends the user to the marketplace with nothing underneath: the tab navigator
// remounts at its initialRouteName ("Home"), and any stale Auth or Main route
// is dropped. Used on log out and account deletion — there is no account left
// to return to, but browsing stays open, so Home beats a sign-in wall.
export function resetToHome() {
  if (!navigationRef.isReady()) return;

  navigationRef.reset({
    index: 0,
    routes: [{ name: 'Main', params: { screen: 'EntryPoint' } }],
  });
}

// Leaves the Auth stack once a session exists.
//
// Auth is a sibling of Main in the root stack, so whenever the user opened it
// from inside the app — a gated action, the History/Setting tabs, a guest
// tapping Sign In — Main is still mounted below with all of its state. Popping
// the Auth route lands them on the exact screen they left rather than a fresh
// copy of Home, and re-focusing that screen re-runs the effects keyed on the
// auth token, so a guest placeholder fills itself in.
//
// The one path with no Main below is a cold start into
// Splash -> LanguageSelection -> Onboarding -> SignIn. There is nothing to
// return to there, so build the marketplace instead.
export function returnFromAuth() {
  if (!navigationRef.isReady()) return;

  const rootState = navigationRef.getRootState();
  const beneath =
    rootState.index > 0 ? rootState.routes[rootState.index - 1] : undefined;

  if (beneath?.name !== 'Main') {
    resetToHome();
    return;
  }

  // Target the root explicitly: an untargeted pop would be handled by the
  // focused navigator (the Auth stack) and merely step back one screen inside
  // it, leaving the user still signed in but still in Auth.
  navigationRef.dispatch({
    ...StackActions.pop(1),
    target: rootState.key,
  });
}

// Navigates to ProfileSetting inside the Setting tab without creating confusing
// back-stack behavior, by targeting the nested navigators:
// Main -> EntryPoint (tabs) -> Setting -> ProfileSetting
export function navigateToProfileSetting() {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate('Main' as any, {
    screen: 'EntryPoint',
    params: {
      screen: 'Setting',
      params: {
        initial: false,
        screen: 'ProfileSetting',
      },
    },
  } as any);
}
