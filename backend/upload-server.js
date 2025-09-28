const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow PDF, DOC, DOCX files
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Nur PDF, DOC und DOCX Dateien sind erlaubt'), false);
        }
    }
});

// Store uploaded files metadata
let uploadedFiles = [];

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Keine Datei hochgeladen' 
            });
        }

        const fileInfo = {
            id: Date.now().toString(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString(),
            userId: req.body.userId || 'anonymous',
            type: req.body.type || 'document'
        };

        // Store file info
        uploadedFiles.push(fileInfo);

        console.log('✅ File uploaded successfully:', fileInfo);

        res.json({
            success: true,
            id: fileInfo.id,
            name: fileInfo.originalName,
            size: fileInfo.size,
            type: fileInfo.mimetype,
            uploadedAt: fileInfo.uploadedAt,
            url: `/api/download/${fileInfo.id}`
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Download endpoint
app.get('/api/download/:id', (req, res) => {
    try {
        const fileId = req.params.id;
        const fileInfo = uploadedFiles.find(f => f.id === fileId);
        
        if (!fileInfo) {
            return res.status(404).json({ 
                success: false, 
                error: 'Datei nicht gefunden' 
            });
        }

        if (!fs.existsSync(fileInfo.path)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Datei existiert nicht mehr' 
            });
        }

        res.download(fileInfo.path, fileInfo.originalName);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// List files endpoint
app.get('/api/files', (req, res) => {
    try {
        const userId = req.query.userId || 'anonymous';
        const userFiles = uploadedFiles.filter(f => f.userId === userId);
        
        res.json({
            success: true,
            files: userFiles.map(f => ({
                id: f.id,
                name: f.originalName,
                size: f.size,
                type: f.mimetype,
                uploadedAt: f.uploadedAt,
                url: `/api/download/${f.id}`
            }))
        });
        
    } catch (error) {
        console.error('❌ List files error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Delete file endpoint
app.delete('/api/files/:id', (req, res) => {
    try {
        const fileId = req.params.id;
        const fileIndex = uploadedFiles.findIndex(f => f.id === fileId);
        
        if (fileIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                error: 'Datei nicht gefunden' 
            });
        }

        const fileInfo = uploadedFiles[fileIndex];
        
        // Delete physical file
        if (fs.existsSync(fileInfo.path)) {
            fs.unlinkSync(fileInfo.path);
        }
        
        // Remove from array
        uploadedFiles.splice(fileIndex, 1);
        
        res.json({
            success: true,
            message: 'Datei erfolgreich gelöscht'
        });
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Upload Server läuft',
        timestamp: new Date().toISOString(),
        filesCount: uploadedFiles.length
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
        success: false, 
        error: error.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Upload Server läuft auf Port ${PORT}`);
    console.log(`📁 Uploads werden gespeichert in: ${uploadsDir}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
});

module.exports = app;
