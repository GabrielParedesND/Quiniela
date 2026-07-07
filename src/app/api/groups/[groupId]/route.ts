import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getGroup, updateGroup, deleteGroup } from "@/lib/services/group-service";
import { getMemberRole } from "@/lib/services/authorization-service";
import { updateGroupSchema } from "@/lib/validations/groups";

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
 * GET /api/groups/[groupId] - Get group detail (member only)
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

    // Verify user is a member of the group
    const role = await getMemberRole(groupId, userId);
    if (!role) {
      return NextResponse.json({ error: "GROUP_NOT_FOUND" }, { status: 404 });
    }

    const group = await getGroup(groupId);
    if (!group) {
      return NextResponse.json({ error: "GROUP_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      group,
      membership: { role, status: "active" },
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/groups/[groupId] - Update group (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId } = await params;
    const body = await request.json();
    const parsed = updateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedGroup = await updateGroup(groupId, userId, parsed.data);
    return NextResponse.json({ data: updatedGroup });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/groups/[groupId] - Soft delete group (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId } = await params;
    await deleteGroup(groupId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      const status = ERROR_STATUS_MAP[error.message] || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
