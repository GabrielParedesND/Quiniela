import {
  docClient,
  handleDynamoDBError,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@/lib/dynamodb";

const TABLE_NAME = process.env.DYNAMO_GROUPS_TABLE!;

export interface Group {
  groupId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerUserId: string;
  inviteCode: string;
  inviteCodeExpiresAt?: string;
  privacy: "public" | "private" | "invite-only";
  maxMembers: number;
  memberCount: number;
  status: "active" | "closed" | "deleted";
  tournamentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  groupId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerUserId: string;
  inviteCode: string;
  inviteCodeExpiresAt?: string;
  privacy: "public" | "private" | "invite-only";
  maxMembers: number;
  memberCount: number;
  status: "active" | "closed" | "deleted";
  tournamentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  ownerUserId?: string;
  privacy?: "public" | "private" | "invite-only";
  maxMembers?: number;
  inviteCodeExpiresAt?: string;
  tournamentId?: string;
  status?: "active" | "closed" | "deleted";
}

/**
 * Create a new group with uniqueness guarantee on inviteCode
 */
export async function createGroup(
  group: CreateGroupInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: group,
        ConditionExpression: "attribute_not_exists(groupId)",
      })
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Get a group by groupId
 */
export async function getGroup(
  groupId: string
): Promise<{ data?: Group; error?: string }> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { groupId },
      })
    );

    if (!result.Item) {
      return { error: "Group not found" };
    }

    return { data: result.Item as Group };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * Get a group by invite code using the byInviteCode GSI
 */
export async function getGroupByInviteCode(
  inviteCode: string
): Promise<{ data?: Group; error?: string }> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "byInviteCode",
        KeyConditionExpression: "inviteCode = :inviteCode",
        ExpressionAttributeValues: {
          ":inviteCode": inviteCode,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return { error: "Group not found" };
    }

    return { data: result.Items[0] as Group };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * List groups owned by a specific user using the byOwner GSI
 */
export async function listGroupsByOwner(
  ownerUserId: string
): Promise<{ data?: Group[]; error?: string }> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "byOwner",
        KeyConditionExpression: "ownerUserId = :ownerUserId",
        ExpressionAttributeValues: {
          ":ownerUserId": ownerUserId,
        },
      })
    );

    return { data: (result.Items as Group[]) || [] };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * Update a group's fields
 */
export async function updateGroup(
  groupId: string,
  updates: UpdateGroupInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    // Always update updatedAt
    const allUpdates = { ...updates, updatedAt: new Date().toISOString() };

    Object.entries(allUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressionParts.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressionParts.length === 0) {
      return { success: false, error: "No fields to update" };
    }

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { groupId },
        UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: "attribute_exists(groupId)",
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Soft delete a group by setting status to 'deleted'
 */
export async function softDeleteGroup(
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { groupId },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "deleted",
          ":updatedAt": now,
          ":deleted": "deleted",
        },
        ConditionExpression:
          "attribute_exists(groupId) AND #status <> :deleted",
      })
    );

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return { success: false, error: 'El grupo ya fue eliminado.' };
    }
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Update the invite code for a group with uniqueness check
 */
export async function updateInviteCode(
  groupId: string,
  newInviteCode: string,
  expiresAt?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const updateParts = [
      "#inviteCode = :newCode",
      "#updatedAt = :updatedAt",
    ];
    const attrNames: Record<string, string> = {
      "#inviteCode": "inviteCode",
      "#updatedAt": "updatedAt",
    };
    const attrValues: Record<string, unknown> = {
      ":newCode": newInviteCode,
      ":updatedAt": now,
    };

    if (expiresAt !== undefined) {
      updateParts.push("#inviteCodeExpiresAt = :expiresAt");
      attrNames["#inviteCodeExpiresAt"] = "inviteCodeExpiresAt";
      attrValues[":expiresAt"] = expiresAt;
    }

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { groupId },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues,
        ConditionExpression: "attribute_exists(groupId)",
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Atomically increment the member count (with concurrency protection)
 * Uses condition expression to ensure memberCount doesn't exceed maxMembers
 */
export async function incrementMemberCount(
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { groupId },
        UpdateExpression:
          "SET #memberCount = #memberCount + :one, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#memberCount": "memberCount",
          "#maxMembers": "maxMembers",
          "#updatedAt": "updatedAt",
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":one": 1,
          ":updatedAt": new Date().toISOString(),
          ":active": "active",
        },
        ConditionExpression:
          "attribute_exists(groupId) AND #memberCount < #maxMembers AND #status = :active",
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Atomically decrement the member count (with concurrency protection)
 * Uses condition expression to ensure memberCount doesn't go below 0
 */
export async function decrementMemberCount(
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { groupId },
        UpdateExpression:
          "SET #memberCount = #memberCount - :one, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#memberCount": "memberCount",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":one": 1,
          ":zero": 0,
          ":updatedAt": new Date().toISOString(),
        },
        ConditionExpression:
          "attribute_exists(groupId) AND #memberCount > :zero",
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}
