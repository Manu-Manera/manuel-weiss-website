#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const data_stack_1 = require("../lib/data-stack");
const api_stack_1 = require("../lib/api-stack");
const auth_stack_1 = require("../lib/auth-stack");
const observability_stack_1 = require("../lib/observability-stack");
const security_stack_1 = require("../lib/security-stack");
const website_api_stack_1 = require("../lib/website-api-stack");
const websocket_stack_1 = require("../lib/websocket-stack");
const app = new cdk.App();
// Environment configuration
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};
// Get context values
const projectName = app.node.tryGetContext('projectName') || 'ai-investment';
const environment = app.node.tryGetContext('environment') || 'dev';
// Default: Wir deployen in diesem Repo häufig nur die Website-API (Netlify-Migration).
// Die AI-Investment-Staples können optional via CDK Context aktiviert werden:
//   npx cdk deploy --context enableAiStacks=true
const enableAiStacks = app.node.tryGetContext('enableAiStacks') === 'true';
if (enableAiStacks) {
    // Create stacks
    const securityStack = new security_stack_1.SecurityStack(app, `${projectName}-security-${environment}`, {
        env,
        description: 'Security and KMS keys for AI Investment System'
    });
    const dataStack = new data_stack_1.DataStack(app, `${projectName}-data-${environment}`, {
        env,
        description: 'Data storage for AI Investment System',
        kmsKey: securityStack.kmsKey
    });
    const authStack = new auth_stack_1.AuthStack(app, `${projectName}-auth-${environment}`, {
        env,
        description: 'Authentication and authorization for AI Investment System'
    });
    // ComputeStack temporär auskommentiert wegen fehlendem Asset (nicht Teil der Website-Migration)
    // const computeStack = new ComputeStack(app, `${projectName}-compute-${environment}`, {
    //   env,
    //   description: 'Compute resources for AI Investment System',
    //   dataStack,
    //   authStack,
    //   kmsKey: securityStack.kmsKey
    // });
    const computeStack = null; // Temporär deaktiviert
    // Diese Stacks hängen an ComputeStack. Wenn ComputeStack deaktiviert ist, dürfen wir sie nicht instanziieren.
    let apiStack = null;
    let observabilityStack = null;
    if (computeStack) {
        apiStack = new api_stack_1.ApiStack(app, `${projectName}-api-${environment}`, {
            env,
            description: 'API Gateway for AI Investment System',
            computeStack,
            authStack
        });
        observabilityStack = new observability_stack_1.ObservabilityStack(app, `${projectName}-observability-${environment}`, {
            env,
            description: 'Monitoring and observability for AI Investment System',
            computeStack,
            apiStack
        });
    }
    // Add dependencies
    dataStack.addDependency(securityStack);
    // computeStack.addDependency(dataStack);
    // computeStack.addDependency(authStack);
    // computeStack.addDependency(securityStack);
    // apiStack.addDependency(computeStack);
    if (apiStack) {
        apiStack.addDependency(authStack);
    }
    // observabilityStack.addDependency(computeStack);
    if (observabilityStack && apiStack) {
        observabilityStack.addDependency(apiStack);
    }
    // Outputs (diese Outputs existieren bereits in den Stacks selbst; hier nur bei Bedarf ergänzen)
    if (apiStack) {
        new cdk.CfnOutput(apiStack, 'ApiGatewayUrl', {
            value: apiStack.apiGateway.url,
            description: 'API Gateway URL'
        });
    }
    // WebSocket Stack für Echtzeit-Multiplayer-Spiele
    new websocket_stack_1.WebSocketStack(app, `${projectName}-websocket-${environment}`, {
        env,
        environment,
        description: 'WebSocket API für Multiplayer-Spiele'
    });
    if (observabilityStack) {
        new cdk.CfnOutput(observabilityStack, 'DashboardUrl', {
            value: `https://console.aws.amazon.com/cloudwatch/home?region=${env.region}#dashboards:name=${observabilityStack.dashboard.dashboardName}`,
            description: 'CloudWatch Dashboard URL'
        });
    }
}
// ========================================
// WEBSITE API STACK (Netlify Migration)
// ========================================
const websiteApiStack = new website_api_stack_1.WebsiteApiStack(app, 'manuel-weiss-website-api', {
    env,
    description: 'Website API für manuel-weiss.ch (ersetzt Netlify Functions)'
});
new cdk.CfnOutput(websiteApiStack, 'WebsiteApiEndpoint', {
    value: websiteApiStack.api.url,
    description: 'Website API URL - Ersetze /.netlify/functions/ mit dieser URL'
});
// Tags
cdk.Tags.of(app).add('Project', projectName);
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');
cdk.Tags.of(app).add('CostCenter', 'AI-Investment');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsa0RBQThDO0FBQzlDLGdEQUE0QztBQUU1QyxrREFBOEM7QUFDOUMsb0VBQWdFO0FBQ2hFLDBEQUFzRDtBQUN0RCxnRUFBMkQ7QUFDM0QsNERBQXdEO0FBRXhELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLDRCQUE0QjtBQUM1QixNQUFNLEdBQUcsR0FBRztJQUNWLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtJQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxjQUFjO0NBQ3pELENBQUM7QUFFRixxQkFBcUI7QUFDckIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksZUFBZSxDQUFDO0FBQzdFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUVuRSx1RkFBdUY7QUFDdkYsOEVBQThFO0FBQzlFLGlEQUFpRDtBQUNqRCxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLE1BQU0sQ0FBQztBQUUzRSxJQUFJLGNBQWMsRUFBRTtJQUNsQixnQkFBZ0I7SUFDaEIsTUFBTSxhQUFhLEdBQUcsSUFBSSw4QkFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsYUFBYSxXQUFXLEVBQUUsRUFBRTtRQUNyRixHQUFHO1FBQ0gsV0FBVyxFQUFFLGdEQUFnRDtLQUM5RCxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxJQUFJLHNCQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBVyxTQUFT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QU87QUFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzdDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDakQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6QyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IERhdGFTdGFjayB9IGZyb20gJy4uL2xpYi9kYXRhLXN0YWNrJztcbmltcG9ydCB7IEFwaVN0YWNrIH0gZnJvbSAnLi4vbGliL2FwaS1zdGFjayc7XG5pbXBvcnQgeyBDb21wdXRlU3RhY2sgfSBmcm9tICcuLi9saWIvY29tcHV0ZS1zdGFjayc7XG5pbXBvcnQgeyBBdXRoU3RhY2sgfSBmcm9tICcuLi9saWIvYXV0aC1zdGFjayc7XG5pbXBvcnQgeyBPYnNlcnZhYmlsaXR5U3RhY2sgfSBmcm9tICcuLi9saWIvb2JzZXJ2YWJpbGl0eS1zdGFjayc7XG5pbXBvcnQgeyBTZWN1cml0eVN0YWNrIH0gZnJvbSAnLi4vbGliL3NlY3VyaXR5LXN0YWNrJztcbmltcG9ydCB7IFdlYnNpdGVBcGlTdGFjayB9IGZyb20gJy4uL2xpYi93ZWJzaXRlLWFwaS1zdGFjayc7XG5pbXBvcnQgeyBXZWJTb2NrZXRTdGFjayB9IGZyb20gJy4uL2xpYi93ZWJzb2NrZXQtc3RhY2snO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG4vLyBFbnZpcm9ubWVudCBjb25maWd1cmF0aW9uXG5jb25zdCBlbnYgPSB7XG4gIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OIHx8ICdldS1jZW50cmFsLTEnXG59O1xuXG4vLyBHZXQgY29udGV4dCB2YWx1ZXNcbmNvbnN0IHByb2plY3ROYW1lID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgncHJvamVjdE5hbWUnKSB8fCAnYWktaW52ZXN0bWVudCc7XG5jb25zdCBlbnZpcm9ubWVudCA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ2Vudmlyb25tZW50JykgfHwgJ2Rldic7XG5cbi8vIERlZmF1bHQ6IFdpciBkZXBsb3llbiBpbiBkaWVzZW0gUmVwbyBow6R1ZmlnIG51ciBkaWUgV2Vic2l0ZS1BUEkgKE5ldGxpZnktTWlncmF0aW9uKS5cbi8vIERpZSBBSS1JbnZlc3RtZW50LVN0YXBsZXMga8O2bm5lbiBvcHRpb25hbCB2aWEgQ0RLIENvbnRleHQgYWt0aXZpZXJ0IHdlcmRlbjpcbi8vICAgbnB4IGNkayBkZXBsb3kgLS1jb250ZXh0IGVuYWJsZUFpU3RhY2tzPXRydWVcbmNvbnN0IGVuYWJsZUFpU3RhY2tzID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgnZW5hYmxlQWlTdGFja3MnKSA9PT0gJ3RydWUnO1xuXG5pZiAoZW5hYmxlQWlTdGFja3MpIHtcbiAgLy8gQ3JlYXRlIHN0YWNrc1xuICBjb25zdCBzZWN1cml0eVN0YWNrID0gbmV3IFNlY3VyaXR5U3RhY2soYXBwLCBgJHtwcm9qZWN0TmFtZX0tc2VjdXJpdHktJHtlbnZpcm9ubWVudH1gLCB7XG4gICAgZW52LFxuICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgYW5kIEtNUyBrZXlzIGZvciBBSSBJbnZlc3RtZW50IFN5c3RlbSdcbiAgfSk7XG5cbiAgY29uc3QgZGF0YVN0YWNrID0gbmV3IERhdGFTdGFjayhhcHAsIGAke3Byb2plY3ROYW1lfS1kYXRhLSR7ZW52aXJvbm1lbnR9YCwge1xuICAgIGVudixcbiAgICBkZXNjcmlwdGlvbjogJ0RhdGEgc3RvcmFnZSBmb3IgQUkgSW52ZXN0bWVudCBTeXN0ZW0nLFxuICAgIGttc0tleTogc2VjdXJpdHlTdGFjay5rbXNLZXlcbiAgfSk7XG5cbiAgY29uc3QgYXV0aFN0YWNrID0gbmV3IEF1dGhTdGFjayhhcHAsIGAke3Byb2plY3ROYW1lfS1hdXRoLSR7ZW52aXJvbm1lbnR9YCwge1xuICAgIGVudixcbiAgICBkZXNjcmlwdGlvbjogJ0F1dGhlbnRpY2F0aW9uIGFuZCBhdXRob3JpemF0aW9uIGZvciBBSSBJbnZlc3RtZW50IFN5c3RlbSdcbiAgfSk7XG5cbi8vIENvbXB1dGVTdGFjayB0ZW1wb3LDpHIgYXVza29tbWVudGllcnQgd2VnZW4gZmVobGVuZGVtIEFzc2V0IChuaWNodCBUZWlsIGRlciBXZWJzaXRlLU1pZ3JhdGlvbilcbi8vIGNvbnN0IGNvbXB1dGVTdGFjayA9IG5ldyBDb21wdXRlU3RhY2soYXBwLCBgJHtwcm9qZWN0TmFtZX0tY29tcHV0ZS0ke2Vudmlyb25tZW50fWAsIHtcbi8vICAgZW52LFxuLy8gICBkZXNjcmlwdGlvbjogJ0NvbXB1dGUgcmVzb3VyY2VzIGZvciBBSSBJbnZlc3RtZW50IFN5c3RlbScsXG4vLyAgIGRhdGFTdGFjayxcbi8vICAgYXV0aFN0YWNrLFxuLy8gICBrbXNLZXk6IHNlY3VyaXR5U3RhY2sua21zS2V5XG4vLyB9KTtcbiAgY29uc3QgY29tcHV0ZVN0YWNrOiBDb21wdXRlU3RhY2sgfCBudWxsID0gbnVsbDsgLy8gVGVtcG9yw6RyIGRlYWt0aXZpZXJ0XG5cbiAgLy8gRGllc2UgU3RhY2tzIGjDpG5nZW4gYW4gQ29tcHV0ZVN0YWNrLiBXZW5uIENvbXB1dGVTdGFjayBkZWFrdGl2aWVydCBpc3QsIGTDvHJmZW4gd2lyIHNpZSBuaWNodCBpbnN0YW56aWllcmVuLlxuICBsZXQgYXBpU3RhY2s6IEFwaVN0YWNrIHwgbnVsbCA9IG51bGw7XG4gIGxldCBvYnNlcnZhYmlsaXR5U3RhY2s6IE9ic2VydmFiaWxpdHlTdGFjayB8IG51bGwgPSBudWxsO1xuXG4gIGlmIChjb21wdXRlU3RhY2spIHtcbiAgICBhcGlTdGFjayA9IG5ldyBBcGlTdGFjayhhcHAsIGAke3Byb2plY3ROYW1lfS1hcGktJHtlbnZpcm9ubWVudH1gLCB7XG4gICAgICBlbnYsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IGZvciBBSSBJbnZlc3RtZW50IFN5c3RlbScsXG4gICAgICBjb21wdXRlU3RhY2ssXG4gICAgICBhdXRoU3RhY2tcbiAgICB9KTtcblxuICAgIG9ic2VydmFiaWxpdHlTdGFjayA9IG5ldyBPYnNlcnZhYmlsaXR5U3RhY2soYXBwLCBgJHtwcm9qZWN0TmFtZX0tb2JzZXJ2YWJpbGl0eS0ke2Vudmlyb25tZW50fWAsIHtcbiAgICAgIGVudixcbiAgICAgIGRlc2NyaXB0aW9uOiAnTW9uaXRvcmluZyBhbmQgb2JzZXJ2YWJpbGl0eSBmb3IgQUkgSW52ZXN0bWVudCBTeXN0ZW0nLFxuICAgICAgY29tcHV0ZVN0YWNrLFxuICAgICAgYXBpU3RhY2tcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEFkZCBkZXBlbmRlbmNpZXNcbiAgZGF0YVN0YWNrLmFkZERlcGVuZGVuY3koc2VjdXJpdHlTdGFjayk7XG4gIC8vIGNvbXB1dGVTdGFjay5hZGREZXBlbmRlbmN5KGRhdGFTdGFjayk7XG4gIC8vIGNvbXB1dGVTdGFjay5hZGREZXBlbmRlbmN5KGF1dGhTdGFjayk7XG4gIC8vIGNvbXB1dGVTdGFjay5hZGREZXBlbmRlbmN5KHNlY3VyaXR5U3RhY2spO1xuICAvLyBhcGlTdGFjay5hZGREZXBlbmRlbmN5KGNvbXB1dGVTdGFjayk7XG4gIGlmIChhcGlTdGFjaykge1xuICAgIGFwaVN0YWNrLmFkZERlcGVuZGVuY3koYXV0aFN0YWNrKTtcbiAgfVxuICAvLyBvYnNlcnZhYmlsaXR5U3RhY2suYWRkRGVwZW5kZW5jeShjb21wdXRlU3RhY2spO1xuICBpZiAob2JzZXJ2YWJpbGl0eVN0YWNrICYmIGFwaVN0YWNrKSB7XG4gICAgb2JzZXJ2YWJpbGl0eVN0YWNrLmFkZERlcGVuZGVuY3koYXBpU3RhY2spO1xuICB9XG5cbiAgLy8gT3V0cHV0cyAoZGllc2UgT3V0cHV0cyBleGlzdGllcmVuIGJlcmVpdHMgaW4gZGVuIFN0YWNrcyBzZWxic3Q7IGhpZXIgbnVyIGJlaSBCZWRhcmYgZXJnw6RuemVuKVxuICBpZiAoYXBpU3RhY2spIHtcbiAgICBuZXcgY2RrLkNmbk91dHB1dChhcGlTdGFjaywgJ0FwaUdhdGV3YXlVcmwnLCB7XG4gICAgICB2YWx1ZTogYXBpU3RhY2suYXBpR2F0ZXdheS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IFVSTCdcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFdlYlNvY2tldCBTdGFjayBmw7xyIEVjaHR6ZWl0LU11bHRpcGxheWVyLVNwaWVsZVxuICBuZXcgV2ViU29ja2V0U3RhY2soYXBwLCBgJHtwcm9qZWN0TmFtZX0td2Vic29ja2V0LSR7ZW52aXJvbm1lbnR9YCwge1xuICAgIGVudixcbiAgICBlbnZpcm9ubWVudCxcbiAgICBkZXNjcmlwdGlvbjogJ1dlYlNvY2tldCBBUEkgZsO8ciBNdWx0aXBsYXllci1TcGllbGUnXG4gIH0pO1xuXG4gIGlmIChvYnNlcnZhYmlsaXR5U3RhY2spIHtcbiAgICBuZXcgY2RrLkNmbk91dHB1dChvYnNlcnZhYmlsaXR5U3RhY2ssICdEYXNoYm9hcmRVcmwnLCB7XG4gICAgICB2YWx1ZTogYGh0dHBzOi8vY29uc29sZS5hd3MuYW1hem9uLmNvbS9jbG91ZHdhdGNoL2hvbWU/cmVnaW9uPSR7ZW52LnJlZ2lvbn0jZGFzaGJvYXJkczpuYW1lPSR7b2JzZXJ2YWJpbGl0eVN0YWNrLmRhc2hib2FyZC5kYXNoYm9hcmROYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkV2F0Y2ggRGFzaGJvYXJkIFVSTCdcbiAgICB9KTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBXRUJTSVRFIEFQSSBTVEFDSyAoTmV0bGlmeSBNaWdyYXRpb24pXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdCB3ZWJzaXRlQXBpU3RhY2sgPSBuZXcgV2Vic2l0ZUFwaVN0YWNrKGFwcCwgJ21hbnVlbC13ZWlzcy13ZWJzaXRlLWFwaScsIHtcbiAgZW52LFxuICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQVBJIGbDvHIgbWFudWVsLXdlaXNzLmNoIChlcnNldHp0IE5ldGxpZnkgRnVuY3Rpb25zKSdcbn0pO1xuXG5uZXcgY2RrLkNmbk91dHB1dCh3ZWJzaXRlQXBpU3RhY2ssICdXZWJzaXRlQXBpRW5kcG9pbnQnLCB7XG4gIHZhbHVlOiB3ZWJzaXRlQXBpU3RhY2suYXBpLnVybCxcbiAgZGVzY3JpcHRpb246ICdXZWJzaXRlIEFQSSBVUkwgLSBFcnNldHplIC8ubmV0bGlmeS9mdW5jdGlvbnMvIG1pdCBkaWVzZXIgVVJMJ1xufSk7XG5cbi8vIFRhZ3NcbmNkay5UYWdzLm9mKGFwcCkuYWRkKCdQcm9qZWN0JywgcHJvamVjdE5hbWUpO1xuY2RrLlRhZ3Mub2YoYXBwKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuY2RrLlRhZ3Mub2YoYXBwKS5hZGQoJ01hbmFnZWRCeScsICdDREsnKTtcbmNkay5UYWdzLm9mKGFwcCkuYWRkKCdDb3N0Q2VudGVyJywgJ0FJLUludmVzdG1lbnQnKTtcbiJdfQ==