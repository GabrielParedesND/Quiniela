import crypto from "crypto";
import { getGroupByInviteCode, updateInviteCode } from "@/lib/data/groups";
import type { Group } from "@/lib/data/groups";

export interface ValidateCodeResult {
  valid: boolean;
  group?: Group;
  reason?: "invalid" | "expired" | "group_closed";
}

/**
 * Generate a cryptographically secure invite code.
 * Uses crypto.randomBytes(8) for 64 bits of entropy (exceeds the 48-bit requirement).
 * Returns a 10-character uppercase hex string.
 */
export function generateCode(): string {
  const buffer = crypto.randomBytes(8);
  return buffer.toString("hex").substring(0, 10).toUpperCase();
}

/**
 * Validate an invite code by querying the byInviteCode GSI.
 * Returns a generic "invalid" reason for non-existent codes to prevent enumeration.
 */
export async function validateCode(code: string): Promise<ValidateCodeResult> {
  const result = await getGroupByInviteCode(code);

  // Code not found — return generic "invalid" to prevent enumeration
  if (result.error || !result.data) {
    return { valid: false, reason: "invalid" };
  }

  const group = result.data;

  // Group is closed or deleted
  if (group.status === "closed" || group.status === "deleted") {
    return { valid: false, reason: "group_closed" };
  }

  // Code has expired
  if (group.inviteCodeExpiresAt) {
    const expiresAt = new Date(group.inviteCodeExpiresAt);
    if (expiresAt < new Date()) {
      return { valid: false, reason: "expired" };
    }
  }

  return { valid: true, group };
}

/**
 * Regenerate the invite code for a group.
 * Generates a new code and updates the group record.
 * Returns the new code on success.
 */
export async function regenerateCode(groupId: string): Promise<string> {
  const newCode = generateCode();

  const result = await updateInviteCode(groupId, newCode);

  if (!result.success) {
    throw new Error(result.error || "Failed to regenerate invite code");
  }

  return newCode;
}
