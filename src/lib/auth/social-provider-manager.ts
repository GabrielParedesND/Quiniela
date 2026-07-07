import type { AuthConfig } from "@/lib/data/auth-config";

export interface SocialProviderConfig {
  google: boolean;
  facebook: boolean;
}

const ALL_HIDDEN: SocialProviderConfig = { google: false, facebook: false };

/**
 * Fetches auth config via the API route (works from client components).
 */
async function fetchAuthConfig(projectId: string): Promise<AuthConfig | null> {
  try {
    const res = await fetch(`/api/auth-config?projectId=${encodeURIComponent(projectId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

/**
 * Determines which social login providers should be displayed.
 *
 * - If domain validation is enabled → all providers hidden (incompatible)
 * - If Auth_Config exists → returns provider flags from config
 * - If Auth_Config not found → all providers hidden (conservative default)
 * - If fetch error → all providers hidden (conservative default)
 */
export async function getSocialProviderConfig(
  projectId: string
): Promise<SocialProviderConfig> {
  const config = await fetchAuthConfig(projectId);

  // Config not found or error → hide all providers
  if (!config) {
    return ALL_HIDDEN;
  }

  // Domain validation active → social providers incompatible
  if (config.domainValidationEnabled) {
    return ALL_HIDDEN;
  }

  return {
    google: config.socialProviders.google,
    facebook: config.socialProviders.facebook,
  };
}
