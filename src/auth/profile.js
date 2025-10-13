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
   * Profil vom Server laden
   */
  async loadProfile(userId) {
    try {
      // Cache prüfen
      if (this.profileCache.has(userId)) {
        return this.profileCache.get(userId);
      }

      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const profile = await response.json();
      
      // Cache speichern
      this.profileCache.set(userId, profile);
      
      return {
        success: true,
        profile: profile
      };
    } catch (error) {
      console.error('Profil-Ladefehler:', error);
      return {
        success: false,
        error: error.message || 'Profil konnte nicht geladen werden'
      };
    }
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
