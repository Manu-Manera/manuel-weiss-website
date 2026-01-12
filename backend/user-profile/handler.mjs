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
    // WICHTIG: Spezifischere Routes MÜSSEN ZUERST kommen, da sie sonst von allgemeineren Routes überschrieben werden!
    
    // GET /resumes - Liste aller Lebensläufe (Übersicht)
    if (httpMethod === 'GET' && (route === '/resumes' || (route.includes('/resumes') && !pathParameters.id && !pathParameters.uuid))) {
      const resumes = await getAllResumes();
      return json(200, resumes, hdr);
    }
    
    // POST /profile/upload-url - Generiere Presigned URL für Profilbild-Upload
    if (httpMethod === 'POST' && route.includes('/profile/upload-url')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const uploadUrl = await generateProfileImageUploadUrl(user.userId, body.fileName, body.contentType);
      return json(200, uploadUrl, hdr);
    }
    
    // POST /resume/upload-url - Generiere Presigned URL für PDF-Upload (MUSS VOR /resume kommen!)
    if (httpMethod === 'POST' && route.includes('/resume/upload-url')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const uploadUrl = await generateResumeUploadUrl(user.userId, body.fileName, body.contentType);
      return json(200, uploadUrl, hdr);
    }
    
    // POST /resume/ocr - OCR-Verarbeitung für hochgeladenes PDF (MUSS VOR /resume kommen!)
    if (httpMethod === 'POST' && route.includes('/resume/ocr')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const ocrResult = await processResumeOCR(user.userId, body.s3Key);
      return json(200, ocrResult, hdr);
    }
    
    // PUT /resume/personal-info/{field} - Update einzelnes Feld (MUSS VOR /resume kommen!)
    if (httpMethod === 'PUT' && route.includes('/resume/personal-info/')) {
      const user = authUser(event);
      const fieldName = pathParameters.field || route.split('/personal-info/')[1]?.split('/')[0];
      const body = JSON.parse(event.body || '{}');
      const result = await updateResumeField(user.userId, fieldName, body.value);
      return json(200, result, hdr);
    }
    
    // Allgemeine Resume-Route-Checks (NACH den spezifischen Routes!)
    const isResumeRoute = route.includes('/resume') || route.includes('/lebenslauf');
    const isExactResumeRoute = route === '/resume' || route.endsWith('/resume');
    
    // GET /resume - Lade Lebenslauf des aktuellen Users
    if (httpMethod === 'GET' && isExactResumeRoute && !pathParameters.uuid && !pathParameters.id) {
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
    
    // POST /resume - Erstelle/Update Lebenslauf (nur für exakte Route)
    if (httpMethod === 'POST' && isExactResumeRoute) {
      const user = authUser(event);
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return json(400, { error: 'Invalid JSON in request body', message: parseError.message }, hdr);
      }
      try {
        const resume = await saveResume(user.userId, body);
        return json(200, resume, hdr);
      } catch (saveError) {
        console.error('Error saving resume:', saveError);
        return json(500, { error: 'Failed to save resume', message: saveError.message }, hdr);
      }
    }
    
    // PUT /resume - Update Lebenslauf (nur für exakte Route oder /resume/skills, /resume/projects)
    if (httpMethod === 'PUT' && isExactResumeRoute) {
      const user = authUser(event);
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return json(400, { error: 'Invalid JSON in request body', message: parseError.message }, hdr);
      }
      try {
        const resume = await saveResume(user.userId, body);
        return json(200, resume, hdr);
      } catch (saveError) {
        console.error('Error saving resume:', saveError);
        return json(500, { error: 'Failed to save resume', message: saveError.message }, hdr);
      }
    }
    
    // DELETE /resume - Lösche Lebenslauf
    if (httpMethod === 'DELETE' && isExactResumeRoute) {
      const user = authUser(event);
      await deleteResume(user.userId);
      return json(200, { message: 'Resume deleted successfully' }, hdr);
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

    // === TRAINING ENDPUNKTE ===
    // GET /training - Trainingsplan laden
    if (httpMethod === 'GET' && route.includes('/training') && !route.includes('/training/')) {
      const user = authUser(event);
      const training = await getUserTraining(user.userId);
      return json(200, training, hdr);
    }

    // POST /training - Trainingsplan speichern
    if (httpMethod === 'POST' && route.includes('/training') && !route.includes('/training/')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const training = await saveUserTraining(user.userId, body);
      return json(200, training, hdr);
    }

    // POST /training/workout - Workout-Session speichern
    if (httpMethod === 'POST' && route.includes('/training/workout')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const workout = await saveWorkoutSession(user.userId, body);
      return json(200, workout, hdr);
    }

    // GET /training/history - Workout-Historie laden
    if (httpMethod === 'GET' && route.includes('/training/history')) {
      const user = authUser(event);
      const history = await getWorkoutHistory(user.userId);
      return json(200, history, hdr);
    }

    // === NUTRITION ENDPUNKTE ===
    // GET /nutrition - Ernährungsplan laden
    if (httpMethod === 'GET' && route.includes('/nutrition') && !route.includes('/nutrition/')) {
      const user = authUser(event);
      const nutrition = await getUserNutrition(user.userId);
      return json(200, nutrition, hdr);
    }

    // POST /nutrition - Ernährungsplan speichern
    if (httpMethod === 'POST' && route.includes('/nutrition') && !route.includes('/nutrition/')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const nutrition = await saveUserNutrition(user.userId, body);
      return json(200, nutrition, hdr);
    }

    // POST /nutrition/meal - Mahlzeit loggen
    if (httpMethod === 'POST' && route.includes('/nutrition/meal')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const meal = await logMeal(user.userId, body);
      return json(200, meal, hdr);
    }

    // GET /nutrition/history - Ernährungs-Historie laden
    if (httpMethod === 'GET' && route.includes('/nutrition/history')) {
      const user = authUser(event);
      const history = await getNutritionHistory(user.userId);
      return json(200, history, hdr);
    }

    // === ACHIEVEMENTS ENDPUNKTE ===
    // GET /achievements - Alle Erfolge laden
    if (httpMethod === 'GET' && route.includes('/achievements')) {
      const user = authUser(event);
      const achievements = await getUserAchievements(user.userId);
      return json(200, achievements, hdr);
    }

    // POST /achievements - Neuen Erfolg hinzufügen
    if (httpMethod === 'POST' && route.includes('/achievements')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const achievement = await addAchievement(user.userId, body);
      return json(200, achievement, hdr);
    }

    // === APPLICATIONS ENDPUNKTE ===
    // GET /applications - Alle Bewerbungen laden
    if (httpMethod === 'GET' && route.includes('/applications') && !route.includes('/applications/')) {
      const user = authUser(event);
      const applications = await getUserApplications(user.userId);
      return json(200, applications, hdr);
    }

    // POST /applications - Neue Bewerbung erstellen
    if (httpMethod === 'POST' && route.includes('/applications') && !route.includes('/applications/')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const application = await createApplication(user.userId, body);
      return json(200, application, hdr);
    }

    // PUT /applications/{id} - Bewerbung aktualisieren
    if (httpMethod === 'PUT' && route.includes('/applications/')) {
      const user = authUser(event);
      const applicationId = pathParameters.id || route.split('/applications/')[1]?.split('/')[0];
      const body = JSON.parse(event.body || '{}');
      const application = await updateApplication(user.userId, applicationId, body);
      return json(200, application, hdr);
    }

    // DELETE /applications/{id} - Bewerbung löschen
    if (httpMethod === 'DELETE' && route.includes('/applications/')) {
      const user = authUser(event);
      const applicationId = pathParameters.id || route.split('/applications/')[1]?.split('/')[0];
      await deleteApplication(user.userId, applicationId);
      return json(200, { message: 'Application deleted successfully' }, hdr);
    }

    // GET /applications/stats - Bewerbungsstatistiken
    if (httpMethod === 'GET' && route.includes('/applications/stats')) {
      const user = authUser(event);
      const stats = await getApplicationStats(user.userId);
      return json(200, stats, hdr);
    }

    // === JOURNAL/TAGEBUCH ENDPUNKTE ===
    // GET /journal - Alle Journal-Einträge laden
    if (httpMethod === 'GET' && route.includes('/journal') && !route.includes('/journal/')) {
      const user = authUser(event);
      // Optional: Zeitraum-Filter aus Query-Parametern
      const queryParams = event.queryStringParameters || {};
      const entries = await getJournalEntries(user.userId, queryParams);
      return json(200, entries, hdr);
    }

    // GET /journal/{date} - Einträge für spezifisches Datum
    if (httpMethod === 'GET' && route.includes('/journal/')) {
      const user = authUser(event);
      const date = pathParameters.date || route.split('/journal/')[1]?.split('/')[0];
      const entries = await getJournalEntriesByDate(user.userId, date);
      return json(200, entries, hdr);
    }

    // POST /journal - Neuen Journal-Eintrag erstellen
    if (httpMethod === 'POST' && route.includes('/journal') && !route.includes('/journal/')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const entry = await createJournalEntry(user.userId, body);
      return json(200, entry, hdr);
    }

    // PUT /journal/{id} - Journal-Eintrag aktualisieren
    if (httpMethod === 'PUT' && route.includes('/journal/')) {
      const user = authUser(event);
      const entryId = pathParameters.id || route.split('/journal/')[1]?.split('/')[0];
      const body = JSON.parse(event.body || '{}');
      const entry = await updateJournalEntry(user.userId, entryId, body);
      return json(200, entry, hdr);
    }

    // DELETE /journal/{id} - Journal-Eintrag löschen
    if (httpMethod === 'DELETE' && route.includes('/journal/')) {
      const user = authUser(event);
      const entryId = pathParameters.id || route.split('/journal/')[1]?.split('/')[0];
      await deleteJournalEntry(user.userId, entryId);
      return json(200, { message: 'Journal entry deleted successfully' }, hdr);
    }

    // POST /journal/activity - Automatische Aktivität tracken
    if (httpMethod === 'POST' && route.includes('/journal/activity')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const activity = await trackActivity(user.userId, body);
      return json(200, activity, hdr);
    }

    // ============================================================================
    // API SETTINGS ENDPOINTS - Für globale API-Key Speicherung
    // ============================================================================

    // GET /api-settings - API-Einstellungen laden
    if (httpMethod === 'GET' && route.includes('/api-settings')) {
      const user = authUser(event);
      const settings = await getApiSettings(user.userId);
      return json(200, settings, hdr);
    }

    // PUT /api-settings - API-Einstellungen speichern
    if (httpMethod === 'PUT' && route.includes('/api-settings')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const result = await saveApiSettings(user.userId, body);
      return json(200, result, hdr);
    }

    // DELETE /api-settings - API-Einstellungen löschen
    if (httpMethod === 'DELETE' && route.includes('/api-settings')) {
      const user = authUser(event);
      await deleteApiSettings(user.userId);
      return json(200, { message: 'API settings deleted successfully' }, hdr);
    }

    // POST /api-settings/test - API-Key testen
    if (httpMethod === 'POST' && route.includes('/api-settings/test')) {
      const user = authUser(event);
      const body = JSON.parse(event.body || '{}');
      const result = await testApiKey(user.userId, body.provider);
      return json(200, result, hdr);
    }

    return json(404, { message: 'not found', route, method: httpMethod }, hdr);
  } catch (e) {
    console.error('Handler error:', e);
    const origin = event.headers?.origin || event.headers?.Origin || '*';
    const hdr = headers(origin);
    
    // Handle authentication errors with 401
    const errorMessage = String(e.message || e);
    if (errorMessage.includes('unauthorized') || 
        errorMessage.includes('Invalid token') || 
        errorMessage.includes('missing payload') ||
        errorMessage.includes('missing user id')) {
      return json(401, { error: 'Unauthorized', message: errorMessage }, hdr);
    }
    
    return json(500, { error: 'Internal Server Error', message: errorMessage }, hdr);
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
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
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
  
  // Include resume if present (important for resume storage)
  if (profileData.resume !== undefined) {
    profile.resume = profileData.resume;
  }

  // Validate required fields before building DynamoDB item
  if (!userId) {
    throw new Error('userId is required');
  }
  
  // Ensure all required fields have valid values
  const safeUserId = String(userId || '');
  const safeName = String(profile.name || '');
  const safeEmail = String(profile.email || '');
  const safeCreatedAt = String(profile.createdAt || timestamp);
  const safeUpdatedAt = String(profile.updatedAt || timestamp);
  const safePreferences = profile.preferences || {};
  const safeSettings = profile.settings || {};

  // Build DynamoDB item with validated values
  const item = {
    pk: { S: `user#${safeUserId}` },
    sk: { S: 'profile' },
    userId: { S: safeUserId },
    name: { S: safeName },
    email: { S: safeEmail },
    preferences: { S: JSON.stringify(safePreferences) },
    settings: { S: JSON.stringify(safeSettings) },
    createdAt: { S: safeCreatedAt },
    updatedAt: { S: safeUpdatedAt }
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
  
  // Store resume as separate JSON field if present (for better querying)
  if (profile.resume !== undefined) {
    try {
      item.resume = { S: JSON.stringify(profile.resume) };
    } catch (resumeError) {
      console.error('Error serializing resume:', resumeError);
      // Don't fail the entire save if resume serialization fails
    }
  }

  // Also store complete profileData as JSON for easy retrieval
  // WICHTIG: Entferne große Daten um DynamoDB 400KB Limit einzuhalten
  const cleanProfile = {};
  const EXCLUDED_LARGE_FIELDS = ['resume', 'profileImage', 'documents', 'attachments', 'base64Image'];
  
  for (const [key, value] of Object.entries(profile)) {
    // Überspringe große Felder
    if (EXCLUDED_LARGE_FIELDS.includes(key)) {
      continue;
    }
    
    if (value !== undefined) {
      // Deep clean nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        const cleaned = {};
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          // Überspringe auch große nested Felder
          if (nestedValue !== undefined && !EXCLUDED_LARGE_FIELDS.includes(nestedKey)) {
            cleaned[nestedKey] = nestedValue;
          }
        }
        cleanProfile[key] = cleaned;
      } else {
        cleanProfile[key] = value;
      }
    }
  }
  
  // Prüfe Größe und reduziere wenn nötig
  let profileDataString = JSON.stringify(cleanProfile);
  const MAX_SIZE = 350000; // ~350KB (Puffer für andere Felder)
  
  if (profileDataString.length > MAX_SIZE) {
    console.warn(`Profile data too large (${profileDataString.length} bytes), reducing...`);
    // Entferne weitere große Felder
    delete cleanProfile.personal;
    delete cleanProfile.preferences;
    delete cleanProfile.settings;
    profileDataString = JSON.stringify(cleanProfile);
    console.log(`Reduced to ${profileDataString.length} bytes`);
  }
  
  try {
    item.profileData = { S: profileDataString };
  } catch (jsonError) {
    console.error('Error serializing profileData:', jsonError);
    // Last resort: minimal profile
    item.profileData = { S: JSON.stringify({ userId: safeUserId, name: safeName, email: safeEmail }) };
  }

  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
    Item: item
  }));

  return profile;
}

async function getUserProgress(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
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
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
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
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles' || 'mawps-user-profiles',
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
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles' || 'mawps-user-profiles',
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
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles' || 'mawps-user-profiles'
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
 * Generiert Presigned URL für Profilbild-Upload
 */
async function generateProfileImageUploadUrl(userId, fileName, contentType = 'image/jpeg') {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    
    const bucketName = process.env.PROFILE_IMAGES_BUCKET || 'mawps-profile-images';
    const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });
    
    // Dateiendung aus contentType ableiten
    const extension = contentType.split('/')[1] || 'jpg';
    const s3Key = `profile-images/${userId}/avatar-${Date.now()}.${extension}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: contentType,
      ACL: 'public-read', // Profilbilder sind öffentlich lesbar
      Metadata: {
        userId: userId,
        uploadedAt: new Date().toISOString()
      }
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Generiere die öffentliche URL für das Bild
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${s3Key}`;
    
    return {
      uploadUrl,
      imageUrl,
      s3Key,
      bucket: bucketName,
      expiresIn: 3600
    };
  } catch (error) {
    console.error('Error generating profile image upload URL:', error);
    return {
      uploadUrl: null,
      imageUrl: null,
      s3Key: `profile-images/${userId}/avatar-${Date.now()}.jpg`,
      bucket: process.env.PROFILE_IMAGES_BUCKET || 'mawps-profile-images',
      expiresIn: 3600,
      error: 'S3 bucket not configured. Please set PROFILE_IMAGES_BUCKET environment variable.'
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

// ========================================
// TRAINING FUNKTIONEN
// ========================================

async function getUserTraining(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'training' }
      }
    }));

    if (!result.Item) {
      return {
        userId,
        currentPlan: null,
        workouts: [],
        stats: {
          totalWorkouts: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        lastWorkout: null
      };
    }

    return {
      userId,
      currentPlan: JSON.parse(result.Item.currentPlan?.S || 'null'),
      workouts: JSON.parse(result.Item.workouts?.S || '[]'),
      stats: JSON.parse(result.Item.stats?.S || '{}'),
      lastWorkout: result.Item.lastWorkout?.S || null,
      updatedAt: result.Item.updatedAt?.S
    };
  } catch (error) {
    console.error('Error getting user training:', error);
    throw error;
  }
}

async function saveUserTraining(userId, trainingData) {
  const timestamp = new Date().toISOString();
  
  const training = {
    userId,
    currentPlan: trainingData.currentPlan || null,
    workouts: trainingData.workouts || [],
    stats: trainingData.stats || {
      totalWorkouts: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0
    },
    lastWorkout: trainingData.lastWorkout || null,
    updatedAt: timestamp
  };

  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'training' },
      userId: { S: training.userId },
      currentPlan: { S: JSON.stringify(training.currentPlan) },
      workouts: { S: JSON.stringify(training.workouts) },
      stats: { S: JSON.stringify(training.stats) },
      lastWorkout: { S: training.lastWorkout || '' },
      updatedAt: { S: training.updatedAt }
    }
  }));

  return training;
}

async function saveWorkoutSession(userId, workoutData) {
  // Load existing training data
  const existing = await getUserTraining(userId);
  
  const workout = {
    id: workoutData.id || `workout_${Date.now()}`,
    date: workoutData.date || new Date().toISOString(),
    planId: workoutData.planId,
    duration: workoutData.duration || 0,
    exercises: workoutData.exercises || [],
    notes: workoutData.notes || '',
    completed: workoutData.completed !== false
  };
  
  // Add to workouts array (limit to last 100)
  const workouts = [workout, ...(existing.workouts || [])].slice(0, 100);
  
  // Update stats
  const stats = existing.stats || {};
  stats.totalWorkouts = (stats.totalWorkouts || 0) + 1;
  stats.totalMinutes = (stats.totalMinutes || 0) + workout.duration;
  
  // Calculate streak
  const lastWorkoutDate = existing.lastWorkout ? new Date(existing.lastWorkout) : null;
  const today = new Date();
  const daysSinceLastWorkout = lastWorkoutDate 
    ? Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceLastWorkout <= 1) {
    stats.currentStreak = (stats.currentStreak || 0) + 1;
  } else {
    stats.currentStreak = 1;
  }
  stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
  
  // Save updated training data
  return await saveUserTraining(userId, {
    ...existing,
    workouts,
    stats,
    lastWorkout: workout.date
  });
}

async function getWorkoutHistory(userId) {
  const training = await getUserTraining(userId);
  return {
    workouts: training.workouts || [],
    stats: training.stats || {}
  };
}

// ========================================
// NUTRITION FUNKTIONEN
// ========================================

async function getUserNutrition(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'nutrition' }
      }
    }));

    if (!result.Item) {
      return {
        userId,
        currentPlan: null,
        meals: [],
        stats: {
          totalCalories: 0,
          avgCaloriesPerDay: 0,
          mealsLogged: 0,
          currentStreak: 0
        },
        preferences: {
          dailyCalorieGoal: 2000,
          macros: { protein: 30, carbs: 40, fat: 30 },
          allergies: [],
          dietType: 'balanced'
        },
        lastMeal: null
      };
    }

    return {
      userId,
      currentPlan: JSON.parse(result.Item.currentPlan?.S || 'null'),
      meals: JSON.parse(result.Item.meals?.S || '[]'),
      stats: JSON.parse(result.Item.stats?.S || '{}'),
      preferences: JSON.parse(result.Item.preferences?.S || '{}'),
      lastMeal: result.Item.lastMeal?.S || null,
      updatedAt: result.Item.updatedAt?.S
    };
  } catch (error) {
    console.error('Error getting user nutrition:', error);
    throw error;
  }
}

async function saveUserNutrition(userId, nutritionData) {
  const timestamp = new Date().toISOString();
  
  const nutrition = {
    userId,
    currentPlan: nutritionData.currentPlan || null,
    meals: nutritionData.meals || [],
    stats: nutritionData.stats || {},
    preferences: nutritionData.preferences || {},
    lastMeal: nutritionData.lastMeal || null,
    updatedAt: timestamp
  };

  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'nutrition' },
      userId: { S: nutrition.userId },
      currentPlan: { S: JSON.stringify(nutrition.currentPlan) },
      meals: { S: JSON.stringify(nutrition.meals) },
      stats: { S: JSON.stringify(nutrition.stats) },
      preferences: { S: JSON.stringify(nutrition.preferences) },
      lastMeal: { S: nutrition.lastMeal || '' },
      updatedAt: { S: nutrition.updatedAt }
    }
  }));

  return nutrition;
}

async function logMeal(userId, mealData) {
  const existing = await getUserNutrition(userId);
  
  const meal = {
    id: mealData.id || `meal_${Date.now()}`,
    date: mealData.date || new Date().toISOString(),
    type: mealData.type || 'snack', // breakfast, lunch, dinner, snack
    name: mealData.name || '',
    calories: mealData.calories || 0,
    macros: mealData.macros || { protein: 0, carbs: 0, fat: 0 },
    foods: mealData.foods || [],
    notes: mealData.notes || ''
  };
  
  // Add to meals array (limit to last 200)
  const meals = [meal, ...(existing.meals || [])].slice(0, 200);
  
  // Update stats
  const stats = existing.stats || {};
  stats.mealsLogged = (stats.mealsLogged || 0) + 1;
  stats.totalCalories = (stats.totalCalories || 0) + meal.calories;
  
  // Calculate average calories per day (simple version)
  const today = new Date().toDateString();
  const todaysMeals = meals.filter(m => new Date(m.date).toDateString() === today);
  const todaysCalories = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  stats.todaysCalories = todaysCalories;
  
  return await saveUserNutrition(userId, {
    ...existing,
    meals,
    stats,
    lastMeal: meal.date
  });
}

async function getNutritionHistory(userId) {
  const nutrition = await getUserNutrition(userId);
  return {
    meals: nutrition.meals || [],
    stats: nutrition.stats || {},
    preferences: nutrition.preferences || {}
  };
}

// ========================================
// ACHIEVEMENTS FUNKTIONEN
// ========================================

async function getUserAchievements(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'achievements' }
      }
    }));

    if (!result.Item) {
      return {
        userId,
        achievements: [],
        totalPoints: 0,
        level: 1,
        categories: {
          personality: { unlocked: 0, total: 20 },
          training: { unlocked: 0, total: 15 },
          nutrition: { unlocked: 0, total: 15 },
          applications: { unlocked: 0, total: 10 },
          snowflakes: { unlocked: 0, total: 10 }
        }
      };
    }

    return {
      userId,
      achievements: JSON.parse(result.Item.achievements?.S || '[]'),
      totalPoints: parseInt(result.Item.totalPoints?.N || '0'),
      level: parseInt(result.Item.level?.N || '1'),
      categories: JSON.parse(result.Item.categories?.S || '{}'),
      updatedAt: result.Item.updatedAt?.S
    };
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
}

async function addAchievement(userId, achievementData) {
  const existing = await getUserAchievements(userId);
  
  // Check if achievement already exists
  const alreadyExists = existing.achievements.some(a => a.id === achievementData.id);
  if (alreadyExists) {
    return existing; // Don't add duplicate
  }
  
  const achievement = {
    id: achievementData.id || `achievement_${Date.now()}`,
    type: achievementData.type || 'general',
    category: achievementData.category || 'personality',
    title: achievementData.title || '',
    description: achievementData.description || '',
    icon: achievementData.icon || '🏆',
    points: achievementData.points || 10,
    unlockedAt: new Date().toISOString(),
    metadata: achievementData.metadata || {}
  };
  
  const achievements = [...existing.achievements, achievement];
  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);
  
  // Calculate level (every 100 points = 1 level)
  const level = Math.floor(totalPoints / 100) + 1;
  
  // Update category counts
  const categories = existing.categories || {};
  if (categories[achievement.category]) {
    categories[achievement.category].unlocked = (categories[achievement.category].unlocked || 0) + 1;
  }
  
  const timestamp = new Date().toISOString();
  
  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'achievements' },
      userId: { S: userId },
      achievements: { S: JSON.stringify(achievements) },
      totalPoints: { N: String(totalPoints) },
      level: { N: String(level) },
      categories: { S: JSON.stringify(categories) },
      updatedAt: { S: timestamp }
    }
  }));

  return {
    userId,
    achievements,
    totalPoints,
    level,
    categories,
    newAchievement: achievement
  };
}

// ========================================
// APPLICATIONS FUNKTIONEN
// ========================================

async function getUserApplications(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'applications' }
      }
    }));

    if (!result.Item) {
      return {
        userId,
        applications: [],
        stats: {
          total: 0,
          pending: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          accepted: 0
        }
      };
    }

    const applications = JSON.parse(result.Item.applications?.S || '[]');
    const stats = calculateApplicationStats(applications);

    return {
      userId,
      applications,
      stats,
      updatedAt: result.Item.updatedAt?.S
    };
  } catch (error) {
    console.error('Error getting user applications:', error);
    throw error;
  }
}

async function createApplication(userId, applicationData) {
  const existing = await getUserApplications(userId);
  
  const application = {
    id: applicationData.id || `app_${Date.now()}`,
    company: applicationData.company || '',
    position: applicationData.position || '',
    location: applicationData.location || '',
    status: applicationData.status || 'pending',
    appliedDate: applicationData.appliedDate || new Date().toISOString(),
    source: applicationData.source || '',
    salary: applicationData.salary || '',
    notes: applicationData.notes || '',
    contacts: applicationData.contacts || [],
    documents: applicationData.documents || [],
    timeline: [{
      status: 'pending',
      date: new Date().toISOString(),
      note: 'Bewerbung erstellt'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const applications = [application, ...existing.applications];
  const stats = calculateApplicationStats(applications);
  
  await saveApplications(userId, applications);
  
  return { application, stats };
}

async function updateApplication(userId, applicationId, updateData) {
  const existing = await getUserApplications(userId);
  
  const applicationIndex = existing.applications.findIndex(a => a.id === applicationId);
  if (applicationIndex === -1) {
    throw new Error('Application not found');
  }
  
  const oldApplication = existing.applications[applicationIndex];
  const updatedApplication = {
    ...oldApplication,
    ...updateData,
    id: applicationId, // Preserve original ID
    updatedAt: new Date().toISOString()
  };
  
  // Add to timeline if status changed
  if (updateData.status && updateData.status !== oldApplication.status) {
    updatedApplication.timeline = [
      ...(updatedApplication.timeline || []),
      {
        status: updateData.status,
        date: new Date().toISOString(),
        note: updateData.statusNote || `Status geändert zu: ${updateData.status}`
      }
    ];
  }
  
  existing.applications[applicationIndex] = updatedApplication;
  const stats = calculateApplicationStats(existing.applications);
  
  await saveApplications(userId, existing.applications);
  
  return { application: updatedApplication, stats };
}

async function deleteApplication(userId, applicationId) {
  const existing = await getUserApplications(userId);
  const applications = existing.applications.filter(a => a.id !== applicationId);
  await saveApplications(userId, applications);
}

async function saveApplications(userId, applications) {
  const timestamp = new Date().toISOString();
  const stats = calculateApplicationStats(applications);
  
  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'applications' },
      userId: { S: userId },
      applications: { S: JSON.stringify(applications) },
      stats: { S: JSON.stringify(stats) },
      updatedAt: { S: timestamp }
    }
  }));
}

async function getApplicationStats(userId) {
  const data = await getUserApplications(userId);
  return data.stats;
}

function calculateApplicationStats(applications) {
  const stats = {
    total: applications.length,
    pending: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    accepted: 0,
    withdrawn: 0
  };
  
  applications.forEach(app => {
    const status = (app.status || 'pending').toLowerCase();
    if (stats.hasOwnProperty(status)) {
      stats[status]++;
    }
  });
  
  // Calculate success rate
  const completed = stats.accepted + stats.rejected;
  stats.successRate = completed > 0 ? Math.round((stats.accepted / completed) * 100) : 0;
  
  return stats;
}

function authUser(event) {
  const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/, '');
  if (!token) throw new Error('unauthorized');
  
  // Validate JWT format (should have 3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('Invalid token format: expected 3 parts, got', parts.length);
    throw new Error('Invalid token format');
  }
  
  const payloadPart = parts[1];
  if (!payloadPart) {
    console.error('Token payload is undefined');
    throw new Error('Invalid token: missing payload');
  }
  
  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8'));
    if (!payload.sub) {
      console.error('Token payload missing sub field:', payload);
      throw new Error('Invalid token: missing user id');
    }
    return { userId: payload.sub, email: payload.email || '' };
  } catch (parseError) {
    console.error('Error parsing token payload:', parseError);
    throw new Error('Invalid token: could not parse payload');
  }
}

function json(code, body, headers) {
  return { statusCode: code, headers, body: body === null ? '' : JSON.stringify(body) };
}

// === JOURNAL/TAGEBUCH FUNKTIONEN ===

async function getJournalEntries(userId, queryParams = {}) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'journal' }
      }
    }));
    
    if (!result.Item) {
      return { entries: [], stats: { totalEntries: 0, streakDays: 0, thisMonth: 0 } };
    }
    
    let entries = JSON.parse(result.Item.entries?.S || '[]');
    
    // Optional filtering
    if (queryParams.from) {
      entries = entries.filter(e => new Date(e.date) >= new Date(queryParams.from));
    }
    if (queryParams.to) {
      entries = entries.filter(e => new Date(e.date) <= new Date(queryParams.to));
    }
    if (queryParams.type) {
      entries = entries.filter(e => e.type === queryParams.type);
    }
    
    // Sort by date descending (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const stats = calculateJournalStats(entries);
    
    return { entries, stats };
  } catch (error) {
    console.error('Error loading journal entries:', error);
    return { entries: [], stats: { totalEntries: 0, streakDays: 0, thisMonth: 0 } };
  }
}

async function getJournalEntriesByDate(userId, date) {
  const all = await getJournalEntries(userId);
  const targetDate = date.split('T')[0]; // Get just YYYY-MM-DD
  const entries = all.entries.filter(e => e.date.split('T')[0] === targetDate);
  return { entries, date: targetDate };
}

async function createJournalEntry(userId, entryData) {
  const existing = await getJournalEntries(userId);
  
  const entry = {
    id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: entryData.type || 'note', // 'note', 'training', 'journal', 'activity', 'mood'
    title: entryData.title || '',
    content: entryData.content || '',
    date: entryData.date || new Date().toISOString(),
    tags: entryData.tags || [],
    mood: entryData.mood || null, // 1-5 scale
    energy: entryData.energy || null, // 1-5 scale
    trainingData: entryData.trainingData || null, // { type, duration, intensity, exercises }
    metadata: entryData.metadata || {},
    isAutomatic: entryData.isAutomatic || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const entries = [entry, ...existing.entries];
  await saveJournalEntries(userId, entries);
  
  const stats = calculateJournalStats(entries);
  return { entry, stats };
}

async function updateJournalEntry(userId, entryId, updateData) {
  const existing = await getJournalEntries(userId);
  
  const entryIndex = existing.entries.findIndex(e => e.id === entryId);
  if (entryIndex === -1) {
    throw new Error('Journal entry not found');
  }
  
  const oldEntry = existing.entries[entryIndex];
  const updatedEntry = {
    ...oldEntry,
    ...updateData,
    id: entryId,
    updatedAt: new Date().toISOString()
  };
  
  existing.entries[entryIndex] = updatedEntry;
  await saveJournalEntries(userId, existing.entries);
  
  const stats = calculateJournalStats(existing.entries);
  return { entry: updatedEntry, stats };
}

async function deleteJournalEntry(userId, entryId) {
  const existing = await getJournalEntries(userId);
  const entries = existing.entries.filter(e => e.id !== entryId);
  await saveJournalEntries(userId, entries);
}

async function trackActivity(userId, activityData) {
  // Automatisches Tracking von Website-Aktivitäten
  const entry = await createJournalEntry(userId, {
    type: 'activity',
    title: activityData.title || 'Aktivität',
    content: activityData.description || '',
    date: new Date().toISOString(),
    tags: activityData.tags || ['auto-tracked'],
    metadata: {
      activityType: activityData.activityType, // 'method_completed', 'login', 'profile_updated', etc.
      source: activityData.source || 'website',
      ...activityData.metadata
    },
    isAutomatic: true
  });
  
  return entry;
}

async function saveJournalEntries(userId, entries) {
  const timestamp = new Date().toISOString();
  const stats = calculateJournalStats(entries);
  
  // Limit to last 1000 entries to prevent exceeding DynamoDB limits
  const limitedEntries = entries.slice(0, 1000);
  
  await getDynamoDB().send(new PutItemCommand({
    TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
    Item: {
      pk: { S: `user#${userId}` },
      sk: { S: 'journal' },
      userId: { S: userId },
      entries: { S: JSON.stringify(limitedEntries) },
      stats: { S: JSON.stringify(stats) },
      updatedAt: { S: timestamp }
    }
  }));
}

function calculateJournalStats(entries) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  // Entries this month
  const thisMonthEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear;
  });
  
  // Calculate streak
  let streakDays = 0;
  const sortedDates = [...new Set(entries.map(e => e.date.split('T')[0]))].sort().reverse();
  
  if (sortedDates.length > 0) {
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
    
    // Check if there's an entry today or yesterday
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streakDays = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i - 1]);
        const prevDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streakDays++;
        } else {
          break;
        }
      }
    }
  }
  
  // Count by type
  const byType = {};
  entries.forEach(e => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });
  
  // Average mood (if tracked)
  const moodEntries = entries.filter(e => e.mood != null);
  const avgMood = moodEntries.length > 0 
    ? Math.round(moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length * 10) / 10
    : null;
  
  return {
    totalEntries: entries.length,
    thisMonth: thisMonthEntries.length,
    streakDays,
    byType,
    avgMood,
    lastEntryDate: entries[0]?.date || null
  };
}

// ============================================================================
// API SETTINGS FUNCTIONS
// ============================================================================

/**
 * API-Einstellungen laden
 */
async function getApiSettings(userId) {
  try {
    const result = await getDynamoDB().send(new GetItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'api-settings' }
      }
    }));
    
    if (!result.Item) {
      return { hasSettings: false, settings: {} };
    }
    
    // API-Keys zurückgeben (maskiert für Anzeige, vollständig für Speicherung)
    const settings = {};
    const providers = ['openai', 'anthropic', 'google'];
    
    providers.forEach(provider => {
      if (result.Item[provider]) {
        const providerData = JSON.parse(result.Item[provider].S || '{}');
        settings[provider] = {
          apiKey: providerData.apiKey || '',
          keyMasked: providerData.apiKey ? maskApiKey(providerData.apiKey) : '',
          model: providerData.model || '',
          maxTokens: providerData.maxTokens || 1000,
          temperature: providerData.temperature ?? 0.7,
          configured: !!providerData.apiKey
        };
      }
    });
    
    return {
      hasSettings: Object.keys(settings).length > 0,
      settings,
      preferredProvider: result.Item.preferredProvider?.S || 'openai',
      updatedAt: result.Item.updatedAt?.S || null
    };
  } catch (error) {
    console.error('Error loading API settings:', error);
    return { hasSettings: false, settings: {}, error: error.message };
  }
}

/**
 * API-Key maskieren für sichere Anzeige
 */
function maskApiKey(key) {
  if (!key || key.length < 8) return '***';
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}

/**
 * API-Einstellungen speichern
 */
async function saveApiSettings(userId, settings) {
  try {
    const item = {
      pk: { S: `user#${userId}` },
      sk: { S: 'api-settings' },
      userId: { S: userId },
      updatedAt: { S: new Date().toISOString() }
    };
    
    // Provider-spezifische Einstellungen speichern
    const providers = ['openai', 'anthropic', 'google'];
    providers.forEach(provider => {
      if (settings[provider]) {
        item[provider] = { S: JSON.stringify({
          apiKey: settings[provider].apiKey,
          model: settings[provider].model,
          maxTokens: settings[provider].maxTokens,
          temperature: settings[provider].temperature
        })};
      }
    });
    
    // Bevorzugten Provider speichern
    if (settings.preferredProvider) {
      item.preferredProvider = { S: settings.preferredProvider };
    }
    
    await getDynamoDB().send(new PutItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Item: item
    }));
    
    console.log('✅ API settings saved for user:', userId);
    return { success: true, message: 'API settings saved successfully' };
  } catch (error) {
    console.error('Error saving API settings:', error);
    throw error;
  }
}

/**
 * API-Einstellungen löschen
 */
async function deleteApiSettings(userId) {
  try {
    await getDynamoDB().send(new DeleteItemCommand({
      TableName: process.env.TABLE || process.env.PROFILE_TABLE || 'mawps-user-profiles',
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'api-settings' }
      }
    }));
    
    console.log('✅ API settings deleted for user:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting API settings:', error);
    throw error;
  }
}

/**
 * API-Key testen (einfacher Format-Test)
 */
async function testApiKey(userId, provider = 'openai') {
  const settings = await getApiSettings(userId);
  
  if (!settings.hasSettings || !settings.settings[provider]?.apiKey) {
    return { success: false, error: `Kein API-Key für ${provider} konfiguriert` };
  }
  
  const apiKey = settings.settings[provider].apiKey;
  
  // Format-Validierung
  const patterns = {
    openai: /^sk-[A-Za-z0-9_\-]{20,}$/,
    anthropic: /^sk-ant-[A-Za-z0-9_\-]{20,}$/,
    google: /^AIza[0-9A-Za-z_\-]{20,}$/
  };
  
  const pattern = patterns[provider];
  if (pattern && !pattern.test(apiKey)) {
    return { success: false, error: 'Ungültiges API-Key Format' };
  }
  
  return { success: true, message: `${provider} API-Key Format ist gültig` };
}
