import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

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

    // Route kann aus verschiedenen Quellen kommen (API Gateway REST/HTTP)
    const route = event.resource || event.path || event.requestContext?.path || event.rawPath || '';
    const httpMethod = event.httpMethod || event.requestContext?.http?.method || '';
    const pathParameters = event.pathParameters || {};
    // Extrahiere UUID aus verschiedenen Quellen
    let uuidFromRoute = pathParameters.uuid || pathParameters.proxy;
    // Falls nicht in pathParameters, versuche aus path zu extrahieren
    if (!uuidFromRoute && route) {
      const match = route.match(/\/profiles\/([^\/{]+)/);
      if (match) uuidFromRoute = match[1];
    }
    // Falls path wie /profiles/{uuid} ist, nutze den tatsächlichen path
    if (!uuidFromRoute && event.path) {
      const pathMatch = event.path.match(/\/profiles\/([^\/]+)/);
      if (pathMatch) uuidFromRoute = pathMatch[1];
    }
    const isProfileRoute = route.includes('/profile') && !route.includes('/progress') && !route.includes('/upload');
    
    // GET /profiles - Liste aller Profile (nur Übersicht)
    if (httpMethod === 'GET' && (route === '/profiles' || (route.includes('/profiles') && !uuidFromRoute))) {
      const profiles = await getAllProfiles();
      return json(200, profiles, hdr);
    }
    
    // GET /profiles/{uuid} - Vollständiges Profil nach UUID
    if (httpMethod === 'GET' && route.includes('/profiles/') && uuidFromRoute) {
      const uuid = uuidFromRoute;
      const profile = await getUserProfileByUuid(uuid);
      if (!profile) {
        return json(404, { message: 'Profile not found', uuid }, hdr);
      }
      return json(200, profile, hdr);
    }
    
    // GET /profile - Load user profile (aktueller User)
    if (httpMethod === 'GET' && isProfileRoute && route === '/profile') {
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

    // === LEBENSLAUF (RESUME) ENDPUNKTE ===
    const isResumeRoute = route.includes('/resume') || route.includes('/lebenslauf');
    
    // GET /resumes - Liste aller Lebensläufe (Übersicht)
    if (httpMethod === 'GET' && (route === '/resumes' || route.includes('/resumes') && !pathParameters.id && !pathParameters.uuid)) {
      const resumes = await getAllResumes();
      return json(200, resumes, hdr);
    }
    
    // GET /resume - Lade Lebenslauf des aktuellen Users
    if (httpMethod === 'GET' && isResumeRoute && route === '/resume' && !pathParameters.uuid && !pathParameters.id) {
      const user = authUser(event);
      const resume = await getResume(user.userId);
      if (!resume) {
        return json(404, { message: 'Resume not found' }, hdr);
      }
      return json(200, resume, hdr);
    }
    
    // GET /resume/{uuid} - Lade Lebenslauf nach UUID
    if (httpMethod === 'GET' && isResumeRoute && (pathParameters.uuid || uuidFromRoute)) {
      const uuid = pathParameters.uuid || uuidFromRoute;
      const resume = await getResume(uuid);
      if (!resume) {
        return json(404, { message: 'Resume not found', uuid }, hdr);
      }
      return json(200, resume, hdr);
    }
    
    // POST /resume - Erstelle/Update Lebenslauf
    if (httpMethod === 'POST' && isResumeRoute) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const resume = await saveResume(user.userId, body);
      return json(200, resume, hdr);
    }
    
    // PUT /resume - Update Lebenslauf
    if (httpMethod === 'PUT' && isResumeRoute) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const resume = await saveResume(user.userId, body);
      return json(200, resume, hdr);
    }
    
    // DELETE /resume - Lösche Lebenslauf
    if (httpMethod === 'DELETE' && isResumeRoute) {
      const user = authUser(event);
      await deleteResume(user.userId);
      return json(200, { message: 'Resume deleted successfully' }, hdr);
    }
    
    // POST /resume/upload-url - Generiere Presigned URL für PDF-Upload
    if (httpMethod === 'POST' && route.includes('/resume/upload-url')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const uploadUrl = await generateResumeUploadUrl(user.userId, body.fileName, body.contentType);
      return json(200, uploadUrl, hdr);
    }
    
    // POST /resume/ocr - OCR-Verarbeitung für hochgeladenes PDF
    if (httpMethod === 'POST' && route.includes('/resume/ocr')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const ocrResult = await processResumeOCR(user.userId, body.s3Key);
      return json(200, ocrResult, hdr);
    }
    
    // PUT /resume/personal-info/{field} - Update einzelnes Feld
    if (httpMethod === 'PUT' && route.includes('/resume/personal-info/')) {
      const user = authUser(event);
      const fieldName = pathParameters.field || route.split('/personal-info/')[1]?.split('/')[0];
      const body = JSON.parse(event.body || '{}');
      const result = await updateResumeField(user.userId, fieldName, body.value);
      return json(200, result, hdr);
    }
    
    // === PROJEKTE ENDPUNKTE ===
    // GET /resume/projects
    if (httpMethod === 'GET' && route.includes('/resume/projects')) {
      const user = authUser(event);
      const resume = await getResume(user.userId);
      return json(200, { projects: resume?.projects || [] }, hdr);
    }
    
    // POST /resume/projects
    if (httpMethod === 'POST' && route.includes('/resume/projects')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const result = await addProject(user.userId, body);
      return json(200, result, hdr);
    }
    
    // PUT /resume/projects/{id}
    if (httpMethod === 'PUT' && route.includes('/resume/projects/')) {
      const user = authUser(event);
      const projectId = pathParameters.id || route.split('/projects/')[1]?.split('/')[0];
      const body = JSON.parse(event.body || '{}');
      const result = await updateProject(user.userId, projectId, body);
      return json(200, result, hdr);
    }
    
    // DELETE /resume/projects/{id}
    if (httpMethod === 'DELETE' && route.includes('/resume/projects/')) {
      const user = authUser(event);
      const projectId = pathParameters.id || route.split('/projects/')[1]?.split('/')[0];
      await deleteProject(user.userId, projectId);
      return json(200, { message: 'Project deleted successfully' }, hdr);
    }
    
    // === SKILLS ENDPUNKTE ===
    // GET /resume/skills
    if (httpMethod === 'GET' && route.includes('/resume/skills')) {
      const user = authUser(event);
      const resume = await getResume(user.userId);
      return json(200, { skills: resume?.skills || { technicalSkills: [], softSkills: [] } }, hdr);
    }
    
    // PUT /resume/skills
    if (httpMethod === 'PUT' && route.includes('/resume/skills')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const result = await updateSkills(user.userId, body);
      return json(200, result, hdr);
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

/**
 * Holt alle Profile aus DynamoDB (nur Übersicht)
 */
async function getAllProfiles() {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
    const docClient = DynamoDBDocumentClient.from(client);
    
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.TABLE || 'mawps-user-profiles',
      // Nur bestimmte Attribute zurückgeben (Übersicht)
      ProjectionExpression: 'userId, #name, email, firstName, lastName, profession, company, profileImageUrl, createdAt, updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    }));
    
    // Formatiere Profile für Übersicht
    const profiles = (result.Items || [])
      .filter(item => {
        // Filtere leere/System-Profile (z.B. "owner" ohne Daten)
        if (!item.userId || item.userId === 'owner') return false;
        // Optional: Nur Profile mit mindestens E-Mail anzeigen
        // if (!item.email) return false;
        return true;
      })
      .map(item => {
        const name = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email?.split('@')[0] || 'Unbekannt';
        return {
          userId: item.userId,
          name: name,
          email: item.email || '',
          firstName: item.firstName || '',
          lastName: item.lastName || '',
          profession: item.profession || '',
          company: item.company || '',
          profileImageUrl: item.profileImageUrl || '',
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
          // Zusätzliche Info: Ist Profil vollständig ausgefüllt?
          isComplete: !!(item.firstName && item.lastName && item.email && item.profession)
        };
      })
      .sort((a, b) => {
        // Sortiere nach updatedAt (neueste zuerst)
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
    
    return {
      count: profiles.length,
      total: result.Count || result.Items?.length || 0,
      profiles
    };
  } catch (error) {
    console.error('Error getting all profiles:', error);
    throw error;
  }
}

/**
 * Holt ein Profil nach UUID (userId)
 */
async function getUserProfileByUuid(uuid) {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
    const docClient = DynamoDBDocumentClient.from(client);
    
    const result = await docClient.send(new GetCommand({
      TableName: process.env.TABLE || 'mawps-user-profiles',
      Key: { userId: uuid }
    }));
    
    if (!result.Item) {
      return null;
    }
    
    // Gebe vollständiges Profil zurück
    return {
      userId: result.Item.userId,
      email: result.Item.email || '',
      name: result.Item.name || '',
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
      emailNotifications: result.Item.emailNotifications !== undefined ? result.Item.emailNotifications : false,
      weeklySummary: result.Item.weeklySummary !== undefined ? result.Item.weeklySummary : false,
      reminders: result.Item.reminders !== undefined ? result.Item.reminders : false,
      theme: result.Item.theme || 'light',
      language: result.Item.language || 'de',
      dataSharing: result.Item.dataSharing !== undefined ? result.Item.dataSharing : false,
      preferences: result.Item.preferences || {},
      settings: result.Item.settings || {},
      personal: result.Item.personal || {},
      type: result.Item.type || 'user-profile',
      createdAt: result.Item.createdAt || '',
      updatedAt: result.Item.updatedAt || ''
    };
  } catch (error) {
    console.error('Error getting profile by UUID:', error);
    throw error;
  }
}

/**
 * Lebenslauf-Funktionen
 */

/**
 * Holt alle Lebensläufe aus DynamoDB (nur Übersicht)
 */
async function getAllResumes() {
  try {
    const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Scanne alle Profile - lade auch resume-Daten direkt
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.TABLE || 'mawps-user-profiles'
    }));
    
    const resumes = [];
    
    // Für jedes Item prüfe ob Resume vorhanden
    for (const item of result.Items || []) {
      const userId = item.userId;
      if (!userId || userId === 'owner') continue;
      
      try {
        // Prüfe ob Resume direkt im Item vorhanden ist
        let resume = null;
        let profile = null;
        
        // Versuche Resume direkt aus Item zu extrahieren
        if (item.resume) {
          resume = typeof item.resume === 'string' ? JSON.parse(item.resume) : item.resume;
        } else if (item.profileData) {
          // Versuche aus profileData
          const profileData = typeof item.profileData === 'string' ? JSON.parse(item.profileData) : item.profileData;
          resume = profileData?.resume;
          profile = profileData;
        } else {
          // Versuche getUserProfile (mit Schema-Handling)
          try {
            profile = await getUserProfile(userId);
            resume = profile?.resume;
          } catch (profileError) {
            // Überspringe wenn Schema-Problem
            console.warn(`Error loading profile for userId ${userId}:`, profileError.message);
            continue;
          }
        }
        
        if (!resume) continue;
        
        const name = resume.personalInfo?.firstName && resume.personalInfo?.lastName
          ? `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`
          : profile?.name || profile?.firstName || item.name || item.firstName || item.email?.split('@')[0] || 'Unbekannt';
        
        // Zähle Skills
        const technicalSkillsCount = (resume.skills?.technicalSkills || []).reduce((sum, cat) => sum + (cat.skills?.length || 0), 0);
        const softSkillsCount = (resume.skills?.softSkills || []).length;
        
        resumes.push({
          userId: userId,
          name: name,
          title: resume.personalInfo?.title || '',
          summary: resume.personalInfo?.summary ? resume.personalInfo.summary.substring(0, 150) + (resume.personalInfo.summary.length > 150 ? '...' : '') : '',
          email: resume.personalInfo?.email || profile?.email || item.email || '',
          hasProjects: (resume.projects || []).length > 0,
          projectsCount: (resume.projects || []).length,
          hasSkills: technicalSkillsCount > 0 || softSkillsCount > 0,
          skillsCount: technicalSkillsCount + softSkillsCount,
          technicalSkillsCount: technicalSkillsCount,
          softSkillsCount: softSkillsCount,
          hasExperience: (resume.sections || []).some(s => s.type === 'experience' && s.entries?.length > 0),
          experienceCount: (resume.sections || []).find(s => s.type === 'experience')?.entries?.length || 0,
          hasEducation: (resume.sections || []).some(s => s.type === 'education' && s.entries?.length > 0),
          educationCount: (resume.sections || []).find(s => s.type === 'education')?.entries?.length || 0,
          languagesCount: (resume.languages || []).length,
          certificationsCount: (resume.certifications || []).length,
          ocrProcessed: resume.ocrProcessed || false,
          isComplete: !!(resume.personalInfo?.title && resume.personalInfo?.summary && (technicalSkillsCount > 0 || softSkillsCount > 0)),
          updatedAt: resume.updatedAt || '',
          createdAt: resume.createdAt || ''
        });
      } catch (error) {
        // Überspringe Profile mit Fehlern
        console.warn(`Error processing resume for userId ${userId}:`, error.message);
        continue;
      }
    }
    
    // Sortiere nach updatedAt (neueste zuerst)
    resumes.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
    
    return {
      count: resumes.length,
      total: result.Count || result.Items?.length || 0,
      resumes: resumes
    };
  } catch (error) {
    console.error('Error getting all resumes:', error);
    throw error;
  }
}

/**
 * Holt Lebenslauf aus DynamoDB
 */
async function getResume(userId) {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile || !profile.resume) {
      return null;
    }
    
    // Resume-Daten aus Profil extrahieren
    const resume = profile.resume;
    return {
      userId: userId,
      personalInfo: resume.personalInfo || {},
      sections: resume.sections || [],
      skills: resume.skills || { technicalSkills: [], softSkills: [] },
      languages: resume.languages || [],
      certifications: resume.certifications || [],
      projects: resume.projects || [],
      pdfUrl: resume.pdfUrl || '',
      pdfS3Key: resume.pdfS3Key || '',
      ocrProcessed: resume.ocrProcessed || false,
      ocrData: resume.ocrData || null,
      createdAt: resume.createdAt || '',
      updatedAt: resume.updatedAt || ''
    };
  } catch (error) {
    console.error('Error getting resume:', error);
    throw error;
  }
}

/**
 * Speichert Lebenslauf in DynamoDB
 */
async function saveResume(userId, resumeData) {
  try {
    // Lade aktuelles Profil
    const profile = await getUserProfile(userId);
    
    const now = new Date().toISOString();
    const resume = {
      personalInfo: resumeData.personalInfo || {},
      sections: resumeData.sections || [],
      skills: resumeData.skills || { technicalSkills: [], softSkills: [] },
      languages: resumeData.languages || [],
      certifications: resumeData.certifications || [],
      projects: resumeData.projects || [],
      pdfUrl: resumeData.pdfUrl || '',
      pdfS3Key: resumeData.pdfS3Key || '',
      ocrProcessed: resumeData.ocrProcessed || false,
      ocrData: resumeData.ocrData || null,
      createdAt: profile?.resume?.createdAt || resumeData.createdAt || now,
      updatedAt: now
    };
    
    // Speichere Resume im Profil
    await saveUserProfile(userId, {
      ...profile,
      resume: resume
    });
    
    return {
      userId: userId,
      ...resume
    };
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}

/**
 * Löscht Lebenslauf
 */
async function deleteResume(userId) {
  try {
    // Lade aktuelles Profil
    const profile = await getUserProfile(userId);
    
    // Entferne Resume-Daten
    delete profile.resume;
    
    // Speichere Profil ohne Resume
    await saveUserProfile(userId, profile);
    
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
}

/**
 * Generiert Presigned URL für PDF-Upload
 */
async function generateResumeUploadUrl(userId, fileName, contentType = 'application/pdf') {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    
    const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });
    const bucketName = process.env.RESUME_BUCKET || 'mawps-resumes';
    
    // Sanitize fileName
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `resumes/${userId}/${Date.now()}-${sanitizedFileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: contentType,
      Metadata: {
        userId: userId,
        uploadedAt: new Date().toISOString()
      }
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return {
      uploadUrl,
      s3Key,
      bucket: bucketName,
      expiresIn: 3600
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    // Fallback: Wenn S3-Bucket nicht existiert, gebe trotzdem eine URL zurück
    // (Frontend kann dann einen alternativen Upload-Weg nutzen)
    return {
      uploadUrl: null,
      s3Key: `resumes/${userId}/${Date.now()}-${fileName}`,
      bucket: process.env.RESUME_BUCKET || 'mawps-resumes',
      expiresIn: 3600,
      error: 'S3 bucket not configured. Please set RESUME_BUCKET environment variable.'
    };
  }
}

/**
 * Verarbeitet PDF mit OCR (AWS Textract)
 */
async function processResumeOCR(userId, s3Key) {
  try {
    const { TextractClient, StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } = await import('@aws-sdk/client-textract');
    const textractClient = new TextractClient({ region: process.env.AWS_REGION || 'eu-central-1' });
    const bucketName = process.env.RESUME_BUCKET || 'mawps-resumes';
    
    // Prüfe ob Textract verfügbar ist
    if (!process.env.RESUME_BUCKET) {
      return {
        success: false,
        message: 'OCR not configured. Please set RESUME_BUCKET environment variable.',
        error: 'Textract requires S3 bucket configuration'
      };
    }
    
    // Starte Textract Job
    const startCommand = new StartDocumentTextDetectionCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: bucketName,
          Name: s3Key
        }
      }
    });
    
    const startResult = await textractClient.send(startCommand);
    const jobId = startResult.JobId;
    
    if (!jobId) {
      return {
        success: false,
        error: 'Failed to start OCR job',
        message: 'Could not start Textract job. Please check S3 permissions.'
      };
    }
    
    // Warte auf Completion (Polling)
    let jobComplete = false;
    let attempts = 0;
    const maxAttempts = 30; // Max 5 Minuten (10s * 30)
    
    while (!jobComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 Sekunden warten
      
      const getCommand = new GetDocumentTextDetectionCommand({ JobId: jobId });
      const getResult = await textractClient.send(getCommand);
      
      if (getResult.JobStatus === 'SUCCEEDED') {
        jobComplete = true;
        
        // Extrahiere Text aus Blocks
        const textBlocks = (getResult.Blocks || [])
          .filter(block => block.BlockType === 'LINE')
          .map(block => block.Text)
          .join('\n');
        
        // Parse strukturierte Daten
        const parsedData = parseOCRText(textBlocks);
        
        return {
          success: true,
          jobId,
          rawText: textBlocks,
          parsedData,
          blocks: getResult.Blocks || []
        };
      } else if (getResult.JobStatus === 'FAILED') {
        return {
          success: false,
          error: `OCR processing failed: ${getResult.StatusMessage || 'Unknown error'}`,
          message: 'Textract job failed. Please check the document format.'
        };
      }
      
      attempts++;
    }
    
    if (!jobComplete) {
      // Return partial result with jobId for async polling
      return {
        success: false,
        message: 'OCR processing in progress',
        jobId: jobId,
        status: 'IN_PROGRESS'
      };
    }
    
    return { success: false, message: 'OCR processing incomplete' };
  } catch (error) {
    console.error('Error processing OCR:', error);
    // Return error instead of throwing for better error handling
    return {
      success: false,
      error: error.message || 'OCR processing failed',
      message: 'Failed to process OCR. Please check S3 bucket and Textract permissions.'
    };
  }
}

/**
 * Parst OCR-Text in strukturierte Daten
 */
function parseOCRText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  
  const parsed = {
    name: '',
    email: '',
    phone: '',
    address: '',
    sections: []
  };
  
  // E-Mail finden
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    parsed.email = emailMatch[0];
  }
  
  // Telefon finden
  const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    parsed.phone = phoneMatch[0].trim();
  }
  
  // Name ist meist erste Zeile
  if (lines.length > 0 && !emailRegex.test(lines[0]) && !phoneRegex.test(lines[0])) {
    parsed.name = lines[0].trim();
  }
  
  // Sektionen erkennen
  const sectionKeywords = {
    'Berufserfahrung': ['Berufserfahrung', 'Erfahrung', 'Arbeitserfahrung', 'Experience'],
    'Ausbildung': ['Ausbildung', 'Bildung', 'Education', 'Studium'],
    'Skills': ['Fähigkeiten', 'Kompetenzen', 'Skills', 'Kenntnisse'],
    'Sprachen': ['Sprachen', 'Languages', 'Fremdsprachen']
  };
  
  let currentSection = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (const [sectionName, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
        currentSection = {
          title: sectionName,
          content: []
        };
        parsed.sections.push(currentSection);
        break;
      }
    }
    
    if (currentSection && !sectionKeywords[currentSection.title]?.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
      currentSection.content.push(line.trim());
    }
  }
  
  return parsed;
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

