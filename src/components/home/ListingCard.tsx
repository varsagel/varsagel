"use client";

// Force rebuild 3
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import FavoriteButton from '@/components/ui/FavoriteButton';
import { getSubcategoryImage } from '@/data/subcategory-images';
import BRAND_LOGOS from "@/data/brand-logos.json";
import { Clock, MapPin } from "lucide-react";

// Formatters moved outside to avoid recreation on every render
const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatTimeAgoLocal(createdAt: string) {
  // Return a static string during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return ""; // Or return a static date format if preferred
  }

  const date = new Date(createdAt);
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  if (absSeconds < 60) return rtf.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) return rtf.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  const absDays = Math.abs(diffDays);
  if (absDays < 7) return rtf.format(diffDays, "day");

  const diffWeeks = Math.round(diffDays / 7);
  const absWeeks = Math.abs(diffWeeks);
  if (absWeeks < 5) return rtf.format(diffWeeks, "week");

  const diffMonths = Math.round(diffDays / 30);
  const absMonths = Math.abs(diffMonths);
  if (absMonths < 12) return rtf.format(diffMonths, "month");

  const diffYears = Math.round(diffDays / 365);
  return rtf.format(diffYears, "year");
}

function formatTryLocal(price: number) {
  return tryFormatter.format(price);
}

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: { city: string; district: string };
  images: string[];
  attributes: Record<string, any>;
  buyer: { name: string; rating: number };
  createdAt: string;
  status: "active" | "pending" | "sold";
  viewCount: number;
  isFavorited: boolean;
}

function BrandBadge({ category, subcategory, attributes }: { category: string; subcategory?: string; attributes: Record<string, any> }) {
  const brandKey =
    typeof attributes?.marka === "string"
      ? attributes.marka
      : typeof attributes?.brand === "string"
        ? attributes.brand
        : "";

  const logoSrc = brandKey && (BRAND_LOGOS as Record<string, string>)[brandKey] ? (BRAND_LOGOS as Record<string, string>)[brandKey] : null;
  if (!logoSrc && !brandKey && !subcategory) return null;

  return (
    <div className="mt-3 pt-2 border-t border-slate-100">
      <div className="flex items-center gap-1.5">
        {logoSrc ? (
          <div
            role="img"
            aria-label={brandKey || "Marka"}
            className="w-4 h-4 bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${logoSrc})` }}
          />
        ) : (
          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
            {String(category || "K").slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="text-[11px] font-medium text-slate-600 truncate">
          {brandKey || subcategory || ""}
        </span>
      </div>
    </div>
  );
}

export default function ListingCard({ listing, priority, isAuthenticated }: { listing: ListingItem; priority?: boolean; isAuthenticated: boolean }) {
  const subcategoryImage = useMemo(() => {
    return listing.subcategory ? getSubcategoryImage(listing.subcategory, listing.category) : '/images/placeholder-1.svg';
  }, [listing.subcategory, listing.category]);

  const [currentSrc, setCurrentSrc] = useState(listing.images?.[0] || subcategoryImage);

  useEffect(() => {
    setCurrentSrc(listing.images?.[0] || subcategoryImage);
  }, [listing.images, subcategoryImage]);

  const handleError = () => {
    if (currentSrc === listing.images?.[0] && currentSrc !== subcategoryImage) {
        setCurrentSrc(subcategoryImage);
    } else if (currentSrc === subcategoryImage) {
        // If the default image fails (e.g. user hasn't uploaded it yet), show placeholder
        setCurrentSrc('/images/placeholder-1.svg');
    }
  };
  
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    setTimeAgo(formatTimeAgoLocal(listing.createdAt));
  }, [listing.createdAt]);
  
  const priceText = useMemo(() => {
    const minPrice = listing.attributes?.minPrice;
    const maxPrice = listing.attributes?.maxPrice;
    
    if (minPrice && maxPrice) {
      const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
      const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
      return `${formatTryLocal(min)} - ${formatTryLocal(max)}`;
    } else if (minPrice) {
      const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
      return `Min ${formatTryLocal(min)}`;
    } else if (maxPrice) {
      const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
      return `Max ${formatTryLocal(max)}`;
    }
    
    return formatTryLocal(listing.price);
  }, [listing.price, listing.attributes?.minPrice, listing.attributes?.maxPrice]);

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden relative flex flex-col h-full">
      <Link href={`/talep/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={currentSrc}
          alt={listing.title}
          onError={handleError}
          priority={priority}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Price Badge */}
        <div suppressHydrationWarning className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
          {priceText}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
          {listing.category}
        </div>
      </Link>
      
      <div className="absolute top-2 left-2 z-10">
        <FavoriteButton listingId={listing.id} isAuthenticated={isAuthenticated} isFavorited={listing.isFavorited} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/talep/${listing.id}`} className="block flex-1">
          <h3 className="font-semibold text-slate-900 mb-2 text-sm leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span suppressHydrationWarning className="truncate max-w-[100px]">
                {[listing.location.district, listing.location.city].filter(Boolean).join(", ")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span suppressHydrationWarning>{timeAgo}</span>
            </div>
          </div>

          <BrandBadge category={listing.category} subcategory={listing.subcategory} attributes={listing.attributes} />
        </div>
      </div>
    </div>
  );
}
