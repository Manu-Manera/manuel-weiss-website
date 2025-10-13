/**
 * SendGrid Email Service Handler
 * Lambda-Funktion für E-Mail-Benachrichtigungen
 */

const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('📧 Email Service Handler gestartet:', JSON.stringify(event, null, 2));
    
    // SendGrid API Key aus Environment Variables
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    try {
        const { action, userData, applicationData } = JSON.parse(event.body);
        
        switch (action) {
            case 'welcome':
                return await sendWelcomeEmail(userData);
            case 'completion':
                return await sendCompletionEmail(userData, applicationData);
            case 'reminder':
                return await sendReminderEmail(userData);
            case 'template':
                return await sendTemplateEmail(userData);
            default:
                throw new Error(`Unbekannte Aktion: ${action}`);
        }
    } catch (error) {
        console.error('❌ Fehler im Email Service:', error);
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
 * Willkommens-E-Mail senden
 */
async function sendWelcomeEmail(userData) {
    const { email, name, userId } = userData;
    
    const msg = {
        to: email,
        from: {
            email: 'welcome@manuel-weiss.com',
            name: 'Manuel Weiss Bewerbungsmanager'
        },
        subject: '🎉 Willkommen bei Manuel Weiss Bewerbungsmanager!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Willkommen</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .feature { margin: 15px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #667eea; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Willkommen, ${name}!</h1>
                        <p>Ihr KI-gestützter Bewerbungsmanager ist bereit</p>
                    </div>
                    <div class="content">
                        <p>Vielen Dank für Ihre Registrierung bei unserem professionellen Bewerbungsmanager!</p>
                        
                        <h3>🎯 Was Sie jetzt tun können:</h3>
                        <div class="feature">
                            <strong>📋 Stellenanalyse</strong><br>
                            Lassen Sie KI Ihre Stellenausschreibung analysieren und Anforderungen extrahieren
                        </div>
                        <div class="feature">
                            <strong>🎯 Skill-Matching</strong><br>
                            Automatischer Abgleich Ihrer Qualifikationen mit den Stellenanforderungen
                        </div>
                        <div class="feature">
                            <strong>✍️ KI-Anschreiben</strong><br>
                            Professionelle, personalisierte Anschreiben in Sekunden generieren
                        </div>
                        <div class="feature">
                            <strong>📄 CV-Optimierung</strong><br>
                            Optimieren Sie Ihren Lebenslauf für ATS-Systeme
                        </div>
                        
                        <a href="${process.env.FRONTEND_URL}/bewerbungsmanager-modern.html" class="button">
                            🚀 Jetzt Bewerbung erstellen
                        </a>
                        
                        <p><strong>Ihr Dashboard:</strong> <a href="${process.env.FRONTEND_URL}/user-profile.html">Hier klicken</a></p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 14px; color: #666;">
                            Bei Fragen stehen wir Ihnen gerne zur Verfügung.<br>
                            Ihr Manuel Weiss Team
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await sgMail.send(msg);
        console.log('✅ Willkommens-E-Mail gesendet an:', email);
        
        // E-Mail-Versand in Datenbank protokollieren
        await logEmailSent('welcome', email, userId);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Willkommens-E-Mail erfolgreich gesendet'
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Senden der Willkommens-E-Mail:', error);
        throw error;
    }
}

/**
 * Bewerbungsabschluss-E-Mail senden
 */
async function sendCompletionEmail(userData, applicationData) {
    const { email, name } = userData;
    const { company, position, applicationId } = applicationData;
    
    const msg = {
        to: email,
        from: {
            email: 'noreply@manuel-weiss.com',
            name: 'Manuel Weiss Bewerbungsmanager'
        },
        subject: `🎉 Ihre Bewerbung für ${position} bei ${company} ist fertig!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Bewerbung fertig</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .summary { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bewerbung erfolgreich erstellt!</h1>
                        <p>Ihre Bewerbungsunterlagen sind bereit zum Download</p>
                    </div>
                    <div class="content">
                        <p>Liebe/r ${name},</p>
                        
                        <p>Ihre Bewerbung für die Position <strong>${position}</strong> bei <strong>${company}</strong> wurde erfolgreich erstellt!</p>
                        
                        <div class="summary">
                            <h3>📋 Bewerbungsübersicht:</h3>
                            <ul>
                                <li>✅ KI-optimiertes Anschreiben</li>
                                <li>✅ ATS-optimierter Lebenslauf</li>
                                <li>✅ Professionelle Formatierung</li>
                                <li>✅ Alle Dokumente bereit</li>
                            </ul>
                        </div>
                        
                        <a href="${process.env.FRONTEND_URL}/download/${applicationId}" class="button">
                            📥 Jetzt herunterladen
                        </a>
                        
                        <p><strong>Nächste Schritte:</strong></p>
                        <ol>
                            <li>Laden Sie Ihre Bewerbungsunterlagen herunter</li>
                            <li>Überprüfen Sie alle Dokumente</li>
                            <li>Senden Sie Ihre Bewerbung ab</li>
                            <li>Verfolgen Sie Ihren Bewerbungsstatus</li>
                        </ol>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 14px; color: #666;">
                            Viel Erfolg bei Ihrer Bewerbung!<br>
                            Ihr Manuel Weiss Team
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await sgMail.send(msg);
        console.log('✅ Abschluss-E-Mail gesendet an:', email);
        
        await logEmailSent('completion', email, userData.userId);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Abschluss-E-Mail erfolgreich gesendet'
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Senden der Abschluss-E-Mail:', error);
        throw error;
    }
}

/**
 * Erinnerungs-E-Mail senden
 */
async function sendReminderEmail(userData) {
    const { email, name, daysLeft } = userData;
    
    const msg = {
        to: email,
        from: {
            email: 'reminder@manuel-weiss.com',
            name: 'Manuel Weiss Bewerbungsmanager'
        },
        subject: `⏰ Erinnerung: ${daysLeft} Tage bis zum Ablauf`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Erinnerung</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Erinnerung</h1>
                        <p>Ihr Abonnement läuft in ${daysLeft} Tagen ab</p>
                    </div>
                    <div class="content">
                        <p>Liebe/r ${name},</p>
                        
                        <p>Ihr Abonnement für den Manuel Weiss Bewerbungsmanager läuft in <strong>${daysLeft} Tagen</strong> ab.</p>
                        
                        <p>Verlängern Sie jetzt, um weiterhin Zugang zu allen KI-Funktionen zu haben:</p>
                        <ul>
                            <li>✅ Unbegrenzte Bewerbungserstellung</li>
                            <li>✅ KI-optimierte Anschreiben</li>
                            <li>✅ ATS-optimierte Lebensläufe</li>
                            <li>✅ Skill-Matching Analyse</li>
                        </ul>
                        
                        <a href="${process.env.FRONTEND_URL}/renew" class="button">
                            🔄 Jetzt verlängern
                        </a>
                        
                        <p style="font-size: 14px; color: #666;">
                            Bei Fragen stehen wir Ihnen gerne zur Verfügung.<br>
                            Ihr Manuel Weiss Team
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await sgMail.send(msg);
        console.log('✅ Erinnerungs-E-Mail gesendet an:', email);
        
        await logEmailSent('reminder', email, userData.userId);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Erinnerungs-E-Mail erfolgreich gesendet'
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Senden der Erinnerungs-E-Mail:', error);
        throw error;
    }
}

/**
 * Template-basierte E-Mail senden
 */
async function sendTemplateEmail(userData) {
    const { email, templateId, templateData } = userData;
    
    const msg = {
        to: email,
        from: {
            email: 'noreply@manuel-weiss.com',
            name: 'Manuel Weiss Bewerbungsmanager'
        },
        templateId: templateId,
        dynamicTemplateData: templateData
    };
    
    try {
        await sgMail.send(msg);
        console.log('✅ Template-E-Mail gesendet an:', email);
        
        await logEmailSent('template', email, userData.userId);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Template-E-Mail erfolgreich gesendet'
            })
        };
    } catch (error) {
        console.error('❌ Fehler beim Senden der Template-E-Mail:', error);
        throw error;
    }
}

/**
 * E-Mail-Versand in Datenbank protokollieren
 */
async function logEmailSent(type, email, userId) {
    try {
        await dynamodb.put({
            TableName: 'EmailLogs',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                email: email,
                userId: userId,
                timestamp: Date.now(),
                status: 'sent'
            }
        }).promise();
        
        console.log('✅ E-Mail-Versand protokolliert:', { type, email, userId });
    } catch (error) {
        console.error('❌ Fehler beim Protokollieren des E-Mail-Versands:', error);
    }
}
