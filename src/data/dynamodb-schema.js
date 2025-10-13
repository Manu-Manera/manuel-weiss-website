/**
 * DynamoDB Schema Definition
 * Vollständiges Datenmodell für Manuel Weiss Enterprise Platform
 */

export const DynamoDBSchema = {
  // Users Table
  users: {
    tableName: 'mw-users',
    partitionKey: 'PK',
    sortKey: 'SK',
    attributes: {
      PK: 'S', // USER#<userId>
      SK: 'S', // PROFILE | SETTINGS | PREFERENCES
      userId: 'S',
      email: 'S',
      name: 'S',
      role: 'S', // user | admin | superadmin
      status: 'S', // active | inactive | suspended
      createdAt: 'S',
      updatedAt: 'S',
      lastLogin: 'S',
      profileData: 'M', // Nested object for profile information
      preferences: 'M', // User preferences
      permissions: 'L' // List of permissions
    },
    globalSecondaryIndexes: [
      {
        indexName: 'GSI1',
        partitionKey: 'email',
        sortKey: 'createdAt'
      }
    ],
    localSecondaryIndexes: [
      {
        indexName: 'LSI1',
        sortKey: 'updatedAt'
      }
    ]
  },

  // Applications Table
  applications: {
    tableName: 'mw-applications',
    partitionKey: 'PK',
    sortKey: 'SK',
    attributes: {
      PK: 'S', // USER#<userId>
      SK: 'S', // APP#<appId>
      appId: 'S',
      userId: 'S',
      status: 'S', // DRAFT | ANALYZING | GENERATING_LETTER | REVIEW | READY | FAILED
      position: 'S',
      company: 'S',
      jobDescription: 'S',
      generatedCoverLetter: 'S',
      matchingScore: 'N',
      createdAt: 'S',
      updatedAt: 'S',
      submittedAt: 'S',
      version: 'N', // For optimistic concurrency
      fields: 'M', // Dynamic fields
      metadata: 'M', // Additional metadata
      tags: 'L' // List of tags
    },
    globalSecondaryIndexes: [
      {
        indexName: 'GSI1',
        partitionKey: 'appId',
        sortKey: 'createdAt'
      },
      {
        indexName: 'GSI2',
        partitionKey: 'status',
        sortKey: 'updatedAt'
      }
    ],
    localSecondaryIndexes: [
      {
        indexName: 'LSI1',
        sortKey: 'submittedAt'
      }
    ]
  },

  // Media Table
  media: {
    tableName: 'mw-media',
    partitionKey: 'PK',
    sortKey: 'SK',
    attributes: {
      PK: 'S', // USER#<userId>
      SK: 'S', // MEDIA#<mediaId>
      mediaId: 'S',
      userId: 'S',
      key: 'S', // S3 object key
      filename: 'S',
      type: 'S', // MIME type
      size: 'N',
      width: 'N',
      height: 'N',
      cdnUrl: 'S',
      thumbnailUrl: 'S',
      createdAt: 'S',
      updatedAt: 'S',
      tags: 'L',
      metadata: 'M',
      virusStatus: 'S', // clean | infected | scanning
      derivatives: 'M' // Thumbnails, different sizes
    },
    globalSecondaryIndexes: [
      {
        indexName: 'GSI1',
        partitionKey: 'mediaId',
        sortKey: 'createdAt'
      },
      {
        indexName: 'GSI2',
        partitionKey: 'type',
        sortKey: 'createdAt'
      }
    ]
  },

  // Jobs Table (for workflow tracking)
  jobs: {
    tableName: 'mw-jobs',
    partitionKey: 'PK',
    sortKey: 'SK',
    attributes: {
      PK: 'S', // JOB#<jobId>
      SK: 'S', // STATE#<status>
      jobId: 'S',
      appId: 'S',
      userId: 'S',
      status: 'S', // PENDING | IN_PROGRESS | READY | FAILED | RETRYING
      progress: 'N',
      lastUpdate: 'S',
      error: 'S',
      retryCount: 'N',
      maxRetries: 'N',
      createdAt: 'S',
      completedAt: 'S',
      workflowData: 'M',
      result: 'M'
    },
    globalSecondaryIndexes: [
      {
        indexName: 'GSI1',
        partitionKey: 'appId',
        sortKey: 'createdAt'
      },
      {
        indexName: 'GSI2',
        partitionKey: 'status',
        sortKey: 'lastUpdate'
      }
    ]
  },

  // Analytics Table
  analytics: {
    tableName: 'mw-analytics',
    partitionKey: 'PK',
    sortKey: 'SK',
    attributes: {
      PK: 'S', // ANALYTICS#<date> | USER#<userId>
      SK: 'S', // EVENT#<eventId> | METRIC#<metricName>
      eventId: 'S',
      userId: 'S',
      eventType: 'S',
      eventData: 'M',
      timestamp: 'S',
      sessionId: 'S',
      userAgent: 'S',
      ipAddress: 'S'
    },
    globalSecondaryIndexes: [
      {
        indexName: 'GSI1',
        partitionKey: 'eventType',
        sortKey: 'timestamp'
      },
      {
        indexName: 'GSI2',
        partitionKey: 'userId',
        sortKey: 'timestamp'
      }
    ]
  }
};

/**
 * DynamoDB Item Builders
 */
export class DynamoDBItemBuilder {
  /**
   * User Item erstellen
   */
  static createUser(userData) {
    const userId = userData.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    return {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      userId,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      profileData: userData.profileData || {},
      preferences: userData.preferences || {},
      permissions: userData.permissions || []
    };
  }

  /**
   * Application Item erstellen
   */
  static createApplication(appData) {
    const appId = appData.appId || `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    return {
      PK: `USER#${appData.userId}`,
      SK: `APP#${appId}`,
      appId,
      userId: appData.userId,
      status: 'DRAFT',
      position: appData.position,
      company: appData.company,
      jobDescription: appData.jobDescription,
      generatedCoverLetter: null,
      matchingScore: 0,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      version: 1,
      fields: appData.fields || {},
      metadata: appData.metadata || {},
      tags: appData.tags || []
    };
  }

  /**
   * Media Item erstellen
   */
  static createMedia(mediaData) {
    const mediaId = mediaData.mediaId || `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    return {
      PK: `USER#${mediaData.userId}`,
      SK: `MEDIA#${mediaId}`,
      mediaId,
      userId: mediaData.userId,
      key: mediaData.key,
      filename: mediaData.filename,
      type: mediaData.type,
      size: mediaData.size,
      width: mediaData.width || null,
      height: mediaData.height || null,
      cdnUrl: mediaData.cdnUrl,
      thumbnailUrl: mediaData.thumbnailUrl || null,
      createdAt: now,
      updatedAt: now,
      tags: mediaData.tags || [],
      metadata: mediaData.metadata || {},
      virusStatus: 'scanning',
      derivatives: mediaData.derivatives || {}
    };
  }

  /**
   * Job Item erstellen
   */
  static createJob(jobData) {
    const jobId = jobData.jobId || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    return {
      PK: `JOB#${jobId}`,
      SK: `STATE#${jobData.status || 'PENDING'}`,
      jobId,
      appId: jobData.appId,
      userId: jobData.userId,
      status: jobData.status || 'PENDING',
      progress: 0,
      lastUpdate: now,
      error: null,
      retryCount: 0,
      maxRetries: jobData.maxRetries || 3,
      createdAt: now,
      completedAt: null,
      workflowData: jobData.workflowData || {},
      result: null
    };
  }

  /**
   * Analytics Event erstellen
   */
  static createAnalyticsEvent(eventData) {
    const eventId = eventData.eventId || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    return {
      PK: `ANALYTICS#${now.split('T')[0]}`, // Date-based partition
      SK: `EVENT#${eventId}`,
      eventId,
      userId: eventData.userId,
      eventType: eventData.eventType,
      eventData: eventData.eventData || {},
      timestamp: now,
      sessionId: eventData.sessionId,
      userAgent: eventData.userAgent || navigator.userAgent,
      ipAddress: eventData.ipAddress
    };
  }
}

/**
 * DynamoDB Query Helpers
 */
export class DynamoDBQueryHelper {
  /**
   * User by ID abrufen
   */
  static getUserById(userId) {
    return {
      TableName: 'mw-users',
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }
    };
  }

  /**
   * Applications by User abrufen
   */
  static getApplicationsByUser(userId, limit = 20, lastKey = null) {
    const params = {
      TableName: 'mw-applications',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`
      },
      ScanIndexForward: false, // Newest first
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    return params;
  }

  /**
   * Media by User abrufen
   */
  static getMediaByUser(userId, limit = 20, lastKey = null) {
    const params = {
      TableName: 'mw-media',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`
      },
      ScanIndexForward: false, // Newest first
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    return params;
  }

  /**
   * Jobs by Application abrufen
   */
  static getJobsByApplication(appId) {
    return {
      TableName: 'mw-jobs',
      IndexName: 'GSI1',
      KeyConditionExpression: 'appId = :appId',
      ExpressionAttributeValues: {
        ':appId': appId
      },
      ScanIndexForward: false
    };
  }
}

export default DynamoDBSchema;
