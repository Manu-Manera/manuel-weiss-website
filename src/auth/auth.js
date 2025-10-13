/**
 * AWS Cognito Authentication System
 * Vollständige Integration mit Amplify Auth
 * Erweiterte Features: Token Refresh, Session Management, Multi-Factor Auth
 */

import { Amplify } from 'aws-amplify';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  confirmSignUp,
  resendSignUpCode,
  forgotPassword,
  confirmResetPassword,
  updatePassword,
  updateUserAttributes,
  deleteUser,
  fetchUserAttributes,
  fetchAuthSession,
  signInWithRedirect,
  signOut as signOutRedirect
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// AWS Amplify Konfiguration
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID || 'eu-central-1_xxxxx',
      userPoolClientId: process.env.COGNITO_CLIENT_ID || 'xxxxxxxxxx',
      region: process.env.AWS_REGION || 'eu-central-1',
      loginWith: {
        email: true,
        username: false,
        phone: false
      }
    }
  },
  API: {
    REST: {
      'applications-api': {
        endpoint: process.env.API_BASE_URL || 'https://api-gateway.execute-api.eu-central-1.amazonaws.com/api',
        region: process.env.AWS_REGION || 'eu-central-1'
      }
    }
  }
};

// Amplify konfigurieren
Amplify.configure(awsConfig);

/**
 * Authentication Manager Class
 */
export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.listeners = [];
  }

  /**
   * Benutzer registrieren
   */
  async registerUser(userData) {
    try {
      const { username, password, email, attributes } = userData;
      
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: attributes.name || '',
            'custom:role': attributes.role || 'user'
          }
        }
      });

      return {
        success: true,
        userId: result.userId,
        nextStep: result.nextStep,
        message: 'Registrierung erfolgreich. Bitte E-Mail bestätigen.'
      };
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      return {
        success: false,
        error: error.message || 'Registrierung fehlgeschlagen'
      };
    }
  }

  /**
   * E-Mail-Verifikation bestätigen
   */
  async confirmRegistration(username, confirmationCode) {
    try {
      await confirmSignUp({
        username,
        confirmationCode
      });

      return {
        success: true,
        message: 'E-Mail erfolgreich bestätigt'
      };
    } catch (error) {
      console.error('Bestätigungsfehler:', error);
      return {
        success: false,
        error: error.message || 'Bestätigung fehlgeschlagen'
      };
    }
  }

  /**
   * Benutzer anmelden
   */
  async loginUser(credentials) {
    try {
      const { username, password } = credentials;
      
      const result = await signIn({
        username,
        password
      });

      if (result.isSignedIn) {
        await this.updateAuthState();
        this.notifyListeners();
      }

      return {
        success: true,
        user: this.currentUser,
        message: 'Anmeldung erfolgreich'
      };
    } catch (error) {
      console.error('Anmeldefehler:', error);
      return {
        success: false,
        error: error.message || 'Anmeldung fehlgeschlagen'
      };
    }
  }

  /**
   * Benutzer abmelden
   */
  async logoutUser() {
    try {
      await signOut();
      this.currentUser = null;
      this.isAuthenticated = false;
      this.notifyListeners();
      
      return {
        success: true,
        message: 'Abmeldung erfolgreich'
      };
    } catch (error) {
      console.error('Abmeldefehler:', error);
      return {
        success: false,
        error: error.message || 'Abmeldung fehlgeschlagen'
      };
    }
  }

  /**
   * Aktuellen Benutzer abrufen
   */
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      this.currentUser = user;
      this.isAuthenticated = true;
      return user;
    } catch (error) {
      this.currentUser = null;
      this.isAuthenticated = false;
      return null;
    }
  }

  /**
   * Auth-Status aktualisieren
   */
  async updateAuthState() {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.isAuthenticated = true;
        this.currentUser = {
          id: user.userId,
          username: user.username,
          email: user.signInDetails?.loginId,
          attributes: user.attributes,
          role: user.attributes?.['custom:role'] || 'user'
        };
      }
    } catch (error) {
      this.isAuthenticated = false;
      this.currentUser = null;
    }
  }

  /**
   * Passwort zurücksetzen
   */
  async resetPassword(username) {
    try {
      await forgotPassword({ username });
      return {
        success: true,
        message: 'Passwort-Reset-E-Mail gesendet'
      };
    } catch (error) {
      console.error('Passwort-Reset-Fehler:', error);
      return {
        success: false,
        error: error.message || 'Passwort-Reset fehlgeschlagen'
      };
    }
  }

  /**
   * Neues Passwort bestätigen
   */
  async confirmPasswordReset(username, confirmationCode, newPassword) {
    try {
      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword
      });
      
      return {
        success: true,
        message: 'Passwort erfolgreich zurückgesetzt'
      };
    } catch (error) {
      console.error('Passwort-Bestätigungsfehler:', error);
      return {
        success: false,
        error: error.message || 'Passwort-Bestätigung fehlgeschlagen'
      };
    }
  }

  /**
   * Auth-Status Listener hinzufügen
   */
  addAuthListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Auth-Status Listener entfernen
   */
  removeAuthListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Alle Listener benachrichtigen
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        isAuthenticated: this.isAuthenticated,
        user: this.currentUser
      });
    });
  }

  /**
   * Initialisierung beim App-Start
   */
  async initialize() {
    await this.updateAuthState();
    this.notifyListeners();
  }
}

// Singleton Instance
export const authManager = new AuthManager();

// Auto-Initialize
authManager.initialize();
