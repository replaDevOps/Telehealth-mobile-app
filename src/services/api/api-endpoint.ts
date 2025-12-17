export const API = {
  AUTH: {
    // LOGIN
    LOGIN_EMAIL: '/patient-auth/login-email',
    LOGIN_PHONE: '/patient-auth/login-phone',
    // EMAIL OTP
    SEND_OTP_EMAIL: '/patient-auth/send-otp-email',
    RESEND_OTP_EMAIL: '/patient-auth/resendEmailOpt',
    // PHONE OTP
    SEND_OTP_PHONE: '/patient-auth/sendPhoneOtp',
    RESEND_OTP_PHONE: '/patient-auth/resendMobileOpt',
    // VERIFY OTP
    VERIFY_OTP: '/patient-auth/verifyOtp',
    // CREATE PASSWORD
    CREATE_PASSWORD: '/patient-auth/createPassword',
    // REGISTER
    REGISTER: '/patient-auth/register',
    // REFRESH TOKEN
    REFRESH_TOKEN: '/patient-auth/refreshToken',
    // FORGOT PASSWORD BY EMAIL
    FORGOT_PASSWORD_EMAIL: '/patient-auth/forgotPasswordByEmail',
    // FORGOT PASSWORD BY PHONE
    FORGOT_PASSWORD_PHONE: '/patient-auth/forgotPasswordByPhone',
    // VERIFY OTP PASSWORD
    VERIFY_OTP_PASSWORD: '/patient-auth/verifyOtpPassword',
    // RESET PASSWORD
    RESET_PASSWORD: '/patient-auth/resetPassword',
    LOGOUT: '/patient-auth/logout',
  },
  SETTINGS: {
    VIEW_PROFILE: '/patient-setting/viewProfile',
    UPDATE_PROFILE_IMAGE: '/patient-setting/updateProfileImage',
    UPDATE_PROFILE: '/patient-setting/updateProfile',
    CHANGE_PASSWORD: '/patient-setting/changePassword',
    DELETE_USER_ACCOUNT: '/patient-setting/deleteUserAccount',
    FAQs: '/patient-setting/faqs',
  },
};
