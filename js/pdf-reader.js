/**
 * PDF Reader und Analyzer
 * Ermöglicht das Lesen und Analysieren von PDF-Dateien
 */

class PDFReader {
    constructor() {
        this.pdfjsLib = null;
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialisiert die PDF.js Bibliothek
     */
    async init() {
        try {
            // PDF.js von CDN laden
            if (typeof window !== 'undefined' && !window.pdfjsLib) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    this.pdfjsLib = window.pdfjsLib;
                    this.isInitialized = true;
                    console.log('✅ PDF.js erfolgreich geladen');
                };
                document.head.appendChild(script);
            } else if (window.pdfjsLib) {
                this.pdfjsLib = window.pdfjsLib;
                this.isInitialized = true;
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden von PDF.js:', error);
        }
    }

    /**
     * Liest eine PDF-Datei und extrahiert den Text
     * @param {File} file - PDF-Datei
     * @returns {Promise<string>} Extrahierter Text
     */
    async readPDF(file) {
        if (!this.isInitialized) {
            await this.waitForInitialization();
        }

        try {
            console.log('📄 PDF wird gelesen:', file.name);
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await this.pdfjsLib.getDocument(arrayBuffer).promise;
            
            let fullText = '';
            
            // Alle Seiten durchgehen
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            
            console.log('✅ PDF erfolgreich gelesen:', fullText.length, 'Zeichen');
            return fullText;
            
        } catch (error) {
            console.error('❌ Fehler beim Lesen der PDF:', error);
            throw error;
        }
    }

    /**
     * Analysiert einen Lebenslauf und extrahiert wichtige Informationen
     * @param {string} text - Extrahierter Text aus PDF
     * @returns {Object} Strukturierte Lebenslauf-Daten
     */
    analyzeCV(text) {
        console.log('🔍 Analysiere Lebenslauf...');
        
        const cvData = {
            name: this.extractName(text),
            email: this.extractEmail(text),
            phone: this.extractPhone(text),
            experience: this.extractExperience(text),
            education: this.extractEducation(text),
            skills: this.extractSkills(text),
            languages: this.extractLanguages(text),
            summary: this.extractSummary(text)
        };
        
        console.log('✅ Lebenslauf-Analyse abgeschlossen:', cvData);
        return cvData;
    }

    /**
     * Extrahiert den Namen aus dem Text
     */
    extractName(text) {
        const lines = text.split('\n').filter(line => line.trim());
        // Erste Zeile mit mindestens 2 Wörtern und Großbuchstaben
        for (const line of lines) {
            const words = line.trim().split(/\s+/);
            if (words.length >= 2 && words.every(word => /^[A-ZÄÖÜ]/.test(word))) {
                return line.trim();
            }
        }
        return 'Name nicht gefunden';
    }

    /**
     * Extrahiert E-Mail-Adressen
     */
    extractEmail(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex);
        return emails ? emails[0] : 'E-Mail nicht gefunden';
    }

    /**
     * Extrahiert Telefonnummern
     */
    extractPhone(text) {
        const phoneRegex = /(\+?[0-9\s\-\(\)]{10,})/g;
        const phones = text.match(phoneRegex);
        return phones ? phones[0].trim() : 'Telefon nicht gefunden';
    }

    /**
     * Extrahiert Arbeitserfahrung
     */
    extractExperience(text) {
        const experience = [];
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Suche nach Positionen (oft mit Jahreszahlen)
            if (this.isJobTitle(line)) {
                const experienceItem = {
                    position: line,
                    company: this.findCompany(lines, i),
                    period: this.findPeriod(lines, i),
                    description: this.findDescription(lines, i)
                };
                experience.push(experienceItem);
            }
        }
        
        return experience;
    }

    /**
     * Prüft ob eine Zeile ein Job-Titel ist
     */
    isJobTitle(line) {
        const jobKeywords = [
            'Manager', 'Consultant', 'Specialist', 'Analyst', 'Developer', 'Engineer',
            'Berater', 'Manager', 'Spezialist', 'Analyst', 'Entwickler', 'Ingenieur',
            'Senior', 'Lead', 'Head', 'Director', 'CEO', 'CTO', 'CFO'
        ];
        
        return jobKeywords.some(keyword => 
            line.toLowerCase().includes(keyword.toLowerCase())
        ) && line.length > 5 && line.length < 100;
    }

    /**
     * Findet das Unternehmen für eine Position
     */
    findCompany(lines, positionIndex) {
        // Suche in den nächsten 3 Zeilen nach Unternehmen
        for (let i = positionIndex + 1; i < Math.min(positionIndex + 4, lines.length); i++) {
            const line = lines[i].trim();
            if (line.length > 2 && line.length < 100 && !this.isJobTitle(line)) {
                return line;
            }
        }
        return 'Unternehmen nicht gefunden';
    }

    /**
     * Findet den Zeitraum für eine Position
     */
    findPeriod(lines, positionIndex) {
        const yearRegex = /(19|20)\d{2}/g;
        
        // Suche in den nächsten 5 Zeilen nach Jahren
        for (let i = positionIndex; i < Math.min(positionIndex + 6, lines.length); i++) {
            const line = lines[i].trim();
            const years = line.match(yearRegex);
            if (years && years.length >= 1) {
                return line;
            }
        }
        return 'Zeitraum nicht gefunden';
    }

    /**
     * Findet die Beschreibung für eine Position
     */
    findDescription(lines, positionIndex) {
        let description = '';
        
        // Sammle die nächsten 3-5 Zeilen als Beschreibung
        for (let i = positionIndex + 1; i < Math.min(positionIndex + 6, lines.length); i++) {
            const line = lines[i].trim();
            if (line.length > 10 && !this.isJobTitle(line)) {
                description += line + ' ';
            }
        }
        
        return description.trim() || 'Beschreibung nicht gefunden';
    }

    /**
     * Extrahiert Ausbildung
     */
    extractEducation(text) {
        const education = [];
        const lines = text.split('\n');
        
        const educationKeywords = [
            'Bachelor', 'Master', 'Diplom', 'Studium', 'Universität', 'Hochschule',
            'Ausbildung', 'Lehre', 'Zertifikat', 'Certificate', 'Degree'
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (educationKeywords.some(keyword => 
                line.toLowerCase().includes(keyword.toLowerCase())
            )) {
                education.push({
                    degree: line,
                    institution: this.findInstitution(lines, i),
                    period: this.findPeriod(lines, i)
                });
            }
        }
        
        return education;
    }

    /**
     * Findet die Institution für eine Ausbildung
     */
    findInstitution(lines, positionIndex) {
        for (let i = positionIndex + 1; i < Math.min(positionIndex + 3, lines.length); i++) {
            const line = lines[i].trim();
            if (line.length > 5 && line.length < 100) {
                return line;
            }
        }
        return 'Institution nicht gefunden';
    }

    /**
     * Extrahiert Fähigkeiten
     */
    extractSkills(text) {
        const skills = [];
        const skillKeywords = [
            'SAP', 'SuccessFactors', 'Workday', 'BambooHR', 'Personio',
            'JavaScript', 'Python', 'Java', 'SQL', 'HTML', 'CSS',
            'Agile', 'Scrum', 'Design Thinking', 'Projektmanagement',
            'HR', 'Recruiting', 'Talent Management', 'Change Management'
        ];
        
        for (const keyword of skillKeywords) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                skills.push(keyword);
            }
        }
        
        return skills;
    }

    /**
     * Extrahiert Sprachen
     */
    extractLanguages(text) {
        const languages = [];
        const languageKeywords = [
            'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Italienisch',
            'German', 'English', 'French', 'Spanish', 'Italian'
        ];
        
        for (const keyword of languageKeywords) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                languages.push(keyword);
            }
        }
        
        return languages;
    }

    /**
     * Extrahiert eine Zusammenfassung
     */
    extractSummary(text) {
        const lines = text.split('\n').filter(line => line.trim());
        
        // Suche nach längeren Absätzen als Zusammenfassung
        for (const line of lines) {
            if (line.length > 50 && line.length < 300) {
                return line;
            }
        }
        
        return 'Zusammenfassung nicht gefunden';
    }

    /**
     * Wartet auf die Initialisierung
     */
    async waitForInitialization() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!this.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!this.isInitialized) {
            throw new Error('PDF.js konnte nicht initialisiert werden');
        }
    }

    /**
     * Lädt eine PDF-Datei und analysiert sie
     * @param {File} file - PDF-Datei
     * @returns {Promise<Object>} Analysierte Lebenslauf-Daten
     */
    async loadAndAnalyzePDF(file) {
        try {
            console.log('🚀 Starte PDF-Analyse für:', file.name);
            
            // PDF lesen
            const text = await this.readPDF(file);
            
            // Lebenslauf analysieren
            const cvData = this.analyzeCV(text);
            
            console.log('✅ PDF-Analyse erfolgreich abgeschlossen');
            return cvData;
            
        } catch (error) {
            console.error('❌ Fehler bei PDF-Analyse:', error);
            throw error;
        }
    }
}

// Globale Instanz erstellen
window.PDFReader = PDFReader;

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFReader;
}

console.log('📚 PDF Reader geladen und bereit');
