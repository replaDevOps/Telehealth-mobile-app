import i18n from '../services/i18n';

/**
 * Maps raw backend/API error messages or fallback keys to localized strings
 * based on the current app language (Arabic/English).
 */
export const getMappedErrorMessage = (rawMsg: any): string => {
  const t = i18n.t.bind(i18n);

  if (!rawMsg) return t('something_went_wrong');

  let msgStr = '';
  if (typeof rawMsg === 'string') {
    msgStr = rawMsg;
  } else if (typeof rawMsg === 'object') {
    msgStr = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
  } else {
    msgStr = String(rawMsg);
  }

  if (!msgStr || msgStr === '{}') return t('something_went_wrong');

  const msgLower = msgStr.toLowerCase();

  // Login / sign-in success mapping
  if (
    msgLower.includes('login success') ||
    msgLower.includes('login successful') ||
    msgLower.includes('logged in') ||
    msgLower.includes('signin success') ||
    msgLower.includes('sign in success') ||
    msgLower === 'success'
  ) {
    return t('login_successful');
  }

  // Invalid email / phone / credentials mapping
  if (
    msgLower.includes('invalid email/phone number') ||
    msgLower.includes('invalid email') ||
    msgLower.includes('invalid phone') ||
    msgLower.includes('invalid credentials') ||
    msgLower.includes('incorrect password') ||
    msgLower.includes('user not found') ||
    msgLower.includes('invalid login') ||
    msgLower.includes('wrong password') ||
    msgLower.includes('unauthorized') ||
    msgLower.includes('401')
  ) {
    return t('invalid_email_or_phone_or_password');
  }

  if (
    msgLower.includes('already registered') ||
    msgLower.includes('already_registered') ||
    msgLower.includes('already exist')
  ) {
    return t('already_registered');
  }

  if (
    msgLower.includes('not registered') ||
    msgLower.includes('not_registered') ||
    msgLower.includes('user not found') ||
    msgLower.includes('account not found')
  ) {
    return t('phone_not_registered');
  }

  // Rate limiting / Throttling / 429 / Please try again after...
  if (
    msgLower.includes('please try again after') ||
    msgLower.includes('too many requests') ||
    msgLower.includes('rate limit') ||
    msgLower.includes('429') ||
    msgLower.includes('try again later')
  ) {
    return t('too_many_requests');
  }

  if (msgLower.includes('otp') && (msgLower.includes('invalid') || msgLower.includes('expired'))) {
    return t('invalid_otp');
  }

  if (msgLower.includes('token') && msgLower.includes('invalid')) {
    return t('invalid_token');
  }

  // Try direct translation lookup
  const translated = t(msgStr);
  if (translated !== msgStr) return translated;

  return msgStr;
};
