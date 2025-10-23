import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SecurityStack extends cdk.Stack {
  public readonly kmsKey: kms.Key;
  public readonly secretsManager: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // KMS Key for encryption
    this.kmsKey = new kms.Key(this, 'AIInvestmentKMSKey', {
      description: 'KMS key for AI Investment System encryption',
      enableKeyRotation: true,
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.AccountRootPrincipal()],
            actions: ['kms:*'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('lambda.amazonaws.com')],
            actions: [
              'kms:Decrypt',
              'kms:GenerateDataKey',
              'kms:DescribeKey'
            ],
            resources: ['*']
          })
        ]
      })
    });

    // Secrets Manager for API keys
    this.secretsManager = new secretsmanager.Secret(this, 'AIInvestmentSecrets', {
      description: 'API keys and secrets for AI Investment System',
      encryptionKey: this.kmsKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          openai_api_key: 'placeholder',
          twitter_api_key: 'placeholder',
          twitter_api_secret: 'placeholder',
          twitter_bearer_token: 'placeholder',
          reddit_client_id: 'placeholder',
          reddit_client_secret: 'placeholder',
          reddit_user_agent: 'placeholder',
          news_api_key: 'placeholder',
          finnhub_api_key: 'placeholder',
          alpha_vantage_api_key: 'placeholder'
        }),
        generateStringKey: 'password'
      }
    });

    // IAM Role for Lambda functions
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
      ],
      inlinePolicies: {
        KMSAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'kms:Decrypt',
                'kms:GenerateDataKey',
                'kms:DescribeKey'
              ],
              resources: [this.kmsKey.keyArn]
            })
          ]
        }),
        SecretsManagerAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'secretsmanager:GetSecretValue',
                'secretsmanager:DescribeSecret'
              ],
              resources: [this.secretsManager.secretArn]
            })
          ]
        }),
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem',
                'dynamodb:BatchWriteItem'
              ],
              resources: ['arn:aws:dynamodb:*:*:table/ai-investment-*']
            })
          ]
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:ListBucket'
              ],
              resources: [
                'arn:aws:s3:::ai-investment-*',
                'arn:aws:s3:::ai-investment-*/*'
              ]
            })
          ]
        })
      }
    });

    // IAM Role for API Gateway
    const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        LambdaInvoke: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['lambda:InvokeFunction'],
              resources: ['arn:aws:lambda:*:*:function:ai-investment-*']
            })
          ]
        })
      }
    });

    // Outputs
    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: 'KMS Key ID'
    });

    new cdk.CfnOutput(this, 'KMSKeyArn', {
      value: this.kmsKey.keyArn,
      description: 'KMS Key ARN'
    });

    new cdk.CfnOutput(this, 'SecretsManagerArn', {
      value: this.secretsManager.secretArn,
      description: 'Secrets Manager ARN'
    });

    new cdk.CfnOutput(this, 'LambdaExecutionRoleArn', {
      value: lambdaExecutionRole.roleArn,
      description: 'Lambda Execution Role ARN'
    });

    new cdk.CfnOutput(this, 'ApiGatewayRoleArn', {
      value: apiGatewayRole.roleArn,
      description: 'API Gateway Role ARN'
    });
  }
}
