/**
 * Nutrition Management Section
 * AI Rezept-Generator und Ernährungsplan-Verwaltung
 */

class NutritionSection {
    constructor() {
        this.recipes = [];
        this.stats = {
            plansGenerated: 0,
            aiRequests: 0,
            exportsToday: 0,
            activeUsers: 0
        };
    }

    async init() {
        console.log('🥗 Nutrition Section: Initializing...');
        this.setupEventListeners();
        await this.loadStats();
        await this.loadRecipes();
        this.renderStats();
        this.renderRecipes();
    }

    setupEventListeners() {
        // Rezept generieren
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="generate-recipe"]')) {
                this.generateRecipe();
            }
            if (e.target.matches('[data-action="save-recipe"]')) {
                this.saveRecipe();
            }
            if (e.target.matches('[data-action="regenerate-recipe"]')) {
                this.regenerateRecipe();
            }
        });
    }

    async loadStats() {
        try {
            const storedStats = localStorage.getItem('nutrition_stats');
            if (storedStats) {
                this.stats = JSON.parse(storedStats);
            }
        } catch (error) {
            console.error('❌ Nutrition: Error loading stats:', error);
        }
    }

    async loadRecipes() {
        try {
            const storedRecipes = localStorage.getItem('saved_recipes');
            if (storedRecipes) {
                this.recipes = JSON.parse(storedRecipes);
            }
        } catch (error) {
            console.error('❌ Nutrition: Error loading recipes:', error);
        }
    }

    renderStats() {
        document.getElementById('plans-generated').textContent = this.stats.plansGenerated;
        document.getElementById('ai-requests').textContent = this.stats.aiRequests;
        document.getElementById('exports-today').textContent = this.stats.exportsToday;
        document.getElementById('active-users').textContent = this.stats.activeUsers;
    }

    renderRecipes() {
        const recipesList = document.getElementById('saved-recipes-list');
        if (!recipesList) return;

        if (this.recipes.length === 0) {
            recipesList.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #666;">
                    <i class="fas fa-utensils" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Noch keine Rezepte gespeichert</p>
                </div>
            `;
            return;
        }

        recipesList.innerHTML = this.recipes.map(recipe => `
            <div class="recipe-item" style="padding: 1rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h5 style="margin: 0 0 0.5rem 0; color: #333;">${recipe.name}</h5>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${recipe.category} • ${recipe.calories} kcal</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-outline" onclick="nutritionSection.viewRecipe('${recipe.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="nutritionSection.deleteRecipe('${recipe.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async generateRecipe() {
        const search = document.getElementById('ai-recipe-search').value;
        const category = document.getElementById('ai-recipe-category').value;
        const requirements = document.getElementById('ai-recipe-requirements').value;
        const time = document.getElementById('ai-recipe-time').value;

        if (!search) {
            this.showMessage('Bitte geben Sie eine Rezept-Beschreibung ein', 'error');
            return;
        }

        // Progress anzeigen
        const progressDiv = document.getElementById('ai-recipe-progress');
        const progressBar = document.getElementById('ai-progress-bar');
        progressDiv.style.display = 'block';

        // Progress simulieren
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 100) progress = 100;
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                this.showGeneratedRecipe();
            }
        }, 200);

        try {
            // AI Rezept generieren (simuliert)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Statistiken aktualisieren
            this.stats.aiRequests++;
            await this.saveStats();
            this.renderStats();
            
        } catch (error) {
            console.error('❌ Nutrition: Error generating recipe:', error);
            this.showMessage('Fehler beim Generieren des Rezepts', 'error');
        } finally {
            progressDiv.style.display = 'none';
        }
    }

    showGeneratedRecipe() {
        const generatedDiv = document.getElementById('generated-recipe');
        generatedDiv.style.display = 'block';

        // Beispiel-Rezept Daten
        const recipeData = {
            name: 'Gesunde Quinoa-Bowl mit Gemüse',
            category: 'mittagessen',
            ingredients: '• 1 Tasse Quinoa\n• 1 Zucchini\n• 1 Paprika\n• 1 Handvoll Spinat\n• 2 EL Olivenöl\n• Salz, Pfeffer, Kräuter',
            instructions: '1. Quinoa nach Packungsanleitung kochen\n2. Gemüse in Würfel schneiden\n3. In der Pfanne anbraten\n4. Mit Quinoa mischen\n5. Mit Kräutern würzen',
            calories: 350,
            protein: 12,
            carbs: 45,
            fat: 8
        };

        document.getElementById('generated-recipe-name').value = recipeData.name;
        document.getElementById('generated-recipe-category').value = recipeData.category;
        document.getElementById('generated-recipe-ingredients').value = recipeData.ingredients;
        document.getElementById('generated-recipe-instructions').value = recipeData.instructions;
        document.getElementById('generated-recipe-calories').value = recipeData.calories;
        document.getElementById('generated-recipe-protein').value = recipeData.protein;
        document.getElementById('generated-recipe-carbs').value = recipeData.carbs;
        document.getElementById('generated-recipe-fat').value = recipeData.fat;
    }

    async saveRecipe() {
        const recipe = {
            id: Date.now().toString(),
            name: document.getElementById('generated-recipe-name').value,
            category: document.getElementById('generated-recipe-category').value,
            ingredients: document.getElementById('generated-recipe-ingredients').value,
            instructions: document.getElementById('generated-recipe-instructions').value,
            calories: parseInt(document.getElementById('generated-recipe-calories').value),
            protein: parseInt(document.getElementById('generated-recipe-protein').value),
            carbs: parseInt(document.getElementById('generated-recipe-carbs').value),
            fat: parseInt(document.getElementById('generated-recipe-fat').value),
            createdAt: new Date().toISOString()
        };

        this.recipes.push(recipe);
        await this.saveRecipes();
        this.renderRecipes();
        
        // Statistiken aktualisieren
        this.stats.plansGenerated++;
        await this.saveStats();
        this.renderStats();

        this.showMessage('Rezept erfolgreich gespeichert!', 'success');
        
        // Formular zurücksetzen
        document.getElementById('generated-recipe').style.display = 'none';
        this.clearForm();
    }

    async regenerateRecipe() {
        document.getElementById('generated-recipe').style.display = 'none';
        await this.generateRecipe();
    }

    viewRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Rezept in Formular laden
        document.getElementById('generated-recipe-name').value = recipe.name;
        document.getElementById('generated-recipe-category').value = recipe.category;
        document.getElementById('generated-recipe-ingredients').value = recipe.ingredients;
        document.getElementById('generated-recipe-instructions').value = recipe.instructions;
        document.getElementById('generated-recipe-calories').value = recipe.calories;
        document.getElementById('generated-recipe-protein').value = recipe.protein;
        document.getElementById('generated-recipe-carbs').value = recipe.carbs;
        document.getElementById('generated-recipe-fat').value = recipe.fat;

        document.getElementById('generated-recipe').style.display = 'block';
    }

    async deleteRecipe(recipeId) {
        if (!confirm('Möchten Sie dieses Rezept wirklich löschen?')) return;

        this.recipes = this.recipes.filter(r => r.id !== recipeId);
        await this.saveRecipes();
        this.renderRecipes();
        this.showMessage('Rezept gelöscht!', 'success');
    }

    clearForm() {
        document.getElementById('ai-recipe-search').value = '';
        document.getElementById('ai-recipe-requirements').value = '';
        document.getElementById('ai-recipe-time').value = '';
    }

    async saveRecipes() {
        try {
            // Cookie-sichere Speicherung
            if (AdminUtils.storage.isAvailable()) {
                AdminUtils.storage.set('saved_recipes', this.recipes);
                console.log('✅ Nutrition recipes saved');
            } else {
                console.warn('⚠️ Storage not available, recipes not saved');
            }
        } catch (error) {
            console.error('❌ Nutrition: Error saving recipes:', error);
        }
    }

    async saveStats() {
        try {
            // Cookie-sichere Speicherung
            if (AdminUtils.storage.isAvailable()) {
                AdminUtils.storage.set('nutrition_stats', this.stats);
                console.log('✅ Nutrition stats saved');
            } else {
                console.warn('⚠️ Storage not available, stats not saved');
            }
        } catch (error) {
            console.error('❌ Nutrition: Error saving stats:', error);
        }
    }

    showMessage(message, type = 'info') {
        // Toast Notification anzeigen
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export für AdminApplication
window.NutritionSection = NutritionSection;
