export const ADMIN_ACCOUNTS = ['jordan@insuros.ca', 'ronnie@insuros.ca'];

export const isInsurOSAdminAccount = (email: string) =>
  ADMIN_ACCOUNTS.includes(email);
