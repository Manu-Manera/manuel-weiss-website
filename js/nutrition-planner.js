// Nutrition Planner - Intelligent Meal Planning with AI
class NutritionPlanner {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.userData = {};
        this.mealPlan = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStepDisplay();
        console.log('🍽️ Nutrition Planner initialized');
    }

    setupEventListeners() {
        // Navigation buttons
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        // Export buttons
        this.setupExportButtons();

        // Form validation
        this.setupFormValidation();
    }

    setupExportButtons() {
        const exportApple = document.getElementById('export-apple');
        const exportGoogle = document.getElementById('export-google');
        const exportIcs = document.getElementById('export-ics');
        const exportShopping = document.getElementById('export-shopping');

        if (exportApple) {
            exportApple.addEventListener('click', () => this.exportToApple());
        }

        if (exportGoogle) {
            exportGoogle.addEventListener('click', () => this.exportToGoogle());
        }

        if (exportIcs) {
            exportIcs.addEventListener('click', () => this.exportToICS());
        }

        if (exportShopping) {
            exportShopping.addEventListener('click', () => this.exportShoppingList());
        }
    }

    setupFormValidation() {
        // Real-time validation for required fields
        const requiredInputs = document.querySelectorAll('input[required], select[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.validateField(input));
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        field.classList.toggle('invalid', !isValid);
        return isValid;
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.collectStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                
                // Special handling for AI generation step
                if (this.currentStep === 4) {
                    this.generateMealPlan();
                }
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    validateCurrentStep() {
        const currentStepContent = document.querySelector(`.step-content[data-step="${this.currentStep}"]`);
        if (!currentStepContent) return true;

        // Step-specific validation
        switch (this.currentStep) {
            case 1:
                return this.validateGoalsAndPreferences();
            case 2:
                return this.validatePhysicalData();
            case 3:
                return this.validateTimeAvailability();
            default:
                return true;
        }
    }

    validateGoalsAndPreferences() {
        const goalSelected = document.querySelector('input[name="goal"]:checked');
        if (!goalSelected) {
            this.showError('Bitte wähle ein Ziel aus.');
            return false;
        }
        return true;
    }

    validatePhysicalData() {
        const requiredFields = ['age', 'weight', 'height', 'activity-level', 'gender'];
        for (const fieldName of requiredFields) {
            const field = document.getElementById(fieldName);
            if (!field || !field.value.trim()) {
                this.showError(`Bitte fülle das Feld "${fieldName}" aus.`);
                return false;
            }
        }
        return true;
    }

    validateTimeAvailability() {
        const mealsSelected = document.querySelector('input[name="meals-per-day"]:checked');
        const cookingTimeSelected = document.querySelector('input[name="cooking-time"]:checked');
        
        if (!mealsSelected || !cookingTimeSelected) {
            this.showError('Bitte wähle deine Mahlzeiten und Kochzeit aus.');
            return false;
        }
        return true;
    }

    collectStepData() {
        switch (this.currentStep) {
            case 1:
                this.collectGoalsAndPreferences();
                break;
            case 2:
                this.collectPhysicalData();
                break;
            case 3:
                this.collectTimeAvailability();
                break;
        }
    }

    collectGoalsAndPreferences() {
        const goal = document.querySelector('input[name="goal"]:checked');
        const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
            .map(cb => cb.value);

        this.userData.goal = goal ? goal.value : null;
        this.userData.preferences = preferences;
    }

    collectPhysicalData() {
        this.userData.age = parseInt(document.getElementById('age').value);
        this.userData.weight = parseFloat(document.getElementById('weight').value);
        this.userData.height = parseInt(document.getElementById('height').value);
        this.userData.activityLevel = document.getElementById('activity-level').value;
        this.userData.gender = document.getElementById('gender').value;
        this.userData.allergies = document.getElementById('allergies').value;
        
        // Calculate BMI and BMR
        this.userData.bmi = this.calculateBMI();
        this.userData.bmr = this.calculateBMR();
        this.userData.dailyCalories = this.calculateDailyCalories();
    }

    collectTimeAvailability() {
        this.userData.mealsPerDay = parseInt(document.querySelector('input[name="meals-per-day"]:checked').value);
        this.userData.cookingTime = parseInt(document.querySelector('input[name="cooking-time"]:checked').value);
        this.userData.mealPrep = document.querySelector('input[name="meal-prep"]:checked') !== null;
    }

    calculateBMI() {
        const heightInMeters = this.userData.height / 100;
        return this.userData.weight / (heightInMeters * heightInMeters);
    }

    calculateBMR() {
        // Mifflin-St Jeor Equation
        let bmr;
        if (this.userData.gender === 'male') {
            bmr = 10 * this.userData.weight + 6.25 * this.userData.height - 5 * this.userData.age + 5;
        } else {
            bmr = 10 * this.userData.weight + 6.25 * this.userData.height - 5 * this.userData.age - 161;
        }
        return Math.round(bmr);
    }

    calculateDailyCalories() {
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very-active': 1.9
        };

        const multiplier = activityMultipliers[this.userData.activityLevel] || 1.2;
        let calories = this.userData.bmr * multiplier;

        // Adjust based on goal
        switch (this.userData.goal) {
            case 'weight-loss':
                calories *= 0.8; // 20% deficit
                break;
            case 'muscle-gain':
                calories *= 1.2; // 20% surplus
                break;
            case 'endurance':
                calories *= 1.1; // 10% surplus
                break;
        }

        return Math.round(calories);
    }

    async generateMealPlan() {
        console.log('🤖 Starting AI meal plan generation...');
        
        // Show progress animation
        this.animateProgress();
        
        try {
            // Try AI generation first
            if (window.aiIntegration && window.aiIntegration.apiKey) {
                console.log('🚀 Using AI for meal plan generation...');
                this.mealPlan = await window.aiIntegration.generateMealPlan(this.userData);
            } else {
                console.log('📝 Using fallback meal plan generation...');
                // Fallback to predefined meal plan
                await this.simulateAIProcessing();
                this.mealPlan = this.createMealPlan();
            }
            
            // Update UI with results
            this.updatePlanSummary();
            this.updateWeekOverview();
            
            // Move to next step
            setTimeout(() => {
                this.currentStep = 5;
                this.updateStepDisplay();
            }, 2000);
            
        } catch (error) {
            console.error('Error generating meal plan:', error);
            this.showError('Fehler bei der Generierung des Ernährungsplans. Verwende Fallback-Rezepte...');
            
            // Fallback to predefined recipes
            this.mealPlan = this.createMealPlan();
            this.updatePlanSummary();
            this.updateWeekOverview();
            
            setTimeout(() => {
                this.currentStep = 5;
                this.updateStepDisplay();
            }, 1000);
        }
    }

    async simulateAIProcessing() {
        return new Promise((resolve) => {
            setTimeout(resolve, 3000); // Simulate 3 seconds of processing
        });
    }

    animateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.animation = 'progressAnimation 3s ease-in-out';
        }
    }

    createMealPlan() {
        const mealPlan = {
            dailyCalories: this.userData.dailyCalories,
            mealsPerDay: this.userData.mealsPerDay,
            weekPlan: {},
            totalNutrients: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            }
        };

        // Generate meals for each day
        const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
        
        days.forEach(day => {
            mealPlan.weekPlan[day] = this.generateDayMeals(day);
        });

        // Calculate total nutrients
        this.calculateTotalNutrients(mealPlan);

        return mealPlan;
    }

    generateDayMeals(day) {
        const meals = [];
        const mealTypes = this.getMealTypes();
        
        mealTypes.forEach(mealType => {
            const meal = this.generateMeal(mealType, day);
            meals.push(meal);
        });

        return meals;
    }

    getMealTypes() {
        const mealTypes = ['Frühstück', 'Mittagessen', 'Abendessen'];
        
        if (this.userData.mealsPerDay >= 4) {
            mealTypes.push('Snack');
        }
        
        if (this.userData.mealsPerDay >= 5) {
            mealTypes.push('Abend-Snack');
        }
        
        return mealTypes;
    }

    generateMeal(mealType, day) {
        // This would normally use AI to generate recipes
        // For now, we'll use predefined meal templates
        const mealTemplates = this.getMealTemplates();
        const template = mealTemplates[mealType][Math.floor(Math.random() * mealTemplates[mealType].length)];
        
        return {
            type: mealType,
            name: template.name,
            description: template.description,
            ingredients: template.ingredients,
            instructions: template.instructions,
            nutrition: template.nutrition,
            prepTime: template.prepTime,
            cookingTime: template.cookingTime
        };
    }

    getMealTemplates() {
        return {
            'Frühstück': [
                {
                    name: 'Protein-Pancakes',
                    description: 'Fluffige Pancakes mit hohem Proteingehalt',
                    ingredients: ['Haferflocken', 'Proteinpulver', 'Eier', 'Bananen', 'Milch'],
                    instructions: 'Alle Zutaten mixen und in der Pfanne backen.',
                    nutrition: { calories: 350, protein: 25, carbs: 30, fats: 12 },
                    prepTime: 10,
                    cookingTime: 15
                },
                {
                    name: 'Avocado-Toast',
                    description: 'Gesunder Toast mit Avocado und Ei',
                    ingredients: ['Vollkornbrot', 'Avocado', 'Eier', 'Tomaten', 'Salz'],
                    instructions: 'Brot toasten, Avocado zerdrücken, Ei kochen und servieren.',
                    nutrition: { calories: 400, protein: 18, carbs: 35, fats: 22 },
                    prepTime: 5,
                    cookingTime: 10
                }
            ],
            'Mittagessen': [
                {
                    name: 'Quinoa-Bowl',
                    description: 'Nährstoffreiche Bowl mit Quinoa und Gemüse',
                    ingredients: ['Quinoa', 'Brokkoli', 'Kichererbsen', 'Avocado', 'Tahini'],
                    instructions: 'Quinoa kochen, Gemüse dämpfen, alles zusammenmischen.',
                    nutrition: { calories: 450, protein: 20, carbs: 55, fats: 18 },
                    prepTime: 15,
                    cookingTime: 20
                },
                {
                    name: 'Hähnchen-Salat',
                    description: 'Proteinreicher Salat mit Hähnchenbrust',
                    ingredients: ['Hähnchenbrust', 'Salat', 'Tomaten', 'Gurken', 'Olivenöl'],
                    instructions: 'Hähnchen braten, Salat zubereiten und alles vermischen.',
                    nutrition: { calories: 380, protein: 35, carbs: 15, fats: 20 },
                    prepTime: 10,
                    cookingTime: 15
                }
            ],
            'Abendessen': [
                {
                    name: 'Lachs mit Süßkartoffeln',
                    description: 'Omega-3 reiches Abendessen',
                    ingredients: ['Lachs', 'Süßkartoffeln', 'Brokkoli', 'Zitrone', 'Kräuter'],
                    instructions: 'Lachs und Süßkartoffeln im Ofen backen, Brokkoli dämpfen.',
                    nutrition: { calories: 420, protein: 30, carbs: 40, fats: 15 },
                    prepTime: 15,
                    cookingTime: 25
                },
                {
                    name: 'Gemüse-Curry',
                    description: 'Würziges Curry mit verschiedenen Gemüsesorten',
                    ingredients: ['Kokosmilch', 'Curry-Paste', 'Gemüse', 'Reis', 'Koriander'],
                    instructions: 'Gemüse anbraten, Curry-Paste hinzufügen, mit Kokosmilch ablöschen.',
                    nutrition: { calories: 380, protein: 12, carbs: 45, fats: 18 },
                    prepTime: 20,
                    cookingTime: 30
                }
            ],
            'Snack': [
                {
                    name: 'Griechischer Joghurt',
                    description: 'Proteinreicher Snack mit Beeren',
                    ingredients: ['Griechischer Joghurt', 'Beeren', 'Honig', 'Nüsse'],
                    instructions: 'Joghurt mit Beeren und Honig vermischen, Nüsse darüber streuen.',
                    nutrition: { calories: 200, protein: 15, carbs: 20, fats: 8 },
                    prepTime: 5,
                    cookingTime: 0
                }
            ]
        };
    }

    calculateTotalNutrients(mealPlan) {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        Object.values(mealPlan.weekPlan).forEach(dayMeals => {
            dayMeals.forEach(meal => {
                totalCalories += meal.nutrition.calories;
                totalProtein += meal.nutrition.protein;
                totalCarbs += meal.nutrition.carbs;
                totalFats += meal.nutrition.fats;
            });
        });

        mealPlan.totalNutrients = {
            calories: Math.round(totalCalories / 7), // Average per day
            protein: Math.round(totalProtein / 7),
            carbs: Math.round(totalCarbs / 7),
            fats: Math.round(totalFats / 7)
        };
    }

    updatePlanSummary() {
        if (!this.mealPlan) return;

        const nutrients = this.mealPlan.totalNutrients;
        
        document.getElementById('total-calories').textContent = `${nutrients.calories} kcal`;
        document.getElementById('total-protein').textContent = `${nutrients.protein}g`;
        document.getElementById('total-carbs').textContent = `${nutrients.carbs}g`;
        document.getElementById('total-fats').textContent = `${nutrients.fats}g`;
    }

    updateWeekOverview() {
        if (!this.mealPlan) return;

        const weekOverview = document.getElementById('week-overview');
        if (!weekOverview) return;

        const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
        
        weekOverview.innerHTML = days.map(day => {
            const dayMeals = this.mealPlan.weekPlan[day];
            const mealNames = dayMeals.map(meal => meal.name).join(', ');
            
            return `
                <div class="day-card">
                    <div class="day-name">${day}</div>
                    <div class="day-meals">${mealNames}</div>
                </div>
            `;
        }).join('');
    }

    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update step content
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });

        const currentContent = document.querySelector(`.step-content[data-step="${this.currentStep}"]`);
        if (currentContent) {
            currentContent.classList.add('active');
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
                nextBtn.textContent = this.currentStep === 4 ? 'Generiere Plan...' : 'Weiter';
            }
        }
    }

    // Export Functions
    exportToApple() {
        this.exportToCalendar('apple');
    }

    exportToGoogle() {
        this.exportToCalendar('google');
    }

    exportToICS() {
        this.exportToCalendar('ics');
    }

    exportToCalendar(platform) {
        if (!this.mealPlan) {
            this.showError('Kein Ernährungsplan verfügbar. Bitte generiere zuerst einen Plan.');
            return;
        }

        const events = this.createCalendarEvents();
        
        switch (platform) {
            case 'apple':
                this.downloadICS(events, 'Ernaehrungsplan.ics');
                break;
            case 'google':
                this.openGoogleCalendar(events);
                break;
            case 'ics':
                this.downloadICS(events, 'Ernaehrungsplan.ics');
                break;
        }
    }

    createCalendarEvents() {
        const events = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Start on Monday

        Object.entries(this.mealPlan.weekPlan).forEach(([day, meals], dayIndex) => {
            meals.forEach((meal, mealIndex) => {
                const eventDate = new Date(startDate);
                eventDate.setDate(startDate.getDate() + dayIndex);
                
                // Set meal times
                const mealTimes = {
                    'Frühstück': 8,
                    'Mittagessen': 13,
                    'Abendessen': 19,
                    'Snack': 15,
                    'Abend-Snack': 21
                };

                const hour = mealTimes[meal.type] || 12;
                eventDate.setHours(hour, 0, 0, 0);

                const event = {
                    title: `${meal.name} - ${meal.type}`,
                    description: `${meal.description}\n\nZutaten:\n${meal.ingredients.join(', ')}\n\nZubereitung:\n${meal.instructions}`,
                    start: eventDate,
                    end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
                    location: 'Küche'
                };

                events.push(event);
            });
        });

        return events;
    }

    downloadICS(events, filename) {
        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nutrition Planner//EN\n';

        events.forEach(event => {
            icsContent += 'BEGIN:VEVENT\n';
            icsContent += `DTSTART:${this.formatDateForICS(event.start)}\n`;
            icsContent += `DTEND:${this.formatDateForICS(event.end)}\n`;
            icsContent += `SUMMARY:${event.title}\n`;
            icsContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
            icsContent += `LOCATION:${event.location}\n`;
            icsContent += 'END:VEVENT\n';
        });

        icsContent += 'END:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Kalender-Datei wurde heruntergeladen!');
    }

    openGoogleCalendar(events) {
        // For Google Calendar, we'll create a URL that opens the calendar with the first event
        // In a real implementation, you'd use the Google Calendar API
        const firstEvent = events[0];
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(firstEvent.title)}&dates=${this.formatDateForGoogle(firstEvent.start)}/${this.formatDateForGoogle(firstEvent.end)}&details=${encodeURIComponent(firstEvent.description)}`;
        
        window.open(googleUrl, '_blank');
        this.showSuccess('Google Calendar wird geöffnet...');
    }

    formatDateForICS(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    formatDateForGoogle(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    exportShoppingList() {
        if (!this.mealPlan) {
            this.showError('Kein Ernährungsplan verfügbar.');
            return;
        }

        const ingredients = new Set();
        
        Object.values(this.mealPlan.weekPlan).forEach(dayMeals => {
            dayMeals.forEach(meal => {
                meal.ingredients.forEach(ingredient => {
                    ingredients.add(ingredient);
                });
            });
        });

        const shoppingList = Array.from(ingredients).sort();
        const listText = `Einkaufsliste für Ernährungsplan:\n\n${shoppingList.map(item => `☐ ${item}`).join('\n')}`;

        const blob = new Blob([listText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Einkaufsliste.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Einkaufsliste wurde heruntergeladen!');
    }

    showError(message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        // Create and show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if nutrition planner section exists
    if (document.getElementById('nutrition-planner')) {
        window.nutritionPlanner = new NutritionPlanner();
        console.log('✅ Nutrition Planner loaded successfully');
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NutritionPlanner;
}
