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
        
        this.init();
    }

    async init() {
        try {
            // Wait for AWS SDK to be loaded
            if (typeof AWS === 'undefined') {
                console.log('⏳ Waiting for AWS SDK...');
                setTimeout(() => this.init(), 100);
                return;
            }

            // Initialize DynamoDB
            this.dynamoDB = new AWS.DynamoDB.DocumentClient({
                region: this.region,
                credentials: AWS.config.credentials
            });

            // Initialize S3
            this.s3 = new AWS.S3({
                region: this.region,
                credentials: AWS.config.credentials
            });

            this.isInitialized = true;
            console.log('✅ AWS Profile API initialized');
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
     * Save user profile data to DynamoDB
     */
    async saveProfile(profileData) {
        if (!this.isInitialized) {
            await this.waitForInit();
        }

        try {
            console.log('💾 Saving profile to AWS DynamoDB...');
            
            // Wenn userId explizit in profileData angegeben ist (z.B. 'admin'), verwende diesen
            // Ansonsten hole userId aus Auth-Credentials
            let userId, idToken;
            if (profileData.userId && (profileData.userId === 'admin' || profileData.userId === 'owner')) {
                // Admin-Konfiguration - verwende explizite userId
                userId = profileData.userId;
                // Für Admin-Konfigurationen brauchen wir möglicherweise keinen Token
                idToken = null;
            } else {
                // Normale User-Profile - hole aus Auth
                const credentials = await this.getAuthCredentials();
                userId = credentials.userId;
                idToken = credentials.idToken;
            }
            
            // Prepare item for DynamoDB
            const item = {
                userId: userId,
                ...profileData,
                updatedAt: new Date().toISOString()
            };

            // Remove only undefined values (keep empty strings to preserve user data)
            Object.keys(item).forEach(key => {
                if (item[key] === undefined) {
                    delete item[key];
                }
            });

            // Use API Gateway endpoint if available
            if (window.AWS_CONFIG?.apiBaseUrl) {
                try {
                    const headers = {
                        'Content-Type': 'application/json'
                    };
                    
                    // Nur Authorization Header hinzufügen, wenn idToken vorhanden ist
                    if (idToken) {
                        headers['Authorization'] = `Bearer ${idToken}`;
                    }
                    
                    // Use PUT for updates (POST is also supported for backward compatibility)
                    const response = await fetch(`${window.AWS_CONFIG.apiBaseUrl}/profile`, {
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
                    console.log('✅ Profile saved successfully via API');
                    return result;
                } catch (apiError) {
                    console.warn('⚠️ API save failed, falling back to DynamoDB:', apiError.message);
                }
            }

            // Direct DynamoDB call (requires proper IAM permissions)
            return await this.saveProfileDirect(item);

        } catch (error) {
            console.error('❌ Failed to save profile:', error);
            throw error;
        }
    }

    async saveProfileDirect(item) {
        const params = {
            TableName: this.tableName,
            Item: item
        };

        await this.dynamoDB.put(params).promise();
        console.log('✅ Profile saved successfully to DynamoDB (direct fallback)');
        return item;
    }

    /**
     * Load user profile data from DynamoDB
     */
    async loadProfile(userIdOverride = null) {
        if (!this.isInitialized) {
            await this.waitForInit();
        }

        try {
            console.log('📥 Loading profile from AWS DynamoDB...');
            
            // Wenn userIdOverride angegeben ist (z.B. 'admin'), verwende diesen
            // Ansonsten hole userId aus Auth-Credentials
            let userId, idToken;
            if (userIdOverride && (userIdOverride === 'admin' || userIdOverride === 'owner')) {
                userId = userIdOverride;
                idToken = null; // Für Admin-Konfigurationen brauchen wir möglicherweise keinen Token
            } else {
                const credentials = await this.getAuthCredentials();
                userId = credentials.userId;
                idToken = credentials.idToken;
            }

            // Use API Gateway endpoint if available
            if (window.AWS_CONFIG?.apiBaseUrl) {
                try {
                    const headers = {};
                    
                    // Nur Authorization Header hinzufügen, wenn idToken vorhanden ist
                    if (idToken) {
                        headers['Authorization'] = `Bearer ${idToken}`;
                    }
                    
                    // Wenn userIdOverride angegeben ist, als Query-Parameter hinzufügen
                    const url = userIdOverride 
                        ? `${window.AWS_CONFIG.apiBaseUrl}/profile?userId=${userIdOverride}`
                        : `${window.AWS_CONFIG.apiBaseUrl}/profile`;
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: headers
                    });

                    if (!response.ok) {
                        if (response.status === 404) {
                            console.log('ℹ️ No profile found, returning empty data');
                            return null;
                        }
                        throw new Error(`API Error: ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('✅ Profile loaded successfully from API');
                    return result;
                } catch (apiError) {
                    console.warn('⚠️ API load failed, falling back to DynamoDB:', apiError.message);
                }
            }

            const directProfile = await this.loadProfileDirect(userId);
            if (directProfile) {
                console.log('✅ Profile loaded successfully from DynamoDB (fallback)');
            } else {
                console.log('ℹ️ No profile found in DynamoDB fallback');
            }
            return directProfile;

        } catch (error) {
            console.error('❌ Failed to load profile:', error);
            // Return null instead of throwing to allow graceful degradation
            return null;
        }
    }

    async loadProfileDirect(userId) {
        const params = {
            TableName: this.tableName,
            Key: {
                userId: userId
            }
        };

        const result = await this.dynamoDB.get(params).promise();
        return result.Item || null;
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
