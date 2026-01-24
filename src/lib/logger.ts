// Helper to check if we are in a Node.js environment with file system access
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
// During Next.js build or edge runtime, we should avoid complex winston setups
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
const isEdge = typeof process !== 'undefined' && (process as any).env?.NEXT_RUNTIME === 'edge';

// Dummy logger for build/edge/browser
const createSimpleLogger = (moduleName?: string) => ({
  info: (msg: string, ...args: any[]) => console.log(`[${moduleName || 'varsagel'}] INFO: ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[${moduleName || 'varsagel'}] ERROR: ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[${moduleName || 'varsagel'}] WARN: ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[${moduleName || 'varsagel'}] DEBUG: ${msg}`, ...args),
  add: () => {},
  transports: []
});

let logger: any;
let createModuleLogger: (module: string) => any;

if (!isNode || isEdge || isBuild) {
  logger = createSimpleLogger();
  createModuleLogger = (module: string) => createSimpleLogger(module);
} else {
  try {
    // We are in Node.js, use winston
    const winston = require('winston');
    const path = require('path');
    const logsDir = path.join(process.cwd(), 'logs');

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, stack }: any) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    );

    logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'varsagel' },
      transports: [
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        ...(process.env.NODE_ENV !== 'production' ? [
          new winston.transports.Console({
            format: consoleFormat,
          })
        ] : []),
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
          maxsize: 5242880,
          maxFiles: 3,
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
          maxsize: 5242880,
          maxFiles: 3,
        }),
      ],
    });

    if (process.env.NODE_ENV === 'production') {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        level: 'error',
      }));
    }

    createModuleLogger = (module: string) => {
      return logger.child({ module });
    };
  } catch {
    logger = createSimpleLogger();
    createModuleLogger = (module: string) => createSimpleLogger(module);
  }
}

export { logger, createModuleLogger };

// Helper functions for common logging scenarios
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context,
  });
};

export const logApiError = (error: Error, req: Request, context?: Record<string, any>) => {
  const url = new URL(req.url);
  logger.error({
    message: error.message,
    stack: error.stack,
    context: {
      method: req.method,
      url: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(req.headers.entries()),
      ...context,
    },
  });
};

export const logDatabaseError = (error: Error, operation: string, context?: Record<string, any>) => {
  logger.error({
    message: `Database error during ${operation}`,
    stack: error.stack,
    context: {
      operation,
      ...context,
    },
  });
};

export default logger;
