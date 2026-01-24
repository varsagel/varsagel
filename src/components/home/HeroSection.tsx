"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

export default function HeroSection({ initialSearch }: { initialSearch: string }) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const router = useRouter();
  const defaultCategorySlug = CATEGORIES[0]?.slug || "";
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const targetCategory = categorySlug || defaultCategorySlug;
      const basePath = targetCategory ? `/kategori/${targetCategory}` : "/";
      const params = new URLSearchParams();
      params.set("q", q);
      const url = params.toString() ? `${basePath}?${params.toString()}` : basePath;
      router.push(url);
    }
  };

  return (
    <div className="relative bg-[#0047AB] text-white pt-32 pb-40 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0047AB] to-[#003380] z-0"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Talep oluştur, satıcılardan teklifleri topla</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white leading-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 max-w-5xl">
            Aradığını Bulamıyorsan <br/>
            Talep Oluştur, Satıcılar Gelsin!
          </h1>
          
          <p className="text-lg md:text-2xl text-blue-50 mb-12 max-w-4xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Varsagel ile ihtiyacın olan ürünü ve hizmeti anlat, satıcılar sana özel fiyat teklifleri ile gelsin.
          </p>

          {/* Search Bar - White Background Style */}
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                {CATEGORIES.length > 0 && (
                  <div className="flex items-center gap-2 pl-3 pr-2 border-r border-gray-200">
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="bg-transparent text-gray-700 text-sm md:text-base h-12 md:h-14 outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ne satmak istiyorsun? (Örn: iPhone 13, 2015 Honda Civic...)" 
                  className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 text-base md:text-lg px-4 h-12 md:h-14 outline-none"
                />
                <button 
                  type="submit"
                  className="bg-[#2D9CDB] hover:bg-[#268CC5] text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold transition-all text-base md:text-lg shadow-lg whitespace-nowrap"
                >
                  Alıcı Bul
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
