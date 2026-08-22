/**
 * Login ID and Password Auto-Generator Utility
 * Format: OI + (First 2 letters of First Name + First 2 letters of Last Name) + (Year of Joining) + (4-digit Serial Number)
 * Example: John Doe (2022, Serial 1) -> OIJODO20220001
 */

export function generateLoginId(
  firstName: string,
  lastName: string,
  joinYear: number = new Date().getFullYear(),
  serialNumber: number = 1
): string {
  const companyPrefix = 'OI'; // Odoo India
  const fn2 = (firstName || 'XX').trim().padEnd(2, 'X').substring(0, 2).toUpperCase();
  const ln2 = (lastName || 'YY').trim().padEnd(2, 'X').substring(0, 2).toUpperCase();
  const yearStr = String(joinYear);
  const serialStr = String(serialNumber).padStart(4, '0');

  return `${companyPrefix}${fn2}${ln2}${yearStr}${serialStr}`;
}

export function generateTemporaryPassword(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `Dayflow@${randomDigits}`;
}
