#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const website_api_stack_1 = require("../lib/website-api-stack");
const app = new cdk.App();
// Environment configuration
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};
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
cdk.Tags.of(app).add('Project', 'manuel-weiss-website');
cdk.Tags.of(app).add('Environment', 'production');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1hcGktYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2Vic2l0ZS1hcGktYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsZ0VBQTJEO0FBRTNELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLDRCQUE0QjtBQUM1QixNQUFNLEdBQUcsR0FBRztJQUNWLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtJQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxjQUFjO0NBQ3pELENBQUM7QUFFRiwyQ0FBMkM7QUFDM0Msd0NBQXdDO0FBQ3hDLDJDQUEyQztBQUMzQyxNQUFNLGVBQWUsR0FBRyxJQUFJLG1DQUFlLENBQUMsR0FBRyxFQUFFLDBCQUEwQixFQUFFO0lBQzNFLEdBQUc7SUFDSCxXQUFXLEVBQUUsNkRBQTZEO0NBQzNFLENBQUMsQ0FBQztBQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLEVBQUU7SUFDdkQsS0FBSyxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRztJQUM5QixXQUFXLEVBQUUsK0RBQStEO0NBQzdFLENBQUMsQ0FBQztBQUVILE9BQU87QUFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDeEQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNsRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFdlYnNpdGVBcGlTdGFjayB9IGZyb20gJy4uL2xpYi93ZWJzaXRlLWFwaS1zdGFjayc7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbi8vIEVudmlyb25tZW50IGNvbmZpZ3VyYXRpb25cbmNvbnN0IGVudiA9IHtcbiAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gfHwgJ2V1LWNlbnRyYWwtMSdcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFdFQlNJVEUgQVBJIFNUQUNLIChOZXRsaWZ5IE1pZ3JhdGlvbilcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNvbnN0IHdlYnNpdGVBcGlTdGFjayA9IG5ldyBXZWJzaXRlQXBpU3RhY2soYXBwLCAnbWFudWVsLXdlaXNzLXdlYnNpdGUtYXBpJywge1xuICBlbnYsXG4gIGRlc2NyaXB0aW9uOiAnV2Vic2l0ZSBBUEkgZsO8ciBtYW51ZWwtd2Vpc3MuY2ggKGVyc2V0enQgTmV0bGlmeSBGdW5jdGlvbnMpJ1xufSk7XG5cbm5ldyBjZGsuQ2ZuT3V0cHV0KHdlYnNpdGVBcGlTdGFjaywgJ1dlYnNpdGVBcGlFbmRwb2ludCcsIHtcbiAgdmFsdWU6IHdlYnNpdGVBcGlTdGFjay5hcGkudXJsLFxuICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQVBJIFVSTCAtIEVyc2V0emUgLy5uZXRsaWZ5L2Z1bmN0aW9ucy8gbWl0IGRpZXNlciBVUkwnXG59KTtcblxuLy8gVGFnc1xuY2RrLlRhZ3Mub2YoYXBwKS5hZGQoJ1Byb2plY3QnLCAnbWFudWVsLXdlaXNzLXdlYnNpdGUnKTtcbmNkay5UYWdzLm9mKGFwcCkuYWRkKCdFbnZpcm9ubWVudCcsICdwcm9kdWN0aW9uJyk7XG5jZGsuVGFncy5vZihhcHApLmFkZCgnTWFuYWdlZEJ5JywgJ0NESycpO1xuIl19