/**
 * 🚀 UNIFIED FILE UPLOAD SYSTEM
 * Zentrale, vereinheitlichte Upload-Funktion für alle Dateitypen
 * 
 * Unterstützt:
 * - Profile Images (JPG, PNG, WebP)
 * - CV Documents (PDF, DOCX)
 * - Certificates (PDF, JPG, PNG)
 * - Portfolio Files (PDF, DOCX, ZIP)
 * - General Documents
 * 
 * Features:
 * - Automatischer Upload nach AWS S3
 * - Progress Tracking
 * - Error Handling
 * - Profile Storage
 * - Status Feedback
 */

(function() {
    'use strict';
    
    // Check if AWS Media is available
    function checkAWSMedia() {
        if (!window.awsMedia) {
            throw new Error('AWS Media nicht verfügbar. Bitte js/aws-app-config.js und js/aws-media.js laden.');
        }
        if (!window.AWS_APP_CONFIG || !window.AWS_APP_CONFIG.MEDIA_API_BASE) {
            throw new Error('AWS_APP_CONFIG.MEDIA_API_BASE nicht konfiguriert.');
        }
        return true;
    }
    
    // Get User ID from various sources
    function getUserId() {
        if (window.realUserAuth && window.realUserAuth.getCurrentUser) {
            const user = window.realUserAuth.getCurrentUser();
            if (user) return user.id || user.username || user.email;
        }
        if (window.applicationsCore && window.applicationsCore.currentUser) {
            return window.applicationsCore.currentUser.id;
        }
        return localStorage.getItem('currentUserId') || 
               localStorage.getItem('user_id') || 
               'anonymous';
    }
    
    // Map document types to AWS file types
    const FILE_TYPE_MAP = {
        'cv': 'cv',
        'lebenslauf': 'cv',
        'certificate': 'certificate',
        'certificates': 'certificate',
        'zeugnis': 'certificate',
        'zeugnisse': 'certificate',
        'portfolio': 'document',
        'document': 'document',
        'dokument': 'document',
        'photo': 'profile',
        'bild': 'profile',
        'image': 'profile',
        'profile': 'profile'
    };
    
    /**
     * Unified File Upload Function
     * @param {File|File[]} files - Single file or array of files
     * @param {Object} options - Upload options
     * @param {string} options.type - File type: 'cv', 'certificate', 'portfolio', 'photo', 'document'
     * @param {Function} options.onProgress - Progress callback (percent)
     * @param {Function} options.onSuccess - Success callback (uploadResult)
     * @param {Function} options.onError - Error callback (error)
     * @returns {Promise} Upload result(s)
     */
    async function uploadFiles(files, options = {}) {
        try {
            checkAWSMedia();
            
            const fileArray = Array.isArray(files) ? files : [files];
            const type = options.type || 'document';
            const awsFileType = FILE_TYPE_MAP[type.toLowerCase()] || 'document';
            const userId = getUserId();
            
            // Validate files
            const validFiles = validateFiles(fileArray, type);
            if (validFiles.length === 0) {
                throw new Error('Keine gültigen Dateien gefunden');
            }
            
            // Upload files
            const uploadPromises = validFiles.map(async (file, index) => {
                try {
                    if (options.onProgress) {
                        options.onProgress((index / validFiles.length) * 100, file.name);
                    }
                    
                    let uploadResult;
                    if (awsFileType === 'profile' || type === 'photo' || type === 'image') {
                        // Use profile image upload
                        uploadResult = await window.awsMedia.uploadProfileImage(file, userId);
                    } else {
                        // Use document upload
                        uploadResult = await window.awsMedia.uploadDocument(file, userId, awsFileType);
                    }
                    
                    // Add file metadata
                    uploadResult.fileName = file.name;
                    uploadResult.fileSize = file.size;
                    uploadResult.fileType = file.type;
                    uploadResult.uploadedAt = new Date().toISOString();
                    
                    // Save to profile
                    saveToProfile(uploadResult, awsFileType, userId);
                    
                    if (options.onProgress) {
                        options.onProgress(((index + 1) / validFiles.length) * 100, file.name);
                    }
                    
                    return uploadResult;
                } catch (error) {
                    console.error(`Upload-Fehler für ${file.name}:`, error);
                    if (options.onError) {
                        options.onError(error, file);
                    }
                    throw error;
                }
            });
            
            const results = await Promise.all(uploadPromises);
            
            // Call success callback
            if (options.onSuccess) {
                if (fileArray.length === 1) {
                    options.onSuccess(results[0]);
                } else {
                    options.onSuccess(results);
                }
            }
            
            return fileArray.length === 1 ? results[0] : results;
            
        } catch (error) {
            console.error('Unified Upload Error:', error);
            if (options.onError) {
                options.onError(error);
            }
            throw error;
        }
    }
    
    /**
     * Validate files
     */
    function validateFiles(files, type) {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = {
            'cv': ['.pdf', '.docx'],
            'certificate': ['.pdf', '.jpg', '.jpeg', '.png'],
            'portfolio': ['.pdf', '.docx', '.zip'],
            'photo': ['.jpg', '.jpeg', '.png', '.webp'],
            'image': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
            'document': ['.pdf', '.docx', '.doc', '.txt']
        };
        
        const allowed = ALLOWED_TYPES[type] || ALLOWED_TYPES['document'];
        
        return files.filter(file => {
            // Check size
            if (file.size > MAX_SIZE) {
                console.warn(`Datei ${file.name} ist zu groß (${(file.size / 1024 / 1024).toFixed(2)}MB, max. 10MB)`);
                return false;
            }
            
            // Check type
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowed.includes(extension)) {
                console.warn(`Datei ${file.name} hat ein nicht unterstütztes Format (${extension})`);
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Save upload result to profile
     */
    function saveToProfile(uploadResult, fileType, userId) {
        const profileKey = `profile_${userId}`;
        const profileData = JSON.parse(localStorage.getItem(profileKey) || '{}');
        
        if (!profileData.documents) {
            profileData.documents = {};
        }
        if (!profileData.documents[fileType]) {
            profileData.documents[fileType] = [];
        }
        
        profileData.documents[fileType].push({
            url: uploadResult.publicUrl,
            key: uploadResult.key,
            fileName: uploadResult.fileName,
            size: uploadResult.fileSize,
            uploadedAt: uploadResult.uploadedAt
        });
        
        localStorage.setItem(profileKey, JSON.stringify(profileData));
        console.log(`✅ ${fileType} gespeichert im Profil:`, uploadResult.publicUrl);
    }
    
    // Export to window
    window.unifiedFileUpload = {
        upload: uploadFiles,
        validate: validateFiles,
        getUserId: getUserId,
        FILE_TYPE_MAP: FILE_TYPE_MAP
    };
    
    console.log('✅ Unified File Upload System initialized');
})();

