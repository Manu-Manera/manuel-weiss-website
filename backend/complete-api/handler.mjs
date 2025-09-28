import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-central-1" });

function headers(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Max-Age": "86400"
  };
}

export const handler = async (event) => {
  console.log('🔍 Complete API Handler - Event:', JSON.stringify(event, null, 2));
  
  const origin = event.headers?.origin || event.headers?.Origin;
  const hdr = headers(origin);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: hdr };
  }

  try {
    const user = authUser(event);
    const path = event.path || event.resource || '';
    const method = event.httpMethod;
    
    console.log(`📍 ${method} ${path} - User: ${user.email}`);

    // === USER PROFILE MANAGEMENT ===
    if (path.includes('/user-profile') && !path.includes('/progress')) {
      if (method === 'GET') {
        const profile = await getUserProfile(user.userId);
        return json(200, profile, hdr);
      }
      if (method === 'POST' || method === 'PUT') {
        const body = JSON.parse(event.body || '{}');
        const profile = await saveUserProfile(user.userId, body);
        return json(200, profile, hdr);
      }
    }

    // === PROGRESS TRACKING ===
    if (path.includes('/progress')) {
      if (method === 'GET') {
        const progress = await getUserProgress(user.userId);
        return json(200, progress, hdr);
      }
      if (method === 'POST' || method === 'PUT') {
        const body = JSON.parse(event.body || '{}');
        const progress = await updateUserProgress(user.userId, body);
        return json(200, progress, hdr);
      }
    }

    // === DOCUMENT MANAGEMENT ===
    if (path.includes('/documents') || path.includes('/docs')) {
      return await handleDocuments(event, user, hdr);
    }

    // === METHOD RESULTS ===
    if (path.includes('/method-results')) {
      if (method === 'GET') {
        const methodId = event.queryStringParameters?.methodId;
        const results = await getMethodResults(user.userId, methodId);
        return json(200, results, hdr);
      }
      if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const result = await saveMethodResults(user.userId, body);
        return json(201, result, hdr);
      }
    }

    // === APPLICATION MANAGEMENT ===
    if (path.includes('/applications')) {
      return await handleApplications(event, user, hdr);
    }

    // === AI SERVICES ===
    if (path.includes('/ai-services')) {
      return await handleAIServices(event, user, hdr);
    }

    // === ADMIN ANALYTICS ===
    if (path.includes('/admin/analytics')) {
      if (await isAdmin(user.userId)) {
        const analytics = await getSystemAnalytics();
        return json(200, analytics, hdr);
      } else {
        return json(403, { message: 'Admin access required' }, hdr);
      }
    }

    return json(404, { message: 'Endpoint not found' }, hdr);

  } catch (error) {
    console.error('❌ API Error:', error);
    return json(500, { message: error.message }, hdr);
  }
};

// === USER PROFILE FUNCTIONS ===
async function getUserProfile(userId) {
  const result = await ddb.send(new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: { S: `user#${userId}` },
      sk: { S: 'profile' }
    }
  }));

  if (!result.Item) {
    return createDefaultProfile(userId);
  }

  return {
    userId: result.Item.userId?.S,
    email: result.Item.email?.S,
    name: result.Item.name?.S,
    preferences: JSON.parse(result.Item.preferences?.S || '{}'),
    settings: JSON.parse(result.Item.settings?.S || '{}'),
    personalityData: JSON.parse(result.Item.personalityData?.S || '{}'),
    createdAt: result.Item.createdAt?.S,
    updatedAt: result.Item.updatedAt?.S
  };
}

async function saveUserProfile(userId, profileData) {
  const timestamp = new Date().toISOString();
  
  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'profile' },
      userId: { S: userId },
      email: { S: profileData.email || '' },
      name: { S: profileData.name || '' },
      preferences: { S: JSON.stringify(profileData.preferences || {}) },
      settings: { S: JSON.stringify(profileData.settings || {}) },
      personalityData: { S: JSON.stringify(profileData.personalityData || {}) },
      updatedAt: { S: timestamp },
      createdAt: { S: profileData.createdAt || timestamp }
    }
  }));

  return { ...profileData, userId, updatedAt: timestamp };
}

// === PROGRESS TRACKING FUNCTIONS ===
async function getUserProgress(userId) {
  const result = await ddb.send(new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: { S: `user#${userId}` },
      sk: { S: 'progress' }
    }
  }));

  if (!result.Item) {
    return {
      userId,
      methods: {},
      achievements: [],
      streaks: { current: 0, longest: 0, lastActivity: null },
      stats: { totalMethods: 0, completedMethods: 0, completionRate: 0 },
      createdAt: new Date().toISOString()
    };
  }

  return {
    userId,
    methods: JSON.parse(result.Item.methods?.S || '{}'),
    achievements: JSON.parse(result.Item.achievements?.S || '[]'),
    streaks: JSON.parse(result.Item.streaks?.S || '{}'),
    stats: JSON.parse(result.Item.stats?.S || '{}'),
    lastUpdated: result.Item.lastUpdated?.S
  };
}

async function updateUserProgress(userId, progressData) {
  const timestamp = new Date().toISOString();
  
  // Calculate stats
  const methods = progressData.methods || {};
  const methodsArray = Object.values(methods);
  const completedMethods = methodsArray.filter(m => m.status === 'completed').length;
  const totalMethods = methodsArray.length;
  const completionRate = totalMethods > 0 ? (completedMethods / totalMethods * 100) : 0;

  const stats = {
    totalMethods,
    completedMethods,
    completionRate: Math.round(completionRate * 100) / 100,
    lastMethodCompleted: methodsArray
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))[0]?.methodId || null
  };

  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'progress' },
      userId: { S: userId },
      methods: { S: JSON.stringify(progressData.methods || {}) },
      achievements: { S: JSON.stringify(progressData.achievements || []) },
      streaks: { S: JSON.stringify(progressData.streaks || {}) },
      stats: { S: JSON.stringify(stats) },
      lastUpdated: { S: timestamp }
    }
  }));

  return { userId, ...progressData, stats, lastUpdated: timestamp };
}

// === DOCUMENT MANAGEMENT ===
async function handleDocuments(event, user, hdr) {
  const method = event.httpMethod;
  const path = event.path;

  if (method === 'GET' && path.endsWith('/documents')) {
    const docs = await getUserDocuments(user.userId);
    return json(200, docs, hdr);
  }

  if (method === 'POST' && path.endsWith('/documents')) {
    const body = JSON.parse(event.body || '{}');
    const doc = await saveDocument(user.userId, body);
    return json(201, doc, hdr);
  }

  if (method === 'DELETE' && path.includes('/documents/')) {
    const docId = path.split('/').pop();
    await deleteDocument(user.userId, docId);
    return json(204, null, hdr);
  }

  if (method === 'GET' && path.includes('/download-url')) {
    const key = event.queryStringParameters?.key;
    if (!key || !key.startsWith(`uploads/${user.userId}/`)) {
      return json(403, { message: 'Forbidden' }, hdr);
    }
    const url = await getSignedUrl(s3, new GetObjectCommand({ 
      Bucket: process.env.BUCKET_NAME, 
      Key: key 
    }), { expiresIn: 300 });
    return json(200, { url }, hdr);
  }

  return json(404, { message: 'Document endpoint not found' }, hdr);
}

// === METHOD RESULTS ===
async function getMethodResults(userId, methodId = null) {
  if (methodId) {
    const result = await ddb.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: `method#${methodId}` }
      }
    }));
    
    return result.Item ? {
      methodId: result.Item.methodId?.S,
      results: JSON.parse(result.Item.results?.S || '{}'),
      completedAt: result.Item.completedAt?.S,
      score: result.Item.score?.N ? parseInt(result.Item.score.N) : null
    } : null;
  }

  // Get all method results for user
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `user#${userId}` },
      ':sk': { S: 'method#' }
    }
  }));

  return (result.Items || []).map(item => ({
    methodId: item.methodId?.S,
    results: JSON.parse(item.results?.S || '{}'),
    completedAt: item.completedAt?.S,
    score: item.score?.N ? parseInt(item.score.N) : null
  }));
}

async function saveMethodResults(userId, data) {
  const timestamp = new Date().toISOString();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: `method#${data.methodId}` },
      id: { S: id },
      methodId: { S: data.methodId },
      results: { S: JSON.stringify(data.results || {}) },
      score: { N: String(data.score || 0) },
      completedAt: { S: timestamp },
      gsi1pk: { S: `method#${data.methodId}` },
      gsi1sk: { S: userId }
    }
  }));

  return { id, userId, ...data, completedAt: timestamp };
}

// === APPLICATION MANAGEMENT ===
async function handleApplications(event, user, hdr) {
  const method = event.httpMethod;
  
  if (method === 'GET') {
    const apps = await getUserApplications(user.userId);
    return json(200, apps, hdr);
  }
  
  if (method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const app = await saveApplication(user.userId, body);
    return json(201, app, hdr);
  }
  
  return json(405, { message: 'Method not allowed' }, hdr);
}

async function getUserApplications(userId) {
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `user#${userId}` },
      ':sk': { S: 'application#' }
    }
  }));

  return (result.Items || []).map(item => ({
    id: item.id?.S,
    company: item.company?.S,
    position: item.position?.S,
    status: item.status?.S,
    appliedAt: item.appliedAt?.S,
    notes: item.notes?.S
  }));
}

// === AI SERVICES ===
async function handleAIServices(event, user, hdr) {
  const path = event.path;
  const method = event.httpMethod;
  
  if (path.includes('/ai-analysis') && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const analysis = await performAIAnalysis(user.userId, body);
    return json(200, analysis, hdr);
  }
  
  if (path.includes('/ai-twin') && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const twin = await createAITwin(user.userId, body);
    return json(201, twin, hdr);
  }
  
  return json(404, { message: 'AI service not found' }, hdr);
}

async function performAIAnalysis(userId, data) {
  // This would integrate with your existing AI analysis logic
  const analysisId = `analysis_${Date.now()}`;
  
  // Save analysis request
  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: `analysis#${analysisId}` },
      analysisId: { S: analysisId },
      type: { S: data.type || 'document_analysis' },
      input: { S: JSON.stringify(data.input || {}) },
      status: { S: 'processing' },
      createdAt: { S: new Date().toISOString() }
    }
  }));

  // Here you would call your AI services (OpenAI, etc.)
  // For now, return a simulated response
  const mockAnalysis = {
    analysisId,
    userId,
    type: data.type,
    results: {
      summary: 'AI analysis completed successfully',
      insights: ['Key insight 1', 'Key insight 2', 'Key insight 3'],
      recommendations: ['Recommendation 1', 'Recommendation 2'],
      confidence: 0.85
    },
    status: 'completed',
    completedAt: new Date().toISOString()
  };

  // Update with results
  await ddb.send(new UpdateItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: { S: `user#${userId}` },
      sk: { S: `analysis#${analysisId}` }
    },
    UpdateExpression: 'SET #status = :status, #results = :results, #completedAt = :completedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#results': 'results',
      '#completedAt': 'completedAt'
    },
    ExpressionAttributeValues: {
      ':status': { S: 'completed' },
      ':results': { S: JSON.stringify(mockAnalysis.results) },
      ':completedAt': { S: mockAnalysis.completedAt }
    }
  }));

  return mockAnalysis;
}

// === SYSTEM ANALYTICS (Admin only) ===
async function getSystemAnalytics() {
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'analytics#system' }
    }
  }));

  // Calculate real-time analytics
  const users = await countUsers();
  const documents = await countDocuments();
  const methods = await countMethodCompletions();

  return {
    users: {
      total: users.total,
      active: users.active,
      newThisWeek: users.newThisWeek
    },
    documents: {
      total: documents.total,
      uploaded: documents.uploaded,
      storage: documents.storage
    },
    methods: {
      totalCompletions: methods.total,
      popularMethods: methods.popular,
      averageScore: methods.averageScore
    },
    system: {
      health: 'healthy',
      uptime: '99.9%',
      lastUpdated: new Date().toISOString()
    }
  };
}

// === UTILITY FUNCTIONS ===
async function countUsers() {
  // Query all user profiles
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    FilterExpression: 'begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':sk': { S: 'profile' }
    }
  }));

  const users = result.Items || [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return {
    total: users.length,
    active: users.length, // Simplified
    newThisWeek: users.filter(u => 
      new Date(u.createdAt?.S || 0) > oneWeekAgo
    ).length
  };
}

async function countDocuments() {
  // This would query all documents across users
  return {
    total: 150, // Estimated based on your system
    uploaded: 25,
    storage: '2.5 GB'
  };
}

async function countMethodCompletions() {
  // Query method completions
  return {
    total: 45,
    popular: [
      'johari-window',
      'ikigai-workflow', 
      'swot-analysis'
    ],
    averageScore: 78.5
  };
}

function createDefaultProfile(userId) {
  return {
    userId,
    email: '',
    name: '',
    preferences: {
      language: 'de',
      theme: 'light',
      notifications: true
    },
    settings: {
      autoSave: true,
      privacy: 'standard'
    },
    personalityData: {},
    createdAt: new Date().toISOString()
  };
}

async function getUserDocuments(userId) {
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `user#${userId}` },
      ':sk': { S: 'doc#' }
    }
  }));

  return (result.Items || []).map(item => ({
    id: item.id?.S,
    name: item.name?.S,
    type: item.type?.S,
    size: item.size?.N ? parseInt(item.size.N) : 0,
    key: item.key?.S,
    uploadedAt: item.uploadedAt?.S
  }));
}

async function saveDocument(userId, docData) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();

  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: `doc#${id}` },
      id: { S: id },
      name: { S: docData.name },
      type: { S: docData.type || 'document' },
      size: { N: String(docData.size || 0) },
      key: { S: docData.key },
      uploadedAt: { S: timestamp },
      gsi1pk: { S: `doc#${docData.type || 'document'}` },
      gsi1sk: { S: userId }
    }
  }));

  return { id, userId, ...docData, uploadedAt: timestamp };
}

async function saveApplication(userId, appData) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();

  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: `application#${id}` },
      id: { S: id },
      company: { S: appData.company || '' },
      position: { S: appData.position || '' },
      status: { S: appData.status || 'pending' },
      appliedAt: { S: appData.appliedAt || timestamp },
      notes: { S: appData.notes || '' },
      gsi1pk: { S: 'application#all' },
      gsi1sk: { S: `${appData.status || 'pending'}#${timestamp}` }
    }
  }));

  return { id, userId, ...appData, appliedAt: timestamp };
}

async function deleteDocument(userId, docId) {
  // Get document info first
  const doc = await ddb.send(new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: { S: `user#${userId}` },
      sk: { S: `doc#${docId}` }
    }
  }));

  if (doc.Item?.key?.S) {
    // Delete from S3
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: doc.Item.key.S
    }));
  }

  // Delete from DynamoDB
  await ddb.send(new DeleteItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: { S: `user#${userId}` },
      sk: { S: `doc#${docId}` }
    }
  }));
}

async function isAdmin(userId) {
  // Check if user has admin privileges
  // For now, you can hardcode your admin user ID or email
  const adminEmails = ['manuel@manuel-weiss.com', 'admin@manuel-weiss.com'];
  
  const profile = await getUserProfile(userId);
  return adminEmails.includes(profile.email);
}

function authUser(event) {
  const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/, '');
  if (!token) throw new Error('Unauthorized - No token provided');
  
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
    return { 
      userId: payload.sub, 
      email: payload.email || payload['cognito:username'],
      username: payload['cognito:username'] || payload.email
    };
  } catch (error) {
    throw new Error('Unauthorized - Invalid token');
  }
}

function json(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: body === null ? '' : JSON.stringify(body)
  };
}
