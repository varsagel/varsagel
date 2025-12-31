import { prisma } from '@/lib/prisma';

export type ErrorSource = 'frontend' | 'backend' | 'boundary' | 'unknown';

interface LogErrorParams {
  message: string;
  stack?: string;
  source?: ErrorSource;
  url?: string;
  method?: string;
  userId?: string;
  context?: any;
}

export async function logErrorToDb(params: LogErrorParams) {
  try {
    // Only log in production or if explicitly enabled, 
    // but for this task we want to log everything to show in admin panel
    
    // Sanitize context to ensure it's valid JSON
    const context = params.context ? JSON.parse(JSON.stringify(params.context)) : undefined;

    await prisma.errorLog.create({
      data: {
        message: params.message.substring(0, 1000), // Truncate if too long
        stack: params.stack,
        source: params.source || 'unknown',
        url: params.url,
        method: params.method,
        userId: params.userId,
        context: context,
      },
    });
  } catch (error) {
    // Fail silently - logging shouldn't crash the app
    console.error('Failed to write error log to DB:', error);
  }
}

export const logger = {
  error: async (message: string, error?: any, context?: any) => {
    console.error(message, error);
    await logErrorToDb({
      message,
      stack: error instanceof Error ? error.stack : String(error),
      source: 'backend',
      context
    });
  },
  warn: async (message: string, context?: any) => {
    console.warn(message, context);
    await logErrorToDb({
      message: `[WARN] ${message}`,
      source: 'backend',
      context
    });
  },
  info: async (message: string, context?: any) => {
    console.log(message, context);
    // Optional: Don't save info logs to DB to save space, or create a separate table/level
  }
};
