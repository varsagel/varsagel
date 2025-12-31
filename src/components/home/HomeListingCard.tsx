"use client";

// Force rebuild 2
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const FavoriteButton = dynamic(() => import('@/components/ui/FavoriteButton'), {
  ssr: false,
  loading: () => null,
});
import { getSubcategoryImage } from '@/data/subcategory-images';
import BRAND_LOGOS from "@/data/brand-logos.json";

function formatTimeAgoLocal(createdAt: string) {
  const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
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
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
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
    <div className="mt-1.5 pt-1.5 border-t border-gray-100">
      <div className="flex items-center gap-1">
        {logoSrc ? (
          <div
            role="img"
            aria-label={brandKey || "Marka"}
            className="w-2.5 h-2.5 bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${logoSrc})` }}
          />
        ) : (
          <div className="w-2.5 h-2.5 flex items-center justify-center text-[8px] font-semibold text-gray-400">
            {String(category || "K").slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="text-[10px] text-gray-600 truncate">
          {brandKey || subcategory || ""}
        </span>
      </div>
    </div>
  );
}

export default function HomeListingCard({ listing, priority, isAuthenticated }: { listing: ListingItem; priority?: boolean; isAuthenticated: boolean }) {
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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative group">
      <Link href={`/talep/${listing.id}`} className="block">
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={currentSrc}
            alt={listing.title}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div suppressHydrationWarning className="absolute bottom-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[11px] font-semibold">
            {priceText}
          </div>
        </div>
      </Link>
      <FavoriteButton listingId={listing.id} isAuthenticated={isAuthenticated} isFavorited={listing.isFavorited} />

      <div className="p-2.5">
        <Link href={`/talep/${listing.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 text-xs line-clamp-2 hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1.5">
          <span className="truncate" suppressHydrationWarning>
            {listing.location.district}, {listing.location.city}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <span suppressHydrationWarning>{timeAgo}</span>
          </div>
          <div className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-medium capitalize">
            {listing.category}
          </div>
        </div>

        <BrandBadge category={listing.category} subcategory={listing.subcategory} attributes={listing.attributes} />
      </div>
    </div>
  );
}
