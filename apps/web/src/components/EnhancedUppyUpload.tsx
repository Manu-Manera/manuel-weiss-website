import React, { useEffect, useRef, useState } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import AwsS3 from '@uppy/aws-s3';
import ImageEditor from '@uppy/image-editor';
import ProgressBar from '@uppy/progress-bar';
import StatusBar from '@uppy/status-bar';
import ThumbnailGenerator from '@uppy/thumbnail-generator';
import Webcam from '@uppy/webcam';
import ScreenCapture from '@uppy/screen-capture';
import GoldenRetriever from '@uppy/golden-retriever';
import Compressor from '@uppy/compressor';
import XHRUpload from '@uppy/xhr-upload';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/progress-bar/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';

import {
  Box,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { FaUpload, FaCheck, FaTimes, FaRetry, FaCloudUpload } from 'react-icons/fa';

interface EnhancedUppyUploadProps {
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  inline?: boolean;
  showProgressDetails?: boolean;
}

/**
 * Enhanced Uppy Upload Component
 * Mit Progress Tracking, Retry Logic, Compression, Thumbnails
 */
export const EnhancedUppyUpload: React.FC<EnhancedUppyUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  allowedTypes = ['image/*', 'video/*', 'application/pdf'],
  inline = false,
  showProgressDetails = true
}) => {
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0
  });
  const [retryQueue, setRetryQueue] = useState<any[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const dashboardRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  /**
   * Uppy initialisieren
   */
  useEffect(() => {
    const uppyInstance = new Uppy({
      id: 'enhanced-uppy-upload',
      autoProceed: false,
      allowMultipleUploads: true,
      restrictions: {
        maxFileSize: maxSize,
        maxNumberOfFiles: maxFiles,
        allowedFileTypes: allowedTypes,
        minNumberOfFiles: 1
      },
      meta: {
        userId: localStorage.getItem('user_id') || 'demo-user',
        timestamp: new Date().toISOString()
      },
      onBeforeFileAdded: (currentFile, files) => {
        // Zusätzliche Validierung
        if (currentFile.size > maxSize) {
          toast({
            title: 'Datei zu groß',
            description: `Maximale Größe: ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
            status: 'error',
            duration: 3000
          });
          return false;
        }
        return true;
      },
      onBeforeUpload: (data) => {
        console.log('🚀 Upload gestartet:', data);
        setUploadStats(prev => ({ ...prev, total: data.fileIDs.length, inProgress: data.fileIDs.length }));
        return true;
      }
    });

    // AWS S3 Plugin konfigurieren
    uppyInstance.use(AwsS3, {
      getUploadParameters: async (file) => {
        try {
          const response = await fetch('/api/media/presign', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              filename: file.name,
              type: file.type,
              size: file.size,
              userId: localStorage.getItem('user_id') || 'demo-user'
            })
          });

          if (!response.ok) {
            throw new Error('Pre-signed URL konnte nicht erstellt werden');
          }

          const data = await response.json();
          return {
            method: 'POST',
            url: data.url,
            fields: data.fields,
            headers: {}
          };
        } catch (error) {
          console.error('Pre-signed URL Error:', error);
          throw error;
        }
      },
      shouldUseMultipart: (file) => file.size > 100 * 1024 * 1024, // 100MB
      getChunkSize: (file) => Math.min(100 * 1024 * 1024, file.size / 1000), // 100MB chunks
      limit: 3 // Max 3 parallele Uploads
    });

    // Thumbnail Generator
    uppyInstance.use(ThumbnailGenerator, {
      thumbnailWidth: 200,
      thumbnailHeight: 200,
      waitForThumbnailsBeforeUpload: false
    });

    // Image Editor
    uppyInstance.use(ImageEditor, {
      quality: 0.8,
      cropperOptions: {
        aspectRatio: 1,
        croppedCanvasOptions: {
          maxWidth: 1920,
          maxHeight: 1920
        }
      }
    });

    // Compressor für Bilder
    uppyInstance.use(Compressor, {
      quality: 0.8,
      limit: 2 * 1024 * 1024, // 2MB
      initialQuality: 0.8
    });

    // Webcam Support
    uppyInstance.use(Webcam, {
      modes: ['video-only', 'audio-only', 'video-audio'],
      preferredVideoMimeType: 'video/webm;codecs=vp8'
    });

    // Screen Capture
    uppyInstance.use(ScreenCapture, {
      preferredVideoMimeType: 'video/webm;codecs=vp8'
    });

    // Golden Retriever für Offline-Support
    uppyInstance.use(GoldenRetriever, {
      serviceWorker: true
    });

    // Event Listeners
    uppyInstance.on('upload', (data) => {
      console.log('📤 Upload gestartet:', data);
      setUploadStats(prev => ({ ...prev, inProgress: data.fileIDs.length }));
    });

    uppyInstance.on('upload-progress', (file, progress) => {
      console.log(`📊 Progress ${file.name}:`, progress);
    });

    uppyInstance.on('upload-success', (file, response) => {
      console.log('✅ Upload erfolgreich:', file.name);
      setUploadStats(prev => ({ 
        ...prev, 
        completed: prev.completed + 1,
        inProgress: prev.inProgress - 1
      }));

      // Upload completion an Backend senden
      handleUploadCompletion(file, response);
    });

    uppyInstance.on('upload-error', (file, error, response) => {
      console.error('❌ Upload fehlgeschlagen:', file.name, error);
      setUploadStats(prev => ({ 
        ...prev, 
        failed: prev.failed + 1,
        inProgress: prev.inProgress - 1
      }));

      // Retry Queue hinzufügen
      setRetryQueue(prev => [...prev, { file, error, response }]);

      toast({
        title: 'Upload fehlgeschlagen',
        description: `${file.name}: ${error.message}`,
        status: 'error',
        duration: 5000
      });
    });

    uppyInstance.on('complete', (result) => {
      console.log('🎉 Upload komplett:', result);
      onUploadComplete?.(result.successful);
      
      toast({
        title: 'Upload abgeschlossen',
        description: `${result.successful.length} Dateien erfolgreich hochgeladen`,
        status: 'success',
        duration: 3000
      });
    });

    uppyInstance.on('restriction-failed', (file, error) => {
      console.warn('⚠️ Upload-Einschränkung:', error);
      toast({
        title: 'Datei nicht erlaubt',
        description: error.message,
        status: 'warning',
        duration: 3000
      });
    });

    setUppy(uppyInstance);

    return () => {
      uppyInstance.close();
    };
  }, [maxFiles, maxSize, allowedTypes, onUploadComplete, onUploadError, toast]);

  /**
   * Upload Completion behandeln
   */
  const handleUploadCompletion = async (file: any, response: any) => {
    try {
      const completeResponse = await fetch('/api/media/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mediaId: response.uploadURL?.split('/').pop() || file.id,
          userId: localStorage.getItem('user_id') || 'demo-user',
          key: response.uploadURL?.split('/').pop() || file.id,
          filename: file.name,
          type: file.type,
          size: file.size,
          eTag: response.headers?.['etag'] || '',
          width: file.meta?.width,
          height: file.meta?.height,
          tags: []
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Upload completion fehlgeschlagen');
      }

      const result = await completeResponse.json();
      console.log('✅ Upload completion erfolgreich:', result);
    } catch (error) {
      console.error('❌ Upload completion fehlgeschlagen:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload completion fehlgeschlagen');
    }
  };

  /**
   * Retry fehlgeschlagene Uploads
   */
  const retryFailedUploads = async () => {
    if (retryQueue.length === 0) return;

    setIsRetrying(true);
    
    try {
      for (const retryItem of retryQueue) {
        // Datei erneut zu Uppy hinzufügen
        uppy?.addFile({
          name: retryItem.file.name,
          type: retryItem.file.type,
          data: retryItem.file.data,
          source: 'retry',
          isRemote: false
        });
      }

      // Retry Queue leeren
      setRetryQueue([]);
      
      // Upload starten
      uppy?.upload();
      
      toast({
        title: 'Retry gestartet',
        description: `${retryQueue.length} Dateien werden erneut versucht`,
        status: 'info',
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Retry fehlgeschlagen:', error);
      toast({
        title: 'Retry fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Upload-Statistiken zurücksetzen
   */
  const resetStats = () => {
    setUploadStats({ total: 0, completed: 0, failed: 0, inProgress: 0 });
    setRetryQueue([]);
  };

  /**
   * Dashboard rendern
   */
  useEffect(() => {
    if (uppy && dashboardRef.current) {
      const dashboard = new Dashboard({
        target: dashboardRef.current,
        inline: inline,
        width: '100%',
        height: inline ? 400 : 500,
        showProgressDetails: showProgressDetails,
        proudlyDisplayPoweredByUppy: false,
        showRemoveButtonAfterComplete: true,
        showRetryButton: true,
        retryDelays: [1000, 3000, 5000], // 1s, 3s, 5s
        browserBackButtonClose: true,
        closeAfterFinish: false,
        closeModalOnClickOutside: true,
        animateOpenClose: true,
        fileManagerSelectionType: 'files',
        note: `Max. ${maxFiles} Dateien, je ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        locale: {
          strings: {
            addMore: 'Weitere Dateien hinzufügen',
            addMoreFiles: 'Weitere Dateien hinzufügen',
            addingMoreFiles: 'Weitere Dateien werden hinzugefügt...',
            allowAccessDescription: 'Bitte erlauben Sie den Zugriff auf Ihre Kamera, um Fotos und Videos aufzunehmen.',
            allowAccessTitle: 'Bitte erlauben Sie den Zugriff auf Ihre Kamera',
            authenticateWith: 'Mit %{pluginName} verbinden',
            authenticateWithTitle: 'Bitte authentifizieren Sie sich mit %{pluginName}, um Dateien auszuwählen',
            back: 'Zurück',
            browse: 'Durchsuchen',
            browseFiles: 'Dateien durchsuchen',
            cancel: 'Abbrechen',
            cancelUpload: 'Upload abbrechen',
            chooseFiles: 'Dateien auswählen',
            closeModal: 'Schließen',
            companionError: 'Verbindung zu Companion fehlgeschlagen',
            complete: 'Abgeschlossen',
            connectedToInternet: 'Mit dem Internet verbunden',
            copyLink: 'Link kopieren',
            copyLinkToClipboardFallback: 'Link in die Zwischenablage kopieren',
            copyLinkToClipboardSuccess: 'Link in die Zwischenablage kopiert',
            creatingAssembly: 'Upload wird vorbereitet...',
            creatingAssemblyFailed: 'Transloadit: Assembly konnte nicht erstellt werden',
            dashboardTitle: 'Datei-Uploader',
            dashboardWindowTitle: 'Datei-Uploader (Drücken Sie Escape zum Schließen)',
            dataUploadedOfTotal: '%{complete} von %{total}',
            done: 'Fertig',
            dropHereOr: 'Dateien hier ablegen oder %{browse}',
            dropPasteBoth: 'Dateien hier ablegen, einfügen oder %{browse}',
            dropPasteFiles: 'Dateien hier ablegen, einfügen oder %{browse}',
            dropPasteImportBoth: 'Dateien hier ablegen, einfügen, %{browse} oder importieren von',
            dropPasteImportFiles: 'Dateien hier ablegen, einfügen, %{browse} oder importieren von',
            editFile: 'Datei bearbeiten',
            editing: 'Bearbeitung von %{file}',
            emptyFolderAdded: 'Keine Dateien aus dem Ordner hinzugefügt',
            encoding: 'Kodierung...',
            enterCorrectUrl: 'Falsche URL: Stellen Sie sicher, dass der Link direkt auf eine Datei zeigt',
            enterUrlToImport: 'URL eingeben, um eine Datei zu importieren',
            exceedsSize: 'Diese Datei überschreitet die maximale Größe von %{size}',
            failedToFetch: 'Companion konnte diese URL nicht abrufen, stellen Sie sicher, dass sie korrekt ist',
            failedToUpload: 'Fehler beim Upload von %{file}',
            fileSource: 'Dateiquelle: %{name}',
            filesUploadedOfTotal: {
              '0': '%{complete} von %{smart_count} Datei hochgeladen',
              '1': '%{complete} von %{smart_count} Dateien hochgeladen'
            },
            filter: 'Filtern',
            finishEditingFile: 'Datei-Bearbeitung beenden',
            folderAdded: {
              '0': '%{smart_count} Datei aus %{folder} hinzugefügt',
              '1': '%{smart_count} Dateien aus %{folder} hinzugefügt'
            },
            import: 'Importieren',
            importFrom: 'Importieren von %{name}',
            loading: 'Laden...',
            logOut: 'Abmelden',
            myDevice: 'Mein Gerät',
            noFilesFound: 'Keine Dateien hier',
            noInternetConnection: 'Keine Internetverbindung',
            pause: 'Pausieren',
            pauseUpload: 'Upload pausieren',
            paused: 'Pausiert',
            poweredBy: 'Unterstützt von %{uppy}',
            processingXFiles: {
              '0': 'Verarbeitung von %{smart_count} Datei',
              '1': 'Verarbeitung von %{smart_count} Dateien'
            },
            removeFile: 'Datei entfernen',
            resetFilter: 'Filter zurücksetzen',
            resume: 'Fortsetzen',
            resumeUpload: 'Upload fortsetzen',
            retry: 'Wiederholen',
            retryUpload: 'Upload wiederholen',
            saveChanges: 'Änderungen speichern',
            selectFileNamed: 'Datei %{name} auswählen',
            selectX: {
              '0': '%{smart_count} Datei auswählen',
              '1': '%{smart_count} Dateien auswählen'
            },
            smile: 'Lächeln!',
            startRecording: 'Aufnahme starten',
            stopRecording: 'Aufnahme stoppen',
            takePicture: 'Foto aufnehmen',
            timedOut: 'Upload hängt seit %{seconds} Sekunden, wird abgebrochen.',
            upload: 'Hochladen',
            uploadComplete: 'Upload abgeschlossen',
            uploadFailed: 'Upload fehlgeschlagen',
            uploadPaused: 'Upload pausiert',
            uploadStalled: 'Upload hängt seit %{seconds} Sekunden. Sie können es erneut versuchen.',
            uploadXFiles: {
              '0': '%{smart_count} Datei hochladen',
              '1': '%{smart_count} Dateien hochladen'
            },
            uploadXNewFiles: {
              '0': '+%{smart_count} Datei hochladen',
              '1': '+%{smart_count} Dateien hochladen'
            },
            xFilesSelected: {
              '0': '%{smart_count} Datei ausgewählt',
              '1': '%{smart_count} Dateien ausgewählt'
            },
            xMoreFilesAdded: {
              '0': '%{smart_count} weitere Datei hinzugefügt',
              '1': '%{smart_count} weitere Dateien hinzugefügt'
            },
            xTimeLeft: '%{time} verbleibend',
            youCanOnlyUploadFileTypes: 'Sie können nur folgende Dateitypen hochladen: %{types}',
            youCanOnlyUploadX: {
              '0': 'Sie können nur %{smart_count} Datei hochladen',
              '1': 'Sie können nur %{smart_count} Dateien hochladen'
            },
            youHaveToAtLeastSelectX: {
              '0': 'Sie müssen mindestens %{smart_count} Datei auswählen',
              '1': 'Sie müssen mindestens %{smart_count} Dateien auswählen'
            }
          }
        }
      });

      return () => {
        dashboard.close();
      };
    }
  }, [uppy, inline, showProgressDetails, maxFiles, maxSize]);

  return (
    <Box>
      {/* Upload Dashboard */}
      <Box ref={dashboardRef} />

      {/* Upload Statistics */}
      {showProgressDetails && (
        <Box mt={4} p={4} bg="gray.50" borderRadius="md">
          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">Upload-Statistiken</Text>
              <Button size="sm" variant="outline" onClick={resetStats}>
                Zurücksetzen
              </Button>
            </Flex>

            <HStack spacing={4}>
              <Badge colorScheme="blue" variant="solid">
                Gesamt: {uploadStats.total}
              </Badge>
              <Badge colorScheme="green" variant="solid">
                Erfolgreich: {uploadStats.completed}
              </Badge>
              <Badge colorScheme="red" variant="solid">
                Fehlgeschlagen: {uploadStats.failed}
              </Badge>
              <Badge colorScheme="orange" variant="solid">
                In Bearbeitung: {uploadStats.inProgress}
              </Badge>
            </HStack>

            {/* Gesamt-Progress */}
            {uploadStats.total > 0 && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Gesamtfortschritt: {Math.round((uploadStats.completed / uploadStats.total) * 100)}%
                </Text>
                <Progress
                  value={(uploadStats.completed / uploadStats.total) * 100}
                  colorScheme="blue"
                  size="sm"
                />
              </Box>
            )}

            {/* Retry Queue */}
            {retryQueue.length > 0 && (
              <Box>
                <Divider />
                <HStack justify="space-between" mt={3}>
                  <Text fontSize="sm" color="orange.600">
                    {retryQueue.length} fehlgeschlagene Uploads
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    onClick={retryFailedUploads}
                    isLoading={isRetrying}
                    loadingText="Wiederholen..."
                    leftIcon={<FaRetry />}
                  >
                    Erneut versuchen
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedUppyUpload;
