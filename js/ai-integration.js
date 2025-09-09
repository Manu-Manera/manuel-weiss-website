// AI Integration for Nutrition Planner - OpenAI API Integration
class AIIntegration {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4';
        this.init();
    }

    init() {
        // Load API key from environment or localStorage
        this.loadAPIKey();
        console.log('🤖 AI Integration initialized');
    }

    loadAPIKey() {
        // In production, this should be loaded from environment variables
        // For now, we'll use a placeholder that users can configure
        this.apiKey = localStorage.getItem('openai_api_key') || null;
        
        if (!this.apiKey) {
            console.warn('⚠️ OpenAI API key not found. AI features will be limited.');
        }
    }

    setAPIKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('openai_api_key', apiKey);
        console.log('✅ OpenAI API key saved');
    }

    async generateMealPlan(userData) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured. Please set your API key in the admin panel.');
        }

        try {
            const prompt = this.createMealPlanPrompt(userData);
            const response = await this.callOpenAI(prompt);
            return this.parseMealPlanResponse(response);
        } catch (error) {
            console.error('Error generating meal plan:', error);
            throw error;
        }
    }

    async generateRecipe(mealType, userData, day) {
        if (!this.apiKey) {
            // Fallback to predefined recipes
            return this.getFallbackRecipe(mealType);
        }

        try {
            const prompt = this.createRecipePrompt(mealType, userData, day);
            const response = await this.callOpenAI(prompt);
            return this.parseRecipeResponse(response);
        } catch (error) {
            console.error('Error generating recipe:', error);
            return this.getFallbackRecipe(mealType);
        }
    }

    createMealPlanPrompt(userData) {
        return `Du bist ein professioneller Ernährungsberater und Koch. Erstelle einen personalisierten 7-Tage Ernährungsplan basierend auf folgenden Daten:

Ziel: ${userData.goal}
Alter: ${userData.age} Jahre
Gewicht: ${userData.weight} kg
Größe: ${userData.height} cm
Geschlecht: ${userData.gender}
Aktivitätslevel: ${userData.activityLevel}
Mahlzeiten pro Tag: ${userData.mealsPerDay}
Verfügbare Kochzeit: ${userData.cookingTime} Minuten
Präferenzen: ${userData.preferences.join(', ')}
Allergien: ${userData.allergies || 'Keine'}
Tägliche Kalorien: ${userData.dailyCalories} kcal

Erstelle einen detaillierten Ernährungsplan mit:
1. Abwechslungsreichen, gesunden Rezepten
2. Detaillierten Zutatenlisten
3. Schritt-für-Schritt Anleitungen
4. Nährwertangaben pro Mahlzeit
5. Berücksichtigung der Präferenzen und Allergien

Antworte im folgenden JSON-Format:
{
  "weekPlan": {
    "Montag": [
      {
        "type": "Frühstück",
        "name": "Rezeptname",
        "description": "Kurze Beschreibung",
        "ingredients": ["Zutat1", "Zutat2"],
        "instructions": "Detaillierte Anleitung",
        "nutrition": {
          "calories": 350,
          "protein": 25,
          "carbs": 30,
          "fats": 12
        },
        "prepTime": 10,
        "cookingTime": 15
      }
    ]
  },
  "totalNutrients": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fats": 80
  }
}`;
    }

    createRecipePrompt(mealType, userData, day) {
        return `Erstelle ein gesundes ${mealType}-Rezept für ${day} basierend auf:

Ziel: ${userData.goal}
Präferenzen: ${userData.preferences.join(', ')}
Allergien: ${userData.allergies || 'Keine'}
Verfügbare Zeit: ${userData.cookingTime} Minuten
Tägliche Kalorien: ${userData.dailyCalories} kcal

Das Rezept sollte:
- Gesund und nährstoffreich sein
- Zu den Präferenzen passen
- In der verfügbaren Zeit zubereitbar sein
- Abwechslungsreich und lecker sein

Antworte im JSON-Format:
{
  "name": "Rezeptname",
  "description": "Kurze Beschreibung",
  "ingredients": ["Zutat1", "Zutat2"],
  "instructions": "Detaillierte Schritt-für-Schritt Anleitung",
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fats": 12
  },
  "prepTime": 10,
  "cookingTime": 15
}`;
    }

    async callOpenAI(prompt) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein professioneller Ernährungsberater und Koch. Antworte immer im angeforderten JSON-Format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    parseMealPlanResponse(response) {
        try {
            // Clean the response to extract JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const mealPlan = JSON.parse(jsonMatch[0]);
            return mealPlan;
        } catch (error) {
            console.error('Error parsing meal plan response:', error);
            throw new Error('Failed to parse AI response');
        }
    }

    parseRecipeResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const recipe = JSON.parse(jsonMatch[0]);
            return recipe;
        } catch (error) {
            console.error('Error parsing recipe response:', error);
            throw new Error('Failed to parse AI response');
        }
    }

    getFallbackRecipe(mealType) {
        // Fallback recipes when AI is not available
        const fallbackRecipes = {
            'Frühstück': {
                name: 'Haferflocken mit Beeren',
                description: 'Gesundes Frühstück mit Haferflocken und frischen Beeren',
                ingredients: ['Haferflocken', 'Milch', 'Beeren', 'Honig', 'Nüsse'],
                instructions: 'Haferflocken mit Milch kochen, Beeren hinzufügen, mit Honig süßen und Nüsse darüber streuen.',
                nutrition: { calories: 300, protein: 12, carbs: 45, fats: 8 },
                prepTime: 5,
                cookingTime: 10
            },
            'Mittagessen': {
                name: 'Quinoa-Salat',
                description: 'Nährstoffreicher Salat mit Quinoa und Gemüse',
                ingredients: ['Quinoa', 'Gemüse', 'Olivenöl', 'Zitrone', 'Kräuter'],
                instructions: 'Quinoa kochen, Gemüse schneiden, alles vermischen und mit Dressing anmachen.',
                nutrition: { calories: 400, protein: 15, carbs: 50, fats: 15 },
                prepTime: 15,
                cookingTime: 20
            },
            'Abendessen': {
                name: 'Gegrilltes Hähnchen mit Gemüse',
                description: 'Proteinreiches Abendessen mit Hähnchen und gedünstetem Gemüse',
                ingredients: ['Hähnchenbrust', 'Brokkoli', 'Karotten', 'Olivenöl', 'Gewürze'],
                instructions: 'Hähnchen würzen und grillen, Gemüse dämpfen, alles zusammen servieren.',
                nutrition: { calories: 350, protein: 35, carbs: 20, fats: 12 },
                prepTime: 10,
                cookingTime: 25
            },
            'Snack': {
                name: 'Griechischer Joghurt mit Nüssen',
                description: 'Proteinreicher Snack mit Joghurt und Nüssen',
                ingredients: ['Griechischer Joghurt', 'Nüsse', 'Honig', 'Zimt'],
                instructions: 'Joghurt mit Honig und Zimt vermischen, Nüsse darüber streuen.',
                nutrition: { calories: 200, protein: 15, carbs: 15, fats: 10 },
                prepTime: 5,
                cookingTime: 0
            }
        };

        return fallbackRecipes[mealType] || fallbackRecipes['Frühstück'];
    }

    // Utility methods for AI integration
    async testConnection() {
        if (!this.apiKey) {
            return { success: false, message: 'No API key configured' };
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello, this is a test message.'
                        }
                    ],
                    max_tokens: 10
                })
            });

            if (response.ok) {
                return { success: true, message: 'Connection successful' };
            } else {
                return { success: false, message: `API error: ${response.status}` };
            }
        } catch (error) {
            return { success: false, message: `Connection failed: ${error.message}` };
        }
    }

    getUsageStats() {
        // This would track API usage in a real implementation
        return {
            requestsToday: 0,
            requestsThisMonth: 0,
            tokensUsed: 0
        };
    }
}

// Global instance
window.aiIntegration = new AIIntegration();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIIntegration;
}
