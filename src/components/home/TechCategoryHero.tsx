"use client";

import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { Category } from "@/data/categories";
import { ArrowRight, ChevronRight, Layers, Zap, Search, Sparkles } from "lucide-react";

export default function TechCategoryHero({ categories }: { categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].slug);
  
  // Drag to scroll logic
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDragging = (e: MouseEvent<HTMLDivElement>) => {
    setIsDown(true);
    if (sliderRef.current) {
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeft(sliderRef.current.scrollLeft);
    }
  };

  const stopDragging = () => {
    setIsDown(false);
  };

  const onDrag = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const activeCat = categories.find(c => c.slug === activeCategory) || categories[0];

  return (
    <div className="relative bg-cyan-600 pt-20 pb-20 overflow-hidden min-h-[600px] flex flex-col justify-center">
      {/* Dynamic Background - Turquoise Mode */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500 via-cyan-600 to-teal-700"></div>
        
        {/* Animated Grid - White/Cyan */}
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
          }}
        ></div>
        
        {/* Glow Effects - Bright */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-cyan-300/10 rounded-full blur-[100px] animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-sm max-w-5xl mx-auto leading-tight">
            <span className="drop-shadow-md">
              Aradığını Bulamıyorsan <br/>
              Talep Oluştur, Satıcılar Gelsin!
            </span>
          </h1>
        </div>

        {/* Tech Interface Container - Glassmorphism White */}
        <div className="bg-white backdrop-blur-2xl border border-white/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-white/20 relative group">
          {/* Shimmer Border Effect */}
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-white/50 pointer-events-none z-50"></div>
          
          {/* Top Bar - Category Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 bg-white sticky top-0 z-20">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`
                  flex items-center gap-2 px-6 py-5 text-sm font-bold transition-all duration-300 whitespace-nowrap relative group/btn
                  ${activeCategory === cat.slug 
                    ? 'text-cyan-700 bg-cyan-50' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span className={`text-2xl transition-transform duration-300 ${activeCategory === cat.slug ? 'scale-110 drop-shadow-md' : 'group-hover/btn:scale-110 grayscale group-hover/btn:grayscale-0'}`}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
                
                {/* Active Indicator */}
                {activeCategory === cat.slug && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500"></div>
                )}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row min-h-auto md:min-h-[450px]">
            
            {/* Left Panel - Hero Info */}
            <div className="w-full md:w-[35%] p-6 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 bg-gradient-to-b from-white to-cyan-50/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/40 to-transparent rounded-bl-full"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex-1 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 mb-4 md:mb-0">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-4xl md:text-6xl mb-0 md:mb-8 shadow-xl shadow-cyan-100/50 transform transition-transform duration-500 hover:scale-105 hover:rotate-3 flex-shrink-0">
                    {activeCat.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2 md:mb-4 tracking-tight">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                        {activeCat.name}
                      </span>
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-4 md:mb-8 text-sm md:text-lg line-clamp-2 md:line-clamp-none">
                      {activeCat.name} kategorisindeki en yeni talepleri incele veya kendi ilanını oluşturarak satıcıların sana ulaşmasını sağla.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 w-full">
                  <Link 
                    href={`/kategori/${activeCat.slug}`}
                    className="flex items-center justify-between w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all duration-300 group shadow-lg shadow-cyan-200 text-sm md:text-base"
                  >
                    <span>Kategoriyi İncele</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/talep-olustur"
                    className="flex items-center justify-between w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-cyan-100 text-slate-700 hover:text-cyan-700 font-semibold transition-all group shadow-sm hover:shadow-md text-sm md:text-base"
                  >
                    <span>Talep Oluştur</span>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Panel - Subcategories Grid */}
            <div className="w-full md:w-[65%] p-6 md:p-10 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
                  Popüler Alt Kategoriler
                </h3>
                <span className="text-[10px] md:text-xs font-bold text-cyan-600 px-2 py-1 md:px-3 md:py-1.5 bg-white rounded-full border border-cyan-100">
                  {activeCat.subcategories.length} Alt Kategori
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {activeCat.subcategories.map((sub, idx) => (
                  <Link
                    key={sub.slug}
                    href={`/kategori/${activeCat.slug}/${sub.slug}`}
                    className="group relative p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 hover:border-cyan-200 hover:shadow-[0_8px_30px_-10px_rgba(6,182,212,0.15)] transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-slate-600 group-hover:text-cyan-800 font-semibold text-xs md:text-sm truncate pr-2 transition-colors">
                        {sub.name}
                      </span>
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-50 group-hover:bg-cyan-50 border border-slate-100 group-hover:border-cyan-100 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 md:mt-12 text-center relative z-10">
          <p className="text-cyan-50 text-lg md:text-2xl max-w-4xl mx-auto leading-relaxed font-semibold px-4">
            Varsagel ile ihtiyacın olan ürünü ve hizmeti anlat, satıcılar sana özel fiyat teklifleri ile gelsin.
          </p>
        </div>

      </div>
    </div>
  );
}
