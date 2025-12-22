"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Heart } from "lucide-react";
import BRAND_LOGOS from "@/data/brand-logos.json";
import { useState, useMemo, useCallback, useEffect } from "react";
import { getSubcategoryImage } from '@/data/subcategory-images';
import { useToast } from "@/components/ui/use-toast";

interface ListingAttributes {
  marka?: string;
  model?: string;
  isPending?: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
  [key: string]: string | number | boolean | undefined;
}

interface Talep {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: {
    city: string;
    district: string;
  };
  createdAt: string;
  images: string[];
  attributesJson?: string;
  attributes?: ListingAttributes;
  isFavorited?: boolean;
}

interface TalepCardProps {
  listing: Talep;
  onToggleFavorite?: (id: string) => void;
  priority?: boolean;
}

// Memoized time calculation component
const TimeAgo = React.memo(({ createdAt }: { createdAt: string }) => {
    const rtf = useMemo(() => new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" }), []);
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
      setNow(Date.now());
      const id = window.setInterval(() => setNow(Date.now()), 60_000);
      return () => window.clearInterval(id);
    }, []);

    const timeAgo = useMemo(() => {
      const date = new Date(createdAt);
      if (now === null) return rtf.format(0, "second");
      const diffMs = date.getTime() - now;
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
    }, [createdAt, rtf, now]);
    return <span suppressHydrationWarning>{timeAgo}</span>;
  });

TimeAgo.displayName = 'TimeAgo';

// Memoized price formatting
const PriceDisplay = React.memo(({ price }: { price: number }) => {
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, [price]);

  return <span suppressHydrationWarning>{formattedPrice}</span>;
});
PriceDisplay.displayName = 'PriceDisplay';

// Memoized price range display
const PriceRangeDisplay = React.memo(({ minPrice, maxPrice, price }: { 
  minPrice?: number | string; 
  maxPrice?: number | string; 
  price: number; 
}) => {
  const priceRangeText = useMemo(() => {
    const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
    const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
    
    if (min && max) {
      return `${new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(min)} - ${new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(max)}`;
    } else if (min) {
      return `Min ${new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(min)}`;
    } else if (max) {
      return `Max ${new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(max)}`;
    }
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, [minPrice, maxPrice, price]);

  return <span>{priceRangeText}</span>;
});
PriceRangeDisplay.displayName = 'PriceRangeDisplay';

// Memoized brand logo component
const BrandLogo = React.memo(({ category, subcategory, attributes }: { 
  category: string; 
  subcategory?: string; 
  attributes: ListingAttributes;
}) => {
  const brandKey =
    typeof attributes.marka === "string"
      ? attributes.marka
      : typeof (attributes as any).brand === "string"
        ? String((attributes as any).brand)
        : "";
  const logoSrc = useMemo(() => {
    if (brandKey && BRAND_LOGOS[brandKey as keyof typeof BRAND_LOGOS]) {
      return BRAND_LOGOS[brandKey as keyof typeof BRAND_LOGOS];
    }
    
    return null;
  }, [brandKey]);

  if (logoSrc) {
    return (
      <div
        role="img"
        aria-label={String(brandKey || "Marka")}
        className="w-4 h-4 bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: `url(${logoSrc})` }}
      />
    );
  }

  return getCategoryPlaceholder(category, subcategory);
});
BrandLogo.displayName = 'BrandLogo';

function getCategoryPlaceholder(category: string, _subcategory?: string) {
  const categorySvgs = {
    'emlak': (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'yedek-parca-aksesuar-donanim-tuning': (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    'vasıta': (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400">
        <path d="M3 12h18M3 12l2-7h14l2 7M3 12v8a2 2 0 002 2h14a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2"/>
        <circle cx="7" cy="18" r="1" fill="currentColor"/>
        <circle cx="17" cy="18" r="1" fill="currentColor"/>
      </svg>
    ),
    'hayvanlar': (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400">
        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="15" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 15c-2 0-4-1-4-3s2-3 4-3 4 1 4 3-2 3-4 3z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  };

  return categorySvgs[category as keyof typeof categorySvgs] || categorySvgs['emlak'];
}

export default function TalepCard({ listing, onToggleFavorite, priority = false }: TalepCardProps) {
  const [fav, setFav] = useState(listing.isFavorited);
  const { toast } = useToast();
  
  const attributes = useMemo(() => {
    if (listing.attributes && typeof listing.attributes === "object") return listing.attributes;
    try {
      return listing.attributesJson ? JSON.parse(listing.attributesJson) : {};
    } catch {
      return {};
    }
  }, [listing.attributes, listing.attributesJson]);

  const handleToggleFavorite = useCallback(() => {
    // Check if user is logged in by checking if onToggleFavorite is provided
    if (!onToggleFavorite) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Lütfen üye olun veya giriş yapın.",
        variant: "destructive",
      });
      return;
    }
    setFav(!fav);
    onToggleFavorite?.(listing.id);
  }, [fav, listing.id, onToggleFavorite, toast]);

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
      setCurrentSrc('/images/placeholder-1.svg');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative group">
      <Link href={`/talep/${listing.id}`} prefetch={false}>
        <div className="relative h-48 bg-gray-100">
          <Image
            src={currentSrc}
            alt={listing.title}
            onError={handleError}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
          <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] sm:text-xs font-medium z-10 max-w-[calc(100%-16px)] truncate">
            <PriceRangeDisplay 
              minPrice={attributes.minPrice} 
              maxPrice={attributes.maxPrice} 
              price={listing.price} 
            />
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleFavorite();
          }}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="p-4">
        <Link href={`/talep/${listing.id}`} prefetch={false}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="truncate">
            {listing.location.district}, {listing.location.city}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <TimeAgo createdAt={listing.createdAt} />
          </div>
          <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium capitalize">
            {listing.category}
          </div>
        </div>

        {Object.keys(attributes).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <BrandLogo category={listing.category} subcategory={listing.subcategory} attributes={attributes} />
              <span className="text-xs text-gray-600 truncate">
                {attributes.marka || attributes.brand || attributes.model || listing.subcategory || ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
