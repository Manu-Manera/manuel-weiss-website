/**
 * AWS Profile API Integration
 * Handles user profile data storage and retrieval with AWS DynamoDB
 */

class AWSProfileAPI {
    constructor() {
        this.isInitialized = false;
        this.tableName = 'mawps-user-profiles';
        this.bucketName = 'mawps-profile-images';
        this.region = 'eu-central-1';
        this.dynamoDB = null;
        this.s3 = null;
        
        // Verwende zentrale API-Konfiguration
        this.netlifyFunctionUrl = window.getApiUrl ? window.getApiUrl('USER_DATA') : '/.netlify/functions/user-data';
        
        this.init();
    }

    async init() {
        try {
            // WICHTIG: Wir verwenden PRIMÄR die Netlify Function
            // AWS API Gateway ist wegen Sicherheitseinschränkungen nicht verfügbar
            
            // Netlify Function ist immer verfügbar
            this.isInitialized = true;
            console.log('✅ AWS Profile API initialized (Netlify Function mode)');
            console.log('🌐 Using Netlify Function:', this.netlifyFunctionUrl);
            
            // AWS API Gateway als Fallback (falls AWS die Einschränkungen aufhebt)
            if (window.AWS_CONFIG?.apiBaseUrl) {
                this.apiBaseUrl = window.AWS_CONFIG.apiBaseUrl;
                console.log('ℹ️ AWS API Gateway available as fallback:', this.apiBaseUrl);
            }
        } catch (error) {
            console.error('❌ AWS Profile API initialization failed:', error);
        }
    }

    /**
     * Get authentication credentials for API calls
     */
    async getAuthCredentials() {
        // Check if user is authenticated
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
            throw new Error('User not authenticated');
        }

        // Get current session
        const sessionStr = localStorage.getItem('aws_auth_session');
        if (!sessionStr) {
            throw new Error('No valid session found');
        }

        const session = JSON.parse(sessionStr);
        return {
            userId: window.realUserAuth.getCurrentUser()?.id,
            idToken: session.idToken,
            accessToken: session.accessToken
        };
    }

    /**
     * Save user profile data to DynamoDB via Netlify Function
     */
    async saveProfile(profileData) {
        if (!this.isInitialized) {
            await this.waitForInit();
        }

        try {
            console.log('💾 Saving profile via Netlify Function...');
            
            // Hole Auth-Credentials
            const credentials = await this.getAuthCredentials();
            const { idToken } = credentials;
            
            // Prepare profile data
            const item = {
                ...profileData,
                updatedAt: new Date().toISOString()
            };

            // Remove only undefined values (keep empty strings to preserve user data)
            Object.keys(item).forEach(key => {
                if (item[key] === undefined) {
                    delete item[key];
                }
            });
            
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            };
            
            console.log('📤 Sending profile to Netlify Function:', this.netlifyFunctionUrl + '/profile');
            
            // Use PUT for updates - Netlify Function
            const response = await fetch(`${this.netlifyFunctionUrl}/profile`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (e) {
                    // ignore JSON parse error
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Profile saved successfully via Netlify Function');
            return result;

        } catch (error) {
            console.error('❌ Failed to save profile:', error);
            throw error;
        }
    }

    // DEPRECATED: Direkte DynamoDB-Methode - nicht mehr verwendet
    // Alle Operationen laufen über API Gateway
    async saveProfileDirect(item) {
        console.warn('⚠️ saveProfileDirect ist deprecated - verwende API Gateway');
        throw new Error('Direkte DynamoDB-Verbindung nicht unterstützt. Verwende API Gateway.');
    }

    /**
     * Load user profile data from DynamoDB via Netlify Function
     */
    async loadProfile(userIdOverride = null) {
        if (!this.isInitialized) {
            await this.waitForInit();
        }

        try {
            console.log('📥 Loading profile via Netlify Function...');
            
            // Hole Auth-Credentials
            const credentials = await this.getAuthCredentials();
            const { idToken } = credentials;
            
            const headers = {
                'Authorization': `Bearer ${idToken}`
            };
            
            const url = `${this.netlifyFunctionUrl}/profile`;
            
            console.log('📥 Loading profile from Netlify Function:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('ℹ️ No profile found, returning empty data');
                    return null;
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Profile loaded successfully via Netlify Function');
            return result;

        } catch (error) {
            console.error('❌ Failed to load profile:', error);
            // Return null instead of throwing to allow graceful degradation
            return null;
        }
    }

    // DEPRECATED: Direkte DynamoDB-Methode - nicht mehr verwendet
    // Alle Operationen laufen über API Gateway
    async loadProfileDirect(userId) {
        console.warn('⚠️ loadProfileDirect ist deprecated - verwende API Gateway');
        return null;
    }

    /**
     * Upload profile image to S3
     */
    async uploadProfileImage(file) {
        if (!this.isInitialized) {
            await this.waitForInit();
        }

        try {
            console.log('📤 Uploading profile image to AWS S3...');
            
            const { userId, idToken } = await this.getAuthCredentials();
            
            // Generate unique filename
            const fileExtension = file.name.split('.').pop();
            const fileName = `profile-images/${userId}/avatar.${fileExtension}`;

            // Use presigned URL approach if API is available
            if (window.AWS_CONFIG?.apiBaseUrl) {
                // Get presigned URL from API
                console.log('📡 Requesting presigned URL from API...');
                const presignResponse = await fetch(`${window.AWS_CONFIG.apiBaseUrl}/profile/upload-url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        fileName: fileName,
                        fileType: file.type
                    })
                });

                if (!presignResponse.ok) {
                    let errorMessage = `Failed to get upload URL: ${presignResponse.status} ${presignResponse.statusText}`;
                    try {
                        const errorData = await presignResponse.json();
                        errorMessage = errorData.error || errorData.message || errorMessage;
                    } catch (e) {
                        // Ignore JSON parse error
                    }
                    console.error('❌ Presigned URL request failed:', errorMessage);
                    throw new Error(errorMessage);
                }

                const presignData = await presignResponse.json();
                const { uploadUrl, imageUrl } = presignData;
                
                if (!uploadUrl || !imageUrl) {
                    throw new Error('Invalid response from presigned URL API');
                }

                console.log('📤 Uploading file to S3...', { uploadUrl: uploadUrl.substring(0, 50) + '...' });

                // Upload directly to S3 using presigned URL
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type
                    }
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error('❌ S3 upload failed:', uploadResponse.status, errorText);
                    throw new Error(`Failed to upload image to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
                }

                console.log('✅ Profile image uploaded successfully to S3');
                return imageUrl;
            } else {
                // Direct S3 upload (requires proper IAM permissions)
                const params = {
                    Bucket: this.bucketName,
                    Key: fileName,
                    Body: file,
                    ContentType: file.type,
                    ACL: 'public-read'
                };

                const result = await this.s3.upload(params).promise();
                console.log('✅ Profile image uploaded successfully to S3');
                return result.Location;
            }
        } catch (error) {
            console.error('❌ Failed to upload profile image:', error);
            throw error;
        }
    }

    /**
     * Delete profile image from S3
     */
    async deleteProfileImage(imageUrl) {
        if (!this.isInitialized) {
            await this.waitForInit();
        }

        try {
            console.log('🗑️ Deleting profile image from AWS S3...');
            
            const { userId, idToken } = await this.getAuthCredentials();
            
            if (window.AWS_CONFIG?.apiBaseUrl) {
                const response = await fetch(`${window.AWS_CONFIG.apiBaseUrl}/profile/image`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete image');
                }

                console.log('✅ Profile image deleted successfully');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to delete profile image:', error);
            throw error;
        }
    }

    /**
     * Wait for initialization
     */
    async waitForInit() {
        let attempts = 0;
        while (!this.isInitialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!this.isInitialized) {
            throw new Error('AWS Profile API failed to initialize');
        }
    }

    /**
     * Sync local data with AWS (for migration)
     */
    async syncLocalToAWS() {
        try {
            console.log('🔄 Syncing local profile data to AWS...');
            
            // Get local data
            const localData = localStorage.getItem('userProfile');
            if (!localData) {
                console.log('ℹ️ No local data to sync');
                return;
            }

            const profileData = JSON.parse(localData);
            
            // Save to AWS
            await this.saveProfile(profileData);
            
            console.log('✅ Local data synced to AWS successfully');
        } catch (error) {
            console.error('❌ Failed to sync local data to AWS:', error);
        }
    }
    
    /**
     * Speichert Website-Bilder (für Admin Panel ohne Authentifizierung)
     */
    async saveWebsiteImages(imageData) {
        try {
            console.log('💾 Saving website images to AWS...');
            
            if (!window.AWS_CONFIG?.apiBaseUrl) {
                throw new Error('AWS API not configured');
            }
            
            // Speichere unter speziellem "owner" Account für Website-Bilder
            const response = await fetch(`${window.AWS_CONFIG.apiBaseUrl}/website-images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'owner',
                    profileImageDefault: imageData.profileImageDefault || null,
                    profileImageHover: imageData.profileImageHover || null,
                    updatedAt: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error (${response.status}): ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Website images saved to AWS:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to save website images:', error);
            throw error;
        }
    }
    
    /**
     * Lädt Website-Bilder aus AWS
     */
    async loadWebsiteImages() {
        try {
            console.log('📥 Loading website images from AWS...');
            console.log('🌐 Current domain:', window.location.hostname);
            
            // Fallback: Verwende AWS_APP_CONFIG.MEDIA_API_BASE falls AWS_CONFIG nicht verfügbar
            const apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || 
                              window.AWS_APP_CONFIG?.MEDIA_API_BASE || 
                              'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
            
            if (!apiBaseUrl) {
                throw new Error('AWS API not configured');
            }
            
            console.log('🔗 Using API Base URL:', apiBaseUrl);
            
            const response = await fetch(`${apiBaseUrl}/website-images/owner`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('ℹ️ No website images found in AWS (using defaults)');
                    return null;
                }
                throw new Error(`API error (${response.status})`);
            }
            
            const result = await response.json();
            console.log('✅ Website images loaded from AWS:', {
                hasDefault: !!result.profileImageDefault,
                hasHover: !!result.profileImageHover
            });
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to load website images:', error);
            return null;
        }
    }
}

// Create global instance - verzögert bis AWS_CONFIG verfügbar ist
(function initAWSProfileAPI() {
    function createInstance() {
        if (window.AWS_CONFIG || window.AWS_APP_CONFIG) {
            window.awsProfileAPI = new AWSProfileAPI();
            console.log('✅ AWS Profile API initialized');
        } else {
            // Retry nach 100ms
            setTimeout(createInstance, 100);
        }
    }
    createInstance();
})();
