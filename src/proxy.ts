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
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
  const ipRaw = String(ip || '').split(',')[0].trim().toLowerCase();
  const isLocalIp = ipRaw === '127.0.0.1' || ipRaw === '::1' || ipRaw.startsWith('::ffff:127.0.0.1');
  if (debug) {
    console.log(`[${new Date().toISOString()}] Incoming request: ${method} ${pathname}${search} from ${ip}`);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (pathname.startsWith('/uploads/') && (pathname.toLowerCase().endsWith('.jfif') || pathname.toLowerCase().endsWith('.jif'))) {
    response.headers.set('Content-Type', 'image/jpeg');
  }

  // Remove server information headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // Check for rate limiting
  for (const rule of rateLimitRules) {
    if (pathname.startsWith(rule.path) && rule.methods.includes(method)) {
      try {
        const rateLimitMiddleware = createRateLimitMiddleware(rule.limiter);
        const rateLimitResponse = await rateLimitMiddleware(request);
        
        if (rateLimitResponse) {
          console.warn(`[${new Date().toISOString()}] Rate limit exceeded: ${method} ${pathname} from ${ip}`);
          return rateLimitResponse;
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Rate limiting error: ${error instanceof Error ? error.message : 'Unknown error'} at ${method} ${pathname} from ${ip}`);
        
        // Continue with request if rate limiting fails
        // Don't block legitimate users due to rate limiting errors
      }
      break; // Only apply first matching rule
    }
  }

  // Check for suspicious patterns
  if (isSuspiciousRequest(request)) {
    if (!isLocalIp) {
      console.warn(`[${new Date().toISOString()}] Suspicious request detected: ${method} ${pathname}${search} from ${ip}`);
    }

    return NextResponse.json(
      { error: 'Request blocked due to security policy' },
      { status: 403 }
    );
  }

  return response;
}

function isSuspiciousRequest(request: NextRequest): boolean {
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
    return false;
  }
  
  // Skip security checks for images folder
  if (pathnameLower.startsWith('/images/')) {
    // console.log(`[DEBUG] Skipping images folder: ${pathnameLower}`);
    return false;
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
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
    const ipRaw = String(ip || '').split(',')[0].trim().toLowerCase();
    const isLocalIp = ipRaw === '127.0.0.1' || ipRaw === '::1' || ipRaw.startsWith('::ffff:127.0.0.1');
    if (!isLocalIp) {
      console.warn(`[${new Date().toISOString()}] Malicious UA blocked: ${userAgent} (matched: ${matchedAgent}) at ${pathname}`);
    }
    return true;
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
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
    const ipRaw = String(ip || '').split(',')[0].trim().toLowerCase();
    const isLocalIp = ipRaw === '127.0.0.1' || ipRaw === '::1' || ipRaw.startsWith('::ffff:127.0.0.1');
    if (!isLocalIp) {
      console.warn(`[${new Date().toISOString()}] Suspicious path blocked: ${pathname} (matched: ${matchedPath})`);
    }
    return true;
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
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
    const ipRaw = String(ip || '').split(',')[0].trim().toLowerCase();
    const isLocalIp = ipRaw === '127.0.0.1' || ipRaw === '::1' || ipRaw.startsWith('::ffff:127.0.0.1');
    if (!isLocalIp) {
      console.warn(`[${new Date().toISOString()}] SQL Injection pattern blocked in search: ${searchParams} (matched: ${matchedPattern})`);
    }
    return true;
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
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
    const ipRaw = String(ip || '').split(',')[0].trim().toLowerCase();
    const isLocalIp = ipRaw === '127.0.0.1' || ipRaw === '::1' || ipRaw.startsWith('::ffff:127.0.0.1');
    if (!isLocalIp) {
      console.warn(`[${new Date().toISOString()}] XSS pattern blocked in search: ${searchParams} (matched: ${matchedPattern})`);
    }
    return true;
  }

  return false;
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
