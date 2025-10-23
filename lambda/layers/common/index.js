// Common Layer for AI Investment System
// This file makes the common package available to all Lambda functions

const path = require('path');

// Add the common package to the module path
const commonPath = path.join(__dirname, 'node_modules', '@ai-investment', 'common');
require('module').globalPaths.push(commonPath);

// Re-export common modules
module.exports = {
  // Schemas
  SignalSchema: require('@ai-investment/common').SignalSchema,
  ProposalSchema: require('@ai-investment/common').ProposalSchema,
  OutcomeSchema: require('@ai-investment/common').OutcomeSchema,
  
  // Types
  Signal: require('@ai-investment/common').Signal,
  Proposal: require('@ai-investment/common').Proposal,
  Outcome: require('@ai-investment/common').Outcome,
  
  // Utilities
  Logger: require('@ai-investment/common').Logger,
  TimeUtils: require('@ai-investment/common').TimeUtils,
  HashUtils: require('@ai-investment/common').HashUtils,
  AWSHelpers: require('@ai-investment/common').AWSHelpers,
  LLMAdapter: require('@ai-investment/common').LLMAdapter,
  
  // Error classes
  ValidationError: require('@ai-investment/common').ValidationError,
  APIError: require('@ai-investment/common').APIError
};
