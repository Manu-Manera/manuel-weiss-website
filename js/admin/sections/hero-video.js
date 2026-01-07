/**
 * Admin Section: Hero Video
 * Verwaltung des Hero-Videos auf der Startseite
 */

class HeroVideoSection {
    constructor() {
        this.sectionId = 'hero-video';
        this.sectionPath = 'admin/sections/hero-video.html';
    }

    async load() {
        try {
            const response = await fetch(this.sectionPath);
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading hero-video section:', error);
            return '<div class="error">Fehler beim Laden der Hero-Video Sektion</div>';
        }
    }

    async init() {
        // Die Logik ist bereits in der HTML-Datei enthalten
        console.log('Hero Video Section initialized');
    }
}

// Export für AdminApp
if (typeof window !== 'undefined') {
    window.HeroVideoSection = HeroVideoSection;
}

