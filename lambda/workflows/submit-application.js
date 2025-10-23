/**
 * Submit Application Lambda
 * Idempotente Bewerbungs-Einreichung mit Step Functions
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SFNClient, StartExecutionCommand } = require('@aws-sdk/client-sfn');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sfnClient = new SFNClient({ region: process.env.AWS_REGION });

const TABLE_NAMES = {
  APPLICATIONS: process.env.APPLICATIONS_TABLE || 'mw-applications',
  JOB_STATUS: process.env.JOB_STATUS_TABLE || 'mw-job-status'
};

const STEP_FUNCTION_ARN = process.env.STEP_FUNCTION_ARN;

/**
 * Lambda Handler
 */
exports.handler = async (event) => {
  console.log('🚀 Submit Application Lambda gestartet:', JSON.stringify(event, null, 2));

  try {
    const { applicationId, userId, submissionData } = JSON.parse(event.body);
    
    // Validierung
    if (!applicationId || !userId) {
      return createResponse(400, {
        error: 'applicationId und userId sind erforderlich'
      });
    }

    // Idempotency Key generieren
    const idempotencyKey = generateIdempotencyKey(applicationId, userId, submissionData);
    
    // Prüfen ob Submission bereits existiert
    const existingSubmission = await checkExistingSubmission(idempotencyKey);
    if (existingSubmission) {
      console.log('✅ Idempotente Submission gefunden:', existingSubmission);
      return createResponse(200, {
        message: 'Submission bereits verarbeitet',
        submissionId: existingSubmission.submissionId,
        status: existingSubmission.status
      });
    }

    // Submission erstellen
    const submission = await createSubmission({
      applicationId,
      userId,
      submissionData,
      idempotencyKey
    });

    // Step Function starten
    const executionArn = await startWorkflowExecution(submission);

    // Job Status erstellen
    await createJobStatus(submission, executionArn);

    console.log('✅ Submission erfolgreich erstellt:', submission.submissionId);

    return createResponse(200, {
      message: 'Submission erfolgreich erstellt',
      submissionId: submission.submissionId,
      jobId: submission.jobId,
      status: 'pending'
    });

  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Submission:', error);
    return createResponse(500, {
      error: 'Interner Serverfehler',
      details: error.message
    });
  }
};

/**
 * Idempotency Key generieren
 */
function generateIdempotencyKey(applicationId, userId, submissionData) {
  const data = {
    applicationId,
    userId,
    submissionData: JSON.stringify(submissionData, Object.keys(submissionData).sort())
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Bestehende Submission prüfen
 */
async function checkExistingSubmission(idempotencyKey) {
  try {
    const params = {
      TableName: TABLE_NAMES.APPLICATIONS,
      Key: {
        PK: `SUBMISSION#${idempotencyKey}`,
        SK: 'METADATA'
      }
    };

    const result = await docClient.send(new GetCommand(params));
    
    if (result.Item) {
      return {
        submissionId: result.Item.submissionId,
        status: result.Item.status,
        createdAt: result.Item.createdAt
      };
    }

    return null;
  } catch (error) {
    console.error('Fehler beim Prüfen der bestehenden Submission:', error);
    return null;
  }
}

/**
 * Submission erstellen
 */
async function createSubmission({ applicationId, userId, submissionData, idempotencyKey }) {
  const submissionId = uuidv4();
  const jobId = uuidv4();
  const timestamp = new Date().toISOString();

  const submission = {
    PK: `SUBMISSION#${idempotencyKey}`,
    SK: 'METADATA',
    submissionId,
    jobId,
    applicationId,
    userId,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
    submissionData,
    idempotencyKey,
    ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 Tage TTL
  };

  // Submission in DynamoDB speichern
  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.APPLICATIONS,
    Item: submission,
    ConditionExpression: 'attribute_not_exists(PK)' // Idempotency-Schutz
  }));

  return submission;
}

/**
 * Step Function Execution starten
 */
async function startWorkflowExecution(submission) {
  try {
    const params = {
      stateMachineArn: STEP_FUNCTION_ARN,
      name: `application-workflow-${submission.jobId}`,
      input: JSON.stringify({
        jobId: submission.jobId,
        applicationId: submission.applicationId,
        userId: submission.userId,
        submissionId: submission.submissionId,
        submissionData: submission.submissionData,
        timestamp: submission.createdAt
      })
    };

    const result = await sfnClient.send(new StartExecutionCommand(params));
    console.log('✅ Step Function gestartet:', result.executionArn);

    return result.executionArn;
  } catch (error) {
    console.error('❌ Fehler beim Starten der Step Function:', error);
    throw error;
  }
}

/**
 * Job Status erstellen
 */
async function createJobStatus(submission, executionArn) {
  const jobStatus = {
    PK: `JOB#${submission.jobId}`,
    SK: 'STATUS',
    jobId: submission.jobId,
    applicationId: submission.applicationId,
    userId: submission.userId,
    submissionId: submission.submissionId,
    status: 'pending',
    progress: 0,
    currentStep: 'validation',
    totalSteps: 4,
    startedAt: submission.createdAt,
    retryCount: 0,
    maxRetries: 3,
    executionArn,
    steps: [
      {
        stepId: 'validation',
        name: 'Eingabe-Validierung',
        status: 'pending',
        retryCount: 0
      },
      {
        stepId: 'analysis',
        name: 'KI-Analyse',
        status: 'pending',
        retryCount: 0
      },
      {
        stepId: 'generation',
        name: 'Dokument-Generierung',
        status: 'pending',
        retryCount: 0
      },
      {
        stepId: 'export',
        name: 'Export & Versand',
        status: 'pending',
        retryCount: 0
      }
    ],
    metadata: {
      submissionData: submission.submissionData,
      idempotencyKey: submission.idempotencyKey
    },
    ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 Tage TTL
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.JOB_STATUS,
    Item: jobStatus
  }));

  console.log('✅ Job Status erstellt:', submission.jobId);
}

/**
 * Response erstellen
 */
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
