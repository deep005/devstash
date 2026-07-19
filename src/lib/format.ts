const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Formats a Date (or ISO date string) as a short "Mon D" label (e.g. "Jul 8").
 * Uses UTC so output is deterministic across server/client and timezones.
 */
export function formatShortDate(value: Date | string): string {
  const date = new Date(value);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/**
 * Formats a Date (or ISO date string) as a full "Month D, YYYY" label
 * (e.g. "July 8, 2026"). UTC-based for deterministic server/client output.
 */
export function formatLongDate(value: Date | string): string {
  const date = new Date(value);
  return `${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
