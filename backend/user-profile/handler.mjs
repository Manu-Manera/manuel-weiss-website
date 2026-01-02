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
    // Prüfe ob userId eine apiKeyId ist (UUID-Format)
    const isApiKeyId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    // Wenn es eine apiKeyId ist, verwende direkt userId als Key (für mawps-user-profiles)
    // Ansonsten verwende pk/sk Schema (für andere Tabellen)
    let result;
    if (isApiKeyId) {
      // Für API Key Auth: Tabelle mawps-user-profiles mit userId als HASH Key
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');
      const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
      const docClient = DynamoDBDocumentClient.from(client);
      
      result = await docClient.send(new GetCommand({
        TableName: 'mawps-user-profiles',
        Key: { userId }
      }));
      
      // Wenn kein Item gefunden, gebe Standard-Profil zurück
      if (!result.Item) {
        return {
          userId,
          name: '',
          email: `${userId}@api-key`,
          preferences: {},
          settings: {
            language: 'de',
            theme: 'light',
            notifications: true
          },
          authType: 'api-key',
          apiKeyId: userId,
          createdAt: new Date().toISOString()
        };
      }
      
      // Konvertiere Item zu Standard-Format
      return {
        userId: result.Item.userId || userId,
        name: result.Item.name || '',
        email: result.Item.email || `${userId}@api-key`,
        firstName: result.Item.firstName || '',
        lastName: result.Item.lastName || '',
        phone: result.Item.phone || '',
        birthDate: result.Item.birthDate || '',
        location: result.Item.location || '',
        profession: result.Item.profession || '',
        company: result.Item.company || '',
        experience: result.Item.experience || '',
        industry: result.Item.industry || '',
        goals: result.Item.goals || '',
        interests: result.Item.interests || '',
        profileImageUrl: result.Item.profileImageUrl || '',
        preferences: result.Item.preferences || {},
        settings: result.Item.settings || {
          language: 'de',
          theme: 'light',
          notifications: true
        },
        authType: 'api-key',
        apiKeyId: userId,
        createdAt: result.Item.createdAt || new Date().toISOString(),
        updatedAt: result.Item.updatedAt || new Date().toISOString()
      };
    }
    
    // Standard-Verhalten für normale User (Cognito)
    result = await getDynamoDB().send(new GetItemCommand({
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

    // Parse all profile fields from DynamoDB
    const profile = {
      userId: result.Item.userId?.S || userId,
      name: result.Item.name?.S || '',
      email: result.Item.email?.S || '',
      preferences: JSON.parse(result.Item.preferences?.S || '{}'),
      settings: JSON.parse(result.Item.settings?.S || '{}'),
      createdAt: result.Item.createdAt?.S,
      updatedAt: result.Item.updatedAt?.S
    };

    // Load all additional profile fields if they exist
    if (result.Item.profileData?.S) {
      const profileData = JSON.parse(result.Item.profileData.S);
      Object.assign(profile, profileData);
    } else {
      // Fallback: Load individual fields if profileData doesn't exist
      if (result.Item.firstName?.S) profile.firstName = result.Item.firstName.S;
      if (result.Item.lastName?.S) profile.lastName = result.Item.lastName.S;
      if (result.Item.phone?.S) profile.phone = result.Item.phone.S;
      if (result.Item.birthDate?.S) profile.birthDate = result.Item.birthDate.S;
      if (result.Item.location?.S) profile.location = result.Item.location.S;
      if (result.Item.profession?.S) profile.profession = result.Item.profession.S;
      if (result.Item.company?.S) profile.company = result.Item.company.S;
      if (result.Item.experience?.S) profile.experience = result.Item.experience.S;
      if (result.Item.industry?.S) profile.industry = result.Item.industry.S;
      if (result.Item.goals?.S) profile.goals = result.Item.goals.S;
      if (result.Item.interests?.S) profile.interests = result.Item.interests.S;
      if (result.Item.profileImageUrl?.S) profile.profileImageUrl = result.Item.profileImageUrl.S;
      if (result.Item.personal?.S) profile.personal = JSON.parse(result.Item.personal.S);
      if (result.Item.type?.S) profile.type = result.Item.type.S;
    }

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

async function saveUserProfile(userId, profileData) {
  const timestamp = new Date().toISOString();
  
  // Build complete profile object with all fields
  const profile = {
    userId,
    name: profileData.name || '',
    email: profileData.email || '',
    preferences: profileData.preferences || {},
    settings: profileData.settings || {},
    updatedAt: timestamp,
    createdAt: profileData.createdAt || timestamp
  };

  // Include all additional profile fields
  if (profileData.firstName !== undefined) profile.firstName = profileData.firstName;
  if (profileData.lastName !== undefined) profile.lastName = profileData.lastName;
  if (profileData.phone !== undefined) profile.phone = profileData.phone;
  if (profileData.birthDate !== undefined) profile.birthDate = profileData.birthDate;
  if (profileData.location !== undefined) profile.location = profileData.location;
  if (profileData.profession !== undefined) profile.profession = profileData.profession;
  if (profileData.company !== undefined) profile.company = profileData.company;
  if (profileData.experience !== undefined) profile.experience = profileData.experience;
  if (profileData.industry !== undefined) profile.industry = profileData.industry;
  if (profileData.goals !== undefined) profile.goals = profileData.goals;
  if (profileData.interests !== undefined) profile.interests = profileData.interests;
  if (profileData.profileImageUrl !== undefined) profile.profileImageUrl = profileData.profileImageUrl;
  if (profileData.personal !== undefined) profile.personal = profileData.personal;
  if (profileData.type !== undefined) profile.type = profileData.type;

  // Build DynamoDB item
  const item = {
    pk: { S: `user#${userId}` },
    sk: { S: 'profile' },
    userId: { S: profile.userId },
    name: { S: profile.name },
    email: { S: profile.email },
    preferences: { S: JSON.stringify(profile.preferences) },
    settings: { S: JSON.stringify(profile.settings) },
    createdAt: { S: profile.createdAt },
    updatedAt: { S: profile.updatedAt }
  };

  // Add all additional fields to DynamoDB item
  // IMPORTANT: Save all fields, even if empty (to preserve user data)
  // Only skip undefined values, but keep empty strings
  if (profile.firstName !== undefined) item.firstName = { S: String(profile.firstName || '') };
  if (profile.lastName !== undefined) item.lastName = { S: String(profile.lastName || '') };
  if (profile.phone !== undefined) item.phone = { S: String(profile.phone || '') };
  if (profile.birthDate !== undefined) item.birthDate = { S: String(profile.birthDate || '') };
  if (profile.location !== undefined) item.location = { S: String(profile.location || '') };
  if (profile.profession !== undefined) item.profession = { S: String(profile.profession || '') };
  if (profile.company !== undefined) item.company = { S: String(profile.company || '') };
  if (profile.experience !== undefined) item.experience = { S: String(profile.experience || '') };
  if (profile.industry !== undefined) item.industry = { S: String(profile.industry || '') };
  if (profile.goals !== undefined) item.goals = { S: String(profile.goals || '') };
  if (profile.interests !== undefined) item.interests = { S: String(profile.interests || '') };
  if (profile.profileImageUrl !== undefined) item.profileImageUrl = { S: String(profile.profileImageUrl || '') };
  if (profile.personal !== undefined) item.personal = { S: JSON.stringify(profile.personal || {}) };
  if (profile.type !== undefined) item.type = { S: String(profile.type || '') };

  // Also store complete profileData as JSON for easy retrieval
  item.profileData = { S: JSON.stringify(profile) };

  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE,
    Item: item
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

