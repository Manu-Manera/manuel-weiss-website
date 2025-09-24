/**
 * Globale Navigation Funktionen
 * Stellt sicher, dass showSection überall verfügbar ist
 */

// Globale showSection Funktion für Navigation
window.showSection = function(section) {
    console.log('🔄 Global showSection called:', section);
    
    // Verstecke alle Sektionen
    document.querySelectorAll('.admin-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Zeige die gewünschte Sektion
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log('✅ Section displayed:', section);
    } else {
        console.error('❌ Section not found:', section);
    }
    
    // Update Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${section}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
        console.log('✅ Navigation updated');
    }
};

// Stelle sicher, dass showSection direkt verfügbar ist
document.addEventListener('DOMContentLoaded', function() {
    // Füge Event Listeners zu allen Navigation Items hinzu
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.getAttribute('data-section');
        if (section) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.showSection(section);
            });
        }
    });
    
    console.log('✅ Global navigation initialized');
});
