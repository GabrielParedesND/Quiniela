import { promises as fs } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const DEFAULT_TOURNAMENT_ID = "world-cup-2026-demo";
const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, "public", "assets");

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Falta variable de entorno: ${name}`);
  return value;
};

const optional = (name, fallback = "") => process.env[name] || fallback;

const region = optional("AWS_REGION", optional("NEXT_PUBLIC_AWS_REGION", "us-east-1"));
const bucketName = required("BRAND_ASSETS_BUCKET_NAME");
const brandingTable = required("DYNAMO_BRANDING_CONFIG_TABLE");
const tournamentId = optional("TOURNAMENT_ID", DEFAULT_TOURNAMENT_ID);
const explicitBrandingId = optional("BRANDING_ID");
const keyPrefix = optional("S3_ASSETS_PREFIX", "assets").replace(/^\/+|\/+$/g, "");
const shouldUpload = optional("SYNC_SKIP_UPLOAD") !== "1";
const shouldUpdateDynamo = optional("SYNC_SKIP_DYNAMO") !== "1";

const baseUrl = (
  optional("NEXT_PUBLIC_BRAND_ASSETS_BASE_URL") ||
  `https://${bucketName}.s3.${region}.amazonaws.com`
).replace(/\/+$/, "");

const s3 = new S3Client({ region });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
});

const CONTENT_TYPES = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const normalizePathForS3 = (value) => value.split(path.sep).join("/");

const toS3Key = (relativePath) => `${keyPrefix}/${normalizePathForS3(relativePath)}`;

const toPublicUrl = (s3Key) => `${baseUrl}/${encodeURI(s3Key)}`;

const toAssetUrl = (value) => {
  if (typeof value !== "string" || !value) return value;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  const clean = value.startsWith("/") ? value.slice(1) : value;
  if (!clean.startsWith("assets/")) return value;

  return toPublicUrl(clean);
};

const deepMapAssetUrls = (value) => {
  if (Array.isArray(value)) return value.map((item) => deepMapAssetUrls(item));
  if (typeof value === "string") return toAssetUrl(value);
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, deepMapAssetUrls(nested)])
    );
  }
  return value;
};

const listFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const all = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      all.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      all.push(fullPath);
    }
  }

  return all;
};

const uploadAssets = async () => {
  const files = await listFiles(ASSETS_DIR);
  let uploaded = 0;

  for (const absoluteFile of files) {
    const relativeToAssets = path.relative(ASSETS_DIR, absoluteFile);
    const key = toS3Key(relativeToAssets);
    const body = await fs.readFile(absoluteFile);
    const ext = path.extname(absoluteFile).toLowerCase();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: CONTENT_TYPES[ext] || "application/octet-stream",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    uploaded += 1;
  }

  console.log(`✅ Archivos subidos a S3: ${uploaded}`);
};

const loadBrandingItem = async () => {
  if (explicitBrandingId) {
    const response = await ddb.send(
      new GetCommand({
        TableName: brandingTable,
        Key: { brandingId: explicitBrandingId },
      })
    );
    return response.Item || null;
  }

  const response = await ddb.send(
    new QueryCommand({
      TableName: brandingTable,
      IndexName: "byTournament",
      KeyConditionExpression: "tournamentId = :tournamentId",
      ExpressionAttributeValues: { ":tournamentId": tournamentId },
      Limit: 1,
    })
  );

  return response.Items?.[0] || null;
};

const updateBrandingConfigItem = async () => {
  const existing = await loadBrandingItem();
  if (!existing) {
    throw new Error(
      `No se encontró item de branding para tournamentId=${tournamentId}. Crea uno primero o pasa BRANDING_ID.`
    );
  }

  const next = {
    ...existing,
    logoUrl: deepMapAssetUrls(existing.logoUrl),
    iconUrl: deepMapAssetUrls(existing.iconUrl),
    assets: deepMapAssetUrls(existing.assets),
    sponsors: deepMapAssetUrls(existing.sponsors),
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(
    new PutCommand({
      TableName: brandingTable,
      Item: next,
    })
  );

  console.log(`✅ BrandingConfig actualizado: ${next.brandingId}`);
};

const main = async () => {
  console.log("🔧 Iniciando sincronización de branding con S3...");
  console.log(`- Región: ${region}`);
  console.log(`- Bucket: ${bucketName}`);
  console.log(`- Base URL: ${baseUrl}`);
  console.log(`- Tabla branding: ${brandingTable}`);
  console.log(`- Torneo: ${tournamentId}`);

  if (shouldUpload) {
    await uploadAssets();
  } else {
    console.log("ℹ️ Se omitió la subida a S3 (SYNC_SKIP_UPLOAD=1).");
  }

  if (shouldUpdateDynamo) {
    await updateBrandingConfigItem();
  } else {
    console.log("ℹ️ Se omitió update Dynamo (SYNC_SKIP_DYNAMO=1).");
  }

  console.log("🎉 Sincronización finalizada.");
};

main().catch((error) => {
  console.error("❌ Error en sincronización:", error);
  process.exit(1);
});
