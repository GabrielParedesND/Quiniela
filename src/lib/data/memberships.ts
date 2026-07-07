import {
  docClient,
  handleDynamoDBError,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@/lib/dynamodb";

const TABLE_NAME = process.env.DYNAMO_MEMBERSHIPS_TABLE!;

export interface Membership {
  membershipId: string;
  groupId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  status: "active" | "pending" | "rejected" | "removed" | "left";
  joinedAt: string;
  updatedAt: string;
  removedBy?: string;
}

export interface CreateMembershipInput {
  membershipId: string;
  groupId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  status: "active" | "pending" | "rejected" | "removed" | "left";
  joinedAt: string;
  updatedAt: string;
  removedBy?: string;
}

/**
 * Create a new membership with uniqueness guarantee (prevents duplicate memberships)
 */
export async function createMembership(
  membership: CreateMembershipInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: membership,
        ConditionExpression: "attribute_not_exists(membershipId)",
      })
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Get a membership by membershipId (format: {groupId}#{userId})
 */
export async function getMembership(
  membershipId: string
): Promise<{ data?: Membership; error?: string }> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { membershipId },
      })
    );

    if (!result.Item) {
      return { error: "Membership not found" };
    }

    return { data: result.Item as Membership };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * List members of a group using the byGroup GSI.
 * Optionally filter by status (e.g., only 'active' members).
 */
export async function listMembersByGroup(
  groupId: string,
  status?: string
): Promise<{ data?: Membership[]; error?: string }> {
  try {
    const params: {
      TableName: string;
      IndexName: string;
      KeyConditionExpression: string;
      ExpressionAttributeValues: Record<string, unknown>;
    } = {
      TableName: TABLE_NAME,
      IndexName: "byGroup",
      KeyConditionExpression: "groupId = :groupId",
      ExpressionAttributeValues: {
        ":groupId": groupId,
      },
    };

    if (status) {
      params.KeyConditionExpression += " AND #status = :status";
      params.ExpressionAttributeValues[":status"] = status;
    }

    const result = await docClient.send(
      new QueryCommand({
        ...params,
        ...(status && {
          ExpressionAttributeNames: { "#status": "status" },
        }),
      })
    );

    return { data: (result.Items as Membership[]) || [] };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * List groups a user belongs to using the byUser GSI.
 * Defaults to listing only 'active' memberships.
 */
export async function listGroupsByUser(
  userId: string,
  status: string = "active"
): Promise<{ data?: Membership[]; error?: string }> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "byUser",
        KeyConditionExpression: "userId = :userId AND #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":status": status,
        },
      })
    );

    return { data: (result.Items as Membership[]) || [] };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * Update a membership's role
 */
export async function updateMembershipRole(
  membershipId: string,
  newRole: "owner" | "admin" | "member"
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { membershipId },
        UpdateExpression: "SET #role = :role, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#role": "role",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":role": newRole,
          ":updatedAt": now,
        },
        ConditionExpression: "attribute_exists(membershipId)",
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Update a membership's status (e.g., active, pending, removed, left)
 * Optionally records who performed the removal.
 */
export async function updateMembershipStatus(
  membershipId: string,
  newStatus: "active" | "pending" | "rejected" | "removed" | "left",
  removedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();

    const updateParts = ["#status = :status", "#updatedAt = :updatedAt"];
    const attrNames: Record<string, string> = {
      "#status": "status",
      "#updatedAt": "updatedAt",
    };
    const attrValues: Record<string, unknown> = {
      ":status": newStatus,
      ":updatedAt": now,
    };

    if (removedBy) {
      updateParts.push("#removedBy = :removedBy");
      attrNames["#removedBy"] = "removedBy";
      attrValues[":removedBy"] = removedBy;
    }

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { membershipId },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues,
        ConditionExpression: "attribute_exists(membershipId)",
      })
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * List pending membership requests for a group using the byGroup GSI with status = 'pending'
 */
export async function listPendingByGroup(
  groupId: string
): Promise<{ data?: Membership[]; error?: string }> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "byGroup",
        KeyConditionExpression: "groupId = :groupId AND #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":groupId": groupId,
          ":status": "pending",
        },
      })
    );

    return { data: (result.Items as Membership[]) || [] };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}
