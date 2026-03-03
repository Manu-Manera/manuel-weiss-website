/**
 * Flashcards API Lambda
 * - PDF/Text Upload und Verarbeitung
 * - KI-gestützte Karteikarten-Generierung
 * - Leitner-Box Spaced Repetition System
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const DECKS_TABLE = process.env.DECKS_TABLE || 'mawps-flashcard-decks';
const CARDS_TABLE = process.env.CARDS_TABLE || 'mawps-flashcards';
const S3_BUCKET = process.env.S3_BUCKET || 'mawps-flashcard-pdfs';
const API_SETTINGS_TABLE = process.env.API_SETTINGS_TABLE || 'mawps-api-settings';

const LEITNER_INTERVALS = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

async function getOpenAIApiKey() {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: 'mawps-user-profiles',
      Key: { id: 'global-settings' }
    }));
    
    if (result.Item?.openai?.apiKey) {
      return result.Item.openai.apiKey;
    }
    
    const settingsResult = await docClient.send(new GetCommand({
      TableName: API_SETTINGS_TABLE,
      Key: { pk: 'api-settings#global', sk: 'openai' }
    }));
    
    if (settingsResult.Item?.apiKey) {
      return settingsResult.Item.apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
}

async function callOpenAI(prompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: `Du bist ein Experte für Lernmethoden und erstellst effektive Lernkarten.
Analysiere den gegebenen Text und erstelle Karteikarten im JSON-Format.
Jede Karte hat:
- "front": Eine präzise Frage oder ein Begriff
- "back": Die Antwort oder Erklärung

Regeln:
1. Erstelle 10-20 Karten je nach Textlänge
2. Fokussiere auf die wichtigsten Konzepte
3. Formuliere Fragen, die aktives Erinnern fördern
4. Vermeide Ja/Nein-Fragen
5. Halte Antworten prägnant aber vollständig

Antworte NUR mit einem JSON-Array, keine Erklärungen.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function summarizeText(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: `Du bist ein Experte für Textzusammenfassungen.
Erstelle eine strukturierte Zusammenfassung des Textes.
Gliedere nach Hauptthemen und wichtigsten Punkten.
Behalte alle relevanten Fakten und Konzepte bei.
Maximal 2000 Wörter.`
        },
        {
          role: 'user',
          content: `Fasse folgenden Text zusammen:\n\n${text}`
        }
      ],
      temperature: 0.5,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function calculateNextReview(box) {
  const days = LEITNER_INTERVALS[box] || 0;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
}

async function createDeck(event) {
  const body = JSON.parse(event.body || '{}');
  const userId = body.userId || event.queryStringParameters?.userId || 'default-user';
  const { name, content, sourceType } = body;

  if (!name || !content) {
    return response(400, { error: 'Name und Content sind erforderlich' });
  }

  const apiKey = await getOpenAIApiKey();
  if (!apiKey) {
    return response(500, { error: 'OpenAI API-Key nicht konfiguriert' });
  }

  console.log(`📝 Erstelle Deck "${name}" für User: ${userId}`);

  try {
    const summary = await summarizeText(content, apiKey);
    console.log('✅ Zusammenfassung erstellt');

    const flashcardsJson = await callOpenAI(
      `Erstelle Lernkarten aus folgendem Text:\n\n${summary}`,
      apiKey
    );
    
    let flashcards;
    try {
      const cleanJson = flashcardsJson.replace(/```json\n?|\n?```/g, '').trim();
      flashcards = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return response(500, { error: 'Fehler beim Parsen der KI-Antwort' });
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return response(500, { error: 'Keine Karteikarten generiert' });
    }

    console.log(`✅ ${flashcards.length} Karteikarten generiert`);

    const deckId = uuidv4();
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: DECKS_TABLE,
      Item: {
        userId,
        deckId,
        name,
        description: summary.substring(0, 500) + '...',
        sourceType: sourceType || 'text',
        cardCount: flashcards.length,
        createdAt: now,
        updatedAt: now
      }
    }));

    const cardItems = flashcards.map((card, index) => ({
      PutRequest: {
        Item: {
          userId,
          cardId: `${deckId}#${index}`,
          deckId,
          front: card.front,
          back: card.back,
          box: 1,
          nextReview: now,
          reviewCount: 0,
          createdAt: now,
          updatedAt: now
        }
      }
    }));

    for (let i = 0; i < cardItems.length; i += 25) {
      const batch = cardItems.slice(i, i + 25);
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [CARDS_TABLE]: batch
        }
      }));
    }

    console.log('✅ Deck und Karten gespeichert');

    return response(200, {
      success: true,
      deck: {
        deckId,
        name,
        cardCount: flashcards.length,
        summary: summary.substring(0, 500)
      },
      cards: flashcards
    });

  } catch (error) {
    console.error('Create Deck Error:', error);
    return response(500, { error: error.message });
  }
}

async function getDecks(event) {
  const userId = event.queryStringParameters?.userId || 'default-user';

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: DECKS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    const decksWithStats = await Promise.all((result.Items || []).map(async (deck) => {
      const cardsResult = await docClient.send(new QueryCommand({
        TableName: CARDS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'deckId = :deckId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':deckId': deck.deckId
        }
      }));

      const cards = cardsResult.Items || [];
      const now = new Date().toISOString();
      const dueCards = cards.filter(c => c.nextReview <= now).length;
      const masteredCards = cards.filter(c => c.box >= 4).length;

      return {
        ...deck,
        totalCards: cards.length,
        dueCards,
        masteredCards,
        progress: cards.length > 0 ? Math.round((masteredCards / cards.length) * 100) : 0
      };
    }));

    return response(200, { decks: decksWithStats });

  } catch (error) {
    console.error('Get Decks Error:', error);
    return response(500, { error: error.message });
  }
}

async function getStudyCards(event) {
  const userId = event.queryStringParameters?.userId || 'default-user';
  const deckId = event.queryStringParameters?.deckId;
  const limit = parseInt(event.queryStringParameters?.limit || '20');

  if (!deckId) {
    return response(400, { error: 'deckId ist erforderlich' });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: CARDS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'deckId = :deckId AND nextReview <= :now',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':deckId': deckId,
        ':now': new Date().toISOString()
      }
    }));

    const cards = (result.Items || [])
      .sort((a, b) => a.box - b.box)
      .slice(0, limit);

    return response(200, {
      cards,
      totalDue: result.Items?.length || 0,
      returned: cards.length
    });

  } catch (error) {
    console.error('Get Study Cards Error:', error);
    return response(500, { error: error.message });
  }
}

async function reviewCard(event) {
  const body = JSON.parse(event.body || '{}');
  const userId = body.userId || 'default-user';
  const { cardId, correct } = body;

  if (!cardId || correct === undefined) {
    return response(400, { error: 'cardId und correct sind erforderlich' });
  }

  try {
    const getResult = await docClient.send(new GetCommand({
      TableName: CARDS_TABLE,
      Key: { userId, cardId }
    }));

    if (!getResult.Item) {
      return response(404, { error: 'Karte nicht gefunden' });
    }

    const card = getResult.Item;
    let newBox;

    if (correct) {
      newBox = Math.min(card.box + 1, 5);
    } else {
      newBox = 1;
    }

    const nextReview = calculateNextReview(newBox);

    await docClient.send(new UpdateCommand({
      TableName: CARDS_TABLE,
      Key: { userId, cardId },
      UpdateExpression: 'SET #box = :box, nextReview = :nextReview, reviewCount = reviewCount + :one, updatedAt = :now',
      ExpressionAttributeNames: {
        '#box': 'box'
      },
      ExpressionAttributeValues: {
        ':box': newBox,
        ':nextReview': nextReview,
        ':one': 1,
        ':now': new Date().toISOString()
      }
    }));

    return response(200, {
      success: true,
      cardId,
      previousBox: card.box,
      newBox,
      nextReview,
      correct
    });

  } catch (error) {
    console.error('Review Card Error:', error);
    return response(500, { error: error.message });
  }
}

async function deleteDeck(event) {
  const userId = event.queryStringParameters?.userId || 'default-user';
  const deckId = event.queryStringParameters?.deckId || event.pathParameters?.deckId;

  if (!deckId) {
    return response(400, { error: 'deckId ist erforderlich' });
  }

  try {
    const cardsResult = await docClient.send(new QueryCommand({
      TableName: CARDS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'deckId = :deckId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':deckId': deckId
      }
    }));

    if (cardsResult.Items && cardsResult.Items.length > 0) {
      const deleteRequests = cardsResult.Items.map(card => ({
        DeleteRequest: {
          Key: { userId, cardId: card.cardId }
        }
      }));

      for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [CARDS_TABLE]: batch
          }
        }));
      }
    }

    await docClient.send(new DeleteCommand({
      TableName: DECKS_TABLE,
      Key: { userId, deckId }
    }));

    console.log(`✅ Deck ${deckId} und ${cardsResult.Items?.length || 0} Karten gelöscht`);

    return response(200, {
      success: true,
      deletedCards: cardsResult.Items?.length || 0
    });

  } catch (error) {
    console.error('Delete Deck Error:', error);
    return response(500, { error: error.message });
  }
}

async function getDeckCards(event) {
  const userId = event.queryStringParameters?.userId || 'default-user';
  const deckId = event.queryStringParameters?.deckId;

  if (!deckId) {
    return response(400, { error: 'deckId ist erforderlich' });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: CARDS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'deckId = :deckId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':deckId': deckId
      }
    }));

    const cards = (result.Items || []).sort((a, b) => {
      const aNum = parseInt(a.cardId.split('#')[1] || '0');
      const bNum = parseInt(b.cardId.split('#')[1] || '0');
      return aNum - bNum;
    });

    return response(200, { cards });

  } catch (error) {
    console.error('Get Deck Cards Error:', error);
    return response(500, { error: error.message });
  }
}

async function getStats(event) {
  const userId = event.queryStringParameters?.userId || 'default-user';

  try {
    const decksResult = await docClient.send(new QueryCommand({
      TableName: DECKS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    const cardsResult = await docClient.send(new QueryCommand({
      TableName: CARDS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    const cards = cardsResult.Items || [];
    const now = new Date().toISOString();

    const stats = {
      totalDecks: decksResult.Items?.length || 0,
      totalCards: cards.length,
      dueCards: cards.filter(c => c.nextReview <= now).length,
      masteredCards: cards.filter(c => c.box >= 4).length,
      boxDistribution: {
        box1: cards.filter(c => c.box === 1).length,
        box2: cards.filter(c => c.box === 2).length,
        box3: cards.filter(c => c.box === 3).length,
        box4: cards.filter(c => c.box === 4).length,
        box5: cards.filter(c => c.box === 5).length
      },
      totalReviews: cards.reduce((sum, c) => sum + (c.reviewCount || 0), 0)
    };

    return response(200, stats);

  } catch (error) {
    console.error('Get Stats Error:', error);
    return response(500, { error: error.message });
  }
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  const path = event.path || '';
  const method = event.httpMethod;

  try {
    if (path.includes('/flashcards/decks') && method === 'GET') {
      return await getDecks(event);
    }

    if (path.includes('/flashcards/decks') && method === 'POST') {
      return await createDeck(event);
    }

    if (path.includes('/flashcards/decks') && method === 'DELETE') {
      return await deleteDeck(event);
    }

    if (path.includes('/flashcards/cards') && method === 'GET') {
      return await getDeckCards(event);
    }

    if (path.includes('/flashcards/study') && method === 'GET') {
      return await getStudyCards(event);
    }

    if (path.includes('/flashcards/review') && method === 'POST') {
      return await reviewCard(event);
    }

    if (path.includes('/flashcards/stats') && method === 'GET') {
      return await getStats(event);
    }

    return response(404, { error: 'Route nicht gefunden', path, method });

  } catch (error) {
    console.error('Handler Error:', error);
    return response(500, { error: error.message });
  }
};
