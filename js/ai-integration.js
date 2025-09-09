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
            console.log('🤖 Starting AI meal plan generation...');
            
            // Step 1: Generate comprehensive meal plan with internet-sourced recipes
            const prompt = this.createAdvancedMealPlanPrompt(userData);
            const response = await this.callOpenAI(prompt);
            const mealPlan = this.parseMealPlanResponse(response);
            
            // Step 2: Enhance recipes with detailed internet-sourced information
            const enhancedMealPlan = await this.enhanceRecipesWithInternetData(mealPlan, userData);
            
            // Step 3: Save generated recipes to database
            await this.saveGeneratedRecipes(enhancedMealPlan);
            
            console.log('✅ AI meal plan generation completed');
            return enhancedMealPlan;
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

    createAdvancedMealPlanPrompt(userData) {
        return `Du bist ein professioneller Ernährungsberater und Koch mit Zugang zu aktuellen Rezepten aus dem Internet. Erstelle einen personalisierten 7-Tage Ernährungsplan basierend auf folgenden Daten:

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

WICHTIG: Verwende aktuelle, moderne Rezepte aus dem Internet. Suche nach:
- Trendigen, gesunden Rezepten
- Internationalen Küchen
- Superfood-Integration
- Moderne Zubereitungstechniken
- Instagram-würdige Gerichte

Erstelle einen detaillierten Ernährungsplan mit:
1. Abwechslungsreichen, modernen Rezepten aus dem Internet
2. Detaillierten Zutatenlisten mit exakten Mengen
3. Schritt-für-Schritt Anleitungen mit modernen Techniken
4. Präzisen Nährwertangaben pro Mahlzeit
5. Berücksichtigung aller Präferenzen und Allergien
6. Moderne Präsentation und Garnierung

Antworte im folgenden JSON-Format:
{
  "weekPlan": {
    "Montag": [
      {
        "type": "Frühstück",
        "name": "Moderner Rezeptname",
        "description": "Detaillierte Beschreibung mit modernen Elementen",
        "ingredients": [
          {
            "name": "Zutat",
            "amount": "exakte Menge",
            "unit": "Einheit"
          }
        ],
        "instructions": "Detaillierte Schritt-für-Schritt Anleitung mit modernen Techniken",
        "nutrition": {
          "calories": 350,
          "protein": 25,
          "carbs": 30,
          "fats": 12,
          "fiber": 8,
          "sugar": 5
        },
        "prepTime": 10,
        "cookingTime": 15,
        "difficulty": "einfach",
        "tags": ["gesund", "modern", "instagram-würdig"],
        "source": "Internet-Rezept-Quelle"
      }
    ]
  },
  "totalNutrients": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fats": 80,
    "fiber": 35,
    "sugar": 50
  },
  "shoppingList": [
    {
      "category": "Obst & Gemüse",
      "items": ["Zutat1", "Zutat2"]
    }
  ]
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

    async enhanceRecipesWithInternetData(mealPlan, userData) {
        console.log('🌐 Enhancing recipes with internet data...');
        
        try {
            // Enhance each recipe with additional internet-sourced information
            for (const day in mealPlan.weekPlan) {
                for (let i = 0; i < mealPlan.weekPlan[day].length; i++) {
                    const recipe = mealPlan.weekPlan[day][i];
                    
                    // Enhance recipe with modern cooking techniques and tips
                    const enhancedRecipe = await this.enhanceSingleRecipe(recipe, userData);
                    mealPlan.weekPlan[day][i] = enhancedRecipe;
                }
            }
            
            return mealPlan;
        } catch (error) {
            console.error('Error enhancing recipes:', error);
            return mealPlan; // Return original if enhancement fails
        }
    }
    
    async enhanceSingleRecipe(recipe, userData) {
        try {
            const enhancementPrompt = `Verbessere dieses Rezept mit modernen Internet-Trends und Techniken:

Rezept: ${recipe.name}
Beschreibung: ${recipe.description}
Zutaten: ${JSON.stringify(recipe.ingredients)}
Anleitung: ${recipe.instructions}

Ziel: ${userData.goal}
Präferenzen: ${userData.preferences.join(', ')}

Verbessere das Rezept mit:
1. Modernen Zubereitungstechniken (Sous-vide, Air-fryer, etc.)
2. Instagram-würdiger Präsentation
3. Superfood-Integration
4. Moderne Garnierung
5. Zeitersparende Tipps
6. Nährstoffoptimierung

Antworte im JSON-Format:
{
  "enhancedInstructions": "Verbesserte Anleitung mit modernen Techniken",
  "presentationTips": "Tipps für Instagram-würdige Präsentation",
  "modernTechniques": ["Technik1", "Technik2"],
  "superfoods": ["Superfood1", "Superfood2"],
  "timeSavingTips": ["Tipp1", "Tipp2"],
  "nutritionalEnhancements": "Verbesserungen der Nährwerte"
}`;

            const response = await this.callOpenAI(enhancementPrompt);
            const enhancement = this.parseEnhancementResponse(response);
            
            // Merge enhancement with original recipe
            return {
                ...recipe,
                enhancedInstructions: enhancement.enhancedInstructions || recipe.instructions,
                presentationTips: enhancement.presentationTips,
                modernTechniques: enhancement.modernTechniques || [],
                superfoods: enhancement.superfoods || [],
                timeSavingTips: enhancement.timeSavingTips || [],
                nutritionalEnhancements: enhancement.nutritionalEnhancements,
                enhanced: true
            };
        } catch (error) {
            console.error('Error enhancing single recipe:', error);
            return recipe; // Return original if enhancement fails
        }
    }
    
    parseEnhancementResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in enhancement response');
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Error parsing enhancement response:', error);
            return {};
        }
    }
    
    async saveGeneratedRecipes(mealPlan) {
        console.log('💾 Saving generated recipes to database...');
        
        try {
            const recipes = [];
            
            // Extract all recipes from the meal plan
            for (const day in mealPlan.weekPlan) {
                for (const meal of mealPlan.weekPlan[day]) {
                    const recipe = {
                        id: Date.now() + Math.random(),
                        name: meal.name,
                        category: meal.type.toLowerCase(),
                        description: meal.description,
                        ingredients: Array.isArray(meal.ingredients) 
                            ? meal.ingredients.map(ing => 
                                typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`
                              )
                            : meal.ingredients,
                        instructions: meal.enhancedInstructions || meal.instructions,
                        nutrition: meal.nutrition,
                        prepTime: meal.prepTime,
                        cookingTime: meal.cookingTime,
                        difficulty: meal.difficulty || 'mittel',
                        tags: meal.tags || [],
                        source: meal.source || 'AI Generated',
                        enhanced: meal.enhanced || false,
                        presentationTips: meal.presentationTips,
                        modernTechniques: meal.modernTechniques || [],
                        superfoods: meal.superfoods || [],
                        timeSavingTips: meal.timeSavingTips || [],
                        nutritionalEnhancements: meal.nutritionalEnhancements,
                        createdAt: new Date().toISOString(),
                        day: day,
                        mealType: meal.type
                    };
                    
                    recipes.push(recipe);
                }
            }
            
            // Save to localStorage
            const existingRecipes = JSON.parse(localStorage.getItem('nutrition_recipes') || '[]');
            const allRecipes = [...existingRecipes, ...recipes];
            localStorage.setItem('nutrition_recipes', JSON.stringify(allRecipes));
            
            // Update statistics
            const aiRequests = parseInt(localStorage.getItem('nutrition_ai_requests') || '0') + 1;
            localStorage.setItem('nutrition_ai_requests', aiRequests.toString());
            
            const plansGenerated = parseInt(localStorage.getItem('nutrition_plans_generated') || '0') + 1;
            localStorage.setItem('nutrition_plans_generated', plansGenerated.toString());
            
            console.log(`✅ Saved ${recipes.length} recipes to database`);
            return recipes;
        } catch (error) {
            console.error('Error saving recipes:', error);
            throw error;
        }
    }
    
    async generateShoppingList(mealPlan) {
        console.log('🛒 Generating shopping list...');
        
        try {
            const shoppingList = {};
            
            // Collect all ingredients from all recipes
            for (const day in mealPlan.weekPlan) {
                for (const meal of mealPlan.weekPlan[day]) {
                    if (Array.isArray(meal.ingredients)) {
                        for (const ingredient of meal.ingredients) {
                            const ingName = typeof ingredient === 'string' 
                                ? ingredient.split(' ').slice(1).join(' ') // Remove amount
                                : ingredient.name;
                            
                            if (!shoppingList[ingName]) {
                                shoppingList[ingName] = {
                                    name: ingName,
                                    amount: 0,
                                    unit: 'Stück',
                                    category: this.categorizeIngredient(ingName)
                                };
                            }
                            
                            // Add amount (simplified)
                            shoppingList[ingName].amount += 1;
                        }
                    }
                }
            }
            
            // Convert to categorized list
            const categorizedList = {};
            for (const ingredient of Object.values(shoppingList)) {
                if (!categorizedList[ingredient.category]) {
                    categorizedList[ingredient.category] = [];
                }
                categorizedList[ingredient.category].push(ingredient);
            }
            
            return categorizedList;
        } catch (error) {
            console.error('Error generating shopping list:', error);
            return {};
        }
    }
    
    categorizeIngredient(ingredientName) {
        const categories = {
            'Obst & Gemüse': ['tomate', 'gurke', 'paprika', 'zwiebel', 'karotte', 'brokkoli', 'spinat', 'apfel', 'banane', 'beere', 'zitrone', 'avocado'],
            'Fleisch & Fisch': ['hähnchen', 'rind', 'schwein', 'lachs', 'thunfisch', 'shrimp', 'wurst', 'schinken'],
            'Milchprodukte': ['milch', 'käse', 'joghurt', 'quark', 'butter', 'sahne', 'mozzarella'],
            'Getreide & Nudeln': ['reis', 'nudeln', 'brot', 'hafer', 'quinoa', 'bulgur', 'couscous'],
            'Gewürze & Öle': ['salz', 'pfeffer', 'öl', 'essig', 'kräuter', 'knoblauch', 'ingwer', 'curry'],
            'Nüsse & Samen': ['mandel', 'walnuss', 'haselnuss', 'sonnenblumenkerne', 'chia', 'leinsamen']
        };
        
        const lowerName = ingredientName.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerName.includes(keyword))) {
                return category;
            }
        }
        
        return 'Sonstiges';
    }

    getUsageStats() {
        // This would track API usage in a real implementation
        return {
            requestsToday: parseInt(localStorage.getItem('nutrition_ai_requests') || '0'),
            requestsThisMonth: parseInt(localStorage.getItem('nutrition_ai_requests') || '0'),
            tokensUsed: 0,
            plansGenerated: parseInt(localStorage.getItem('nutrition_plans_generated') || '0')
        };
    }
}

// Global instance
window.aiIntegration = new AIIntegration();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIIntegration;
}
