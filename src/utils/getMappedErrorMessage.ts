import i18n from '../services/i18n';

/**
 * Maps raw backend/API error messages, fallback keys, or English toast text to localized strings
 * based on the current app language (Arabic/English).
 */
export const getMappedErrorMessage = (rawMsg: any): string => {
  const t = i18n.t.bind(i18n);

  if (!rawMsg) return t('something_went_wrong');

  let msgStr = '';
  if (typeof rawMsg === 'string') {
    msgStr = rawMsg;
  } else if (typeof rawMsg === 'object') {
    msgStr = rawMsg.message || rawMsg.error || rawMsg.msg || JSON.stringify(rawMsg);
  } else {
    msgStr = String(rawMsg);
  }

  if (!msgStr || msgStr === '{}' || msgStr === '[object Object]') {
    return t('something_went_wrong');
  }

  // 1. Direct translation key lookup
  if (i18n.exists(msgStr)) {
    return t(msgStr);
  }

  // 2. Cleaned key lookup (strip trailing punctuation and whitespace)
  const trimmed = msgStr.trim().replace(/[.!]+$/, '');
  if (i18n.exists(trimmed)) {
    return t(trimmed);
  }

  // 3. Snake_case key transformation (e.g. "OTP sent successfully" -> "otp_sent_successfully")
  const snakeKey = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (snakeKey && i18n.exists(snakeKey)) {
    return t(snakeKey);
  }

  const msgLower = msgStr.toLowerCase();

  // 4. Detailed Pattern Matching for Auth & OTP Toasts
  if (
    msgLower.includes('email sent') ||
    msgLower.includes('email_sent')
  ) {
    return t('email_sent_successfully');
  }

  if (
    msgLower.includes('otp sent') ||
    msgLower.includes('otp_sent') ||
    msgLower.includes('code sent') ||
    msgLower.includes('otp has been sent')
  ) {
    return t('otp_sent_successfully');
  }

  if (
    msgLower.includes('new code sent') ||
    msgLower.includes('code resent') ||
    msgLower.includes('resent code') ||
    msgLower.includes('resend_code')
  ) {
    return t('new_code_sent_successfully');
  }

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
    msgLower.includes('account not found')
  ) {
    return t('phone_not_registered');
  }

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

  if (msgLower.includes('at least 8 characters') || msgLower.includes('password must be at least')) {
    return t('password_rule_msg');
  }

  if (msgLower.includes('different from old password') || msgLower.includes('must be different')) {
    return t('new_password_must_be_different');
  }

  const safeTranslate = (key: string, fallback: string): string => {
    if (i18n.exists(key)) {
      return t(key);
    }
    return fallback;
  };

  // 5. Pattern Matching for Operations & Feature Toasts
  if (msgLower.includes('password') && (msgLower.includes('changed') || msgLower.includes('updated') || msgLower.includes('reset') || msgLower.includes('success'))) {
    return safeTranslate('password_changed_successfully', i18n.language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
  }

  if (msgLower.includes('profile image') || msgLower.includes('avatar')) {
    if (msgLower.includes('updated') || msgLower.includes('success')) {
      return safeTranslate('profile_image_updated_successfully', i18n.language === 'ar' ? 'تم تحديث صورة الملف الشخصي بنجاح' : 'Profile image updated successfully');
    }
  }

  if (msgLower.includes('profile') && (msgLower.includes('updated') || msgLower.includes('saved'))) {
    return safeTranslate('profile_updated_successfully', i18n.language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
  }

  if (msgLower.includes('prescription') && msgLower.includes('saved')) {
    return safeTranslate('prescription_saved_successfully', i18n.language === 'ar' ? 'تم حفظ الوصفة الطبية بنجاح' : 'Prescription saved successfully');
  }

  if (msgLower.includes('account') && (msgLower.includes('delete') || msgLower.includes('deleted'))) {
    return safeTranslate('account_permanently_deleted', i18n.language === 'ar' ? 'تم حذف حسابك نهائيًا.' : 'Your account has been permanently deleted.');
  }

  if (msgLower.includes('notification') && msgLower.includes('deleted')) {
    return safeTranslate('notification_deleted', i18n.language === 'ar' ? 'تم حذف الإشعار' : 'Notification deleted');
  }

  if (msgLower.includes('message') && msgLower.includes('deleted')) {
    return safeTranslate('message_deleted', i18n.language === 'ar' ? 'تم حذف الرسالة' : 'Message deleted');
  }

  if (msgLower.includes('review') && msgLower.includes('submitted')) {
    return safeTranslate('review_submitted_successfully', i18n.language === 'ar' ? 'تم تقديم التقييم بنجاح' : 'Review submitted successfully');
  }

  if (msgLower.includes('refund') && msgLower.includes('initiated')) {
    return safeTranslate('refund_initiated', i18n.language === 'ar' ? 'تم بدء استرداد الأموال' : 'Refund has been initiated');
  }

  if (msgLower.includes('refund') && msgLower.includes('failed')) {
    return safeTranslate('refund_failed', i18n.language === 'ar' ? 'فشل إرسال طلب الاسترداد' : 'Failed to initiate refund');
  }

  if (msgLower.includes('insufficient') && msgLower.includes('coin')) {
    return safeTranslate('insufficient_coins', i18n.language === 'ar' ? 'ليس لديك نقاط كافية' : 'Insufficient coins');
  }

  if (
    msgLower.includes('cart') &&
    (msgLower.includes('remove') || msgLower.includes('removed') || msgLower.includes('delete') || msgLower.includes('deleted') || msgLower.includes('clear') || msgLower.includes('cleared'))
  ) {
    return safeTranslate('service_removed_from_cart', i18n.language === 'ar' ? 'تم إزالة الخدمة من السلة بنجاح' : 'Service removed from cart successfully');
  }

  if (msgLower.includes('cart') && (msgLower.includes('add') || msgLower.includes('added'))) {
    return safeTranslate('service_added_to_cart', i18n.language === 'ar' ? 'تمت إضافة الخدمة إلى السلة بنجاح' : 'Service added to cart successfully');
  }

  if (msgLower.includes('multiple clinic') || msgLower.includes('multiple clinics')) {
    return safeTranslate('cannot_add_services_from_multiple_clinics', i18n.language === 'ar' ? 'لا يمكنك إضافة خدمات من عيادات متعددة في نفس الوقت!' : 'You cannot add services from multiple clinics at the same time!');
  }

  if (msgLower.includes('only card payment')) {
    return safeTranslate('only_card_payment_available', i18n.language === 'ar' ? 'يتوفر الدفع بالبطاقة فقط في الوقت الحالي' : 'Only card payment is available at the moment');
  }

  // 6. Hardcoded English -> Arabic Fallback Dictionary
  const englishToArabicMap: Record<string, string> = {
    "you cannot add services from multiple clinics at the same time!": "cannot_add_services_from_multiple_clinics",
    "you cannot add services from multiple clinics at the same time.": "cannot_add_services_from_multiple_clinics",
    "you cannot add services from multiple clinics at the same time": "cannot_add_services_from_multiple_clinics",
    "service removed from the cart successfully.": "service_removed_from_cart",
    "service removed from the cart successfully": "service_removed_from_cart",
    "service removed from cart successfully": "service_removed_from_cart",
    "item removed from cart": "service_removed_from_cart",
    "item removed from cart successfully": "service_removed_from_cart",
    "service added to cart successfully": "service_added_to_cart",
    "password_changed_successfully": "password_changed_successfully",
    "password_updated_successfully": "password_updated_successfully",
    "password changed successfully": "password_changed_successfully",
    "password changed successfully.": "password_changed_successfully",
    "password reset successfully": "password_changed_successfully",
    "password reset successfully.": "password_changed_successfully",
    "email sent successfully!": "email_sent_successfully",
    "email sent successfully.": "email_sent_successfully",
    "email sent successfully": "email_sent_successfully",
    "otp sent successfully.": "otp_sent_successfully",
    "otp sent successfully": "otp_sent_successfully",
    "new code sent successfully": "new_code_sent_successfully",
    "login successful": "login_successful",
    "invalid otp": "invalid_otp",
    "invalid or expired otp": "invalid_otp",
    "something went wrong": "something_went_wrong",
    "something went wrong. please try again.": "something_went_wrong",
    "phone number is already registered": "phone_already_registered",
    "this phone number is already registered.": "phone_already_registered",
    "this phone number is not registered.": "phone_not_registered",
    "too many requests. please try again later.": "too_many_requests",
    "please enter a valid otp": "please_enter_valid_otp",
    "failed to upload image": "failed_to_upload_image",
    "failed to connect to call": "failed_to_connect_call",
    "failed to end consultation": "failed_to_end_consultation",
  };

  if (englishToArabicMap[msgLower]) {
    const key = englishToArabicMap[msgLower];
    if (i18n.exists(key)) return t(key);
  }

  // Direct i18n translation fallback
  const translated = t(msgStr);
  if (translated !== msgStr) return translated;

  return msgStr;
};
