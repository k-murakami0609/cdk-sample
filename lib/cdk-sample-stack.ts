import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import { Duration } from "@aws-cdk/core";
import { Bucket } from "@aws-cdk/aws-s3";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "SnapshotBucket", {
      bucketName: "cdk-snapshot-sample",
      publicReadAccess: true,
    });

    const layer = new lambda.LayerVersion(this, "ChromeLayer", {
      code: lambda.AssetCode.fromAsset("chrome_aws_lambda.zip"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    });

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_12_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "hello.handler", // file is "hello", function is "handler"
      layers: [layer],
      timeout: Duration.seconds(30),
      memorySize: 1536,
      environment: {
        HOME: "/var/task",
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    const currentVersion = hello.currentVersion;

    const development = new lambda.Alias(this, "DevelopmentAlias", {
      aliasName: "development",
      version: currentVersion,
      provisionedConcurrentExecutions: 3,
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: development,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST", "OPTIONS"],
        statusCode: 200,
      },
    });

    bucket.grantReadWrite(hello);
  }
}
