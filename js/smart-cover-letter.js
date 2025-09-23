// Smart Cover Letter Generator with Best Practices

// Best Practices Configuration
const COVER_LETTER_CONFIG = {
    maxCharacters: 4000,
    minCharacters: 2000,
    idealParagraphs: 4,
    tones: {
        'professional': 'Professionell und sachlich',
        'confident': 'Selbstbewusst und überzeugend',
        'enthusiastic': 'Enthusiastisch und motiviert',
        'formal': 'Formal und traditionell'
    },
    structures: {
        'classic': {
            name: 'Klassisch',
            sections: ['Anrede', 'Motivation', 'Qualifikationen', 'Mehrwert', 'Abschluss']
        },
        'modern': {
            name: 'Modern',
            sections: ['Anrede', 'Hook', 'Kompetenzen', 'Erfolge', 'Call-to-Action']
        },
        'storytelling': {
            name: 'Storytelling',
            sections: ['Anrede', 'Geschichte', 'Verbindung', 'Vision', 'Abschluss']
        }
    }
};

// Enhanced cover letter generation
function generateSmartCoverLetter() {
    setTimeout(() => {
        const editor = document.getElementById('coverLetterEditor');
        if (!editor) return;
        
        // Show loading state
        editor.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Anschreiben wird mit KI generiert...</p>
                <p style="font-size: 0.875rem;">Analysiere Stellenbeschreibung und erstelle personalisierten Inhalt</p>
            </div>
        `;
        
        // Simulate AI processing
        setTimeout(() => {
            const coverLetter = generateCoverLetterContent();
            displayCoverLetterWithFeatures(editor, coverLetter);
            workflowData.coverLetter = coverLetter;
            updateCoverLetterStats();
        }, 2000);
    }, 500);
}

function generateCoverLetterContent() {
    const jobDescription = workflowData.jobDescription || '';
    const company = workflowData.company || 'Ihr Unternehmen';
    const position = workflowData.position || 'die ausgeschriebene Position';
    
    // Extract keywords from job description
    const keywords = extractKeywords(jobDescription);
    
    // Generate content based on best practices
    return `
        <div class="cover-letter-section" data-section="greeting">
            <p>Sehr geehrte Damen und Herren,</p>
        </div>
        
        <div class="cover-letter-section" data-section="opening">
            <p>mit großer Begeisterung habe ich Ihre Stellenausschreibung für die Position als ${position} bei ${company} gelesen. Die beschriebenen Herausforderungen und Anforderungen entsprechen exakt meinem beruflichen Profil und meinen Karrierezielen.</p>
        </div>
        
        <div class="cover-letter-section" data-section="qualifications">
            <p>In meiner über 15-jährigen Laufbahn als HR-Experte und Digitalisierungsberater konnte ich umfangreiche Erfahrungen in ${keywords.join(', ')} sammeln. Besonders stolz bin ich auf die erfolgreiche Implementierung eines KI-gestützten Bewerbermanagement-Systems, das die Recruiting-Effizienz um 40% steigerte.</p>
        </div>
        
        <div class="cover-letter-section" data-section="value">
            <p>Meine Expertise in der strategischen HR-Transformation und mein tiefes Verständnis für digitale Innovationen würde ich gerne in Ihr Team einbringen. Dabei bringe ich nicht nur technisches Know-how mit, sondern auch die Fähigkeit, komplexe Veränderungsprozesse erfolgreich zu begleiten und Teams zu inspirieren.</p>
        </div>
        
        <div class="cover-letter-section" data-section="closing">
            <p>Über die Möglichkeit, meine Erfahrungen in einem persönlichen Gespräch zu präsentieren, würde ich mich sehr freuen.</p>
            <p>Mit freundlichen Grüßen<br>Manuel Weiß</p>
        </div>
    `;
}

function extractKeywords(jobDescription) {
    const keywords = [
        'HR-Beratung', 'Digitalisierung', 'Prozessoptimierung', 
        'Change Management', 'Personalentwicklung', 'HR-Tech'
    ];
    
    if (jobDescription) {
        const text = jobDescription.toLowerCase();
        const additionalKeywords = [];
        
        // Smart keyword extraction
        if (text.includes('agil')) additionalKeywords.push('agilen Methoden');
        if (text.includes('data') || text.includes('analytics')) additionalKeywords.push('People Analytics');
        if (text.includes('cloud')) additionalKeywords.push('Cloud-Lösungen');
        if (text.includes('scrum') || text.includes('kanban')) additionalKeywords.push('agile Frameworks');
        
        return [...keywords, ...additionalKeywords].slice(0, 5);
    }
    
    return keywords;
}

function displayCoverLetterWithFeatures(editor, content) {
    editor.innerHTML = `
        <div style="position: relative;">
            ${content}
            <div class="cover-letter-toolbar" style="position: sticky; bottom: 0; background: white; border-top: 1px solid #e5e7eb; padding: 1rem; margin-top: 2rem;">
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
                    <button onclick="regenerateSection()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-sync"></i> Abschnitt neu generieren
                    </button>
                    <button onclick="improveText()" style="padding: 0.5rem 1rem; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-magic"></i> Text verbessern
                    </button>
                    <button onclick="changeTone()" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-palette"></i> Ton ändern
                    </button>
                    <button onclick="addPersonalTouch()" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-heart"></i> Persönlicher machen
                    </button>
                    <button onclick="checkBestPractices()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-check-circle"></i> Best Practices
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Make sections selectable and editable
    const sections = editor.querySelectorAll('.cover-letter-section');
    sections.forEach(section => {
        section.style.cssText += 'padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px; cursor: pointer; transition: all 0.2s;';
        section.contentEditable = true;
        
        section.addEventListener('mouseenter', () => {
            section.style.backgroundColor = '#f0f9ff';
            section.style.borderLeft = '3px solid #6366f1';
        });
        
        section.addEventListener('mouseleave', () => {
            if (!section.classList.contains('selected')) {
                section.style.backgroundColor = '';
                section.style.borderLeft = '';
            }
        });
        
        section.addEventListener('click', () => {
            // Remove selection from other sections
            sections.forEach(s => {
                s.classList.remove('selected');
                s.style.backgroundColor = '';
                s.style.borderLeft = '';
            });
            
            // Select current section
            section.classList.add('selected');
            section.style.backgroundColor = '#eff6ff';
            section.style.borderLeft = '3px solid #2563eb';
        });
    });
}

function updateCoverLetterStats() {
    const editor = document.getElementById('coverLetterEditor');
    if (!editor) return;
    
    const text = editor.textContent || '';
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const paragraphCount = editor.querySelectorAll('.cover-letter-section').length;
    
    // Create or update stats display
    let statsDisplay = document.getElementById('coverLetterStats');
    if (!statsDisplay) {
        statsDisplay = document.createElement('div');
        statsDisplay.id = 'coverLetterStats';
        editor.parentNode.insertBefore(statsDisplay, editor.nextSibling);
    }
    
    const isOptimal = charCount >= COVER_LETTER_CONFIG.minCharacters && 
                     charCount <= COVER_LETTER_CONFIG.maxCharacters;
    
    statsDisplay.innerHTML = `
        <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">Anschreiben-Analyse</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; font-size: 0.875rem;">
                <div>
                    <span style="color: #666;">Zeichen:</span>
                    <span style="font-weight: 600; color: ${isOptimal ? '#10b981' : '#f59e0b'};">
                        ${charCount}/${COVER_LETTER_CONFIG.maxCharacters}
                    </span>
                </div>
                <div>
                    <span style="color: #666;">Wörter:</span>
                    <span style="font-weight: 600;">${wordCount}</span>
                </div>
                <div>
                    <span style="color: #666;">Absätze:</span>
                    <span style="font-weight: 600;">${paragraphCount}</span>
                </div>
                <div>
                    <span style="color: #666;">Status:</span>
                    <span style="font-weight: 600; color: ${isOptimal ? '#10b981' : '#f59e0b'};">
                        ${isOptimal ? '✓ Optimal' : '⚠ Anpassen'}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Smart functions for cover letter enhancement
function regenerateSection() {
    const selectedSection = document.querySelector('.cover-letter-section.selected');
    if (!selectedSection) {
        alert('Bitte wählen Sie zuerst einen Abschnitt aus.');
        return;
    }
    
    const sectionType = selectedSection.dataset.section;
    const newContent = generateSectionContent(sectionType);
    
    selectedSection.innerHTML = newContent;
    updateCoverLetterStats();
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Abschnitt neu generiert', 'success');
    }
}

function generateSectionContent(sectionType) {
    const templates = {
        'opening': [
            `<p>mit großem Interesse bin ich auf Ihre Stellenausschreibung für die Position als ${workflowData.position} aufmerksam geworden. Die innovative Ausrichtung Ihres Unternehmens und die spannenden Herausforderungen der Rolle haben mich sofort begeistert.</p>`,
            `<p>die Verbindung aus strategischer HR-Arbeit und digitaler Innovation, die Sie in der Stellenbeschreibung für ${workflowData.position} beschreiben, entspricht genau meiner beruflichen Leidenschaft und Expertise.</p>`,
            `<p>als erfahrener HR-Experte mit ausgeprägter Digitalisierungsexpertise sehe ich in der Position als ${workflowData.position} bei ${workflowData.company} die perfekte Gelegenheit, meine Kompetenzen einzusetzen und weiterzuentwickeln.</p>`
        ],
        'qualifications': [
            `<p>In meiner über 15-jährigen Laufbahn habe ich erfolgreich komplexe HR-Transformationsprojekte geleitet und dabei stets den Menschen in den Mittelpunkt gestellt. Meine Expertise umfasst die Implementierung innovativer HR-Tech-Lösungen sowie die Entwicklung zukunftsweisender Personalstrategien.</p>`,
            `<p>Meine umfangreiche Erfahrung in der Digitalisierung von HR-Prozessen, kombiniert mit meinem tiefen Verständnis für Change Management, ermöglicht es mir, Organisationen erfolgreich durch Transformationsphasen zu begleiten.</p>`
        ]
    };
    
    const options = templates[sectionType] || [`<p>Neuer Inhalt für ${sectionType}</p>`];
    return options[Math.floor(Math.random() * options.length)];
}

function improveText() {
    const selectedSection = document.querySelector('.cover-letter-section.selected');
    if (!selectedSection) {
        const selection = window.getSelection();
        if (selection.toString().length === 0) {
            alert('Bitte markieren Sie Text oder wählen Sie einen Abschnitt aus.');
            return;
        }
        
        // Improve selected text
        const selectedText = selection.toString();
        const improvedText = enhanceText(selectedText);
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(improvedText));
        }
    } else {
        // Improve entire section
        const currentText = selectedSection.textContent;
        const improvedText = enhanceText(currentText);
        selectedSection.innerHTML = `<p>${improvedText}</p>`;
    }
    
    updateCoverLetterStats();
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Text verbessert', 'success');
    }
}

function enhanceText(text) {
    // Simple text enhancement (in real app, this would use AI)
    return text
        .replace(/sehr gut/g, 'hervorragend')
        .replace(/gut/g, 'erfolgreich')
        .replace(/ich kann/g, 'ich bin in der Lage')
        .replace(/ich habe/g, 'ich verfüge über')
        .replace(/machen/g, 'umsetzen')
        .replace(/\s+/g, ' ')
        .trim();
}

function changeTone() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%;">
            <h3 style="margin-bottom: 1.5rem;">Ton des Anschreibens ändern</h3>
            <div style="display: grid; gap: 1rem;">
                ${Object.entries(COVER_LETTER_CONFIG.tones).map(([key, value]) => `
                    <button onclick="applyTone('${key}'); this.closest('[style*=\"position: fixed\"]').remove();" 
                            style="padding: 1rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; text-align: left;">
                        <strong>${value}</strong>
                    </button>
                `).join('')}
            </div>
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" 
                    style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Abbrechen
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function applyTone(tone) {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast(`Ton geändert zu: ${COVER_LETTER_CONFIG.tones[tone]}`, 'success');
    }
    
    // In real implementation, this would regenerate content with the selected tone
    updateCoverLetterStats();
}

function addPersonalTouch() {
    const personalizations = [
        "Besonders beeindruckt hat mich Ihr Engagement für nachhaltige HR-Praktiken.",
        "Ihre innovativen Ansätze in der Mitarbeiterentwicklung sprechen mich sehr an.",
        "Die Unternehmenskultur, die Vielfalt und Innovation fördert, motiviert mich zusätzlich.",
        "Ihr Fokus auf Work-Life-Balance und Mitarbeiterzufriedenheit teile ich vollständig."
    ];
    
    const randomPersonalization = personalizations[Math.floor(Math.random() * personalizations.length)];
    
    // Add to the end of the qualifications section
    const qualSection = document.querySelector('[data-section="qualifications"]');
    if (qualSection) {
        qualSection.innerHTML += ` ${randomPersonalization}`;
        updateCoverLetterStats();
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Persönliche Note hinzugefügt', 'success');
        }
    }
}

function checkBestPractices() {
    const editor = document.getElementById('coverLetterEditor');
    const text = editor.textContent || '';
    const issues = [];
    
    // Check character count
    if (text.length < COVER_LETTER_CONFIG.minCharacters) {
        issues.push(`Zu kurz: ${text.length}/${COVER_LETTER_CONFIG.minCharacters} Zeichen minimum`);
    }
    if (text.length > COVER_LETTER_CONFIG.maxCharacters) {
        issues.push(`Zu lang: ${text.length}/${COVER_LETTER_CONFIG.maxCharacters} Zeichen maximum`);
    }
    
    // Check structure
    const sections = editor.querySelectorAll('.cover-letter-section').length;
    if (sections < 4) {
        issues.push('Zu wenige Absätze (mindestens 4 empfohlen)');
    }
    
    // Check for weak words
    const weakWords = ['vielleicht', 'eventuell', 'möglicherweise', 'ziemlich'];
    weakWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
            issues.push(`Schwache Formulierung gefunden: "${word}"`);
        }
    });
    
    // Display results
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%;">
            <h3 style="margin-bottom: 1.5rem;">Best Practices Check</h3>
            ${issues.length === 0 ? 
                '<div style="color: #10b981; padding: 1rem; background: #f0fdf4; border-radius: 6px;"><i class="fas fa-check-circle"></i> Ihr Anschreiben erfüllt alle Best Practices!</div>' :
                `<div style="color: #ef4444; padding: 1rem; background: #fef2f2; border-radius: 6px;">
                    <strong>Verbesserungsvorschläge:</strong>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        ${issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>`
            }
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" 
                    style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Verstanden
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Export functions for cover letter
function exportCoverLetterPDF() {
    const editor = document.getElementById('coverLetterEditor');
    const content = editor.innerHTML;
    
    // Create PDF-friendly HTML
    const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
                .cover-letter-section { margin-bottom: 1em; }
                .cover-letter-toolbar { display: none; }
            </style>
        </head>
        <body>
            <h1>Anschreiben</h1>
            <div style="border-bottom: 2px solid #333; margin-bottom: 2em;"></div>
            ${content}
        </body>
        </html>
    `;
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anschreiben_${workflowData.company}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Anschreiben als HTML exportiert', 'success');
    }
}

function exportCoverLetterWord() {
    const editor = document.getElementById('coverLetterEditor');
    const content = editor.textContent;
    
    // Create Word-compatible document
    const wordContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Anschreiben</title></head>
        <body>
            <h1>Anschreiben</h1>
            <div style="white-space: pre-line;">${content}</div>
        </body>
        </html>
    `;
    
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anschreiben_${workflowData.company}_${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Anschreiben als Word exportiert', 'success');
    }
}

function exportCoverLetterODT() {
    // Create OpenDocument Text format
    const editor = document.getElementById('coverLetterEditor');
    const content = editor.textContent;
    
    const odtContent = `
        <?xml version="1.0" encoding="UTF-8"?>
        <office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0">
            <office:body>
                <office:text>
                    <text:h text:style-name="Heading_20_1">Anschreiben</text:h>
                    <text:p>${content.replace(/\n/g, '</text:p><text:p>')}</text:p>
                </office:text>
            </office:body>
        </office:document>
    `;
    
    const blob = new Blob([odtContent], { type: 'application/vnd.oasis.opendocument.text' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anschreiben_${workflowData.company}_${new Date().toISOString().split('T')[0]}.odt`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Anschreiben als OpenDocument exportiert', 'success');
    }
}
