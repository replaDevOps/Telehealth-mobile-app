import {
  getAuth,
  signInWithPhoneNumber,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';

export type PhoneConfirmation = FirebaseAuthTypes.ConfirmationResult;

export const sendPhoneOtp = (phoneE164: string): Promise<PhoneConfirmation> => {
  return signInWithPhoneNumber(getAuth(), phoneE164);
};

export const confirmPhoneOtp = async (
  confirmation: PhoneConfirmation,
  code: string,
) => {
  const userCredential = await confirmation.confirm(code);
  const idToken = await userCredential?.user.getIdToken();
  return { user: userCredential?.user ?? null, idToken: idToken ?? null };
};

export const signOutFirebase = () => getAuth().signOut();
