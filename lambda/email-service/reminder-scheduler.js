/**
 * E-Mail Reminder Scheduler
 * Lambda-Funktion für automatische E-Mail-Erinnerungen
 * Wird täglich um 9:00 Uhr ausgeführt
 */

const AWS = require('aws-sdk');
const { handler: sendEmail } = require('./sendgrid-handler');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('⏰ E-Mail Reminder Scheduler gestartet');
    
    try {
        // Benutzer mit ablaufenden Abonnements abrufen
        const usersWithExpiringSubscriptions = await getUsersWithExpiringSubscriptions();
        console.log(`📊 ${usersWithExpiringSubscriptions.length} Benutzer mit ablaufenden Abonnements gefunden`);
        
        let emailsSent = 0;
        let errors = 0;
        
        for (const user of usersWithExpiringSubscriptions) {
            try {
                const daysLeft = calculateDaysUntilExpiry(user.subscriptionEndDate);
                
                // E-Mail nur senden wenn Ablauf in 14, 7, 3 oder 1 Tagen
                if ([14, 7, 3, 1].includes(daysLeft)) {
                    await sendReminderEmail(user, daysLeft);
                    emailsSent++;
                    console.log(`✅ Erinnerungs-E-Mail gesendet an: ${user.email} (${daysLeft} Tage)`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Fehler beim Senden der Erinnerung an ${user.email}:`, error);
            }
        }
        
        // Ergebnis protokollieren
        await logSchedulerResult(emailsSent, errors, usersWithExpiringSubscriptions.length);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                emailsSent: emailsSent,
                errors: errors,
                totalUsers: usersWithExpiringSubscriptions.length,
                message: `Erinnerungs-E-Mails verarbeitet: ${emailsSent} gesendet, ${errors} Fehler`
            })
        };
        
    } catch (error) {
        console.error('❌ Fehler im E-Mail Reminder Scheduler:', error);
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
 * Benutzer mit ablaufenden Abonnements abrufen
 */
async function getUsersWithExpiringSubscriptions() {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    try {
        const params = {
            TableName: 'UserSubscriptions',
            FilterExpression: 'subscriptionEndDate BETWEEN :now AND :fourteenDays',
            ExpressionAttributeValues: {
                ':now': now.toISOString(),
                ':fourteenDays': fourteenDaysFromNow.toISOString()
            }
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Benutzerdaten aus User-Tabelle abrufen
        const usersWithDetails = [];
        for (const subscription of result.Items) {
            try {
                const userResult = await dynamodb.get({
                    TableName: 'Users',
                    Key: { id: subscription.userId }
                }).promise();
                
                if (userResult.Item) {
                    usersWithDetails.push({
                        ...userResult.Item,
                        subscriptionEndDate: subscription.subscriptionEndDate,
                        subscriptionType: subscription.subscriptionType
                    });
                }
            } catch (error) {
                console.error(`❌ Fehler beim Abrufen der Benutzerdaten für ID ${subscription.userId}:`, error);
            }
        }
        
        return usersWithDetails;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Benutzer mit ablaufenden Abonnements:', error);
        throw error;
    }
}

/**
 * Tage bis zum Ablauf berechnen
 */
function calculateDaysUntilExpiry(subscriptionEndDate) {
    const now = new Date();
    const endDate = new Date(subscriptionEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
}

/**
 * Erinnerungs-E-Mail senden
 */
async function sendReminderEmail(user, daysLeft) {
    const emailData = {
        action: 'reminder',
        userData: {
            email: user.email,
            name: user.name,
            userId: user.id,
            daysLeft: daysLeft,
            subscriptionType: user.subscriptionType
        }
    };
    
    // SendGrid Handler aufrufen
    const event = {
        body: JSON.stringify(emailData)
    };
    
    return await sendEmail(event);
}

/**
 * Scheduler-Ergebnis protokollieren
 */
async function logSchedulerResult(emailsSent, errors, totalUsers) {
    try {
        await dynamodb.put({
            TableName: 'SchedulerLogs',
            Item: {
                id: `reminder-${Date.now()}`,
                type: 'email_reminder',
                timestamp: Date.now(),
                emailsSent: emailsSent,
                errors: errors,
                totalUsers: totalUsers,
                success: errors === 0
            }
        }).promise();
        
        console.log('✅ Scheduler-Ergebnis protokolliert');
    } catch (error) {
        console.error('❌ Fehler beim Protokollieren des Scheduler-Ergebnisses:', error);
    }
}

/**
 * Benutzer mit inaktiven Accounts finden
 */
async function getInactiveUsers() {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    try {
        const params = {
            TableName: 'Users',
            FilterExpression: 'lastLogin < :thirtyDaysAgo AND emailVerified = :verified',
            ExpressionAttributeValues: {
                ':thirtyDaysAgo': thirtyDaysAgo.toISOString(),
                ':verified': true
            }
        };
        
        const result = await dynamodb.scan(params).promise();
        return result.Items;
    } catch (error) {
        console.error('❌ Fehler beim Abrufen inaktiver Benutzer:', error);
        return [];
    }
}

/**
 * Willkommens-E-Mails für neue Benutzer senden
 */
async function sendWelcomeEmailsForNewUsers() {
    const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
    
    try {
        const params = {
            TableName: 'Users',
            FilterExpression: 'createdAt > :oneDayAgo AND welcomeEmailSent = :notSent',
            ExpressionAttributeValues: {
                ':oneDayAgo': oneDayAgo.toISOString(),
                ':notSent': false
            }
        };
        
        const result = await dynamodb.scan(params).promise();
        
        for (const user of result.Items) {
            try {
                const emailData = {
                    action: 'welcome',
                    userData: {
                        email: user.email,
                        name: user.name,
                        userId: user.id
                    }
                };
                
                const event = {
                    body: JSON.stringify(emailData)
                };
                
                await sendEmail(event);
                
                // Markiere Willkommens-E-Mail als gesendet
                await dynamodb.update({
                    TableName: 'Users',
                    Key: { id: user.id },
                    UpdateExpression: 'SET welcomeEmailSent = :sent',
                    ExpressionAttributeValues: {
                        ':sent': true
                    }
                }).promise();
                
                console.log(`✅ Willkommens-E-Mail gesendet an: ${user.email}`);
            } catch (error) {
                console.error(`❌ Fehler beim Senden der Willkommens-E-Mail an ${user.email}:`, error);
            }
        }
        
        return result.Items.length;
    } catch (error) {
        console.error('❌ Fehler beim Senden der Willkommens-E-Mails:', error);
        return 0;
    }
}
