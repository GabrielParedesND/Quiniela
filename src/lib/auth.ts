import { NextRequest } from "next/server";

/**
 * Get the authenticated user ID from the request.
 * Checks multiple sources in order:
 * 1. x-user-id header (sent by frontend with Cognito userId)
 * 2. userId query parameter (for GET requests)
 * 3. userId in request body (for POST/PATCH requests - must be parsed separately)
 * 
 * The frontend is responsible for sending the userId from the Cognito session.
 */
export function getAuthenticatedUserId(request: NextRequest): string | null {
  // 1. Check x-user-id header (primary method)
  const headerUserId = request.headers.get("x-user-id");
  if (headerUserId) return headerUserId;

  // 2. Check query parameter (for GET requests)
  const queryUserId = request.nextUrl.searchParams.get("userId");
  if (queryUserId) return queryUserId;

  return null;
}
