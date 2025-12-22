"use client";
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <Search className="h-8 w-8 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sayfa Bulunamadı
        </h1>
        
        <p className="text-gray-600 mb-6">
          Üzgünüz, aradığınız sayfa bulunamadı. URL'yi kontrol edin veya ana sayfaya dönün.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Ana Sayfa
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
}