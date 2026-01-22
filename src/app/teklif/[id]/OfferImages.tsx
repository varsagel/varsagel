'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface OfferImagesProps {
  images: string[];
}

export default function OfferImages({ images }: OfferImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const normalizeImageSrc = (src: string) => {
    const s = String(src || '').trim();
    if (!s) return '';
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('uploads/')) {
      const path = `/${s}`;
      return baseUrl ? `${baseUrl}${path}` : path;
    }
    if (s.startsWith('/uploads/')) {
      return baseUrl ? `${baseUrl}${s}` : s;
    }
    return s;
  };
  const normalizedImages = images.map(normalizeImageSrc).filter(Boolean);
  if (normalizedImages.length === 0) return null;

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % normalizedImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + normalizedImages.length) % normalizedImages.length);
  };

  const isJfif = (src: string) => /\.jfif($|\?)/i.test(src) || /\.jif($|\?)/i.test(src);
  const isUpload = (src: string) => src.includes('/uploads/') || src.startsWith('uploads/');
  const isExternal = (src: string) => /^https?:\/\//i.test(src);
  const shouldUnoptimize = (src: string) => isUpload(src) || isExternal(src) || isJfif(src);

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Görseller ({normalizedImages.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {normalizedImages.map((img, i) => (
          <button 
            key={i} 
            onClick={() => openImage(i)}
            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
          <Image 
            src={img} 
            alt={`Teklif görseli ${i + 1}`} 
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300" 
            unoptimized={shouldUnoptimize(img)}
          />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeImage}
        >
          <button 
            onClick={closeImage}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {normalizedImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            
            <div className="relative w-full h-[85vh]">
              <Image 
                src={normalizedImages[selectedIndex]} 
                alt={`Tam boy ${selectedIndex + 1}`} 
                fill
                sizes="100vw"
                className="object-contain rounded-lg shadow-2xl"
                priority
                unoptimized={shouldUnoptimize(normalizedImages[selectedIndex])}
              />
            </div>
            
            <div className="absolute -bottom-8 left-0 right-0 text-center text-white/70 text-sm">
              {selectedIndex + 1} / {normalizedImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
