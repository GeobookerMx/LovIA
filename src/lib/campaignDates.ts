/** Calendar dates are evaluated in Mexico City, including in native builds. */
export function mexicoCityDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

export function isFreeAccessPeriod(date: Date = new Date()): boolean {
  return mexicoCityDate(date) <= '2027-01-31'
}

export function isHalloweenCampaign(date: Date = new Date()): boolean {
  const day = mexicoCityDate(date)
  return day >= '2026-10-19' && day <= '2026-11-01'
}

export const FREE_ACCESS_END_LABEL = '31 de enero de 2027'
