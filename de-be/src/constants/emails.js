const emailTypes = {
  // Registration
  ADVERTISER_SIGN_UP_TO_ADVERTISER: 'ADVERTISER_SIGN_UP_TO_ADVERTISER',
  PUBLISHER_SIGN_UP_TO_PUBLISHER: 'PUBLISHER_SIGN_UP_TO_PUBLISHER',
  CLIENT_SIGN_UP_TO_ADMIN: 'CLIENT_SIGN_UP_TO_ADMIN',
  ADVERTISER_SIGN_UP_ACTIVATED_TO_ADVERTISER: 'ADVERTISER_SIGN_UP_ACTIVATED_TO_ADVERTISER',
  PUBLISHER_SIGN_UP_ACTIVATED_TO_PUBLISHER: 'PUBLISHER_SIGN_UP_ACTIVATED_TO_PUBLISHER',
  PUBLISHER_ACCOUNT_VERIFIED_TO_PUBLISHER: 'PUBLISHER_ACCOUNT_VERIFIED_TO_PUBLISHER',
  // Forgot password
  RESTORE_PASSWORD: 'RESTORE_PASSWORD',
};

const templates = {
  ADVERTISER_SIGN_UP_TO_ADVERTISER: '/assets/emails/advertiser-sign-up-to-advertiser.ejs',
  PUBLISHER_SIGN_UP_TO_PUBLISHER: '/assets/emails/publisher-sign-up-to-publisher.ejs',
  PUBLISHER_ACCOUNT_VERIFIED_TO_PUBLISHER: '/assets/emails/publisher-account-verified-to-publisher.ejs',
  ADVERTISER_SIGN_UP_ACTIVATED_TO_ADVERTISER: '/assets/emails/advertiser-account-confirmed.ejs',
  PUBLISHER_SIGN_UP_ACTIVATED_TO_PUBLISHER: '/assets/emails/publisher-account-confirmed.ejs',
  CLIENT_SIGN_UP_TO_ADMIN: '/assets/emails/client-sign-up-to-admin.ejs',
  RESTORE_PASSWORD: '/assets/emails/restore-password.ejs',
};

export {emailTypes, templates};
