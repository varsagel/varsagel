"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Hash } from "lucide-react";
import BRAND_LOGOS from "@/data/brand-logos.json";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getCategoryImage, getSubcategoryImage } from '@/data/subcategory-images';
import { useToast } from "@/components/ui/use-toast";
import { listingHref } from '@/lib/listing-url';
import { titleCaseTR } from '@/lib/title-case-tr';

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

interface ListingAttributes {
  marka?: string | string[];
  model?: string | string[];
  isPending?: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
  [key: string]: string | number | boolean | string[] | undefined;
}

interface Talep {
  id: string;
  code?: string | null;
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
  const formatter = useMemo(() => new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }), []);
  const priceRangeText = useMemo(() => {
    const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
    const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `En Az ${formatter.format(min)}`;
    } else if (max) {
      return `En Çok ${formatter.format(max)}`;
    }
    
    return formatter.format(price);
  }, [minPrice, maxPrice, price, formatter]);

  return <span>{priceRangeText}</span>;
});
PriceRangeDisplay.displayName = 'PriceRangeDisplay';

// Memoized brand logo component
const BrandLogo = React.memo(({ category, attributes }: { 
  category: string; 
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

  return getCategoryPlaceholder(category);
});
BrandLogo.displayName = 'BrandLogo';

function getCategoryPlaceholder(category: string) {
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

export default function TalepCard({ listing, onToggleFavorite, priority }: TalepCardProps) {
  const [fav, setFav] = useState(listing.isFavorited);
  const { data: session } = useSession();
  const { toast } = useToast();
  
  useEffect(() => {
    setFav(listing.isFavorited);
  }, [listing.isFavorited]);

  const attributes = useMemo(() => {
    if (listing.attributes && typeof listing.attributes === "object") return listing.attributes;
    try {
      return listing.attributesJson ? JSON.parse(listing.attributesJson) : {};
    } catch {
      return {};
    }
  }, [listing.attributes, listing.attributesJson]);

  const locationText = useMemo(() => {
    const parts: string[] = [];
    if (listing.location?.district) parts.push(listing.location.district);
    if (listing.location?.city) parts.push(listing.location.city);
    const mahalle = typeof (attributes as any)?.mahalle === 'string' ? String((attributes as any).mahalle).trim() : '';
    if (listing.category === 'emlak' && mahalle) parts.unshift(mahalle);
    return parts.filter(Boolean).join(", ");
  }, [attributes, listing.category, listing.location?.city, listing.location?.district]);

  const chips = useMemo(() => {
    const out: Array<{ label: string; tone: "slate" | "cyan" | "amber" }> = [];
    const pick = (key: string) => {
      const v = (attributes as any)?.[key];
      if (Array.isArray(v)) return v.map((x) => String(x || "").trim()).filter(Boolean).join(", ");
      if (typeof v === "string") return v.trim();
      if (typeof v === "number") return String(v);
      if (typeof v === "boolean") return v ? "Evet" : "Hayır";
      return "";
    };
    const add = (label: string, value: string, tone: "slate" | "cyan" | "amber" = "slate") => {
      const v = String(value || "").trim();
      if (!v) return;
      out.push({ label: `${label}: ${v}`, tone });
    };

    if (listing.category === "vasita") {
      add("Marka", pick("marka") || pick("brand"), "cyan");
      add("Model", pick("model"), "slate");
      add("Yıl", pick("yil"), "slate");
      add("Vites", pick("vites"), "slate");
      add("Yakıt", pick("yakit"), "slate");
    } else if (listing.category === "emlak") {
      add("Mahalle", pick("mahalle"), "cyan");
      add("Oda", pick("oda") || pick("odaSayisi"), "slate");
      add("m²", pick("m2") || pick("metrekare") || pick("brutMetrekare") || pick("netMetrekare"), "slate");
      add("Isıtma", pick("isitma"), "slate");
      add("Eşyalı", pick("esyali"), "slate");
    } else {
      add("Marka", pick("marka") || pick("brand"), "cyan");
      add("Model", pick("model"), "slate");
    }

    const compact = out.filter((x) => x.label && x.label.length <= 36).slice(0, 3);
    if (compact.length >= 2) return compact;
    return out.slice(0, 3);
  }, [attributes, listing.category]);

  const handleToggleFavorite = useCallback(async () => {
    if (!session?.user?.id) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Lütfen üye olun veya giriş yapın.",
        variant: "warning",
      });
      return;
    }
    const nextFav = !fav;
    setFav(nextFav);
    if (onToggleFavorite) {
      onToggleFavorite(listing.id);
      return;
    }
    try {
      const res = nextFav
        ? await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id }) })
        : await fetch(`/api/favorites?listingId=${listing.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setFav(!nextFav);
      }
    } catch {
      setFav(!nextFav);
    }
  }, [fav, listing.id, onToggleFavorite, session?.user?.id, toast]);

  const subcategoryImage = useMemo(() => {
    return getSubcategoryImage(listing.subcategory || "", listing.category);
  }, [listing.category, listing.subcategory]);
  const categoryImage = useMemo(() => getCategoryImage(listing.category), [listing.category]);

  const href = useMemo(() => {
    return listingHref({
      id: listing.id,
      code: listing.code,
      title: listing.title,
      category: listing.category,
      subcategory: listing.subcategory,
    });
  }, [listing.category, listing.code, listing.id, listing.subcategory, listing.title]);

  const [currentSrc, setCurrentSrc] = useState(listing.images?.[0] || subcategoryImage);
  const displaySrc = useMemo(() => normalizeImageSrc(currentSrc), [currentSrc]);
  const isDefaultImage = useMemo(() => {
    return displaySrc.startsWith('/images/defaults/') || displaySrc.startsWith('/images/subcategories/');
  }, [displaySrc]);
  const isRemoteImage = useMemo(() => {
    return displaySrc.startsWith('http://') || displaySrc.startsWith('https://');
  }, [displaySrc]);
  const isCloudFrontHost = useMemo(() => {
    if (!isRemoteImage) return false;
    try {
      const host = new URL(displaySrc).hostname.toLowerCase();
      return host.endsWith(".cloudfront.net");
    } catch {
      return false;
    }
  }, [displaySrc, isRemoteImage]);
  const isAllowedRemote = useMemo(() => {
    if (!isRemoteImage) return false;
    try {
      const host = new URL(displaySrc).hostname.toLowerCase();
      return host === 'varsagel.com' || host === 'www.varsagel.com' || host === 'localhost' || host === '127.0.0.1' || host.includes(".s3.") || isCloudFrontHost;
    } catch {
      return false;
    }
  }, [displaySrc, isRemoteImage, isCloudFrontHost]);
  const isJfifImage = useMemo(() => {
    return /\.jfif($|\?)/i.test(displaySrc) || /\.jif($|\?)/i.test(displaySrc);
  }, [displaySrc]);

  useEffect(() => {
    setCurrentSrc(listing.images?.[0] || subcategoryImage);
  }, [listing.images, subcategoryImage]);

  const handleError = () => {
    if (currentSrc === listing.images?.[0] && currentSrc !== subcategoryImage) {
      setCurrentSrc(subcategoryImage);
      return;
    }
    if (currentSrc === subcategoryImage && currentSrc !== categoryImage) {
      setCurrentSrc(categoryImage);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:border-cyan-200 hover:ring-2 hover:ring-cyan-200/60 focus-within:ring-2 focus-within:ring-cyan-200/60 transition-all duration-300 overflow-hidden relative group">
      <Link href={href} prefetch={false}>
        <div className="relative h-44 bg-gray-100">
          <Image
            src={displaySrc}
            alt={listing.title}
            onError={handleError}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isDefaultImage || isJfifImage || (isRemoteImage && !isAllowedRemote)}
            quality={isDefaultImage ? 100 : 85}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-bold z-10 max-w-[calc(100%-16px)] truncate">
            <PriceRangeDisplay 
              minPrice={attributes.minPrice} 
              maxPrice={attributes.maxPrice} 
              price={listing.price} 
            />
          </div>
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
            <div className="bg-black/45 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide">
              {titleCaseTR(listing.category)}
            </div>
            {listing.subcategory && (
              <div className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[140px]">
                {titleCaseTR(listing.subcategory)}
              </div>
            )}
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
          aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full border border-white/60 hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`h-4 w-4 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="p-4">
        <Link href={href} prefetch={false}>
          <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-[#1E4355] transition-colors leading-snug">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">
            <PriceRangeDisplay 
              minPrice={attributes.minPrice} 
              maxPrice={attributes.maxPrice} 
              price={listing.price} 
            />
          </div>
          {listing.code && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 min-w-0">
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[90px]">{listing.code}</span>
            </div>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-600 line-clamp-1 leading-relaxed">
          {listing.description}
        </p>

        <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
          <div className="flex items-start gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="whitespace-normal break-words leading-relaxed line-clamp-2">{locationText}</span>
          </div>
        </div>

        {(chips.length > 0 || Object.keys(attributes).length > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <BrandLogo category={listing.category} attributes={attributes} />
              <div className="flex flex-nowrap gap-1.5 min-w-0 overflow-hidden">
                {chips.map((c) => (
                  <span
                    key={c.label}
                    className={
                      c.tone === "cyan"
                        ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100"
                        : c.tone === "amber"
                          ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100"
                          : "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100"
                    }
                  >
                    <span className="truncate max-w-[140px]">{c.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <Link
          href={href}
          prefetch={false}
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Detayları Gör
        </Link>
      </div>
    </div>
  );
}
