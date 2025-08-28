// Simple Admin Script for testing
console.log('Admin script loaded');

// Basic functionality
window.adminPanel = {
    showSection: function(section) {
        console.log('Showing section:', section);
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        // Show target section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    },
    
    createNewContent: function() {
        alert('Neuer Inhalt wird erstellt...');
    },
    
    exportContent: function() {
        alert('Content wird exportiert...');
    },
    
    openMediaUpload: function() {
        alert('Medien-Upload wird geöffnet...');
    },
    
    createFolder: function() {
        alert('Ordner wird erstellt...');
    },
    
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    saveContent: function() {
        alert('Content wird gespeichert...');
        this.closeModal('contentModal');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initialized');
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 300);
    }
    
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            adminPanel.showSection(section);
        });
    });
    
    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
});
