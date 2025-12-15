"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setCurrent((c) => Math.min(c + 1, images.length - 1));
      if (e.key === "ArrowLeft") setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  const mainSrc = images[current] || "/images/placeholder-1.svg";

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="group relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        <Image
          src={mainSrc}
          alt={`${alt} - Görsel ${current + 1}`}
          fill
          className="object-contain p-2"
          priority
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
            <Maximize2 className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-md">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === current ? "border-cyan-600 ring-2 ring-cyan-100" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setCurrent(i)}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setOpen(false)}>
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
             <Image
              src={mainSrc}
              alt={alt}
              fill
              className="object-contain"
              quality={100}
            />
          </div>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={handleNext}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 font-medium">
             {current + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}

