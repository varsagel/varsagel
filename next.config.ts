import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

class WriteWebpackStatsPlugin {
  private filename: string;
  constructor(filename: string) {
    this.filename = filename;
  }
  apply(compiler: any) {
    compiler.hooks.done.tap("WriteWebpackStatsPlugin", (stats: any) => {
      const outputPath = compiler.options.output?.path ?? process.cwd();
      const filePath = path.join(outputPath, this.filename);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const json = stats.toJson({
        all: false,
        chunks: true,
        chunkModules: true,
        chunkModulesSpace: 99999,
        chunkModulesSort: "size",
        chunkRootModules: true,
        chunkRelations: true,
        chunkGroups: true,
        modules: true,
        modulesSpace: 99999,
        modulesSort: "size",
        maxModules: 99999,
        nestedModules: true,
        reasons: false,
        usedExports: false,
        providedExports: false,
        optimizationBailout: false,
        source: false,
      });
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");

      const compilation = stats.compilation;
      const chunkGraph = compilation?.chunkGraph;
      const moduleMap: any[] = [];
      if (compilation && chunkGraph) {
        for (const chunk of compilation.chunks) {
          const files = Array.from(chunk.files || []).map((f: any) => String(f));
          const matchesTarget = files.some((f) =>
            /static\/chunks\/(3794|4bd1b696)-/.test(f.replace(/\\/g, "/")),
          );
          if (!matchesTarget) continue;

          const modules: any[] = [];
          const moduleIterable = chunkGraph.getChunkModulesIterable(chunk);
          for (const mod of moduleIterable) {
            const resource =
              (mod as any).resource ||
              ((mod as any).rootModule && (mod as any).rootModule.resource) ||
              null;
            const identifier = resource || (mod as any).identifier?.() || String((mod as any).identifier);
            const size = (mod as any).size?.() ?? 0;
            modules.push({ identifier, size });
          }

          modules.sort((a, b) => b.size - a.size);
          const approxSize = modules.reduce((sum, m) => sum + (m.size || 0), 0);
          moduleMap.push({
            id: chunk.id,
            files,
            approxSize,
            modules: modules.slice(0, 300),
          });
        }
      }

      if (moduleMap.length) {
        const detailPath = path.join(outputPath, "stats", "client-chunk-modules.json");
        fs.mkdirSync(path.dirname(detailPath), { recursive: true });
        fs.writeFileSync(detailPath, JSON.stringify(moduleMap, null, 2), "utf8");
      }
    });
  }
}

const extraRemotePatterns: { protocol: "http" | "https"; hostname: string }[] = [];
const publicBaseUrl = (process.env.S3_PUBLIC_BASE_URL || "").trim();
if (publicBaseUrl) {
  try {
    const url = new URL(publicBaseUrl);
    const protocol = url.protocol.replace(":", "");
    if (protocol === "http" || protocol === "https") {
      extraRemotePatterns.push({ protocol, hostname: url.hostname });
    }
  } catch {}
}

const nextConfig: NextConfig = {
  // RSC ve streaming optimize edildi
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "varsagel.com", "www.varsagel.com"],
    },
    // RSC abort hatalarını azaltmak için
    optimizeCss: process.env.NODE_ENV === 'production',
    optimizePackageImports: ["lucide-react"],
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "varsagel.com" },
      { protocol: "https", hostname: "www.varsagel.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...extraRemotePatterns,
    ],
  },
  
  compress: true,
  poweredByHeader: false,
  
  // Cache headers - RSC abort hatalarını azaltmak için
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      // Özel RSC endpointleri için cache
      {
        source: "/(.*)?_rsc=:rsc",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "X-RSC-Cache",
            value: "no-cache",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/ilan-ver',
        destination: '/talep-olustur',
        permanent: true,
      },
      {
        source: '/api/listings',
        destination: '/api/talepler',
        permanent: true,
      },
      {
        source: '/api/listing',
        destination: '/api/talep',
        permanent: true,
      },
    ];
  },
  
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_URL: process.env.AUTH_URL,
  },
  webpack: (config, { isServer, dev }) => {
    // Only run the stats plugin if specifically requested via ANALYZE env var
    // This significantly speeds up dev server startup
    if (process.env.ANALYZE === 'true' && !isServer) {
      config.plugins.push(new WriteWebpackStatsPlugin("stats/webpack-stats.json"));
    }
    
    // Disable heavy optimizations in dev mode
    if (dev) {
      config.optimization.minimize = false;
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    return config;
  },
};

export default nextConfig;
