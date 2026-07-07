import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { joinGroup } from "@/lib/services/membership-service";
import { joinGroupSchema } from "@/lib/validations/groups";

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
 * POST /api/groups/join - Join a group with an invite code
 */
export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = joinGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await joinGroup(userId, parsed.data.inviteCode);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
