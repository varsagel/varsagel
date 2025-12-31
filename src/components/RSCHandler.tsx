'use client';

import { useEffect } from 'react';

/**
 * RSC (React Server Components) abort hatalarını azaltmak için
 * Client-side error handler
 */
export default function RSCHandler() {
  useEffect(() => {
    const originalFetch = window.fetch;

    let installed = false;
    const install = () => {
      if (installed) return;
      installed = true;

      window.fetch = async function (url, options) {
        if (typeof url === "string" && url.includes("_rsc=")) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await originalFetch(url, {
              ...options,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
          } catch (error: any) {
            if (error.name === "AbortError") {
              console.log("RSC request aborted (normal behavior)");
              return new Response(null, { status: 200 });
            }
            throw error;
          }
        }

        return originalFetch(url, options);
      };
    };

    const w = window as any;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    if (typeof w?.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(install, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(install, 1500);
    }

    return () => {
      if (idleId !== null && typeof w?.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.fetch = originalFetch;
    };
  }, []);
  
  return null;
}
