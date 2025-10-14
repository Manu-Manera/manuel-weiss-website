import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Progress,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Text,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Divider,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  FaUpload, 
  FaCheck, 
  FaTimes, 
  FaRetry, 
  FaCloudUpload,
  FaImage,
  FaFile,
  FaSpinner
} from 'react-icons/fa';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'retrying';
  progress: number;
  error?: string;
  retryCount: number;
  url?: string;
  thumbnail?: string;
}

interface StableMediaUploadProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
}

/**
 * Stable Media Upload Component
 * Standard-Pattern: POST /media/presign → Direkt-Upload nach S3 → POST /media/complete
 */
export const StableMediaUpload: React.FC<StableMediaUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 100, // 100MB
  allowedTypes = ['image/*', 'application/pdf', 'video/*'],
  multiple = true
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  /**
   * Datei-Validierung
   */
  const validateFile = (file: File): string | null => {
    // Größe prüfen
    if (file.size > maxSize * 1024 * 1024) {
      return `Datei ist zu groß (max. ${maxSize}MB)`;
    }

    // Typ prüfen
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Dateityp ${file.type} nicht erlaubt`;
    }

    return null;
  };

  /**
   * Dateien hinzufügen
   */
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file, index) => {
      // Max Files prüfen
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximale Anzahl von ${maxFiles} Dateien erreicht`);
        return;
      }

      // Validierung
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        return;
      }

      // Thumbnail generieren für Bilder
      let thumbnail: string | undefined;
      if (file.type.startsWith('image/')) {
        thumbnail = URL.createObjectURL(file);
      }

      newFiles.push({
        id: `${Date.now()}-${index}`,
        file,
        status: 'pending',
        progress: 0,
        retryCount: 0,
        thumbnail
      });
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      onUploadError?.(errors.join(', '));
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  }, [files.length, maxFiles, maxSize, allowedTypes, onUploadError]);

  /**
   * Upload starten
   */
  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        await uploadSingleFile(file, i, pendingFiles.length);
      }

      onUploadComplete?.(files.filter(f => f.status === 'completed'));
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload fehlgeschlagen');
      onUploadError?.('Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Einzelne Datei hochladen
   */
  const uploadSingleFile = async (uploadFile: UploadFile, index: number, total: number) => {
    try {
      // Status auf uploading setzen
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // Schritt 1: Pre-signed URL anfordern
      const presignResponse = await fetch('/api/media/presign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: uploadFile.file.name,
          type: uploadFile.file.type,
          size: uploadFile.file.size,
          userId: await getCurrentUserId()
        })
      });

      if (!presignResponse.ok) {
        throw new Error('Pre-signed URL konnte nicht erstellt werden');
      }

      const { url, fields, key, mediaId } = await presignResponse.json();

      // Schritt 2: Direkt-Upload nach S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', uploadFile.file);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('S3 Upload fehlgeschlagen');
      }

      // Schritt 3: Upload-Status in DB speichern
      const completeResponse = await fetch('/api/media/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mediaId,
          userId: await getCurrentUserId(),
          key,
          filename: uploadFile.file.name,
          type: uploadFile.file.type,
          size: uploadFile.file.size,
          eTag: uploadResponse.headers.get('ETag') || '',
          width: uploadFile.file.type.startsWith('image/') ? 1920 : undefined,
          height: uploadFile.file.type.startsWith('image/') ? 1080 : undefined,
          tags: []
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Upload-Completion fehlgeschlagen');
      }

      const result = await completeResponse.json();

      // Erfolg
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              url: result.media.cdnUrl
            }
          : f
      ));

      // Gesamt-Progress aktualisieren
      const progress = ((index + 1) / total) * 100;
      setUploadProgress(progress);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Fehler-Status setzen
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Upload fehlgeschlagen'
            }
          : f
      ));
    }
  };

  /**
   * Retry für fehlgeschlagene Uploads
   */
  const retryFailedUploads = async () => {
    const failedFiles = files.filter(f => f.status === 'failed');
    if (failedFiles.length === 0) return;

    setFiles(prev => prev.map(f => 
      f.status === 'failed' 
        ? { ...f, status: 'retrying', retryCount: f.retryCount + 1 }
        : f
    ));

    await startUpload();
  };

  /**
   * Datei entfernen
   */
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  /**
   * Alle Dateien entfernen
   */
  const clearAllFiles = () => {
    setFiles([]);
    setError(null);
    setUploadProgress(0);
  };

  /**
   * Auth Token abrufen
   */
  const getAuthToken = async (): Promise<string> => {
    return localStorage.getItem('auth_token') || 'demo-token';
  };

  /**
   * Current User ID abrufen
   */
  const getCurrentUserId = async (): Promise<string> => {
    return localStorage.getItem('user_id') || 'demo-user';
  };

  /**
   * Datei-Status-Badge
   */
  const getStatusBadge = (file: UploadFile) => {
    const statusConfig = {
      pending: { color: 'gray', icon: FaFile },
      uploading: { color: 'blue', icon: FaSpinner },
      completed: { color: 'green', icon: FaCheck },
      failed: { color: 'red', icon: FaTimes },
      retrying: { color: 'orange', icon: FaRetry }
    };

    const config = statusConfig[file.status];
    const Icon = config.icon;

    return (
      <Badge colorScheme={config.color} variant="solid">
        <Icon style={{ marginRight: '4px' }} />
        {file.status === 'uploading' ? `${file.progress}%` : file.status}
      </Badge>
    );
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        border="2px dashed"
        borderColor={error ? 'red.300' : 'gray.300'}
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor="pointer"
        _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <VStack spacing={4}>
          <FaCloudUpload size={48} color="#3182ce" />
          <Text fontSize="lg" fontWeight="semibold">
            Dateien hier ablegen oder klicken zum Auswählen
          </Text>
          <Text fontSize="sm" color="gray.600">
            Max. {maxFiles} Dateien, je {maxSize}MB
          </Text>
          <Text fontSize="xs" color="gray.500">
            Erlaubte Typen: {allowedTypes.join(', ')}
          </Text>
        </VStack>
      </Box>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Error Display */}
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Box mt={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">
              Ausgewählte Dateien ({files.length})
            </Text>
            <HStack>
              <Button size="sm" variant="outline" onClick={clearAllFiles}>
                Alle entfernen
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={startUpload}
                isLoading={isUploading}
                loadingText="Uploading..."
                isDisabled={files.every(f => f.status !== 'pending')}
              >
                Upload starten
              </Button>
            </HStack>
          </Flex>

          <VStack spacing={3} align="stretch">
            {files.map((file) => (
              <Box
                key={file.id}
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg="white"
              >
                <Flex align="center" justify="space-between">
                  <HStack spacing={3}>
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt="Thumbnail"
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <Box
                        w="40px"
                        h="40px"
                        bg="gray.100"
                        borderRadius="md"
                        display="flex"
                        align="center"
                        justify="center"
                      >
                        <FaFile color="#666" />
                      </Box>
                    )}
                    
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" noOfLines={1}>
                        {file.file.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={2}>
                    {getStatusBadge(file)}
                    
                    {file.status === 'failed' && (
                      <Tooltip label="Erneut versuchen">
                        <IconButton
                          size="sm"
                          icon={<FaRetry />}
                          onClick={() => retryFailedUploads()}
                          colorScheme="orange"
                          variant="outline"
                        />
                      </Tooltip>
                    )}
                    
                    <Tooltip label="Entfernen">
                      <IconButton
                        size="sm"
                        icon={<FaTimes />}
                        onClick={() => removeFile(file.id)}
                        colorScheme="red"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <Progress
                    value={file.progress}
                    size="sm"
                    colorScheme="blue"
                    mt={2}
                  />
                )}

                {/* Error Message */}
                {file.status === 'failed' && file.error && (
                  <Text fontSize="sm" color="red.500" mt={2}>
                    {file.error}
                  </Text>
                )}
              </Box>
            ))}
          </VStack>

          {/* Overall Progress */}
          {isUploading && (
            <Box mt={4}>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Gesamtfortschritt: {Math.round(uploadProgress)}%
              </Text>
              <Progress value={uploadProgress} colorScheme="blue" />
            </Box>
          )}
        </Box>
      )}

      {/* Retry Failed Button */}
      {files.some(f => f.status === 'failed') && (
        <Button
          mt={4}
          colorScheme="orange"
          variant="outline"
          onClick={retryFailedUploads}
          leftIcon={<FaRetry />}
        >
          Fehlgeschlagene Uploads wiederholen
        </Button>
      )}
    </Box>
  );
};

export default StableMediaUpload;
