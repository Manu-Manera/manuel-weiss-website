/**
 * Script to update all service pages with integrated login system
 * This script adds the AWS User System to all service-related pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of service pages that should have the login system
const servicePages = [
    'persoenlichkeitsentwicklung-uebersicht.html',
    'persoenlichkeitsentwicklung.html',
    'raisec-persoenlichkeitsentwicklung.html',
    'raisec-theorie.html',
    'raisec-anwendung.html',
    'ikigai.html',
    'hr-transformation.html',
    'hr-prozessautomatisierung.html',
    'ki-strategieentwicklung.html',
    'digital-workplace.html',
    'ai-digitalisierung.html',
    'chatbot-workflow.html',
    'hr-automation-workflow.html',
    'digital-workplace-workflow.html',
    'ki-strategie-workflow.html',
    'change-management-workflow.html',
    'organisationsentwicklung-workflow.html',
    'hr-strategie-workflow.html',
    'bewerbung.html',
    'bewerbungen.html'
];

// User System HTML to inject
const userSystemHTML = `
                <!-- AWS User System - Nur auf Service-Unterseiten -->
                <div class="user-system" id="userSystem">
                    <div class="user-info" id="userInfo" style="display: none;">
                        <div class="user-avatar">
                            <img id="userAvatar" src="manuel-weiss-photo.svg" alt="User Avatar" class="user-avatar-img">
                        </div>
                        <div class="user-details">
                            <span class="user-name" id="userName">Benutzer</span>
                            <span class="user-email" id="userEmail">benutzer@example.com</span>
                        </div>
                        <button class="user-logout" id="userLogout" onclick="logoutUser()">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                    
                    <div class="user-login" id="userLogin">
                        <button class="btn-login" onclick="loginUser()">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>Anmelden</span>
                        </button>
                    </div>
                </div>`;

// Auth Modals HTML to inject
const authModalsHTML = `
<!-- Auth Modals -->
<div id="authModalsContainer"></div>`;

// Scripts to inject
const authScripts = `
<script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js"></script>
<script src="js/aws-auth.js"></script>`;

// CSS to inject
const userSystemCSS = `
        /* AWS User System Styles - Integrated in Navigation */
        .user-system {
            display: flex;
            align-items: center;
            margin-left: 20px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            padding: 8px 16px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            transition: all 0.3s ease;
        }

        .user-info:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #6366f1;
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .user-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .user-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .user-name {
            font-size: 0.8rem;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.2;
        }

        .user-email {
            font-size: 0.7rem;
            color: #64748b;
            line-height: 1.2;
        }

        .user-logout {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .user-logout:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }

        .user-login {
            display: flex;
            align-items: center;
        }

        .btn-login {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        .btn-login i {
            font-size: 0.7rem;
        }

        /* Responsive Design for User System */
        @media (max-width: 768px) {
            .user-system {
                margin-left: 10px;
            }

            .user-info {
                padding: 6px 12px;
                gap: 8px;
            }

            .user-avatar {
                width: 28px;
                height: 28px;
            }

            .user-name {
                font-size: 0.7rem;
            }

            .user-email {
                font-size: 0.6rem;
            }

            .btn-login {
                padding: 6px 12px;
                font-size: 0.7rem;
            }
        }`;

// JavaScript functions to inject
const authJavaScript = `
    // Load auth modals
    async function loadAuthModals() {
        try {
            const response = await fetch('components/auth-modals.html');
            const html = await response.text();
            document.getElementById('authModalsContainer').innerHTML = html;
        } catch (error) {
            console.error('Error loading auth modals:', error);
        }
    }

    // AWS User System Functions
    function loginUser() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function logoutUser() {
        if (window.awsAuth) {
            window.awsAuth.signOut().then(() => {
                console.log('Erfolgreich abgemeldet');
            }).catch(error => {
                console.error('Fehler beim Abmelden:', error);
            });
        }
    }

    // Initialize auth system
    document.addEventListener('DOMContentLoaded', async function() {
        await loadAuthModals();
        
        // Check user status
        if (window.awsAuth) {
            window.awsAuth.checkUserStatus();
        }
    });`;

function updateServicePage(filePath) {
    try {
        console.log(`Updating ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already updated
        if (content.includes('user-system')) {
            console.log(`  ✓ Already updated`);
            return;
        }
        
        // Add user system to navigation
        const navMenuRegex = /(<div class="nav-menu"[^>]*>[\s\S]*?<\/div>)/;
        if (navMenuRegex.test(content)) {
            content = content.replace(navMenuRegex, (match) => {
                // Insert user system before language switcher or at the end
                if (match.includes('language-switcher')) {
                    return match.replace(/(<div class="language-switcher)/, userSystemHTML + '\n                \n                $1');
                } else {
                    return match.replace(/(<\/div>)$/, userSystemHTML + '\n                \n            $1');
                }
            });
        }
        
        // Add auth modals before scripts
        const scriptsRegex = /(<!-- Scripts -->|<script)/;
        if (scriptsRegex.test(content)) {
            content = content.replace(scriptsRegex, authModalsHTML + '\n\n$1');
        }
        
        // Add auth scripts
        const scriptTagRegex = /(<script[^>]*src="[^"]*\.js"[^>]*>)/;
        if (scriptTagRegex.test(content)) {
            content = content.replace(scriptTagRegex, authScripts + '\n$1');
        }
        
        // Add CSS to style block
        const styleRegex = /(<\/style>)/;
        if (styleRegex.test(content)) {
            content = content.replace(styleRegex, userSystemCSS + '\n    $1');
        }
        
        // Add JavaScript functions
        const scriptBlockRegex = /(<script>[\s\S]*?)(function [^\(]+\([^\)]*\))/;
        if (scriptBlockRegex.test(content)) {
            content = content.replace(scriptBlockRegex, `$1${authJavaScript}\n\n    $2`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Updated successfully`);
        
    } catch (error) {
        console.error(`  ✗ Error updating ${filePath}:`, error.message);
    }
}

// Main execution
console.log('🚀 Starting service pages update...\n');

servicePages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        updateServicePage(filePath);
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log('\n✅ Service pages update completed!');
console.log('\n📋 Summary:');
console.log('- Login system integrated into navigation');
console.log('- Auth modals added to all service pages');
console.log('- AWS Cognito scripts included');
console.log('- Responsive design implemented');
console.log('\n🎯 Next steps:');
console.log('1. Deploy AWS infrastructure with ./deploy-aws-auth.sh');
console.log('2. Test login functionality on service pages');
console.log('3. Verify user progress saving works');
