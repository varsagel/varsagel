import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { createModuleLogger, logError } from '@/lib/logger';
import { logErrorToDb } from '@/lib/logger-service';

const logger = createModuleLogger('error-handler');

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  requestId?: string;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: Record<string, any>;

  constructor(message: string, statusCode: number = 500, details?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, retryAfter ? { retryAfter } : undefined);
  }
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function handleError(error: unknown, requestId?: string): ErrorResponse {
  const requestIdOrGenerate = requestId || generateRequestId();
  
  // Handle known errors
  if (error instanceof AppError) {
    logger.error('Application error', {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      requestId: requestIdOrGenerate,
    });

    if (error.statusCode >= 500) {
      logErrorToDb({
        message: error.message,
        stack: error.stack,
        source: 'backend',
        context: { requestId: requestIdOrGenerate, details: error.details, statusCode: error.statusCode }
      });
    }

    return {
      error: error.constructor.name,
      message: error.message,
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      requestId: requestIdOrGenerate,
    };
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.issues.reduce((acc, curr) => {
      acc[curr.path.join('.')] = curr.message;
      return acc;
    }, {} as Record<string, string>);

    logger.warn('Validation error', {
      errors: error.issues,
      requestId: requestIdOrGenerate,
    });

    return {
      error: 'ValidationError',
      message: 'Validation failed',
      statusCode: 400,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      requestId: requestIdOrGenerate,
    };
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, requestIdOrGenerate);
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error('Prisma unknown error', {
      message: error.message,
      requestId: requestIdOrGenerate,
    });

    logErrorToDb({
      message: `Prisma Unknown: ${error.message}`,
      stack: error.stack,
      source: 'backend',
      context: { requestId: requestIdOrGenerate, type: 'PrismaClientUnknownRequestError' }
    });

    return {
      error: 'DatabaseError',
      message: 'Database operation failed',
      statusCode: 500,
      requestId: requestIdOrGenerate,
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error('Prisma initialization error', {
      message: error.message,
      requestId: requestIdOrGenerate,
    });

    logErrorToDb({
      message: `Prisma Init: ${error.message}`,
      stack: error.stack,
      source: 'backend',
      context: { requestId: requestIdOrGenerate, type: 'PrismaClientInitializationError' }
    });

    return {
      error: 'DatabaseError',
      message: 'Database connection failed',
      statusCode: 500,
      requestId: requestIdOrGenerate,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack,
      requestId: requestIdOrGenerate,
    });

    logErrorToDb({
      message: error.message,
      stack: error.stack,
      source: 'backend',
      context: { requestId: requestIdOrGenerate, type: 'UnexpectedError' }
    });

    return {
      error: 'InternalServerError',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred',
      statusCode: 500,
      requestId: requestIdOrGenerate,
    };
  }

  // Handle unknown errors
  logger.error('Unknown error', {
    error,
    requestId: requestIdOrGenerate,
  });

  logErrorToDb({
    message: 'Unknown Error',
    source: 'backend',
    context: { requestId: requestIdOrGenerate, rawError: JSON.stringify(error) }
  });

  return {
    error: 'UnknownError',
    message: 'An unexpected error occurred',
    statusCode: 500,
    requestId: requestIdOrGenerate,
  };
}

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, requestId: string) {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      const field = error.meta?.target as string[] || ['field'];
      logger.warn('Unique constraint violation', {
        field,
        requestId,
      });

      return {
        error: 'ConflictError',
        message: `${field.join(', ')} already exists`,
        statusCode: 409,
        requestId,
      };

    case 'P2025': // Record not found
      logger.warn('Record not found', {
        cause: error.meta?.cause,
        requestId,
      });

      return {
        error: 'NotFoundError',
        message: 'Record not found',
        statusCode: 404,
        requestId,
      };

    case 'P2014': // Invalid ID
      logger.warn('Invalid ID', {
        details: error.meta,
        requestId,
      });

      return {
        error: 'ValidationError',
        message: 'Invalid ID provided',
        statusCode: 400,
        requestId,
      };

    default:
      logger.error('Prisma error', {
        code: error.code,
        message: error.message,
        meta: error.meta,
        requestId,
      });

      return {
        error: 'DatabaseError',
        message: 'Database operation failed',
        statusCode: 500,
        requestId,
      };
  }
}

export function createErrorResponse(error: unknown, requestId?: string): NextResponse {
  const errorResponse = handleError(error, requestId);
  
  const response = NextResponse.json(errorResponse, {
    status: errorResponse.statusCode,
  });

  // Add rate limit headers if it's a rate limit error
  if (error instanceof RateLimitError && error.details?.retryAfter) {
    response.headers.set('Retry-After', error.details.retryAfter.toString());
  }

  return response;
}

export function wrapAsyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  }) as T;
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  handleError,
  createErrorResponse,
  wrapAsyncHandler,
};