/**
 * Applications API Client
 * Vollständige CRUD-Operationen für Bewerbungen
 */

import { authManager } from '../auth/auth.js';

/**
 * Applications API Class
 */
export class ApplicationsAPI {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api-gateway.execute-api.eu-central-1.amazonaws.com/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 Minuten
  }

  /**
   * Neue Bewerbung erstellen
   */
  async createApplication(applicationData) {
    try {
      const user = authManager.currentUser;
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const response = await fetch(`${this.baseURL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...applicationData,
          userId: user.id,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const application = await response.json();
      
      // Cache aktualisieren
      this.cache.set(application.id, {
        data: application,
        timestamp: Date.now()
      });

      return {
        success: true,
        application: application,
        message: 'Bewerbung erfolgreich erstellt'
      };
    } catch (error) {
      console.error('Bewerbung-Erstellungsfehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbung konnte nicht erstellt werden'
      };
    }
  }

  /**
   * Bewerbung abrufen
   */
  async getApplication(applicationId) {
    try {
      // Cache prüfen
      const cached = this.cache.get(applicationId);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return {
          success: true,
          application: cached.data
        };
      }

      const response = await fetch(`${this.baseURL}/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const application = await response.json();
      
      // Cache aktualisieren
      this.cache.set(applicationId, {
        data: application,
        timestamp: Date.now()
      });

      return {
        success: true,
        application: application
      };
    } catch (error) {
      console.error('Bewerbung-Ladefehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbung konnte nicht geladen werden'
      };
    }
  }

  /**
   * Bewerbungen auflisten
   */
  async listApplications(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`${this.baseURL}/applications?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        applications: data.applications || [],
        pagination: data.pagination || {},
        total: data.total || 0
      };
    } catch (error) {
      console.error('Bewerbungen-Listenfehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbungen konnten nicht geladen werden'
      };
    }
  }

  /**
   * Bewerbung aktualisieren
   */
  async updateApplication(applicationId, updateData) {
    try {
      const user = authManager.currentUser;
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      // Optimistic Concurrency Control
      const currentApp = await this.getApplication(applicationId);
      if (!currentApp.success) {
        throw new Error('Aktuelle Bewerbung konnte nicht geladen werden');
      }

      const response = await fetch(`${this.baseURL}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updateData,
          updatedAt: new Date().toISOString(),
          version: currentApp.application.version + 1
        })
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Bewerbung wurde von einem anderen Benutzer geändert. Bitte laden Sie die Seite neu.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedApplication = await response.json();
      
      // Cache aktualisieren
      this.cache.set(applicationId, {
        data: updatedApplication,
        timestamp: Date.now()
      });

      return {
        success: true,
        application: updatedApplication,
        message: 'Bewerbung erfolgreich aktualisiert'
      };
    } catch (error) {
      console.error('Bewerbung-Updatefehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbung konnte nicht aktualisiert werden'
      };
    }
  }

  /**
   * Bewerbung einreichen (Workflow starten)
   */
  async submitApplication(applicationId) {
    try {
      const response = await fetch(`${this.baseURL}/applications/${applicationId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        jobId: result.jobId,
        message: 'Bewerbung erfolgreich eingereicht. Workflow gestartet.'
      };
    } catch (error) {
      console.error('Bewerbung-Einreichungsfehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbung konnte nicht eingereicht werden'
      };
    }
  }

  /**
   * Bewerbung löschen
   */
  async deleteApplication(applicationId) {
    try {
      const response = await fetch(`${this.baseURL}/applications/${applicationId}`, {
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
      this.cache.delete(applicationId);
      
      return {
        success: true,
        message: 'Bewerbung erfolgreich gelöscht'
      };
    } catch (error) {
      console.error('Bewerbung-Löschfehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbung konnte nicht gelöscht werden'
      };
    }
  }

  /**
   * Auto-Save für Entwürfe
   */
  async autoSave(applicationId, data) {
    try {
      // Debounced Auto-Save
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }

      this.autoSaveTimeout = setTimeout(async () => {
        const result = await this.updateApplication(applicationId, {
          ...data,
          status: 'DRAFT',
          autoSaved: true
        });

        if (result.success) {
          this.showAutoSaveIndicator('Entwurf gespeichert');
        } else {
          this.showAutoSaveIndicator('Speichern fehlgeschlagen', 'error');
        }
      }, 2000); // 2 Sekunden Debounce
    } catch (error) {
      console.error('Auto-Save-Fehler:', error);
    }
  }

  /**
   * Bewerbung duplizieren
   */
  async duplicateApplication(applicationId) {
    try {
      const originalApp = await this.getApplication(applicationId);
      if (!originalApp.success) {
        throw new Error('Originalbewerbung konnte nicht geladen werden');
      }

      const duplicateData = {
        ...originalApp.application,
        id: undefined,
        title: `${originalApp.application.title} (Kopie)`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      return await this.createApplication(duplicateData);
    } catch (error) {
      console.error('Bewerbung-Duplikationsfehler:', error);
      return {
        success: false,
        error: error.message || 'Bewerbung konnte nicht dupliziert werden'
      };
    }
  }

  /**
   * Bewerbung als Template speichern
   */
  async saveAsTemplate(applicationId, templateName) {
    try {
      const response = await fetch(`${this.baseURL}/applications/${applicationId}/template`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateName,
          isPublic: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const template = await response.json();
      
      return {
        success: true,
        template: template,
        message: 'Template erfolgreich erstellt'
      };
    } catch (error) {
      console.error('Template-Speicherfehler:', error);
      return {
        success: false,
        error: error.message || 'Template konnte nicht gespeichert werden'
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
      
      // Hier würde der echte JWT Token abgerufen werden
      return 'demo-jwt-token';
    } catch (error) {
      console.error('Token-Abruf-Fehler:', error);
      return null;
    }
  }

  /**
   * Cache leeren
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Auto-Save Indikator anzeigen
   */
  showAutoSaveIndicator(message, type = 'success') {
    const indicator = document.createElement('div');
    indicator.className = `auto-save-indicator auto-save-${type}`;
    indicator.textContent = message;
    
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    // Fade in
    setTimeout(() => {
      indicator.style.opacity = '1';
    }, 100);
    
    // Fade out und entfernen
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        indicator.remove();
      }, 300);
    }, 2000);
  }
}

// Singleton Instance
export const applicationsAPI = new ApplicationsAPI();
