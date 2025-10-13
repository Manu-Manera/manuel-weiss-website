/**
 * Job Status Tracking für Bewerbungs-Workflows
 * Polling, SSE und Status-Updates
 */

import { applicationsAPI } from './api.js';

/**
 * Job Status Manager Class
 */
export class JobStatusManager {
  constructor() {
    this.activeJobs = new Map();
    this.pollingIntervals = new Map();
    this.eventSource = null;
    this.listeners = [];
    this.maxPollingTime = 30 * 60 * 1000; // 30 Minuten
    this.pollingInterval = 2000; // 2 Sekunden
  }

  /**
   * Job-Status abrufen
   */
  async getJobStatus(jobId) {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jobStatus = await response.json();
      
      return {
        success: true,
        job: jobStatus
      };
    } catch (error) {
      console.error('Job-Status-Fehler:', error);
      return {
        success: false,
        error: error.message || 'Job-Status konnte nicht abgerufen werden'
      };
    }
  }

  /**
   * Job-Status Polling starten
   */
  startPolling(jobId, applicationId) {
    if (this.pollingIntervals.has(jobId)) {
      console.warn('Polling bereits aktiv für Job:', jobId);
      return;
    }

    const startTime = Date.now();
    const jobData = {
      id: jobId,
      applicationId: applicationId,
      status: 'PENDING',
      progress: 0,
      startTime: startTime,
      lastUpdate: new Date().toISOString()
    };

    this.activeJobs.set(jobId, jobData);

    const pollInterval = setInterval(async () => {
      try {
        const result = await this.getJobStatus(jobId);
        
        if (result.success) {
          const job = result.job;
          const updatedJob = {
            ...jobData,
            status: job.status,
            progress: job.progress || 0,
            lastUpdate: job.lastUpdate || new Date().toISOString(),
            error: job.error || null
          };

          this.activeJobs.set(jobId, updatedJob);
          this.notifyListeners(jobId, updatedJob);

          // Polling beenden bei finalen Status
          if (this.isFinalStatus(job.status)) {
            this.stopPolling(jobId);
            
            if (job.status === 'COMPLETED') {
              this.handleJobCompletion(jobId, applicationId);
            } else if (job.status === 'FAILED') {
              this.handleJobFailure(jobId, job.error);
            }
          }
        }

        // Timeout prüfen
        if (Date.now() - startTime > this.maxPollingTime) {
          console.warn('Job-Polling-Timeout erreicht:', jobId);
          this.stopPolling(jobId);
          this.handleJobTimeout(jobId);
        }
      } catch (error) {
        console.error('Polling-Fehler für Job:', jobId, error);
        this.handleJobError(jobId, error);
      }
    }, this.pollingInterval);

    this.pollingIntervals.set(jobId, pollInterval);
    console.log('Job-Polling gestartet:', jobId);
  }

  /**
   * Job-Status Polling stoppen
   */
  stopPolling(jobId) {
    const interval = this.pollingIntervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(jobId);
      console.log('Job-Polling gestoppt:', jobId);
    }
  }

  /**
   * Alle Polling-Intervalle stoppen
   */
  stopAllPolling() {
    this.pollingIntervals.forEach((interval, jobId) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
    console.log('Alle Job-Polling gestoppt');
  }

  /**
   * Server-Sent Events für Live-Updates
   */
  startSSE() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource('/api/jobs/events');
    
    this.eventSource.onopen = () => {
      console.log('SSE-Verbindung geöffnet');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleSSEMessage(data);
      } catch (error) {
        console.error('SSE-Message-Parse-Fehler:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE-Verbindungsfehler:', error);
      // Reconnect nach 5 Sekunden
      setTimeout(() => {
        this.startSSE();
      }, 5000);
    };
  }

  /**
   * SSE-Verbindung schließen
   */
  stopSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE-Verbindung geschlossen');
    }
  }

  /**
   * SSE-Message behandeln
   */
  handleSSEMessage(data) {
    const { jobId, status, progress, error } = data;
    
    if (this.activeJobs.has(jobId)) {
      const job = this.activeJobs.get(jobId);
      const updatedJob = {
        ...job,
        status,
        progress: progress || job.progress,
        lastUpdate: new Date().toISOString(),
        error: error || null
      };

      this.activeJobs.set(jobId, updatedJob);
      this.notifyListeners(jobId, updatedJob);

      if (this.isFinalStatus(status)) {
        this.stopPolling(jobId);
      }
    }
  }

  /**
   * Job-Status Listener hinzufügen
   */
  addJobListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Job-Status Listener entfernen
   */
  removeJobListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Alle Listener benachrichtigen
   */
  notifyListeners(jobId, jobData) {
    this.listeners.forEach(callback => {
      try {
        callback(jobId, jobData);
      } catch (error) {
        console.error('Job-Listener-Fehler:', error);
      }
    });
  }

  /**
   * Job-Completion behandeln
   */
  async handleJobCompletion(jobId, applicationId) {
    console.log('Job abgeschlossen:', jobId);
    
    try {
      // Bewerbung als abgeschlossen markieren
      await applicationsAPI.updateApplication(applicationId, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      });

      this.showJobNotification('Bewerbung erfolgreich erstellt!', 'success');
    } catch (error) {
      console.error('Job-Completion-Fehler:', error);
      this.showJobNotification('Bewerbung erstellt, aber Status-Update fehlgeschlagen', 'warning');
    }
  }

  /**
   * Job-Failure behandeln
   */
  handleJobFailure(jobId, error) {
    console.error('Job fehlgeschlagen:', jobId, error);
    this.showJobNotification(`Workflow fehlgeschlagen: ${error}`, 'error');
  }

  /**
   * Job-Timeout behandeln
   */
  handleJobTimeout(jobId) {
    console.warn('Job-Timeout:', jobId);
    this.showJobNotification('Workflow-Timeout erreicht. Bitte versuchen Sie es erneut.', 'warning');
  }

  /**
   * Job-Error behandeln
   */
  handleJobError(jobId, error) {
    console.error('Job-Error:', jobId, error);
    this.showJobNotification(`Fehler beim Workflow: ${error.message}`, 'error');
  }

  /**
   * Finale Status prüfen
   */
  isFinalStatus(status) {
    return ['COMPLETED', 'FAILED', 'CANCELLED'].includes(status);
  }

  /**
   * Job-Status-UI rendern
   */
  renderJobStatus(jobId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const job = this.activeJobs.get(jobId);
    if (!job) {
      container.innerHTML = '<p>Job-Status nicht verfügbar</p>';
      return;
    }

    const statusIcon = this.getStatusIcon(job.status);
    const statusText = this.getStatusText(job.status);
    const progressBar = this.renderProgressBar(job.progress);

    container.innerHTML = `
      <div class="job-status-card">
        <div class="job-status-header">
          <div class="job-status-icon">${statusIcon}</div>
          <div class="job-status-info">
            <h4>Workflow Status</h4>
            <p class="job-status-text">${statusText}</p>
          </div>
        </div>
        <div class="job-progress">
          ${progressBar}
        </div>
        <div class="job-details">
          <p class="job-last-update">Zuletzt aktualisiert: ${new Date(job.lastUpdate).toLocaleString('de-DE')}</p>
          ${job.error ? `<p class="job-error">Fehler: ${job.error}</p>` : ''}
        </div>
        <div class="job-actions">
          ${this.renderJobActions(jobId, job.status)}
        </div>
      </div>
    `;
  }

  /**
   * Progress Bar rendern
   */
  renderProgressBar(progress) {
    return `
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">${progress}%</span>
      </div>
    `;
  }

  /**
   * Job-Actions rendern
   */
  renderJobActions(jobId, status) {
    if (status === 'FAILED') {
      return `
        <button class="btn-retry" onclick="jobStatusManager.retryJob('${jobId}')">
          <i class="fas fa-redo"></i> Erneut versuchen
        </button>
      `;
    } else if (status === 'COMPLETED') {
      return `
        <button class="btn-view" onclick="jobStatusManager.viewResult('${jobId}')">
          <i class="fas fa-eye"></i> Ergebnis anzeigen
        </button>
      `;
    } else {
      return `
        <button class="btn-cancel" onclick="jobStatusManager.cancelJob('${jobId}')">
          <i class="fas fa-times"></i> Abbrechen
        </button>
      `;
    }
  }

  /**
   * Status-Icon abrufen
   */
  getStatusIcon(status) {
    const icons = {
      'PENDING': '<i class="fas fa-clock"></i>',
      'RUNNING': '<i class="fas fa-spinner fa-spin"></i>',
      'COMPLETED': '<i class="fas fa-check-circle"></i>',
      'FAILED': '<i class="fas fa-exclamation-circle"></i>',
      'CANCELLED': '<i class="fas fa-ban"></i>'
    };
    return icons[status] || '<i class="fas fa-question-circle"></i>';
  }

  /**
   * Status-Text abrufen
   */
  getStatusText(status) {
    const texts = {
      'PENDING': 'Wartet auf Verarbeitung...',
      'RUNNING': 'Wird verarbeitet...',
      'COMPLETED': 'Erfolgreich abgeschlossen',
      'FAILED': 'Fehlgeschlagen',
      'CANCELLED': 'Abgebrochen'
    };
    return texts[status] || 'Unbekannter Status';
  }

  /**
   * Job erneut versuchen
   */
  async retryJob(jobId) {
    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.showJobNotification('Job wird erneut versucht...', 'info');
    } catch (error) {
      console.error('Job-Retry-Fehler:', error);
      this.showJobNotification('Job-Retry fehlgeschlagen', 'error');
    }
  }

  /**
   * Job abbrechen
   */
  async cancelJob(jobId) {
    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.stopPolling(jobId);
      this.showJobNotification('Job abgebrochen', 'info');
    } catch (error) {
      console.error('Job-Cancel-Fehler:', error);
      this.showJobNotification('Job-Abbruch fehlgeschlagen', 'error');
    }
  }

  /**
   * Ergebnis anzeigen
   */
  viewResult(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job && job.applicationId) {
      window.location.href = `/applications/${job.applicationId}`;
    }
  }

  /**
   * Job-Notification anzeigen
   */
  showJobNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `job-notification job-notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Notification-Farbe abrufen
   */
  getNotificationColor(type) {
    const colors = {
      'success': '#10b981',
      'error': '#ef4444',
      'warning': '#f59e0b',
      'info': '#3b82f6'
    };
    return colors[type] || colors.info;
  }

  /**
   * Auth Token abrufen
   */
  async getAuthToken() {
    // Hier würde der echte JWT Token abgerufen werden
    return 'demo-jwt-token';
  }

  /**
   * Cleanup beim Beenden
   */
  destroy() {
    this.stopAllPolling();
    this.stopSSE();
    this.activeJobs.clear();
    this.listeners = [];
  }
}

// Singleton Instance
export const jobStatusManager = new JobStatusManager();
