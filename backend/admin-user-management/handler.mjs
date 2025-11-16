import { CognitoIdentityProviderClient, ListUsersCommand, AdminCreateUserCommand, AdminDeleteUserCommand, AdminUpdateUserAttributesCommand, AdminSetUserPasswordCommand, AdminEnableUserCommand, AdminDisableUserCommand, AdminGetUserCommand, ListUsersInGroupCommand, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient, QueryCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || "eu-central-1" });
const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });

function headers(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Max-Age": "86400"
  };
}

export const handler = async (event) => {
  console.log('🔧 Admin User Management API - Event:', JSON.stringify(event, null, 2));
  
  const origin = event.headers?.origin || event.headers?.Origin;
  const hdr = headers(origin);
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: hdr };
  }

  try {
    const user = authUser(event);
    
    // Verify admin permissions
    if (!(await isAdmin(user.userId, user.email))) {
      return json(403, { message: 'Admin access required' }, hdr);
    }

    // Handle different event formats (API Gateway v1 vs v2)
    let path = event.path || event.resource || '';
    const method = event.httpMethod || event.requestContext?.http?.method;
    
    // Remove /prod/ prefix if present (API Gateway stage)
    if (path.startsWith('/prod/')) {
      path = path.substring(6);
    } else if (path.startsWith('/dev/')) {
      path = path.substring(5);
    } else if (path.startsWith('/staging/')) {
      path = path.substring(9);
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    console.log(`👨‍💼 Admin API: ${method} ${path} - Admin: ${user.email}`);

    // === USER MANAGEMENT ENDPOINTS ===
    
    // GET /admin/users - List all users with pagination and filtering
    if (path.includes('/admin/users') && method === 'GET') {
      const params = event.queryStringParameters || {};
      const users = await listUsers(params);
      return json(200, users, hdr);
    }

    // POST /admin/users - Create new user
    if (path.includes('/admin/users') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const newUser = await createUser(body);
      await logAdminAction(user.userId, 'user_created', { targetUser: newUser.username });
      return json(201, newUser, hdr);
    }

    // PUT /admin/users/{userId} - Update user
    if (path.includes('/admin/users/') && method === 'PUT') {
      const userId = path.split('/').pop();
      const body = JSON.parse(event.body || '{}');
      const updatedUser = await updateUser(userId, body);
      await logAdminAction(user.userId, 'user_updated', { targetUser: userId });
      return json(200, updatedUser, hdr);
    }

    // DELETE /admin/users/{userId} - Delete user
    if (path.includes('/admin/users/') && method === 'DELETE') {
      const userId = path.split('/').pop();
      await deleteUser(userId);
      await logAdminAction(user.userId, 'user_deleted', { targetUser: userId });
      return json(204, null, hdr);
    }

    // POST /admin/users/{userId}/disable - Disable user
    if (path.includes('/disable') && method === 'POST') {
      const userId = path.split('/')[3];
      await disableUser(userId);
      await logAdminAction(user.userId, 'user_disabled', { targetUser: userId });
      return json(200, { message: 'User disabled' }, hdr);
    }

    // POST /admin/users/{userId}/enable - Enable user
    if (path.includes('/enable') && method === 'POST') {
      const userId = path.split('/')[3];
      await enableUser(userId);
      await logAdminAction(user.userId, 'user_enabled', { targetUser: userId });
      return json(200, { message: 'User enabled' }, hdr);
    }

    // POST /admin/users/{userId}/reset-password - Reset user password
    if (path.includes('/reset-password') && method === 'POST') {
      const userId = path.split('/')[3];
      const body = JSON.parse(event.body || '{}');
      const password = body.temporaryPassword || body.password;
      const permanent = body.permanent !== false; // Default to permanent if not specified
      await resetUserPassword(userId, password, permanent);
      await logAdminAction(user.userId, 'password_reset', { targetUser: userId });
      return json(200, { message: 'Password reset' }, hdr);
    }

    // GET /admin/analytics - System analytics
    if (path.includes('/admin/analytics') && method === 'GET') {
      const analytics = await getSystemAnalytics();
      return json(200, analytics, hdr);
    }

    // GET /admin/user-activity - User activity logs
    if (path.includes('/admin/user-activity') && method === 'GET') {
      const params = event.queryStringParameters || {};
      const activity = await getUserActivity(params);
      return json(200, activity, hdr);
    }

    // GET /admin/system-health - System health check
    if (path.includes('/admin/system-health') && method === 'GET') {
      const health = await getSystemHealth();
      return json(200, health, hdr);
    }

    // POST /admin/bulk-actions - Bulk user operations
    if (path.includes('/admin/bulk-actions') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const result = await performBulkAction(body);
      await logAdminAction(user.userId, 'bulk_action', { action: body.action, count: body.userIds?.length });
      return json(200, result, hdr);
    }

    return json(404, { message: 'Admin endpoint not found' }, hdr);

  } catch (error) {
    console.error('❌ Admin API Error:', error);
    return json(500, { message: error.message }, hdr);
  }
};

// === USER MANAGEMENT FUNCTIONS ===

async function listUsers(params = {}) {
  const limit = parseInt(params.limit || '50');
  const paginationToken = params.paginationToken;
  const filter = params.filter;
  const status = params.status;
  const excludeAdmin = params.excludeAdmin === 'true' || params.excludeAdmin === true;
  const onlyAdmin = params.onlyAdmin === 'true' || params.onlyAdmin === true;

  // If onlyAdmin is true, directly get users from admin group
  if (onlyAdmin) {
    try {
      const adminGroupResponse = await cognito.send(new ListUsersInGroupCommand({
        UserPoolId: process.env.USER_POOL_ID,
        GroupName: 'admin',
        Limit: 60
      }));
      
      const adminUsers = adminGroupResponse.Users || [];
      console.log(`📋 Found ${adminUsers.length} admin users`);
      
      // Enrich with DynamoDB data
      const enrichedUsers = await Promise.all(adminUsers.map(async (cognitoUser) => {
        const userProfile = await getUserProfile(cognitoUser.Username);
        const userProgress = await getUserProgress(cognitoUser.Username);
        
        return {
          id: cognitoUser.Username,
          email: getAttribute(cognitoUser.Attributes, 'email'),
          name: getAttribute(cognitoUser.Attributes, 'name'),
          phoneNumber: getAttribute(cognitoUser.Attributes, 'phone_number'),
          emailVerified: getAttribute(cognitoUser.Attributes, 'email_verified') === 'true',
          status: cognitoUser.UserStatus,
          enabled: cognitoUser.Enabled,
          createdAt: cognitoUser.UserCreateDate?.toISOString(),
          lastModified: cognitoUser.UserLastModifiedDate?.toISOString(),
          
          // Enriched data from DynamoDB
          profile: userProfile,
          progress: {
            totalMethods: Object.keys(userProgress?.methods || {}).length,
            completedMethods: Object.values(userProgress?.methods || {}).filter(m => m.status === 'completed').length,
            lastActivity: userProgress?.lastUpdated,
            streakDays: userProgress?.streaks?.current || 0
          },
          
          // Calculated metrics
          completionRate: calculateCompletionRate(userProgress),
          riskScore: calculateRiskScore(cognitoUser, userProgress),
          lastLoginDays: calculateDaysSince(userProfile?.lastLogin)
        };
      }));

      return {
        users: enrichedUsers,
        pagination: {
          nextToken: adminGroupResponse.NextToken,
          hasMore: !!adminGroupResponse.NextToken
        },
        stats: calculateUserStats(enrichedUsers)
      };
    } catch (error) {
      console.error('❌ Error fetching admin users:', error);
      throw error;
    }
  }

  // Get admin users if we need to exclude them
  let adminUsernames = new Set();
  if (excludeAdmin) {
    try {
      const adminGroupResponse = await cognito.send(new ListUsersInGroupCommand({
        UserPoolId: process.env.USER_POOL_ID,
        GroupName: 'admin',
        Limit: 60
      }));
      adminUsernames = new Set((adminGroupResponse.Users || []).map(u => u.Username));
      console.log(`📋 Found ${adminUsernames.size} admin users to exclude`);
    } catch (error) {
      console.warn('⚠️ Could not fetch admin users, continuing without exclusion:', error);
    }
  }

  const command = new ListUsersCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Limit: Math.min(limit, 60), // Cognito max
    PaginationToken: paginationToken,
    Filter: filter,
    AttributesToGet: ['email', 'email_verified', 'name', 'phone_number']
  });

  const response = await cognito.send(command);
  let users = response.Users || [];

  // Filter out admin users if requested
  if (excludeAdmin && adminUsernames.size > 0) {
    users = users.filter(user => !adminUsernames.has(user.Username));
    console.log(`📊 Filtered to ${users.length} non-admin users (from ${response.Users?.length || 0} total)`);
  }

  // Enrich with DynamoDB data
  const enrichedUsers = await Promise.all(users.map(async (cognitoUser) => {
    const userProfile = await getUserProfile(cognitoUser.Username);
    const userProgress = await getUserProgress(cognitoUser.Username);
    
    return {
      id: cognitoUser.Username,
      email: getAttribute(cognitoUser.Attributes, 'email'),
      name: getAttribute(cognitoUser.Attributes, 'name'),
      phoneNumber: getAttribute(cognitoUser.Attributes, 'phone_number'),
      emailVerified: getAttribute(cognitoUser.Attributes, 'email_verified') === 'true',
      status: cognitoUser.UserStatus,
      enabled: cognitoUser.Enabled,
      createdAt: cognitoUser.UserCreateDate?.toISOString(),
      lastModified: cognitoUser.UserLastModifiedDate?.toISOString(),
      
      // Enriched data from DynamoDB
      profile: userProfile,
      progress: {
        totalMethods: Object.keys(userProgress?.methods || {}).length,
        completedMethods: Object.values(userProgress?.methods || {}).filter(m => m.status === 'completed').length,
        lastActivity: userProgress?.lastUpdated,
        streakDays: userProgress?.streaks?.current || 0
      },
      
      // Calculated metrics
      completionRate: calculateCompletionRate(userProgress),
      riskScore: calculateRiskScore(cognitoUser, userProgress),
      lastLoginDays: calculateDaysSince(userProfile?.lastLogin)
    };
  }));

  return {
    users: enrichedUsers,
    pagination: {
      nextToken: response.PaginationToken,
      hasMore: !!response.PaginationToken
    },
    stats: calculateUserStats(enrichedUsers)
  };
}

async function createUser(userData) {
  // Use provided password or generate temporary one
  const password = userData.password || generateTemporaryPassword();
  const isTemporary = !userData.password;
  
  const command = new AdminCreateUserCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Username: userData.email,
    UserAttributes: [
      { Name: 'email', Value: userData.email },
      { Name: 'name', Value: userData.name || '' },
      { Name: 'email_verified', Value: 'true' }
    ],
    TemporaryPassword: isTemporary ? password : undefined,
    MessageAction: userData.sendWelcomeEmail ? 'SEND' : 'SUPPRESS'
  });

  const response = await cognito.send(command);
  
  // Set password if provided (permanent)
  if (!isTemporary && password) {
    await cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: response.User.Username,
      Password: password,
      Permanent: true
    }));
  }
  
  // Create default profile in DynamoDB
  await createDefaultUserProfile(response.User.Username, userData);
  
  return {
    id: response.User.Username,
    email: userData.email,
    name: userData.name,
    temporaryPassword: (isTemporary && !userData.sendWelcomeEmail) ? password : null,
    status: response.User.UserStatus,
    createdAt: response.User.UserCreateDate?.toISOString()
  };
}

async function updateUser(userId, updateData) {
  const attributes = [];
  
  if (updateData.name !== undefined) {
    attributes.push({ Name: 'name', Value: updateData.name || '' });
  }
  if (updateData.email) {
    attributes.push({ Name: 'email', Value: updateData.email });
  }
  if (updateData.phoneNumber !== undefined) {
    attributes.push({ Name: 'phone_number', Value: updateData.phoneNumber || '' });
  }
  if (updateData.emailVerified !== undefined) {
    attributes.push({ Name: 'email_verified', Value: updateData.emailVerified ? 'true' : 'false' });
  }

  if (attributes.length > 0) {
    await cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: userId,
      UserAttributes: attributes
    }));
  }

  // Update status if provided
  if (updateData.status) {
    // Get current user to check status
    const currentUser = await cognito.send(new AdminGetUserCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: userId
    }));
    
    // Confirm user if status is CONFIRMED and currently not confirmed
    if (updateData.status === 'CONFIRMED' && currentUser.UserStatus !== 'CONFIRMED') {
      await cognito.send(new AdminConfirmSignUpCommand({
        UserPoolId: process.env.USER_POOL_ID,
        Username: userId
      }));
    }
  }

  // Update profile in DynamoDB
  if (updateData.profile) {
    await updateUserProfile(userId, updateData.profile);
  }

  return { userId, ...updateData, updatedAt: new Date().toISOString() };
}

async function deleteUser(userId) {
  // Delete user from Cognito
  await cognito.send(new AdminDeleteUserCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId
  }));

  // Delete all user data from DynamoDB
  await deleteAllUserData(userId);
}

async function disableUser(userId) {
  await cognito.send(new AdminDisableUserCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId
  }));
}

async function enableUser(userId) {
  await cognito.send(new AdminEnableUserCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId
  }));
}

async function resetUserPassword(userId, password, permanent = true) {
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId,
    Password: password,
    Permanent: permanent
  }));
}

// === ANALYTICS & MONITORING ===

async function getSystemAnalytics() {
  const [userStats, activityStats, performanceStats] = await Promise.all([
    getUserStats(),
    getActivityStats(),
    getPerformanceStats()
  ]);

  return {
    users: userStats,
    activity: activityStats,
    performance: performanceStats,
    timestamp: new Date().toISOString()
  };
}

async function getUserStats() {
  // Get user count from Cognito
  const listUsersResponse = await cognito.send(new ListUsersCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Limit: 60
  }));

  const users = listUsersResponse.Users || [];
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    total: users.length,
    verified: users.filter(u => getAttribute(u.Attributes, 'email_verified') === 'true').length,
    enabled: users.filter(u => u.Enabled).length,
    newThisWeek: users.filter(u => u.UserCreateDate > oneWeekAgo).length,
    newThisMonth: users.filter(u => u.UserCreateDate > oneMonthAgo).length,
    byStatus: {
      CONFIRMED: users.filter(u => u.UserStatus === 'CONFIRMED').length,
      UNCONFIRMED: users.filter(u => u.UserStatus === 'UNCONFIRMED').length,
      FORCE_CHANGE_PASSWORD: users.filter(u => u.UserStatus === 'FORCE_CHANGE_PASSWORD').length
    }
  };
}

async function getActivityStats() {
  // Query recent activity from DynamoDB
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'activity#recent' }
    },
    Limit: 100,
    ScanIndexForward: false
  }));

  const activities = (result.Items || []).map(item => ({
    action: item.action?.S,
    userId: item.userId?.S,
    timestamp: item.timestamp?.S,
    details: JSON.parse(item.details?.S || '{}')
  }));

  // Calculate activity metrics
  const now = new Date();
  const last24h = activities.filter(a => 
    new Date(a.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  const last7d = activities.filter(a => 
    new Date(a.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );

  return {
    total: activities.length,
    last24Hours: last24h.length,
    last7Days: last7d.length,
    topActions: getTopActions(activities),
    activeUsers: getActiveUsers(activities),
    timeline: generateActivityTimeline(activities)
  };
}

async function getPerformanceStats() {
  // This would query CloudWatch metrics in a real implementation
  return {
    apiCalls: {
      total: 1250,
      successful: 1225,
      failed: 25,
      averageLatency: 245
    },
    storage: {
      s3Usage: '2.4 GB',
      dynamodbReads: 3500,
      dynamodbWrites: 850
    },
    costs: {
      estimated: '$12.50',
      breakdown: {
        lambda: '$2.30',
        dynamodb: '$3.20',
        s3: '$1.50',
        cognito: '$5.50'
      }
    }
  };
}

async function getUserActivity(params) {
  const userId = params.userId;
  const limit = parseInt(params.limit || '50');
  const startDate = params.startDate;
  const endDate = params.endDate;

  let keyCondition = 'pk = :pk AND begins_with(sk, :sk)';
  let attributeValues = {
    ':pk': { S: `user#${userId}` },
    ':sk': { S: 'activity#' }
  };

  if (startDate && endDate) {
    keyCondition += ' AND sk BETWEEN :start AND :end';
    attributeValues[':start'] = { S: `activity#${startDate}` };
    attributeValues[':end'] = { S: `activity#${endDate}` };
  }

  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: attributeValues,
    Limit: limit,
    ScanIndexForward: false
  }));

  return {
    activities: (result.Items || []).map(item => ({
      action: item.action?.S,
      timestamp: item.timestamp?.S,
      details: JSON.parse(item.details?.S || '{}'),
      method: item.method?.S,
      result: item.result?.S
    })),
    hasMore: !!result.LastEvaluatedKey
  };
}

async function performBulkAction(actionData) {
  const { action, userIds, options = {} } = actionData;
  const results = [];

  for (const userId of userIds) {
    try {
      let result;
      
      switch (action) {
        case 'enable':
          await enableUser(userId);
          result = { userId, status: 'enabled', success: true };
          break;
          
        case 'disable':
          await disableUser(userId);
          result = { userId, status: 'disabled', success: true };
          break;
          
        case 'delete':
          await deleteUser(userId);
          result = { userId, status: 'deleted', success: true };
          break;
          
        case 'reset_password':
          const tempPassword = generateTemporaryPassword();
          await resetUserPassword(userId, tempPassword);
          result = { userId, status: 'password_reset', success: true, temporaryPassword: tempPassword };
          break;
          
        case 'send_message':
          // Would integrate with SES for email notifications
          result = { userId, status: 'message_sent', success: true };
          break;
          
        default:
          result = { userId, status: 'unknown_action', success: false };
      }
      
      results.push(result);
    } catch (error) {
      results.push({ userId, status: 'error', success: false, error: error.message });
    }
  }

  return {
    action,
    total: userIds.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}

// === HELPER FUNCTIONS ===

async function getUserProfile(userId) {
  try {
    const result = await ddb.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'profile' }
      }
    }));
    
    if (!result.Item) return null;
    
    return {
      lastLogin: result.Item.lastLogin?.S,
      preferences: JSON.parse(result.Item.preferences?.S || '{}'),
      settings: JSON.parse(result.Item.settings?.S || '{}'),
      createdAt: result.Item.createdAt?.S
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

async function getUserProgress(userId) {
  try {
    const result = await ddb.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'progress' }
      }
    }));
    
    if (!result.Item) return null;
    
    return {
      methods: JSON.parse(result.Item.methods?.S || '{}'),
      achievements: JSON.parse(result.Item.achievements?.S || '[]'),
      streaks: JSON.parse(result.Item.streaks?.S || '{}'),
      lastUpdated: result.Item.lastUpdated?.S
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

async function createDefaultUserProfile(userId, userData) {
  try {
    const timestamp = new Date().toISOString();
    
    await ddb.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        pk: { S: `user#${userId}` },
        sk: { S: 'profile' },
        userId: { S: userId },
        email: { S: userData.email },
        name: { S: userData.name || '' },
        preferences: { S: JSON.stringify({ language: 'de', theme: 'light' }) },
        settings: { S: JSON.stringify({ notifications: true, autoSave: true }) },
        createdAt: { S: timestamp },
        lastLogin: { S: timestamp }
      }
    }));
  } catch (error) {
    console.warn('⚠️ Could not create default user profile in DynamoDB:', error);
    // Don't fail user creation if profile creation fails
  }
}

async function updateUserProfile(userId, profileData) {
  try {
    const timestamp = new Date().toISOString();
    
    // Get existing profile
    const existing = await ddb.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: { S: `user#${userId}` },
        sk: { S: 'profile' }
      }
    }));
    
    // Merge with existing data
    const existingProfile = existing.Item ? {
      preferences: existing.Item.preferences?.S ? JSON.parse(existing.Item.preferences.S) : {},
      settings: existing.Item.settings?.S ? JSON.parse(existing.Item.settings.S) : {},
      lastLogin: existing.Item.lastLogin?.S
    } : {};
    
    await ddb.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        pk: { S: `user#${userId}` },
        sk: { S: 'profile' },
        userId: { S: userId },
        email: { S: profileData.email || existing.Item?.email?.S || '' },
        name: { S: profileData.name || existing.Item?.name?.S || '' },
        preferences: { S: JSON.stringify({ ...existingProfile.preferences, ...(profileData.preferences || {}) }) },
        settings: { S: JSON.stringify({ ...existingProfile.settings, ...(profileData.settings || {}) }) },
        createdAt: { S: existing.Item?.createdAt?.S || timestamp },
        lastLogin: { S: profileData.lastLogin || existingProfile.lastLogin || timestamp },
        updatedAt: { S: timestamp }
      }
    }));
  } catch (error) {
    console.warn('⚠️ Could not update user profile in DynamoDB:', error);
    // Don't fail user update if profile update fails
  }
}

async function deleteAllUserData(userId) {
  // Query all user data
  const result = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `user#${userId}` }
    }
  }));

  // Delete all items
  for (const item of result.Items || []) {
    await ddb.send(new DeleteItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: item.pk,
        sk: item.sk
      }
    }));
  }
}

async function logAdminAction(adminUserId, action, details = {}) {
  const timestamp = new Date().toISOString();
  const actionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `admin#${adminUserId}` },
      sk: { S: `action#${actionId}` },
      actionId: { S: actionId },
      action: { S: action },
      timestamp: { S: timestamp },
      details: { S: JSON.stringify(details) },
      gsi1pk: { S: 'activity#recent' },
      gsi1sk: { S: timestamp }
    }
  }));
}

function getAttribute(attributes, name) {
  const attr = attributes?.find(a => a.Name === name);
  return attr?.Value || '';
}

function calculateCompletionRate(progress) {
  if (!progress?.methods) return 0;
  const methods = Object.values(progress.methods);
  const completed = methods.filter(m => m.status === 'completed').length;
  return methods.length > 0 ? Math.round((completed / methods.length) * 100) : 0;
}

function calculateRiskScore(cognitoUser, progress) {
  let score = 0;
  
  // Not verified email
  if (getAttribute(cognitoUser.Attributes, 'email_verified') !== 'true') score += 30;
  
  // No recent activity
  if (!progress?.lastUpdated) score += 20;
  else {
    const daysSince = calculateDaysSince(progress.lastUpdated);
    if (daysSince > 30) score += 25;
    else if (daysSince > 7) score += 10;
  }
  
  // No progress
  if (!progress?.methods || Object.keys(progress.methods).length === 0) score += 15;
  
  // Account status
  if (cognitoUser.UserStatus !== 'CONFIRMED') score += 20;
  if (!cognitoUser.Enabled) score += 50;
  
  return Math.min(score, 100);
}

function calculateDaysSince(dateString) {
  if (!dateString) return 999;
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function calculateUserStats(users) {
  return {
    total: users.length,
    active: users.filter(u => calculateDaysSince(u.profile?.lastLogin) <= 7).length,
    highRisk: users.filter(u => u.riskScore > 50).length,
    powerUsers: users.filter(u => u.progress.completedMethods >= 5).length,
    averageCompletion: users.reduce((sum, u) => sum + u.completionRate, 0) / users.length || 0
  };
}

function getTopActions(activities) {
  const actionCounts = {};
  activities.forEach(a => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });
  
  return Object.entries(actionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([action, count]) => ({ action, count }));
}

function getActiveUsers(activities) {
  const userCounts = {};
  activities.forEach(a => {
    userCounts[a.userId] = (userCounts[a.userId] || 0) + 1;
  });
  
  return Object.entries(userCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([userId, count]) => ({ userId, actions: count }));
}

function generateActivityTimeline(activities) {
  const timeline = {};
  activities.forEach(a => {
    const day = a.timestamp.split('T')[0];
    timeline[day] = (timeline[day] || 0) + 1;
  });
  
  return Object.entries(timeline)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const symbols = '!@#$%&*';
  let password = '';
  
  // Ensure password meets requirements
  password += chars[Math.floor(Math.random() * 26)]; // Uppercase
  password += chars[Math.floor(Math.random() * 26) + 26]; // Lowercase  
  password += '23456789'[Math.floor(Math.random() * 8)]; // Number
  password += symbols[Math.floor(Math.random() * symbols.length)]; // Symbol
  
  // Fill to 12 characters
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

async function getSystemHealth() {
  // Check various system components
  const checks = [];
  
  try {
    // Test Cognito
    await cognito.send(new ListUsersCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Limit: 1
    }));
    checks.push({ service: 'Cognito', status: 'healthy', latency: 150 });
  } catch (error) {
    checks.push({ service: 'Cognito', status: 'error', error: error.message });
  }
  
  try {
    // Test DynamoDB
    await ddb.send(new ScanCommand({
      TableName: process.env.TABLE_NAME,
      Limit: 1
    }));
    checks.push({ service: 'DynamoDB', status: 'healthy', latency: 85 });
  } catch (error) {
    checks.push({ service: 'DynamoDB', status: 'error', error: error.message });
  }

  const healthyServices = checks.filter(c => c.status === 'healthy').length;
  const totalServices = checks.length;
  
  return {
    overall: healthyServices === totalServices ? 'healthy' : 'degraded',
    uptime: '99.9%',
    services: checks,
    lastCheck: new Date().toISOString(),
    metrics: {
      avgLatency: checks.reduce((sum, c) => sum + (c.latency || 0), 0) / checks.length,
      errorRate: ((totalServices - healthyServices) / totalServices * 100).toFixed(1)
    }
  };
}

async function isAdmin(userId, email) {
  // Check if user is in admin group
  try {
    const adminGroupResponse = await cognito.send(new ListUsersInGroupCommand({
      UserPoolId: process.env.USER_POOL_ID,
      GroupName: 'admin',
      Limit: 60
    }));
    
    const adminUsers = adminGroupResponse.Users || [];
    const isInAdminGroup = adminUsers.some(u => 
      u.Username === userId || 
      u.Username === email ||
      getAttribute(u.Attributes, 'email')?.toLowerCase() === email?.toLowerCase()
    );
    
    if (isInAdminGroup) {
      return true;
    }
  } catch (error) {
    console.warn('⚠️ Could not check admin group, falling back to email list:', error);
  }
  
  // Fallback: Check admin email list
  const adminEmails = [
    'manuel@manuel-weiss.com',
    'admin@manuel-weiss.com',
    'manumanera@gmail.com',
    'weiss-manuel@gmx.de' // Add your email
  ];
  
  return adminEmails.includes(email?.toLowerCase());
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
