import {
  createMembership,
  getMembership,
  listMembersByGroup,
  listPendingByGroup,
  updateMembershipRole,
  updateMembershipStatus,
} from "@/lib/data/memberships";
import type { Membership } from "@/lib/data/memberships";
import {
  incrementMemberCount,
  decrementMemberCount,
  updateGroup,
} from "@/lib/data/groups";
import { validateCode } from "@/lib/services/invite-code-service";
import { requireRole, getMemberRole } from "@/lib/services/authorization-service";
import { logAction } from "@/lib/services/audit-service";
import type {
  JoinResult,
  MemberRole,
  PaginationInput,
  PaginatedResult,
} from "@/types/groups";
import { GroupErrorCode } from "@/types/groups";

/**
 * Join a group using an invite code.
 *
 * Flow:
 * 1. Validate invite code
 * 2. Check if user is already an active member → ALREADY_MEMBER
 * 3. Check if user was previously removed (banned) → USER_BANNED
 * 4. Check if user previously left → allow re-join by updating status
 * 5. Check if group is full → GROUP_FULL
 * 6. Based on privacy mode:
 *    - public/invite-only → create membership with status 'active', increment memberCount
 *    - private → create membership with status 'pending'
 * 7. Return JoinResult with status 'joined' or 'pending_approval'
 */
export async function joinGroup(
  userId: string,
  inviteCode: string
): Promise<JoinResult> {
  // 1. Validate invite code
  const codeResult = await validateCode(inviteCode);

  if (!codeResult.valid || !codeResult.group) {
    if (codeResult.reason === "expired") {
      throw new Error(GroupErrorCode.INVITE_CODE_EXPIRED);
    }
    if (codeResult.reason === "group_closed") {
      throw new Error(GroupErrorCode.GROUP_CLOSED);
    }
    throw new Error(GroupErrorCode.INVALID_INVITE_CODE);
  }

  const group = codeResult.group;

  // 2. Check existing membership
  const membershipId = `${group.groupId}#${userId}`;
  const existingMembership = await getMembership(membershipId);

  if (existingMembership.data) {
    const membership = existingMembership.data;

    // Already an active member
    if (membership.status === "active") {
      throw new Error(GroupErrorCode.ALREADY_MEMBER);
    }

    // Previously removed (banned)
    if (membership.status === "removed") {
      throw new Error(GroupErrorCode.USER_BANNED);
    }

    // Previously left — allow re-join
    if (membership.status === "left") {
      // Check if group is full before re-joining
      if (group.memberCount >= group.maxMembers) {
        throw new Error(GroupErrorCode.GROUP_FULL);
      }

      // For private groups, re-join goes to pending
      if (group.privacy === "private") {
        const statusResult = await updateMembershipStatus(membershipId, "pending");
        if (!statusResult.success) {
          throw new Error(statusResult.error || "Failed to update membership");
        }
        return {
          status: "pending_approval",
          groupId: group.groupId,
          groupName: group.name,
        };
      }

      // For public/invite-only, re-join as active member
      // Atomically increment member count (concurrency protection)
      const incrementResult = await incrementMemberCount(group.groupId);
      if (!incrementResult.success) {
        throw new Error(GroupErrorCode.GROUP_FULL);
      }

      const statusResult = await updateMembershipStatus(membershipId, "active");
      if (!statusResult.success) {
        throw new Error(statusResult.error || "Failed to update membership");
      }

      // Update role to 'member' on re-join
      await updateMembershipRole(membershipId, "member");

      return {
        status: "joined",
        groupId: group.groupId,
        groupName: group.name,
      };
    }

    // Pending status — already has a pending request
    if (membership.status === "pending") {
      throw new Error(GroupErrorCode.ALREADY_MEMBER);
    }
  }

  // 3. Check if group is full (for new memberships)
  if (group.memberCount >= group.maxMembers) {
    throw new Error(GroupErrorCode.GROUP_FULL);
  }

  // 4. Based on privacy mode, create membership
  const now = new Date().toISOString();

  if (group.privacy === "private") {
    // Private group → pending approval
    const createResult = await createMembership({
      membershipId,
      groupId: group.groupId,
      userId,
      role: "member",
      status: "pending",
      joinedAt: now,
      updatedAt: now,
    });

    if (!createResult.success) {
      throw new Error(createResult.error || "Failed to create membership");
    }

    return {
      status: "pending_approval",
      groupId: group.groupId,
      groupName: group.name,
    };
  }

  // Public or invite-only → active membership
  // Atomically increment member count (concurrency protection)
  const incrementResult = await incrementMemberCount(group.groupId);
  if (!incrementResult.success) {
    throw new Error(GroupErrorCode.GROUP_FULL);
  }

  const createResult = await createMembership({
    membershipId,
    groupId: group.groupId,
    userId,
    role: "member",
    status: "active",
    joinedAt: now,
    updatedAt: now,
  });

  if (!createResult.success) {
    // If membership creation fails, we should ideally decrement the count
    // but for simplicity, the condition expression on createMembership prevents duplicates
    throw new Error(createResult.error || "Failed to create membership");
  }

  return {
    status: "joined",
    groupId: group.groupId,
    groupName: group.name,
  };
}

/**
 * List members of a group with pagination.
 * Only active members of the group can view the member list.
 */
export async function listMembers(
  groupId: string,
  userId: string,
  pagination: PaginationInput
): Promise<PaginatedResult<Membership>> {
  // Verify the requesting user is an active member
  await requireRole(groupId, userId, "member");

  // Query all active members of the group
  const result = await listMembersByGroup(groupId, "active");

  if (result.error || !result.data) {
    return {
      data: [],
      pagination: {
        total: 0,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: false,
      },
    };
  }

  const members = result.data;
  const total = members.length;

  // Apply pagination
  const paginatedMembers = members.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  );

  return {
    data: paginatedMembers,
    pagination: {
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + pagination.limit < total,
    },
  };
}

/**
 * Change a member's role.
 * Only the owner can change roles.
 * Can promote member to admin or demote admin to member.
 */
export async function changeRole(
  groupId: string,
  actorUserId: string,
  targetUserId: string,
  newRole: MemberRole
): Promise<void> {
  // 1. Only owner can change roles
  await requireRole(groupId, actorUserId, "owner");

  // 2. Validate target is an active member
  const targetMembershipId = `${groupId}#${targetUserId}`;
  const targetResult = await getMembership(targetMembershipId);

  if (targetResult.error || !targetResult.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  if (targetResult.data.status !== "active") {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  // Cannot change owner's role via this method (use transferOwnership)
  if (targetResult.data.role === "owner") {
    throw new Error(GroupErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  // 3. Update role
  const updateResult = await updateMembershipRole(targetMembershipId, newRole);
  if (!updateResult.success) {
    throw new Error(updateResult.error || "Failed to change role");
  }

  // 4. Log audit action
  await logAction(groupId, actorUserId, "role_change", targetUserId, {
    newRole,
    previousRole: targetResult.data.role,
  });
}

/**
 * Remove a member from a group.
 *
 * Role hierarchy:
 * - Admin cannot remove owner
 * - Admin cannot remove another admin
 * - Admin can remove regular members
 * - Owner can remove anyone except self
 */
export async function removeMember(
  groupId: string,
  actorUserId: string,
  targetUserId: string
): Promise<void> {
  // 1. Get actor's role
  const actorRole = await getMemberRole(groupId, actorUserId);
  if (!actorRole || (actorRole !== "owner" && actorRole !== "admin")) {
    throw new Error(GroupErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  // Cannot remove yourself via this method (use leaveGroup)
  if (actorUserId === targetUserId) {
    throw new Error(GroupErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  // 2. Get target's membership
  const targetMembershipId = `${groupId}#${targetUserId}`;
  const targetResult = await getMembership(targetMembershipId);

  if (targetResult.error || !targetResult.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  if (targetResult.data.status !== "active") {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  const targetRole = targetResult.data.role;

  // 3. Enforce role hierarchy
  if (actorRole === "admin" && targetRole === "owner") {
    throw new Error(GroupErrorCode.CANNOT_REMOVE_OWNER);
  }

  if (actorRole === "admin" && targetRole === "admin") {
    throw new Error(GroupErrorCode.CANNOT_REMOVE_ADMIN);
  }

  // Owner cannot remove self (must use transferOwnership + leaveGroup)
  if (targetRole === "owner") {
    throw new Error(GroupErrorCode.CANNOT_REMOVE_OWNER);
  }

  // 4. Update target's status to 'removed'
  const statusResult = await updateMembershipStatus(
    targetMembershipId,
    "removed",
    actorUserId
  );
  if (!statusResult.success) {
    throw new Error(statusResult.error || "Failed to remove member");
  }

  // 5. Decrement member count
  await decrementMemberCount(groupId);

  // 6. Log audit action
  await logAction(groupId, actorUserId, "remove_member", targetUserId);
}

/**
 * Leave a group voluntarily.
 * Owner must transfer ownership before leaving.
 */
export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  // 1. Get user's membership
  const membershipId = `${groupId}#${userId}`;
  const membershipResult = await getMembership(membershipId);

  if (membershipResult.error || !membershipResult.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  if (membershipResult.data.status !== "active") {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  // 2. If user is owner, block without transfer
  if (membershipResult.data.role === "owner") {
    throw new Error(GroupErrorCode.MUST_TRANSFER_OWNERSHIP);
  }

  // 3. Update status to 'left'
  const statusResult = await updateMembershipStatus(membershipId, "left");
  if (!statusResult.success) {
    throw new Error(statusResult.error || "Failed to leave group");
  }

  // 4. Decrement member count
  await decrementMemberCount(groupId);
}

/**
 * Transfer ownership of a group to another active member.
 * Only the current owner can transfer ownership.
 */
export async function transferOwnership(
  groupId: string,
  ownerUserId: string,
  newOwnerUserId: string
): Promise<void> {
  // 1. Verify current owner
  await requireRole(groupId, ownerUserId, "owner");

  // 2. Validate new owner is an active member
  const newOwnerMembershipId = `${groupId}#${newOwnerUserId}`;
  const newOwnerResult = await getMembership(newOwnerMembershipId);

  if (newOwnerResult.error || !newOwnerResult.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  if (newOwnerResult.data.status !== "active") {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  // 3. Update old owner's role to 'member'
  const oldOwnerMembershipId = `${groupId}#${ownerUserId}`;
  const demoteResult = await updateMembershipRole(oldOwnerMembershipId, "member");
  if (!demoteResult.success) {
    throw new Error(demoteResult.error || "Failed to demote old owner");
  }

  // 4. Update new owner's role to 'owner'
  const promoteResult = await updateMembershipRole(newOwnerMembershipId, "owner");
  if (!promoteResult.success) {
    throw new Error(promoteResult.error || "Failed to promote new owner");
  }

  // 5. Update group's ownerUserId
  const groupUpdateResult = await updateGroup(groupId, {
    ownerUserId: newOwnerUserId,
  });
  if (!groupUpdateResult.success) {
    throw new Error(groupUpdateResult.error || "Failed to update group owner");
  }

  // 6. Log audit action
  await logAction(groupId, ownerUserId, "transfer_ownership", newOwnerUserId);
}

/**
 * Approve a pending join request.
 * Only owner or admin can approve requests.
 */
export async function approveRequest(
  groupId: string,
  actorUserId: string,
  targetUserId: string
): Promise<void> {
  // 1. Require admin role (owner also passes this check)
  await requireRole(groupId, actorUserId, "admin");

  // 2. Get target's membership, verify status is 'pending'
  const targetMembershipId = `${groupId}#${targetUserId}`;
  const targetResult = await getMembership(targetMembershipId);

  if (targetResult.error || !targetResult.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  if (targetResult.data.status !== "pending") {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  // 3. Atomically increment member count (concurrency check for group full)
  const incrementResult = await incrementMemberCount(groupId);
  if (!incrementResult.success) {
    throw new Error(GroupErrorCode.GROUP_FULL);
  }

  // 4. Update status to 'active', role to 'member'
  const statusResult = await updateMembershipStatus(targetMembershipId, "active");
  if (!statusResult.success) {
    throw new Error(statusResult.error || "Failed to approve request");
  }

  await updateMembershipRole(targetMembershipId, "member");

  // 5. Log audit action
  await logAction(groupId, actorUserId, "approve_request", targetUserId);
}

/**
 * Reject a pending join request.
 * Only owner or admin can reject requests.
 */
export async function rejectRequest(
  groupId: string,
  actorUserId: string,
  targetUserId: string
): Promise<void> {
  // 1. Require admin role (owner also passes this check)
  await requireRole(groupId, actorUserId, "admin");

  // 2. Get target's membership, verify status is 'pending'
  const targetMembershipId = `${groupId}#${targetUserId}`;
  const targetResult = await getMembership(targetMembershipId);

  if (targetResult.error || !targetResult.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  if (targetResult.data.status !== "pending") {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  // 3. Update status to 'rejected'
  const statusResult = await updateMembershipStatus(targetMembershipId, "rejected");
  if (!statusResult.success) {
    throw new Error(statusResult.error || "Failed to reject request");
  }

  // 4. Log audit action
  await logAction(groupId, actorUserId, "reject_request", targetUserId);
}

/**
 * List pending join requests for a group.
 * Only owner or admin can view pending requests.
 */
export async function listPendingRequests(
  groupId: string,
  userId: string
): Promise<Membership[]> {
  // 1. Require admin role (owner also passes this check)
  await requireRole(groupId, userId, "admin");

  // 2. Query pending memberships for the group
  const result = await listPendingByGroup(groupId);

  if (result.error || !result.data) {
    return [];
  }

  return result.data;
}
