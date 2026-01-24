'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);

    const message = String((error as any)?.message || '');
    const isChunkLoadError =
      /ChunkLoadError/i.test(message) ||
      /Loading chunk \d+ failed/i.test(message) ||
      /Failed to fetch dynamically imported module/i.test(message);

    if (typeof window !== 'undefined' && isChunkLoadError) {
      try {
        const key = '__varsagel_chunk_reload_at';
        const last = Number(sessionStorage.getItem(key) || '0');
        const now = Date.now();
        if (!Number.isFinite(last) || now - last > 60_000) {
          sessionStorage.setItem(key, String(now));
          const url = new URL(window.location.href);
          url.searchParams.set('__r', String(now));
          window.location.replace(url.toString());
        }
      } catch {}
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Bir Hata Oluştu
              </h1>
              
              <p className="text-gray-600 mb-4">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yeniden yüklemeyi deneyin.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 rounded-lg p-3 mb-4 text-left">
                  <p className="text-sm font-mono text-red-600 mb-1">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => reset()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </button>
                
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
