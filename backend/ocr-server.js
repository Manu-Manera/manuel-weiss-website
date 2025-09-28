#!/usr/bin/env node

/*
OCR Server für Bewerbungs-Workflow
Implementiert Server-seitige OCR-Erkennung mit Google Cloud Vision und Tesseract.js Fallback
*/

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// OCR Libraries
let visionClient = null;
let Tesseract = null;

// Try to initialize Google Cloud Vision
try {
  const vision = require('@google-cloud/vision');
  visionClient = new vision.ImageAnnotatorClient();
  console.log('✅ Google Vision client initialized');
} catch (e) {
  console.log('⚠️ Google Vision not configured, will use tesseract fallback');
}

// Try to initialize Tesseract
try {
  Tesseract = require('tesseract.js');
  console.log('✅ Tesseract.js initialized');
} catch (e) {
  console.log('❌ Tesseract.js not available');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/tiff',
      'image/bmp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
    }
  }
});

// Cleanup function
function cleanup(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
}

// OCR endpoint
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ 
      error: 'No file uploaded',
      success: false 
    });
  }

  console.log(`🔍 Processing file: ${file.originalname} (${file.mimetype})`);

  try {
    let result = null;

    // Strategy 1: Try to extract embedded text from PDF first
    if (file.mimetype === 'application/pdf') {
      console.log('📄 Attempting PDF text extraction...');
      try {
        const buffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(buffer);
        
        if (pdfData.text && pdfData.text.trim().length > 30) {
          console.log('✅ PDF embedded text extracted successfully');
          cleanup(file.path);
          return res.json({ 
            text: pdfData.text,
            source: 'pdf-embedded-text',
            success: true,
            wordCount: pdfData.text.split(/\s+/).length,
            confidence: 'high'
          });
        }
      } catch (pdfError) {
        console.warn('PDF text extraction failed:', pdfError.message);
      }
    }

    // Strategy 2: Use Google Cloud Vision (if available)
    if (visionClient) {
      console.log('🌐 Attempting Google Cloud Vision OCR...');
      try {
        const [result] = await visionClient.documentTextDetection(file.path);
        const fullTextAnnotation = result.fullTextAnnotation;
        
        if (fullTextAnnotation && fullTextAnnotation.text) {
          console.log('✅ Google Vision OCR successful');
          cleanup(file.path);
          return res.json({ 
            text: fullTextAnnotation.text,
            source: 'google-vision',
            success: true,
            wordCount: fullTextAnnotation.text.split(/\s+/).length,
            confidence: 'high'
          });
        }
      } catch (visionError) {
        console.warn('Google Vision failed:', visionError.message);
      }
    }

    // Strategy 3: Fallback to Tesseract.js
    if (Tesseract) {
      console.log('🔧 Attempting Tesseract.js OCR...');
      try {
        const { data: { text, confidence } } = await Tesseract.recognize(file.path, 'deu+eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        if (text && text.trim().length > 10) {
          console.log('✅ Tesseract OCR successful');
          cleanup(file.path);
          return res.json({ 
            text: text,
            source: 'tesseract-js',
            success: true,
            wordCount: text.split(/\s+/).length,
            confidence: confidence || 'medium'
          });
        }
      } catch (tesseractError) {
        console.error('Tesseract failed:', tesseractError.message);
      }
    }

    // If all methods failed
    cleanup(file.path);
    return res.status(500).json({ 
      error: 'All OCR methods failed',
      success: false,
      details: 'No text could be extracted from the document'
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    cleanup(file.path);
    return res.status(500).json({ 
      error: 'OCR processing failed',
      success: false,
      details: error.message
    });
  }
});

// Batch OCR endpoint for multiple files
app.post('/api/ocr/batch', upload.array('files', 5), async (req, res) => {
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ 
      error: 'No files uploaded',
      success: false 
    });
  }

  console.log(`🔍 Processing ${files.length} files in batch...`);

  const results = [];
  
  for (const file of files) {
    try {
      // Process each file (simplified version of single file processing)
      let text = '';
      let source = 'unknown';
      
      if (file.mimetype === 'application/pdf') {
        try {
          const buffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(buffer);
          if (pdfData.text && pdfData.text.trim().length > 30) {
            text = pdfData.text;
            source = 'pdf-embedded-text';
          }
        } catch (pdfError) {
          console.warn(`PDF extraction failed for ${file.originalname}`);
        }
      }
      
      // If PDF extraction failed or it's an image, try OCR
      if (!text && visionClient) {
        try {
          const [result] = await visionClient.documentTextDetection(file.path);
          if (result.fullTextAnnotation && result.fullTextAnnotation.text) {
            text = result.fullTextAnnotation.text;
            source = 'google-vision';
          }
        } catch (visionError) {
          console.warn(`Vision failed for ${file.originalname}`);
        }
      }
      
      if (!text && Tesseract) {
        try {
          const { data: { text: ocrText } } = await Tesseract.recognize(file.path, 'deu+eng');
          if (ocrText && ocrText.trim().length > 10) {
            text = ocrText;
            source = 'tesseract-js';
          }
        } catch (tesseractError) {
          console.warn(`Tesseract failed for ${file.originalname}`);
        }
      }
      
      results.push({
        filename: file.originalname,
        success: !!text,
        text: text || '',
        source: source,
        wordCount: text ? text.split(/\s+/).length : 0
      });
      
      cleanup(file.path);
      
    } catch (error) {
      console.error(`Error processing ${file.originalname}:`, error);
      results.push({
        filename: file.originalname,
        success: false,
        text: '',
        source: 'error',
        error: error.message,
        wordCount: 0
      });
      cleanup(file.path);
    }
  }

  const successCount = results.filter(r => r.success).length;
  
  res.json({
    success: successCount > 0,
    results: results,
    summary: {
      total: files.length,
      successful: successCount,
      failed: files.length - successCount
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      googleVision: !!visionClient,
      tesseract: !!Tesseract
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    success: false,
    details: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OCR Server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST /api/ocr - Single file OCR`);
  console.log(`   POST /api/ocr/batch - Multiple files OCR`);
  console.log(`   GET /api/health - Health check`);
  console.log(`🔧 Available OCR engines:`);
  console.log(`   Google Cloud Vision: ${visionClient ? '✅' : '❌'}`);
  console.log(`   Tesseract.js: ${Tesseract ? '✅' : '❌'}`);
});

module.exports = app;
