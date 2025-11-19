import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

let ddb = null;
function getDynamoDB() {
  if (!ddb) {
    ddb = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
  }
  return ddb;
}

function headers(origin) {
  return {
    "Access-Control-Allow-Origin": origin || process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}

export const handler = async (event) => {
  try {
    const origin = event.headers?.origin || event.headers?.Origin || '*';
    const hdr = headers(origin);
    
    // Handle CORS preflight - check all possible ways OPTIONS can appear
    const method = event.httpMethod || event.requestContext?.http?.method || event.requestContext?.httpMethod || '';
    if (method === 'OPTIONS' || method === 'options') {
      return { 
        statusCode: 200, 
        headers: hdr, 
        body: '' 
      };
    }

    const route = event.resource || event.path || event.requestContext?.path || '';
    const httpMethod = event.httpMethod || event.requestContext?.http?.method || '';
    const isProfileRoute = route.includes('/profile') && !route.includes('/progress') && !route.includes('/upload');
    
    // GET /profile - Load user profile
    if (httpMethod === 'GET' && isProfileRoute) {
      const user = authUser(event);
      const profile = await getUserProfile(user.userId);
      return json(200, profile, hdr);
    }

    // POST /profile - Create/Update user profile
    if (httpMethod === 'POST' && isProfileRoute) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const profile = await saveUserProfile(user.userId, body);
      return json(200, profile, hdr);
    }

    // PUT /profile - Update user profile
    if (httpMethod === 'PUT' && isProfileRoute) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const profile = await saveUserProfile(user.userId, body);
      return json(200, profile, hdr);
    }

    // PUT /progress - Update progress
    if (httpMethod === 'PUT' && route.includes('/progress')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const progress = await updateUserProgress(user.userId, body);
      return json(200, progress, hdr);
    }

    // GET /progress - Get progress
    if (httpMethod === 'GET' && route.includes('/progress')) {
      const user = authUser(event);
      const progress = await getUserProgress(user.userId);
      return json(200, progress, hdr);
    }

    return json(404, { message: 'not found', route, method: httpMethod }, hdr);
  } catch (e) {
    console.error('Handler error:', e);
    const origin = event.headers?.origin || event.headers?.Origin || '*';
    const hdr = headers(origin);
    return json(500, { message: String(e) }, hdr);
  }
};

async function getUserProfile(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE,
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'profile' }
      }
    }));

    if (!result.Item) {
      // Return default profile
      return {
        userId,
        name: '',
        email: '',
        preferences: {},
        settings: {
          language: 'de',
          theme: 'light',
          notifications: true
        },
        createdAt: new Date().toISOString()
      };
    }

    return {
      userId: result.Item.userId?.S || userId,
      name: result.Item.name?.S || '',
      email: result.Item.email?.S || '',
      preferences: JSON.parse(result.Item.preferences?.S || '{}'),
      settings: JSON.parse(result.Item.settings?.S || '{}'),
      createdAt: result.Item.createdAt?.S,
      updatedAt: result.Item.updatedAt?.S
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

async function saveUserProfile(userId, profileData) {
  const profile = {
    userId,
    name: profileData.name || '',
    email: profileData.email || '',
    preferences: profileData.preferences || {},
    settings: profileData.settings || {},
    updatedAt: new Date().toISOString()
  };

  // If no createdAt, add it
  if (!profileData.createdAt) {
    profile.createdAt = new Date().toISOString();
  }

  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'profile' },
      userId: { S: profile.userId },
      name: { S: profile.name },
      email: { S: profile.email },
      preferences: { S: JSON.stringify(profile.preferences) },
      settings: { S: JSON.stringify(profile.settings) },
      createdAt: { S: profile.createdAt || new Date().toISOString() },
      updatedAt: { S: profile.updatedAt }
    }
  }));

  return profile;
}

async function getUserProgress(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE,
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
        streaks: { current: 0, longest: 0 },
        stats: { total: 0, completed: 0, inProgress: 0 }
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
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

async function updateUserProgress(userId, progressData) {
  const progress = {
    userId,
    methods: progressData.methods || {},
    achievements: progressData.achievements || [],
    streaks: progressData.streaks || {},
    stats: progressData.stats || {},
    lastUpdated: new Date().toISOString()
  };

  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE,
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'progress' },
      userId: { S: progress.userId },
      methods: { S: JSON.stringify(progress.methods) },
      achievements: { S: JSON.stringify(progress.achievements) },
      streaks: { S: JSON.stringify(progress.streaks) },
      stats: { S: JSON.stringify(progress.stats) },
      lastUpdated: { S: progress.lastUpdated }
    }
  }));

  return progress;
}

function authUser(event) {
  const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/, '');
  if (!token) throw new Error('unauthorized');
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
  return { userId: payload.sub, email: payload.email };
}

function json(code, body, headers) {
  return { statusCode: code, headers, body: body === null ? '' : JSON.stringify(body) };
}

