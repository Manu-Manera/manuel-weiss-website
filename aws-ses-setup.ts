#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as actions from 'aws-cdk-lib/aws-ses-actions';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class EmailSetupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Domain Configuration
    const domainName = 'manuel-weiss.ch'; // Professionelle Domain mit vollem Namen
    const emailAddress = `mail@${domainName}`;

    // 1. Route 53 Hosted Zone (falls Domain noch nicht bei AWS)
    const hostedZone = new route53.HostedZone(this, 'EmailHostedZone', {
      zoneName: domainName,
      comment: `Hosted zone for ${domainName} email setup`
    });

    // 2. SES Domain Identity
    const domainIdentity = new ses.EmailIdentity(this, 'DomainIdentity', {
      identity: ses.Identity.domain(domainName),
      mailFromDomain: `mail.${domainName}`,
    });

    // 3. SES Email Address Identity
    const emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.email(emailAddress),
    });

    // 4. S3 Bucket für eingehende E-Mails
    const emailBucket = new s3.Bucket(this, 'EmailBucket', {
      bucketName: `manu-email-storage-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [{
        id: 'DeleteOldEmails',
        expiration: cdk.Duration.days(90), // E-Mails nach 90 Tagen löschen
      }],
    });

    // 5. Lambda Function für E-Mail-Verarbeitung
    const emailProcessor = new lambda.Function(this, 'EmailProcessor', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const ses = new AWS.SES();
        const s3 = new AWS.S3();

        exports.handler = async (event) => {
          console.log('E-Mail verarbeitet:', JSON.stringify(event, null, 2));
          
          // Hier kannst du E-Mail-Logik hinzufügen:
          // - Weiterleitung an andere Adressen
          // - Automatische Antworten
          // - Spam-Filterung
          // - etc.
          
          return {
            statusCode: 200,
            body: 'E-Mail erfolgreich verarbeitet'
          };
        };
      `),
      environment: {
        EMAIL_BUCKET: emailBucket.bucketName,
        DOMAIN_NAME: domainName,
      },
    });

    // 6. IAM Permissions für Lambda
    emailBucket.grantReadWrite(emailProcessor);
    emailProcessor.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // 7. SES Receipt Rule Set
    const receiptRuleSet = new ses.ReceiptRuleSet(this, 'ReceiptRuleSet', {
      receiptRuleSetName: 'manu-email-rules',
    });

    // 8. Receipt Rule für eingehende E-Mails
    receiptRuleSet.addRule('IncomingEmailRule', {
      recipients: [domainName],
      enabled: true,
      actions: [
        new actions.S3({
          bucket: emailBucket,
          objectKeyPrefix: 'emails/',
        }),
        new actions.Lambda({
          function: emailProcessor,
        }),
      ],
    });

    // 9. DNS Records für SES
    // SPF Record
    new route53.TxtRecord(this, 'SPFRecord', {
      zone: hostedZone,
      recordName: domainName,
      values: ['v=spf1 include:amazonses.com ~all'],
    });

    // DKIM Records (werden automatisch von SES generiert)
    // Diese müssen manuell in der SES Console abgerufen werden

    // DMARC Record
    new route53.TxtRecord(this, 'DMARCRecord', {
      zone: hostedZone,
      recordName: `_dmarc.${domainName}`,
      values: ['v=DMARC1; p=quarantine; rua=mailto:dmarc@manu.ch'],
    });

    // MX Record für eingehende E-Mails
    new route53.MxRecord(this, 'MXRecord', {
      zone: hostedZone,
      recordName: domainName,
      values: [{
        priority: 10,
        hostName: `inbound-smtp.${this.region}.amazonaws.com`,
      }],
    });

    // 10. Outputs
    new cdk.CfnOutput(this, 'DomainName', {
      value: domainName,
      description: 'Domain name for email setup',
    });

    new cdk.CfnOutput(this, 'EmailAddress', {
      value: emailAddress,
      description: 'Primary email address',
    });

    new cdk.CfnOutput(this, 'EmailBucketName', {
      value: emailBucket.bucketName,
      description: 'S3 bucket for incoming emails',
    });

    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: hostedZone.hostedZoneId,
      description: 'Route 53 Hosted Zone ID',
    });

    new cdk.CfnOutput(this, 'DKIMInstructions', {
      value: 'Go to SES Console > Identities > Domain > DKIM to get DKIM tokens',
      description: 'Instructions for DKIM setup',
    });
  }
}

const app = new cdk.App();
new EmailSetupStack(app, 'ManuelWeissEmailSetup', {
  env: {
    account: '038333965110',
    region: 'eu-central-1', // Frankfurt
  },
});
