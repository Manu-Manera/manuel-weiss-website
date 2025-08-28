// Admin Script - Redirects to modern version
console.log('Loading modern admin script...');

// Check if modern script is already loaded
if (typeof ModernAdminPanel === 'undefined') {
    // Load modern script dynamically
    const script = document.createElement('script');
    script.src = 'admin-script-modern.js';
    script.onload = () => {
        console.log('Modern admin script loaded successfully');
        // Initialize if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (window.adminPanel) {
                    console.log('Admin panel initialized');
                }
            });
        } else {
            if (window.adminPanel) {
                console.log('Admin panel initialized');
            }
        }
    };
    script.onerror = () => {
        console.error('Failed to load modern admin script');
    };
    document.head.appendChild(script);
} else {
    console.log('Modern admin script already loaded');
}
