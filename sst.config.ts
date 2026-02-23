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

    const web = new sst.aws.Nextjs("QuinielaWeb", {
      link: [userPool, userPoolClient, usersTable, activityLogsTable],
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
      ],
      environment: {
        NEXT_PUBLIC_USER_POOL_ID: userPool.id,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.id,
        NEXT_PUBLIC_AWS_REGION: aws.getRegionOutput().name,
        NEXT_PUBLIC_ACTIVITY_LOGS_TABLE: activityLogsTable.name,
      },
    });

    return {
      userPoolId: userPool.id,
      userPoolClientId: userPoolClient.id,
      usersTableName: usersTable.name,
      activityLogsTableName: activityLogsTable.name,
      region: aws.getRegionOutput().name,
      url: web.url,
    };
  },
});
