// 2FA (MFA) Setup und Management für AWS Cognito
// Unterstützt TOTP (Authenticator App) und SMS

class MFASetup {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.cognitoIdentityServiceProvider = authSystem.cognitoIdentityServiceProvider;
        this.clientId = authSystem.clientId;
        this.userPoolId = authSystem.userPoolId;
        this.region = authSystem.region;
    }

    /**
     * Prüfe ob Benutzer 2FA aktiviert hat
     */
    async checkMFAStatus() {
        if (!this.authSystem.isAuthenticated || !this.authSystem.currentUser) {
            return { enabled: false, type: null };
        }

        try {
            const session = this.authSystem.getSession();
            if (!session || !session.accessToken) {
                return { enabled: false, type: null };
            }

            // Prüfe MFA-Präferenzen des Benutzers
            const params = {
                AccessToken: session.accessToken
            };

            const result = await this.cognitoIdentityServiceProvider.getUser(params).promise();
            
            const mfaEnabled = result.PreferredMfaSetting && 
                              result.PreferredMfaSetting !== 'NOMFA';
            
            return {
                enabled: mfaEnabled,
                type: result.PreferredMfaSetting || 'NOMFA',
                availableMfaTypes: result.MFAOptions || []
            };
        } catch (error) {
            console.error('❌ Fehler beim Prüfen des MFA-Status:', error);
            return { enabled: false, type: null, error: error.message };
        }
    }

    /**
     * Starte TOTP-Setup (QR-Code generieren)
     */
    async startTOTPSetup() {
        if (!this.authSystem.isAuthenticated) {
            throw new Error('Benutzer muss angemeldet sein');
        }

        try {
            const session = this.authSystem.getSession();
            if (!session || !session.accessToken) {
                throw new Error('Keine gültige Session');
            }

            console.log('🔐 Starte TOTP-Setup...');

            // Assoziiere Software Token (TOTP)
            const associateParams = {
                AccessToken: session.accessToken
            };

            const associateResult = await this.cognitoIdentityServiceProvider
                .associateSoftwareToken(associateParams)
                .promise();

            const secretCode = associateResult.SecretCode;
            console.log('✅ TOTP Secret erhalten');

            // Generiere QR-Code URL
            const email = this.authSystem.currentUser.email;
            const issuer = 'Manuel Weiss';
            const qrCodeUrl = this.generateQRCodeURL(email, secretCode, issuer);

            return {
                success: true,
                secretCode: secretCode,
                qrCodeUrl: qrCodeUrl,
                manualEntryKey: secretCode
            };
        } catch (error) {
            console.error('❌ Fehler beim TOTP-Setup:', error);
            throw error;
        }
    }

    /**
     * Verifiziere TOTP-Code und aktiviere 2FA
     */
    async verifyAndEnableTOTP(totpCode) {
        if (!this.authSystem.isAuthenticated) {
            throw new Error('Benutzer muss angemeldet sein');
        }

        try {
            const session = this.authSystem.getSession();
            if (!session || !session.accessToken) {
                throw new Error('Keine gültige Session');
            }

            console.log('🔐 Verifiziere TOTP-Code...');

            // Verifiziere Software Token
            const verifyParams = {
                AccessToken: session.accessToken,
                UserCode: totpCode.trim()
            };

            await this.cognitoIdentityServiceProvider
                .verifySoftwareToken(verifyParams)
                .promise();

            console.log('✅ TOTP-Code verifiziert');

            // Setze MFA-Präferenz auf TOTP
            const setMfaParams = {
                AccessToken: session.accessToken,
                SoftwareTokenMfaSettings: {
                    Enabled: true,
                    PreferredMfa: true
                }
            };

            await this.cognitoIdentityServiceProvider
                .setUserMFAPreference(setMfaParams)
                .promise();

            console.log('✅ TOTP 2FA aktiviert');

            return { success: true };
        } catch (error) {
            console.error('❌ Fehler beim Aktivieren von TOTP:', error);
            
            let errorMessage = 'Fehler beim Aktivieren von 2FA. ';
            if (error.code === 'CodeMismatchException') {
                errorMessage += 'Ungültiger Code. Bitte prüfen Sie die Zeit in Ihrer Authenticator-App.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Generiere QR-Code URL für Authenticator Apps
     */
    generateQRCodeURL(email, secret, issuer) {
        // Format: otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}
        const encodedIssuer = encodeURIComponent(issuer);
        const encodedEmail = encodeURIComponent(email);
        return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
    }

    /**
     * Deaktiviere 2FA
     */
    async disableMFA() {
        if (!this.authSystem.isAuthenticated) {
            throw new Error('Benutzer muss angemeldet sein');
        }

        try {
            const session = this.authSystem.getSession();
            if (!session || !session.accessToken) {
                throw new Error('Keine gültige Session');
            }

            console.log('🔐 Deaktiviere 2FA...');

            // Setze MFA-Präferenz auf NOMFA
            const setMfaParams = {
                AccessToken: session.accessToken,
                SoftwareTokenMfaSettings: {
                    Enabled: false,
                    PreferredMfa: false
                }
            };

            await this.cognitoIdentityServiceProvider
                .setUserMFAPreference(setMfaParams)
                .promise();

            console.log('✅ 2FA deaktiviert');

            return { success: true };
        } catch (error) {
            console.error('❌ Fehler beim Deaktivieren von 2FA:', error);
            throw error;
        }
    }

    /**
     * Verifiziere 2FA-Code beim Login
     */
    async verifyMFACode(session, mfaCode, mfaType = 'SOFTWARE_TOKEN_MFA') {
        try {
            console.log('🔐 Verifiziere 2FA-Code...');

            const params = {
                Session: session,
                ClientId: this.clientId,
                ChallengeName: mfaType,
                ChallengeResponses: {
                    SOFTWARE_TOKEN_MFA_CODE: mfaCode.trim(),
                    USERNAME: this.authSystem.currentUser.email
                }
            };

            const result = await this.cognitoIdentityServiceProvider
                .respondToAuthChallenge(params)
                .promise();

            if (result.AuthenticationResult) {
                // MFA erfolgreich verifiziert
                const sessionData = {
                    idToken: result.AuthenticationResult.IdToken,
                    accessToken: result.AuthenticationResult.AccessToken,
                    refreshToken: result.AuthenticationResult.RefreshToken,
                    expiresAt: new Date(Date.now() + result.AuthenticationResult.ExpiresIn * 1000).toISOString()
                };

                return { success: true, session: sessionData };
            } else {
                throw new Error('Ungültige Antwort von Cognito');
            }
        } catch (error) {
            console.error('❌ Fehler bei 2FA-Verifizierung:', error);
            
            let errorMessage = 'Ungültiger 2FA-Code. ';
            if (error.code === 'CodeMismatchException') {
                errorMessage += 'Bitte prüfen Sie die Zeit in Ihrer Authenticator-App.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            return { success: false, error: errorMessage };
        }
    }
}

// Export für globale Verwendung
if (typeof window !== 'undefined') {
    window.MFASetup = MFASetup;
}

