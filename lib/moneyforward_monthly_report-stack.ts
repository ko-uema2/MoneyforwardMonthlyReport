import * as cdk from "aws-cdk-lib";
import { Tracing } from "aws-cdk-lib/aws-lambda";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MoneyforwardMonthlyReportStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, "MyBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const executionLambdaRole = new cdk.aws_iam.Role(
      this,
      "executionLambdaRole",
      {
        roleName: "moneyforwardMonthlyReportStack-executionRole",
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMReadOnlyAccess"
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "CloudWatchLogsFullAccess"
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonS3ReadOnlyAccess"
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AWSXRayDaemonWriteAccess"
          ),
        ],
      }
    );

    const lambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "main-handler",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        entry: "lambda/handler.ts",
        role: executionLambdaRole,
        environment: {
          POWERTOOLS_SERVICE_NAME: "moneyforwardNonthlyReport",
          POWERTOOLS_LOG_LEVEL: "DEBUG",
          NOTION_AUTH: "moneyforwardMonthlyReport-notionAuth",
          NOTION_DB_ID: "moneyforwardMonthlyReport-notionDBId",
          CATEGORY_LIST: "moneyforwardMonthlyReport-categoryList",
          DYNAMO_DB_TABLE_NAME: "moneyforwardMonthlyReport-DynamoDBTableName",
        },
        tracing: Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(30),
      }
    );

    lambda.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query",
        ],
        resources: [
          cdk.Fn.sub(
            "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/moneyforwardMonthlyReport"
          ),
        ],
      })
    );

    bucket.addEventNotification(
      cdk.aws_s3.EventType.OBJECT_CREATED,
      new LambdaDestination(lambda)
    );

    new cdk.aws_dynamodb.TableV2(this, "myDynamoDBTable", {
      tableName: "moneyforwardMonthlyReport",
      partitionKey: {
        name: "expensedDate",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billing: cdk.aws_dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }
}
