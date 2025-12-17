/**
 * Wiederverwendbare Funktion zum Senden von Booking-E-Mails
 * API-First mit AWS Lambda (kein Netlify mehr)
 * Kann von allen Vermietungsseiten verwendet werden
 */

async function sendBookingEmail(formData) {
    try {
        // Verwende AWS API (wie Rental Images API)
        const apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || '';
        
        if (!apiBaseUrl) {
            throw new Error('AWS API Base URL nicht konfiguriert');
        }
        
        const response = await fetch(`${apiBaseUrl}/contact/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            return {
                success: true,
                messageId: result.messageId,
                message: 'E-Mail erfolgreich gesendet'
            };
        } else {
            throw new Error(result.error || 'Fehler beim Senden der E-Mail');
        }
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        throw error;
    }
}

// Globale Funktion für alle Seiten
window.sendBookingEmail = sendBookingEmail;

