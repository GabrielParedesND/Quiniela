import { getMembership } from "@/lib/data/memberships";
import type { GroupAction, MemberRole } from "@/types/groups";
import { GroupErrorCode } from "@/types/groups";

/**
 * Permission matrix defining which roles can perform which actions.
 * owner = all actions, admin = approve/reject/remove members + view, member = view/leave/share
 */
const PERMISSION_MATRIX: Record<GroupAction, MemberRole[]> = {
  edit_group: ["owner"],
  manage_roles: ["owner"],
  regenerate_code: ["owner", "admin"],
  approve_requests: ["owner", "admin"],
  remove_member: ["owner", "admin"],
  remove_admin: ["owner"],
  transfer_ownership: ["owner"],
  delete_group: ["owner"],
  view_leaderboard: ["owner", "admin", "member"],
  view_members: ["owner", "admin", "member"],
  leave_group: ["owner", "admin", "member"],
  share_code: ["owner", "admin", "member"],
};

/**
 * Role hierarchy for requireRole checks.
 * Higher number = higher privilege.
 */
const ROLE_HIERARCHY: Record<MemberRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

/**
 * Get the role of a user in a group.
 * Returns null if the user is not an active member of the group.
 */
export async function getMemberRole(
  groupId: string,
  userId: string
): Promise<MemberRole | null> {
  const membershipId = `${groupId}#${userId}`;
  const result = await getMembership(membershipId);

  if (result.error || !result.data) {
    return null;
  }

  // Only return the role if the membership is active
  if (result.data.status !== "active") {
    return null;
  }

  return result.data.role;
}

/**
 * Check if a user can perform a specific action in a group.
 * Returns false if the user is not an active member or lacks the required role.
 */
export async function canPerformAction(
  groupId: string,
  userId: string,
  action: GroupAction
): Promise<boolean> {
  const role = await getMemberRole(groupId, userId);

  if (!role) {
    return false;
  }

  const allowedRoles = PERMISSION_MATRIX[action];
  return allowedRoles.includes(role);
}

/**
 * Require that a user has at least the specified minimum role in a group.
 * Throws an error with INSUFFICIENT_PERMISSIONS if the user doesn't meet the requirement.
 */
export async function requireRole(
  groupId: string,
  userId: string,
  minimumRole: MemberRole
): Promise<void> {
  const role = await getMemberRole(groupId, userId);

  if (!role) {
    throw new Error(GroupErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error(GroupErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}
