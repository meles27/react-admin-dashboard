// base.ts (Base class for all errors)
export class HttpError extends Error {
  statusCode: number;
  message: string;
  errors?: any;

  constructor(statusCode: number, message: string, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    // Capture the stack trace (for debugging)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 400 - Bad Request
export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request", errors?: any) {
    super(400, message, errors);
  }
}

// 401 - Unauthorized
export class UnauthorizedError extends HttpError {
  constructor(
    message: string = "Authentication credentials were not provided.",
    errors?: any
  ) {
    super(401, message, errors);
  }
}

export class AccountInactiveError extends HttpError {
  constructor(
    message: string = "Your account is not active. Please contact support",
    errors?: any
  ) {
    super(403, message, errors);
  }
}

// 403 - Forbidden
export class ForbiddenError extends HttpError {
  constructor(
    message: string = "You do not have permission to perform this action.",
    errors?: any
  ) {
    super(403, message, errors);
  }
}

// 404 - Not Found
export class NotFoundError extends HttpError {
  constructor(
    message: string = "Oops! We couldn't find what you're looking for.",
    errors?: any
  ) {
    super(404, message, errors);
  }
}

// 409 - Conflict
export class ConflictError extends HttpError {
  constructor(
    message: string = "Resource conflict. Please resolve the issue and try again.",
    errors?: any
  ) {
    super(409, message, errors);
  }
}

// 500 - Internal Server Error
export class InternalServerError extends HttpError {
  constructor(
    message: string = "We're experiencing technical difficulties. Please try again.",
    errors?: any
  ) {
    super(500, message, errors);
  }
}

// 502 - Bad Gateway
export class BadGatewayError extends HttpError {
  constructor(message: string = "Bad Gateway", errors?: any) {
    super(502, message, errors);
  }
}

// 503 - Service Unavailable
export class ServiceUnavailableError extends HttpError {
  constructor(
    message: string = "Please try again later. The service is temporarily unavailable.",
    errors?: any
  ) {
    super(503, message, errors);
  }
}

// 504 - Gateway Timeout
export class GatewayTimeoutError extends HttpError {
  constructor(message: string = "Gateway Timeout", errors?: any) {
    super(504, message, errors);
  }
}

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
