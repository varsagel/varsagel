"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart2,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Heart,
  Home,
  List,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Tag,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { SavedSearchesTab } from "@/components/profile/SavedSearchesTab";

type TabType =
  | "ozet"
  | "taleplerim"
  | "verdigim-teklifler"
  | "aldigim-teklifler"
  | "favoriler"
  | "kayitli-aramalar"
  | "mesajlar"
  | "bildirimler"
  | "istatistikler"
  | "ayarlar";

type Attributes = {
  marka?: string;
  model?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  [key: string]: string | number | boolean | null | undefined;
};

type Talep = {
  id: string;
  baslik: string;
  kategori: string;
  durum: "aktif" | "tamamlandi" | "iptal" | "beklemede";
  tarih: string;
  teklifSayisi: number;
  fiyat: number;
  aciklama: string;
  konum: string;
  attributes?: Attributes;
};

type Teklif = {
  id: string;
  listingId?: string;
  sellerId?: string;
  talepBaslik: string;
  teklifTutari: number;
  mesaj: string;
  durum: "beklemede" | "kabul" | "red" | "iptal";
  tarih: string;
  createdAt?: string;
  kullanici: string;
  telefon: string;
  email: string;
  rejectionReason?: string | null;
};

type Favori = {
  id: string;
  baslik: string;
  kategori: string;
  fiyat: number;
  konum: string;
  tarih: string;
  attributes?: Attributes;
};

type Mesaj = {
  id: string;
  listingId: string;
  senderName?: string | null;
  content: string;
  createdAt: string;
  read: boolean;
};

type Bildirim = {
  id: string;
  type?: string;
  title: string;
  body?: string;
  dataJson?: string;
  read: boolean;
  createdAt: string;
  link?: string;
};

type OfferInfo = {
  offersToday: number;
  lastAt: number | null;
  remainingToday: number;
  nextAllowedAt: number | null;
};

type ProfileData = {
  name: string;
  phone: string;
  notificationSettings: {
    newOffers: boolean;
    messages: boolean;
    marketingEmails: boolean;
  };
};

type Props = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: { name?: string | null; email?: string | null } | null | undefined;
  taleplerim: Talep[];
  isLoadingTalepler: boolean;
  verdigimTeklifler: Teklif[];
  isLoadingVerdigim: boolean;
  aldigimTeklifler: Teklif[];
  isLoadingAldigim: boolean;
  favoriler: Favori[];
  isLoadingFavoriler: boolean;
  mesajlar: Mesaj[];
  isLoadingMesajlar: boolean;
  bildirimler: Bildirim[];
  isLoadingBildirimler: boolean;
  perListingOfferInfo: Map<string, OfferInfo>;
  nowTick: number;
  blockedMap: Record<string, boolean>;
  onDeleteTalep: (id: string) => void;
  onOfferUpdate: (id: string) => void;
  onOfferAction: (id: string, action: "accept" | "reject") => void;
  onBlockUser: (listingId: string, sellerId: string) => void;
  onRemoveFavorite: (id: string) => void;
  setBildirimler: Dispatch<SetStateAction<Bildirim[]>>;
  router: { push: (href: string) => void };
  profileData: ProfileData;
  setProfileData: Dispatch<SetStateAction<ProfileData>>;
  isProfileSaving: boolean;
  onSaveProfile: () => void;
  onSignOut: () => void;
};

const StatCard = ({
  title,
  value,
  icon,
  change,
  loading,
  trend,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  loading?: boolean;
  trend?: "up" | "down" | "neutral";
}) => (
  <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        )}
        {change && !loading && (
          <div className="flex items-center mt-2">
            {trend === "up" && <TrendingUp className="w-3 h-3 text-lime-500 mr-1" />}
            <p className={`text-xs font-medium ${trend === "up" ? "text-lime-600" : "text-gray-500"}`}>{change}</p>
          </div>
        )}
      </div>
      <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    aktif: { bg: "bg-lime-50 text-lime-700 border-lime-200", label: "Aktif", icon: Check },
    beklemede: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Beklemede", icon: Clock },
    tamamlandi: { bg: "bg-cyan-50 text-cyan-700 border-cyan-200", label: "Tamamlandı", icon: Check },
    kabul: { bg: "bg-lime-50 text-lime-700 border-lime-200", label: "Kabul", icon: Check },
    red: { bg: "bg-red-50 text-red-700 border-red-200", label: "Reddedildi", icon: X },
    iptal: { bg: "bg-gray-50 text-gray-600 border-gray-200", label: "İptal", icon: X }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.beklemede;
  const Icon = config.icon;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${config.bg}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function ProfileTabContent({
  activeTab,
  setActiveTab,
  user,
  taleplerim,
  isLoadingTalepler,
  verdigimTeklifler,
  isLoadingVerdigim,
  aldigimTeklifler,
  isLoadingAldigim,
  favoriler,
  isLoadingFavoriler,
  mesajlar,
  isLoadingMesajlar,
  bildirimler,
  isLoadingBildirimler,
  perListingOfferInfo,
  nowTick,
  blockedMap,
  onDeleteTalep,
  onOfferUpdate,
  onOfferAction,
  onBlockUser,
  onRemoveFavorite,
  setBildirimler,
  router,
  profileData,
  setProfileData,
  isProfileSaving,
  onSaveProfile,
  onSignOut,
}: Props) {
  switch (activeTab) {
    case "ozet":
      return (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Hoş Geldin, {user?.name?.split(" ")[0]}! ğŸ‘‹</h2>
              <p className="text-cyan-100 text-lg max-w-2xl">
                Profil özetini ve son aktivitelerini buradan takip edebilirsin.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/talep-olustur" className="bg-white text-cyan-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-cyan-50 transition-colors shadow-sm inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Yeni Talep Oluştur
                </Link>
                <Link href="/" className="bg-cyan-500/30 text-white border border-white/30 px-5 py-2.5 rounded-lg font-semibold hover:bg-cyan-500/40 transition-colors inline-flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Taleplere Göz At
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Aktif Taleplerim" 
              value={taleplerim.filter(i => i.durum === "aktif").length.toString()} 
              icon={<List className="w-6 h-6" />} 
              change={taleplerim.length > 0 ? `${taleplerim.length} toplam` : undefined}
              loading={isLoadingTalepler}
              trend="neutral"
            />
            <StatCard 
              title="Verilen Teklifler" 
              value={verdigimTeklifler.length.toString()} 
              icon={<Tag className="w-6 h-6" />}
              change={`Bekleyen: ${verdigimTeklifler.filter(t => t.durum === "beklemede").length}`}
              loading={isLoadingVerdigim}
              trend="up"
            />
            <StatCard 
              title="Alınan Teklifler" 
              value={aldigimTeklifler.length.toString()} 
              icon={<Tag className="w-6 h-6" />}
              change={`Yeni: ${aldigimTeklifler.filter(t => t.durum === "beklemede").length}`}
              loading={isLoadingAldigim}
              trend="up"
            />
            <StatCard 
              title="Okunmamış Bildirim" 
              value={bildirimler.filter(b => !b.read).length.toString()} 
              icon={<Bell className="w-6 h-6" />}
              loading={isLoadingBildirimler}
              trend="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <List className="w-5 h-5 text-cyan-600" />
                  Son Taleplerim
                </h3>
                <button onClick={() => setActiveTab("taleplerim")} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {taleplerim.length > 0 ? (
                <div className="space-y-4">
                  {taleplerim.slice(0, 3).map((talep) => (
                    <div key={talep.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50 hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                          <List className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{talep.baslik}</p>
                          <p className="text-xs text-gray-500">{talep.tarih}</p>
                        </div>
                      </div>
                      <StatusBadge status={talep.durum} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <List className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Henüz talebiniz yok.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-lime-600" />
                  Son Gelen Teklifler
                </h3>
                <button onClick={() => setActiveTab("aldigim-teklifler")} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {aldigimTeklifler.length > 0 ? (
                <div className="space-y-4">
                  {aldigimTeklifler.slice(0, 3).map((teklif) => (
                    <div key={teklif.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50 hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-lime-50 flex items-center justify-center text-lime-600">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{teklif.talepBaslik}</p>
                          <p className="text-xs text-gray-500">{teklif.teklifTutari.toLocaleString()} TL</p>
                        </div>
                      </div>
                      <StatusBadge status={teklif.durum} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Henüz gelen teklif yok.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "taleplerim":
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Taleplerim</h2>
            <Link href="/talep-olustur" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Talep Oluştur
            </Link>
          </div>
          
          {isLoadingTalepler ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Talepleriniz yükleniyor...</p>
            </div>
          ) : taleplerim.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4">
                <List className="w-16 h-16 mx-auto opacity-20" />
              </div>
              <p className="text-gray-500 mb-6">Henüz talebiniz bulunmuyor.</p>
              <Link href="/talep-olustur" className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                İlk Talebinizi Oluşturun
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {taleplerim.map((talep) => (
                <div key={talep.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{talep.baslik}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 text-xs">{talep.kategori}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {talep.konum}</span>
                      </div>
                    </div>
                    <StatusBadge status={talep.durum} />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{talep.aciklama}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {talep.attributes?.marka && (
                      <span className="text-xs font-medium bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded border border-cyan-100">
                        {talep.attributes.marka}
                      </span>
                    )}
                    {talep.attributes?.model && (
                      <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded border border-purple-100">
                        {talep.attributes.model}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-50 gap-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600 w-full sm:w-auto items-start sm:items-center">
                      <span className="flex items-center gap-1 font-medium text-cyan-600 text-base sm:text-sm">
                        <Tag className="w-4 h-4" />
                        {(() => {
                          const minP = talep.attributes?.minPrice ? Number(talep.attributes.minPrice) : 0;
                          const maxP = talep.attributes?.maxPrice ? Number(talep.attributes.maxPrice) : 0;
                          
                          if (minP > 0 && maxP > 0) {
                            return `${minP.toLocaleString("tr-TR")} - ${maxP.toLocaleString("tr-TR")}`;
                          } else if (minP > 0) {
                            return `${minP.toLocaleString("tr-TR")} +`;
                          } else if (maxP > 0) {
                            return `En Çok ${maxP.toLocaleString("tr-TR")}`;
                          } else {
                            return `${talep.fiyat.toLocaleString("tr-TR")}`;
                          }
                        })()}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {talep.tarih}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {talep.teklifSayisi} teklif</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => router.push(`/talep-olustur?editId=${talep.id}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        <Edit className="w-3.5 h-3.5" /> Düzenle
                      </button>
                      <button onClick={() => onDeleteTalep(talep.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                      </button>
                      <button onClick={() => router.push(`/talep/${talep.id}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 shadow-sm shadow-cyan-200">
                        <Eye className="w-3.5 h-3.5" /> İncele
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "verdigim-teklifler":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Verdiğim Teklifler</h2>
          
          {isLoadingVerdigim ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verdiğiniz teklifler yükleniyor...</p>
            </div>
          ) : verdigimTeklifler.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4">
                <Tag className="w-16 h-16 mx-auto opacity-20" />
              </div>
              <p className="text-gray-500">Henüz verdiğiniz bir teklif yok.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {verdigimTeklifler.map((teklif) => {
                const listingId = teklif.listingId || "";
                const info = listingId ? perListingOfferInfo.get(listingId) : null;
                const remainingToday = info?.remainingToday ?? 2;
                const nextAllowedAt = info?.nextAllowedAt ?? null;
                const cooldownMs = nextAllowedAt ? Math.max(0, nextAllowedAt - nowTick) : 0;
                const cooldownText =
                  cooldownMs > 0
                    ? (() => {
                        const s = Math.floor(cooldownMs / 1000);
                        const hh = String(Math.floor(s / 3600)).padStart(2, "0");
                        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
                        const ss = String(s % 60).padStart(2, "0");
                        return `${hh}:${mm}:${ss}`;
                      })()
                    : null;
                const limitHit = remainingToday <= 0;
                const cooldownHit = cooldownMs > 0;
                const canReoffer = !limitHit && !cooldownHit;

                return (
                  <div key={teklif.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{teklif.talepBaslik}</h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <User className="w-3 h-3" /> {teklif.kullanici} 
                          <span className="text-gray-300">•</span> 
                          <Clock className="w-3 h-3" /> {teklif.tarih}
                        </p>
                      </div>
                      <StatusBadge status={teklif.durum} />
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-gray-700 text-sm border border-gray-100">
                      &quot;{teklif.mesaj}&quot;
                    </div>
                    
                    {teklif.durum === "red" && teklif.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Ret Sebebi:</strong> {teklif.rejectionReason}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                      <div className="w-full sm:w-auto text-center sm:text-left text-lg font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-100">
                        {teklif.teklifTutari.toLocaleString()}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <button onClick={() => router.push(`/talep/${teklif.listingId || ""}`)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                          Talep Detayı
                        </button>
                        {teklif.durum === "red" && teklif.listingId && (
                          <button
                            onClick={() => router.push(`/teklif-ver/${teklif.listingId}`)}
                            disabled={!canReoffer}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors shadow-sm ${canReoffer ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-200" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                          >
                            Tekrar Teklif Ver
                          </button>
                        )}
                        {teklif.durum === "beklemede" && (
                          <button onClick={() => onOfferUpdate(teklif.id)} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
                            Teklifi Güncelle
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <div>Aynı talebe günde en fazla 2 defa teklif verebilirsiniz. Kalan: {remainingToday}</div>
                      <div>Teklifler arasında 1 saat bekleme vardır{cooldownText ? ` (Kalan: ${cooldownText})` : ""}.</div>
                      <div>Bütçe üzeri teklifi bu talep için en fazla 1 defa verebilirsiniz.</div>
                    </div>

                    {teklif.durum === "red" && (
                      <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        Uyarı: Aynı talebe günde en fazla 2 defa teklif verebilirsiniz.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

    case "aldigim-teklifler":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Aldığım Teklifler</h2>
          
          {isLoadingAldigim ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Aldığınız teklifler yükleniyor...</p>
            </div>
          ) : aldigimTeklifler.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4">
                <Tag className="w-16 h-16 mx-auto opacity-20" />
              </div>
              <p className="text-gray-500">Henüz aldığınız bir teklif yok.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {aldigimTeklifler.map((teklif) => (
                <div key={teklif.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{teklif.talepBaslik}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <User className="w-3 h-3" /> {teklif.kullanici}
                        <span className="text-gray-300">•</span>
                        <Clock className="w-3 h-3" /> {teklif.tarih}
                      </p>
                    </div>
                    <StatusBadge status={teklif.durum} />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-gray-700 text-sm border border-gray-100">
                    &quot;{teklif.mesaj}&quot;
                  </div>
                  
                  {teklif.durum === "red" && teklif.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <strong>Ret Sebebi:</strong> {teklif.rejectionReason}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-100">
                      {teklif.teklifTutari.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end border-t border-gray-50 pt-4">
                    <button onClick={() => router.push(`/teklif/${teklif.id}`)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                      Teklif Detayı
                    </button>
                    {teklif.listingId && teklif.sellerId && (
                      <button
                        onClick={() => onBlockUser(teklif.listingId || "", teklif.sellerId || "")}
                        disabled={!!blockedMap[`${teklif.listingId}:${teklif.sellerId}`]}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                          blockedMap[`${teklif.listingId}:${teklif.sellerId}`]
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" /> {blockedMap[`${teklif.listingId}:${teklif.sellerId}`] ? "Engellendi" : "Engelle"}
                      </button>
                    )}
                    {teklif.durum === "beklemede" && (
                      <>
                        <button onClick={() => onOfferAction(teklif.id, "accept")} className="px-4 py-2 text-sm bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors shadow-sm shadow-lime-200 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Kabul Et
                        </button>
                        <button onClick={() => onOfferAction(teklif.id, "reject")} className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                          <X className="w-4 h-4" /> Reddet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "favoriler":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Favori Taleplerim</h2>
          
          {isLoadingFavoriler ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Favorileriniz yükleniyor...</p>
            </div>
          ) : favoriler.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4">
                <Heart className="w-16 h-16 mx-auto opacity-20" />
              </div>
              <p className="text-gray-500">Henüz favori talebiniz yok.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favoriler.map((favori) => (
                <div key={favori.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-cyan-600 transition-colors cursor-pointer" onClick={() => router.push(`/talep/${favori.id}`)}>{favori.baslik}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 text-xs">{favori.kategori}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {favori.konum}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {favori.attributes?.marka && (
                          <span className="text-xs font-medium bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded border border-cyan-100">
                            {favori.attributes.marka}
                          </span>
                        )}
                        {favori.attributes?.model && (
                          <span className="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100">
                            {favori.attributes.model}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveFavorite(favori.id); }} 
                      className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full transition-colors"
                      title="Favorilerden Kaldır"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="text-lg font-bold text-cyan-600">
                      {(() => {
                        const minP = favori.attributes?.minPrice ? Number(favori.attributes.minPrice) : 0;
                        const maxP = favori.attributes?.maxPrice ? Number(favori.attributes.maxPrice) : 0;
                        
                        if (minP > 0 && maxP > 0) {
                          return `${minP.toLocaleString("tr-TR")} - ${maxP.toLocaleString("tr-TR")}`;
                        } else if (minP > 0) {
                          return `${minP.toLocaleString("tr-TR")} +`;
                        } else if (maxP > 0) {
                          return `En Çok ${maxP.toLocaleString("tr-TR")}`;
                        } else {
                          return `${favori.fiyat.toLocaleString("tr-TR")}`;
                        }
                      })()}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                      <button onClick={() => router.push(`/talep/${favori.id}`)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        Detaylar
                      </button>
                      <button onClick={() => router.push(`/talep/${favori.id}`)} className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200">
                        Teklif Ver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "kayitli-aramalar":
      return <SavedSearchesTab />;

    case "mesajlar":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Mesajlarım</h2>
          {isLoadingMesajlar ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Mesajlar yükleniyor...</p>
            </div>
          ) : mesajlar.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4">
                <MessageSquare className="w-16 h-16 mx-auto opacity-20" />
              </div>
              <p className="text-gray-500">Henüz mesajınız yok.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {mesajlar.map((m) => (
                <div key={m.id} onClick={() => router.push(`/mesajlar/${m.listingId}`)} className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{m.senderName || "Kullanıcı"}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleString("tr-TR")}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${m.read ? "bg-gray-100 text-gray-500" : "bg-cyan-100 text-cyan-600 font-medium"}`}>
                      {m.read ? "Okundu" : "Yeni"}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-1">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "bildirimler":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Bildirimler</h2>
          {isLoadingBildirimler ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Bildirimler yükleniyor...</p>
            </div>
          ) : bildirimler.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4">
                <Bell className="w-16 h-16 mx-auto opacity-20" />
              </div>
              <p className="text-gray-500">Henüz bildiriminiz yok.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bildirimler.map((b) => (
                (() => {
                  const theme =
                    b.type === "offer_accepted"
                      ? {
                          unreadCard: "bg-emerald-50 border-emerald-300",
                          readCard: "bg-emerald-50 border-emerald-200",
                          tag: "bg-emerald-600 text-white border-emerald-700",
                        }
                      : b.type === "offer_rejected"
                        ? {
                            unreadCard: "bg-rose-50 border-rose-300",
                            readCard: "bg-rose-50 border-rose-200",
                            tag: "bg-rose-600 text-white border-rose-700",
                          }
                        : b.type === "SAVED_SEARCH_MATCH"
                          ? {
                              unreadCard: "bg-amber-50 border-amber-300",
                              readCard: "bg-amber-50 border-amber-200",
                              tag: "bg-amber-600 text-white border-amber-700",
                            }
                          : {
                              unreadCard: "bg-sky-50 border-sky-300",
                              readCard: "bg-sky-50 border-sky-200",
                              tag: "bg-sky-600 text-white border-sky-700",
                            };

                  const cardClass = b.read ? theme.readCard : theme.unreadCard;
                  return (
                    <div key={b.id} onClick={async()=>{ 
                        await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) }); 
                        setBildirimler(prev=>prev.map(x=> x.id===b.id ? { ...x, read: true } : x));
                        if (b.link) {
                          router.push(b.link);
                        }
                      }} className={`cursor-pointer rounded-2xl shadow-sm border-2 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all ${cardClass} ${b.read ? "opacity-90" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {b.title}
                          {!b.read && (
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${theme.tag}`}>
                              YENİ
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleString("tr-TR")}</div>
                      </div>
                      {b.body && <p className="text-gray-600">{b.body}</p>}
                      <div className="mt-3 flex items-center gap-1 text-xs">
                        {b.read ? (
                          <span className="text-gray-400 flex items-center gap-1"><Check className="w-3 h-3" /> Okundu</span>
                        ) : (
                          <span className="text-cyan-700 font-bold flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500"></span>
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600"></span>
                            </span>
                            Okunmadı
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()
              ))}
            </div>
          )}
        </div>
      );

    case "istatistikler":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">İstatistiklerim</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Toplam Talep" value="12" icon={<List className="w-6 h-6" />} change="+2 bu ay" trend="up" />
            <StatCard title="Verilen Teklif" value="28" icon={<Tag className="w-6 h-6" />} change="+5 bu ay" trend="up" />
            <StatCard title="Alınan Teklif" value="45" icon={<Tag className="w-6 h-6" />} change="+12 bu ay" trend="up" />
            <StatCard title="Başarı Oranı" value="%85" icon={<Check className="w-6 h-6" />} change="+5% bu ay" trend="up" />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-600" />
              Aylık Performans Grafiği
            </h3>
            <div className="h-64 bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl flex items-center justify-center border border-cyan-100 border-dashed">
              <div className="text-center text-gray-400">
                <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Grafik verisi yakında eklenecek</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "ayarlar":
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Profil Ayarları</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-600" />
              Kişisel Bilgiler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input type="email" defaultValue={user?.email || ""} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Telefon numaranız" 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-600" />
              Bildirim Ayarları
            </h3>
            <div className="space-y-4">
              <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                  checked={profileData.notificationSettings.newOffers}
                  onChange={(e) => setProfileData(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, newOffers: e.target.checked } }))}
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Yeni teklif bildirimleri</span>
                  <span className="block text-xs text-gray-500">İlanlarınıza yeni teklif geldiğinde bildirim alın.</span>
                </div>
              </label>
              <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                  checked={profileData.notificationSettings.messages}
                  onChange={(e) => setProfileData(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, messages: e.target.checked } }))}
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Mesaj bildirimleri</span>
                  <span className="block text-xs text-gray-500">Yeni mesaj aldığınızda anında haberdar olun.</span>
                </div>
              </label>
              <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                  checked={profileData.notificationSettings.marketingEmails}
                  onChange={(e) => setProfileData(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, marketingEmails: e.target.checked } }))}
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Haftalık özet e-postaları</span>
                  <span className="block text-xs text-gray-500">Haftalık aktivite raporunu e-posta olarak alın.</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onSaveProfile}
              disabled={isProfileSaving}
              className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProfileSaving ? "Kaydediliyor..." : (
                <>
                  <Check className="w-5 h-5" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
            <button 
              onClick={onSignOut}
              className="bg-white border border-red-200 text-red-600 px-6 py-2.5 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
