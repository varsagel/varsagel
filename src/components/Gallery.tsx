"use client";
import { useState, useEffect } from "react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

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

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden border border-white/20 bg-white/10">
        <img
          src={mainSrc}
          alt={alt}
          className="w-full h-64 object-cover cursor-pointer"
          onClick={() => setOpen(true)}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/images/placeholder-1.svg")}
        />
      </div>
      <div className="flex items-center gap-3">
        {images.slice(0, 8).map((src, i) => (
          <button
            key={i}
            className={`block w-20 h-16 rounded-lg overflow-hidden border ${i === current ? "border-blue-400" : "border-white/20"}`}
            onClick={() => setCurrent(i)}
            aria-label={`Görsel ${i + 1}`}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/images/placeholder-1.svg")}
            />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="relative max-w-4xl w-full px-6" onClick={(e) => e.stopPropagation()}>
            <img
              src={mainSrc}
              alt={alt}
              className="w-full max-h-[80vh] object-contain"
              onError={(e) => (e.currentTarget.src = "/images/placeholder-1.svg")}
            />
            <div className="absolute top-4 right-6 flex gap-2">
              <button className="px-3 py-1 bg-white text-black rounded" onClick={() => setOpen(false)} aria-label="Kapat">Kapat</button>
              <button className="px-3 py-1 bg-white/80 text-black rounded" onClick={() => setCurrent((c) => Math.max(c - 1, 0))} aria-label="Önceki">◀</button>
              <button className="px-3 py-1 bg-white/80 text-black rounded" onClick={() => setCurrent((c) => Math.min(c + 1, images.length - 1))} aria-label="Sonraki">▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
