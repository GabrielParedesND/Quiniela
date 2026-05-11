import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, activityType, metadata } = body;

    const tableName = process.env.NEXT_PUBLIC_ACTIVITY_LOGS_TABLE;
    
    if (!tableName) {
      console.warn('Activity logs table not configured');
      return NextResponse.json({ success: true }); // Silent fail
    }

    const timestamp = Date.now();
    const logId = `${email}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          logId,
          userId: userId || 'unknown',
          email,
          activityType,
          timestamp,
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Silent fail for activity logs - don't break user flow
    const isResourceNotFound = error && typeof error === 'object' && 'name' in error && error.name === 'ResourceNotFoundException';
    if (!isResourceNotFound) {
      console.error('Failed to log activity:', error);
    }
    return NextResponse.json({ success: true }); // Return success even on error
  }
}
