/**
 * API Gateway Utilities
 * Gemeinsame Funktionen für Lambda-Integration
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * CORS Headers für alle Responses
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Max-Age': '86400'
};

/**
 * Standard Response Builder
 */
export class ApiResponse {
  /**
   * Success Response
   */
  static success(data, statusCode = 200, headers = {}) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        ...headers
      },
      body: JSON.stringify({
        success: true,
        ...data
      })
    };
  }

  /**
   * Error Response
   */
  static error(message, statusCode = 500, details = null, headers = {}) {
    const response = {
      success: false,
      error: message
    };

    if (details) {
      response.details = details;
    }

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        ...headers
      },
      body: JSON.stringify(response)
    };
  }

  /**
   * Validation Error Response
   */
  static validationError(errors, statusCode = 400) {
    return this.error('Validation Error', statusCode, { errors });
  }

  /**
   * Unauthorized Response
   */
  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  /**
   * Not Found Response
   */
  static notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  /**
   * Conflict Response
   */
  static conflict(message = 'Resource conflict') {
    return this.error(message, 409);
  }

  /**
   * Method Not Allowed Response
   */
  static methodNotAllowed(allowedMethods = ['GET', 'POST']) {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': allowedMethods.join(', '),
        ...CORS_HEADERS
      },
      body: JSON.stringify({
        success: false,
        error: 'Method Not Allowed',
        allowedMethods
      })
    };
  }
}

/**
 * Request Parser
 */
export class RequestParser {
  /**
   * Body aus Event parsen
   */
  static parseBody(event) {
    try {
      if (!event.body) {
        return {};
      }
      return JSON.parse(event.body);
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }
  }

  /**
   * Query Parameters parsen
   */
  static parseQueryParams(event) {
    return event.queryStringParameters || {};
  }

  /**
   * Path Parameters parsen
   */
  static parsePathParams(event) {
    return event.pathParameters || {};
  }

  /**
   * Headers parsen
   */
  static parseHeaders(event) {
    return event.headers || {};
  }

  /**
   * Authorization Header extrahieren
   */
  static getAuthHeader(event) {
    const headers = this.parseHeaders(event);
    return headers.Authorization || headers.authorization;
  }

  /**
   * User ID aus JWT Token extrahieren
   */
  static getUserId(event) {
    const authHeader = this.getAuthHeader(event);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.user_id;
    } catch (error) {
      console.error('Token parsing error:', error);
      return null;
    }
  }
}

/**
 * Request Validator
 */
export class RequestValidator {
  /**
   * HTTP Method validieren
   */
  static validateMethod(event, allowedMethods) {
    const method = event.httpMethod;
    if (!allowedMethods.includes(method)) {
      throw new Error(`Method ${method} not allowed. Allowed: ${allowedMethods.join(', ')}`);
    }
    return method;
  }

  /**
   * Authorization validieren
   */
  static validateAuth(event) {
    const userId = RequestParser.getUserId(event);
    if (!userId) {
      throw new Error('Valid JWT token required');
    }
    return userId;
  }

  /**
   * Required Fields validieren
   */
  static validateRequired(data, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
        errors.push(`${field} is required`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * String Length validieren
   */
  static validateStringLength(value, fieldName, minLength = 1, maxLength = 1000) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    if (value.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} characters long`);
    }
    if (value.length > maxLength) {
      throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
    }
  }

  /**
   * Email Format validieren
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Pagination Parameter validieren
   */
  static validatePagination(queryParams) {
    const limit = parseInt(queryParams.limit) || 20;
    const offset = parseInt(queryParams.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    return { limit, offset };
  }
}

/**
 * Lambda Handler Wrapper
 */
export function createHandler(handlerFunction, options = {}) {
  return async (event, context) => {
    try {
      // CORS Preflight
      if (event.httpMethod === 'OPTIONS') {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: ''
        };
      }

      // Request Logging
      if (options.logRequests !== false) {
        console.log('📥 Request:', {
          method: event.httpMethod,
          path: event.path,
          queryParams: event.queryStringParameters,
          pathParams: event.pathParameters,
          headers: Object.keys(event.headers || {}),
          bodySize: event.body?.length || 0
        });
      }

      // Handler ausführen
      const result = await handlerFunction(event, context);

      // Response Logging
      if (options.logResponses !== false) {
        console.log('📤 Response:', {
          statusCode: result.statusCode,
          bodySize: result.body?.length || 0
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Handler Error:', error);

      // Validation Error
      if (error.message.includes('Validation failed')) {
        return ApiResponse.validationError([error.message]);
      }

      // Auth Error
      if (error.message.includes('JWT token required')) {
        return ApiResponse.unauthorized(error.message);
      }

      // Method Error
      if (error.message.includes('Method') && error.message.includes('not allowed')) {
        return ApiResponse.methodNotAllowed();
      }

      // Generic Error
      return ApiResponse.error(
        'Internal Server Error',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  };
}

/**
 * DynamoDB Error Handler
 */
export function handleDynamoDBError(error) {
  if (error.name === 'ConditionalCheckFailedException') {
    return ApiResponse.conflict('Resource was modified by another user');
  }

  if (error.name === 'ResourceNotFoundException') {
    return ApiResponse.notFound('Resource not found');
  }

  if (error.name === 'ValidationException') {
    return ApiResponse.validationError([error.message]);
  }

  console.error('DynamoDB Error:', error);
  return ApiResponse.error('Database error', 500);
}

export default {
  ApiResponse,
  RequestParser,
  RequestValidator,
  createHandler,
  handleDynamoDBError,
  CORS_HEADERS
};
