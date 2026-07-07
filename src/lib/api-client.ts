'use client';

import { getUserId } from '@/lib/auth/cognito';

/**
 * Authenticated fetch wrapper that automatically includes the x-user-id header.
 * Use this for all API calls that require authentication.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const userId = await getUserId();

  const headers = new Headers(options.headers);
  if (userId) {
    headers.set('x-user-id', userId);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
