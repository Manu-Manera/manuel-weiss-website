#!/usr/bin/env node
// 🔧 AUTOMATISCHE REDIRECT-URL KORREKTUR
// Korrigiert alle Redirect-URLs in der gesamten Codebase

const fs = require('fs');
const path = require('path');

class RedirectURLFixer {
    constructor() {
        this.baseDir = process.cwd();
        this.fixedFiles = [];
        this.errors = [];
        
        // Korrekte URLs für verschiedene Umgebungen
        this.correctUrls = {
            production: [
                'https://mawps.netlify.app',
                'https://mawps.netlify.app/bewerbung.html',
                'https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html',
                'https://mawps.netlify.app/user-profile.html',
                'https://mawps.netlify.app/admin.html'
            ],
            development: [
                'http://localhost:8000',
                'http://localhost:8000/bewerbung.html',
                'http://localhost:8000/persoenlichkeitsentwicklung-uebersicht.html',
                'http://localhost:8000/user-profile.html',
                'http://localhost:3000',
                'http://localhost:3000/bewerbung.html'
            ]
        };
        
        // Problematic URL patterns
        this.problematicPatterns = [
            /window\.location\.origin\s*\+\s*['"`]\/bewerbung\.html['"`]/g,
            /window\.location\.origin\s*\+\s*['"`]\/persoenlichkeitsentwicklung-uebersicht\.html['"`]/g,
            /https:\/\/manuel-weiss\.com/g,
            /http:\/\/localhost:3000/g,
            /https:\/\/mawps\.netlify\.app\/$/g
        ];
    }
    
    async fixAllRedirectURLs() {
        console.log('🔧 Starting Redirect URL Fix...');
        
        try {
            // Finde alle relevanten Dateien
            const files = this.findRelevantFiles();
            console.log(`📁 Found ${files.length} files to check`);
            
            // Korrigiere jede Datei
            for (const file of files) {
                await this.fixFile(file);
            }
            
            // Generiere AWS Cognito Konfiguration
            this.generateCognitoConfig();
            
            // Generiere Report
            this.generateReport();
            
            console.log('✅ Redirect URL Fix completed');
            console.log(`📊 Fixed ${this.fixedFiles.length} files`);
            
        } catch (error) {
            console.error('❌ Redirect URL Fix failed:', error);
            this.errors.push(error.message);
        }
    }
    
    findRelevantFiles() {
        const extensions = ['.html', '.js', '.md', '.sh', '.yaml', '.yml', '.json'];
        const files = [];
        
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
                    scanDirectory(fullPath);
                } else if (stat.isFile() && this.shouldProcessFile(item, extensions)) {
                    files.push(fullPath);
                }
            }
        };
        
        scanDirectory(this.baseDir);
        return files;
    }
    
    shouldSkipDirectory(dirName) {
        const skipDirs = ['node_modules', '.git', '.netlify', 'dist', 'build'];
        return skipDirs.includes(dirName);
    }
    
    shouldProcessFile(fileName, extensions) {
        return extensions.some(ext => fileName.endsWith(ext));
    }
    
    async fixFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            let hasChanges = false;
            
            // Fix 1: window.location.origin patterns
            newContent = this.fixWindowLocationOrigin(newContent);
            if (newContent !== content) hasChanges = true;
            
            // Fix 2: Hardcoded URLs
            newContent = this.fixHardcodedUrls(newContent);
            if (newContent !== content) hasChanges = true;
            
            // Fix 3: Cognito URLs
            newContent = this.fixCognitoUrls(newContent);
            if (newContent !== content) hasChanges = true;
            
            // Fix 4: OAuth URLs
            newContent = this.fixOAuthUrls(newContent);
            if (newContent !== content) hasChanges = true;
            
            if (hasChanges) {
                // Backup erstellen
                const backupPath = filePath + '.backup';
                fs.writeFileSync(backupPath, content);
                
                // Neue Version schreiben
                fs.writeFileSync(filePath, newContent);
                
                this.fixedFiles.push({
                    file: filePath,
                    backup: backupPath,
                    changes: this.getChangeSummary(content, newContent)
                });
                
                console.log(`✅ Fixed: ${filePath}`);
            }
            
        } catch (error) {
            console.error(`❌ Error fixing ${filePath}:`, error.message);
            this.errors.push(`${filePath}: ${error.message}`);
        }
    }
    
    fixWindowLocationOrigin(content) {
        // Ersetze window.location.origin + '/bewerbung.html' mit korrekten URLs
        const patterns = [
            {
                pattern: /window\.location\.origin\s*\+\s*['"`]\/bewerbung\.html['"`]/g,
                replacement: `getRedirectUrl('bewerbung.html')`
            },
            {
                pattern: /window\.location\.origin\s*\+\s*['"`]\/persoenlichkeitsentwicklung-uebersicht\.html['"`]/g,
                replacement: `getRedirectUrl('persoenlichkeitsentwicklung-uebersicht.html')`
            },
            {
                pattern: /window\.location\.origin\s*\+\s*['"`]\/user-profile\.html['"`]/g,
                replacement: `getRedirectUrl('user-profile.html')`
            }
        ];
        
        let newContent = content;
        patterns.forEach(({ pattern, replacement }) => {
            newContent = newContent.replace(pattern, replacement);
        });
        
        return newContent;
    }
    
    fixHardcodedUrls(content) {
        // Ersetze hardcoded URLs mit dynamischen
        const replacements = [
            {
                pattern: /https:\/\/manuel-weiss\.com/g,
                replacement: 'getBaseUrl()'
            },
            {
                pattern: /http:\/\/localhost:3000/g,
                replacement: 'getBaseUrl()'
            },
            {
                pattern: /https:\/\/mawps\.netlify\.app\/$/g,
                replacement: 'getBaseUrl()'
            }
        ];
        
        let newContent = content;
        replacements.forEach(({ pattern, replacement }) => {
            newContent = newContent.replace(pattern, replacement);
        });
        
        return newContent;
    }
    
    fixCognitoUrls(content) {
        // Korrigiere Cognito URLs
        const cognitoDomain = 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com';
        const clientId = '7kc5tt6a23fgh53d60vkefm812';
        
        // Standardize Cognito URLs
        const patterns = [
            {
                pattern: /https:\/\/[^\/]+\.auth\.eu-central-1\.amazoncognito\.com/g,
                replacement: `https://${cognitoDomain}`
            },
            {
                pattern: /client_id=[^&]+/g,
                replacement: `client_id=${clientId}`
            }
        ];
        
        let newContent = content;
        patterns.forEach(({ pattern, replacement }) => {
            newContent = newContent.replace(pattern, replacement);
        });
        
        return newContent;
    }
    
    fixOAuthUrls(content) {
        // Korrigiere OAuth URLs
        const oauthPatterns = [
            {
                pattern: /redirect_uri=[^&]+/g,
                replacement: 'redirect_uri=' + encodeURIComponent('getRedirectUrl()')
            },
            {
                pattern: /logout_uri=[^&]+/g,
                replacement: 'logout_uri=' + encodeURIComponent('getBaseUrl()')
            }
        ];
        
        let newContent = content;
        oauthPatterns.forEach(({ pattern, replacement }) => {
            newContent = newContent.replace(pattern, replacement);
        });
        
        return newContent;
    }
    
    generateCognitoConfig() {
        const config = {
            userPoolId: 'eu-central-1_8gP4gLK9r',
            clientId: '7kc5tt6a23fgh53d60vkefm812',
            region: 'eu-central-1',
            domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com',
            callbackUrls: [
                ...this.correctUrls.production,
                ...this.correctUrls.development
            ],
            logoutUrls: [
                'https://mawps.netlify.app',
                'http://localhost:8000'
            ],
            oauthFlows: ['implicit', 'code'],
            oauthScopes: ['email', 'openid', 'profile']
        };
        
        // AWS CLI Script generieren
        const awsCliScript = this.generateAWSCliScript(config);
        fs.writeFileSync('cognito-config-update.sh', awsCliScript);
        
        // JavaScript Config generieren
        const jsConfig = this.generateJSConfig(config);
        fs.writeFileSync('js/redirect-url-config.js', jsConfig);
        
        console.log('📝 Generated Cognito configuration files');
    }
    
    generateAWSCliScript(config) {
        return `#!/bin/bash
# 🔧 AWS Cognito Configuration Update Script
# Automatically generated by Redirect URL Fixer

USER_POOL_ID="${config.userPoolId}"
CLIENT_ID="${config.clientId}"

echo "🔧 Updating Cognito App Client Configuration..."

aws cognito-idp update-user-pool-client \\
    --user-pool-id $USER_POOL_ID \\
    --client-id $CLIENT_ID \\
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \\
    --supported-identity-providers COGNITO \\
    --callback-urls ${config.callbackUrls.map(url => `"${url}"`).join(' ')} \\
    --logout-urls ${config.logoutUrls.map(url => `"${url}"`).join(' ')} \\
    --allowed-o-auth-flows ${config.oauthFlows.join(' ')} \\
    --allowed-o-auth-scopes ${config.oauthScopes.join(' ')} \\
    --allowed-o-auth-flows-user-pool-client

echo "✅ Cognito configuration updated successfully"
echo "📋 Callback URLs: ${config.callbackUrls.join(', ')}"
echo "📋 Logout URLs: ${config.logoutUrls.join(', ')}"
`;
    }
    
    generateJSConfig(config) {
        return `// 🔧 REDIRECT URL CONFIGURATION
// Automatically generated by Redirect URL Fixer

window.REDIRECT_URL_CONFIG = {
    cognito: {
        userPoolId: '${config.userPoolId}',
        clientId: '${config.clientId}',
        region: '${config.region}',
        domain: '${config.domain}'
    },
    
    // Dynamische URL-Generierung
    getBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            return 'http://localhost:8000';
        } else if (window.location.hostname.includes('netlify.app')) {
            return 'https://mawps.netlify.app';
        } else {
            return window.location.origin;
        }
    },
    
    getRedirectUrl(page = '') {
        const baseUrl = this.getBaseUrl();
        return page ? \`\${baseUrl}/\${page}\` : baseUrl;
    },
    
    // OAuth URLs
    getLoginUrl() {
        const baseUrl = this.getBaseUrl();
        return \`https://\${this.cognito.domain}/login?client_id=\${this.cognito.clientId}&response_type=code&scope=email+openid+profile&redirect_uri=\${encodeURIComponent(baseUrl)}\`;
    },
    
    getLogoutUrl() {
        const baseUrl = this.getBaseUrl();
        return \`https://\${this.cognito.domain}/logout?client_id=\${this.cognito.clientId}&logout_uri=\${encodeURIComponent(baseUrl)}\`;
    }
};

// Globale Funktionen für Kompatibilität
window.getBaseUrl = () => window.REDIRECT_URL_CONFIG.getBaseUrl();
window.getRedirectUrl = (page) => window.REDIRECT_URL_CONFIG.getRedirectUrl(page);
window.getLoginUrl = () => window.REDIRECT_URL_CONFIG.getLoginUrl();
window.getLogoutUrl = () => window.REDIRECT_URL_CONFIG.getLogoutUrl();

console.log('✅ Redirect URL Configuration loaded');
`;
    }
    
    getChangeSummary(oldContent, newContent) {
        const oldLines = oldContent.split('\n').length;
        const newLines = newContent.split('\n').length;
        const changes = newLines - oldLines;
        
        return {
            linesAdded: changes > 0 ? changes : 0,
            linesRemoved: changes < 0 ? Math.abs(changes) : 0,
            totalLines: newLines
        };
    }
    
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: this.fixedFiles.length,
            errors: this.errors.length,
            fixedFiles: this.fixedFiles.map(file => ({
                file: file.file,
                changes: file.changes
            })),
            errors: this.errors
        };
        
        fs.writeFileSync('redirect-url-fix-report.json', JSON.stringify(report, null, 2));
        console.log('📊 Generated fix report: redirect-url-fix-report.json');
    }
}

// Script ausführen
if (require.main === module) {
    const fixer = new RedirectURLFixer();
    fixer.fixAllRedirectURLs().catch(console.error);
}

module.exports = RedirectURLFixer;
