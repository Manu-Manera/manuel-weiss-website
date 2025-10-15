/**
 * Content Management Section
 * Verwaltung von Services und Website-Inhalten
 */

class ContentSection {
    constructor() {
        this.services = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
    }

    async init() {
        console.log('📝 Content Section: Initializing...');
        this.setupEventListeners();
        await this.loadServices();
        this.renderServices();
    }

    setupEventListeners() {
        // Service hinzufügen
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="create-service"]')) {
                this.createService();
            }
            if (e.target.matches('[data-action="refresh-services"]')) {
                this.loadServices();
            }
            if (e.target.matches('[data-action="sync-services"]')) {
                this.syncWithWebsite();
            }
            if (e.target.matches('[data-action="load-services"]')) {
                this.loadFromWebsite();
            }
        });

        // Search & Filter
        const searchInput = document.querySelector('.search-input');
        const filterSelect = document.querySelector('.filter-select');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderServices();
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderServices();
            });
        }
    }

    async loadServices() {
        try {
            // Lade Services aus localStorage oder API
            const storedServices = localStorage.getItem('website_services');
            if (storedServices) {
                this.services = JSON.parse(storedServices);
            } else {
                // Fallback: Standard Services
                this.services = [
                    {
                        id: 1,
                        name: 'HR-Beratung',
                        category: 'beratung',
                        description: 'Strategische HR-Beratung und Transformation',
                        icon: 'fas fa-users',
                        color: '#6366f1',
                        image: null,
                        active: true
                    },
                    {
                        id: 2,
                        name: 'Projektmanagement',
                        category: 'projekte',
                        description: 'Agile Projektleitung und Prozessoptimierung',
                        icon: 'fas fa-project-diagram',
                        color: '#10b981',
                        image: null,
                        active: true
                    }
                ];
            }
        } catch (error) {
            console.error('❌ Content: Error loading services:', error);
            this.services = [];
        }
    }

    renderServices() {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;

        const filteredServices = this.services.filter(service => {
            const matchesSearch = !this.searchTerm || 
                service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesFilter = this.currentFilter === 'all' || 
                service.category === this.currentFilter;

            return matchesSearch && matchesFilter;
        });

        servicesList.innerHTML = filteredServices.map(service => `
            <div class="service-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid ${service.color};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="color: ${service.color}; margin: 0 0 0.5rem 0;">
                            <i class="${service.icon}"></i> ${service.name}
                        </h4>
                        <p style="color: #666; margin: 0; font-size: 0.9rem;">${service.description}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-small btn-outline" onclick="contentSection.editService(${service.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="contentSection.deleteService(${service.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="badge" style="background: ${service.color}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                        ${service.category}
                    </span>
                    <span style="color: ${service.active ? '#10b981' : '#ef4444'}; font-size: 0.8rem;">
                        ${service.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async createService() {
        const name = document.getElementById('newServiceName').value;
        const category = document.getElementById('newServiceCategory').value;
        const description = document.getElementById('newServiceDescription').value;
        const icon = document.getElementById('newServiceIcon').value;
        const color = document.getElementById('newServiceColor').value;
        const image = document.getElementById('newServiceImage').files[0];

        if (!name || !description) {
            this.showMessage('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }

        const newService = {
            id: Date.now(),
            name,
            category,
            description,
            icon: icon || 'fas fa-cog',
            color,
            image: image ? await this.uploadImage(image) : null,
            active: true,
            createdAt: new Date().toISOString()
        };

        this.services.push(newService);
        await this.saveServices();
        this.renderServices();
        this.clearForm();
        this.showMessage('Service erfolgreich erstellt!', 'success');
    }

    async uploadImage(file) {
        try {
            // Hier würde der Upload-Logic implementiert werden
            // Für jetzt simulieren wir einen Upload
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(`/uploads/services/${file.name}`);
                }, 1000);
            });
        } catch (error) {
            console.error('❌ Content: Error uploading image:', error);
            return null;
        }
    }

    async saveServices() {
        try {
            localStorage.setItem('website_services', JSON.stringify(this.services));
        } catch (error) {
            console.error('❌ Content: Error saving services:', error);
        }
    }

    clearForm() {
        document.getElementById('newServiceName').value = '';
        document.getElementById('newServiceDescription').value = '';
        document.getElementById('newServiceIcon').value = '';
        document.getElementById('newServiceColor').value = '#6366f1';
        document.getElementById('newServiceImage').value = '';
    }

    editService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        // Formular mit Service-Daten füllen
        document.getElementById('newServiceName').value = service.name;
        document.getElementById('newServiceCategory').value = service.category;
        document.getElementById('newServiceDescription').value = service.description;
        document.getElementById('newServiceIcon').value = service.icon;
        document.getElementById('newServiceColor').value = service.color;

        // Service aus Liste entfernen und Formular als Edit-Modus markieren
        this.services = this.services.filter(s => s.id !== serviceId);
        document.querySelector('[data-action="create-service"]').textContent = '🔄 Service aktualisieren';
        document.querySelector('[data-action="create-service"]').setAttribute('data-mode', 'edit');
        document.querySelector('[data-action="create-service"]').setAttribute('data-service-id', serviceId);
    }

    async deleteService(serviceId) {
        if (!confirm('Möchten Sie diesen Service wirklich löschen?')) return;

        this.services = this.services.filter(s => s.id !== serviceId);
        await this.saveServices();
        this.renderServices();
        this.showMessage('Service gelöscht!', 'success');
    }

    async syncWithWebsite() {
        try {
            this.showMessage('Synchronisation mit Website gestartet...', 'info');
            // Hier würde die Website-Synchronisation implementiert
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showMessage('Synchronisation erfolgreich!', 'success');
        } catch (error) {
            console.error('❌ Content: Error syncing with website:', error);
            this.showMessage('Synchronisation fehlgeschlagen', 'error');
        }
    }

    async loadFromWebsite() {
        try {
            this.showMessage('Lade Services von Website...', 'info');
            // Hier würde das Laden von der Website implementiert
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showMessage('Services erfolgreich geladen!', 'success');
        } catch (error) {
            console.error('❌ Content: Error loading from website:', error);
            this.showMessage('Laden fehlgeschlagen', 'error');
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
window.ContentSection = ContentSection;
