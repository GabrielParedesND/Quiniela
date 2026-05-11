/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "quiniela-v1",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    // Import outputs from cms-quiniela stack
    // Use fs.readFileSync to avoid module cache issues across stages
    const fs = await import("fs");
    const path = await import("path");
    let cmsOutputs: Record<string, string> | null = null;
    try {
      const outputsPath = path.resolve("../cms-quiniela/.sst/outputs.json");
      const raw = fs.readFileSync(outputsPath, "utf-8");
      cmsOutputs = JSON.parse(raw);
    } catch {
      cmsOutputs = null;
    }
    
    if (!cmsOutputs) {
      throw new Error("cms-quiniela must be deployed first. Run 'sst deploy' in cms-quiniela directory.");
    }

    // Reference Cognito resources from cms-quiniela using actual IDs from outputs
    const userPoolId = cmsOutputs.userPoolId;
    const userPoolClientId = cmsOutputs.userPoolClientId;

    // Reference DynamoDB table names from cms-quiniela outputs
    const usersTableName = cmsOutputs.usersTableName;
    const activityLogsTableName = cmsOutputs.activityLogsTableName;
    const tournamentsTableName = cmsOutputs.tournamentsTableName;
    const roundsTableName = cmsOutputs.roundsTableName;
    const teamsTableName = cmsOutputs.teamsTableName;
    const matchesTableName = cmsOutputs.matchesTableName;
    const predictionsTableName = cmsOutputs.predictionsTableName;
    const scoreAggregateTableName = cmsOutputs.scoreAggregateTableName;
    const brandingConfigTableName = cmsOutputs.brandingConfigTableName;
    const standingsTableName = cmsOutputs.standingsTableName;

    // Get AWS region and account for ARN construction
    const region = cmsOutputs.region || aws.getRegionOutput().name;
    const accountId = aws.getCallerIdentityOutput().accountId;

    // Construct table ARNs
    const usersTableArn = cmsOutputs.usersTableArn;
    const activityLogsTableArn = cmsOutputs.activityLogsTableArn;
    const tournamentsTableArn = cmsOutputs.tournamentsTableArn;
    const roundsTableArn = cmsOutputs.roundsTableArn;
    const teamsTableArn = cmsOutputs.teamsTableArn;
    const matchesTableArn = cmsOutputs.matchesTableArn;
    const predictionsTableArn = cmsOutputs.predictionsTableArn;
    const scoreAggregateTableArn = cmsOutputs.scoreAggregateTableArn;
    const brandingConfigTableArn = cmsOutputs.brandingConfigTableArn;
    const standingsTableArn = cmsOutputs.standingsTableArn;
    const printedCodesTableName = cmsOutputs.printedCodesTableName;
    const printedCodesTableArn = cmsOutputs.printedCodesTableArn;

    // Reference S3 bucket from cms-quiniela outputs
    const brandingAssetsBucketName = cmsOutputs.brandingAssetsBucketName;
    const brandingAssetsBucketArn = cmsOutputs.brandingAssetsBucketArn;
    const brandingAssetsBaseUrl = cmsOutputs.brandingAssetsBaseUrl;

    const web = new sst.aws.Nextjs("QuinielaWeb", {
      permissions: [
        {
          actions: ["dynamodb:PutItem", "dynamodb:GetItem"],
          resources: [usersTableArn],
        },
        {
          actions: ["dynamodb:PutItem", "dynamodb:Query"],
          resources: [
            activityLogsTableArn,
            `${activityLogsTableArn}/index/*`,
          ],
        },
        {
          actions: [
            "dynamodb:BatchWriteItem",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:Query",
            "dynamodb:Scan",
          ],
          resources: [
            tournamentsTableArn,
            roundsTableArn,
            teamsTableArn,
            matchesTableArn,
            predictionsTableArn,
            scoreAggregateTableArn,
            brandingConfigTableArn,
            `${tournamentsTableArn}/index/*`,
            `${roundsTableArn}/index/*`,
            `${teamsTableArn}/index/*`,
            `${matchesTableArn}/index/*`,
            `${predictionsTableArn}/index/*`,
            `${scoreAggregateTableArn}/index/*`,
            `${brandingConfigTableArn}/index/*`,
            standingsTableArn,
            `${standingsTableArn}/index/*`,
            printedCodesTableArn,
            `${printedCodesTableArn}/index/*`,
          ],
        },
        {
          actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
          resources: [brandingAssetsBucketArn, `${brandingAssetsBucketArn}/*`],
        },
      ],
      environment: {
        NEXT_PUBLIC_USER_POOL_ID: userPoolId,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClientId,
        NEXT_PUBLIC_AWS_REGION: region,
        NEXT_PUBLIC_ACTIVITY_LOGS_TABLE: activityLogsTableName,
        DYNAMO_USERS_TABLE: usersTableName,
        DYNAMO_TOURNAMENTS_TABLE: tournamentsTableName,
        DYNAMO_ROUNDS_TABLE: roundsTableName,
        DYNAMO_TEAMS_TABLE: teamsTableName,
        DYNAMO_MATCHES_TABLE: matchesTableName,
        DYNAMO_PREDICTIONS_TABLE: predictionsTableName,
        DYNAMO_SCORE_AGGREGATE_TABLE: scoreAggregateTableName,
        DYNAMO_BRANDING_CONFIG_TABLE: brandingConfigTableName,
        DYNAMO_STANDINGS_TABLE: standingsTableName,
        DYNAMO_PRINTED_CODES_TABLE: printedCodesTableName,
        BRAND_ASSETS_BUCKET_NAME: brandingAssetsBucketName,
        NEXT_PUBLIC_BRAND_ASSETS_BASE_URL: brandingAssetsBaseUrl,
        NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || "false",
      },
    });

    return {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      usersTableName: usersTableName,
      activityLogsTableName: activityLogsTableName,
      tournamentsTableName: tournamentsTableName,
      roundsTableName: roundsTableName,
      teamsTableName: teamsTableName,
      matchesTableName: matchesTableName,
      predictionsTableName: predictionsTableName,
      scoreAggregateTableName: scoreAggregateTableName,
      brandingConfigTableName: brandingConfigTableName,
      standingsTableName: standingsTableName,
      printedCodesTableName: printedCodesTableName,
      brandingAssetsBucketName: brandingAssetsBucketName,
      brandingAssetsBaseUrl,
      region: region,
      url: web.url,
    };
  },
});
