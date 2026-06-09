export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', id ? `${resource} with id ${id} not found` : `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(409, 'CONFLICT', message);
  }
}

export class AccountLockedError extends AppError {
  constructor(unlockAt?: Date) {
    super(
      423,
      'ACCOUNT_LOCKED',
      unlockAt
        ? `Account locked. Try again after ${unlockAt.toISOString()}`
        : 'Account is temporarily locked due to multiple failed login attempts',
    );
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later') {
    super(429, 'TOO_MANY_REQUESTS', message);
  }
}
