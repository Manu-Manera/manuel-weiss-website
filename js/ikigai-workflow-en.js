// Ikigai Workflow - English Version
// Complete English implementation of the Ikigai workflow

class IkigaiWorkflowEN {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.workflowData = {
            whatYouLove: [],
            whatYouGoodAt: [],
            whatWorldNeeds: [],
            whatYouPaidFor: [],
            ikigai: null
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Ikigai Workflow (English)...');
        this.createWorkflowInterface();
        this.loadStep(1);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        // Setup initial event listeners for navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        console.log('🔍 Previous button found:', !!prevBtn);
        console.log('🔍 Next button found:', !!nextBtn);
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('👈 Previous button clicked!');
                this.previousStep();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('👉 Next button clicked!');
                this.nextStep();
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }
    
    createWorkflowInterface() {
        // Create main workflow container
        const container = document.createElement('div');
        container.id = 'ikigai-workflow-en';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        container.innerHTML = `
            <div style="background: white; width: 90%; max-width: 800px; height: 90%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; position: relative;">
                    <h2 style="margin: 0; font-size: 1.8rem;">🎯 Ikigai - Find Your Life Purpose</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Discover what you love, what you're good at, what you can be paid for, and what the world needs</p>
                    <button onclick="window.ikigaiWorkflowEN.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #f8fafc; padding: 1rem 2rem; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: #374151;">Step <span id="current-step">1</span> of <span id="total-steps">5</span></span>
                        <span style="color: #6b7280;" id="step-title">What You Love</span>
                    </div>
                    <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="progress-bar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: 20%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Content -->
                <div id="ikigai-content" style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <!-- Step content will be loaded here -->
                </div>
                
                <!-- Navigation -->
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <button id="prev-btn" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none;">
                        ← Previous
                    </button>
                    <div style="flex: 1;"></div>
                    <button id="next-btn" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Next →
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    loadStep(step) {
        console.log('📄 loadStep() called with step:', step);
        this.currentStep = step;
        console.log('📊 Updating progress...');
        this.updateProgress();
        
        const content = document.getElementById('ikigai-content');
        console.log('🔍 Content element found:', !!content);
        if (!content) {
            console.error('❌ Content element not found!');
            return;
        }
        
        let stepContent = '';
        
        switch(step) {
            case 1:
                console.log('📝 Generating step 1 content...');
                stepContent = this.generateStep1();
                break;
            case 2:
                console.log('📝 Generating step 2 content...');
                stepContent = this.generateStep2();
                break;
            case 3:
                console.log('📝 Generating step 3 content...');
                stepContent = this.generateStep3();
                break;
            case 4:
                console.log('📝 Generating step 4 content...');
                stepContent = this.generateStep4();
                break;
            case 5:
                console.log('📝 Generating step 5 content...');
                stepContent = this.generateStep5();
                break;
        }
        
        console.log('💾 Setting content HTML...');
        content.innerHTML = stepContent;
        console.log('🔄 Updating navigation...');
        this.updateNavigation();
        console.log('✅ loadStep() complete');
    }
    
    generateStep1() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Step 1: What You Love</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Think about the things that truly bring you joy and fulfillment</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">What activities do you love doing?</label>
                <textarea id="what-you-love" placeholder="e.g., reading, hiking, cooking, helping others, creating art..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">💡 Tips for reflection:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    <li>What activities make you lose track of time?</li>
                    <li>What would you do even if you weren't paid for it?</li>
                    <li>What brings you the most joy and satisfaction?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep2() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Step 2: What You're Good At</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Identify your strengths, skills, and natural talents</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">What are your skills and talents?</label>
                <textarea id="what-you-good-at" placeholder="e.g., problem-solving, communication, technical skills, leadership, creativity..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4 style="color: #14532d; margin: 0 0 0.5rem 0;">💡 Tips for reflection:</h4>
                <ul style="color: #14532d; margin: 0; padding-left: 1.5rem;">
                    <li>What do others often ask you for help with?</li>
                    <li>What skills have you developed over time?</li>
                    <li>What comes naturally to you?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep3() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Step 3: What the World Needs</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Consider how you can make a positive contribution to the world</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">What problems do you want to solve?</label>
                <textarea id="what-world-needs" placeholder="e.g., environmental protection, education, healthcare, social justice, technology advancement..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">💡 Tips for reflection:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                    <li>What issues in the world concern you most?</li>
                    <li>How do you want to make a difference?</li>
                    <li>What legacy do you want to leave?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep4() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Step 4: What You Can Be Paid For</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Identify your professional opportunities and market value</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">What can you be paid for?</label>
                <textarea id="what-you-paid-for" placeholder="e.g., consulting, teaching, writing, design, management, technical services..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #fdf2f8; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ec4899;">
                <h4 style="color: #831843; margin: 0 0 0.5rem 0;">💡 Tips for reflection:</h4>
                <ul style="color: #831843; margin: 0; padding-left: 1.5rem;">
                    <li>What services or products can you offer?</li>
                    <li>What are people willing to pay for?</li>
                    <li>How can you monetize your skills?</li>
                </ul>
            </div>
        `;
    }
    
    generateStep5() {
        const ikigai = this.calculateIkigai();
        
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Step 5: Your Ikigai</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">The intersection of all four areas - your life purpose</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎯 Your Ikigai</h4>
                <p style="margin: 0; font-size: 1.2rem; line-height: 1.6;">${ikigai}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">What You Love</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-love">-</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">What You're Good At</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-good">-</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">What the World Needs</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-needs">-</p>
                </div>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <h5 style="color: #374151; margin: 0 0 0.5rem 0;">What You Can Be Paid For</h5>
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;" id="summary-paid">-</p>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 1rem 0;">🎉 Congratulations!</h4>
                <p style="color: #0c4a6e; margin: 0;">You've identified your Ikigai - your reason for being. Use this as a guide for your life decisions and career choices.</p>
            </div>
        `;
    }
    
    calculateIkigai() {
        const love = document.getElementById('what-you-love')?.value || '';
        const good = document.getElementById('what-you-good-at')?.value || '';
        const needs = document.getElementById('what-world-needs')?.value || '';
        const paid = document.getElementById('what-you-paid-for')?.value || '';
        
        // Simple AI-like analysis to create a meaningful Ikigai
        const loveWords = love.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        const goodWords = good.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        const needsWords = needs.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        const paidWords = paid.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
        
        // Find common themes
        const allWords = [...loveWords, ...goodWords, ...needsWords, ...paidWords];
        const wordCount = {};
        allWords.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        const commonThemes = Object.entries(wordCount)
            .filter(([word, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);
        
        if (commonThemes.length > 0) {
            return `Your Ikigai is to ${commonThemes.join(', ')} - combining your passion, skills, purpose, and profession.`;
        } else {
            return "Your Ikigai is the unique intersection of your passions, skills, world needs, and professional opportunities. Continue exploring these areas to find your perfect balance.";
        }
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.getElementById('progress-bar');
        const currentStepEl = document.getElementById('current-step');
        const stepTitle = document.getElementById('step-title');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentStepEl) currentStepEl.textContent = this.currentStep;
        
        const titles = [
            'What You Love',
            'What You\'re Good At', 
            'What the World Needs',
            'What You Can Be Paid For',
            'Your Ikigai'
        ];
        
        if (stepTitle) stepTitle.textContent = titles[this.currentStep - 1];
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
            // Remove old event listeners and add new ones
            prevBtn.removeAttribute('onclick');
            prevBtn.addEventListener('click', () => this.previousStep());
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.textContent = 'Finish';
                nextBtn.removeAttribute('onclick');
                nextBtn.addEventListener('click', () => this.finish());
            } else {
                nextBtn.textContent = 'Next →';
                nextBtn.removeAttribute('onclick');
                nextBtn.addEventListener('click', () => this.nextStep());
            }
        }
    }
    
    nextStep() {
        console.log('🚀 nextStep() called, current step:', this.currentStep, 'total steps:', this.totalSteps);
        if (this.currentStep < this.totalSteps) {
            console.log('💾 Saving current step...');
            this.saveCurrentStep();
            console.log('📄 Loading next step:', this.currentStep + 1);
            this.loadStep(this.currentStep + 1);
        } else {
            console.log('🏁 Already at last step!');
        }
    }
    
    previousStep() {
        console.log('🔙 previousStep() called, current step:', this.currentStep);
        if (this.currentStep > 1) {
            console.log('📄 Loading previous step:', this.currentStep - 1);
            this.loadStep(this.currentStep - 1);
        } else {
            console.log('🚫 Already at first step!');
        }
    }
    
    saveCurrentStep() {
        switch(this.currentStep) {
            case 1:
                this.workflowData.whatYouLove = document.getElementById('what-you-love')?.value || '';
                break;
            case 2:
                this.workflowData.whatYouGoodAt = document.getElementById('what-you-good-at')?.value || '';
                break;
            case 3:
                this.workflowData.whatWorldNeeds = document.getElementById('what-world-needs')?.value || '';
                break;
            case 4:
                this.workflowData.whatYouPaidFor = document.getElementById('what-you-paid-for')?.value || '';
                break;
        }
    }
    
    finish() {
        this.saveCurrentStep();
        
        // Update summary in step 5
        const summaryLove = document.getElementById('summary-love');
        const summaryGood = document.getElementById('summary-good');
        const summaryNeeds = document.getElementById('summary-needs');
        const summaryPaid = document.getElementById('summary-paid');
        
        if (summaryLove) summaryLove.textContent = this.workflowData.whatYouLove.substring(0, 100) + '...';
        if (summaryGood) summaryGood.textContent = this.workflowData.whatYouGoodAt.substring(0, 100) + '...';
        if (summaryNeeds) summaryNeeds.textContent = this.workflowData.whatWorldNeeds.substring(0, 100) + '...';
        if (summaryPaid) summaryPaid.textContent = this.workflowData.whatYouPaidFor.substring(0, 100) + '...';
        
        // Save to localStorage
        localStorage.setItem('ikigaiWorkflowEN', JSON.stringify(this.workflowData));
        
        // Show success message
        alert('🎉 Congratulations! Your Ikigai has been saved. Use this as your guide for life decisions.');
        
        // Close workflow
        this.close();
    }
    
    close() {
        const container = document.getElementById('ikigai-workflow-en');
        if (container) {
            container.remove();
        }
    }
}

// Make globally available
window.IkigaiWorkflowEN = IkigaiWorkflowEN;
