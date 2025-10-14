import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  Image,
  Text,
  Button,
  ButtonGroup,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Input,
  Select,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  FaDownload, 
  FaCopy, 
  FaTrash, 
  FaEye, 
  FaFilter,
  FaSort,
  FaSearch
} from 'react-icons/fa';

interface MediaItem {
  id: string;
  filename: string;
  type: string;
  size: number;
  cdnUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  createdAt: string;
  tags: string[];
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface MediaGalleryProps {
  userId?: string;
  onUpload?: () => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

/**
 * Modern Media Gallery Component
 * React-Insel für Astro mit Chakra UI
 */
export const MediaGallery: React.FC<MediaGalleryProps> = ({
  userId,
  onUpload,
  onDelete,
  onDownload
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load media items on component mount
  useEffect(() => {
    loadMediaItems();
  }, [userId]);

  // Filter and sort items when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [mediaItems, searchQuery, filter, sortBy]);

  /**
   * Load media items from API
   */
  const loadMediaItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/media', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMediaItems(data.media || []);
    } catch (err) {
      console.error('Error loading media:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters and sorting
   */
  const applyFiltersAndSort = () => {
    let filtered = [...mediaItems];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => {
        switch (filter) {
          case 'images':
            return item.type.startsWith('image/');
          case 'videos':
            return item.type.startsWith('video/');
          case 'documents':
            return !item.type.startsWith('image/') && !item.type.startsWith('video/');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  /**
   * Handle media item click
   */
  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    onOpen();
  };

  /**
   * Copy URL to clipboard
   */
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Show success toast
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  /**
   * Download media item
   */
  const downloadItem = async (item: MediaItem) => {
    try {
      const response = await fetch(item.cdnUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  /**
   * Delete media item
   */
  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item.id !== id));
        onDelete?.(id);
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  /**
   * Get auth token
   */
  const getAuthToken = async (): Promise<string> => {
    return localStorage.getItem('auth_token') || 'demo-token';
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get file icon
   */
  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('pdf')) return 'file-pdf';
    if (type.includes('word')) return 'file-word';
    if (type.includes('excel')) return 'file-excel';
    return 'file';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading media...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Flex gap={4} mb={6} wrap="wrap" align="center">
        <Input
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<FaSearch />}
          maxW="300px"
        />
        
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          maxW="150px"
        >
          <option value="all">All Types</option>
          <option value="images">Images</option>
          <option value="videos">Videos</option>
          <option value="documents">Documents</option>
        </Select>

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          maxW="150px"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="size">Size</option>
        </Select>

        <Spacer />

        <Text fontSize="sm" color="gray.600">
          {filteredItems.length} items
        </Text>
      </Flex>

      {/* Media Grid */}
      <Grid
        templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
        gap={4}
        mb={6}
      >
        {filteredItems.map((item) => (
          <Card key={item.id} cursor="pointer" onClick={() => handleItemClick(item)}>
            <CardBody p={0}>
              {item.type.startsWith('image/') ? (
                <Image
                  src={item.thumbnailUrl || item.cdnUrl}
                  alt={item.filename}
                  height="200px"
                  objectFit="cover"
                  borderRadius="md"
                />
              ) : (
                <Box
                  height="200px"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                >
                  <Text fontSize="4xl" color="gray.400">
                    <i className={`fas fa-${getFileIcon(item.type)}`} />
                  </Text>
                </Box>
              )}
              
              <Box p={3}>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                  {item.filename}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(item.size)} • {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                
                <HStack mt={2} spacing={1}>
                  <Badge
                    colorScheme={
                      item.status === 'COMPLETED' ? 'green' :
                      item.status === 'PROCESSING' ? 'yellow' :
                      item.status === 'FAILED' ? 'red' : 'gray'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                  
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text fontSize="lg" color="gray.500">
            No media items found
          </Text>
          <Text fontSize="sm" color="gray.400" mt={2}>
            Try adjusting your search or filters
          </Text>
        </Box>
      )}

      {/* Media Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedItem?.filename}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedItem && (
              <VStack spacing={4}>
                {selectedItem.type.startsWith('image/') ? (
                  <Image
                    src={selectedItem.cdnUrl}
                    alt={selectedItem.filename}
                    maxH="400px"
                    objectFit="contain"
                  />
                ) : (
                  <Box
                    height="200px"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="md"
                    w="full"
                  >
                    <Text fontSize="6xl" color="gray.400">
                      <i className={`fas fa-${getFileIcon(selectedItem.type)}`} />
                    </Text>
                  </Box>
                )}
                
                <VStack spacing={2} w="full">
                  <Text fontSize="sm" color="gray.600">
                    <strong>Size:</strong> {formatFileSize(selectedItem.size)}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Type:</strong> {selectedItem.type}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Created:</strong> {new Date(selectedItem.createdAt).toLocaleString()}
                  </Text>
                  
                  {selectedItem.tags.length > 0 && (
                    <HStack wrap="wrap" spacing={1}>
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </VStack>
                
                <ButtonGroup spacing={2} w="full">
                  <Button
                    leftIcon={<FaCopy />}
                    variant="outline"
                    onClick={() => copyUrl(selectedItem.cdnUrl)}
                    flex={1}
                  >
                    Copy URL
                  </Button>
                  <Button
                    leftIcon={<FaDownload />}
                    colorScheme="brand"
                    onClick={() => downloadItem(selectedItem)}
                    flex={1}
                  >
                    Download
                  </Button>
                  <Button
                    leftIcon={<FaTrash />}
                    colorScheme="red"
                    variant="outline"
                    onClick={() => deleteItem(selectedItem.id)}
                    flex={1}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MediaGallery;
