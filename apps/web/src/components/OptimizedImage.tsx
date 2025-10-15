import React, { useState, useRef, useEffect } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'avif' | 'webp' | 'jpeg' | 'png';
  priority?: boolean;
  lazy?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Optimized Image Component
 * Automatische Format-Optimierung und Lazy Loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  format,
  priority = false,
  lazy = true,
  className,
  style
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer für Lazy Loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [lazy]);

  // Format-Detection basierend auf Browser-Support
  const getOptimalFormat = (): string => {
    if (format) return format;
    
    // AVIF Support prüfen
    if (typeof window !== 'undefined' && 'avif' in HTMLImageElement.prototype) {
      return 'avif';
    }
    
    // WebP Support prüfen
    if (typeof window !== 'undefined' && 'webp' in HTMLImageElement.prototype) {
      return 'webp';
    }
    
    return 'jpeg';
  };

  // Optimierte URL generieren
  const getOptimizedSrc = (): string => {
    if (!isInView) return '';
    
    const optimalFormat = getOptimalFormat();
    const params = new URLSearchParams({
      format: optimalFormat,
      quality: quality.toString(),
      ...(width && { width: width.toString() }),
      ...(height && { height: height.toString() })
    });
    
    return `${src}?${params.toString()}`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <Box
        width={width}
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
        borderRadius="md"
        className={className}
        style={style}
      >
        <Text fontSize="sm" color="gray.500">
          Bild konnte nicht geladen werden
        </Text>
      </Box>
    );
  }

  return (
    <Box
      ref={imgRef}
      position="relative"
      width={width}
      height={height}
      className={className}
      style={style}
    >
      {!isLoaded && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.100"
        >
          <Spinner size="sm" color="blue.500" />
        </Box>
      )}
      
      {isInView && (
        <img
          src={getOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </Box>
  );
};

export default OptimizedImage;
