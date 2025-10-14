import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaTimes, 
  FaFilter, 
  FaSort,
  FaFileAlt,
  FaUser,
  FaCog,
  FaLightbulb,
  FaQuestionCircle
} from 'react-icons/fa';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  url: string;
  type: 'service' | 'method' | 'blog' | 'case-study' | 'faq';
  category: string;
  tags: string[];
  score: number;
  excerpt: string;
}

interface SearchInterfaceProps {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
  maxResults?: number;
  showFilters?: boolean;
}

/**
 * Modern Search Interface mit Pagefind Integration
 * Volltext-Suche über alle Content Collections
 */
export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  placeholder = "Services, Methoden, Blog-Artikel durchsuchen...",
  onResultClick,
  maxResults = 10,
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance');
  const [showResults, setShowResults] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchRef = useRef<HTMLInputElement>(null);
  const pagefindRef = useRef<any>(null);

  // Initialize Pagefind
  useEffect(() => {
    const initPagefind = async () => {
      try {
        // Dynamically import Pagefind
        const { Pagefind } = await import('pagefind');
        pagefindRef.current = new Pagefind({
          baseUrl: '/',
          bundlePath: '/pagefind/'
        });
      } catch (err) {
        console.error('Failed to initialize Pagefind:', err);
        setError('Suchindex konnte nicht geladen werden');
      }
    };

    initPagefind();
  }, []);

  /**
   * Perform search with Pagefind
   */
  const performSearch = async (searchQuery: string) => {
    if (!pagefindRef.current || !searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchResults = await pagefindRef.current.search(searchQuery, {
        filters: selectedCategory !== 'all' ? { category: selectedCategory } : {},
        sort: sortBy === 'relevance' ? undefined : { [sortBy]: 'asc' }
      });

      const formattedResults: SearchResult[] = searchResults.results
        .slice(0, maxResults)
        .map((result: any) => ({
          id: result.id,
          title: result.meta?.title || result.url.split('/').pop() || 'Untitled',
          content: result.content,
          url: result.url,
          type: result.meta?.type || 'service',
          category: result.meta?.category || 'general',
          tags: result.meta?.tags || [],
          score: result.score || 0,
          excerpt: result.excerpt || result.content.substring(0, 150) + '...'
        }));

      setResults(formattedResults);
      setShowResults(true);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Suche fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search input
   */
  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      performSearch(value);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  /**
   * Handle result click
   */
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setShowResults(false);
    setQuery('');
  };

  /**
   * Get icon for result type
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return <FaCog />;
      case 'method': return <FaLightbulb />;
      case 'blog': return <FaFileAlt />;
      case 'case-study': return <FaUser />;
      case 'faq': return <FaQuestionCircle />;
      default: return <FaFileAlt />;
    }
  };

  /**
   * Get color for result type
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'blue';
      case 'method': return 'green';
      case 'blog': return 'purple';
      case 'case-study': return 'orange';
      case 'faq': return 'gray';
      default: return 'blue';
    }
  };

  return (
    <Box position="relative" width="100%">
      {/* Search Input */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FaSearch color="gray.400" />
        </InputLeftElement>
        <Input
          ref={searchRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setShowResults(true)}
          bg="white"
          borderColor="gray.300"
          _focus={{
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)'
          }}
        />
        {query && (
          <InputRightElement>
            <IconButton
              aria-label="Clear search"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {/* Filters */}
      {showFilters && (
        <Flex gap={2} mt={2} wrap="wrap">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'solid' : 'outline'}
            colorScheme="brand"
            onClick={() => setSelectedCategory('all')}
          >
            Alle
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'service' ? 'solid' : 'outline'}
            colorScheme="brand"
            onClick={() => setSelectedCategory('service')}
          >
            Services
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'method' ? 'solid' : 'outline'}
            colorScheme="brand"
            onClick={() => setSelectedCategory('method')}
          >
            Methoden
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'blog' ? 'solid' : 'outline'}
            colorScheme="brand"
            onClick={() => setSelectedCategory('blog')}
          >
            Blog
          </Button>
        </Flex>
      )}

      {/* Search Results */}
      {showResults && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          zIndex={1000}
          maxHeight="400px"
          overflowY="auto"
        >
          {loading && (
            <Flex align="center" justify="center" p={4}>
              <Spinner size="sm" color="brand.500" />
              <Text ml={2} fontSize="sm" color="gray.600">
                Suche läuft...
              </Text>
            </Flex>
          )}

          {error && (
            <Alert status="error" size="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!loading && !error && results.length === 0 && query && (
            <Box p={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">
                Keine Ergebnisse für "{query}" gefunden
              </Text>
            </Box>
          )}

          {!loading && !error && results.length > 0 && (
            <VStack spacing={0} align="stretch">
              {results.map((result, index) => (
                <Box
                  key={result.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  borderBottom={index < results.length - 1 ? '1px solid' : 'none'}
                  borderBottomColor="gray.100"
                  onClick={() => handleResultClick(result)}
                >
                  <HStack spacing={3} align="start">
                    <Box color={`${getTypeColor(result.type)}.500`} mt={1}>
                      {getTypeIcon(result.type)}
                    </Box>
                    
                    <Box flex={1} minW={0}>
                      <HStack spacing={2} mb={1}>
                        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                          {result.title}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={getTypeColor(result.type)}
                          variant="subtle"
                        >
                          {result.type}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {result.excerpt}
                      </Text>
                      
                      {result.tags.length > 0 && (
                        <HStack spacing={1} mt={1}>
                          {result.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} size="xs" variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* Advanced Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Erweiterte Suche</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Erweiterte Suchoptionen werden hier implementiert...
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SearchInterface;
