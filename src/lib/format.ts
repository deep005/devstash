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

/**
 * Formats a Date (or ISO date string) as a short "Mon D" label (e.g. "Jul 8").
 * Uses UTC so output is deterministic across server/client and timezones.
 */
export function formatShortDate(value: Date | string): string {
  const date = new Date(value);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
