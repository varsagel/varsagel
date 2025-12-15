"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import BRAND_LOGOS from "@/data/brand-logos.json";
import { useState } from "react";

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
  images: string[];
  buyer: {
    name: string;
    rating: number;
  };
  createdAt: string;
  status: "active" | "sold";
  viewCount: number;
  isFavorited: boolean;
  attributes?: ListingAttributes;
}

interface TalepCardProps {
  listing: Talep;
  onToggleFavorite?: (id: string) => void;
}

export default function TalepCard({ listing, onToggleFavorite }: TalepCardProps) {
  const [fav, setFav] = useState(listing.isFavorited);
  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
    locale: tr,
  });
  
  return (
    <Link href={`/talep/${listing.id}`} className="group block h-full">
      <div className="h-full bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Image Area */}
        <div className="relative aspect-[2/1] bg-gray-100 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
            />
          ) : (
            listing.category === 'emlak' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-800 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      Varsagel
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Emlak alım talebi
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Konut, ofis, arsa
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <rect x="10" y="52" width="45" height="50" rx="4" fill="currentColor" opacity="0.28" />
                    <rect x="17" y="60" width="8" height="10" rx="1" fill="white" opacity="0.6" />
                    <rect x="35" y="60" width="8" height="10" rx="1" fill="white" opacity="0.6" />
                    <rect x="17" y="78" width="8" height="10" rx="1" fill="white" opacity="0.6" />
                    <rect x="35" y="78" width="8" height="10" rx="1" fill="white" opacity="0.6" />

                    <path d="M80 50 L110 30 L140 50 V100 H80 Z" fill="currentColor" opacity="0.9" />
                    <rect x="90" y="60" width="18" height="18" rx="2" fill="white" opacity="0.9" />
                    <rect x="118" y="70" width="14" height="30" rx="2" fill="white" opacity="0.9" />
                    <circle cx="128" cy="85" r="1.8" fill="#0f172a" />

                    <rect x="150" y="40" width="32" height="62" rx="4" fill="currentColor" opacity="0.32" />
                    <rect x="155" y="48" width="8" height="8" rx="1" fill="white" opacity="0.6" />
                    <rect x="169" y="48" width="8" height="8" rx="1" fill="white" opacity="0.6" />
                    <rect x="155" y="62" width="8" height="8" rx="1" fill="white" opacity="0.6" />
                    <rect x="169" y="62" width="8" height="8" rx="1" fill="white" opacity="0.6" />
                    <rect x="155" y="76" width="8" height="8" rx="1" fill="white" opacity="0.6" />
                    <rect x="169" y="76" width="8" height="8" rx="1" fill="white" opacity="0.6" />

                    <rect x="0" y="100" width="200" height="3" fill="white" opacity="0.12" />
                    <circle cx="36" cy="37" r="4" fill="#38bdf8" />
                    <circle cx="152" cy="28" r="3.2" fill="#fbbf24" />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'yedek-parca-aksesuar-donanim-tuning' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      Yedek Parça
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Aksesuar & tuning
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Jant, lastik, kit
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <circle cx="70" cy="78" r="24" fill="currentColor" opacity="0.9" />
                    <circle cx="70" cy="78" r="10" fill="#020617" />
                    <circle cx="70" cy="78" r="4" fill="white" />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const angle = (Math.PI * 2 * i) / 6;
                      const x = 70 + Math.cos(angle) * 15;
                      const y = 78 + Math.sin(angle) * 15;
                      return <circle key={i} cx={x} cy={y} r="2.3" fill="white" opacity="0.85" />;
                    })}

                    <path d="M118 42 L160 42 L170 70 L126 70 Z" fill="currentColor" opacity="0.35" />
                    <rect x="118" y="46" width="42" height="6" rx="3" fill="white" opacity="0.85" />
                    <rect x="124" y="56" width="12" height="4" rx="2" fill="#38bdf8" />
                    <rect x="138" y="56" width="12" height="4" rx="2" fill="#22c55e" />
                    <rect x="152" y="56" width="10" height="4" rx="2" fill="#fbbf24" />

                    <path
                      d="M40 32 C60 24, 92 24, 122 32"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.35"
                    />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'alisveris' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-sky-800 to-emerald-700 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      İkinci el & sıfır
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Güvenli alışveriş
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Elektronik, ev, hobi
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <path
                      d="M30 38 H62 L68 60 H150 L144 86 H54 L46 54"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    <circle cx="72" cy="92" r="6" fill="white" />
                    <circle cx="132" cy="92" r="6" fill="white" />

                    <rect x="82" y="44" width="22" height="16" rx="3" fill="white" opacity="0.9" />
                    <rect x="110" y="40" width="26" height="20" rx="4" fill="#0f172a" opacity="0.8" />
                    <rect x="114" y="44" width="18" height="6" rx="2" fill="white" opacity="0.9" />
                    <rect x="114" y="54" width="9" height="3" rx="1.5" fill="#38bdf8" />
                    <rect x="123" y="54" width="9" height="3" rx="1.5" fill="#22c55e" />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'is-makineleri-sanayi' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-800 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      İş makineleri
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Sanayi & üretim
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Forklift, vinç, ekipman
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <rect x="24" y="70" width="40" height="18" rx="4" fill="currentColor" opacity="0.85" />
                    <circle cx="36" cy="92" r="7" fill="#020617" />
                    <circle cx="36" cy="92" r="3" fill="white" />
                    <circle cx="60" cy="92" r="7" fill="#020617" />
                    <circle cx="60" cy="92" r="3" fill="white" />

                    <rect x="60" y="54" width="30" height="18" rx="4" fill="currentColor" opacity="0.7" />
                    <rect x="66" y="58" width="10" height="8" rx="2" fill="white" opacity="0.9" />

                    <rect x="90" y="40" width="8" height="40" rx="3" fill="currentColor" opacity="0.9" />
                    <rect x="98" y="40" width="8" height="40" rx="3" fill="currentColor" opacity="0.65" />
                    <rect x="86" y="78" width="26" height="4" rx="2" fill="white" opacity="0.9" />

                    <rect x="118" y="56" width="32" height="26" rx="4" fill="currentColor" opacity="0.75" />
                    <rect x="124" y="62" width="8" height="8" rx="1.5" fill="white" opacity="0.9" />
                    <rect x="136" y="62" width="8" height="8" rx="1.5" fill="white" opacity="0.7" />
                    <rect x="124" y="74" width="20" height="4" rx="2" fill="#fbbf24" opacity="0.9" />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'ustalar-hizmetler' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-emerald-800 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      Ustalar
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Profesyonel hizmetler
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Tadilat, taşıma, bakım
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <path
                      d="M42 80 L70 52 L86 68 L58 96 Z"
                      fill="currentColor"
                      opacity="0.9"
                    />
                    <rect x="63" y="55" width="8" height="24" rx="2" fill="#e5e7eb" />
                    <path
                      d="M76 44 L90 30 L100 40 L86 54 Z"
                      fill="#f97316"
                      opacity="0.95"
                    />

                    <rect x="104" y="52" width="34" height="30" rx="6" fill="currentColor" opacity="0.8" />
                    <rect x="109" y="58" width="24" height="6" rx="3" fill="white" opacity="0.9" />
                    <rect x="109" y="68" width="14" height="4" rx="2" fill="#22c55e" />
                    <rect x="125" y="68" width="8" height="4" rx="2" fill="#38bdf8" />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'ozel-ders-verenler' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-indigo-800 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      Özel ders
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Birebir eğitim
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Akademik, dil, müzik
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <rect x="32" y="40" width="72" height="46" rx="6" fill="currentColor" opacity="0.9" />
                    <rect x="38" y="46" width="60" height="4" rx="2" fill="white" opacity="0.9" />
                    <rect x="38" y="54" width="40" height="4" rx="2" fill="#38bdf8" opacity="0.9" />
                    <rect x="38" y="62" width="28" height="4" rx="2" fill="#22c55e" opacity="0.9" />

                    <path
                      d="M120 82 C120 70, 134 60, 148 60 C162 60, 176 70, 176 82"
                      fill="currentColor"
                      opacity="0.85"
                    />
                    <circle cx="148" cy="52" r="10" fill="currentColor" opacity="0.85" />
                    <circle cx="148" cy="50" r="4" fill="white" />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'is-ilanlari' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800 flex flex-col">
                <div className="flex items-center justify-between px-3 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      İş ilanları
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Kariyer fırsatları
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Tam zamanlı, part time
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-3">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <rect x="38" y="50" width="52" height="38" rx="8" fill="currentColor" opacity="0.9" />
                    <rect x="44" y="56" width="40" height="4" rx="2" fill="white" opacity="0.9" />
                    <rect x="44" y="64" width="26" height="4" rx="2" fill="#38bdf8" opacity="0.9" />
                    <rect x="44" y="72" width="18" height="4" rx="2" fill="#22c55e" opacity="0.9" />

                    <rect x="108" y="38" width="40" height="26" rx="8" fill="currentColor" opacity="0.8" />
                    <rect x="114" y="44" width="28" height="4" rx="2" fill="white" opacity="0.9" />
                    <rect x="114" y="52" width="18" height="4" rx="2" fill="#fbbf24" opacity="0.9" />

                    <rect x="112" y="68" width="32" height="18" rx="5" fill="#0f172a" opacity="0.9" />
                    <rect x="120" y="72" width="16" height="6" rx="3" fill="white" opacity="0.9" />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'yardimci-arayanlar' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-rose-800 flex flex-col">
                <div className="flex items-center justify-between px-4 pt-4">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      Yardımcı arayanlar
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Güvenilir destek
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Bakım, temizlik, ev işleri
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-6 pb-4">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <path
                      d="M52 82 C52 72, 62 64, 74 64 C86 64, 96 72, 96 82"
                      fill="currentColor"
                      opacity="0.9"
                    />
                    <circle cx="74" cy="54" r="10" fill="currentColor" opacity="0.9" />
                    <circle cx="74" cy="52" r="4.2" fill="white" />

                    <path
                      d="M112 84 C112 74, 122 66, 134 66 C146 66, 156 74, 156 84"
                      fill="currentColor"
                      opacity="0.7"
                    />
                    <circle cx="134" cy="56" r="8" fill="currentColor" opacity="0.7" />
                    <circle cx="134" cy="54" r="3.4" fill="white" />

                    <path
                      d="M60 94 C70 100, 98 102, 132 96"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.35"
                    />
                  </svg>
                </div>
              </div>
            ) : listing.category === 'hayvanlar-alemi' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-emerald-800 flex flex-col">
                <div className="flex items-center justify-between px-4 pt-4">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                      Hayvanlar alemi
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Dostlar için talepler
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Mama, aksesuar, bakım
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-6 pb-4">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full max-w-[220px] text-white/90"
                    aria-hidden="true"
                  >
                    <circle cx="70" cy="56" r="6.5" fill="currentColor" opacity="0.9" />
                    <circle cx="86" cy="54" r="6.5" fill="currentColor" opacity="0.9" />
                    <circle cx="62" cy="70" r="6.5" fill="currentColor" opacity="0.9" />
                    <circle cx="94" cy="68" r="6.5" fill="currentColor" opacity="0.9" />

                    <path
                      d="M70 80 C74 72, 84 72, 88 80 C92 88, 88 98, 79 100 C70 98, 66 88, 70 80 Z"
                      fill="currentColor"
                      opacity="0.95"
                    />
                    <circle cx="79" cy="86" r="4.2" fill="white" opacity="0.9" />

                    <rect x="120" y="74" width="40" height="10" rx="5" fill="currentColor" opacity="0.9" />
                    <rect x="124" y="70" width="32" height="6" rx="3" fill="currentColor" opacity="0.7" />
                    <rect x="128" y="72" width="24" height="3" rx="1.5" fill="white" opacity="0.85" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                <span className="text-4xl font-light">varsagel</span>
              </div>
            )
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {listing.status === 'sold' && (
              <span className="bg-gray-900/90 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                Tamamlandı
              </span>
            )}
            {listing.status === 'active' && listing.attributes?.isPending && (
              <span className="bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                Onay Bekliyor
              </span>
            )}
            {listing.price > 0 && (
              <span className="bg-lime-600/90 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                {(() => {
                  const minP = listing.attributes?.minPrice ? Number(listing.attributes.minPrice) : 0;
                  const maxPAttr = listing.attributes?.maxPrice ? Number(listing.attributes.maxPrice) : 0;
                  const budget = typeof listing.price === 'number' ? listing.price : 0;

                  const hasMin = minP > 0;
                  const hasMax = maxPAttr > 0;
                  const hasBudget = budget > 0;

                  let from = 0;
                  let to = 0;

                  if (hasMin && hasMax) {
                    from = minP;
                    to = maxPAttr;
                  } else if (hasMin && hasBudget) {
                    from = minP;
                    to = budget;
                  } else if (hasMin) {
                    return <>{minP.toLocaleString('tr-TR')} - ∞ Alıcı Bütçesi</>;
                  } else if (hasMax) {
                    from = 0;
                    to = maxPAttr;
                  } else if (hasBudget) {
                    from = 0;
                    to = budget;
                  } else {
                    return null;
                  }

                  return (
                    <>
                      {from.toLocaleString('tr-TR')} - {to.toLocaleString('tr-TR')} Alıcı Bütçesi
                    </>
                  );
                })()}
              </span>
            )}
          </div>

          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleFavorite) {
                onToggleFavorite(listing.id);
                return;
              }
              try {
                if (fav) {
                  await fetch(`/api/favorites?listingId=${listing.id}`, { method: 'DELETE' });
                  setFav(false);
                } else {
                  await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id }) });
                  setFav(true);
                }
              } catch {}
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        <div className="p-2 flex flex-col flex-grow">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-cyan-600 mb-1">
            <span className="bg-cyan-50 px-1.5 py-0.5 rounded">{listing.category}</span>
            {listing.subcategory && (
              <>
                <span className="text-gray-300">â€¢</span>
                <span className="text-gray-500">{listing.subcategory}</span>
              </>
            )}
          </div>

          <h3 className="text-[13px] font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-cyan-600 transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-[12px] text-gray-500 line-clamp-1 mb-2 flex-grow">
            {listing.description}
          </p>
          
          {/* Brand/Model Badges */}
          <div className="flex flex-wrap gap-1 mb-2 items-center">
            {listing.attributes?.marka && (
               <div className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-100">
                 {(BRAND_LOGOS as Record<string, string>)[listing.attributes.marka] && (
                   <div className="relative w-4 h-4">
                     <Image 
                       src={(BRAND_LOGOS as Record<string, string>)[listing.attributes.marka]} 
                       alt={listing.attributes.marka} 
                       fill 
                       className="object-contain"
                       sizes="16px"
                     />
                   </div>
                 )}
                 <span className="text-[10px] font-semibold">
                   {listing.attributes.marka}
                 </span>
               </div>
            )}
            {listing.attributes?.model && (
               <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                 {listing.attributes.model}
               </span>
            )}
          </div>

          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{listing.location.city}/{listing.location.district}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
