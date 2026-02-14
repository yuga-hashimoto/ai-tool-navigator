import prisma from './prisma';

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ErrorCategory {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorLogParams {
  message: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  stackTrace?: string;
  context?: any;
  userId?: string;
  url?: string;
}

/**
 * Log an error to the database and console.
 * Handles graceful degradation if the database is unavailable.
 */
export async function logError(params: ErrorLogParams) {
  const {
    message,
    severity = ErrorSeverity.MEDIUM,
    category = ErrorCategory.UNKNOWN,
    stackTrace,
    context,
    userId,
    url,
  } = params;

  // Always log to console
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorTracker]', params);
  } else {
    // Structured log for production (e.g. for cloud watch / datadog)
    console.error(JSON.stringify(params));
  }

  try {
    await prisma.errorLog.create({
      data: {
        message,
        severity,
        category,
        stackTrace: stackTrace || undefined,
        context: context ? JSON.stringify(context) : undefined,
        userId: userId || undefined,
        url: url || undefined,
      },
    });
  } catch (e) {
    // Fallback if DB logging fails - just log to console to avoid crashing the error handler
    console.error('Failed to log error to database:', e);
  }
}

/**
 * Capture an exception and log it with high severity.
 */
export async function captureException(error: unknown, context?: any) {
    let message = 'Unknown error';
    let stackTrace = undefined;

    if (error instanceof Error) {
        message = error.message;
        stackTrace = error.stack;
    } else if (typeof error === 'string') {
        message = error;
    } else {
        try {
          message = JSON.stringify(error);
        } catch {
          message = 'Unserializable error object';
        }
    }

    await logError({
        message,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.BACKEND,
        stackTrace,
        context
    });
}
