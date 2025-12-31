import React from 'react';

export const Logo = ({ className = "w-8 h-8", textClassName = "text-xl" }: { className?: string, textClassName?: string }) => {
  return (
    <div className="flex items-center gap-2 group">
      <div className={`relative ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-all duration-300"
        >
          {/* Speed Lines (Dark Blue) */}
          <path d="M12 30 H 32" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" className="group-hover:translate-x-[-2px] transition-transform"/>
          <path d="M4 48 H 28" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" className="group-hover:translate-x-[-3px] transition-transform delay-75"/>
          <path d="M12 66 H 32" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" className="group-hover:translate-x-[-2px] transition-transform delay-100"/>

          {/* Magnifying Glass Handle */}
          <line x1="76" y1="70" x2="90" y2="84" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
          
          {/* Magnifying Glass Circle Rim */}
          <circle cx="58" cy="48" r="30" stroke="#1e293b" strokeWidth="6" fill="white"/>

          {/* Inner Icons (Light Blue) */}
          <g fill="#3b82f6">
            {/* Motorcycle (Top Left) */}
            <path d="M46 36 C46 36 48 32 52 32 H54 L52 36 M46 38 A3 3 0 1 0 46 44 A3 3 0 1 0 46 38 M58 38 A3 3 0 1 0 58 44 A3 3 0 1 0 58 38" stroke="#3b82f6" strokeWidth="2" fill="none"/>
            <path d="M46 38 L58 38" stroke="#3b82f6" strokeWidth="2"/>

            {/* Phone (Top Right) */}
            <rect x="66" y="28" width="10" height="16" rx="2" fill="#3b82f6"/>
            <rect x="68" y="30" width="6" height="10" fill="white"/>
            <circle cx="71" cy="42" r="1" fill="white"/>

            {/* Building (Left) */}
            <rect x="42" y="50" width="10" height="14" fill="#3b82f6"/>
            <rect x="44" y="52" width="2" height="2" fill="white"/>
            <rect x="48" y="52" width="2" height="2" fill="white"/>
            <rect x="44" y="56" width="2" height="2" fill="white"/>
            <rect x="48" y="56" width="2" height="2" fill="white"/>
            <rect x="44" y="60" width="2" height="2" fill="white"/>
            <rect x="48" y="60" width="2" height="2" fill="white"/>

            {/* Car (Right) */}
            <path d="M64 54 L66 50 H76 L78 54 V60 H64 V54 Z" fill="#3b82f6"/>
            <circle cx="68" cy="60" r="2.5" fill="#3b82f6"/>
            <circle cx="74" cy="60" r="2.5" fill="#3b82f6"/>

            {/* Wrench (Bottom) */}
            <path d="M54 64 L56 62 L64 70 L62 72 Z" fill="#3b82f6"/>
            <path d="M52 60 A4 4 0 1 0 58 66" fill="none" stroke="#3b82f6" strokeWidth="3"/>
          </g>
        </svg>
      </div>
      <div className={`flex items-baseline ${textClassName}`}>
        <span className="font-bold text-slate-800 tracking-tight">varsa</span>
        <span className="font-bold text-cyan-500 tracking-tight">gel</span>
      </div>
    </div>
  );
};
