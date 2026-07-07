import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { changeRole, removeMember } from "@/lib/services/membership-service";
import { changeRoleSchema } from "@/lib/validations/groups";

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
 * PATCH /api/groups/[groupId]/members/[userId] - Change member role (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
) {
  const actorUserId = getAuthenticatedUserId(request);
  if (!actorUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId, userId: targetUserId } = await params;
    const body = await request.json();
    const parsed = changeRoleSchema.safeParse({ ...body, targetUserId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await changeRole(groupId, actorUserId, targetUserId, parsed.data.newRole);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/groups/[groupId]/members/[userId] - Remove member (owner or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
) {
  const actorUserId = getAuthenticatedUserId(request);
  if (!actorUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId, userId: targetUserId } = await params;
    await removeMember(groupId, actorUserId, targetUserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
