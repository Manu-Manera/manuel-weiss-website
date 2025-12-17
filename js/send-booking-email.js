/**
 * Wiederverwendbare Funktion zum Senden von Booking-E-Mails
 * Kann von allen Vermietungsseiten verwendet werden
 */

async function sendBookingEmail(formData) {
    try {
        const response = await fetch('/.netlify/functions/send-contact-email', {
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

