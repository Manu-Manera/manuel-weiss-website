import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Alert,
  AlertIcon,
  Button,
  IconButton,
  Tooltip,
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
  Divider,
  Flex,
  Spacer,
  useToast
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaStop,
  FaRefresh,
  FaEye,
  FaDownload,
  FaTrash,
  FaClock,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';

interface JobStatus {
  jobId: string;
  userId: string;
  applicationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  estimatedCompletion?: string;
  steps: JobStep[];
  metadata: Record<string, any>;
}

interface JobStep {
  stepId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
  duration?: number;
}

interface JobStatusTrackerProps {
  jobId?: string;
  applicationId?: string;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onJobComplete?: (job: JobStatus) => void;
  onJobError?: (job: JobStatus) => void;
  showDetails?: boolean;
  showActions?: boolean;
}

/**
 * Job Status Tracker Component
 * Verfolgt asynchrone Workflows mit Step Functions
 */
export const JobStatusTracker: React.FC<JobStatusTrackerProps> = ({
  jobId,
  applicationId,
  userId,
  autoRefresh = true,
  refreshInterval = 5000,
  onJobComplete,
  onJobError,
  showDetails = true,
  showActions = true
}) => {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobStatus | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  /**
   * Jobs laden
   */
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (jobId) params.append('jobId', jobId);
      if (applicationId) params.append('applicationId', applicationId);
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Jobs konnten nicht geladen werden');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Fehler beim Laden der Jobs:', error);
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, [jobId, applicationId, userId]);

  /**
   * Auto-Refresh einrichten
   */
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadJobs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadJobs]);

  /**
   * Komponente initialisieren
   */
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  /**
   * Job-Status prüfen
   */
  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Job-Status konnte nicht abgerufen werden');
      }

      const data = await response.json();
      const job = data.job;

      // Job-Status aktualisieren
      setJobs(prev => prev.map(j => j.jobId === jobId ? job : j));

      // Callbacks aufrufen
      if (job.status === 'completed') {
        onJobComplete?.(job);
        toast({
          title: 'Job abgeschlossen',
          description: `Job ${jobId} wurde erfolgreich abgeschlossen`,
          status: 'success',
          duration: 3000
        });
      } else if (job.status === 'failed') {
        onJobError?.(job);
        toast({
          title: 'Job fehlgeschlagen',
          description: `Job ${jobId} ist fehlgeschlagen: ${job.error}`,
          status: 'error',
          duration: 5000
        });
      }

      return job;
    } catch (error) {
      console.error('Fehler beim Prüfen des Job-Status:', error);
      toast({
        title: 'Status-Prüfung fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 3000
      });
      throw error;
    }
  };

  /**
   * Job starten
   */
  const startJob = async (applicationId: string) => {
    try {
      const response = await fetch('/api/jobs/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId,
          userId: localStorage.getItem('user_id') || 'demo-user'
        })
      });

      if (!response.ok) {
        throw new Error('Job konnte nicht gestartet werden');
      }

      const data = await response.json();
      const newJob = data.job;

      setJobs(prev => [newJob, ...prev]);
      
      toast({
        title: 'Job gestartet',
        description: `Job ${newJob.jobId} wurde gestartet`,
        status: 'success',
        duration: 3000
      });

      return newJob;
    } catch (error) {
      console.error('Fehler beim Starten des Jobs:', error);
      toast({
        title: 'Job-Start fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
      throw error;
    }
  };

  /**
   * Job pausieren
   */
  const pauseJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Job konnte nicht pausiert werden');
      }

      await loadJobs();
      
      toast({
        title: 'Job pausiert',
        description: `Job ${jobId} wurde pausiert`,
        status: 'info',
        duration: 3000
      });
    } catch (error) {
      console.error('Fehler beim Pausieren des Jobs:', error);
      toast({
        title: 'Job-Pause fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
    }
  };

  /**
   * Job stoppen
   */
  const stopJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Job konnte nicht gestoppt werden');
      }

      await loadJobs();
      
      toast({
        title: 'Job gestoppt',
        description: `Job ${jobId} wurde gestoppt`,
        status: 'warning',
        duration: 3000
      });
    } catch (error) {
      console.error('Fehler beim Stoppen des Jobs:', error);
      toast({
        title: 'Job-Stop fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
    }
  };

  /**
   * Job löschen
   */
  const deleteJob = async (jobId: string) => {
    if (!confirm('Möchten Sie diesen Job wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Job konnte nicht gelöscht werden');
      }

      setJobs(prev => prev.filter(j => j.jobId !== jobId));
      
      toast({
        title: 'Job gelöscht',
        description: `Job ${jobId} wurde gelöscht`,
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Jobs:', error);
      toast({
        title: 'Job-Löschung fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        status: 'error',
        duration: 5000
      });
    }
  };

  /**
   * Job-Details anzeigen
   */
  const showJobDetails = (job: JobStatus) => {
    setSelectedJob(job);
    onOpen();
  };

  /**
   * Status-Badge
   */
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'gray', icon: FaClock, text: 'Wartend' },
      running: { color: 'blue', icon: FaSpinner, text: 'Läuft' },
      completed: { color: 'green', icon: FaCheck, text: 'Abgeschlossen' },
      failed: { color: 'red', icon: FaTimes, text: 'Fehlgeschlagen' },
      cancelled: { color: 'orange', icon: FaStop, text: 'Abgebrochen' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge colorScheme={config.color} variant="solid">
        <Icon style={{ marginRight: '4px' }} />
        {config.text}
      </Badge>
    );
  };

  /**
   * Geschätzte Zeit formatieren
   */
  const formatEstimatedTime = (estimatedCompletion?: string) => {
    if (!estimatedCompletion) return 'Unbekannt';
    
    const now = new Date();
    const estimated = new Date(estimatedCompletion);
    const diff = estimated.getTime() - now.getTime();
    
    if (diff <= 0) return 'Bald fertig';
    
    const minutes = Math.ceil(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} Min`;
    
    const hours = Math.ceil(minutes / 60);
    return `${hours} Std`;
  };

  if (loading && jobs.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Progress size="sm" isIndeterminate colorScheme="blue" />
        <Text mt={2}>Jobs werden geladen...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
        <Button size="sm" ml={4} onClick={loadJobs}>
          Erneut versuchen
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="semibold">
            Job-Status
          </Text>
          <Text fontSize="sm" color="gray.600">
            {jobs.length} Jobs gefunden
          </Text>
        </VStack>

        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={loadJobs}
            leftIcon={<FaRefresh />}
          >
            Aktualisieren
          </Button>
        </HStack>
      </Flex>

      {/* Jobs-Tabelle */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Job ID</Th>
              <Th>Status</Th>
              <Th>Fortschritt</Th>
              <Th>Schritt</Th>
              <Th>Gestartet</Th>
              <Th>Geschätzte Zeit</Th>
              {showActions && <Th>Aktionen</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {jobs.map((job) => (
              <Tr key={job.jobId}>
                <Td>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {job.jobId}
                  </Text>
                </Td>
                <Td>
                  {getStatusBadge(job.status)}
                </Td>
                <Td>
                  <VStack spacing={1} align="stretch">
                    <Progress
                      value={job.progress}
                      size="sm"
                      colorScheme={job.status === 'failed' ? 'red' : 'blue'}
                    />
                    <Text fontSize="xs" color="gray.600">
                      {job.progress}%
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {job.currentStep} ({job.totalSteps - job.steps.filter(s => s.status === 'completed').length} verbleibend)
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(job.startedAt).toLocaleString()}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {formatEstimatedTime(job.estimatedCompletion)}
                  </Text>
                </Td>
                {showActions && (
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="Details anzeigen">
                        <IconButton
                          size="sm"
                          icon={<FaEye />}
                          onClick={() => showJobDetails(job)}
                          colorScheme="blue"
                          variant="ghost"
                        />
                      </Tooltip>
                      
                      {job.status === 'running' && (
                        <Tooltip label="Pausieren">
                          <IconButton
                            size="sm"
                            icon={<FaPause />}
                            onClick={() => pauseJob(job.jobId)}
                            colorScheme="orange"
                            variant="ghost"
                          />
                        </Tooltip>
                      )}
                      
                      {job.status === 'running' && (
                        <Tooltip label="Stoppen">
                          <IconButton
                            size="sm"
                            icon={<FaStop />}
                            onClick={() => stopJob(job.jobId)}
                            colorScheme="red"
                            variant="ghost"
                          />
                        </Tooltip>
                      )}
                      
                      <Tooltip label="Löschen">
                        <IconButton
                          size="sm"
                          icon={<FaTrash />}
                          onClick={() => deleteJob(job.jobId)}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Job-Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Job-Details</ModalHeader>
          <ModalBody>
            {selectedJob && (
              <VStack spacing={4} align="stretch">
                {/* Job-Info */}
                <VStack spacing={2} align="stretch">
                  <Text><strong>Job ID:</strong> {selectedJob.jobId}</Text>
                  <Text><strong>Status:</strong> {getStatusBadge(selectedJob.status)}</Text>
                  <Text><strong>Fortschritt:</strong> {selectedJob.progress}%</Text>
                  <Text><strong>Gestartet:</strong> {new Date(selectedJob.startedAt).toLocaleString()}</Text>
                  {selectedJob.completedAt && (
                    <Text><strong>Abgeschlossen:</strong> {new Date(selectedJob.completedAt).toLocaleString()}</Text>
                  )}
                  {selectedJob.error && (
                    <Alert status="error">
                      <AlertIcon />
                      {selectedJob.error}
                    </Alert>
                  )}
                </VStack>

                <Divider />

                {/* Schritte */}
                <VStack spacing={2} align="stretch">
                  <Text fontWeight="semibold">Schritte:</Text>
                  {selectedJob.steps.map((step, index) => (
                    <Box key={step.stepId} p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" fontWeight="medium">
                          {index + 1}. {step.name}
                        </Text>
                        <Badge colorScheme={step.status === 'completed' ? 'green' : step.status === 'failed' ? 'red' : 'blue'}>
                          {step.status}
                        </Badge>
                      </Flex>
                      {step.duration && (
                        <Text fontSize="xs" color="gray.600">
                          Dauer: {step.duration}ms
                        </Text>
                      )}
                      {step.error && (
                        <Text fontSize="xs" color="red.500">
                          Fehler: {step.error}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Schließen
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default JobStatusTracker;
