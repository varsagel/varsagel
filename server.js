const { createServer } = require('https');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const root = process.cwd();
  const envLocal = path.join(root, '.env.local');
  const envProduction = path.join(root, '.env.production');
  const envDefault = path.join(root, '.env');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(envProduction)) {
    dotenv.config({ path: envProduction });
  }
  if (fs.existsSync(envDefault)) {
    dotenv.config({ path: envDefault });
  }
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal, override: true });
  }
}

loadEnv();

// Clean up environment variables (remove quotes if present)
['GOOGLE_ID', 'GOOGLE_SECRET', 'AUTH_SECRET', 'NEXTAUTH_URL', 'AUTH_URL', 'DATABASE_URL', 'CANONICAL_URL', 'CANONICAL_HOST'].forEach(key => {
  if (process.env[key]) {
    process.env[key] = process.env[key].replace(/^"|"$/g, '').trim();
  }
});

function normalizeOriginEnv(key) {
  const raw = (process.env[key] || '').trim();
  if (!raw) return;
  try {
    const u = new URL(raw);
    process.env[key] = u.origin;
  } catch {}
}

normalizeOriginEnv('CANONICAL_URL');
normalizeOriginEnv('NEXTAUTH_URL');
normalizeOriginEnv('AUTH_URL');

const http = require('http');
const zlib = require('node:zlib');
const { parse } = require('url');
const next = require('next');

function getCanonicalFromEnv() {
  const raw = process.env.CANONICAL_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return { protocol: u.protocol, host: u.hostname };
  } catch {
    return null;
  }
}

function getReqHost(req) {
  const h = req.headers.host || '';
  return String(h).split(',')[0].trim();
}

function getReqHostname(req) {
  const h = getReqHost(req);
  return h.split(':')[0];
}

function isHttpsRequest(req) {
  const xfProto = (req.headers['x-forwarded-proto'] || '').toString().split(',')[0].trim().toLowerCase();
  if (xfProto) return xfProto === 'https';
  return false;
}

const dev = process.env.NODE_ENV !== 'production';
const devPort = Number(process.env.PORT || 3000);
const useHttpsInDev = dev && process.env.FORCE_VARSAGEL_DOMAIN === "true";

if (dev && process.env.FORCE_VARSAGEL_DOMAIN !== "true") {
  process.env.NEXTAUTH_URL = `http://localhost:${devPort}`;
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
} else {
  if (process.env.CANONICAL_URL) {
    if (!process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = process.env.CANONICAL_URL;
    if (!process.env.AUTH_URL) process.env.AUTH_URL = process.env.NEXTAUTH_URL;
  }
}
if (!process.env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = "true";

console.log('Server Env Config:');
console.log('CANONICAL_URL:', process.env.CANONICAL_URL);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('AUTH_URL:', process.env.AUTH_URL);

if (!dev) {
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    if (!fs.existsSync(buildIdPath)) {
      const middlewareManifestPath = path.join(process.cwd(), '.next', 'server', 'middleware-manifest.json');
      let buildId = null;
      if (fs.existsSync(middlewareManifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(middlewareManifestPath, 'utf8'));
        buildId = manifest?.middleware?.['/']?.env?.__NEXT_BUILD_ID || null;
      }
      if (!buildId) {
        const staticDir = path.join(process.cwd(), '.next', 'static');
        if (fs.existsSync(staticDir)) {
          const dirs = fs.readdirSync(staticDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .filter((name) => name !== 'chunks' && name !== 'css' && name !== 'media' && name !== 'development');
          buildId = dirs[0] || null;
        }
      }
      if (buildId) {
        fs.writeFileSync(buildIdPath, String(buildId), 'utf8');
      }
    }

    const routesManifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
    if (!fs.existsSync(routesManifestPath)) {
      const devRoutesManifestPath = path.join(process.cwd(), '.next', 'dev', 'routes-manifest.json');
      if (fs.existsSync(devRoutesManifestPath)) {
        fs.copyFileSync(devRoutesManifestPath, routesManifestPath);
      }
    }
    if (!fs.existsSync(routesManifestPath)) {
      const minimalRoutesManifest = {
        version: 3,
        caseSensitive: false,
        basePath: '',
        rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
        redirects: [],
        headers: [],
        dataRoutes: [],
        dynamicRoutes: [],
        staticRoutes: [],
        i18n: null
      };
      fs.writeFileSync(routesManifestPath, JSON.stringify(minimalRoutesManifest), 'utf8');
    }
    if (fs.existsSync(routesManifestPath)) {
      try {
        const current = JSON.parse(fs.readFileSync(routesManifestPath, 'utf8'));
        const normalized = {
          version: current?.version ?? 3,
          caseSensitive: current?.caseSensitive ?? false,
          basePath: current?.basePath ?? '',
          rewrites: current?.rewrites ?? { beforeFiles: [], afterFiles: [], fallback: [] },
          redirects: Array.isArray(current?.redirects) ? current.redirects : [],
          headers: Array.isArray(current?.headers) ? current.headers : [],
          dataRoutes: Array.isArray(current?.dataRoutes) ? current.dataRoutes : [],
          dynamicRoutes: Array.isArray(current?.dynamicRoutes) ? current.dynamicRoutes : [],
          staticRoutes: Array.isArray(current?.staticRoutes) ? current.staticRoutes : [],
          i18n: current?.i18n ?? null
        };

        if (!normalized.dynamicRoutes.length) {
          try {
            const appPathsManifestPath = path.join(process.cwd(), '.next', 'server', 'app-paths-manifest.json');
            if (fs.existsSync(appPathsManifestPath)) {
              const appPathsManifest = JSON.parse(fs.readFileSync(appPathsManifestPath, 'utf8'));

              const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

              const appPathToRoute = (appPath) => {
                if (appPath.endsWith('/page')) return appPath.slice(0, -'/page'.length) || '/';
                if (appPath.endsWith('/route')) return appPath.slice(0, -'/route'.length) || '/';
                return appPath || '/';
              };

              const buildDynamicRoute = (route) => {
                const segments = String(route).split('/').filter(Boolean);
                const routeKeys = {};

                const namedParts = segments.map((seg) => {
                  if (seg.startsWith('[[...') && seg.endsWith(']]')) {
                    const name = seg.slice('[[...'.length, -2);
                    routeKeys[name] = name;
                    return `(?<${name}>.*)`;
                  }

                  if (seg.startsWith('[...') && seg.endsWith(']')) {
                    const name = seg.slice('[...'.length, -1);
                    routeKeys[name] = name;
                    return `(?<${name}>.+?)`;
                  }

                  if (seg.startsWith('[') && seg.endsWith(']')) {
                    const name = seg.slice(1, -1);
                    routeKeys[name] = name;
                    return `(?<${name}>[^/]+?)`;
                  }

                  return escapeRegex(seg);
                });

                const namedRegex = `^\\/${namedParts.join('\\/')}(?:\\/)?$`;
                const regex = namedRegex.replace(/\(\?<([A-Za-z0-9_]+)>/g, '(');

                return {
                  page: route,
                  regex,
                  routeKeys,
                  namedRegex,
                };
              };

              const dynamicRoutes = Array.from(
                new Set(
                  Object.keys(appPathsManifest || {})
                    .map(appPathToRoute)
                    .filter((r) => r.includes('['))
                )
              )
                .map(buildDynamicRoute)
                .filter(Boolean)
                .sort((a, b) => String(b.page || '').length - String(a.page || '').length);

              normalized.dynamicRoutes = dynamicRoutes;
            }
          } catch {}
        }

        fs.writeFileSync(routesManifestPath, JSON.stringify(normalized), 'utf8');
      } catch {}
    }

    const prerenderManifestPath = path.join(process.cwd(), '.next', 'prerender-manifest.json');
    if (!fs.existsSync(prerenderManifestPath)) {
      const devPrerenderManifestPath = path.join(process.cwd(), '.next', 'dev', 'prerender-manifest.json');
      if (fs.existsSync(devPrerenderManifestPath)) {
        fs.copyFileSync(devPrerenderManifestPath, prerenderManifestPath);
      }
    }
    if (!fs.existsSync(prerenderManifestPath)) {
      const minimalPrerenderManifest = {
        version: 4,
        routes: {},
        dynamicRoutes: {},
        notFoundRoutes: [],
        preview: {}
      };
      fs.writeFileSync(prerenderManifestPath, JSON.stringify(minimalPrerenderManifest), 'utf8');
    }

    const appPathsManifestPath = path.join(process.cwd(), '.next', 'server', 'app-paths-manifest.json');
    const appPathRoutesManifestPath = path.join(process.cwd(), '.next', 'app-path-routes-manifest.json');
    if (!fs.existsSync(appPathRoutesManifestPath) && fs.existsSync(appPathsManifestPath)) {
      const appPathsManifest = JSON.parse(fs.readFileSync(appPathsManifestPath, 'utf8'));
      const appPathRoutesManifest = {};
      for (const appPath of Object.keys(appPathsManifest || {})) {
        if (appPath.endsWith('/page')) {
          const route = appPath.slice(0, -'/page'.length) || '/';
          appPathRoutesManifest[appPath] = route;
          continue;
        }
        if (appPath.endsWith('/route')) {
          const route = appPath.slice(0, -'/route'.length) || '/';
          appPathRoutesManifest[appPath] = route;
          continue;
        }
        appPathRoutesManifest[appPath] = appPath;
      }
      fs.writeFileSync(appPathRoutesManifestPath, JSON.stringify(appPathRoutesManifest), 'utf8');
    }

    const serverFilesManifestPath = path.join(process.cwd(), '.next', 'required-server-files.json');
    if (!fs.existsSync(serverFilesManifestPath)) {
      const distDir = '.next';
      const candidateFiles = [
        'routes-manifest.json',
        'build-manifest.json',
        'prerender-manifest.json',
        'react-loadable-manifest.json',
        'BUILD_ID',
        'required-server-files.json',
        'server/app-paths-manifest.json',
        'app-path-routes-manifest.json',
        'server/server-reference-manifest.js',
        'server/server-reference-manifest.json',
        'server/middleware-manifest.json',
        'server/middleware-build-manifest.js',
        'server/middleware-react-loadable-manifest.js',
        'server/next-font-manifest.js',
        'server/next-font-manifest.json',
        'server/functions-config-manifest.json',
        'server/pages-manifest.json',
      ];

      const files = candidateFiles
        .map((f) => path.join(distDir, f))
        .filter((fp) => {
          try {
            return fp.endsWith(path.join(distDir, 'required-server-files.json')) || fs.existsSync(path.join(process.cwd(), fp));
          } catch {
            return false;
          }
        });

      const manifest = {
        version: 1,
        config: { distDir },
        appDir: process.cwd(),
        relativeAppDir: '.',
        files,
        ignore: [],
      };

      fs.writeFileSync(serverFilesManifestPath, JSON.stringify(manifest), 'utf8');
    }
  } catch {}
}

const app = next({ dev, webpack: dev });
const handle = app.getRequestHandler();

let devServerInstance = null;
let httpsServerInstance = null;
let httpRedirectServerInstance = null;

function getHostWithoutPort(req) {
  const rawHost = (req.headers.host || '').toLowerCase();
  return rawHost.split(':')[0];
}

const MIME_BY_EXT = {
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
};

function serveDefaultImageFallback(req, res, parsedUrl) {
  const pathname = parsedUrl?.pathname || '';
  if (!pathname.startsWith('/images/defaults/') || !pathname.toLowerCase().endsWith('.webp')) return false;

  const defaultsDir = path.join(process.cwd(), 'public', 'images', 'defaults');
  const name = pathname.split('/').pop() || '';
  const base = name.replace(/\.webp$/i, '');
  const candidates = [];
  if (base) candidates.push(base);
  const parts = base.split('-').filter(Boolean);
  for (let i = 1; i < parts.length; i++) candidates.push(parts.slice(i).join('-'));

  let filePath = null;
  for (const c of candidates) {
    const fp = path.join(defaultsDir, `${c}.webp`);
    try {
      const stat = fs.statSync(fp);
      if (stat.isFile()) {
        filePath = fp;
        break;
      }
    } catch {}
  }
  if (!filePath) return false;

  try {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function serveNextStaticAsset(req, res, parsedUrl) {
  const pathname = parsedUrl?.pathname || '';
  if (!pathname.startsWith('/_next/static/')) return false;

  const rawRelPath = pathname.slice('/_next/static/'.length);
  const decodeOnce = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const sanitizeRelPath = (value) => {
    if (!value) return value;
    return value.replace(/\)+$/g, '');
  };
  const normalizeRelPath = (value) => {
    if (!value) return value;
    let next = sanitizeRelPath(value);
    next = next.replace(/%5B/gi, '[').replace(/%5D/gi, ']');
    next = next.replace(/%29/gi, ')');
    return next;
  };

  const rawBase = sanitizeRelPath(rawRelPath);
  const decodedOnce = decodeOnce(rawBase);
  const decodedTwice = decodeOnce(decodedOnce);
  const relPathCandidates = [];
  const addRelPath = (value) => {
    if (!value) return;
    const next = value.trim();
    if (!next) return;
    if (!relPathCandidates.includes(next)) relPathCandidates.push(next);
  };

  addRelPath(rawBase);
  addRelPath(decodedOnce);
  addRelPath(decodedTwice);
  addRelPath(normalizeRelPath(rawBase));
  addRelPath(normalizeRelPath(decodedOnce));
  addRelPath(normalizeRelPath(decodedTwice));

  const primaryRelPath =
    normalizeRelPath(decodedTwice) ||
    normalizeRelPath(decodedOnce) ||
    decodedTwice ||
    decodedOnce ||
    rawBase;

  if (primaryRelPath && !primaryRelPath.includes('/')) {
    if (primaryRelPath.endsWith('.css')) {
      relPathCandidates.push(`css/${primaryRelPath}`);
    } else if (primaryRelPath.endsWith('.js')) {
      relPathCandidates.push(`chunks/${primaryRelPath}`);
    }
  }

  const serveFile = (fp, req) => {
    const ext = path.extname(fp).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    const stat = fs.statSync(fp);
    const stream = fs.createReadStream(fp);
    const acceptsEncoding = String(req.headers['accept-encoding'] || '');
    const isCompressible = /^(text\/|application\/(javascript|json|xml|xhtml\+xml)|image\/svg\+xml)/i.test(contentType);
    const shouldCompress = isCompressible && stat.size > 1024;
    let compression = null;
    if (shouldCompress && /\bbr\b/i.test(acceptsEncoding)) {
      compression = { encoding: 'br', stream: zlib.createBrotliCompress() };
    } else if (shouldCompress && /\bgzip\b/i.test(acceptsEncoding)) {
      compression = { encoding: 'gzip', stream: zlib.createGzip() };
    }

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    };
    if (compression) {
      headers['Content-Encoding'] = compression.encoding;
      headers['Vary'] = 'Accept-Encoding';
    } else {
      headers['Content-Length'] = stat.size;
      headers['Accept-Ranges'] = 'bytes';
    }
    res.writeHead(200, headers);

    stream.on('error', () => {
      try {
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          });
        }
        res.end('Internal Server Error');
      } catch {}
    });

    if (compression) {
      compression.stream.on('error', () => {
        try {
          if (!res.headersSent) {
            res.writeHead(500, {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-store',
            });
          }
          res.end('Internal Server Error');
        } catch {}
      });
      stream.pipe(compression.stream).pipe(res);
    } else {
      stream.pipe(res);
    }
  };

  const findFallbackChunk = (baseDir, kind) => {
    try {
      const entries = fs.readdirSync(baseDir, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.startsWith(`${kind}-`) && d.name.endsWith('.js'))
        .map((d) => d.name);
      if (!entries.length) return null;
      return path.join(baseDir, entries[0]);
    } catch {
      return null;
    }
  };

  const rootCandidates = Array.from(new Set([
    process.cwd(),
    path.resolve(__dirname),
  ]));

  const tryServeFromRelPath = (relPath) => {
    if (relPath.includes('..')) return false;
    for (const root of rootCandidates) {
      const fp = path.join(root, '.next', 'static', relPath);
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) continue;
      serveFile(fp, req);
      return true;
    }
    return null;
  };

  const tryServeFromBackup = (relPath) => {
    if (relPath.includes('..')) return false;
    for (const root of rootCandidates) {
      const fp = path.join(root, '.next-static-prev', relPath);
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) continue;
      serveFile(fp, req);
      return true;
    }
    return null;
  };

  const tryServeAppChunkFallback = (relPath, rootDir) => {
    const match = relPath.match(/^(chunks\/app\/.+\/)(page|layout|template|loading|error|not-found)-[^/]+\.js$/i);
    if (!match) return false;
    const relDir = match[1];
    const kind = match[2];
    const dir = path.join(rootDir, relDir);
    try {
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) return false;
    } catch {
      return false;
    }
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.startsWith(`${kind}-`) && d.name.endsWith('.js'))
        .map((d) => d.name);
      if (!entries.length) return false;
      const fp = path.join(dir, entries[0]);
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) return false;
      serveFile(fp, req);
      return true;
    } catch {
      return false;
    }
  };

  const tryServeFallback = (relPath, rootDir) => {
    if (tryServeAppChunkFallback(relPath, rootDir)) return true;
    return false;
  };

  const tryServeKategoriFallback = (rootDir, kind) => {
    return false;
  };

  const shouldReturnReloadScript = (relPath) => {
    return /\/chunks\/.+\.js$/i.test(relPath);
  };

  const sendReloadScript = () => {
    const body = `(function(){try{if(typeof window!=="undefined"){var u=window.location.href;var sep=u.indexOf("?")===-1?"?":"&";if(u.indexOf("chunk-retry=")===-1){window.location.replace(u+sep+"chunk-retry="+Date.now());}else{window.location.reload();}}}catch(e){}})();`;
    try {
      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
          'Content-Length': Buffer.byteLength(body, 'utf8'),
        });
      }
      res.end(body);
    } catch {
      try {
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          });
        }
        res.end('Internal Server Error');
      } catch {}
    }
  };

  try {
    for (const relPath of relPathCandidates) {
      const served = tryServeFromRelPath(relPath);
      if (served) return true;
    }
    for (const relPath of relPathCandidates) {
      const served = tryServeFromBackup(relPath);
      if (served) return true;
    }
    for (const relPath of relPathCandidates) {
      for (const root of rootCandidates) {
        if (tryServeFallback(relPath, path.join(root, '.next', 'static'))) return true;
      }
    }
    for (const relPath of relPathCandidates) {
      for (const root of rootCandidates) {
        if (tryServeFallback(relPath, path.join(root, '.next-static-prev'))) return true;
      }
    }

    const maybeKategori = relPathCandidates.some((relPath) => /\/chunks\/app\/kategori\//i.test(relPath));
    if (maybeKategori) {
      for (const root of rootCandidates) {
        if (tryServeKategoriFallback(path.join(root, '.next', 'static'), 'page')) return true;
      }
      for (const root of rootCandidates) {
        if (tryServeKategoriFallback(path.join(root, '.next-static-prev'), 'page')) return true;
      }
    }

    for (const relPath of relPathCandidates) {
      if (shouldReturnReloadScript(relPath)) {
        sendReloadScript();
        return true;
      }
    }

    try {
      if (!res.headersSent) {
        res.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        });
      }
      res.end('Not Found');
    } catch {}
    return true;
  } catch {
    try {
      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        });
      }
      res.end('Internal Server Error');
    } catch {}
    return true;
  }
}

let httpsOptions = null;
if (!dev || useHttpsInDev) {
  try {
    const keyPath = path.join(__dirname, 'server.key');
    const certPath = path.join(__dirname, 'server.crt');
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } catch (e) {
    httpsOptions = null;
  }
}

app.prepare().then(() => {
  if (dev && !useHttpsInDev) {
    devServerInstance = http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      console.log(`[DevServer] Request: ${req.method} ${req.url}`);
      handle(req, res, parsedUrl);
    });

    devServerInstance.on('upgrade', (req, socket, head) => {
      const parsedUrl = parse(req.url, true);
      handle(req, socket, head);
    });

    devServerInstance.listen(devPort, '0.0.0.0', () => {
      console.log(`> ${process.env.NEXTAUTH_URL} üzerinde hazır`);
    });

    devServerInstance.on('error', (err) => {
      console.error('Error binding dev server:', err.message);
    });
    return;
  }

  if (dev && useHttpsInDev) {
    if (!httpsOptions) {
      devServerInstance = http.createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });

      devServerInstance.listen(devPort, '0.0.0.0', () => {
        console.log(`> ${process.env.NEXTAUTH_URL} üzerinde hazır`);
      });

      devServerInstance.on('error', (err) => {
        console.error('Error binding dev server:', err.message);
      });
      return;
    }

    httpsServerInstance = createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      if (dev) {
        console.log(`[DevServer] Request: ${req.method} ${req.url}`);
      }

      const canonical = getCanonicalFromEnv();
      const host = getReqHostname(req);
      const pathname = parsedUrl?.pathname || '';
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
      const shouldBypassHostRedirect =
        isLocalHost
        || pathname.startsWith('/uploads/')
        || pathname.startsWith('/_next/image');

      if (!shouldBypassHostRedirect && canonical?.host && host && host !== canonical.host) {
        const redirectUrl = `${canonical.protocol || 'https:'}//${canonical.host}` + (req.url || '/');
        res.writeHead(301, { Location: redirectUrl });
        res.end();
        return;
      }

      handle(req, res, parsedUrl);
    });

    httpsServerInstance.on('error', (err) => {
      if (!process.env.PORT) {
        console.error('Port 443\'e bağlanırken hata:', err);
        console.log('Yedek port 3004 deneniyor...');
        createServer(httpsOptions, (req, res) => {
          const parsedUrl = parse(req.url, true);
          if (serveDefaultImageFallback(req, res, parsedUrl)) return;
          if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
          handle(req, res, parsedUrl);
        }).listen(3004, '0.0.0.0', () => {
          console.log('> https://www.varsagel.com:3004 üzerinde hazır');
        });
      } else {
        console.error(`Port ${process.env.PORT}'e bağlanırken hata:`, err);
      }
    });

    const httpsPort = process.env.PORT ? Number(process.env.PORT) : 443;
    httpsServerInstance.listen(httpsPort, '0.0.0.0', () => {
      console.log(`> https://www.varsagel.com${httpsPort !== 443 ? ':' + httpsPort : ''} üzerinde hazır`);
    });

    if (!process.env.PORT || process.env.PORT === '443') {
      httpRedirectServerInstance = http.createServer((req, res) => {
      if (req.url && req.url.startsWith('/.well-known/acme-challenge/')) {
        const token = req.url.split('/').pop();
        const filePath = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge', token || '');
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(content);
        } catch (e) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not Found');
        }
        return;
      }
      const canonical = getCanonicalFromEnv();
      const host = canonical?.host || getReqHost(req);
      if (!host) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Bad Request');
        return;
      }
      const proto = canonical?.protocol || 'https:';
      const redirectUrl = `${proto}//${host}${req.url || '/'}`;
      res.writeHead(301, { Location: redirectUrl });
      res.end();
    }).listen(80, '0.0.0.0', () => {
      console.log('> HTTP redirect server on :80');
    }).on('error', (err) => {
      console.error('Error binding to port 80:', err.message);
    });
    }

    return;
  }

  const prodPort = process.env.PORT ? Number(process.env.PORT) : 443;
  if (!dev && prodPort && prodPort !== 443) {
    const httpServer = http.createServer((req, res) => {
      const canonical = getCanonicalFromEnv();
      const host = getReqHostname(req);
      const parsedUrl = parse(req.url, true);
      const pathname = parsedUrl?.pathname || '';
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
      const shouldBypassHostRedirect =
        isLocalHost
        || pathname.startsWith('/uploads/')
        || pathname.startsWith('/_next/image');

      if (!shouldBypassHostRedirect && canonical?.host && host && host !== canonical.host) {
        const redirectUrl = `${canonical.protocol || 'https:'}//${canonical.host}` + (req.url || '/');
        res.writeHead(301, { Location: redirectUrl });
        res.end();
        return;
      }

      if (serveDefaultImageFallback(req, res, parsedUrl)) return;
      if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
      handle(req, res, parsedUrl);
    });

    httpServer.on('error', (err) => {
      console.error(`Port ${prodPort}'e bağlanırken hata:`, err);
    });

    httpServer.listen(prodPort, '0.0.0.0', () => {
      console.log(`> http://127.0.0.1:${prodPort} üzerinde hazır (reverse proxy arkasında)`);
    });
    return;
  }

  if (!dev && prodPort === 443 && !httpsOptions) {
    const fallbackPort = Number(process.env.FALLBACK_PORT || 3004);
    const httpServer = http.createServer((req, res) => {
      const canonical = getCanonicalFromEnv();
      const host = getReqHostname(req);
      const parsedUrl = parse(req.url, true);
      const pathname = parsedUrl?.pathname || '';
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
      const shouldBypassHostRedirect =
        isLocalHost
        || pathname.startsWith('/uploads/')
        || pathname.startsWith('/_next/image');

      if (!shouldBypassHostRedirect && canonical?.host && host && host !== canonical.host) {
        const redirectUrl = `${canonical.protocol || 'https:'}//${canonical.host}` + (req.url || '/');
        res.writeHead(301, { Location: redirectUrl });
        res.end();
        return;
      }

      if (serveDefaultImageFallback(req, res, parsedUrl)) return;
      if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
      handle(req, res, parsedUrl);
    });

    httpServer.on('error', (err) => {
      console.error(`Port ${fallbackPort}'e bağlanırken hata:`, err);
    });

    httpServer.listen(fallbackPort, '0.0.0.0', () => {
      console.log(`> HTTPS sertifikası bulunamadı; reverse proxy için http://127.0.0.1:${fallbackPort} üzerinde hazır`);
    });
    return;
  }

  httpsServerInstance = createServer(httpsOptions, (req, res) => {
    const canonical = getCanonicalFromEnv();
    const host = getReqHostname(req);
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl?.pathname || '';
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const shouldBypassHostRedirect =
      isLocalHost
      || pathname.startsWith('/uploads/')
      || pathname.startsWith('/_next/image');

    if (!shouldBypassHostRedirect && canonical?.host && host && host !== canonical.host) {
      const redirectUrl = `${canonical.protocol || 'https:'}//${canonical.host}` + (req.url || '/');
      res.writeHead(301, { Location: redirectUrl });
      res.end();
      return;
    }

    if (serveDefaultImageFallback(req, res, parsedUrl)) return;
    if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
    handle(req, res, parsedUrl);
  });

  httpsServerInstance.on('error', (err) => {
    console.error('Port 443\'e bağlanırken hata:', err);
    console.log('Yedek port 3004 deneniyor...');
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        if (serveDefaultImageFallback(req, res, parsedUrl)) return;
        if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
        handle(req, res, parsedUrl);
    }).listen(3004, '0.0.0.0', () => {
        console.log('> https://varsagel.com:3004 üzerinde hazır');
    });
  });

  httpsServerInstance.listen(443, '0.0.0.0', () => {
    const canonical = getCanonicalFromEnv();
    console.log(`> ${(canonical?.protocol || 'https:')}//${canonical?.host || '0.0.0.0'} üzerinde hazır`);
  });

  // HTTP server for ACME http-01 challenge and redirect to HTTPS
  httpRedirectServerInstance = http.createServer((req, res) => {
    if (req.url && req.url.startsWith('/.well-known/acme-challenge/')) {
      const token = req.url.split('/').pop();
      const filePath = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge', token || '');
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(content);
      } catch (e) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      }
      return;
    }
    const canonical = getCanonicalFromEnv();
    const host = canonical?.host || getReqHost(req);
    const proto = canonical?.protocol || 'https:';
    const redirectUrl = `${proto}//${host}${req.url || '/'}`;
    res.writeHead(301, { Location: redirectUrl });
    res.end();
  }).listen(80, '0.0.0.0', () => {
    console.log('> HTTP redirect server on :80');
  }).on('error', (err) => {
    console.error('Error binding to port 80:', err.message);
    // Do not crash, just log. HTTPS might still work.
  });
});
