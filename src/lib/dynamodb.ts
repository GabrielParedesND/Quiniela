import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
});

// Create Document Client for easier data manipulation
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// Export command types for use in data access layers
export { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand, BatchWriteCommand };

/**
 * Helper function to handle DynamoDB errors and return user-friendly messages
 */
export function handleDynamoDBError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "ResourceNotFoundException") {
      return "Tabla no encontrada. Verifica que el deploy esté completo.";
    }
    if (error.name === "ValidationException") {
      return `Formato de datos inválido: ${error.message}`;
    }
    if (error.name === "ConditionalCheckFailedException") {
      return "El registro ya existe o la condición no se cumplió";
    }
    if (error.name === "ProvisionedThroughputExceededException") {
      return "Demasiadas solicitudes, intenta de nuevo";
    }
    if (error.name === "ItemCollectionSizeLimitExceededException") {
      return "Límite de tamaño de colección excedido";
    }
    if (error.name === "TransactionConflictException") {
      return "Conflicto de transacción, intenta de nuevo";
    }

    return error.message;
  }

  return "Error desconocido";
}
