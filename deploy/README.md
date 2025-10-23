# AI Investment System - Production Deployment

This directory contains scripts and configurations for deploying the AI Investment System to production.

## Files

- `production-setup.sh` - Main deployment script
- `environment-template.env` - Environment variables template
- `health-check.js` - System health monitoring
- `README.md` - This documentation

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp environment-template.env .env
   # Edit .env with your actual values
   ```

2. **Run the deployment:**
   ```bash
   ./production-setup.sh
   ```

3. **Check system health:**
   ```bash
   node health-check.js
   ```

## Environment Variables

### Required Variables

- `AWS_REGION` - AWS region for deployment
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `OPENAI_API_KEY` - OpenAI API key
- `TWITTER_BEARER_TOKEN` - Twitter API bearer token
- `REDDIT_CLIENT_ID` - Reddit API client ID
- `REDDIT_CLIENT_SECRET` - Reddit API client secret
- `NEWS_API_KEY` - News API key

### Optional Variables

- `DYNAMODB_TABLE_PREFIX` - DynamoDB table prefix (default: ai-investment-prod)
- `S3_BUCKET_PREFIX` - S3 bucket prefix (default: ai-investment-prod)
- `LOG_LEVEL` - Logging level (default: info)
- `MAX_CONCURRENT_REQUESTS` - Max concurrent requests (default: 100)
- `RATE_LIMIT_PER_MINUTE` - Rate limit per minute (default: 1000)

## Deployment Process

The `production-setup.sh` script performs the following steps:

1. **Environment Validation** - Checks for required environment variables
2. **Build Common Package** - Builds the shared common package
3. **Build Lambda Layer** - Creates the Lambda layer with dependencies
4. **Deploy Infrastructure** - Deploys AWS CDK infrastructure
5. **Deploy Lambda Functions** - Deploys all Lambda functions
6. **Configure API Gateway** - Sets up API Gateway with OpenAPI spec
7. **Set up Monitoring** - Configures CloudWatch alarms
8. **Security Hardening** - Enables encryption and security features
9. **Performance Optimization** - Sets up auto-scaling
10. **Backup Configuration** - Configures automated backups
11. **Health Checks** - Sets up Route53 health checks

## Health Monitoring

The `health-check.js` script monitors:

- **DynamoDB** - Database connectivity and performance
- **S3** - Object storage connectivity
- **Lambda** - Function availability and status
- **OpenAI** - API connectivity and response time

## Security Considerations

- All secrets are stored in AWS Secrets Manager
- Encryption is enabled for all data at rest
- IAM roles follow the principle of least privilege
- API Gateway has rate limiting and CORS configured
- All Lambda functions have VPC configuration

## Performance Optimization

- DynamoDB auto-scaling is configured
- Lambda functions have appropriate memory and timeout settings
- S3 has lifecycle policies for cost optimization
- CloudWatch metrics and alarms are set up

## Backup and Recovery

- DynamoDB point-in-time recovery is enabled
- S3 versioning is enabled
- Automated backups are configured
- Cross-region replication is available

## Monitoring and Alerting

- CloudWatch alarms for error rates
- Performance metrics monitoring
- Cost optimization alerts
- Security event monitoring

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check that all required variables are set
   - Verify AWS credentials have proper permissions

2. **Lambda Deployment Failures**
   - Check function code and dependencies
   - Verify IAM roles and permissions

3. **API Gateway Issues**
   - Check OpenAPI specification
   - Verify CORS configuration

4. **Database Connectivity**
   - Check VPC configuration
   - Verify security group settings

### Logs and Debugging

- CloudWatch Logs: `/aws/lambda/ai-investment-*`
- API Gateway Logs: `/aws/apigateway/ai-investment-api`
- Application Logs: Check Lambda function logs

## Support

For issues and support:

1. Check the health check script output
2. Review CloudWatch logs
3. Verify environment configuration
4. Check AWS service status

## Maintenance

### Regular Tasks

- Monitor CloudWatch metrics
- Review and rotate secrets
- Update dependencies
- Check backup status
- Review security logs

### Updates

- Update Lambda functions: `./production-setup.sh`
- Update infrastructure: `cd infrastructure && cdk deploy`
- Update monitoring: Check CloudWatch alarms

## Cost Optimization

- Use DynamoDB on-demand billing
- Configure S3 lifecycle policies
- Set up Lambda concurrency limits
- Monitor and optimize API Gateway usage
- Use CloudWatch insights for query optimization
