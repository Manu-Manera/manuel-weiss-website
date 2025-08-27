// Admin Script - Loads modern version
console.log('Redirecting to modern admin script...');

// Ensure modern script is loaded
if (typeof ModernAdminPanel === 'undefined') {
    const script = document.createElement('script');
    script.src = 'admin-script-modern.js';
    document.head.appendChild(script);
}
