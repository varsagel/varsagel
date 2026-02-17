"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [forcedSrc, setForcedSrc] = useState<string | null>(null);

  const normalizeImageSrc = (src: string) => {
    const value = String(src || "").trim();
    if (!value) return value;
    if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const safeImages = useMemo(() => {
    const list = Array.isArray(images) ? images : [];
    const normalized = list
      .map((src) => normalizeImageSrc(src))
      .filter((src) => {
        const value = String(src || "").trim();
        if (!value) return false;
        const lower = value.toLowerCase();
        if (lower.includes("placeholder-image.jpg")) return false;
        if (lower.includes("/images/placeholder-1.svg")) return false;
        if (lower.startsWith("data:image/svg")) return false;
        if (/\.svg($|\?)/i.test(value)) return false;
        return true;
      });
    return normalized.length > 0 ? normalized : ["/images/subcategories/Emlak.webp"];
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setCurrent((c) => Math.min(c + 1, safeImages.length - 1));
      if (e.key === "ArrowLeft") setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, safeImages.length]);

  useEffect(() => {
    if (current >= safeImages.length) setCurrent(0);
  }, [current, safeImages.length]);

  useEffect(() => {
    setForcedSrc(null);
  }, [current, safeImages.length]);

  const mainSrc = forcedSrc || safeImages[current] || "/images/subcategories/Emlak.webp";
  const isS3Image = (src: string) => {
    if (!/^https?:\/\//i.test(src)) return false;
    try {
      return new URL(src).hostname.toLowerCase().includes(".s3.");
    } catch {
      return false;
    }
  };
  const isCloudFrontImage = (src: string) => {
    if (!/^https?:\/\//i.test(src)) return false;
    try {
      return new URL(src).hostname.toLowerCase().includes(".cloudfront.net");
    } catch {
      return false;
    }
  };
  const mainUnoptimized =
    /\.jfif($|\?)/i.test(mainSrc) ||
    /\.jif($|\?)/i.test(mainSrc) ||
    mainSrc.startsWith("data:") ||
    isS3Image(mainSrc) ||
    isCloudFrontImage(mainSrc);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % safeImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + safeImages.length) % safeImages.length);
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
          unoptimized={mainUnoptimized}
          onError={() => {
            if (mainSrc !== "/images/subcategories/Emlak.webp") setForcedSrc("/images/subcategories/Emlak.webp");
          }}
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
            <Maximize2 className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        {safeImages.length > 1 && (
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
          {current + 1} / {safeImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {safeImages.map((src, i) => {
            const displaySrc = normalizeImageSrc(src);
            return (
            <button
              key={`${src}-${i}`}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === current ? "border-cyan-600 ring-2 ring-cyan-100" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setCurrent(i)}
            >
              <Image
                src={displaySrc}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                unoptimized={/\.jfif($|\?)/i.test(displaySrc) || /\.jif($|\?)/i.test(displaySrc) || isS3Image(displaySrc) || isCloudFrontImage(displaySrc)}
              />
            </button>
            );
          })}
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
              unoptimized={mainUnoptimized}
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
