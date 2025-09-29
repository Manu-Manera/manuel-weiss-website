/**
 * Docmosis DocGen Editor
 * Erweiterte Dokumentengenerierung mit Platzhaltern und Vorlagen
 */

class DocmosisDocGenEditor {
    constructor() {
        this.templates = this.loadTemplates();
        this.contentBlocks = this.loadContentBlocks();
        this.placeholders = this.getAvailablePlaceholders();
        this.currentDocument = '';
        this.isOpen = false;
    }

    loadTemplates() {
        const saved = localStorage.getItem('docmosisTemplates');
        return saved ? JSON.parse(saved) : {
            'Anschreiben Standard': {
                name: 'Anschreiben Standard',
                content: `# Anschreiben

{{senderName}}
{{senderAddress}}

{{company}}
{{companyAddress}}

Betreff: Bewerbung als {{position}}

Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{position}} gelesen.

{{requirementSentences}}

Mit freundlichen Grüßen
{{senderName}}`,
                category: 'Bewerbung',
                created: new Date().toISOString()
            },
            'Lebenslauf': {
                name: 'Lebenslauf',
                content: `# Lebenslauf

## Persönliche Daten
Name: {{senderName}}
Adresse: {{senderAddress}}
E-Mail: {{senderEmail}}
Telefon: {{senderPhone}}

## Berufserfahrung
{{workExperience}}

## Ausbildung
{{education}}

## Qualifikationen
{{qualifications}}`,
                category: 'Bewerbung',
                created: new Date().toISOString()
            }
        };
    }

    loadContentBlocks() {
        const saved = localStorage.getItem('docmosisContentBlocks');
        return saved ? JSON.parse(saved) : {
            'Einleitung Standard': {
                name: 'Einleitung Standard',
                content: 'mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{position}} gelesen.',
                category: 'Einleitung'
            },
            'Schluss Standard': {
                name: 'Schluss Standard',
                content: 'Mit freundlichen Grüßen\n{{senderName}}',
                category: 'Schluss'
            }
        };
    }

    getAvailablePlaceholders() {
        return {
            'Persönliche Daten': [
                '{{senderName}}',
                '{{senderAddress}}',
                '{{senderEmail}}',
                '{{senderPhone}}'
            ],
            'Unternehmensdaten': [
                '{{company}}',
                '{{companyAddress}}',
                '{{position}}',
                '{{jobDescription}}'
            ],
            'Bewerbungsinhalt': [
                '{{requirementSentences}}',
                '{{workExperience}}',
                '{{education}}',
                '{{qualifications}}',
                '{{skills}}',
                '{{achievements}}'
            ],
            'Datum & Zeit': [
                '{{currentDate}}',
                '{{applicationDate}}'
            ]
        };
    }

    openEditor() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        const editorWindow = window.open('', 'docmosis-editor', 'width=1400,height=900,scrollbars=yes,resizable=yes');
        
        editorWindow.document.write(this.getEditorHTML());
        editorWindow.document.close();
        
        // Initialize editor
        editorWindow.addEventListener('load', () => {
            this.initializeEditor(editorWindow);
        });
    }

    getEditorHTML() {
        return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docmosis DocGen Editor</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        
        .editor-container {
            display: flex;
            height: 100vh;
            background: white;
        }
        
        .sidebar {
            width: 300px;
            background: #2c3e50;
            color: white;
            overflow-y: auto;
        }
        
        .sidebar-section {
            padding: 1rem;
            border-bottom: 1px solid #34495e;
        }
        
        .sidebar-section h3 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            color: #ecf0f1;
        }
        
        .sidebar-item {
            padding: 0.5rem;
            background: #34495e;
            margin: 0.25rem 0;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .sidebar-item:hover {
            background: #3498db;
        }
        
        .main-editor {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .toolbar {
            background: #34495e;
            color: white;
            padding: 1rem;
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #3498db;
            color: white;
        }
        
        .btn-primary:hover {
            background: #2980b9;
        }
        
        .btn-success {
            background: #27ae60;
            color: white;
        }
        
        .btn-success:hover {
            background: #229954;
        }
        
        .btn-secondary {
            background: #95a5a6;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #7f8c8d;
        }
        
        .editor-content {
            flex: 1;
            display: flex;
        }
        
        .editor-textarea {
            flex: 1;
            border: none;
            padding: 1rem;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
        }
        
        .placeholder-panel {
            width: 300px;
            background: #ecf0f1;
            border-left: 1px solid #bdc3c7;
            padding: 1rem;
            overflow-y: auto;
        }
        
        .placeholder-category {
            margin-bottom: 1rem;
        }
        
        .placeholder-category h4 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .placeholder-item {
            padding: 0.25rem 0.5rem;
            background: white;
            border: 1px solid #bdc3c7;
            border-radius: 3px;
            margin: 0.25rem 0;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s;
        }
        
        .placeholder-item:hover {
            background: #3498db;
            color: white;
        }
        
        .template-preview {
            background: white;
            border: 1px solid #bdc3c7;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 0.25rem 0;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .template-preview:hover {
            background: #f8f9fa;
        }
        
        .content-block {
            background: white;
            border: 1px solid #bdc3c7;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 0.25rem 0;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .content-block:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="editor-container">
        <div class="sidebar">
            <div class="sidebar-section">
                <h3><i class="fas fa-file-alt"></i> Templates</h3>
                <div id="templatesList"></div>
                <button class="btn btn-primary" onclick="saveAsTemplate()" style="width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-save"></i> Als Template speichern
                </button>
            </div>
            
            <div class="sidebar-section">
                <h3><i class="fas fa-puzzle-piece"></i> Inhaltsblöcke</h3>
                <div id="contentBlocksList"></div>
                <button class="btn btn-secondary" onclick="saveAsContentBlock()" style="width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-plus"></i> Als Block speichern
                </button>
            </div>
        </div>
        
        <div class="main-editor">
            <div class="toolbar">
                <button class="btn btn-primary" onclick="insertPlaceholder('{{senderName}}')">
                    <i class="fas fa-user"></i> Name
                </button>
                <button class="btn btn-primary" onclick="insertPlaceholder('{{company}}')">
                    <i class="fas fa-building"></i> Unternehmen
                </button>
                <button class="btn btn-primary" onclick="insertPlaceholder('{{position}}')">
                    <i class="fas fa-briefcase"></i> Position
                </button>
                <button class="btn btn-primary" onclick="insertPlaceholder('{{requirementSentences}}')">
                    <i class="fas fa-list"></i> Anforderungen
                </button>
                <div style="flex: 1;"></div>
                <button class="btn btn-success" onclick="generateDocument()">
                    <i class="fas fa-magic"></i> Dokument generieren
                </button>
                <button class="btn btn-secondary" onclick="window.close()">
                    <i class="fas fa-times"></i> Schließen
                </button>
            </div>
            
            <div class="editor-content">
                <textarea id="docmosisTemplate" class="editor-textarea" placeholder="Docmosis Template hier eingeben...">
# Anschreiben

{{senderName}}
{{senderAddress}}

{{company}}
{{companyAddress}}

Betreff: Bewerbung als {{position}}

Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{position}} gelesen.

{{requirementSentences}}

Mit freundlichen Grüßen
{{senderName}}
                </textarea>
                
                <div class="placeholder-panel">
                    <h3><i class="fas fa-tags"></i> Platzhalter</h3>
                    <div id="placeholdersList"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Editor JavaScript wird hier eingefügt
        window.editorInstance = null;
        
        function initializeEditor() {
            window.editorInstance = new DocmosisEditorInstance();
            window.editorInstance.loadTemplates();
            window.editorInstance.loadContentBlocks();
            window.editorInstance.loadPlaceholders();
        }
        
        function insertPlaceholder(placeholder) {
            const textarea = document.getElementById('docmosisTemplate');
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            
            textarea.value = textBefore + placeholder + textAfter;
            textarea.focus();
            textarea.setSelectionRange(cursorPos + placeholder.length, cursorPos + placeholder.length);
        }
        
        function generateDocument() {
            const template = document.getElementById('docmosisTemplate').value;
            console.log('📝 Generating document from template:', template);
            
            // Simulate document generation
            alert('Dokument wird generiert... (Docmosis DocGen Simulation)');
            
            // In real implementation, this would call Docmosis API
            // const result = await docmosisAPI.generateDocument(template, variables);
        }
        
        function saveAsTemplate() {
            const templateName = prompt('Template-Name eingeben:');
            if (templateName) {
                const templateContent = document.getElementById('docmosisTemplate').value;
                window.editorInstance.saveTemplate(templateName, templateContent);
            }
        }
        
        function saveAsContentBlock() {
            const blockName = prompt('Block-Name eingeben:');
            if (blockName) {
                const blockContent = document.getElementById('docmosisTemplate').value;
                window.editorInstance.saveContentBlock(blockName, blockContent);
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeEditor);
    </script>
</body>
</html>
        `;
    }

    initializeEditor(editorWindow) {
        // Set up the editor instance in the new window
        editorWindow.DocmosisEditorInstance = class {
            constructor() {
                this.templates = JSON.parse(localStorage.getItem('docmosisTemplates') || '{}');
                this.contentBlocks = JSON.parse(localStorage.getItem('docmosisContentBlocks') || '{}');
            }

            loadTemplates() {
                const templatesList = editorWindow.document.getElementById('templatesList');
                templatesList.innerHTML = Object.values(this.templates).map(template => `
                    <div class="template-preview" onclick="loadTemplate('${template.name}')">
                        <strong>${template.name}</strong><br>
                        <small>${template.category}</small>
                    </div>
                `).join('');
            }

            loadContentBlocks() {
                const contentBlocksList = editorWindow.document.getElementById('contentBlocksList');
                contentBlocksList.innerHTML = Object.values(this.contentBlocks).map(block => `
                    <div class="content-block" onclick="insertContentBlock('${block.name}')">
                        <strong>${block.name}</strong><br>
                        <small>${block.category}</small>
                    </div>
                `).join('');
            }

            loadPlaceholders() {
                const placeholdersList = editorWindow.document.getElementById('placeholdersList');
                const placeholders = {
                    'Persönliche Daten': ['{{senderName}}', '{{senderAddress}}', '{{senderEmail}}', '{{senderPhone}}'],
                    'Unternehmensdaten': ['{{company}}', '{{companyAddress}}', '{{position}}', '{{jobDescription}}'],
                    'Bewerbungsinhalt': ['{{requirementSentences}}', '{{workExperience}}', '{{education}}', '{{qualifications}}'],
                    'Datum & Zeit': ['{{currentDate}}', '{{applicationDate}}']
                };

                placeholdersList.innerHTML = Object.entries(placeholders).map(([category, items]) => `
                    <div class="placeholder-category">
                        <h4>${category}</h4>
                        ${items.map(item => `
                            <div class="placeholder-item" onclick="insertPlaceholder('${item}')">
                                ${item}
                            </div>
                        `).join('')}
                    </div>
                `).join('');
            }

            saveTemplate(name, content) {
                this.templates[name] = {
                    name: name,
                    content: content,
                    category: 'Benutzerdefiniert',
                    created: new Date().toISOString()
                };
                localStorage.setItem('docmosisTemplates', JSON.stringify(this.templates));
                this.loadTemplates();
                alert('Template gespeichert!');
            }

            saveContentBlock(name, content) {
                this.contentBlocks[name] = {
                    name: name,
                    content: content,
                    category: 'Benutzerdefiniert',
                    created: new Date().toISOString()
                };
                localStorage.setItem('docmosisContentBlocks', JSON.stringify(this.contentBlocks));
                this.loadContentBlocks();
                alert('Inhaltsblock gespeichert!');
            }
        };

        // Set up global functions in the editor window
        editorWindow.loadTemplate = function(templateName) {
            const template = window.editorInstance.templates[templateName];
            if (template) {
                document.getElementById('docmosisTemplate').value = template.content;
            }
        };

        editorWindow.insertContentBlock = function(blockName) {
            const block = window.editorInstance.contentBlocks[blockName];
            if (block) {
                const textarea = document.getElementById('docmosisTemplate');
                const cursorPos = textarea.selectionStart;
                const textBefore = textarea.value.substring(0, cursorPos);
                const textAfter = textarea.value.substring(cursorPos);
                
                textarea.value = textBefore + block.content + textAfter;
                textarea.focus();
            }
        };

        // Initialize the editor
        editorWindow.editorInstance = new editorWindow.DocmosisEditorInstance();
        editorWindow.editorInstance.loadTemplates();
        editorWindow.editorInstance.loadContentBlocks();
        editorWindow.editorInstance.loadPlaceholders();
    }

    generateDocumentFromTemplate(template, variables = {}) {
        let document = template;
        
        // Replace placeholders with actual values
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            document = document.replace(new RegExp(placeholder, 'g'), value || '');
        });
        
        // Replace common placeholders with current data
        const currentDate = new Date().toLocaleDateString('de-DE');
        document = document.replace(/{{currentDate}}/g, currentDate);
        document = document.replace(/{{applicationDate}}/g, currentDate);
        
        return document;
    }
}

// Global instance
window.docmosisEditor = new DocmosisDocGenEditor();

// Global function to open editor
window.openDocmosisEditor = function() {
    window.docmosisEditor.openEditor();
};

// Global function to generate document
window.generateDocmosisDocument = function(template, variables) {
    return window.docmosisEditor.generateDocumentFromTemplate(template, variables);
};
