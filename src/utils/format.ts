/**
 * Helpers for French formatting of dates, times and currency
 */

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatFrenchDateLong(dateStr?: string | Date): string {
  const date = dateStr ? (typeof dateStr === 'string' ? new Date(dateStr) : dateStr) : new Date();
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatFrenchDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatFrenchDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} à ${hours}:${minutes}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD (local time)
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time + offsetMinutes formatted as HH:mm
 */
export function getDefaultTime(offsetMinutes = 15): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + offsetMinutes);
  // Round to nearest 5 minutes for clean chauffeur schedule
  const rem = now.getMinutes() % 5;
  if (rem !== 0) {
    now.setMinutes(now.getMinutes() + (5 - rem));
  }
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Generates an initial or next bon number in RV-YYYYMMDD-XXXX format
 */
export function generateBonNumber(dateStr: string, existingCountToday: number): string {
  const cleanDate = (dateStr || getTodayString()).replace(/-/g, '');
  const seq = String(existingCountToday + 1).padStart(4, '0');
  return `RV-${cleanDate}-${seq}`;
}
