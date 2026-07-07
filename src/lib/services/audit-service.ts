import { createAuditLog } from "@/lib/data/group-audit-logs";

/**
 * Log an administrative action for audit purposes.
 * Called by group-service and membership-service after admin actions.
 * Errors are logged but don't block the main operation (fire-and-forget).
 */
export async function logAction(
  groupId: string,
  actorUserId: string,
  action: string,
  targetUserId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await createAuditLog({
      groupId,
      actorUserId,
      action,
      targetUserId,
      metadata,
    });
  } catch (error) {
    // Log error but don't throw — audit logging should not block main operations
    console.error("[AuditService] Failed to log action:", {
      groupId,
      action,
      error,
    });
  }
}
