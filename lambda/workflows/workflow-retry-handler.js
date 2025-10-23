/**
 * Workflow Retry Handler Lambda
 * Behandelt Retries für fehlgeschlagene Workflow-Schritte
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SFNClient, StartExecutionCommand, StopExecutionCommand } = require('@aws-sdk/client-sfn');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sfnClient = new SFNClient({ region: process.env.AWS_REGION });

const TABLE_NAMES = {
  JOB_STATUS: process.env.JOB_STATUS_TABLE || 'mw-job-status',
  APPLICATIONS: process.env.APPLICATIONS_TABLE || 'mw-applications'
};

const STEP_FUNCTION_ARN = process.env.STEP_FUNCTION_ARN;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // 1s, 3s, 5s

/**
 * Lambda Handler
 */
exports.handler = async (event) => {
  console.log('🔄 Workflow Retry Handler gestartet:', JSON.stringify(event, null, 2));

  try {
    const { jobId, stepId, error, retryCount } = event;
    
    // Job Status laden
    const jobStatus = await getJobStatus(jobId);
    if (!jobStatus) {
      throw new Error(`Job ${jobId} nicht gefunden`);
    }

    // Retry-Logik prüfen
    const canRetry = await canRetryStep(jobStatus, stepId, retryCount);
    if (!canRetry) {
      console.log('❌ Max Retries erreicht für Job:', jobId, 'Step:', stepId);
      await markJobAsFailed(jobId, stepId, error);
      return;
    }

    // Retry durchführen
    await performRetry(jobStatus, stepId, retryCount);

    console.log('✅ Retry erfolgreich für Job:', jobId, 'Step:', stepId);

  } catch (error) {
    console.error('❌ Fehler beim Retry:', error);
    throw error;
  }
};

/**
 * Job Status laden
 */
async function getJobStatus(jobId) {
  try {
    const params = {
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: 'STATUS'
      }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item;
  } catch (error) {
    console.error('Fehler beim Laden des Job Status:', error);
    throw error;
  }
}

/**
 * Prüfen ob Step retrybar ist
 */
async function canRetryStep(jobStatus, stepId, currentRetryCount) {
  // Max Retries prüfen
  if (currentRetryCount >= MAX_RETRIES) {
    console.log(`Max Retries (${MAX_RETRIES}) erreicht für Step ${stepId}`);
    return false;
  }

  // Job-Status prüfen
  if (jobStatus.status === 'cancelled' || jobStatus.status === 'completed') {
    console.log(`Job ${jobStatus.jobId} ist bereits ${jobStatus.status}`);
    return false;
  }

  // Step-Status prüfen
  const step = jobStatus.steps.find(s => s.stepId === stepId);
  if (!step) {
    console.log(`Step ${stepId} nicht gefunden`);
    return false;
  }

  if (step.status === 'completed') {
    console.log(`Step ${stepId} bereits abgeschlossen`);
    return false;
  }

  return true;
}

/**
 * Retry durchführen
 */
async function performRetry(jobStatus, stepId, retryCount) {
  const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
  
  console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES} für Step ${stepId} in ${delay}ms`);

  // Retry-Count aktualisieren
  await updateRetryCount(jobStatus.jobId, stepId, retryCount + 1);

  // Delay vor Retry
  await new Promise(resolve => setTimeout(resolve, delay));

  // Step Function erneut starten
  await restartStepFunction(jobStatus, stepId);

  // Job Status aktualisieren
  await updateJobStatus(jobStatus.jobId, {
    status: 'running',
    currentStep: stepId,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Retry-Count aktualisieren
 */
async function updateRetryCount(jobId, stepId, retryCount) {
  try {
    const params = {
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: 'STATUS'
      },
      UpdateExpression: 'SET steps = list_append(if_not_exists(steps, :empty_list), :empty_list)',
      ExpressionAttributeValues: {
        ':empty_list': []
      }
    };

    // Step in der Liste finden und aktualisieren
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: 'STATUS'
      }
    }));

    if (result.Item) {
      const steps = result.Item.steps.map(step => {
        if (step.stepId === stepId) {
          return { ...step, retryCount, status: 'running' };
        }
        return step;
      });

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAMES.JOB_STATUS,
        Key: {
          PK: `JOB#${jobId}`,
          SK: 'STATUS'
        },
        UpdateExpression: 'SET steps = :steps, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':steps': steps,
          ':updatedAt': new Date().toISOString()
        }
      }));
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Retry-Counts:', error);
    throw error;
  }
}

/**
 * Step Function erneut starten
 */
async function restartStepFunction(jobStatus, stepId) {
  try {
    // Bestehende Execution stoppen falls noch aktiv
    if (jobStatus.executionArn) {
      try {
        await sfnClient.send(new StopExecutionCommand({
          executionArn: jobStatus.executionArn,
          cause: 'Retry requested'
        }));
      } catch (error) {
        console.log('Execution bereits gestoppt oder nicht gefunden');
      }
    }

    // Neue Execution starten
    const params = {
      stateMachineArn: STEP_FUNCTION_ARN,
      name: `application-workflow-retry-${jobStatus.jobId}-${Date.now()}`,
      input: JSON.stringify({
        jobId: jobStatus.jobId,
        applicationId: jobStatus.applicationId,
        userId: jobStatus.userId,
        submissionId: jobStatus.submissionId,
        retryStep: stepId,
        retryCount: jobStatus.steps.find(s => s.stepId === stepId)?.retryCount || 0,
        timestamp: new Date().toISOString()
      })
    };

    const result = await sfnClient.send(new StartExecutionCommand(params));
    
    // Execution ARN aktualisieren
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobStatus.jobId}`,
        SK: 'STATUS'
      },
      UpdateExpression: 'SET executionArn = :executionArn, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':executionArn': result.executionArn,
        ':updatedAt': new Date().toISOString()
      }
    }));

    console.log('✅ Step Function neu gestartet:', result.executionArn);
  } catch (error) {
    console.error('Fehler beim Neustarten der Step Function:', error);
    throw error;
  }
}

/**
 * Job Status aktualisieren
 */
async function updateJobStatus(jobId, updates) {
  try {
    const updateExpression = Object.keys(updates)
      .map(key => `${key} = :${key}`)
      .join(', ');

    const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
      acc[`:${key}`] = updates[key];
      return acc;
    }, {});

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: 'STATUS'
      },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeValues: expressionAttributeValues
    }));
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Job Status:', error);
    throw error;
  }
}

/**
 * Job als fehlgeschlagen markieren
 */
async function markJobAsFailed(jobId, stepId, error) {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: 'STATUS'
      },
      UpdateExpression: 'SET #status = :status, error = :error, completedAt = :completedAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'failed',
        ':error': error,
        ':completedAt': new Date().toISOString(),
        ':updatedAt': new Date().toISOString()
      }
    }));

    // Step als fehlgeschlagen markieren
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAMES.JOB_STATUS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: 'STATUS'
      }
    }));

    if (result.Item) {
      const steps = result.Item.steps.map(step => {
        if (step.stepId === stepId) {
          return { ...step, status: 'failed', error };
        }
        return step;
      });

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAMES.JOB_STATUS,
        Key: {
          PK: `JOB#${jobId}`,
          SK: 'STATUS'
        },
        UpdateExpression: 'SET steps = :steps',
        ExpressionAttributeValues: {
          ':steps': steps
        }
      }));
    }

    console.log('❌ Job als fehlgeschlagen markiert:', jobId);
  } catch (error) {
    console.error('Fehler beim Markieren des Jobs als fehlgeschlagen:', error);
    throw error;
  }
}
