import { NextRequest, NextResponse } from 'next/server';
import { getAuthConfig } from '@/lib/data/auth-config';

/**
 * GET /api/auth-config?projectId=xxx
 * Returns the auth config for a project (social providers, domain validation settings).
 * This API route is needed because DynamoDB calls require server-side env vars
 * that are not available in client components.
 */
export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId es requerido' },
      { status: 400 }
    );
  }

  const result = await getAuthConfig(projectId);

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  // Return the config (or null if not found)
  return NextResponse.json({ data: result.data || null });
}
