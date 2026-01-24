interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly keyGenerator: (req: Request) => string;

  constructor(options: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
  }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
  }

  private defaultKeyGenerator(req: Request): string {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `rate_limit:${ip}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  async checkLimit(req: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    this.cleanup();
    
    const key = this.keyGenerator(req);
    const now = Date.now();
    
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }
    
    if (this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }
    
    const allowed = this.store[key].count < this.maxRequests;
    
    if (allowed) {
      this.store[key].count++;
    }
    
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - this.store[key].count),
      resetTime: this.store[key].resetTime,
    };
  }
}

// Different rate limit configurations
export const rateLimiters = {
  // General API requests: 500 requests per 15 minutes
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500,
  }),
  
  // Login attempts: 30 requests per 15 minutes (more lenient for login)
  login: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30,
  }),
  
  // Auth endpoints: 200 requests per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
  }),
  
  // Password reset: 20 requests per hour
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
  }),
  
  // Listing creation: 50 requests per hour
  listing: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `listing_rate:${userId}`;
    },
  }),
  userAction: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 60,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      if (userId) return `user_action:${userId}`;
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      return `user_action:${ip}`;
    },
  }),

  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 120,
  }),
  
  // Admin endpoints: 1000 requests per 5 minutes
  admin: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 1000,
  }),
};

export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async function rateLimitMiddleware(req: Request): Promise<Response | null> {
    const result = await limiter.checkLimit(req);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    return null;
  };
}
