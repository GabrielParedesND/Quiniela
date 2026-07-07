/**
 * OAuth configuration for Cognito social login (Google, Facebook).
 * Uses the Authorization Code flow with PKCE (public client, no secret).
 */

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://auth.nuestrodiario.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3001/auth/callback';

export type SocialProvider = 'Google' | 'Facebook';

/**
 * Generate the Cognito OAuth2 authorize URL for a given social provider.
 * This redirects the user to Cognito, which then redirects to the provider.
 */
export function getSocialLoginUrl(provider: SocialProvider): string {
  const params = new URLSearchParams({
    identity_provider: provider,
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: REDIRECT_URI,
  });

  return `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 * Called from the callback page after Cognito redirects back.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
  });

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Parse the ID token payload (JWT) to extract user info.
 * Note: This does NOT verify the signature — use only for display purposes.
 * Server-side verification should be done separately if needed.
 */
export function parseIdToken(idToken: string): {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  identities?: Array<{ providerName: string; userId: string }>;
} {
  const payload = idToken.split('.')[1];
  const decoded = atob(payload);
  return JSON.parse(decoded);
}

/**
 * Store OAuth tokens in localStorage (matching the format amazon-cognito-identity-js uses).
 * This allows the existing auth system to recognize the session.
 */
export function storeOAuthSession(
  idToken: string,
  accessToken: string,
  refreshToken?: string
): void {
  const payload = parseIdToken(idToken);
  const userId = payload.sub;
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID || '';
  const clientId = CLIENT_ID;

  // Store in the format that amazon-cognito-identity-js expects
  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  localStorage.setItem(`${keyPrefix}.LastAuthUser`, userId);
  localStorage.setItem(`${keyPrefix}.${userId}.idToken`, idToken);
  localStorage.setItem(`${keyPrefix}.${userId}.accessToken`, accessToken);
  if (refreshToken) {
    localStorage.setItem(`${keyPrefix}.${userId}.refreshToken`, refreshToken);
  }

  // Also store the clockDrift key (required by the SDK)
  localStorage.setItem(`${keyPrefix}.${userId}.clockDrift`, '0');
}
