import appleAuth, {
  AppleError,
  AppleRequestOperation,
  AppleRequestScope,
} from '@invertase/react-native-apple-authentication';
import {
  getAuth,
  AppleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';

export type AppleSignInResult = {
  /** Apple's identity token (a short-lived JWT) - what a backend verifies. */
  identityToken: string;
  /**
   * The raw nonce. Apple was sent its SHA-256 hash; Firebase must be given this
   * unhashed value or it rejects the credential with MissingOrInvalidNonce.
   */
  nonce: string;
  /** One-time code, needed only for server-side token revocation. */
  authorizationCode: string | null;
  /** Apple returns name/email ONLY on a user's first ever sign-in to this app. */
  fullName: string | null;
  email: string | null;
  /** Firebase idToken after exchanging the Apple credential. */
  idToken: string | null;
  user: ReturnType<typeof getAuth>['currentUser'];
};

/** False below iOS 13, so callers can hide the button rather than fail on tap. */
export const isAppleSignInSupported = (): boolean => appleAuth.isSupported;

export const signInWithApple = async (): Promise<AppleSignInResult> => {
  if (!appleAuth.isSupported) {
    throw new Error('Sign in with Apple requires iOS 13 or newer');
  }

  // We deliberately do not generate a nonce here. The native module creates one,
  // sends Apple only its SHA-256 hash, and hands back the raw value below.
  const response = await appleAuth.performRequest({
    requestedOperation: AppleRequestOperation.LOGIN,
    requestedScopes: [AppleRequestScope.FULL_NAME, AppleRequestScope.EMAIL],
  });

  const { identityToken, nonce, authorizationCode, email, fullName } = response;

  if (!identityToken) {
    throw new Error('Apple Sign-In Failed!');
  }

  const credential = AppleAuthProvider.credential(identityToken, nonce);
  const userCredential = await signInWithCredential(getAuth(), credential);
  const firebaseIdToken = (await userCredential.user.getIdToken()) ?? null;

  // Apple splits the name; the rest of the app expects a single display string.
  const name = [fullName?.givenName, fullName?.familyName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    identityToken,
    nonce,
    authorizationCode: authorizationCode ?? null,
    fullName: name || null,
    email: email ?? null,
    idToken: firebaseIdToken,
    user: userCredential.user,
  };
};

export const signOutApple = async () => {
  // Apple has no client-side session to revoke - clearing Firebase is enough.
  await getAuth().signOut();
};

export { AppleError as appleErrorCodes };
