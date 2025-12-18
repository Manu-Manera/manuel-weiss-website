/**
 * Wiederverwendbare Funktion zum Senden von Booking-E-Mails
 * Reines API-First Setup über AWS (API Gateway + Lambda + SES)
 * Keine Netlify Function mehr im Einsatz.
 */

async function sendBookingEmail(formData) {
    const apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || '';

    if (!apiBaseUrl) {
        console.error('❌ AWS API Base URL nicht konfiguriert (window.AWS_CONFIG.apiBaseUrl fehlt)');
        throw new Error('Server-Konfiguration für den Mailversand fehlt (AWS API Base URL).');
    }

    try {
        const response = await fetch(`${apiBaseUrl}/contact/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        let result = {};
        try {
            result = await response.json();
        } catch {
            // Falls keine gültige JSON-Antwort kommt
            console.warn('⚠️ Antwort vom Server war kein gültiges JSON.');
        }

        if (response.ok && result.success) {
            console.log('✅ Booking-E-Mail erfolgreich über AWS gesendet:', result);
            return {
                success: true,
                messageId: result.messageId,
                message: 'E-Mail erfolgreich gesendet'
            };
        }

        const errorMessage =
            result.error ||
            `Fehler beim Senden der E-Mail (HTTP ${response.status})`;

        console.error('❌ Fehler-Antwort von AWS Contact API:', {
            status: response.status,
            statusText: response.statusText,
            body: result
        });

        throw new Error(errorMessage);
    } catch (error) {
        console.error('❌ Fehler beim Aufruf der AWS Contact API:', error);
        throw error;
    }
}

// Globale Funktion für alle Seiten
window.sendBookingEmail = sendBookingEmail;

