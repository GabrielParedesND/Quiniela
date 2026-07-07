/**
 * Shared types for the Private Groups with Leaderboard feature.
 * Used across the service layer and API routes.
 *
 * Data layer types (Group, Membership, GroupAuditLog) are re-exported
 * from their respective data modules for convenience.
 */

// Re-export data layer types for convenience
export type { Group } from "@/lib/data/groups";
export type { Membership } from "@/lib/data/memberships";
export type { GroupAuditLog } from "@/lib/data/group-audit-logs";

// --- Role and Status Types ---

export type MemberRole = "owner" | "admin" | "member";

export type MemberStatus = "active" | "pending" | "rejected" | "removed" | "left";

// --- Action Types ---

export type GroupAction =
  | "edit_group"
  | "manage_roles"
  | "regenerate_code"
  | "approve_requests"
  | "remove_member"
  | "remove_admin"
  | "transfer_ownership"
  | "delete_group"
  | "view_leaderboard"
  | "view_members"
  | "leave_group"
  | "share_code";

// --- Error Codes ---

export enum GroupErrorCode {
  GROUP_NOT_FOUND = "GROUP_NOT_FOUND",
  ALREADY_MEMBER = "ALREADY_MEMBER",
  GROUP_FULL = "GROUP_FULL",
  GROUP_CLOSED = "GROUP_CLOSED",
  INVALID_INVITE_CODE = "INVALID_INVITE_CODE",
  INVITE_CODE_EXPIRED = "INVITE_CODE_EXPIRED",
  USER_BANNED = "USER_BANNED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  CANNOT_REMOVE_OWNER = "CANNOT_REMOVE_OWNER",
  CANNOT_REMOVE_ADMIN = "CANNOT_REMOVE_ADMIN",
  MUST_TRANSFER_OWNERSHIP = "MUST_TRANSFER_OWNERSHIP",
  MAX_GROUPS_REACHED = "MAX_GROUPS_REACHED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

// --- Service Input/Output Types ---

export interface CreateGroupInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  privacy: "public" | "private" | "invite-only";
  maxMembers?: number;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  privacy?: "public" | "private" | "invite-only";
  maxMembers?: number;
  inviteCodeExpiresAt?: string;
}

export interface JoinResult {
  status: "joined" | "pending_approval";
  groupId: string;
  groupName: string;
}

// --- Pagination Types ---

export interface PaginationInput {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// --- Leaderboard Types ---

export interface LeaderboardEntry {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
}
