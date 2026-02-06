import { NextRequest, NextResponse } from 'next/server';
import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();

    const command = new PutCommand({
      TableName: Resource.UsersTable.name,
      Item: profile,
    });

    await docClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const command = new GetCommand({
      TableName: Resource.UsersTable.name,
      Key: { userId },
    });

    const response = await docClient.send(command);

    return NextResponse.json({ profile: response.Item || null });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
