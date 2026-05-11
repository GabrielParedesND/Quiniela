import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

/**
 * POST /api/printed-codes
 * Body: { code: string, userId: string }
 * Validates and redeems a printed code, returning the multiplier info.
 */
export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json({ error: 'Código y userId son requeridos' }, { status: 400 });
    }

    const tableName = getEnv('DYNAMO_PRINTED_CODES_TABLE');
    const normalizedCode = code.toUpperCase().trim();

    // Get the code
    const getResult = await docClient.send(
      new GetCommand({ TableName: tableName, Key: { code: normalizedCode } })
    );

    if (!getResult.Item) {
      return NextResponse.json({ error: 'Código no válido' }, { status: 404 });
    }

    const item = getResult.Item;

    if (item.status === 'redeemed') {
      return NextResponse.json({ error: 'Este código ya fue canjeado' }, { status: 409 });
    }

    // Check if the feature is enabled for this project
    const brandingTable = getEnv('DYNAMO_BRANDING_CONFIG_TABLE');
    const brandingResult = await docClient.send(
      new GetCommand({ TableName: brandingTable, Key: { brandingId: item.projectId } })
    );

    if (!brandingResult.Item?.printedCodesEnabled) {
      return NextResponse.json({ error: 'Los códigos de impreso no están habilitados' }, { status: 403 });
    }

    // Check if user already redeemed a code today
    const today = new Date().toISOString().split('T')[0];
    const userCodesResult = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'byUser',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
      })
    );

    const alreadyRedeemedToday = (userCodesResult.Items || []).some(
      (c) => c.redeemedAt && c.redeemedAt.startsWith(today)
    );

    if (alreadyRedeemedToday) {
      return NextResponse.json({ error: 'Ya canjeaste un código hoy' }, { status: 409 });
    }

    // Redeem the code
    const now = new Date().toISOString();
    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { code: normalizedCode },
        UpdateExpression: 'SET #status = :redeemed, userId = :uid, redeemedAt = :now, updatedAt = :now',
        ConditionExpression: '#status = :available',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':redeemed': 'redeemed',
          ':available': 'available',
          ':uid': userId,
          ':now': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    const redeemed = updateResult.Attributes;

    return NextResponse.json({
      success: true,
      multiplier: redeemed?.multiplier || item.multiplier,
      message: `¡Código canjeado! Tus puntos del día se multiplicarán x${redeemed?.multiplier || item.multiplier}`,
      redeemedAt: now,
    });
  } catch (error) {
    console.error('[printed-codes] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/printed-codes?userId=xxx
 * Returns the user's active multiplier for today (if any).
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    const tableName = getEnv('DYNAMO_PRINTED_CODES_TABLE');
    const today = new Date().toISOString().split('T')[0];

    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'byUser',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
      })
    );

    const todayCode = (result.Items || []).find(
      (c) => c.redeemedAt && c.redeemedAt.startsWith(today)
    );

    if (todayCode) {
      return NextResponse.json({
        hasActiveMultiplier: true,
        multiplier: todayCode.multiplier,
        redeemedAt: todayCode.redeemedAt,
        code: todayCode.code,
      });
    }

    return NextResponse.json({ hasActiveMultiplier: false });
  } catch (error) {
    console.error('[printed-codes] GET Error:', error);
    return NextResponse.json({ hasActiveMultiplier: false });
  }
}
