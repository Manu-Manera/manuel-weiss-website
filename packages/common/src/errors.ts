export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string, 
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export class ExternalServiceError extends Error {
  constructor(message: string, public service: string) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}
