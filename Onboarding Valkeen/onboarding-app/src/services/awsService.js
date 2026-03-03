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

// ========================================
// FLASHCARDS API
// ========================================

/**
 * Alle Flashcard-Decks laden
 */
export async function getDecks(userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/flashcards/decks?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Decks geladen:', data.decks?.length || 0);
    return data.decks || [];
  } catch (error) {
    console.error('❌ Fehler beim Laden der Decks:', error);
    return [];
  }
}

/**
 * Neues Deck mit KI-generierten Lernkarten erstellen
 */
export async function createDeck(name, content, sourceType = 'text', userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/flashcards/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        name,
        content,
        sourceType
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Deck erstellt:', data.deck?.name);
    return data;
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Decks:', error);
    throw error;
  }
}

/**
 * Deck löschen
 */
export async function deleteDeck(deckId, userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/flashcards/decks?userId=${encodeURIComponent(userId)}&deckId=${encodeURIComponent(deckId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('✅ Deck gelöscht');
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Löschen des Decks:', error);
    return false;
  }
}

/**
 * Fällige Lernkarten für ein Deck laden
 */
export async function getStudyCards(deckId, userId = 'default-user', limit = 20) {
  try {
    const response = await fetch(
      `${API_BASE}/flashcards/study?userId=${encodeURIComponent(userId)}&deckId=${encodeURIComponent(deckId)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Lernkarten geladen:', data.cards?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Fehler beim Laden der Lernkarten:', error);
    return { cards: [], totalDue: 0 };
  }
}

/**
 * Karte als richtig/falsch bewerten (Leitner-System)
 */
export async function reviewCard(cardId, correct, userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/flashcards/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        cardId,
        correct
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Karte bewertet: ${correct ? 'Richtig' : 'Falsch'} → Box ${data.newBox}`);
    return data;
  } catch (error) {
    console.error('❌ Fehler beim Bewerten der Karte:', error);
    throw error;
  }
}

/**
 * Flashcard-Statistiken laden
 */
export async function getFlashcardStats(userId = 'default-user') {
  try {
    const response = await fetch(`${API_BASE}/flashcards/stats?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Statistiken geladen');
    return data;
  } catch (error) {
    console.error('❌ Fehler beim Laden der Statistiken:', error);
    return {
      totalDecks: 0,
      totalCards: 0,
      dueCards: 0,
      masteredCards: 0,
      boxDistribution: { box1: 0, box2: 0, box3: 0, box4: 0, box5: 0 },
      totalReviews: 0
    };
  }
}
