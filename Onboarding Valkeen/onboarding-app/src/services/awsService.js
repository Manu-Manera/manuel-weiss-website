/**
 * AWS Service für Valkeen Onboarding
 * - Lädt OpenAI API-Key aus Admin-Panel (AWS API Settings)
 * - Speichert Fortschritt in AWS DynamoDB
 */

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';

/**
 * OpenAI API-Key aus AWS laden (globale Settings)
 */
export async function getOpenAIApiKey() {
  try {
    const response = await fetch(`${API_BASE}/api-settings?action=key&provider=openai&global=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('⚠️ Konnte API-Key nicht aus AWS laden:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.apiKey && typeof data.apiKey === 'string' && data.apiKey.startsWith('sk-')) {
      console.log('✅ OpenAI API-Key aus AWS geladen');
      return data.apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Fehler beim Laden des API-Keys:', error);
    return null;
  }
}

/**
 * Onboarding-Fortschritt aus AWS laden
 */
export async function loadProgress(userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/onboarding-progress?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ Kein gespeicherter Fortschritt gefunden');
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Fortschritt aus AWS geladen');
    return data.progress;
  } catch (error) {
    console.error('❌ Fehler beim Laden des Fortschritts:', error);
    return null;
  }
}

/**
 * Onboarding-Fortschritt in AWS speichern
 */
export async function saveProgress(progress, userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/onboarding-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        progress,
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('✅ Fortschritt in AWS gespeichert');
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Speichern des Fortschritts:', error);
    return false;
  }
}
