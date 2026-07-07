import { isEmailAuthorized, ValidationResult } from "@/lib/auth/access-validation";
import type { AuthConfig } from "@/lib/data/auth-config";

/**
 * Fetches auth config via the API route (works from client components).
 */
async function fetchAuthConfig(projectId: string): Promise<{ data: AuthConfig | null; error?: string }> {
  try {
    const res = await fetch(`/api/auth-config?projectId=${encodeURIComponent(projectId)}`);
    if (!res.ok) {
      return { data: null, error: 'Error al obtener la configuración' };
    }
    const json = await res.json();
    return { data: json.data || null };
  } catch {
    return { data: null, error: 'Error de red' };
  }
}

/**
 * Validates whether a user is allowed to log in based on the project's auth config.
 *
 * - Fetches Auth_Config for the project via API route
 * - If config not found → allow (default open)
 * - If fetch error → allow without restrictions (default open per requirement 5.6)
 * - Otherwise delegates to isEmailAuthorized for domain/whitelist validation
 */
export async function validateLogin(
  email: string,
  projectId: string
): Promise<ValidationResult> {
  const { data, error } = await fetchAuthConfig(projectId);

  // On fetch error → allow login (default open)
  if (error) {
    return { allowed: true };
  }

  // Config not found → allow (default open)
  // isEmailAuthorized handles null/undefined config as allowed
  return isEmailAuthorized(email, data);
}
