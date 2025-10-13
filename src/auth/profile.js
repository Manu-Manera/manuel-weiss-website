/**
 * User Profile Management
 * Profil laden, speichern und verwalten
 */

import { authManager } from './auth.js';

/**
 * Profile Manager Class
 */
export class ProfileManager {
  constructor() {
    this.currentProfile = null;
    this.profileCache = new Map();
  }

  /**
   * Profil vom Server laden mit erweiterten Features
   */
  async loadProfile(userId) {
    try {
      // Cache prüfen
      if (this.profileCache.has(userId)) {
        const cached = this.profileCache.get(userId);
        // Cache-Validität prüfen (5 Minuten)
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
          return {
            success: true,
            profile: cached.data,
            fromCache: true
          };
        }
      }

      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const profile = await response.json();
      
      // Cache speichern mit Timestamp
      this.profileCache.set(userId, {
        data: profile,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        profile: profile,
        fromCache: false
      };
    } catch (error) {
      console.error('Profil-Ladefehler:', error);
      
      // Fallback auf Cache
      if (this.profileCache.has(userId)) {
        const cached = this.profileCache.get(userId);
        return {
          success: true,
          profile: cached.data,
          fromCache: true,
          warning: 'Daten aus Cache (offline)'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Profil konnte nicht geladen werden'
      };
    }
  }

  /**
   * Request ID generieren
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Profil mit Optimistic Updates speichern
   */
  async saveProfileOptimistic(profileData) {
    try {
      const user = authManager.currentUser;
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      // Optimistic Update - sofort im Cache
      const optimisticProfile = {
        ...this.getCurrentProfile(),
        ...profileData,
        updatedAt: new Date().toISOString(),
        version: (this.getCurrentProfile()?.version || 0) + 1
      };

      this.profileCache.set(user.id, {
        data: optimisticProfile,
        timestamp: Date.now()
      });

      // Server-Update im Hintergrund
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId()
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        // Rollback bei Fehler
        this.rollbackProfile(user.id);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      
      // Cache mit Server-Daten aktualisieren
      this.profileCache.set(user.id, {
        data: updatedProfile,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        profile: updatedProfile,
        message: 'Profil erfolgreich gespeichert'
      };
    } catch (error) {
      console.error('Profil-Speicherfehler:', error);
      return {
        success: false,
        error: error.message || 'Profil konnte nicht gespeichert werden'
      };
    }
  }

  /**
   * Profil-Rollback bei Fehler
   */
  rollbackProfile(userId) {
    // Hier würde der Rollback-Mechanismus implementiert werden
    console.log('Rolling back profile for user:', userId);
  }

  /**
   * Profil-Validierung mit erweiterten Regeln
   */
  validateProfileAdvanced(profileData) {
    const errors = [];
    const warnings = [];
    
    // Basis-Validierung
    const basicValidation = this.validateProfile(profileData);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }
    
    // Erweiterte Validierung
    if (profileData.email) {
      // E-Mail-Domain-Validierung
      const allowedDomains = ['gmail.com', 'outlook.com', 'company.com'];
      const domain = profileData.email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        warnings.push('E-Mail-Domain nicht in der Whitelist');
      }
    }
    
    // Telefonnummer-Format prüfen
    if (profileData.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(profileData.phone.replace(/\s/g, ''))) {
        errors.push('Telefonnummer hat ungültiges Format');
      }
    }
    
    // Passwort-Stärke prüfen
    if (profileData.password) {
      const passwordStrength = this.checkPasswordStrength(profileData.password);
      if (passwordStrength.score < 3) {
        warnings.push('Passwort ist schwach. Verwenden Sie mindestens 8 Zeichen mit Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen.');
      }
    }
    
    // Profil-Vollständigkeit prüfen
    const completeness = this.checkProfileCompleteness(profileData);
    if (completeness < 0.8) {
      warnings.push(`Profil ist nur zu ${Math.round(completeness * 100)}% vollständig`);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      completeness: completeness
    };
  }

  /**
   * Passwort-Stärke prüfen
   */
  checkPasswordStrength(password) {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    Object.values(checks).forEach(check => {
      if (check) score++;
    });
    
    return {
      score: score,
      maxScore: 5,
      checks: checks
    };
  }

  /**
   * Profil-Vollständigkeit prüfen
   */
  checkProfileCompleteness(profileData) {
    const requiredFields = ['name', 'email'];
    const optionalFields = ['phone', 'address', 'company', 'position', 'bio'];
    
    let completedFields = 0;
    let totalFields = requiredFields.length + optionalFields.length;
    
    requiredFields.forEach(field => {
      if (profileData[field] && profileData[field].trim()) {
        completedFields++;
      }
    });
    
    optionalFields.forEach(field => {
      if (profileData[field] && profileData[field].trim()) {
        completedFields++;
      }
    });
    
    return completedFields / totalFields;
  }

  /**
   * Profil speichern
   */
  async saveProfile(profileData) {
    try {
      const user = authManager.currentUser;
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      
      // Cache aktualisieren
      this.profileCache.set(user.id, updatedProfile);
      
      return {
        success: true,
        profile: updatedProfile,
        message: 'Profil erfolgreich gespeichert'
      };
    } catch (error) {
      console.error('Profil-Speicherfehler:', error);
      return {
        success: false,
        error: error.message || 'Profil konnte nicht gespeichert werden'
      };
    }
  }

  /**
   * Profil-Avatar hochladen
   */
  async uploadAvatar(file) {
    try {
      const user = authManager.currentUser;
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      // Presigned URL für Avatar-Upload
      const presignResponse = await fetch('/api/media/presign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          type: file.type,
          size: file.size,
          purpose: 'avatar'
        })
      });

      if (!presignResponse.ok) {
        throw new Error('Presigned URL konnte nicht erstellt werden');
      }

      const { url, fields } = await presignResponse.json();

      // Datei direkt zu S3 hochladen
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Avatar-Upload fehlgeschlagen');
      }

      // Avatar-URL in Profil speichern
      const avatarUrl = `${process.env.CLOUDFRONT_URL}/media/${fields.key}`;
      
      return await this.saveProfile({
        avatar: avatarUrl
      });
    } catch (error) {
      console.error('Avatar-Upload-Fehler:', error);
      return {
        success: false,
        error: error.message || 'Avatar konnte nicht hochgeladen werden'
      };
    }
  }

  /**
   * Profil-Einstellungen aktualisieren
   */
  async updateSettings(settings) {
    try {
      const user = authManager.currentUser;
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const response = await fetch(`/api/users/${user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedSettings = await response.json();
      
      return {
        success: true,
        settings: updatedSettings,
        message: 'Einstellungen erfolgreich aktualisiert'
      };
    } catch (error) {
      console.error('Einstellungs-Update-Fehler:', error);
      return {
        success: false,
        error: error.message || 'Einstellungen konnten nicht aktualisiert werden'
      };
    }
  }

  /**
   * Benutzer löschen (nur für Admins)
   */
  async deleteUser(userId) {
    try {
      const user = authManager.currentUser;
      if (!user || !authManager.hasPermission(user, 'admin')) {
        throw new Error('Keine Berechtigung zum Löschen von Benutzern');
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Cache entfernen
      this.profileCache.delete(userId);
      
      return {
        success: true,
        message: 'Benutzer erfolgreich gelöscht'
      };
    } catch (error) {
      console.error('Benutzer-Löschfehler:', error);
      return {
        success: false,
        error: error.message || 'Benutzer konnte nicht gelöscht werden'
      };
    }
  }

  /**
   * Auth Token abrufen
   */
  async getAuthToken() {
    try {
      const user = await authManager.getCurrentUser();
      if (!user) return null;
      
      // Hier würde normalerweise der JWT Token abgerufen werden
      // Für Demo-Zwecke verwenden wir einen Platzhalter
      return 'demo-jwt-token';
    } catch (error) {
      console.error('Token-Abruf-Fehler:', error);
      return null;
    }
  }

  /**
   * Profil-Cache leeren
   */
  clearCache() {
    this.profileCache.clear();
  }

  /**
   * Aktuelles Profil abrufen
   */
  getCurrentProfile() {
    return this.currentProfile;
  }

  /**
   * Profil-Validierung
   */
  validateProfile(profileData) {
    const errors = [];
    
    if (!profileData.name || profileData.name.trim().length < 2) {
      errors.push('Name muss mindestens 2 Zeichen lang sein');
    }
    
    if (!profileData.email || !this.isValidEmail(profileData.email)) {
      errors.push('Gültige E-Mail-Adresse erforderlich');
    }
    
    if (profileData.phone && !this.isValidPhone(profileData.phone)) {
      errors.push('Gültige Telefonnummer erforderlich');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * E-Mail-Validierung
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Telefon-Validierung
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}

// Singleton Instance
export const profileManager = new ProfileManager();
