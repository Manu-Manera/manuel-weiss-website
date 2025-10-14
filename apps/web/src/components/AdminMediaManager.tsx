import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Progress,
  Flex,
  Spacer,
  Input,
  Select,
  Checkbox,
  Divider,
  useToast
} from '@chakra-ui/react';
import {
  FaEye,
  FaDownload,
  FaTrash,
  FaEdit,
  FaSearch,
  FaFilter,
  FaSort,
  FaCloudUpload,
  FaImage,
  FaFile,
  FaVideo,
  FaMusic,
  FaArchive
} from 'react-icons/fa';

interface MediaItem {
  id: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  tags: string[];
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  updatedAt: string;
  userId: string;
  cdnUrl: string;
}

interface AdminMediaManagerProps {
  onMediaSelect?: (media: MediaItem) => void;
  onMediaDelete?: (mediaId: string) => void;
  onMediaUpdate?: (media: MediaItem) => void;
  showUploadButton?: boolean;
  showBulkActions?: boolean;
  filterByUser?: boolean;
}

/**
 * Admin Media Manager Component
 * Vollständige Medien-Verwaltung für Admins
 */
export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  onMediaSelect,
  onMediaDelete,
  onMediaUpdate,
  showUploadButton = true,
  showBulkActions = true,
  filterByUser = false
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const toast = useToast();

  /**
   * Medien laden
   */
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/media', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Medien konnten nicht geladen werden');
      }

      const data = await response.json();
      setMediaItems(data.media || []);
    } catch (error) {
      console.error('Fehler beim Laden der Medien:', error);
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Medien filtern und sortieren
   */
  useEffect(() => {
    let filtered = [...mediaItems];

    // Suche
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Typ-Filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        if (filterType === 'image') return item.type.startsWith('image/');
        if (filterType === 'video') return item.type.startsWith('video/');
        if (filterType === 'audio') return item.type.startsWith('audio/');
        if (filterType === 'document') return item.type.includes('pdf') || item.type.includes('document');
        return true;
      });
    }

    // Status-Filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Sortierung
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof MediaItem];
      let bValue: any = b[sortBy as keyof MediaItem];

      if (sortBy === 'size') {
        aValue = a.size;
        bValue = b.size;
      } else if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  }, [mediaItems, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  /**
   * Komponente initialisieren
   */
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  /**
   * Medien-Details anzeigen
   */
  const showMediaDetails = (media: MediaItem) => {
    setSelectedMedia(media);
    onOpen();
  };

  /**
   * Medien herunterladen
   */
  const downloadMedia = (media: MediaItem) => {
    const link = document.createElement('a');
    link.href = media.cdnUrl;
    link.download = media.filename;
    link.click();
  };

  /**
   * Medien löschen
   */
  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Datei konnte nicht gelöscht werden');
      }

      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
      onMediaDelete?.(mediaId);
      
      toast({
        title: 'Datei gelöscht',
        description: 'Die Datei wurde erfolgreich gelöscht',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        title: 'Löschen fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
    }
  };

  /**
   * Bulk-Aktionen
   */
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Möchten Sie ${selectedItems.length} Dateien wirklich löschen?`)) return;

    try {
      const response = await fetch('/api/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mediaIds: selectedItems })
      });

      if (!response.ok) {
        throw new Error('Bulk-Löschung fehlgeschlagen');
      }

      setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      
      toast({
        title: 'Bulk-Löschung erfolgreich',
        description: `${selectedItems.length} Dateien wurden gelöscht`,
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Bulk-Löschung fehlgeschlagen:', error);
      toast({
        title: 'Bulk-Löschung fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
    }
  };

  /**
   * Datei-Icon basierend auf Typ
   */
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FaImage color="#3182ce" />;
    if (type.startsWith('video/')) return <FaVideo color="#e53e3e" />;
    if (type.startsWith('audio/')) return <FaMusic color="#38a169" />;
    if (type.includes('pdf') || type.includes('document')) return <FaFile color="#805ad5" />;
    return <FaArchive color="#718096" />;
  };

  /**
   * Status-Badge
   */
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { color: 'orange', text: 'Verarbeitung' },
      ready: { color: 'green', text: 'Bereit' },
      error: { color: 'red', text: 'Fehler' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready;
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  /**
   * Dateigröße formatieren
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Progress size="sm" isIndeterminate colorScheme="blue" />
        <Text mt={2}>Medien werden geladen...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
        <Button size="sm" ml={4} onClick={loadMedia}>
          Erneut versuchen
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header mit Aktionen */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="semibold">
            Medien-Verwaltung
          </Text>
          <Text fontSize="sm" color="gray.600">
            {filteredItems.length} von {mediaItems.length} Dateien
          </Text>
        </VStack>

        <HStack spacing={2}>
          {showUploadButton && (
            <Button colorScheme="blue" leftIcon={<FaCloudUpload />}>
              Hochladen
            </Button>
          )}
          <Button variant="outline" onClick={loadMedia}>
            Aktualisieren
          </Button>
        </HStack>
      </Flex>

      {/* Filter und Suche */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="md">
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Input
              placeholder="Dateien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FaSearch />}
            />
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              width="150px"
            >
              <option value="all">Alle Typen</option>
              <option value="image">Bilder</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Dokumente</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              width="150px"
            >
              <option value="all">Alle Status</option>
              <option value="ready">Bereit</option>
              <option value="processing">Verarbeitung</option>
              <option value="error">Fehler</option>
            </Select>
          </HStack>

          <HStack spacing={4}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              width="150px"
            >
              <option value="createdAt">Erstellt</option>
              <option value="filename">Name</option>
              <option value="size">Größe</option>
              <option value="type">Typ</option>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              leftIcon={<FaSort />}
            >
              {sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Bulk-Aktionen */}
      {showBulkActions && selectedItems.length > 0 && (
        <Box mb={4} p={3} bg="blue.50" borderRadius="md">
          <HStack justify="space-between">
            <Text fontSize="sm" color="blue.700">
              {selectedItems.length} Dateien ausgewählt
            </Text>
            <HStack>
              <Button size="sm" colorScheme="red" onClick={handleBulkDelete}>
                Ausgewählte löschen
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedItems([])}>
                Auswahl aufheben
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

      {/* Medien-Tabelle */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {showBulkActions && (
                <Th>
                  <Checkbox
                    isChecked={selectedItems.length === filteredItems.length}
                    isIndeterminate={selectedItems.length > 0 && selectedItems.length < filteredItems.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredItems.map(item => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </Th>
              )}
              <Th>Vorschau</Th>
              <Th>Name</Th>
              <Th>Typ</Th>
              <Th>Größe</Th>
              <Th>Status</Th>
              <Th>Erstellt</Th>
              <Th>Aktionen</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.map((item) => (
              <Tr key={item.id}>
                {showBulkActions && (
                  <Td>
                    <Checkbox
                      isChecked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => [...prev, item.id]);
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                    />
                  </Td>
                )}
                <Td>
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.filename}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  ) : (
                    <Box
                      boxSize="40px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="gray.100"
                      borderRadius="md"
                    >
                      {getFileIcon(item.type)}
                    </Box>
                  )}
                </Td>
                <Td>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {item.filename}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {item.type}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {formatFileSize(item.size)}
                  </Text>
                </Td>
                <Td>
                  {getStatusBadge(item.status)}
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="Anzeigen">
                      <IconButton
                        size="sm"
                        icon={<FaEye />}
                        onClick={() => showMediaDetails(item)}
                        colorScheme="blue"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="Herunterladen">
                      <IconButton
                        size="sm"
                        icon={<FaDownload />}
                        onClick={() => downloadMedia(item)}
                        colorScheme="green"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="Löschen">
                      <IconButton
                        size="sm"
                        icon={<FaTrash />}
                        onClick={() => deleteMedia(item.id)}
                        colorScheme="red"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Medien-Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Medien-Details</ModalHeader>
          <ModalBody>
            {selectedMedia && (
              <VStack spacing={4} align="stretch">
                {/* Vorschau */}
                {selectedMedia.thumbnail && (
                  <Box textAlign="center">
                    <Image
                      src={selectedMedia.thumbnail}
                      alt={selectedMedia.filename}
                      maxH="300px"
                      objectFit="contain"
                      borderRadius="md"
                    />
                  </Box>
                )}

                {/* Details */}
                <VStack spacing={2} align="stretch">
                  <Text><strong>Name:</strong> {selectedMedia.filename}</Text>
                  <Text><strong>Typ:</strong> {selectedMedia.type}</Text>
                  <Text><strong>Größe:</strong> {formatFileSize(selectedMedia.size)}</Text>
                  <Text><strong>Status:</strong> {getStatusBadge(selectedMedia.status)}</Text>
                  <Text><strong>Erstellt:</strong> {new Date(selectedMedia.createdAt).toLocaleString()}</Text>
                  {selectedMedia.width && selectedMedia.height && (
                    <Text><strong>Dimensionen:</strong> {selectedMedia.width} x {selectedMedia.height}</Text>
                  )}
                  {selectedMedia.tags.length > 0 && (
                    <Text><strong>Tags:</strong> {selectedMedia.tags.join(', ')}</Text>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Schließen
            </Button>
            {selectedMedia && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  downloadMedia(selectedMedia);
                  onClose();
                }}
              >
                Herunterladen
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminMediaManager;
