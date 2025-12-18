/**
 * Wiederverwendbare Funktion zum Senden von Booking-E-Mails
 * API-First mit AWS Lambda
 * Nutzt bevorzugt die AWS API, fällt bei Fehlern aber sauber auf Netlify zurück,
 * damit das Formular zuverlässig funktioniert, bis die AWS Contact API voll deployed ist.
 */

async function sendBookingEmail(formData) {
    // 1) Primärer Weg: AWS API (API Gateway + Lambda)
    const apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || '';

    // Kleine Hilfsfunktion für den eigentlichen Request
    const callAwsApi = async () => {
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
                message: 'E-Mail erfolgreich gesendet (AWS)'
            };
        } else {
            throw new Error(result.error || `Fehler beim Senden der E-Mail (AWS, Status ${response.status})`);
        }
    };

    // 2) Fallback: bestehende Netlify Function (bis AWS vollständig eingerichtet ist)
    const callNetlify = async () => {
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
                message: 'E-Mail erfolgreich gesendet (Netlify Fallback)'
            };
        } else {
            throw new Error(result.error || `Fehler beim Senden der E-Mail (Netlify, Status ${response.status})`);
        }
    };

    try {
        // Versuche zuerst AWS
        return await callAwsApi();
    } catch (awsError) {
        console.warn('⚠️ AWS Contact API fehlgeschlagen, versuche Netlify Fallback:', awsError);

        try {
            // Fallback auf Netlify, damit der User trotzdem eine Bestätigung bekommt
            return await callNetlify();
        } catch (netlifyError) {
            console.error('❌ Netlify Fallback ebenfalls fehlgeschlagen:', netlifyError);
            // Beide Wege fehlgeschlagen → Fehler nach außen geben
            throw netlifyError;
        }
    }
}

// Globale Funktion für alle Seiten
window.sendBookingEmail = sendBookingEmail;

