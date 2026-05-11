import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });

export interface TournamentInfo {
  tournamentId: string;
  name: string;
  code: string;
  status: string;
  logoUrl?: string;
  startsAt: string;
  endsAt: string;
}

export async function GET() {
  try {
    const brandingTable = process.env.DYNAMO_BRANDING_CONFIG_TABLE;
    const tournamentsTable = process.env.DYNAMO_TOURNAMENTS_TABLE;
    if (!brandingTable || !tournamentsTable) {
      return NextResponse.json({ tournaments: [] });
    }

    // Find the active project
    const projectScan = await docClient.send(
      new ScanCommand({
        TableName: brandingTable,
        FilterExpression: '#s = :active',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':active': 'active' },
        Limit: 10,
      })
    );
    const activeProject = projectScan.Items?.[0];
    if (!activeProject?.brandingId) {
      return NextResponse.json({ tournaments: [] });
    }

    // Find all tournaments linked to this project
    const tournamentsScan = await docClient.send(
      new ScanCommand({
        TableName: tournamentsTable,
        FilterExpression: 'projectId = :pid',
        ExpressionAttributeValues: { ':pid': String(activeProject.brandingId) },
      })
    );

    const tournaments: TournamentInfo[] = (tournamentsScan.Items || [])
      .filter((t) => t.status === 'active' || t.status === 'scheduled')
      .map((t) => ({
        tournamentId: String(t.tournamentId),
        name: String(t.name),
        code: String(t.code),
        status: String(t.status),
        logoUrl: t.apiFootballLeagueId
          ? `https://media.api-sports.io/football/leagues/${t.apiFootballLeagueId}.png`
          : undefined,
        startsAt: String(t.startsAt || ''),
        endsAt: String(t.endsAt || ''),
      }))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('[tournaments] Error:', error);
    return NextResponse.json({ tournaments: [] });
  }
}
