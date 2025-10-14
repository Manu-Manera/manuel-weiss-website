import React, { useState, useEffect, ReactNode } from 'react';
import {
  Box,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  VStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  HStack,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaCog, FaShieldAlt } from 'react-icons/fa';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super-admin';
  avatar?: string;
  lastLogin?: string;
  isVerified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

/**
 * AuthGuard Component
 * Zentrale Authentifizierung und Autorisierung für alle Routen
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallback,
  redirectTo
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication
   */
  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check for existing session
      const token = await getAuthToken();
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
        return;
      }

      // Validate token and get user info
      const user = await validateTokenAndGetUser(token);
      if (user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null
        });
      } else {
        // Token is invalid, clear it
        await clearAuthData();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  };

  /**
   * Get auth token from various sources
   */
  const getAuthToken = async (): Promise<string | null> => {
    // Check localStorage first
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;

    // Check sessionStorage
    const sessionToken = sessionStorage.getItem('auth_token');
    if (sessionToken) return sessionToken;

    // Check for token in URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('auth_token', urlToken);
      return urlToken;
    }

    return null;
  };

  /**
   * Validate token and get user information
   */
  const validateTokenAndGetUser = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  /**
   * Clear authentication data
   */
  const clearAuthData = async () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_profile');
  };

  /**
   * Handle login
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('user_profile', JSON.stringify(data.user));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null
      });

      onClose();
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data regardless of API call result
      await clearAuthData();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    }
  };

  /**
   * Check if user has required permissions
   */
  const hasPermission = (): boolean => {
    if (!requireAuth) return true;
    if (!authState.isAuthenticated) return false;
    if (!requireAdmin) return true;
    
    return authState.user?.role === 'admin' || authState.user?.role === 'super-admin';
  };

  /**
   * Render loading state
   */
  if (authState.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="gray.600">Authentifizierung läuft...</Text>
        </VStack>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (authState.error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {authState.error}
        <Button size="sm" ml={4} onClick={initializeAuth}>
          Erneut versuchen
        </Button>
      </Alert>
    );
  }

  /**
   * Render access denied
   */
  if (!hasPermission()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box textAlign="center" py={8}>
        <VStack spacing={4}>
          <FaShieldAlt size={48} color="#e53e3e" />
          <Text fontSize="xl" fontWeight="semibold" color="red.500">
            {requireAuth && !authState.isAuthenticated 
              ? 'Anmeldung erforderlich' 
              : 'Zugriff verweigert'
            }
          </Text>
          <Text color="gray.600">
            {requireAuth && !authState.isAuthenticated
              ? 'Sie müssen sich anmelden, um diese Seite zu besuchen.'
              : 'Sie haben keine Berechtigung für diese Seite.'
            }
          </Text>
          <HStack spacing={4}>
            {!authState.isAuthenticated && (
              <Button
                leftIcon={<FaSignInAlt />}
                colorScheme="brand"
                onClick={onOpen}
              >
                Anmelden
              </Button>
            )}
            {authState.isAuthenticated && (
              <Button
                leftIcon={<FaSignOutAlt />}
                variant="outline"
                onClick={handleLogout}
              >
                Abmelden
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    );
  }

  /**
   * Render children with auth context
   */
  return (
    <>
      {children}
      
      {/* Login Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Anmelden</ModalHeader>
          <ModalBody>
            <LoginForm onLogin={handleLogin} isLoading={authState.isLoading} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

/**
 * Login Form Component
 */
interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem'
          }}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem'
          }}
        />
        <Button
          type="submit"
          colorScheme="brand"
          width="100%"
          isLoading={isLoading}
          loadingText="Anmelden..."
        >
          Anmelden
        </Button>
      </VStack>
    </form>
  );
};

export default AuthGuard;
