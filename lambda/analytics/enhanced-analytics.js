/**
 * Enhanced Analytics Handler
 * Erweiterte Analytics für datengetriebene Entscheidungen
 */

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('📊 Enhanced Analytics Handler gestartet:', JSON.stringify(event, null, 2));
    
    try {
        const { action, data } = JSON.parse(event.body);
        
        switch (action) {
            case 'trackEngagement':
                return await trackUserEngagement(data);
            case 'calculateSuccessRate':
                return await calculateSuccessRate(data);
            case 'trackAIUsage':
                return await trackAIUsage(data);
            case 'getDashboardData':
                return await getDashboardData(data);
            case 'getUserAnalytics':
                return await getUserAnalytics(data);
            case 'getSystemMetrics':
                return await getSystemMetrics(data);
            default:
                throw new Error(`Unbekannte Analytics-Aktion: ${action}`);
        }
    } catch (error) {
        console.error('❌ Fehler im Enhanced Analytics Handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

/**
 * User Engagement Tracking
 */
async function trackUserEngagement(data) {
    const { userId, action, metadata, sessionId } = data;
    
    try {
        await dynamodb.put({
            TableName: 'UserEngagement',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: userId,
                action: action,
                metadata: metadata,
                sessionId: sessionId,
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0]
            }
        }).promise();
        
        console.log('✅ User Engagement getrackt:', { userId, action });
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Engagement erfolgreich getrackt'
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Tracking des User Engagements:', error);
        throw error;
    }
}

/**
 * Success Rate berechnen
 */
async function calculateSuccessRate(data) {
    const { userId, timeRange = '30d' } = data;
    
    try {
        // Zeitraum berechnen
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }
        
        // Bewerbungen abrufen
        const applications = await getApplicationsByUser(userId, startDate, endDate);
        
        // Erfolgreiche Bewerbungen
        const successfulApplications = applications.filter(app => 
            app.status === 'success' || app.status === 'interview' || app.status === 'offer'
        );
        
        // Erfolgsrate berechnen
        const successRate = applications.length > 0 
            ? (successfulApplications.length / applications.length) * 100 
            : 0;
        
        // Detaillierte Analyse
        const analysis = {
            totalApplications: applications.length,
            successfulApplications: successfulApplications.length,
            successRate: Math.round(successRate * 100) / 100,
            timeRange: timeRange,
            breakdown: {
                applications: applications.length,
                interviews: applications.filter(app => app.status === 'interview').length,
                offers: applications.filter(app => app.status === 'offer').length,
                rejections: applications.filter(app => app.status === 'rejected').length,
                pending: applications.filter(app => app.status === 'pending').length
            },
            trends: await calculateTrends(userId, timeRange),
            recommendations: await generateRecommendations(successRate, applications)
        };
        
        // Analytics in Datenbank speichern
        await saveSuccessRateAnalysis(userId, analysis);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                analysis: analysis
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Success Rate Berechnung:', error);
        throw error;
    }
}

/**
 * AI Usage Tracking
 */
async function trackAIUsage(data) {
    const { userId, aiFeature, tokensUsed, cost, model } = data;
    
    try {
        await dynamodb.put({
            TableName: 'AIUsage',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: userId,
                feature: aiFeature,
                tokensUsed: tokensUsed,
                cost: cost,
                model: model,
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0]
            }
        }).promise();
        
        console.log('✅ AI Usage getrackt:', { userId, aiFeature, tokensUsed });
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'AI Usage erfolgreich getrackt'
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Tracking der AI Usage:', error);
        throw error;
    }
}

/**
 * Dashboard Daten abrufen
 */
async function getDashboardData(data) {
    const { userId } = data;
    
    try {
        // Verschiedene Analytics parallel abrufen
        const [
            userStats,
            recentApplications,
            aiUsageStats,
            successRate,
            engagementStats
        ] = await Promise.all([
            getUserStats(userId),
            getRecentApplications(userId),
            getAIUsageStats(userId),
            calculateSuccessRate({ userId, timeRange: '30d' }),
            getEngagementStats(userId)
        ]);
        
        const dashboardData = {
            userStats,
            recentApplications,
            aiUsageStats,
            successRate: JSON.parse(successRate.body).analysis,
            engagementStats,
            timestamp: Date.now()
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                dashboard: dashboardData
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Dashboard-Daten:', error);
        throw error;
    }
}

/**
 * User Analytics abrufen
 */
async function getUserAnalytics(data) {
    const { userId, timeRange = '30d' } = data;
    
    try {
        const analytics = {
            applications: await getApplicationAnalytics(userId, timeRange),
            aiUsage: await getAIUsageAnalytics(userId, timeRange),
            engagement: await getEngagementAnalytics(userId, timeRange),
            performance: await getPerformanceAnalytics(userId, timeRange),
            recommendations: await getUserRecommendations(userId)
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                analytics: analytics
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der User Analytics:', error);
        throw error;
    }
}

/**
 * System Metrics abrufen
 */
async function getSystemMetrics(data) {
    try {
        const metrics = {
            totalUsers: await getTotalUsers(),
            activeUsers: await getActiveUsers(),
            totalApplications: await getTotalApplications(),
            aiUsageStats: await getSystemAIUsageStats(),
            systemHealth: await getSystemHealth(),
            performanceMetrics: await getPerformanceMetrics()
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                metrics: metrics
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der System Metrics:', error);
        throw error;
    }
}

/**
 * Bewerbungen nach Benutzer abrufen
 */
async function getApplicationsByUser(userId, startDate, endDate) {
    try {
        const params = {
            TableName: 'Applications',
            FilterExpression: 'userId = :userId AND createdAt BETWEEN :startDate AND :endDate',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':startDate': startDate.toISOString(),
                ':endDate': endDate.toISOString()
            }
        };
        
        const result = await dynamodb.scan(params).promise();
        return result.Items;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Bewerbungen:', error);
        return [];
    }
}

/**
 * Trends berechnen
 */
async function calculateTrends(userId, timeRange) {
    // Implementierung für Trend-Berechnung
    return {
        applicationsTrend: 'steigend',
        successRateTrend: 'stabil',
        aiUsageTrend: 'steigend'
    };
}

/**
 * Empfehlungen generieren
 */
async function generateRecommendations(successRate, applications) {
    const recommendations = [];
    
    if (successRate < 20) {
        recommendations.push('Erwägen Sie eine Überarbeitung Ihrer Bewerbungsstrategie');
        recommendations.push('Fokussieren Sie sich auf passendere Stellen');
    } else if (successRate < 50) {
        recommendations.push('Optimieren Sie Ihre Anschreiben für bessere Ergebnisse');
        recommendations.push('Erweitern Sie Ihr Netzwerk in der Branche');
    } else {
        recommendations.push('Ihre Bewerbungsstrategie funktioniert gut!');
        recommendations.push('Erwägen Sie eine Gehaltsverhandlung');
    }
    
    return recommendations;
}

/**
 * User Stats abrufen
 */
async function getUserStats(userId) {
    try {
        const params = {
            TableName: 'Users',
            Key: { id: userId }
        };
        
        const result = await dynamodb.get(params).promise();
        return result.Item;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der User Stats:', error);
        return null;
    }
}

/**
 * Recent Applications abrufen
 */
async function getRecentApplications(userId) {
    try {
        const params = {
            TableName: 'Applications',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: 10,
            ScanIndexForward: false
        };
        
        const result = await dynamodb.scan(params).promise();
        return result.Items;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Recent Applications:', error);
        return [];
    }
}

/**
 * AI Usage Stats abrufen
 */
async function getAIUsageStats(userId) {
    try {
        const params = {
            TableName: 'AIUsage',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Stats berechnen
        const totalTokens = result.Items.reduce((sum, item) => sum + item.tokensUsed, 0);
        const totalCost = result.Items.reduce((sum, item) => sum + item.cost, 0);
        const features = [...new Set(result.Items.map(item => item.feature))];
        
        return {
            totalTokens,
            totalCost,
            features,
            usageCount: result.Items.length
        };
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der AI Usage Stats:', error);
        return { totalTokens: 0, totalCost: 0, features: [], usageCount: 0 };
    }
}

/**
 * Engagement Stats abrufen
 */
async function getEngagementStats(userId) {
    try {
        const params = {
            TableName: 'UserEngagement',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Engagement Stats berechnen
        const actions = result.Items.map(item => item.action);
        const actionCounts = actions.reduce((acc, action) => {
            acc[action] = (acc[action] || 0) + 1;
            return acc;
        }, {});
        
        return {
            totalEngagements: result.Items.length,
            actionCounts,
            lastActivity: result.Items.length > 0 ? Math.max(...result.Items.map(item => item.timestamp)) : null
        };
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Engagement Stats:', error);
        return { totalEngagements: 0, actionCounts: {}, lastActivity: null };
    }
}

/**
 * Success Rate Analysis speichern
 */
async function saveSuccessRateAnalysis(userId, analysis) {
    try {
        await dynamodb.put({
            TableName: 'SuccessRateAnalyses',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: userId,
                analysis: analysis,
                timestamp: Date.now()
            }
        }).promise();
        
        console.log('✅ Success Rate Analysis gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Success Rate Analysis:', error);
    }
}

/**
 * Application Analytics abrufen
 */
async function getApplicationAnalytics(userId, timeRange) {
    // Implementierung für Application Analytics
    return {
        totalApplications: 0,
        successRate: 0,
        averageResponseTime: 0
    };
}

/**
 * AI Usage Analytics abrufen
 */
async function getAIUsageAnalytics(userId, timeRange) {
    // Implementierung für AI Usage Analytics
    return {
        totalTokens: 0,
        totalCost: 0,
        mostUsedFeatures: []
    };
}

/**
 * Engagement Analytics abrufen
 */
async function getEngagementAnalytics(userId, timeRange) {
    // Implementierung für Engagement Analytics
    return {
        totalSessions: 0,
        averageSessionTime: 0,
        mostUsedFeatures: []
    };
}

/**
 * Performance Analytics abrufen
 */
async function getPerformanceAnalytics(userId, timeRange) {
    // Implementierung für Performance Analytics
    return {
        responseTime: 0,
        successRate: 0,
        improvementAreas: []
    };
}

/**
 * User Recommendations abrufen
 */
async function getUserRecommendations(userId) {
    // Implementierung für User Recommendations
    return [
        'Empfehlung 1',
        'Empfehlung 2',
        'Empfehlung 3'
    ];
}

/**
 * Total Users abrufen
 */
async function getTotalUsers() {
    try {
        const params = {
            TableName: 'Users',
            Select: 'COUNT'
        };
        
        const result = await dynamodb.scan(params).promise();
        return result.Count;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Total Users:', error);
        return 0;
    }
}

/**
 * Active Users abrufen
 */
async function getActiveUsers() {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    try {
        const params = {
            TableName: 'Users',
            FilterExpression: 'lastLogin > :thirtyDaysAgo',
            ExpressionAttributeValues: {
                ':thirtyDaysAgo': thirtyDaysAgo.toISOString()
            },
            Select: 'COUNT'
        };
        
        const result = await dynamodb.scan(params).promise();
        return result.Count;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Active Users:', error);
        return 0;
    }
}

/**
 * Total Applications abrufen
 */
async function getTotalApplications() {
    try {
        const params = {
            TableName: 'Applications',
            Select: 'COUNT'
        };
        
        const result = await dynamodb.scan(params).promise();
        return result.Count;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Total Applications:', error);
        return 0;
    }
}

/**
 * System AI Usage Stats abrufen
 */
async function getSystemAIUsageStats() {
    try {
        const params = {
            TableName: 'AIUsage',
            Select: 'COUNT'
        };
        
        const result = await dynamodb.scan(params).promise();
        return {
            totalUsage: result.Count,
            totalTokens: 0, // Implementierung für Token-Summe
            totalCost: 0    // Implementierung für Cost-Summe
        };
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der System AI Usage Stats:', error);
        return { totalUsage: 0, totalTokens: 0, totalCost: 0 };
    }
}

/**
 * System Health abrufen
 */
async function getSystemHealth() {
    return {
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '120ms',
        lastCheck: Date.now()
    };
}

/**
 * Performance Metrics abrufen
 */
async function getPerformanceMetrics() {
    return {
        averageResponseTime: '150ms',
        errorRate: '0.1%',
        throughput: '1000 requests/hour'
    };
}
