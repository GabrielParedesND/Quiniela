import {
  docClient,
  handleDynamoDBError,
  PutCommand,
  QueryCommand,
} from "@/lib/dynamodb";

const TABLE_NAME = process.env.DYNAMO_GROUP_AUDIT_LOGS_TABLE!;

export interface GroupAuditLog {
  logId: string;
  groupId: string;
  actorUserId: string;
  action: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface CreateAuditLogInput {
  groupId: string;
  actorUserId: string;
  action: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedAuditLogsResult {
  data: GroupAuditLog[];
  lastEvaluatedKey?: Record<string, unknown>;
}

/**
 * Create a new audit log entry.
 * Automatically generates a UUID for logId and sets the timestamp.
 */
export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const logId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const item: GroupAuditLog = {
      logId,
      groupId: input.groupId,
      actorUserId: input.actorUserId,
      action: input.action,
      targetUserId: input.targetUserId,
      metadata: input.metadata,
      timestamp,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * List audit logs for a group, ordered by timestamp descending (most recent first).
 * Uses the byGroup GSI with ScanIndexForward: false for descending order.
 * Supports pagination via limit and exclusiveStartKey.
 */
export async function listAuditLogsByGroup(
  groupId: string,
  options?: { limit?: number; exclusiveStartKey?: Record<string, unknown> }
): Promise<{ data?: PaginatedAuditLogsResult; error?: string }> {
  try {
    const limit = options?.limit ?? 20;

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "byGroup",
        KeyConditionExpression: "groupId = :groupId",
        ExpressionAttributeValues: {
          ":groupId": groupId,
        },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: options?.exclusiveStartKey,
      })
    );

    return {
      data: {
        data: (result.Items as GroupAuditLog[]) || [],
        lastEvaluatedKey: result.LastEvaluatedKey as
          | Record<string, unknown>
          | undefined,
      },
    };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}
