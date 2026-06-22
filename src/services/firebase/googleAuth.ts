import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';

// MUST be the WEB client (client_type 3) from google-services.json.
// Using the Android (type 1) or iOS (type 2) client here causes DEVELOPER_ERROR.
const WEB_CLIENT_ID =
  '827261290955-i12opd83asbqhsvqjdoj9q98p4slpcjo.apps.googleusercontent.com';

let isConfigured = false;

export const configureGoogleSignin = () => {
  if (isConfigured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  isConfigured = true;
};

export type GoogleSignInResult = {
  /** idToken issued by Google for the signed-in account */
  googleIdToken: string | null;
  /** OAuth2 access token issued by Google */
  accessToken: string | null;
  /** Firebase idToken after exchanging the Google credential */
  idToken: string | null;
  user: ReturnType<typeof getAuth>['currentUser'];
};

export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  configureGoogleSignin();

  // Ensure Google Play Services are available (Android no-op on iOS)
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Trigger the native Google account picker
  const response = await GoogleSignin.signIn();

  // google-signin v13+ wraps payload in { type, data }; older returns flat
  const googleIdToken =
    (response as any)?.data?.idToken ?? (response as any)?.idToken ?? null;

  if (!googleIdToken) {
    throw new Error('Google Sign-In Failed!');
  }

  // Get the OAuth2 access token (needed for backend verification)
  const tokens = await GoogleSignin.getTokens();
  const accessToken = tokens?.accessToken ?? null;

  // Exchange the Google idToken for a Firebase credential
  const credential = GoogleAuthProvider.credential(googleIdToken);
  const userCredential = await signInWithCredential(getAuth(), credential);
  const firebaseIdToken = (await userCredential.user.getIdToken()) ?? null;

  return {
    googleIdToken,
    accessToken,
    idToken: firebaseIdToken,
    user: userCredential.user,
  };
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore – user may not be signed in with Google
  }
  await getAuth().signOut();
};

export { statusCodes as googleStatusCodes };
