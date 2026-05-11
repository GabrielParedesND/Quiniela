import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getRandomProfileAvatar, isProfileAvatarOption } from '@/lib/assets';
import { validateAndNormalizeProfileFields } from '@/lib/db/users';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    const userId = typeof profile?.userId === 'string' ? profile.userId.trim() : '';
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    const createdAt =
      typeof profile?.createdAt === 'string' && !Number.isNaN(Date.parse(profile.createdAt))
        ? profile.createdAt
        : new Date().toISOString();

    const email = typeof profile?.email === 'string' ? profile.email.trim() : '';

    const validation = validateAndNormalizeProfileFields({
      nombres: String(profile?.nombres || ''),
      apellidos: String(profile?.apellidos || ''),
      dpi: String(profile?.dpi || ''),
      tel: String(profile?.tel || ''),
      fechaNacimiento: String(profile?.fechaNacimiento || ''),
      departamento: String(profile?.departamento || ''),
      municipio: String(profile?.municipio || ''),
      genero: String(profile?.genero || ''),
    });

    if (!validation.valid || !validation.normalized) {
      return NextResponse.json(
        { error: validation.error || 'Datos de perfil inválidos' },
        { status: 400 }
      );
    }

    const profileWithAvatar = {
      userId,
      createdAt,
      email,
      ...validation.normalized,
      avatar: profile?.avatar && isProfileAvatarOption(profile.avatar)
        ? profile.avatar
        : getRandomProfileAvatar(),
    };

    const command = new PutCommand({
      TableName: process.env.DYNAMO_USERS_TABLE,
      Item: profileWithAvatar,
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
      TableName: process.env.DYNAMO_USERS_TABLE,
      Key: { userId },
    });

    const response = await docClient.send(command);

    return NextResponse.json({ profile: response.Item || null });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
