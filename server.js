const { createServer } = require('https');
require('dotenv').config();

// Clean up environment variables (remove quotes if present)
['GOOGLE_ID', 'GOOGLE_SECRET', 'AUTH_SECRET', 'NEXTAUTH_URL', 'AUTH_URL', 'DATABASE_URL'].forEach(key => {
  if (process.env[key]) {
    process.env[key] = process.env[key].replace(/^"|"$/g, '').trim();
  }
});

const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const devPort = Number(process.env.PORT || 3000);
const useHttpsInDev = dev && process.env.FORCE_VARSAGEL_DOMAIN === "true";

if (dev && process.env.FORCE_VARSAGEL_DOMAIN !== "true") {
  process.env.NEXTAUTH_URL = `http://localhost:${devPort}`;
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
} else {
  if (!process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = "https://www.varsagel.com";
  if (!process.env.AUTH_URL) process.env.AUTH_URL = process.env.NEXTAUTH_URL;
}
if (!process.env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = "true";

console.log('Server Env Config:');
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

const app = next({ dev });
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

function serveNextStaticAsset(req, res, parsedUrl) {
  const pathname = parsedUrl?.pathname || '';
  if (!pathname.startsWith('/_next/static/')) return false;

  // URL decode et - %5B -> [, %5D -> ], %2D -> -
  let relPath = pathname.slice('/_next/static/'.length);
  try {
    relPath = decodeURIComponent(relPath);
  } catch (e) {
    // Decode başarısız olursa orijinal path'i kullan
  }
  
  const filePath = path.join(process.cwd(), '.next', 'static', relPath);
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return false;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
    });

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

    stream.pipe(res);
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
    httpsOptions = {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt'),
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

      const host = getHostWithoutPort(req);
      const portSuffix = process.env.PORT ? `:${process.env.PORT}` : '';
      if (host && host !== 'www.varsagel.com') {
        const redirectUrl = `https://www.varsagel.com${portSuffix}` + (req.url || '/');
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
      const redirectUrl = `https://www.varsagel.com${req.url || '/'}`;
      res.writeHead(301, { Location: redirectUrl });
      res.end();
    }).listen(80, '0.0.0.0', () => {
      console.log('> HTTP redirect server on http://www.varsagel.com:80');
    }).on('error', (err) => {
      console.error('Error binding to port 80:', err.message);
    });
    }

    return;
  }

  httpsServerInstance = createServer(httpsOptions, (req, res) => {
    const host = getHostWithoutPort(req);
    // Force www subdomain so auth cookies are always scoped to the same host
    if (host && host !== 'www.varsagel.com') {
      const redirectUrl = 'https://www.varsagel.com' + (req.url || '/');
      res.writeHead(301, { Location: redirectUrl });
      res.end();
      return;
    }

    const parsedUrl = parse(req.url, true);
    if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
    handle(req, res, parsedUrl);
  });

  httpsServerInstance.on('error', (err) => {
    console.error('Port 443\'e bağlanırken hata:', err);
    console.log('Yedek port 3004 deneniyor...');
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        if (!dev && serveNextStaticAsset(req, res, parsedUrl)) return;
        handle(req, res, parsedUrl);
    }).listen(3004, '0.0.0.0', () => {
        console.log('> https://varsagel.com:3004 üzerinde hazır');
    });
  });

  httpsServerInstance.listen(443, '0.0.0.0', () => {
    console.log('> https://www.varsagel.com üzerinde hazır');
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
    // Always redirect to canonical www domain
    const redirectUrl = `https://www.varsagel.com${req.url || '/'}`;
    res.writeHead(301, { Location: redirectUrl });
    res.end();
  }).listen(80, '0.0.0.0', () => {
    console.log('> HTTP redirect server on http://www.varsagel.com:80');
  }).on('error', (err) => {
    console.error('Error binding to port 80:', err.message);
    // Do not crash, just log. HTTPS might still work.
  });
});
