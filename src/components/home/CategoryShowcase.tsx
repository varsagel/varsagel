import Link from "next/link";
import { ArrowRight, ChevronRight, Zap, CircuitBoard, Layers } from "lucide-react";
import { Category } from "@/data/categories";

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
  const mainCategories = categories.slice(0, 4);
  const otherCategories = categories.slice(4);

  return (
    <div className="space-y-20">
      
      {/* Hero Categories - Tech Modules Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mainCategories.map((cat, index) => (
          <div 
            key={cat.slug}
            className={`
              relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0F172A] p-1 shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] group
              ${index === 0 ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
            `}
          >
            {/* Tech Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-900 to-slate-800 rounded-3xl z-0"></div>
            
            {/* Inner Content Container */}
            <div className="relative h-full bg-[#0B0F19] rounded-[22px] p-7 overflow-hidden z-10">
              
              {/* Circuit Pattern Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(56, 189, 248, 0.3) 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              ></div>
              
              {/* Animated Glow Orb */}
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-700"></div>

              <div className="relative z-20 h-full flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      {/* Icon Hexagon Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500 border border-cyan-500/30"></div>
                      <div className="relative text-4xl text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform duration-300">
                        {cat.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        {cat.name}
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-500/70" />
                        <span className="text-cyan-500/70">{cat.subcategories.length}</span> Modül Aktif
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/kategori/${cat.slug}`}
                    className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300"
                  >
                    <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </Link>
                </div>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2.5">
                    {cat.subcategories.slice(0, index === 0 ? 8 : 5).map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/kategori/${cat.slug}/${sub.slug}`}
                        className="group/tag relative px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800/40 border border-slate-700/60 rounded-lg overflow-hidden transition-all hover:text-white hover:border-cyan-500/50 hover:bg-cyan-900/20"
                      >
                        <span className="relative z-10">{sub.name}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover/tag:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                      </Link>
                    ))}
                    {cat.subcategories.length > (index === 0 ? 8 : 5) && (
                      <Link
                        href={`/kategori/${cat.slug}`}
                        className="px-3.5 py-2 text-xs font-semibold text-cyan-500/70 hover:text-cyan-400 transition-colors flex items-center gap-1"
                      >
                        +{cat.subcategories.length - (index === 0 ? 8 : 5)} Diğer
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Other Categories - Data Grid */}
      <div className="relative">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <CircuitBoard className="w-6 h-6 text-cyan-600" />
            Diğer Kategoriler
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-6"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {otherCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="group relative flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/0 via-cyan-50/50 to-cyan-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <span className="text-2xl filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300">{cat.icon}</span>
              <span className="text-sm font-semibold text-slate-600 group-hover:text-cyan-700 line-clamp-1 relative z-10">
                {cat.name}
              </span>
              
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
