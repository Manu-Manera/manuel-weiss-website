import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Progress } from '@chakra-ui/react';

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

interface PerformanceOptimizerProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showMetrics?: boolean;
}

/**
 * Performance Optimizer Component
 * Überwacht und optimiert Core Web Vitals
 */
export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  onMetricsUpdate,
  showMetrics = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  });

  useEffect(() => {
    // Core Web Vitals überwachen
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        }
        if (entry.entryType === 'first-input') {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        }
        if (entry.entryType === 'layout-shift') {
          setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }));
        }
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] });

    // TTFB messen
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics(prev => ({ ...prev, ttfb: navigationEntry.responseStart - navigationEntry.requestStart }));
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onMetricsUpdate?.(metrics);
  }, [metrics, onMetricsUpdate]);

  const getScore = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const lcpScore = getScore(metrics.lcp, [2500, 4000]);
  const fidScore = getScore(metrics.fid, [100, 300]);
  const clsScore = getScore(metrics.cls, [0.1, 0.25]);

  if (!showMetrics) return null;

  return (
    <Box position="fixed" top={4} right={4} bg="white" p={4} borderRadius="md" boxShadow="lg" zIndex={1000}>
      <VStack spacing={2} align="stretch">
        <Text fontWeight="bold" fontSize="sm">Core Web Vitals</Text>
        
        <HStack justify="space-between">
          <Text fontSize="xs">LCP</Text>
          <Badge colorScheme={lcpScore === 'good' ? 'green' : lcpScore === 'needs-improvement' ? 'yellow' : 'red'}>
            {Math.round(metrics.lcp)}ms
          </Badge>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs">FID</Text>
          <Badge colorScheme={fidScore === 'good' ? 'green' : fidScore === 'needs-improvement' ? 'yellow' : 'red'}>
            {Math.round(metrics.fid)}ms
          </Badge>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs">CLS</Text>
          <Badge colorScheme={clsScore === 'good' ? 'green' : clsScore === 'needs-improvement' ? 'yellow' : 'red'}>
            {metrics.cls.toFixed(3)}
          </Badge>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs">FCP</Text>
          <Badge colorScheme="blue">
            {Math.round(metrics.fcp)}ms
          </Badge>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs">TTFB</Text>
          <Badge colorScheme="blue">
            {Math.round(metrics.ttfb)}ms
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PerformanceOptimizer;
