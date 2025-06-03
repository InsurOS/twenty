const ALLOWED_ADMIN_DOMAIN = 'insuros.ca';

export const isInsurOSAdminAccount = (email: string) =>
  email.includes(ALLOWED_ADMIN_DOMAIN) && !email.includes('demo');
