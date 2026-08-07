export const API = {
  AUTH: {
    // LOGIN
    LOGIN_EMAIL: '/patient-auth/login-email',
    LOGIN_PHONE: '/patient-auth/login-phone',
    // EMAIL OTP
    SEND_OTP_EMAIL: '/patient-auth/send-otp-email',
    RESEND_OTP_EMAIL: '/patient-auth/resendEmailOpt',
    // CHECK PHONE NUMBER REGISTRATION STATUS
    CHECK_PHONE_NO: '/patient-auth/checkPhoneNo',
    // PHONE OTP
    SEND_OTP_PHONE: '/patient-auth/send-otp-phoneNo',
    RESEND_OTP_PHONE: '/patient-auth/resendMobileOpt',
    // VERIFY OTP (same endpoint for email and phone)
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
    // RESEND FORGOT PASSWORD OTP
    RESEND_FORGOT_PASSWORD_EMAIL: '/patient-auth/resendForgotPasswordByEmail',
    RESEND_FORGOT_PASSWORD_PHONE: '/patient-auth/resendForgotPasswordByPhone',
    // VERIFY OTP PASSWORD
    VERIFY_OTP_PASSWORD: '/patient-auth/verifyOtpPassword',
    // RESET PASSWORD
    RESET_PASSWORD: '/patient-auth/resetPassword',
    // SKIP (complete profile later)
    SKIP: '/patient-auth/skip',
    LOGOUT: '/patient-auth/logout',
    // GOOGLE LOGIN / REGISTER
    LOGIN_GOOGLE: '/patient-auth/login-with-google',
  },
  SETTINGS: {
    VIEW_PROFILE: '/patient-setting/viewProfile',
    STORE_FCM_TOKEN: '/patient-setting/storeFcmToken',
    UPDATE_PROFILE_IMAGE: '/patient-setting/updateProfileImage',
    UPDATE_PROFILE: '/patient-setting/updateProfile',
    CHANGE_PASSWORD: '/patient-setting/changePassword',
    DELETE_USER_ACCOUNT: '/patient-setting/deleteUserAccount',
    FAQs: '/patient-setting/faqs',
    LOYALTY_POINTS_DESCRIPTION: '/patient-setting/loyaltyPointsDescription', // GET /loyaltyPointsDescription
    LOYALTY_POINTS: '/patient-setting/loyaltyPoints', // GET /loyaltyPoints
    LOYALTY_POINTS_EARNED: '/patient-setting/loyaltyPointsEarn', // GET /loyaltyPointsEarn?clinicID={id}
    LOYALTY_POINTS_USED: '/patient-setting/loyaltyPointsUsed', // GET /loyaltyPointsUsed?clinicID={id}
    TIER_PROGRESS: '/patient-setting/tierProgress', // GET /tierProgress?clinicID={id}
    CLAIM_REWARD: '/patient-setting/claimReward', // POST /claimReward
    RESET_TIERS: '/patient-setting/resetTiers', // GET /resetTiers?clinicID={id}
  },
  CLINIC: {
    GET_CLINICS: '/patient-common/get-clinics',
    GET_CLINIC_TYPES: '/patient-common/clinicTypes',
    GET_GROUPS: '/patient-common/groups',
    GET_SERVICES: '/patient-common/services',
    GET_CLINIC_DETAILS: '/patient-common/clinidDetials',
    GET_CLINIC_DESCRIPTION: '/patient-common/clinicDescription',
    GET_CLINIC_SERVICES: '/patient-common/clinicServices',
    GET_CLINIC_REVIEWS: '/patient-common/clinicReviews',
    GET_DEVICE_DETAILS: '/patient-common/deviceDetails',
    GET_SERVICES_GROUPS: '/patient-common/servicesGroups',
    GET_SERVICES_FILTER: '/patient-common/servicesFilter',
    GET_SERVICE_DETAILS: '/patient-common/serviceDetails',
    PRIVACY_POLICY: '/patient-common/privacy',
    TERMS_CONDITIONS: '/patient-common/terms',
  },
  CART: {
    ADD_TO_CART: '/cart/add',
    VIEW_CART_DETAILS: '/cart/viewCartDetails',
    REMOVE_FROM_CART: '/cart/remove', // DELETE /cart/remove/{cartID}
  },
  CHECKOUT: {
    CHECKOUT: '/checkout/checkout',
  },
  CONSULTATIONS: {
    GET_SERVICE_TYPES: '/patient-consultations/serviceTypes',
    GET_GROUPS: '/patient-consultations/groups',
    GET_SERVICES: '/patient-consultations/services',
    GET_CONSULTATION_TYPES: '/patient-consultations/consultationsTypes',
    FIND_DOCTORS: '/patient-consultations/findDoctors',
    CHECK_PROFILE: '/patient-consultations/checkProfile',
    BOOK_CONSULTATION: '/patient-consultations/bookConsultations',
    GET_CONSULTATION_MESSAGES: '/patient-consultations/consultationsMessages', // GET /consultationsMessages/{consultationID}
    SEND_MESSAGE: '/patient-consultations/sendMessage',
    DELETE_MESSAGE: '/patient-consultations/deleteMessage', // DELETE /deleteMessage/{messageID}
    DOWNLOAD_PRESCRIPTION: '/patient-consultations/downloadPrescription', // GET /downloadPrescription?consultationID={id}
    DOWNLOAD_INVOICE: '/patient-consultations/download-invoice', // GET /download-invoice?consultationID={id}&lat={lat}&long={long}
    REFUND_CONSULTATION: '/patient-consultations/refundConsultations', // POST /refundConsultations
    END_CONSULTATION: '/webrtc/consultation-end', // POST - End any type of consultation (chat/audio/video)
  },
  NOTIFICATIONS: {
    VIEW_ALL: '/patient-notifications/viewAll',
    DELETE: '/patient-notifications/delete',
    CLEAR_ALL: '/patient-notifications/clearAll',
    READ_ALL: '/patient-notifications/readAll',
  },
  HISTORY: {
    GET_CONSULTATIONS: '/history/consultations', // GET /consultations?name=
    GET_CONSULTATION_MESSAGES: '/history/consultationsMessages', // GET /consultationsMessages/{id}
    GET_PRESCRIPTION: '/history/viewPrescreptions', // GET /viewPrescreptions/{id}
    GET_CONSULTATION_PAYMENTS: '/history/consultationPayment', // GET /consultationPayment?name=
    GET_APPOINTMENT_PAYMENTS: '/history/appointmentPayments', // GET /appointmentPayments?name=
    GET_CONSULTATION_PAYMENT_DETAILS: '/history/consultationPaymentDetails', // GET /consultationPaymentDetails/{id}
    GET_APPOINTMENT_DETAILS: '/history/appointmentDetails', // GET /appointmentDetails/{id}
    RATE_CLINIC: '/history/rateClinic', // POST /rateClinic
    REFUND_POLICY: '/history/refundPolicy', // GET /refundPolicy
  },
  REFUND: {
    GET_REFUND_APPOINTMENTS: '/patient-setting/refundAppointments', // GET /refundAppointments?name=
    GET_REFUND_APPOINTMENT_DETAILS: '/patient-setting/refundAppointmentDetails', // GET /refundAppointmentDetails/{id}?lat={lat}&long={long}
    SEND_REFUND_REQUEST: '/history/sendRefundRequests', // POST /sendRefundRequests
  },
};
