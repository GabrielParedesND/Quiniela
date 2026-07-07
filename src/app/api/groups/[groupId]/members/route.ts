import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { listMembers } from "@/lib/services/membership-service";
import { paginationSchema } from "@/lib/validations/groups";
import { docClient, GetCommand } from "@/lib/dynamodb";

const USERS_TABLE = process.env.DYNAMO_USERS_TABLE!;

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
 * Fetch user profile from UsersTable to get display name and avatar.
 */
async function getUserProfile(userId: string): Promise<{ displayName: string; avatarUrl?: string }> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    );
    if (result.Item) {
      const nombres = result.Item.nombres || '';
      const apellidos = result.Item.apellidos || '';
      const fullName = `${nombres} ${apellidos}`.trim();
      return {
        displayName: fullName || result.Item.email || userId.substring(0, 8),
        avatarUrl: result.Item.avatar || undefined,
      };
    }
  } catch {
    // Silently fail — return fallback
  }
  return { displayName: userId.substring(0, 8) };
}

/**
 * GET /api/groups/[groupId]/members - List group members with pagination (member only)
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

    const result = await listMembers(groupId, userId, parsed.data);

    // Enrich members with display names from UsersTable
    const enrichedData = await Promise.all(
      result.data.map(async (member) => {
        const profile = await getUserProfile(member.userId);
        return {
          ...member,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        };
      })
    );

    return NextResponse.json({
      data: enrichedData,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
