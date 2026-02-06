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

    const web = new sst.aws.Nextjs("QuinielaWeb", {
      link: [userPool, userPoolClient, usersTable],
      permissions: [
        {
          actions: ["dynamodb:PutItem", "dynamodb:GetItem"],
          resources: [usersTable.arn],
        },
      ],
      environment: {
        NEXT_PUBLIC_USER_POOL_ID: userPool.id,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.id,
        NEXT_PUBLIC_AWS_REGION: aws.getRegionOutput().name,
      },
    });

    return {
      userPoolId: userPool.id,
      userPoolClientId: userPoolClient.id,
      usersTableName: usersTable.name,
      region: aws.getRegionOutput().name,
      url: web.url,
    };
  },
});
