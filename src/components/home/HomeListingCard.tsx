"use client";

// Force rebuild 2
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const FavoriteButton = dynamic(() => import('@/components/ui/FavoriteButton'), {
  ssr: false,
  loading: () => null,
});
import { getCategoryImage, getSubcategoryImage } from '@/data/subcategory-images';
import BRAND_LOGOS from "@/data/brand-logos.json";
import { listingHref } from '@/lib/listing-url';
import { titleCaseTR } from '@/lib/title-case-tr';

function formatTryLocal(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

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

export interface ListingItem {
  id: string;
  code?: string | null;
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

export default function HomeListingCard({ listing, priority }: { listing: ListingItem; priority?: boolean }) {
  const href = useMemo(() => {
    return listingHref({
      id: listing.id,
      code: listing.code,
      title: listing.title,
      category: listing.category,
      subcategory: listing.subcategory,
    });
  }, [listing.category, listing.code, listing.id, listing.subcategory, listing.title]);

  const subcategoryImage = useMemo(() => {
    return getSubcategoryImage(listing.subcategory || "", listing.category);
  }, [listing.category, listing.subcategory]);
  const categoryImage = useMemo(() => getCategoryImage(listing.category), [listing.category]);

  const [currentSrc, setCurrentSrc] = useState(listing.images?.[0] || subcategoryImage);
  const displaySrc = useMemo(() => normalizeImageSrc(currentSrc), [currentSrc]);
  const isRemoteImage = useMemo(() => {
    return displaySrc.startsWith('http://') || displaySrc.startsWith('https://');
  }, [displaySrc]);
  const isS3Host = useMemo(() => {
    if (!isRemoteImage) return false;
    try {
      const host = new URL(displaySrc).hostname.toLowerCase();
      return host.includes(".s3.");
    } catch {
      return false;
    }
  }, [displaySrc, isRemoteImage]);
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
      return host === 'varsagel.com' || host === 'www.varsagel.com' || host === 'localhost' || host === '127.0.0.1' || isS3Host || isCloudFrontHost;
    } catch {
      return false;
    }
  }, [displaySrc, isRemoteImage, isS3Host, isCloudFrontHost]);
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
  
  const priceText = useMemo(() => {
    const minPrice = listing.attributes?.minPrice;
    const maxPrice = listing.attributes?.maxPrice;
    
    if (minPrice && maxPrice) {
      const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
      const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
      return `${formatTryLocal(min)} - ${formatTryLocal(max)}`;
    } else if (minPrice) {
      const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
      return `En Az ${formatTryLocal(min)}`;
    } else if (maxPrice) {
      const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
      return `En Çok ${formatTryLocal(max)}`;
    }
    
    return formatTryLocal(listing.price);
  }, [listing.price, listing.attributes?.minPrice, listing.attributes?.maxPrice]);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative group">
      <Link href={href} className="block">
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <Image
            src={displaySrc}
            alt={listing.title}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            priority={!!priority}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized={isJfifImage || (isRemoteImage && !isAllowedRemote)}
            className="object-cover"
          />
          <div suppressHydrationWarning className="absolute bottom-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[11px] font-semibold">
            {priceText}
          </div>
        </div>
      </Link>
      <FavoriteButton listingId={listing.id} isFavorited={listing.isFavorited} />

      <div className="p-2.5">
        <Link href={href}>
          <h3 className="font-semibold text-gray-900 mb-1 text-xs line-clamp-2 hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1.5">
          <span className="truncate" suppressHydrationWarning>
            {listing.location.district}, {listing.location.city}
          </span>
        </div>

        <div className="flex items-center justify-end text-[11px] text-gray-500">
          <div className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-medium capitalize">
            {titleCaseTR(listing.category)}
          </div>
        </div>

        <BrandBadge category={listing.category} subcategory={listing.subcategory} attributes={listing.attributes} />
      </div>
    </div>
  );
}
