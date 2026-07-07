import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ActivityType } from './activity';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

interface ServerLogActivityParams {
  userId: string;
  email?: string;
  activityType: ActivityType;
  metadata?: Record<string, any>;
}

/**
 * Server-side activity logging — writes directly to DynamoDB.
 * Use this in API routes instead of the client-side logActivity.
 */
export const logActivityServer = async (params: ServerLogActivityParams): Promise<void> => {
  try {
    const tableName = process.env.NEXT_PUBLIC_ACTIVITY_LOGS_TABLE;
    if (!tableName) return;

    const timestamp = Date.now();
    const logId = `${params.userId}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          logId,
          userId: params.userId,
          email: params.email || '',
          activityType: params.activityType,
          timestamp,
          metadata: params.metadata || {},
          createdAt: new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    // Silent fail — don't break user flow for logging
    console.warn('[logActivityServer] Failed:', (error as Error).message);
  }
};
