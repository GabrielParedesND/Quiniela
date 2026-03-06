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
    const userPool = new sst.aws.CognitoUserPool("QuinielaUserPool", {
      usernames: ["email"],
    });

    const userPoolClient = userPool.addClient("QuinielaUserPoolClient");

    const usersTable = new sst.aws.Dynamo("UsersTable", {
      fields: {
        userId: "string",
      },
      primaryIndex: { hashKey: "userId" },
    });

    const activityLogsTable = new sst.aws.Dynamo("ActivityLogsTable", {
      fields: {
        logId: "string",
        timestamp: "number",
        userId: "string",
      },
      primaryIndex: { hashKey: "logId" },
      globalIndexes: {
        userIndex: { hashKey: "userId", rangeKey: "timestamp" },
      },
    });

    const tournamentsTable = new sst.aws.Dynamo("TournamentsTable", {
      fields: {
        tournamentId: "string",
        code: "string",
      },
      primaryIndex: { hashKey: "tournamentId" },
      globalIndexes: {
        byCode: { hashKey: "code" },
      },
    });

    const roundsTable = new sst.aws.Dynamo("RoundsTable", {
      fields: {
        roundId: "string",
        tournamentId: "string",
        number: "number",
      },
      primaryIndex: { hashKey: "roundId" },
      globalIndexes: {
        byTournamentAndNumber: { hashKey: "tournamentId", rangeKey: "number" },
      },
    });

    const teamsTable = new sst.aws.Dynamo("TeamsTable", {
      fields: {
        teamId: "number",
        tournamentId: "string",
        groupCode: "string",
      },
      primaryIndex: { hashKey: "teamId" },
      globalIndexes: {
        byTournamentAndGroup: { hashKey: "tournamentId", rangeKey: "groupCode" },
      },
    });

    const matchesTable = new sst.aws.Dynamo("MatchesTable", {
      fields: {
        matchId: "number",
        tournamentId: "string",
        roundNumber: "number",
        kickoffAt: "string",
      },
      primaryIndex: { hashKey: "matchId" },
      globalIndexes: {
        byTournamentAndKickoff: { hashKey: "tournamentId", rangeKey: "kickoffAt" },
        byTournamentAndRound: { hashKey: "tournamentId", rangeKey: "roundNumber" },
      },
    });

    const predictionsTable = new sst.aws.Dynamo("PredictionsTable", {
      fields: {
        predictionId: "string",
        tournamentId: "string",
        userId: "string",
        matchId: "number",
        updatedAt: "string",
      },
      primaryIndex: { hashKey: "predictionId" },
      globalIndexes: {
        byUserAndUpdatedAt: { hashKey: "userId", rangeKey: "updatedAt" },
        byTournamentAndUser: { hashKey: "tournamentId", rangeKey: "userId" },
        byMatch: { hashKey: "matchId", rangeKey: "updatedAt" },
      },
    });

    const scoreAggregateTable = new sst.aws.Dynamo("ScoreAggregateTable", {
      fields: {
        id: "string",
        tournamentId: "string",
        scope: "string",
        points: "number",
      },
      primaryIndex: { hashKey: "id" },
      globalIndexes: {
        byTournamentAndPoints: { hashKey: "tournamentId", rangeKey: "points" },
        byTournamentAndScope: { hashKey: "tournamentId", rangeKey: "scope" },
      },
    });

    const brandingConfigTable = new sst.aws.Dynamo("BrandingConfigTable", {
      fields: {
        brandingId: "string",
        tournamentId: "string",
      },
      primaryIndex: { hashKey: "brandingId" },
      globalIndexes: {
        byTournament: { hashKey: "tournamentId" },
      },
    });

    const brandingAssetsBucket = new sst.aws.Bucket("BrandingAssetsBucket", {
      access: "public",
    });
    const brandingAssetsBaseUrl =
      process.env.NEXT_PUBLIC_BRAND_ASSETS_BASE_URL ||
      $interpolate`https://${brandingAssetsBucket.name}.s3.${aws.getRegionOutput().name}.amazonaws.com`;

    const web = new sst.aws.Nextjs("QuinielaWeb", {
      link: [
        userPool,
        userPoolClient,
        usersTable,
        activityLogsTable,
        tournamentsTable,
        roundsTable,
        teamsTable,
        matchesTable,
        predictionsTable,
        scoreAggregateTable,
        brandingConfigTable,
        brandingAssetsBucket,
      ],
      permissions: [
        {
          actions: ["dynamodb:PutItem", "dynamodb:GetItem"],
          resources: [usersTable.arn],
        },
        {
          actions: ["dynamodb:PutItem", "dynamodb:Query"],
          resources: [
            activityLogsTable.arn,
            $interpolate`${activityLogsTable.arn}/index/*`,
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
            tournamentsTable.arn,
            roundsTable.arn,
            teamsTable.arn,
            matchesTable.arn,
            predictionsTable.arn,
            scoreAggregateTable.arn,
            brandingConfigTable.arn,
            $interpolate`${tournamentsTable.arn}/index/*`,
            $interpolate`${roundsTable.arn}/index/*`,
            $interpolate`${teamsTable.arn}/index/*`,
            $interpolate`${matchesTable.arn}/index/*`,
            $interpolate`${predictionsTable.arn}/index/*`,
            $interpolate`${scoreAggregateTable.arn}/index/*`,
            $interpolate`${brandingConfigTable.arn}/index/*`,
          ],
        },
        {
          actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
          resources: [brandingAssetsBucket.arn, $interpolate`${brandingAssetsBucket.arn}/*`],
        },
      ],
      environment: {
        NEXT_PUBLIC_USER_POOL_ID: userPool.id,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.id,
        NEXT_PUBLIC_AWS_REGION: aws.getRegionOutput().name,
        NEXT_PUBLIC_ACTIVITY_LOGS_TABLE: activityLogsTable.name,
        DYNAMO_TOURNAMENTS_TABLE: tournamentsTable.name,
        DYNAMO_ROUNDS_TABLE: roundsTable.name,
        DYNAMO_TEAMS_TABLE: teamsTable.name,
        DYNAMO_MATCHES_TABLE: matchesTable.name,
        DYNAMO_PREDICTIONS_TABLE: predictionsTable.name,
        DYNAMO_SCORE_AGGREGATE_TABLE: scoreAggregateTable.name,
        DYNAMO_BRANDING_CONFIG_TABLE: brandingConfigTable.name,
        BRAND_ASSETS_BUCKET_NAME: brandingAssetsBucket.name,
        NEXT_PUBLIC_BRAND_ASSETS_BASE_URL: brandingAssetsBaseUrl,
        NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || "false",
      },
    });

    return {
      userPoolId: userPool.id,
      userPoolClientId: userPoolClient.id,
      usersTableName: usersTable.name,
      activityLogsTableName: activityLogsTable.name,
      tournamentsTableName: tournamentsTable.name,
      roundsTableName: roundsTable.name,
      teamsTableName: teamsTable.name,
      matchesTableName: matchesTable.name,
      predictionsTableName: predictionsTable.name,
      scoreAggregateTableName: scoreAggregateTable.name,
      brandingConfigTableName: brandingConfigTable.name,
      brandingAssetsBucketName: brandingAssetsBucket.name,
      brandingAssetsBaseUrl,
      region: aws.getRegionOutput().name,
      url: web.url,
    };
  },
});
