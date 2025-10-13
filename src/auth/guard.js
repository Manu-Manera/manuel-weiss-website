/**
 * Authentication Guard für geschützte Routen
 * Prüft Berechtigungen und leitet um
 */

import { authManager } from './auth.js';

/**
 * Route Guard Class
 */
export class RouteGuard {
  constructor() {
    this.protectedRoutes = [
      '/admin',
      '/admin.html',
      '/user-profile',
      '/user-management',
      '/bewerbungsmanager',
      '/applications'
    ];
    
    this.adminRoutes = [
      '/admin',
      '/admin.html',
      '/user-management',
      '/users'
    ];
  }

  /**
   * Prüft ob Route geschützt ist
   */
  isProtectedRoute(path) {
    return this.protectedRoutes.some(route => 
      path.startsWith(route) || path.includes(route)
    );
  }

  /**
   * Prüft ob Route Admin-Berechtigung benötigt
   */
  isAdminRoute(path) {
    return this.adminRoutes.some(route => 
      path.startsWith(route) || path.includes(route)
    );
  }

  /**
   * Prüft Benutzer-Berechtigung
   */
  hasPermission(user, requiredRole = 'user') {
    if (!user) return false;
    
    const userRole = user.role || 'user';
    const roleHierarchy = {
      'user': 1,
      'admin': 2,
      'superadmin': 3
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Route Guard Middleware mit erweiterten Checks
   */
  async checkAccess(path, user) {
    // Öffentliche Routen
    if (!this.isProtectedRoute(path)) {
      return { allowed: true };
    }

    // Nicht angemeldet
    if (!user || !authManager.isAuthenticated) {
      return {
        allowed: false,
        redirect: '/login.html',
        message: 'Bitte melden Sie sich an',
        code: 'AUTH_REQUIRED'
      };
    }

    // Session-Timeout prüfen
    if (this.isSessionExpired(user)) {
      return {
        allowed: false,
        redirect: '/login.html',
        message: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
        code: 'SESSION_EXPIRED'
      };
    }

    // Admin-Route prüfen
    if (this.isAdminRoute(path)) {
      if (!this.hasPermission(user, 'admin')) {
        return {
          allowed: false,
          redirect: '/index.html',
          message: 'Keine Berechtigung für Admin-Bereich',
          code: 'INSUFFICIENT_PERMISSIONS'
        };
      }
    }

    // Spezielle Berechtigungen prüfen
    const specialPermission = this.getSpecialPermission(path);
    if (specialPermission && !this.hasSpecialPermission(user, specialPermission)) {
      return {
        allowed: false,
        redirect: '/index.html',
        message: `Keine Berechtigung für ${specialPermission}`,
        code: 'SPECIAL_PERMISSION_REQUIRED'
      };
    }

    // Rate Limiting prüfen
    if (this.isRateLimited(user, path)) {
      return {
        allowed: false,
        redirect: '/rate-limit.html',
        message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
        code: 'RATE_LIMITED'
      };
    }

    // IP-Whitelist prüfen (für Admin)
    if (this.isAdminRoute(path) && !this.isIPWhitelisted(user)) {
      return {
        allowed: false,
        redirect: '/index.html',
        message: 'Zugriff von dieser IP nicht erlaubt',
        code: 'IP_NOT_WHITELISTED'
      };
    }

    return { allowed: true };
  }

  /**
   * Session-Timeout prüfen
   */
  isSessionExpired(user) {
    if (!user.lastActivity) return false;
    const sessionTimeout = 30 * 60 * 1000; // 30 Minuten
    return Date.now() - user.lastActivity > sessionTimeout;
  }

  /**
   * Spezielle Berechtigung für Route abrufen
   */
  getSpecialPermission(path) {
    const specialRoutes = {
      '/admin/user-management': 'USER_MANAGEMENT',
      '/admin/analytics': 'ANALYTICS_ACCESS',
      '/admin/media': 'MEDIA_MANAGEMENT',
      '/admin/settings': 'SYSTEM_SETTINGS'
    };
    return specialRoutes[path];
  }

  /**
   * Spezielle Berechtigung prüfen
   */
  hasSpecialPermission(user, permission) {
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission) || user.role === 'superadmin';
  }

  /**
   * Rate Limiting prüfen
   */
  isRateLimited(user, path) {
    const userRequests = this.getUserRequests(user.id);
    const now = Date.now();
    const window = 60 * 1000; // 1 Minute
    const maxRequests = 60; // 60 Requests pro Minute
    
    // Alte Requests entfernen
    this.cleanupOldRequests(user.id, now - window);
    
    // Aktuelle Requests zählen
    const recentRequests = this.getUserRequests(user.id).filter(
      req => req.timestamp > now - window
    );
    
    return recentRequests.length >= maxRequests;
  }

  /**
   * IP-Whitelist prüfen
   */
  isIPWhitelisted(user) {
    const whitelistedIPs = [
      '127.0.0.1',
      '::1',
      // Weitere vertrauenswürdige IPs hier hinzufügen
    ];
    
    return whitelistedIPs.includes(user.ipAddress) || user.role === 'superadmin';
  }

  /**
   * Benutzer-Requests abrufen
   */
  getUserRequests(userId) {
    if (!this.userRequests) {
      this.userRequests = new Map();
    }
    return this.userRequests.get(userId) || [];
  }

  /**
   * Request für Benutzer hinzufügen
   */
  addUserRequest(userId, path) {
    if (!this.userRequests) {
      this.userRequests = new Map();
    }
    
    const requests = this.getUserRequests(userId);
    requests.push({
      path,
      timestamp: Date.now()
    });
    
    this.userRequests.set(userId, requests);
  }

  /**
   * Alte Requests bereinigen
   */
  cleanupOldRequests(userId, cutoffTime) {
    const requests = this.getUserRequests(userId);
    const filteredRequests = requests.filter(req => req.timestamp > cutoffTime);
    this.userRequests.set(userId, filteredRequests);
  }

  /**
   * Automatische Route-Überwachung
   */
  startRouteWatching() {
    // Hash Change Events
    window.addEventListener('hashchange', () => {
      this.handleRouteChange(window.location.pathname + window.location.hash);
    });

    // Popstate Events
    window.addEventListener('popstate', () => {
      this.handleRouteChange(window.location.pathname);
    });

    // Initial Check
    this.handleRouteChange(window.location.pathname);
  }

  /**
   * Route-Änderung behandeln
   */
  async handleRouteChange(path) {
    const user = authManager.currentUser;
    const access = await this.checkAccess(path, user);
    
    if (!access.allowed) {
      console.warn('Zugriff verweigert:', access.message);
      
      // Redirect
      if (access.redirect) {
        window.location.href = access.redirect;
        return;
      }
      
      // Oder Modal anzeigen
      this.showAccessDeniedModal(access.message);
    }
  }

  /**
   * Access Denied Modal
   */
  showAccessDeniedModal(message) {
    const modal = document.createElement('div');
    modal.className = 'access-denied-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Zugriff verweigert</h3>
        <p>${message}</p>
        <button onclick="this.closest('.access-denied-modal').remove()">OK</button>
      </div>
    `;
    
    // Styles hinzufügen
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    document.body.appendChild(modal);
  }
}

/**
 * Login Required Decorator
 */
export function requireAuth(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args) {
    if (!authManager.isAuthenticated) {
      window.location.href = '/login.html';
      return;
    }
    
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

/**
 * Admin Required Decorator
 */
export function requireAdmin(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args) {
    const user = authManager.currentUser;
    
    if (!user || !authManager.hasPermission(user, 'admin')) {
      window.location.href = '/index.html';
      return;
    }
    
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

// Singleton Instance
export const routeGuard = new RouteGuard();

// Auto-Start Route Watching
routeGuard.startRouteWatching();
