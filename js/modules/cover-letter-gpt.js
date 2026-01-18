/**
 * CoverLetterGPT Integration Module
 * Extracted from bewerbungsmanager-coverlettergpt.html
 * Provides AI-powered cover letter generation with Chakra UI integration
 */

class CoverLetterGPT {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('🤖 CoverLetterGPT: Initializing...');
        await this.checkAPIKey();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ CoverLetterGPT: Ready');
    }

    async checkAPIKey() {
        // Check for OpenAI API key in localStorage or environment
        this.apiKey = localStorage.getItem('openai_api_key') || process.env.OPENAI_API_KEY;
        
        if (!this.apiKey) {
            this.showAPIKeyPrompt();
            return false;
        }
        
        this.showAPIStatus('success', 'OpenAI API Key gefunden');
        return true;
    }

    showAPIKeyPrompt() {
        const promptHTML = `
            <div class="api-status error">
                <h4>🔑 OpenAI API Key erforderlich</h4>
                <p>Bitte geben Sie Ihren OpenAI API Key ein:</p>
                <input type="password" id="api-key-input" placeholder="sk-..." style="width: 100%; padding: 0.5rem; margin: 0.5rem 0;">
                <button onclick="coverLetterGPT.saveAPIKey()" class="btn btn-primary">Speichern</button>
            </div>
        `;
        
        const container = document.querySelector('.api-status-container') || document.body;
        container.insertAdjacentHTML('beforeend', promptHTML);
    }

    saveAPIKey() {
        const input = document.getElementById('api-key-input');
        if (input && input.value) {
            this.apiKey = input.value;
            localStorage.setItem('openai_api_key', this.apiKey);
            this.showAPIStatus('success', 'API Key gespeichert');
            input.parentElement.remove();
        }
    }

    showAPIStatus(type, message) {
        const statusHTML = `
            <div class="api-status ${type}">
                <h4>${type === 'success' ? '✅' : '❌'} ${message}</h4>
            </div>
        `;
        
        const container = document.querySelector('.api-status-container') || document.body;
        container.insertAdjacentHTML('beforeend', statusHTML);
    }

    setupEventListeners() {
        // Cover Letter Generation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.generate-cover-letter-btn')) {
                this.generateCoverLetter();
            }
        });
    }

    async generateCoverLetter() {
        if (!this.apiKey) {
            this.showAPIKeyPrompt();
            return;
        }

        const jobDescription = document.getElementById('job-description')?.value;
        const userProfile = document.getElementById('user-profile')?.value;
        
        if (!jobDescription || !userProfile) {
            alert('Bitte füllen Sie alle Felder aus');
            return;
        }

        this.showLoading(true);
        
        try {
            const coverLetter = await this.callOpenAI(jobDescription, userProfile);
            this.displayCoverLetter(coverLetter);
        } catch (error) {
            console.error('Cover Letter Generation Error:', error);
            this.showError('Fehler beim Generieren des Anschreibens');
        } finally {
            this.showLoading(false);
        }
    }

    async callOpenAI(jobDescription, userProfile) {
        const prompt = `
            Erstelle ein professionelles Anschreiben basierend auf:
            
            Stellenausschreibung:
            ${jobDescription}
            
            Bewerberprofil:
            ${userProfile}
            
            Das Anschreiben soll:
            - Persönlich und überzeugend sein
            - Spezifische Qualifikationen hervorheben
            - Zeigen, wie der Bewerber zum Unternehmen passt
            - Professionell und fehlerfrei sein
            - Maximal 300 Wörter lang sein
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-5.2',
                reasoning_effort: 'medium',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein professioneller Karriereberater und hilfst bei der Erstellung von überzeugenden Anschreiben.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_completion_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    displayCoverLetter(coverLetter) {
        const preview = document.querySelector('.cover-letter-preview');
        if (preview) {
            preview.textContent = coverLetter;
            preview.style.display = 'block';
        }
    }

    showLoading(show) {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.classList.toggle('active', show);
        }
    }

    showError(message) {
        this.showAPIStatus('error', message);
    }

    // Chakra UI Integration
    renderChakraComponents() {
        // This would integrate with Chakra UI components
        // For now, we'll use vanilla JS with Chakra-inspired styling
        console.log('🎨 Chakra UI Components would be rendered here');
    }
}

// Initialize CoverLetterGPT
const coverLetterGPT = new CoverLetterGPT();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoverLetterGPT;
}