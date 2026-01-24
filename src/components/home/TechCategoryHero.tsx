"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Category, SubCategory } from "@/data/categories";
import { ArrowLeft, ArrowRight, ChevronRight, LayoutGrid, Sparkles } from "lucide-react";
import { titleCaseTR } from "@/lib/title-case-tr";

export default function TechCategoryHero({ categories }: { categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].slug);
  const [subTrail, setSubTrail] = useState<SubCategory[]>([]);

  const activeCat = categories.find(c => c.slug === activeCategory) || categories[0];
  const currentSubcategories = useMemo(() => {
    let current = activeCat.subcategories || [];
    for (const picked of subTrail) {
      current = picked.subcategories || [];
    }
    return current;
  }, [activeCat.subcategories, subTrail]);

  useEffect(() => {
    setSubTrail([]);
  }, [activeCategory]);

  return (
    <div className="relative bg-[#2C5F78] pt-12 pb-20 overflow-hidden min-h-[600px] flex flex-col justify-center">
      {/* Dynamic Background - Teal to Purple Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#1198AB] via-[#23486F] to-[#48124F]"></div>
        
        {/* Geometric Network Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-overlay">
          <svg className="absolute w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                 <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
               </linearGradient>
             </defs>
             
             {/* Left Side Complex Mesh */}
             <path d="M-100 600 L100 400 L300 550 L150 700 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
             <path d="M0 400 L200 200 L400 350 L250 550 Z" fill="none" stroke="rgba(255,255,255,0.08)" />
             <path d="M-50 200 L150 50 L350 250 L150 350 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
             <path d="M200 100 L450 150 L350 350 L150 250 Z" fill="none" stroke="rgba(255,255,255,0.05)" />
             
             {/* Connecting Lines Left */}
             <line x1="150" y1="50" x2="450" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
             <line x1="450" y1="150" x2="400" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
             <line x1="400" y1="350" x2="250" y2="550" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
             <line x1="250" y1="550" x2="300" y2="550" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

             {/* Right Side Complex Mesh */}
             <path d="M1500 500 L1200 350 L1100 550 L1300 700 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
             <path d="M1440 200 L1150 100 L1000 300 L1250 400 Z" fill="none" stroke="rgba(255,255,255,0.08)" />
             <path d="M1300 50 L1050 150 L950 350 L1200 250 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
             
             {/* Connecting Lines Right */}
             <line x1="1150" y1="100" x2="950" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
             <line x1="1000" y1="300" x2="1100" y2="550" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
             <line x1="1250" y1="400" x2="1200" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

             {/* Floating Particles/Nodes */}
             <circle cx="200" cy="200" r="2" fill="rgba(255,255,255,0.3)" />
             <circle cx="450" cy="150" r="2" fill="rgba(255,255,255,0.3)" />
             <circle cx="400" cy="350" r="2" fill="rgba(255,255,255,0.3)" />
             <circle cx="1150" cy="100" r="2" fill="rgba(255,255,255,0.3)" />
             <circle cx="1000" cy="300" r="2" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="text-center mb-10 relative">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm leading-tight">
            <span className="drop-shadow-md">
              Aradığını Bulamıyorsan <br className="hidden md:block"/>
              Talep Oluştur, Satıcılar Gelsin!
            </span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Left Sidebar - Compact Category List */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-4 z-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-xl overflow-hidden">
              <div className="flex flex-row lg:flex-col gap-2 lg:gap-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setActiveCategory(cat.slug);
                      }}
                      className={`
                        flex-shrink-0 lg:flex-shrink-1
                        w-[85px] lg:w-full flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start
                        gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-white text-[#1E4355] shadow-lg lg:translate-x-1 scale-105 lg:scale-100' 
                          : 'text-white/80 hover:bg-white/20 hover:text-white'
                        }
                      `}
                    >
                      <span className={`
                        text-2xl transition-transform duration-300 flex-shrink-0
                        ${isActive ? 'scale-110 lg:rotate-[-5deg]' : 'group-hover:scale-110'}
                      `}>
                        {cat.icon}
                      </span>
                      <span className={`
                        text-[10px] lg:text-sm font-bold text-center lg:text-left leading-tight lg:leading-normal whitespace-normal lg:whitespace-nowrap lg:truncate flex-1
                        ${isActive ? 'opacity-100' : 'opacity-90'}
                      `}>
                        {titleCaseTR(cat.name)}
                      </span>
                      
                      {isActive && (
                        <div className="absolute bottom-0 lg:bottom-auto left-0 lg:left-auto right-0 lg:right-0 lg:top-1/2 lg:-translate-y-1/2 h-1 lg:h-8 w-full lg:w-1 bg-[#2C5F78] rounded-t-full lg:rounded-l-full lg:rounded-tr-none"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Content Area - Detailed View */}
          <div className="w-full lg:w-3/4">
            <div 
              key={activeCat.slug}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_0_50px_-10px_rgba(0,0,0,0.2)] border border-white/50 animate-in fade-in slide-in-from-right-8 duration-500"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Info Section */}
                <div className="w-full md:w-5/12 space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-[#EAF4F6] text-4xl flex items-center justify-center shadow-inner border border-[#CBE3E8]">
                      {activeCat.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                        {titleCaseTR(activeCat.name)}
                      </h2>
                      <span className="text-sm font-medium text-[#2C5F78] bg-[#EAF4F6] px-2 py-0.5 rounded-md border border-[#CBE3E8]">
                        {activeCat.subcategories?.length || 0} Alt Kategori
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    <strong className="text-[#1E4355]">{titleCaseTR(activeCat.name)}</strong> kategorisindeki en güncel ilanları inceleyebilir veya talebini oluşturarak satıcılardan teklif alabilirsin.
                  </p>

                  <div className="flex flex-col gap-3 pt-2">
                    <Link 
                      href={`/kategori/${activeCat.slug}`}
                      className="flex items-center justify-between w-full p-4 rounded-xl bg-[#2C5F78] hover:bg-[#3E849E] text-white font-bold transition-all duration-300 shadow-lg shadow-[#A8D1D9]/50 hover:shadow-[#85C0CA] hover:-translate-y-0.5 group"
                    >
                      <span>Kategoriyi İncele</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      href="/talep-olustur"
                      className="flex items-center justify-between w-full p-4 rounded-xl bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-[#A8D1D9] text-slate-700 hover:text-[#1E4355] font-bold transition-all duration-300 hover:-translate-y-0.5 group"
                    >
                      <span>Hemen Talep Oluştur</span>
                      <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Subcategories Grid */}
                <div className="w-full md:w-7/12 bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200/60">
                    <LayoutGrid className="w-5 h-5 text-[#2C5F78]" />
                  <h3 className="font-bold text-slate-700">Alt Kategoriler</h3>
                  {subTrail.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSubTrail((prev) => prev.slice(0, -1))}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#1E4355] bg-white border border-slate-200 rounded-lg px-2 py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Geri
                    </button>
                  )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentSubcategories.map((sub, idx) => {
                    const hasChildren = Array.isArray(sub.subcategories) && sub.subcategories.length > 0;
                    const subPath = sub.fullSlug || sub.slug;
                    const commonClass =
                      "flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[#62AEBB] hover:shadow-md hover:shadow-[#CBE3E8] transition-all duration-200 group/sub";

                    if (hasChildren) {
                      return (
                        <button
                          key={subPath}
                          type="button"
                          onClick={() => setSubTrail((prev) => [...prev, sub])}
                          className={commonClass}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <span className="text-sm font-semibold text-slate-600 group-hover/sub:text-[#163342] truncate">
                            {titleCaseTR(sub.name)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover/sub:text-[#3E849E] transition-colors" />
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={subPath}
                        href={`/kategori/${activeCat.slug}/${subPath}`}
                        className={commonClass}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <span className="text-sm font-semibold text-slate-600 group-hover/sub:text-[#163342] truncate">
                          {titleCaseTR(sub.name)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover/sub:text-[#3E849E] transition-colors" />
                      </Link>
                    );
                  })}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
