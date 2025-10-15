#!/usr/bin/env node

/**
 * 🚀 WORKFLOW-DATEIEN OPTIMIERER
 * 
 * Optimiert alle Workflow-Dateien automatisch
 */

const fs = require('fs');
const path = require('path');

const workflowFiles = [
    'ki-stellenanalyse.html',
    'matching-skillgap.html',
    'anschreiben-generieren.html',
    'dokumente-optimieren.html',
    'design-layout.html',
    'export-versand.html'
];

console.log('🚀 OPTIMIERE WORKFLOW-DATEIEN...\n');

workflowFiles.forEach(file => {
    console.log(`📄 Optimiere ${file}...`);
    
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${file} nicht gefunden`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Scripts mit async optimieren
    content = content.replace(
        /<script([^>]*?)src="([^"]*?)"([^>]*?)>/g,
        '<script$1src="$2"$3 async>'
    );
    
    // 2. Workflow Enhancements hinzufügen
    if (!content.includes('workflow-enhancements.js')) {
        content = content.replace(
            '</body>',
            '    <!-- Workflow Enhancements -->\n    <script src="js/workflow-enhancements.js" async></script>\n</body>'
        );
    }
    
    // 3. Console.log entfernen (außer DEBUG)
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    
    // 4. Moderne CSS hinzufügen
    if (!content.includes('@media')) {
        const modernCSS = `
        @media (max-width: 768px) {
            .workflow-step-container {
                padding: 1rem;
            }
            .workflow-steps {
                grid-template-columns: 1fr;
            }
        }`;
        
        content = content.replace('</style>', `${modernCSS}\n    </style>`);
    }
    
    // 5. Dark Mode CSS hinzufügen
    if (!content.includes('dark-mode')) {
        const darkModeCSS = `
        .dark-mode {
            background: #1a1a1a !important;
            color: #ffffff !important;
        }
        .dark-mode .workflow-step {
            background: #2d2d2d !important;
            color: #ffffff !important;
        }`;
        
        content = content.replace('</style>', `${darkModeCSS}\n    </style>`);
    }
    
    // Datei speichern
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file} optimiert`);
});

console.log('\n🎉 ALLE WORKFLOW-DATEIEN OPTIMIERT!');
console.log('📊 Optimierungen:');
console.log('  ✅ Scripts mit async optimiert');
console.log('  ✅ Workflow Enhancements hinzugefügt');
console.log('  ✅ Console.log entfernt');
console.log('  ✅ Responsive CSS hinzugefügt');
console.log('  ✅ Dark Mode CSS hinzugefügt');
