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
   * Route Guard Middleware
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
        message: 'Bitte melden Sie sich an'
      };
    }

    // Admin-Route prüfen
    if (this.isAdminRoute(path)) {
      if (!this.hasPermission(user, 'admin')) {
        return {
          allowed: false,
          redirect: '/index.html',
          message: 'Keine Berechtigung für Admin-Bereich'
        };
      }
    }

    return { allowed: true };
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
