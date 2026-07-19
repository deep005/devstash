/**
 * Absolute base URL for the app, used to build links that must work outside
 * the browser (e.g. verification links in emails). Falls back to localhost for
 * local development. Set AUTH_URL to the deployed origin in production.
 */
export function getBaseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}
