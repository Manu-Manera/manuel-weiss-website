/**
 * PROFILE SETUP - JAVASCRIPT
 * Handles the profile creation form and data management
 */

class ProfileSetup {
    constructor() {
        this.form = document.getElementById('profileForm');
        this.applicationsCore = null;
        this.init();
    }

    async init() {
        console.log('👤 Initializing Profile Setup...');
        
        // Wait for applications core
        await this.waitForApplicationsCore();
        
        // Setup form handlers
        this.setupFormHandlers();
        
        // Setup dynamic form elements
        this.setupDynamicElements();
        
        // Load existing profile if available
        this.loadExistingProfile();
        
        console.log('✅ Profile Setup initialized');
    }

    async waitForApplicationsCore() {
        return new Promise((resolve) => {
            const checkCore = () => {
                if (window.applicationsCore && window.applicationsCore.isInitialized) {
                    this.applicationsCore = window.applicationsCore;
                    resolve();
                } else {
                    setTimeout(checkCore, 100);
                }
            };
            checkCore();
        });
    }

    setupFormHandlers() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Real-time validation
        this.setupValidation();

        // Skills input handling
        this.setupSkillsInput();

        // Current job checkbox
        this.setupCurrentJobHandlers();
    }

    setupDynamicElements() {
        // Add experience button
        document.getElementById('addExperience').addEventListener('click', () => {
            this.addExperienceItem();
        });

        // Add education button
        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationItem();
        });

        // Add language button
        document.getElementById('addLanguage').addEventListener('click', () => {
            this.addLanguageItem();
        });
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupSkillsInput() {
        const skillsInput = document.getElementById('technicalSkills');
        const skillsTags = document.getElementById('technicalTags');
        
        skillsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addSkillTag(skillsInput.value.trim());
                skillsInput.value = '';
            }
        });
        
        skillsInput.addEventListener('blur', () => {
            if (skillsInput.value.trim()) {
                this.addSkillTag(skillsInput.value.trim());
                skillsInput.value = '';
            }
        });
    }

    setupCurrentJobHandlers() {
        // Handle current job checkbox changes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'currentJob') {
                const endDateInput = e.target.closest('.experience-item').querySelector('input[name="endDate"]');
                if (e.target.checked) {
                    endDateInput.disabled = true;
                    endDateInput.value = '';
                } else {
                    endDateInput.disabled = false;
                }
            }
        });
    }

    addSkillTag(skill) {
        if (!skill) return;
        
        const skillsTags = document.getElementById('technicalTags');
        const existingTags = Array.from(skillsTags.children).map(tag => tag.textContent.trim());
        
        if (existingTags.includes(skill)) return;
        
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerHTML = `
            ${skill}
            <button type="button" class="remove-skill" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        skillsTags.appendChild(tag);
    }

    addExperienceItem() {
        const container = document.getElementById('experienceContainer');
        const newItem = this.createExperienceItem();
        container.appendChild(newItem);
        
        // Setup remove button
        const removeBtn = newItem.querySelector('.remove-experience');
        removeBtn.addEventListener('click', () => {
            newItem.remove();
        });
        
        // Setup current job handler
        const currentJobCheckbox = newItem.querySelector('input[name="currentJob"]');
        const endDateInput = newItem.querySelector('input[name="endDate"]');
        
        currentJobCheckbox.addEventListener('change', () => {
            if (currentJobCheckbox.checked) {
                endDateInput.disabled = true;
                endDateInput.value = '';
            } else {
                endDateInput.disabled = false;
            }
        });
        
        // Animate in
        newItem.classList.add('fade-in');
    }

    createExperienceItem() {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Position *</label>
                    <input type="text" name="position" class="form-input" placeholder="z.B. Softwareentwickler" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Unternehmen *</label>
                    <input type="text" name="company" class="form-input" placeholder="z.B. Tech Corp GmbH" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Von</label>
                    <input type="month" name="startDate" class="form-input">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bis</label>
                    <input type="month" name="endDate" class="form-input">
                    <div class="form-checkbox">
                        <input type="checkbox" name="currentJob">
                        <label>Aktuell</label>
                    </div>
                </div>
                
                <div class="form-group full-width">
                    <label class="form-label">Beschreibung</label>
                    <textarea name="description" class="form-textarea" rows="3" placeholder="Beschreiben Sie Ihre Aufgaben und Erfolge..."></textarea>
                </div>
            </div>
            
            <button type="button" class="btn btn-outline btn-sm remove-experience">
                <i class="fas fa-trash"></i>
                Entfernen
            </button>
        `;
        return div;
    }

    addEducationItem() {
        const container = document.getElementById('educationContainer');
        const newItem = this.createEducationItem();
        container.appendChild(newItem);
        
        // Setup remove button
        const removeBtn = newItem.querySelector('.remove-education');
        removeBtn.addEventListener('click', () => {
            newItem.remove();
        });
        
        // Animate in
        newItem.classList.add('fade-in');
    }

    createEducationItem() {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Abschluss *</label>
                    <select name="degree" class="form-select" required>
                        <option value="">Bitte wählen...</option>
                        <option value="abitur">Abitur</option>
                        <option value="fachabitur">Fachabitur</option>
                        <option value="ausbildung">Ausbildung</option>
                        <option value="bachelor">Bachelor</option>
                        <option value="master">Master</option>
                        <option value="diplom">Diplom</option>
                        <option value="doktor">Doktor</option>
                        <option value="zertifikat">Zertifikat</option>
                        <option value="sonstiges">Sonstiges</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Fachrichtung *</label>
                    <input type="text" name="field" class="form-input" placeholder="z.B. Informatik, BWL" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Institution</label>
                    <input type="text" name="institution" class="form-input" placeholder="z.B. Universität München">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jahr</label>
                    <input type="number" name="year" class="form-input" placeholder="2020" min="1950" max="2030">
                </div>
            </div>
            
            <button type="button" class="btn btn-outline btn-sm remove-education">
                <i class="fas fa-trash"></i>
                Entfernen
            </button>
        `;
        return div;
    }

    addLanguageItem() {
        const container = document.querySelector('.languages-container');
        const newItem = this.createLanguageItem();
        container.appendChild(newItem);
        
        // Setup remove button
        const removeBtn = newItem.querySelector('.remove-language');
        removeBtn.addEventListener('click', () => {
            newItem.remove();
        });
        
        // Animate in
        newItem.classList.add('fade-in');
    }

    createLanguageItem() {
        const div = document.createElement('div');
        div.className = 'language-item';
        div.innerHTML = `
            <input type="text" name="language" class="form-input" placeholder="Sprache">
            <select name="level" class="form-select">
                <option value="">Niveau</option>
                <option value="A1">A1 - Anfänger</option>
                <option value="A2">A2 - Grundkenntnisse</option>
                <option value="B1">B1 - Mittelstufe</option>
                <option value="B2">B2 - Gute Kenntnisse</option>
                <option value="C1">C1 - Sehr gute Kenntnisse</option>
                <option value="C2">C2 - Muttersprache</option>
            </select>
            <button type="button" class="btn btn-outline btn-sm remove-language">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return div;
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Required field validation
        if (isRequired && !value) {
            this.showFieldError(field, 'Dieses Feld ist erforderlich');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
                return false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                this.showFieldError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
                return false;
            }
        }
        
        // Number validation
        if (field.type === 'number' && value) {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            const numValue = parseFloat(value);
            
            if (min && numValue < parseFloat(min)) {
                this.showFieldError(field, `Wert muss mindestens ${min} sein`);
                return false;
            }
            
            if (max && numValue > parseFloat(max)) {
                this.showFieldError(field, `Wert darf höchstens ${max} sein`);
                return false;
            }
        }
        
        // Mark as valid
        field.classList.add('success');
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async handleFormSubmission() {
        console.log('📝 Handling form submission...');
        
        // Validate all fields
        const isValid = this.validateForm();
        if (!isValid) {
            this.showNotification('Bitte korrigieren Sie die Fehler im Formular', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Save profile data
            const savedProfile = this.applicationsCore.saveProfileData(formData);
            
            // Track progress
            this.applicationsCore.trackProgress('profile-setup', formData);
            
            // Show success message
            this.showNotification('Profil erfolgreich gespeichert!', 'success');
            
            // Redirect to next step
            setTimeout(() => {
                window.location.href = 'document-upload.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showNotification('Fehler beim Speichern des Profils. Bitte versuchen Sie es erneut.', 'error');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Basic fields
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (arrays)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Collect experience data
        data.experience = this.collectExperienceData();
        
        // Collect education data
        data.education = this.collectEducationData();
        
        // Collect skills
        data.technicalSkills = this.collectSkills();
        
        // Collect languages
        data.languages = this.collectLanguages();
        
        return data;
    }

    collectExperienceData() {
        const experiences = [];
        const experienceItems = document.querySelectorAll('.experience-item');
        
        experienceItems.forEach(item => {
            const experience = {
                position: item.querySelector('input[name="position"]').value,
                company: item.querySelector('input[name="company"]').value,
                startDate: item.querySelector('input[name="startDate"]').value,
                endDate: item.querySelector('input[name="endDate"]').value,
                currentJob: item.querySelector('input[name="currentJob"]').checked,
                description: item.querySelector('textarea[name="description"]').value
            };
            
            if (experience.position && experience.company) {
                experiences.push(experience);
            }
        });
        
        return experiences;
    }

    collectEducationData() {
        const educations = [];
        const educationItems = document.querySelectorAll('.education-item');
        
        educationItems.forEach(item => {
            const education = {
                degree: item.querySelector('select[name="degree"]').value,
                field: item.querySelector('input[name="field"]').value,
                institution: item.querySelector('input[name="institution"]').value,
                year: item.querySelector('input[name="year"]').value
            };
            
            if (education.degree && education.field) {
                educations.push(education);
            }
        });
        
        return educations;
    }

    collectSkills() {
        const skillTags = document.querySelectorAll('.skill-tag');
        return Array.from(skillTags).map(tag => 
            tag.textContent.replace('×', '').trim()
        );
    }

    collectLanguages() {
        const languages = [];
        const languageItems = document.querySelectorAll('.language-item');
        
        languageItems.forEach(item => {
            const language = item.querySelector('input[name="language"]').value;
            const level = item.querySelector('select[name="level"]').value;
            
            if (language) {
                languages.push({ language, level });
            }
        });
        
        return languages;
    }

    loadExistingProfile() {
        if (!this.applicationsCore) return;
        
        const existingProfile = this.applicationsCore.getProfileData();
        if (!existingProfile) return;
        
        console.log('📋 Loading existing profile...');
        
        // Populate basic fields
        Object.keys(existingProfile).forEach(key => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field && existingProfile[key]) {
                if (field.type === 'checkbox') {
                    field.checked = existingProfile[key];
                } else {
                    field.value = existingProfile[key];
                }
            }
        });
        
        // Populate experience
        if (existingProfile.experience && Array.isArray(existingProfile.experience)) {
            existingProfile.experience.forEach((exp, index) => {
                if (index > 0) {
                    this.addExperienceItem();
                }
                this.populateExperienceItem(index, exp);
            });
        }
        
        // Populate education
        if (existingProfile.education && Array.isArray(existingProfile.education)) {
            existingProfile.education.forEach((edu, index) => {
                if (index > 0) {
                    this.addEducationItem();
                }
                this.populateEducationItem(index, edu);
            });
        }
        
        // Populate skills
        if (existingProfile.technicalSkills && Array.isArray(existingProfile.technicalSkills)) {
            existingProfile.technicalSkills.forEach(skill => {
                this.addSkillTag(skill);
            });
        }
        
        // Populate languages
        if (existingProfile.languages && Array.isArray(existingProfile.languages)) {
            existingProfile.languages.forEach((lang, index) => {
                if (index > 0) {
                    this.addLanguageItem();
                }
                this.populateLanguageItem(index, lang);
            });
        }
    }

    populateExperienceItem(index, experience) {
        const items = document.querySelectorAll('.experience-item');
        const item = items[index];
        if (!item) return;
        
        item.querySelector('input[name="position"]').value = experience.position || '';
        item.querySelector('input[name="company"]').value = experience.company || '';
        item.querySelector('input[name="startDate"]').value = experience.startDate || '';
        item.querySelector('input[name="endDate"]').value = experience.endDate || '';
        item.querySelector('input[name="currentJob"]').checked = experience.currentJob || false;
        item.querySelector('textarea[name="description"]').value = experience.description || '';
        
        // Handle current job checkbox
        if (experience.currentJob) {
            item.querySelector('input[name="endDate"]').disabled = true;
        }
    }

    populateEducationItem(index, education) {
        const items = document.querySelectorAll('.education-item');
        const item = items[index];
        if (!item) return;
        
        item.querySelector('select[name="degree"]').value = education.degree || '';
        item.querySelector('input[name="field"]').value = education.field || '';
        item.querySelector('input[name="institution"]').value = education.institution || '';
        item.querySelector('input[name="year"]').value = education.year || '';
    }

    populateLanguageItem(index, language) {
        const items = document.querySelectorAll('.language-item');
        const item = items[index];
        if (!item) return;
        
        item.querySelector('input[name="language"]').value = language.language || '';
        item.querySelector('select[name="level"]').value = language.level || '';
    }

    showNotification(message, type = 'info') {
        if (this.applicationsCore) {
            this.applicationsCore.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileSetup = new ProfileSetup();
});

