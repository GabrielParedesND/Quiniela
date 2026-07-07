import { AuthConfig } from "@/lib/data/auth-config";

export interface ValidationResult {
  allowed: boolean;
  message?: string;
}

/**
 * Evaluates whether an email is authorized based on the project's auth config.
 *
 * Logic:
 * 1. No config → allowed (default open)
 * 2. Domain validation disabled → allowed
 * 3. Email in whitelist (case-insensitive) → allowed
 * 4. Email domain in allowed domains (case-insensitive) → allowed
 * 5. No match → rejected with message in Spanish
 */
export function isEmailAuthorized(
  email: string,
  config: AuthConfig | null | undefined
): ValidationResult {
  // 1. No config exists → default open
  if (!config) {
    return { allowed: true };
  }

  // 2. Domain validation disabled → allow all
  if (!config.domainValidationEnabled) {
    return { allowed: true };
  }

  const normalizedEmail = email.toLowerCase();
  const emailDomain = normalizedEmail.split("@")[1];

  // 3. Check email whitelist (case-insensitive)
  if (
    config.emailWhitelist.some(
      (whitelisted) => whitelisted.toLowerCase() === normalizedEmail
    )
  ) {
    return { allowed: true };
  }

  // 4. Check domain list (case-insensitive)
  if (
    emailDomain &&
    config.allowedDomains.some(
      (domain) => domain.toLowerCase() === emailDomain
    )
  ) {
    return { allowed: true };
  }

  // 5. No match → reject
  return {
    allowed: false,
    message:
      "Tu correo no está autorizado. Contacta al administrador para obtener acceso.",
  };
}
