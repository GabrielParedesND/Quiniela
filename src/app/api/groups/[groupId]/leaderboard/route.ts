import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getLeaderboard } from "@/lib/services/leaderboard-service";
import { paginationSchema } from "@/lib/validations/groups";

const ERROR_STATUS_MAP: Record<string, number> = {
  GROUP_NOT_FOUND: 404,
  ALREADY_MEMBER: 409,
  GROUP_FULL: 409,
  GROUP_CLOSED: 409,
  INVALID_INVITE_CODE: 400,
  INVITE_CODE_EXPIRED: 400,
  USER_BANNED: 403,
  INSUFFICIENT_PERMISSIONS: 403,
  CANNOT_REMOVE_OWNER: 403,
  CANNOT_REMOVE_ADMIN: 403,
  MUST_TRANSFER_OWNERSHIP: 409,
  MAX_GROUPS_REACHED: 409,
  RATE_LIMIT_EXCEEDED: 429,
};

/**
 * GET /api/groups/[groupId]/leaderboard - Get group leaderboard with pagination (member only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get("tournamentId");

    // If no tournamentId provided, return empty leaderboard
    // (group may not have an active tournament yet)
    if (!tournamentId) {
      return NextResponse.json({
        data: [],
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false },
      });
    }

    const paginationInput = {
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    };

    const parsed = paginationSchema.safeParse(paginationInput);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await getLeaderboard(groupId, tournamentId, userId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
