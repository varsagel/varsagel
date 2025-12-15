"use client";

import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroSection({ initialSearch }: { initialSearch: string }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-cyan-900 to-cyan-800 text-white pt-20 pb-24 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-cyan-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-700 mb-6">
          <TrendingUp className="w-4 h-4 text-cyan-300" />
          <span className="text-sm font-medium text-cyan-100">Bugün 1,240+ yeni alım talebi oluşturuldu</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Aradığını Bulamıyorsan, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200">
            Talep Oluştur, Satıcılar Gelsin!
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
          Varsagel ile ihtiyacın olan ürünü veya hizmeti anlat, satıcılar sana özel fiyat teklifleriyle gelsin.
        </p>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-2 transition-all focus-within:ring-4 focus-within:ring-cyan-500/20">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ne satmak istiyorsun? (Örn: iPhone 13, 2015 Honda Civic...)"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none text-lg"
              />
              <button 
                type="submit"
                className="hidden md:block bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Alıcı Bul
              </button>
            </div>
            {/* Mobile Button */}
            <button 
              type="submit"
              className="mt-3 w-full md:hidden bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
            >
              Alıcı Bul
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-cyan-200">
          <span>Popüler:</span>
          <button onClick={() => router.push('/?q=iphone')} className="hover:text-white underline decoration-cyan-400/50 underline-offset-4">iPhone</button>
          <button onClick={() => router.push('/?category=emlak')} className="hover:text-white underline decoration-cyan-400/50 underline-offset-4">Kiralık Ev</button>
          <button onClick={() => router.push('/?category=vasita')} className="hover:text-white underline decoration-cyan-400/50 underline-offset-4">Otomobil</button>
          <button onClick={() => router.push('/?q=ozel-ders')} className="hover:text-white underline decoration-cyan-400/50 underline-offset-4">Özel Ders</button>
        </div>
      </div>
    </div>
  );
}
