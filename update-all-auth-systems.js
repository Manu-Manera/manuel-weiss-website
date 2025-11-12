#!/usr/bin/env node

/**
 * Aktualisiert alle HTML-Seiten auf einheitliches Auth-System
 */

const fs = require('fs');
const path = require('path');

const AWS_CONFIG_INLINE = `    <!-- AWS Auth System - Einheitliche Implementierung -->
    <!-- AWS Config INLINE (um Cache-Probleme zu vermeiden) -->
    <script>
        // AWS Configuration for Production - INLINE
        window.AWS_CONFIG = {
            // Cognito User Pool Configuration
            userPoolId: 'eu-central-1_8gP4gLK9r',
            clientId: '7kc5tt6a23fgh53d60vkefm812',
            region: 'eu-central-1',
            
            // Domain Configuration
            domain: {
                name: 'manuel-weiss.ch',
                email: 'mail@manuel-weiss.ch',
                region: 'eu-central-1'
            },
            
            // S3 Configuration for file uploads
            s3: {
                bucket: 'mawps-user-files-1760106396',
                region: 'eu-central-1'
            },
            
            // DynamoDB Configuration for user data
            dynamodb: {
                tableName: 'mawps-user-profiles',
                region: 'eu-central-1'
            },
            
            // API Gateway Configuration
            apiGateway: {
                baseUrl: 'https://api.mawps.netlify.app',
                endpoints: {
                    userProfile: '/user/profile',
                    userProgress: '/user/progress',
                    userSettings: '/user/settings'
                }
            }
        };
        
        // Initialize AWS with configuration
        if (typeof AWS !== 'undefined') {
            AWS.config.update({
                region: window.AWS_CONFIG.region
            });
            
            // Configure Cognito
            window.AWS_COGNITO_CONFIG = {
                UserPoolId: window.AWS_CONFIG.userPoolId,
                ClientId: window.AWS_CONFIG.clientId
            };
            
            console.log('AWS Configuration loaded (inline)');
        } else {
            console.log('AWS SDK not loaded yet, will configure when loaded');
        }
    </script>
    <!-- AWS SDK laden -->
    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js" 
            onerror="console.error('Fehler beim Laden von AWS SDK');"></script>
    <!-- Auth & Core - mit Cache-Busting -->
    <script src="js/real-user-auth-system.js?v=20250110" 
            onerror="console.error('Fehler beim Laden von real-user-auth-system.js');"></script>`;

const AWS_CONFIG_INLINE_APPLICATIONS = `    <!-- AWS Auth System - Einheitliche Implementierung -->
    <!-- AWS Config INLINE (um Cache-Probleme zu vermeiden) -->
    <script>
        // AWS Configuration for Production - INLINE
        window.AWS_CONFIG = {
            // Cognito User Pool Configuration
            userPoolId: 'eu-central-1_8gP4gLK9r',
            clientId: '7kc5tt6a23fgh53d60vkefm812',
            region: 'eu-central-1',
            
            // Domain Configuration
            domain: {
                name: 'manuel-weiss.ch',
                email: 'mail@manuel-weiss.ch',
                region: 'eu-central-1'
            },
            
            // S3 Configuration for file uploads
            s3: {
                bucket: 'mawps-user-files-1760106396',
                region: 'eu-central-1'
            },
            
            // DynamoDB Configuration for user data
            dynamodb: {
                tableName: 'mawps-user-profiles',
                region: 'eu-central-1'
            },
            
            // API Gateway Configuration
            apiGateway: {
                baseUrl: 'https://api.mawps.netlify.app',
                endpoints: {
                    userProfile: '/user/profile',
                    userProgress: '/user/progress',
                    userSettings: '/user/settings'
                }
            }
        };
        
        // Initialize AWS with configuration
        if (typeof AWS !== 'undefined') {
            AWS.config.update({
                region: window.AWS_CONFIG.region
            });
            
            // Configure Cognito
            window.AWS_COGNITO_CONFIG = {
                UserPoolId: window.AWS_CONFIG.userPoolId,
                ClientId: window.AWS_CONFIG.clientId
            };
            
            console.log('AWS Configuration loaded (inline)');
        } else {
            console.log('AWS SDK not loaded yet, will configure when loaded');
        }
    </script>
    <!-- AWS SDK laden -->
    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js" 
            onerror="console.error('Fehler beim Laden von AWS SDK');"></script>
    <!-- Auth & Core - mit Cache-Busting -->
    <script src="../js/real-user-auth-system.js?v=20250110" 
            onerror="console.error('Fehler beim Laden von real-user-auth-system.js');"></script>`;

const OLD_PATTERNS = [
    /<script[^>]*src=["']js\/aws-config\.js["'][^>]*><\/script>/gi,
    /<script[^>]*src=["']\.\.\/js\/aws-config\.js["'][^>]*><\/script>/gi,
    /<script[^>]*src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/amazon-cognito-identity-js[^"']*["'][^>]*><\/script>/gi,
    /<script[^>]*src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/aws-sdk[^"']*["'][^>]*><\/script>/gi,
    /<script[^>]*src=["']js\/real-user-auth-system\.js["'][^>]*><\/script>/gi,
    /<script[^>]*src=["']\.\.\/js\/real-user-auth-system\.js["'][^>]*><\/script>/gi,
    /<!-- AWS Auth System[^]*?<\/script>/gi,
    /<!-- AWS Config[^]*?<\/script>/gi
];

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Prüfe ob Datei Auth-System verwendet
        const hasAuth = content.includes('aws-config') || 
                       content.includes('real-user-auth') || 
                       content.includes('AWS Auth System');
        
        if (!hasAuth) {
            return { updated: false, reason: 'No auth system found' };
        }
        
        // Bestimme ob applications-Verzeichnis (braucht ../)
        const isApplications = filePath.includes('/applications/');
        const replacement = isApplications ? AWS_CONFIG_INLINE_APPLICATIONS : AWS_CONFIG_INLINE;
        
        // Entferne alte Auth-Script-Tags
        OLD_PATTERNS.forEach(pattern => {
            content = content.replace(pattern, '');
        });
        
        // Finde </body> Tag und füge neues Auth-System davor ein
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex === -1) {
            return { updated: false, reason: 'No </body> tag found' };
        }
        
        // Prüfe ob bereits aktualisiert
        if (content.includes('AWS Config INLINE')) {
            return { updated: false, reason: 'Already updated' };
        }
        
        // Füge neues Auth-System ein
        content = content.slice(0, bodyCloseIndex) + '\n' + replacement + '\n' + content.slice(bodyCloseIndex);
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            return { updated: true, reason: 'Updated successfully' };
        }
        
        return { updated: false, reason: 'No changes needed' };
    } catch (error) {
        return { updated: false, reason: `Error: ${error.message}` };
    }
}

// Hauptfunktion
function main() {
    const filesToUpdate = [
        'applications/profile-setup.html',
        'applications/application-generator.html',
        'applications/document-upload.html',
        'applications/tracking-dashboard.html',
        'applications/interview-prep.html',
        'persoenlichkeitsentwicklung-uebersicht.html',
        'ikigai.html',
        'user-management.html',
        'index.html'
    ];
    
    const results = [];
    
    filesToUpdate.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const result = updateFile(filePath);
            results.push({ file, ...result });
            console.log(`${result.updated ? '✅' : '⏭️'} ${file}: ${result.reason}`);
        } else {
            console.log(`⚠️  ${file}: File not found`);
            results.push({ file, updated: false, reason: 'File not found' });
        }
    });
    
    const updatedCount = results.filter(r => r.updated).length;
    console.log(`\n📊 Zusammenfassung: ${updatedCount} von ${results.length} Dateien aktualisiert`);
    
    return results;
}

if (require.main === module) {
    main();
}

module.exports = { updateFile, main };

