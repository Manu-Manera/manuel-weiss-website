/**
 * Requirements Priority UI
 * Drag & Drop Interface für Anforderungspriorisierung
 */

class RequirementsPriorityUI {
    constructor() {
        this.requirements = [];
        this.isDragging = false;
        this.draggedElement = null;
        this.init();
    }
    
    init() {
        console.log('🎯 Requirements Priority UI initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Global event listeners for drag and drop
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }
    
    displayRequirements(requirements) {
        this.requirements = requirements;
        this.renderRequirementsList();
        this.renderPriorityScale();
        this.renderCategoryFilter();
    }
    
    renderRequirementsList() {
        const container = document.getElementById('requirementsList');
        if (!container) return;
        
        // Sort by priority (highest first)
        const sortedRequirements = [...this.requirements].sort((a, b) => b.priority - a.priority);
        
        container.innerHTML = `
            <div class="requirements-header">
                <h4>📋 Anforderungen (${this.requirements.length})</h4>
                <div class="requirements-actions">
                    <button class="btn-add-requirement" onclick="requirementsPriorityUI.showAddRequirementModal()">
                        <i class="fas fa-plus"></i> Anforderung hinzufügen
                    </button>
                    <button class="btn-reset-order" onclick="requirementsPriorityUI.resetToOriginalOrder()">
                        <i class="fas fa-undo"></i> Originalreihenfolge
                    </button>
                </div>
            </div>
            <div class="requirements-container" id="requirementsContainer">
                ${sortedRequirements.map(req => this.renderRequirementCard(req)).join('')}
            </div>
        `;
        
        this.initializeDragAndDrop();
    }
    
    renderRequirementCard(requirement) {
        const priorityColor = this.getPriorityColor(requirement.priority);
        const categoryIcon = this.getCategoryIcon(requirement.category);
        
        return `
            <div class="requirement-card" 
                 draggable="true" 
                 data-id="${requirement.id}"
                 data-priority="${requirement.priority}">
                <div class="requirement-header">
                    <div class="requirement-priority">
                        <span class="priority-badge" style="background: ${priorityColor}">
                            ${requirement.priority}
                        </span>
                        <span class="priority-label">Priorität</span>
                    </div>
                    <div class="requirement-actions">
                        <button class="btn-edit" onclick="requirementsPriorityUI.editRequirement('${requirement.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="requirementsPriorityUI.deleteRequirement('${requirement.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="requirement-content">
                    <div class="requirement-text">${requirement.text}</div>
                    <div class="requirement-meta">
                        <span class="requirement-category">
                            <i class="fas ${categoryIcon}"></i>
                            ${requirement.category}
                        </span>
                        ${requirement.experience ? `<span class="requirement-experience">${requirement.experience}</span>` : ''}
                        ${requirement.isRequired ? '<span class="requirement-required">Muss-Qualifikation</span>' : ''}
                    </div>
                    ${requirement.keywords.length > 0 ? `
                        <div class="requirement-keywords">
                            ${requirement.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="requirement-priority-controls">
                    <label>Priorität:</label>
                    <input type="range" 
                           min="1" 
                           max="10" 
                           value="${requirement.priority}"
                           class="priority-slider"
                           onchange="requirementsPriorityUI.updatePriority('${requirement.id}', this.value)">
                    <span class="priority-value">${requirement.priority}/10</span>
                </div>
            </div>
        `;
    }
    
    renderPriorityScale() {
        const container = document.getElementById('priorityScale');
        if (!container) return;
        
        container.innerHTML = `
            <div class="priority-scale">
                <h4>🎯 Prioritätsskala</h4>
                <div class="scale-labels">
                    <span class="scale-label">1 - Nice-to-have</span>
                    <span class="scale-label">5 - Wichtig</span>
                    <span class="scale-label">10 - Kritisch</span>
                </div>
                <div class="scale-visual">
                    <div class="scale-bar">
                        <div class="scale-segment" style="background: #ef4444; width: 20%"></div>
                        <div class="scale-segment" style="background: #f97316; width: 20%"></div>
                        <div class="scale-segment" style="background: #eab308; width: 20%"></div>
                        <div class="scale-segment" style="background: #22c55e; width: 20%"></div>
                        <div class="scale-segment" style="background: #3b82f6; width: 20%"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCategoryFilter() {
        const container = document.getElementById('categoryFilter');
        if (!container) return;
        
        const categories = [...new Set(this.requirements.map(req => req.category))];
        
        container.innerHTML = `
            <div class="category-filter">
                <h4>🏷️ Kategorien</h4>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-category="all">Alle (${this.requirements.length})</button>
                    ${categories.map(category => {
                        const count = this.requirements.filter(req => req.category === category).length;
                        return `<button class="filter-btn" data-category="${category}">${category} (${count})</button>`;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Add filter event listeners
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));
        });
    }
    
    initializeDragAndDrop() {
        const container = document.getElementById('requirementsContainer');
        if (!container) return;
        
        // Add drag and drop classes
        container.classList.add('sortable-container');
        
        // Add visual feedback
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                container.classList.remove('drag-over');
            }
        });
    }
    
    handleDragStart(e) {
        if (!e.target.classList.contains('requirement-card')) return;
        
        this.isDragging = true;
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        
        // Add drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.opacity = '0.5';
        dragImage.style.transform = 'rotate(5deg)';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }
    
    handleDragOver(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const afterElement = this.getDragAfterElement(e.target.closest('.requirements-container'), e.clientY);
        const dragging = document.querySelector('.dragging');
        
        if (afterElement == null) {
            e.target.closest('.requirements-container').appendChild(dragging);
        } else {
            e.target.closest('.requirements-container').insertBefore(dragging, afterElement);
        }
    }
    
    handleDrop(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const container = e.target.closest('.requirements-container');
        if (!container) return;
        
        // Update requirements order
        const newOrder = Array.from(container.children).map(card => card.dataset.id);
        this.reorderRequirements(newOrder);
        
        container.classList.remove('drag-over');
    }
    
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.draggedElement = null;
        e.target.classList.remove('dragging');
        
        // Remove drag over class from all containers
        document.querySelectorAll('.sortable-container').forEach(container => {
            container.classList.remove('drag-over');
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.requirement-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    updatePriority(id, newPriority) {
        const requirement = this.requirements.find(req => req.id === id);
        if (requirement) {
            requirement.priority = parseInt(newPriority);
            requirement.isRequired = newPriority >= 8;
            
            // Update UI
            const card = document.querySelector(`[data-id="${id}"]`);
            if (card) {
                card.dataset.priority = newPriority;
                card.querySelector('.priority-badge').textContent = newPriority;
                card.querySelector('.priority-badge').style.background = this.getPriorityColor(newPriority);
                card.querySelector('.priority-value').textContent = `${newPriority}/10`;
            }
            
            // Re-sort if needed
            this.renderRequirementsList();
        }
    }
    
    editRequirement(id) {
        const requirement = this.requirements.find(req => req.id === id);
        if (!requirement) return;
        
        const newText = prompt('Anforderung bearbeiten:', requirement.text);
        if (newText && newText.trim() !== requirement.text) {
            requirement.text = newText.trim();
            this.renderRequirementsList();
        }
    }
    
    deleteRequirement(id) {
        if (confirm('Anforderung wirklich löschen?')) {
            this.requirements = this.requirements.filter(req => req.id !== id);
            this.renderRequirementsList();
            this.renderCategoryFilter();
        }
    }
    
    showAddRequirementModal() {
        const text = prompt('Neue Anforderung hinzufügen:');
        if (text && text.trim()) {
            const priority = prompt('Priorität (1-10):', '5');
            const category = prompt('Kategorie:', 'Kann-Qualifikation');
            
            if (window.realAIAnalysis) {
                const newReq = window.realAIAnalysis.addCustomRequirement(
                    text.trim(),
                    parseInt(priority) || 5,
                    category || 'Kann-Qualifikation'
                );
                this.requirements = window.realAIAnalysis.requirements;
                this.renderRequirementsList();
                this.renderCategoryFilter();
            }
        }
    }
    
    resetToOriginalOrder() {
        if (window.realAIAnalysis) {
            this.requirements = window.realAIAnalysis.requirements;
            this.renderRequirementsList();
        }
    }
    
    filterByCategory(category) {
        const container = document.getElementById('requirementsContainer');
        if (!container) return;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter requirements
        const cards = container.querySelectorAll('.requirement-card');
        cards.forEach(card => {
            if (category === 'all' || card.querySelector('.requirement-category').textContent.includes(category)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    reorderRequirements(newOrder) {
        if (window.realAIAnalysis) {
            window.realAIAnalysis.reorderRequirements(newOrder);
            this.requirements = window.realAIAnalysis.requirements;
        }
    }
    
    getPriorityColor(priority) {
        if (priority >= 9) return '#ef4444'; // Red
        if (priority >= 7) return '#f97316'; // Orange
        if (priority >= 5) return '#eab308'; // Yellow
        if (priority >= 3) return '#22c55e'; // Green
        return '#3b82f6'; // Blue
    }
    
    getCategoryIcon(category) {
        const icons = {
            'Muss-Qualifikation': 'fa-exclamation-circle',
            'Kann-Qualifikation': 'fa-check-circle',
            'Soft Skills': 'fa-users',
            'Technische Skills': 'fa-cogs',
            'Erfahrung': 'fa-clock',
            'Bildung': 'fa-graduation-cap',
            'Zertifikate': 'fa-certificate'
        };
        return icons[category] || 'fa-tag';
    }
}

// Initialize global instance
window.requirementsPriorityUI = new RequirementsPriorityUI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequirementsPriorityUI;
}
