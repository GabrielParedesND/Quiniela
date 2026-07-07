import { z } from "zod";

// --- Group Creation ---

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  privacy: z.enum(["public", "private", "invite-only"]),
  maxMembers: z.number().int().min(2).max(500).optional(),
});

export type CreateGroupSchemaInput = z.infer<typeof createGroupSchema>;

// --- Group Update ---

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  privacy: z.enum(["public", "private", "invite-only"]).optional(),
  maxMembers: z.number().int().min(2).max(500).optional(),
  inviteCodeExpiresAt: z.string().datetime().optional(),
});

export type UpdateGroupSchemaInput = z.infer<typeof updateGroupSchema>;

// --- Join Group ---

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(8).max(20),
});

export type JoinGroupSchemaInput = z.infer<typeof joinGroupSchema>;

// --- Pagination ---

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PaginationSchemaInput = z.infer<typeof paginationSchema>;

// --- Change Role ---

export const changeRoleSchema = z.object({
  targetUserId: z.string().min(1),
  newRole: z.enum(["admin", "member"]),
});

export type ChangeRoleSchemaInput = z.infer<typeof changeRoleSchema>;
