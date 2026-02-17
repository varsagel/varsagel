import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRateLimitMiddleware, rateLimiters } from '@/lib/rate-limit';

// Security headers configuration
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': process.env.NODE_ENV === 'development' 
    ? "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; connect-src * ws: wss:; font-src *;"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;",
  'Strict-Transport-Security': process.env.NODE_ENV === 'production' ? 'max-age=31536000; includeSubDomains; preload' : 'max-age=0',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const suspiciousTracker = new Map<string, { count: number; firstSeen: number; blockedUntil?: number; lastLog?: number }>();
const SUSPICIOUS_WINDOW_MS = 10 * 60 * 1000;
const SUSPICIOUS_BLOCK_THRESHOLD = 15;
const SUSPICIOUS_BLOCK_MS = 30 * 60 * 1000;
const SUSPICIOUS_LOG_THROTTLE_MS = 60 * 1000;

function applySecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  return response;
}

function getClientIp(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
  return String(ip || '').split(',')[0].trim().toLowerCase();
}

function isLocalIp(ipRaw: string) {
  return ipRaw === '127.0.0.1' || ipRaw === '::1' || ipRaw.startsWith('::ffff:127.0.0.1');
}

// Rate limiting rules
const rateLimitRules = [
  {
    path: '/api/upload',
    methods: ['POST'],
    limiter: rateLimiters.upload,
  },
  {
    path: '/api/auth/callback/credentials',
    methods: ['POST'],
    limiter: rateLimiters.login,
  },
  {
    path: '/api/auth/forgot-password',
    methods: ['POST'],
    limiter: rateLimiters.passwordReset,
  },
  {
    path: '/api/auth/reset-password',
    methods: ['POST'],
    limiter: rateLimiters.passwordReset,
  },
  {
    path: '/api/auth',
    methods: ['POST'],
    limiter: rateLimiters.auth,
  },
  {
    path: '/api/register',
    methods: ['POST'],
    limiter: rateLimiters.auth,
  },
  {
    path: '/api/admin',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    limiter: rateLimiters.admin,
  },
  {
    path: '/api',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    limiter: rateLimiters.api,
  },
];

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const debug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROXY === 'true';
  if (debug) {
    console.log('[PROXY] Processing request:', pathname);
  }
  const method = request.method;
  const ipRaw = getClientIp(request);
  const localIp = isLocalIp(ipRaw);
  if (debug) {
    console.log(`[${new Date().toISOString()}] Incoming request: ${method} ${pathname}${search} from ${ipRaw}`);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Create response
  const response = applySecurityHeaders(NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  }));

  if (pathname.startsWith('/uploads/') && (pathname.toLowerCase().endsWith('.jfif') || pathname.toLowerCase().endsWith('.jif'))) {
    response.headers.set('Content-Type', 'image/jpeg');
  }

  const blockedResponse = (retryAfterSeconds?: number) => {
    const res = applySecurityHeaders(
      NextResponse.json({ error: 'Request blocked due to security policy' }, { status: 403 })
    );
    res.headers.set('Cache-Control', 'no-store');
    if (retryAfterSeconds) {
      res.headers.set('Retry-After', String(retryAfterSeconds));
    }
    return res;
  };

  // Check for rate limiting
  for (const rule of rateLimitRules) {
    if (pathname.startsWith(rule.path) && rule.methods.includes(method)) {
      try {
        const rateLimitMiddleware = createRateLimitMiddleware(rule.limiter);
        const rateLimitResponse = await rateLimitMiddleware(request);
        
        if (rateLimitResponse) {
          console.warn(`[${new Date().toISOString()}] Rate limit exceeded: ${method} ${pathname} from ${ipRaw}`);
          return rateLimitResponse;
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Rate limiting error: ${error instanceof Error ? error.message : 'Unknown error'} at ${method} ${pathname} from ${ipRaw}`);
        
        // Continue with request if rate limiting fails
        // Don't block legitimate users due to rate limiting errors
      }
      break; // Only apply first matching rule
    }
  }

  // Check for suspicious patterns
  const now = Date.now();
  const tracker = suspiciousTracker.get(ipRaw);
  if (tracker?.blockedUntil && tracker.blockedUntil > now && !localIp) {
    return blockedResponse(Math.ceil((tracker.blockedUntil - now) / 1000));
  }

  let suspicious = false;
  let suspicionReason: { label: string; matched?: string } | null = null;
  try {
    suspicionReason = getSuspicionReason(request);
    suspicious = !!suspicionReason;
  } catch (error) {
    if (!localIp) {
      console.error(
        `[${new Date().toISOString()}] Suspicious request check failed: ${error instanceof Error ? error.message : 'Unknown error'} at ${method} ${pathname}${search} from ${ipRaw}`
      );
    }
    return blockedResponse();
  }

  if (suspicious) {
    if (!localIp) {
      const current = suspiciousTracker.get(ipRaw);
      const withinWindow = current && now - current.firstSeen < SUSPICIOUS_WINDOW_MS;
      const next = {
        count: withinWindow ? (current?.count || 0) + 1 : 1,
        firstSeen: withinWindow ? current!.firstSeen : now,
        blockedUntil: current?.blockedUntil,
        lastLog: current?.lastLog,
      };
      if (next.count >= SUSPICIOUS_BLOCK_THRESHOLD) {
        next.blockedUntil = now + SUSPICIOUS_BLOCK_MS;
      }
      if (!next.lastLog || now - next.lastLog > SUSPICIOUS_LOG_THROTTLE_MS) {
        const matched = suspicionReason?.matched ? ` (matched: ${suspicionReason.matched})` : '';
        console.warn(`[${new Date().toISOString()}] ${suspicionReason?.label || 'Suspicious request'}: ${method} ${pathname}${search} from ${ipRaw}${matched}`);
        next.lastLog = now;
      }
      suspiciousTracker.set(ipRaw, next);
    }
    return blockedResponse();
  }

  return response;
}

function getSuspicionReason(request: NextRequest): { label: string; matched?: string } | null {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  const pathnameLower = pathname.toLowerCase();
  
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROXY === 'true') {
    console.log(`[DEBUG] Checking request: ${pathnameLower}`);
  }
  
  // Skip security checks for static assets
  const staticAssetExtensions = ['.png', '.jpg', '.jpeg', '.jfif', '.jif', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.css', '.js', '.json', '.xml', '.txt'];
  
  // If it's a static asset, skip all security checks
  if (staticAssetExtensions.some(ext => pathnameLower.endsWith(ext))) {
    // console.log(`[DEBUG] Skipping static asset: ${pathnameLower}`);
    return null;
  }
  
  // Skip security checks for images folder
  if (pathnameLower.startsWith('/images/')) {
    // console.log(`[DEBUG] Skipping images folder: ${pathnameLower}`);
    return null;
  }
  
  // Block known malicious user agents
  const maliciousUserAgents = [
    'sqlmap',
    'nikto',
    'nessus',
    'burp',
    'zap',
    'acunetix',
    'nmap',
    'masscan',
    'shodan',
  ];

  if (maliciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    const matchedAgent = maliciousUserAgents.find(agent => userAgent.toLowerCase().includes(agent));
    return { label: 'Malicious UA blocked', matched: matchedAgent };
  }

  // Block suspicious paths (only those that are definitely not part of the app)
  const suspiciousPaths = [
    '/wp-admin',
    '/wp-login',
    '/administrator',
    '/.env',
    '/config',
    '/phpmyadmin',
    '/mysql',
    '/.git',
    '/api/jsonws',
    '/joomla',
    '/drupal',
    '/magmi',
    '/xmlrpc.php',
    '/wp-config.php',
    '/phpinfo.php',
    '/.htaccess',
    '/.htpasswd',
    '/cgi-bin',
    '/etc/passwd',
    '/etc/shadow',
    '/etc/hosts',
    '/etc/hostname',
  ];

  if (suspiciousPaths.some(path => pathnameLower.startsWith(path) || pathnameLower.endsWith(path))) {
    const matchedPath = suspiciousPaths.find(path => pathnameLower.startsWith(path) || pathnameLower.endsWith(path));
    return { label: 'Suspicious path blocked', matched: matchedPath };
  }

  // Check for SQL injection patterns in search params
  const sqlInjectionPatterns = [
    /(\bunion\b.*\bselect\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bupdate\b.*\bset\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bexec\b.*\b\()/i,
    /(\bexecute\b.*\b\()/i,
  ];

  const searchParams = request.nextUrl.search;
  
  if (searchParams && sqlInjectionPatterns.some(pattern => pattern.test(searchParams))) {
    const matchedPattern = sqlInjectionPatterns.find(pattern => pattern.test(searchParams));
    return { label: 'SQL Injection pattern blocked', matched: String(matchedPattern) };
  }

  // Check for XSS patterns in search params
  const xssPatterns = [
    /(<script)/i,
    /(javascript:)/i,
    /(vbscript:)/i,
    /(onload=)/i,
    /(onerror=)/i,
    /(onclick=)/i,
  ];

  if (searchParams && xssPatterns.some(pattern => pattern.test(searchParams))) {
    const matchedPattern = xssPatterns.find(pattern => pattern.test(searchParams));
    return { label: 'XSS pattern blocked', matched: String(matchedPattern) };
  }

  const rcePatterns = [
    /(\b(?:cmd|powershell|pwsh|bash|sh|zsh|ksh)\b)/i,
    /(\b(?:wget|curl|nc|netcat|ncat)\b)/i,
    /(\b(?:python|perl|ruby|php|lua)\b)/i,
    /(\b(?:whoami|uname|cat)\b)/i,
    /(\b(?:exec|system|shell_exec|popen|proc_open)\b)/i,
    /(\/bin\/(?:sh|bash))/i,
    /(%2fbin%2f(?:sh|bash))/i,
    /(\$\((?:[^)]+)\))/i,
    /(`[^`]+`)/i,
    /(\|\||&&|;|\|)/i,
  ];

  const combined = `${pathnameLower}${searchParams || ''}`;
  if (combined && rcePatterns.some(pattern => pattern.test(combined))) {
    const matchedPattern = rcePatterns.find(pattern => pattern.test(combined));
    return { label: 'RCE pattern blocked', matched: String(matchedPattern) };
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images folder
     * - files with common static extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|images/|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.eot|.*\\.css|.*\\.js|.*\\.json|.*\\.xml|.*\\.txt).*)',
  ],
};
