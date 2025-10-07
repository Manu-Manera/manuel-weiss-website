// ✅ Validation Engine - Zentrale Validierungslogik für alle Bewerbungsprozesse
// Schema-basierte Validierung mit Custom Rules, Async Validation und Multi-Language Support

export class ValidationEngine {
    constructor(options = {}) {
        this.config = {
            language: options.language || 'de',
            enableAsyncValidation: options.enableAsyncValidation !== false,
            debounceDelay: options.debounceDelay || 300,
            showRealTimeErrors: options.showRealTimeErrors !== false,
            enableAccessibility: options.enableAccessibility !== false,
            ...options
        };

        this.validators = new Map();
        this.schemas = new Map();
        this.asyncValidators = new Map();
        this.validationResults = new Map();
        this.observers = new Set();
        
        this.registerDefaultValidators();
        this.registerDefaultSchemas();
    }

    // 🏗️ Schema Registration
    registerDefaultSchemas() {
        // Application Schema
        this.registerSchema('application', {
            company: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9\s\-\.&]+$/,
                customValidator: 'companyName'
            },
            position: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 200,
                customValidator: 'positionTitle'
            },
            status: {
                required: true,
                type: 'string',
                enum: ['pending', 'interview', 'offer', 'rejected', 'withdrawn']
            },
            appliedDate: {
                type: 'date',
                maxDate: 'today',
                customValidator: 'applicationDate'
            },
            responseDate: {
                type: 'date',
                minDate: 'appliedDate',
                dependsOn: ['appliedDate']
            },
            salary: {
                type: 'number',
                min: 0,
                max: 1000000,
                customValidator: 'salaryRange'
            },
            location: {
                type: 'string',
                maxLength: 100,
                customValidator: 'location'
            },
            jobUrl: {
                type: 'url',
                customValidator: 'jobUrl'
            },
            contactEmail: {
                type: 'email',
                customValidator: 'businessEmail'
            },
            contactPhone: {
                type: 'phone',
                customValidator: 'phoneNumber'
            },
            notes: {
                type: 'string',
                maxLength: 2000,
                customValidator: 'notes'
            },
            requirements: {
                type: 'array',
                items: {
                    type: 'string',
                    maxLength: 500
                }
            },
            benefits: {
                type: 'array',
                items: {
                    type: 'string',
                    maxLength: 200
                }
            }
        });

        // File Upload Schema
        this.registerSchema('fileUpload', {
            file: {
                required: true,
                type: 'file',
                maxSize: 50 * 1024 * 1024, // 50MB
                allowedTypes: [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ],
                customValidator: 'fileValidation'
            },
            category: {
                required: true,
                type: 'string',
                enum: ['cv', 'cover_letter', 'certificates', 'portfolio', 'other']
            },
            description: {
                type: 'string',
                maxLength: 500
            }
        });

        // User Profile Schema
        this.registerSchema('userProfile', {
            firstName: {
                required: true,
                type: 'string',
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-ZäöüÄÖÜß\s\-']+$/
            },
            lastName: {
                required: true,
                type: 'string',
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-ZäöüÄÖÜß\s\-']+$/
            },
            email: {
                required: true,
                type: 'email',
                customValidator: 'uniqueEmail'
            },
            phone: {
                type: 'phone',
                customValidator: 'phoneNumber'
            },
            address: {
                type: 'object',
                properties: {
                    street: { type: 'string', maxLength: 100 },
                    city: { type: 'string', maxLength: 50 },
                    postalCode: { type: 'string', pattern: /^[0-9]{4,5}$/ },
                    country: { type: 'string', enum: ['DE', 'AT', 'CH', 'LI'] }
                }
            }
        });
    }

    registerSchema(name, schema) {
        this.schemas.set(name, schema);
    }

    // 🔧 Validator Registration
    registerDefaultValidators() {
        // Basic type validators
        this.registerValidator('string', (value) => {
            return typeof value === 'string';
        });

        this.registerValidator('number', (value) => {
            return typeof value === 'number' && !isNaN(value);
        });

        this.registerValidator('boolean', (value) => {
            return typeof value === 'boolean';
        });

        this.registerValidator('array', (value) => {
            return Array.isArray(value);
        });

        this.registerValidator('object', (value) => {
            return value !== null && typeof value === 'object' && !Array.isArray(value);
        });

        this.registerValidator('date', (value) => {
            if (typeof value === 'string') {
                const date = new Date(value);
                return !isNaN(date.getTime());
            }
            return value instanceof Date && !isNaN(value.getTime());
        });

        this.registerValidator('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });

        this.registerValidator('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });

        this.registerValidator('phone', (value) => {
            // German, Austrian, Swiss phone number patterns
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleaned = value.replace(/[\s\-\(\)]/g, '');
            return phoneRegex.test(cleaned);
        });

        this.registerValidator('file', (value) => {
            return value instanceof File;
        });

        // Custom business validators
        this.registerValidator('companyName', async (value) => {
            if (!value || value.length < 2) {
                return { isValid: false, message: 'Firmenname muss mindestens 2 Zeichen haben' };
            }
            
            // Check for suspicious patterns
            const suspiciousPatterns = [
                /^test/i,
                /^sample/i,
                /^example/i,
                /^dummy/i
            ];
            
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(value)) {
                    return { 
                        isValid: false, 
                        message: 'Bitte geben Sie einen echten Firmennamen ein',
                        severity: 'warning'
                    };
                }
            }
            
            return { isValid: true };
        });

        this.registerValidator('positionTitle', (value) => {
            if (!value || value.length < 2) {
                return { isValid: false, message: 'Stellenbezeichnung muss mindestens 2 Zeichen haben' };
            }
            
            // Check for common position patterns
            const commonTitles = [
                'entwickler', 'manager', 'consultant', 'analyst', 'specialist',
                'coordinator', 'assistant', 'director', 'lead', 'senior', 'junior'
            ];
            
            const hasValidPattern = commonTitles.some(title => 
                value.toLowerCase().includes(title)
            );
            
            if (!hasValidPattern) {
                return {
                    isValid: true, // Still valid, just a suggestion
                    message: 'Überprüfen Sie die Stellenbezeichnung',
                    severity: 'info'
                };
            }
            
            return { isValid: true };
        });

        this.registerValidator('applicationDate', (value) => {
            if (!value) return { isValid: true }; // Optional field
            
            const date = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            
            if (date > today) {
                return { 
                    isValid: false, 
                    message: 'Bewerbungsdatum darf nicht in der Zukunft liegen' 
                };
            }
            
            // Warn if date is more than 2 years ago
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(today.getFullYear() - 2);
            
            if (date < twoYearsAgo) {
                return {
                    isValid: true,
                    message: 'Bewerbung ist sehr lange her',
                    severity: 'info'
                };
            }
            
            return { isValid: true };
        });

        this.registerValidator('salaryRange', (value) => {
            if (!value) return { isValid: true }; // Optional
            
            if (value < 20000) {
                return {
                    isValid: true,
                    message: 'Gehalt erscheint niedrig',
                    severity: 'warning'
                };
            }
            
            if (value > 200000) {
                return {
                    isValid: true,
                    message: 'Gehalt erscheint sehr hoch',
                    severity: 'info'
                };
            }
            
            return { isValid: true };
        });

        this.registerValidator('businessEmail', async (value) => {
            if (!value) return { isValid: true }; // Optional
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return { isValid: false, message: 'Ungültige E-Mail-Adresse' };
            }
            
            // Check for common free email providers
            const freeProviders = [
                'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
                'web.de', 'gmx.de', 't-online.de'
            ];
            
            const domain = value.split('@')[1];
            if (freeProviders.includes(domain.toLowerCase())) {
                return {
                    isValid: true,
                    message: 'Private E-Mail-Adresse erkannt',
                    severity: 'info'
                };
            }
            
            return { isValid: true };
        });

        this.registerValidator('jobUrl', (value) => {
            if (!value) return { isValid: true }; // Optional
            
            try {
                const url = new URL(value);
                
                // Check for known job platforms
                const jobPlatforms = [
                    'xing.com', 'linkedin.com', 'stepstone.de', 'indeed.de',
                    'jobs.ch', 'karriere.at', 'monster.de'
                ];
                
                const isJobPlatform = jobPlatforms.some(platform => 
                    url.hostname.includes(platform)
                );
                
                if (isJobPlatform) {
                    return { isValid: true };
                }
                
                return {
                    isValid: true,
                    message: 'URL geprüft',
                    severity: 'info'
                };
            } catch {
                return { isValid: false, message: 'Ungültige URL' };
            }
        });

        this.registerValidator('fileValidation', (file) => {
            if (!(file instanceof File)) {
                return { isValid: false, message: 'Keine gültige Datei' };
            }
            
            // Check file size
            if (file.size > 50 * 1024 * 1024) {
                return { isValid: false, message: 'Datei zu groß (max. 50MB)' };
            }
            
            // Check file type
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                return { 
                    isValid: false, 
                    message: 'Dateityp nicht erlaubt. Erlaubt: PDF, JPG, PNG, DOC, DOCX' 
                };
            }
            
            // Check filename
            if (file.name.length > 255) {
                return { isValid: false, message: 'Dateiname zu lang (max. 255 Zeichen)' };
            }
            
            return { isValid: true };
        });

        // Async validator for unique email check
        this.registerAsyncValidator('uniqueEmail', async (value) => {
            if (!value) return { isValid: true };
            
            try {
                // This would check against your API
                // const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`);
                // const result = await response.json();
                
                // For now, simulate the check
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return { isValid: true };
            } catch (error) {
                return { 
                    isValid: false, 
                    message: 'E-Mail-Prüfung fehlgeschlagen' 
                };
            }
        });
    }

    registerValidator(name, validatorFn) {
        this.validators.set(name, validatorFn);
    }

    registerAsyncValidator(name, asyncValidatorFn) {
        this.asyncValidators.set(name, asyncValidatorFn);
    }

    // 🔍 Validation Methods
    async validate(schemaName, data, options = {}) {
        const schema = this.schemas.get(schemaName);
        if (!schema) {
            throw new Error(`Schema '${schemaName}' not found`);
        }

        const results = {
            isValid: true,
            errors: {},
            warnings: {},
            infos: {},
            fieldResults: {}
        };

        // Validate each field
        for (const [fieldName, fieldSchema] of Object.entries(schema)) {
            const fieldValue = data[fieldName];
            const fieldResult = await this.validateField(fieldName, fieldValue, fieldSchema, data);
            
            results.fieldResults[fieldName] = fieldResult;
            
            if (!fieldResult.isValid) {
                results.isValid = false;
                results.errors[fieldName] = fieldResult.messages.filter(m => m.severity === 'error');
            }
            
            const warnings = fieldResult.messages.filter(m => m.severity === 'warning');
            if (warnings.length > 0) {
                results.warnings[fieldName] = warnings;
            }
            
            const infos = fieldResult.messages.filter(m => m.severity === 'info');
            if (infos.length > 0) {
                results.infos[fieldName] = infos;
            }
        }

        // Cache results
        this.validationResults.set(`${schemaName}:${JSON.stringify(data)}`, results);
        
        // Notify observers
        this.notifyObservers('validationCompleted', { schemaName, data, results });
        
        return results;
    }

    async validateField(fieldName, value, schema, fullData = {}) {
        const messages = [];
        let isValid = true;

        // Required validation
        if (schema.required && (value === undefined || value === null || value === '')) {
            messages.push({
                message: this.getMessage('required', fieldName),
                severity: 'error'
            });
            isValid = false;
        }

        // Skip further validation if value is empty and not required
        if (!schema.required && (value === undefined || value === null || value === '')) {
            return { isValid: true, messages: [] };
        }

        // Type validation
        if (schema.type) {
            const typeValidator = this.validators.get(schema.type);
            if (typeValidator && !typeValidator(value)) {
                messages.push({
                    message: this.getMessage('type', fieldName, schema.type),
                    severity: 'error'
                });
                isValid = false;
            }
        }

        // Length validation
        if (typeof value === 'string') {
            if (schema.minLength && value.length < schema.minLength) {
                messages.push({
                    message: this.getMessage('minLength', fieldName, schema.minLength),
                    severity: 'error'
                });
                isValid = false;
            }
            
            if (schema.maxLength && value.length > schema.maxLength) {
                messages.push({
                    message: this.getMessage('maxLength', fieldName, schema.maxLength),
                    severity: 'error'
                });
                isValid = false;
            }
        }

        // Numeric validation
        if (typeof value === 'number') {
            if (schema.min !== undefined && value < schema.min) {
                messages.push({
                    message: this.getMessage('min', fieldName, schema.min),
                    severity: 'error'
                });
                isValid = false;
            }
            
            if (schema.max !== undefined && value > schema.max) {
                messages.push({
                    message: this.getMessage('max', fieldName, schema.max),
                    severity: 'error'
                });
                isValid = false;
            }
        }

        // Pattern validation
        if (schema.pattern && typeof value === 'string') {
            if (!schema.pattern.test(value)) {
                messages.push({
                    message: this.getMessage('pattern', fieldName),
                    severity: 'error'
                });
                isValid = false;
            }
        }

        // Enum validation
        if (schema.enum && !schema.enum.includes(value)) {
            messages.push({
                message: this.getMessage('enum', fieldName, schema.enum),
                severity: 'error'
            });
            isValid = false;
        }

        // Date validation
        if (schema.type === 'date') {
            const dateValue = new Date(value);
            
            if (schema.minDate) {
                let minDate;
                if (schema.minDate === 'today') {
                    minDate = new Date();
                    minDate.setHours(0, 0, 0, 0);
                } else if (typeof schema.minDate === 'string' && fullData[schema.minDate]) {
                    minDate = new Date(fullData[schema.minDate]);
                } else {
                    minDate = new Date(schema.minDate);
                }
                
                if (dateValue < minDate) {
                    messages.push({
                        message: this.getMessage('minDate', fieldName),
                        severity: 'error'
                    });
                    isValid = false;
                }
            }
            
            if (schema.maxDate) {
                let maxDate;
                if (schema.maxDate === 'today') {
                    maxDate = new Date();
                    maxDate.setHours(23, 59, 59, 999);
                } else {
                    maxDate = new Date(schema.maxDate);
                }
                
                if (dateValue > maxDate) {
                    messages.push({
                        message: this.getMessage('maxDate', fieldName),
                        severity: 'error'
                    });
                    isValid = false;
                }
            }
        }

        // File validation
        if (schema.type === 'file' && value instanceof File) {
            if (schema.maxSize && value.size > schema.maxSize) {
                messages.push({
                    message: this.getMessage('fileSize', fieldName, this.formatFileSize(schema.maxSize)),
                    severity: 'error'
                });
                isValid = false;
            }
            
            if (schema.allowedTypes && !schema.allowedTypes.includes(value.type)) {
                messages.push({
                    message: this.getMessage('fileType', fieldName, schema.allowedTypes),
                    severity: 'error'
                });
                isValid = false;
            }
        }

        // Custom validation
        if (schema.customValidator) {
            const customValidator = this.validators.get(schema.customValidator);
            if (customValidator) {
                try {
                    const result = await customValidator(value, fullData);
                    if (typeof result === 'object') {
                        if (!result.isValid) {
                            isValid = false;
                        }
                        messages.push({
                            message: result.message,
                            severity: result.severity || 'error'
                        });
                    } else if (!result) {
                        isValid = false;
                        messages.push({
                            message: this.getMessage('custom', fieldName),
                            severity: 'error'
                        });
                    }
                } catch (error) {
                    console.error(`Custom validator '${schema.customValidator}' failed:`, error);
                }
            }
        }

        // Async validation
        if (this.config.enableAsyncValidation && schema.customValidator) {
            const asyncValidator = this.asyncValidators.get(schema.customValidator);
            if (asyncValidator) {
                try {
                    const result = await asyncValidator(value, fullData);
                    if (!result.isValid) {
                        isValid = false;
                    }
                    messages.push({
                        message: result.message,
                        severity: result.severity || 'error'
                    });
                } catch (error) {
                    console.error(`Async validator '${schema.customValidator}' failed:`, error);
                }
            }
        }

        return { isValid, messages };
    }

    // 🌐 Internationalization
    getMessage(type, fieldName, ...params) {
        const messages = {
            de: {
                required: `${this.getFieldDisplayName(fieldName)} ist erforderlich`,
                type: `${this.getFieldDisplayName(fieldName)} muss vom Typ ${params[0]} sein`,
                minLength: `${this.getFieldDisplayName(fieldName)} muss mindestens ${params[0]} Zeichen haben`,
                maxLength: `${this.getFieldDisplayName(fieldName)} darf maximal ${params[0]} Zeichen haben`,
                min: `${this.getFieldDisplayName(fieldName)} muss mindestens ${params[0]} sein`,
                max: `${this.getFieldDisplayName(fieldName)} darf maximal ${params[0]} sein`,
                pattern: `${this.getFieldDisplayName(fieldName)} hat ein ungültiges Format`,
                enum: `${this.getFieldDisplayName(fieldName)} muss einer der folgenden Werte sein: ${params[0].join(', ')}`,
                minDate: `${this.getFieldDisplayName(fieldName)} darf nicht vor dem Mindestdatum liegen`,
                maxDate: `${this.getFieldDisplayName(fieldName)} darf nicht nach dem Maximaldatum liegen`,
                fileSize: `${this.getFieldDisplayName(fieldName)} darf maximal ${params[0]} groß sein`,
                fileType: `${this.getFieldDisplayName(fieldName)} muss einen der folgenden Dateitypen haben: ${params[0].join(', ')}`,
                custom: `${this.getFieldDisplayName(fieldName)} ist ungültig`
            },
            en: {
                required: `${this.getFieldDisplayName(fieldName)} is required`,
                type: `${this.getFieldDisplayName(fieldName)} must be of type ${params[0]}`,
                minLength: `${this.getFieldDisplayName(fieldName)} must be at least ${params[0]} characters`,
                maxLength: `${this.getFieldDisplayName(fieldName)} must be at most ${params[0]} characters`,
                min: `${this.getFieldDisplayName(fieldName)} must be at least ${params[0]}`,
                max: `${this.getFieldDisplayName(fieldName)} must be at most ${params[0]}`,
                pattern: `${this.getFieldDisplayName(fieldName)} has an invalid format`,
                enum: `${this.getFieldDisplayName(fieldName)} must be one of: ${params[0].join(', ')}`,
                minDate: `${this.getFieldDisplayName(fieldName)} cannot be before the minimum date`,
                maxDate: `${this.getFieldDisplayName(fieldName)} cannot be after the maximum date`,
                fileSize: `${this.getFieldDisplayName(fieldName)} cannot be larger than ${params[0]}`,
                fileType: `${this.getFieldDisplayName(fieldName)} must be one of these file types: ${params[0].join(', ')}`,
                custom: `${this.getFieldDisplayName(fieldName)} is invalid`
            }
        };

        return messages[this.config.language]?.[type] || messages.en[type];
    }

    getFieldDisplayName(fieldName) {
        const displayNames = {
            de: {
                company: 'Unternehmen',
                position: 'Position',
                status: 'Status',
                appliedDate: 'Bewerbungsdatum',
                responseDate: 'Antwortdatum',
                salary: 'Gehalt',
                location: 'Standort',
                jobUrl: 'Job-URL',
                contactEmail: 'Kontakt-E-Mail',
                contactPhone: 'Kontakt-Telefon',
                notes: 'Notizen',
                firstName: 'Vorname',
                lastName: 'Nachname',
                email: 'E-Mail',
                phone: 'Telefon'
            },
            en: {
                company: 'Company',
                position: 'Position',
                status: 'Status',
                appliedDate: 'Application Date',
                responseDate: 'Response Date',
                salary: 'Salary',
                location: 'Location',
                jobUrl: 'Job URL',
                contactEmail: 'Contact Email',
                contactPhone: 'Contact Phone',
                notes: 'Notes',
                firstName: 'First Name',
                lastName: 'Last Name',
                email: 'Email',
                phone: 'Phone'
            }
        };

        return displayNames[this.config.language]?.[fieldName] || 
               displayNames.en[fieldName] || 
               fieldName;
    }

    // 🛠️ Utility Methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 🔔 Observer Pattern
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Observer callback error:', error);
            }
        });
    }

    // 🧹 Cleanup
    destroy() {
        this.validators.clear();
        this.schemas.clear();
        this.asyncValidators.clear();
        this.validationResults.clear();
        this.observers.clear();
    }
}

// 🏭 Factory function
export function createValidationEngine(options) {
    return new ValidationEngine(options);
}

// 📋 Validation Result Types
export const VALIDATION_SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const VALIDATION_TYPES = {
    REQUIRED: 'required',
    TYPE: 'type',
    LENGTH: 'length',
    PATTERN: 'pattern',
    CUSTOM: 'custom'
};
