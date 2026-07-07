import crypto from "crypto";
import {
  createGroup as createGroupRecord,
  getGroup as getGroupRecord,
  listGroupsByOwner,
  updateGroup as updateGroupRecord,
  softDeleteGroup,
} from "@/lib/data/groups";
import type { Group } from "@/lib/data/groups";
import { createMembership } from "@/lib/data/memberships";
import { generateCode, regenerateCode } from "@/lib/services/invite-code-service";
import { requireRole } from "@/lib/services/authorization-service";
import { logAction } from "@/lib/services/audit-service";
import { sanitizeFields } from "@/lib/services/sanitization";
import type {
  CreateGroupInput,
  UpdateGroupInput,
  PaginationInput,
  PaginatedResult,
} from "@/types/groups";
import { GroupErrorCode } from "@/types/groups";
import { listGroupsByUser } from "@/lib/data/memberships";

const MAX_GROUPS_PER_USER = 10;
const DEFAULT_MAX_MEMBERS = 100;

/**
 * Create a new group with the user as owner.
 * Enforces max 10 groups per user, generates invite code,
 * creates group record and owner membership in sequence.
 */
export async function createGroup(
  userId: string,
  input: CreateGroupInput
): Promise<Group> {
  // 1. Check if user already has 10 groups (query listGroupsByOwner, count active ones)
  const ownerGroupsResult = await listGroupsByOwner(userId);
  if (ownerGroupsResult.data) {
    const activeGroups = ownerGroupsResult.data.filter(
      (g) => g.status === "active"
    );
    if (activeGroups.length >= MAX_GROUPS_PER_USER) {
      throw new Error(GroupErrorCode.MAX_GROUPS_REACHED);
    }
  }

  // 2. Sanitize name and description
  const sanitizedInput = sanitizeFields(
    { name: input.name, description: input.description ?? "" },
    ["name", "description"]
  );

  // 3. Generate UUID for groupId
  const groupId = crypto.randomUUID();

  // 4. Generate invite code
  const inviteCode = generateCode();

  // 5. Create group record
  const now = new Date().toISOString();
  const group: Group = {
    groupId,
    name: sanitizedInput.name,
    description: input.description ? sanitizedInput.description : undefined,
    avatarUrl: input.avatarUrl,
    ownerUserId: userId,
    inviteCode,
    privacy: input.privacy,
    maxMembers: input.maxMembers ?? DEFAULT_MAX_MEMBERS,
    memberCount: 1,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const createResult = await createGroupRecord(group);
  if (!createResult.success) {
    throw new Error(createResult.error || "Failed to create group");
  }

  // 6. Create owner membership
  const membershipId = `${groupId}#${userId}`;
  const membershipResult = await createMembership({
    membershipId,
    groupId,
    userId,
    role: "owner",
    status: "active",
    joinedAt: now,
    updatedAt: now,
  });

  if (!membershipResult.success) {
    throw new Error(membershipResult.error || "Failed to create owner membership");
  }

  // 7. Log audit action
  await logAction(groupId, userId, "create_group");

  return group;
}

/**
 * Get a group by its ID.
 * Returns null if the group is not found.
 */
export async function getGroup(groupId: string): Promise<Group | null> {
  const result = await getGroupRecord(groupId);

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

/**
 * List groups a user belongs to with pagination.
 * Queries active memberships for the user, then fetches group details.
 */
export async function listUserGroups(
  userId: string,
  pagination: PaginationInput
): Promise<PaginatedResult<Group>> {
  // 1. Query memberships by user (status: 'active')
  const membershipsResult = await listGroupsByUser(userId, "active");

  if (membershipsResult.error || !membershipsResult.data) {
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

  const memberships = membershipsResult.data;

  // 2. Fetch ALL group details and filter out deleted ones BEFORE pagination
  const allGroups: Group[] = [];
  for (const membership of memberships) {
    const groupResult = await getGroupRecord(membership.groupId);
    if (groupResult.data && groupResult.data.status !== 'deleted') {
      allGroups.push(groupResult.data);
    }
  }

  const total = allGroups.length;

  // 3. Apply pagination (offset/limit) on the filtered results
  const paginatedGroups = allGroups.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  );

  return {
    data: paginatedGroups,
    pagination: {
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + pagination.limit < total,
    },
  };
}

/**
 * Update a group's configuration.
 * Only the owner can update a group.
 */
export async function updateGroup(
  groupId: string,
  userId: string,
  input: UpdateGroupInput
): Promise<Group> {
  // 1. requireRole(groupId, userId, 'owner')
  await requireRole(groupId, userId, "owner");

  // 2. Sanitize text fields
  const sanitizedName =
    input.name !== undefined
      ? (sanitizeFields({ name: input.name }, ["name"]).name as string)
      : undefined;
  const sanitizedDescription =
    input.description !== undefined
      ? (sanitizeFields({ description: input.description }, ["description"]).description as string)
      : undefined;

  // 3. Call updateGroup from data layer
  const updateResult = await updateGroupRecord(groupId, {
    name: sanitizedName,
    description: sanitizedDescription,
    avatarUrl: input.avatarUrl,
    privacy: input.privacy,
    maxMembers: input.maxMembers,
    inviteCodeExpiresAt: input.inviteCodeExpiresAt,
  });

  if (!updateResult.success) {
    throw new Error(updateResult.error || "Failed to update group");
  }

  // 4. Log audit action
  await logAction(groupId, userId, "update_group");

  // Return the updated group
  const updatedGroup = await getGroupRecord(groupId);
  if (!updatedGroup.data) {
    throw new Error(GroupErrorCode.GROUP_NOT_FOUND);
  }

  return updatedGroup.data;
}

/**
 * Soft delete a group.
 * Only the owner can delete a group.
 */
export async function deleteGroup(
  groupId: string,
  userId: string
): Promise<void> {
  // 1. requireRole(groupId, userId, 'owner')
  await requireRole(groupId, userId, "owner");

  // 2. Call softDeleteGroup from data layer
  const deleteResult = await softDeleteGroup(groupId);
  if (!deleteResult.success) {
    throw new Error(deleteResult.error || "Failed to delete group");
  }

  // 3. Log audit action
  await logAction(groupId, userId, "delete_group");
}

/**
 * Regenerate the invite code for a group.
 * Both owner and admin can regenerate the code.
 */
export async function regenerateInviteCode(
  groupId: string,
  userId: string
): Promise<string> {
  // 1. requireRole(groupId, userId, 'admin') — both owner and admin can do this
  await requireRole(groupId, userId, "admin");

  // 2. Call regenerateCode from invite-code-service
  const newCode = await regenerateCode(groupId);

  // 3. Log audit action
  await logAction(groupId, userId, "regenerate_code");

  // 4. Return new code
  return newCode;
}
