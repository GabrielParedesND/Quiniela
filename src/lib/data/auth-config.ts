import {
  docClient,
  handleDynamoDBError,
  GetCommand,
} from "@/lib/dynamodb";

const TABLE_NAME = process.env.DYNAMO_AUTH_CONFIG_TABLE!;

export interface AuthConfig {
  projectId: string;
  domainValidationEnabled: boolean;
  allowedDomains: string[];
  emailWhitelist: string[];
  socialProviders: {
    google: boolean;
    facebook: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Get auth config for a project (read-only).
 * Returns { data: undefined } gracefully when config doesn't exist.
 * Returns { error: string } on network/DB errors.
 */
export async function getAuthConfig(
  projectId: string
): Promise<{ data?: AuthConfig; error?: string }> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { projectId },
      })
    );

    if (!result.Item) {
      return { data: undefined };
    }

    return { data: result.Item as AuthConfig };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}
