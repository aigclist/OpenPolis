export const siteName = "OpenPolis";

const defaultSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.OPENPOLIS_APP_URL;

  if (!configuredUrl) {
    return new URL(defaultSiteUrl);
  }

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(defaultSiteUrl);
  }
}
