import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * HTTP Status Code Standards for Error Responses
 * Reference: RFC 7231 / RFC 7235
 *
 * 4xx - Client Errors
 * - 400: Bad Request (validation error)
 * - 401: Unauthorized (authentication failed)
 * - 403: Forbidden (authorization failed - authenticated but lacks permission)
 * - 404: Not Found (resource doesn't exist)
 * - 409: Conflict (duplicate key, state conflict)
 * - 429: Too Many Requests (rate limited)
 *
 * 5xx - Server Errors
 * - 500: Internal Server Error (unexpected error)
 * - 503: Service Unavailable (maintenance, database down)
 *
 * COMMON MISTAKE: Using 403 for authentication failures
 * This is WRONG - 403 is for authorization, 401 is for authentication
 */

/**
 * Custom error class for consistent error handling
 * Production-grade: Includes error context and differentiation
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error handler middleware
 * Should be registered LAST in middleware chain
 * Catches all errors and formats responses
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Extract request context for logging
  const requestContext = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  // Handle custom AppError
  if (err instanceof AppError) {
    logger.warn("Handled application error", {
      ...requestContext,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    });

    res.status(err.statusCode).json({
      error: err.message,
      code: err.code || `HTTP_${err.statusCode}`,
      details: err.details,
    });
    return;
  }

  // Handle validation errors (express-validator)
  if ((err as any).statusCode === 400) {
    logger.warn("Validation error", {
      ...requestContext,
      message: err.message,
    });

    res.status(400).json({
      error: err.message,
      code: "VALIDATION_ERROR",
    });
    return;
  }

  // Handle JWT errors (if not caught by middleware)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    logger.warn("JWT error not caught by auth middleware", {
      ...requestContext,
      errorName: err.name,
      message: err.message,
    });

    res.status(401).json({
      error: "Invalid authentication token",
      code: "AUTH_ERROR",
    });
    return;
  }

  // Handle unexpected errors
  logger.error("Unhandled error", err, {
    ...requestContext,
    errorName: err.name,
    errorStack: err.stack,
  });

  // Generic 500 response (don't leak error details to client)
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}

export default {
  AppError,
  errorHandler,
};
