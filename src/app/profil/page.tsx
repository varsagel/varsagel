"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  List, 
  Tag, 
  Heart, 
  MessageSquare, 
  Bell, 
  BarChart2, 
  Settings, 
  LogOut, 
  Home, 
  Check, 
  X, 
  ChevronDown,
  AlertCircle,
  Search
} from "lucide-react";

import { toast } from "@/components/ui/use-toast";

// Tür tanımlamaları
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

type RawListing = {
  id: string;
  title: string;
  category?: string | null;
  status?: string;
  createdAt: string;
  price: number;
  description: string;
  location?: {
    city?: string | null;
    district?: string | null;
  };
  attributes?: Attributes;
};

type ApiOffer = {
  id: string;
  listingId?: string;
  sellerId?: string;
  listingTitle: string;
  price: number;
  message: string;
  status: string;
  createdAt: string;
  counterpartName?: string | null;
  counterpartEmail?: string | null;
  rejectionReason?: string | null;
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

const ProfileTabContent = dynamic(() => import("@/components/profile/ProfileTabContent"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
      <p className="mt-4 text-gray-500 text-sm text-center">İçerik yükleniyor...</p>
    </div>
  ),
});

export default function ProfilePage() {
  const sessionData = useSession();
  const { data: session, status } = sessionData || { data: null, status: "loading" };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ozet");
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["ozet", "taleplerim", "verdigim-teklifler", "aldigim-teklifler", "favoriler", "kayitli-aramalar", "mesajlar", "bildirimler", "istatistikler", "ayarlar"].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);
  
  // Gerçek talep verileri için state
  const [taleplerim, setTaleplerim] = useState<Talep[]>([]);
  const [isLoadingTalepler, setIsLoadingTalepler] = useState(false);

  const [verdigimTeklifler, setVerdigimTeklifler] = useState<Teklif[]>([]);
  const [isLoadingVerdigim, setIsLoadingVerdigim] = useState(false);

  const [aldigimTeklifler, setAldigimTeklifler] = useState<Teklif[]>([]);
  const [isLoadingAldigim, setIsLoadingAldigim] = useState(false);

  const [favoriler, setFavoriler] = useState<Favori[]>([]);
  const [isLoadingFavoriler, setIsLoadingFavoriler] = useState(false);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [isLoadingMesajlar, setIsLoadingMesajlar] = useState(false);
  const [bildirimler, setBildirimler] = useState<Bildirim[]>([]);
  const [isLoadingBildirimler, setIsLoadingBildirimler] = useState(false);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [blockedMap, setBlockedMap] = useState<Record<string, boolean>>({});

  const fetchUserListings = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoadingTalepler(true);
    try {
      const response = await fetch(`/api/talepler?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        const rawListings = (Array.isArray(data) ? data : data.data || []) as RawListing[];
        const formattedListings: Talep[] = rawListings.map((listing) => {
          const durum =
            listing.status === "active"
              ? "aktif"
              : listing.status === "pending"
              ? "beklemede"
              : "tamamlandi";

          return {
            id: listing.id,
            baslik: listing.title,
            kategori: listing.category || "Belirtilmemiş",
            durum,
            tarih: new Date(listing.createdAt).toLocaleDateString("tr-TR"),
            teklifSayisi: 0,
            fiyat: listing.price,
            aciklama: listing.description,
            konum: `${listing.location?.city || ""}, ${listing.location?.district || ""}`,
            attributes: listing.attributes,
          };
        });
        setTaleplerim(formattedListings);
      } else {
        console.error("Talepler yüklenemedi:", response.statusText);
      }
    } catch (error) {
      console.error("Talepler yüklenirken hata:", error);
    } finally {
      setIsLoadingTalepler(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }

    fetchUserListings();
  }, [session, status, router, fetchUserListings]);

  useEffect(() => {
    if (!session) return;
    if (activeTab === "verdigim-teklifler") {
      fetchVerdigimTeklifler();
    } else if (activeTab === "aldigim-teklifler") {
      fetchAldigimTeklifler();
    } else if (activeTab === "favoriler") {
      fetchFavoriler();
    } else if (activeTab === "mesajlar") {
      fetchMesajlar();
    } else if (activeTab === "bildirimler") {
      fetchBildirimler();
    } else if (activeTab === "ozet") {
      fetchUserListings();
      fetchVerdigimTeklifler();
      fetchAldigimTeklifler();
      fetchBildirimler();
    }
  }, [activeTab, session, fetchUserListings]);

  useEffect(() => {
    if (activeTab !== "verdigim-teklifler") return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeTab]);

  const perListingOfferInfo = useMemo(() => {
    const now = new Date(nowTick);
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const map = new Map<string, { offersToday: number; lastAt: number | null; remainingToday: number; nextAllowedAt: number | null }>();

    for (const offer of verdigimTeklifler) {
      const listingId = offer.listingId || "";
      if (!listingId || !offer.createdAt) continue;
      const createdMs = new Date(offer.createdAt).getTime();
      const current = map.get(listingId) || { offersToday: 0, lastAt: null, remainingToday: 2, nextAllowedAt: null };
      if (createdMs >= dayStartMs) current.offersToday += 1;
      if (current.lastAt === null || createdMs > current.lastAt) current.lastAt = createdMs;
      map.set(listingId, current);
    }

    for (const [listingId, v] of map.entries()) {
      const remainingToday = Math.max(0, 2 - v.offersToday);
      const nextAllowedAt = v.lastAt ? v.lastAt + 60 * 60 * 1000 : null;
      map.set(listingId, { ...v, remainingToday, nextAllowedAt });
    }

    return map;
  }, [verdigimTeklifler, nowTick]);
  
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    notificationSettings: {
      newOffers: true,
      messages: true,
      marketingEmails: false
    }
  });

  useEffect(() => {
    if (activeTab === "ayarlar") {
      // Fetch user data
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.name) {
            setProfileData((prev) => ({
              ...prev,
              name: data.name,
              phone: data.phone || "",
              notificationSettings: {
                newOffers: data.notificationSettings?.newOffers ?? true,
                messages: data.notificationSettings?.messages ?? true,
                marketingEmails: data.notificationSettings?.marketingEmails ?? false
              }
            }));
          }
        })
        .catch((err) => console.error("Profil yüklenemedi", err));
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setIsProfileSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleBlockUser = async (listingId: string, blockedUserId: string) => {
    const key = `${listingId}:${blockedUserId}`;
    try {
      const res = await fetch('/api/listings/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, blockedUserId }),
      });
      if (res.ok) {
        setBlockedMap((prev) => ({ ...prev, [key]: true }));
        toast({ title: 'Engellendi', description: 'Kullanıcı bu talep için engellendi.', variant: 'success' });
        return;
      }
      const data = await res.json().catch(() => null);
      toast({ title: 'Hata', description: data?.error || 'Engelleme başarısız', variant: 'destructive' });
    } catch {
      toast({ title: 'Hata', description: 'Engelleme başarısız', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu talebi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/talep?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTaleplerim(prev => prev.filter(i => i.id !== id));
        toast({ title: 'Başarılı', description: 'Talep başarıyla silindi', variant: 'success' });
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'Silme işlemi başarısız oldu', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Hata', description: 'Bir hata oluştu', variant: 'destructive' });
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/favorites?listingId=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFavoriler(prev => prev.filter(f => f.id !== id));
        toast({ title: 'Başarılı', description: 'Favorilerden kaldırıldı', variant: 'success' });
      } else {
        toast({ title: 'Hata', description: 'İşlem başarısız', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Hata', description: 'Bir hata oluştu', variant: 'destructive' });
    }
  };

  const fetchVerdigimTeklifler = async () => {
    setIsLoadingVerdigim(true);
    try {
      const res = await fetch(`/api/offers?type=given`);
      if (res.ok) {
        const data: ApiOffer[] = await res.json();
        const mapped: Teklif[] = data.map((o) => ({
          id: o.id,
          listingId: o.listingId,
          talepBaslik: o.listingTitle,
          teklifTutari: o.price,
          mesaj: o.message,
          durum: o.status === 'PENDING' ? 'beklemede' : o.status === 'ACCEPTED' ? 'kabul' : o.status === 'REJECTED' ? 'red' : 'iptal',
          tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
          createdAt: o.createdAt,
          kullanici: o.counterpartName || '',
          telefon: '',
          email: o.counterpartEmail || '',
          rejectionReason: o.rejectionReason ?? null
        }))
        setVerdigimTeklifler(mapped)
      }
    } catch (e) {
      console.error('Verdiğim teklifler yüklenemedi', e)
    } finally {
      setIsLoadingVerdigim(false)
    }
  }

  const fetchAldigimTeklifler = async () => {
    setIsLoadingAldigim(true);
    try {
      const res = await fetch(`/api/offers?type=received`);
      if (res.ok) {
        const data: ApiOffer[] = await res.json();
        const mapped: Teklif[] = data.map((o) => ({
          id: o.id,
          listingId: o.listingId,
          sellerId: o.sellerId,
          talepBaslik: o.listingTitle,
          teklifTutari: o.price,
          mesaj: o.message,
          durum: o.status === 'PENDING' ? 'beklemede' : o.status === 'ACCEPTED' ? 'kabul' : o.status === 'REJECTED' ? 'red' : 'iptal',
          tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
          createdAt: o.createdAt,
          kullanici: o.counterpartName || '',
          telefon: '',
          email: o.counterpartEmail || '',
          rejectionReason: o.rejectionReason
        }))
        setAldigimTeklifler(mapped)
      }
    } catch (e) {
      console.error('Aldığım teklifler yüklenemedi', e)
    } finally {
      setIsLoadingAldigim(false)
    }
  }

  const fetchFavoriler = async () => {
    setIsLoadingFavoriler(true)
    try {
      const favRes = await fetch('/api/favorites')
      if (!favRes.ok) {
        setFavoriler([])
      } else {
        const ids: string[] = await favRes.json()
        if (ids.length === 0) {
          setFavoriler([])
        } else {
          const listRes = await fetch(`/api/talepler?ids=${ids.join(',')}`)
          if (listRes.ok) {
            const data = await listRes.json()
            const rawListings = (Array.isArray(data) ? data : (data.data || [])) as RawListing[];
            const mapped: Favori[] = rawListings.map((l) => ({
              id: l.id,
              baslik: l.title,
              kategori: l.category || '',
              fiyat: l.price,
              konum: `${l.location?.city || ''}, ${l.location?.district || ''}`,
              tarih: new Date(l.createdAt).toLocaleDateString('tr-TR'),
              attributes: l.attributes
            }))
            setFavoriler(mapped)
          } else {
            setFavoriler([])
          }
        }
      }
    } catch {
      setFavoriler([])
    } finally {
      setIsLoadingFavoriler(false)
    }
  }

  const fetchMesajlar = async () => {
    setIsLoadingMesajlar(true)
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setMesajlar(data)
      } else {
        setMesajlar([])
      }
    } catch {
      setMesajlar([])
    } finally {
      setIsLoadingMesajlar(false)
    }
  }

  const fetchBildirimler = async () => {
    setIsLoadingBildirimler(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setBildirimler(data)
      } else {
        setBildirimler([])
      }
    } catch {
      setBildirimler([])
    } finally {
      setIsLoadingBildirimler(false)
    }
  }

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectOfferId, setRejectOfferId] = useState<string | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>("");
  const [customRejectReason, setCustomRejectReason] = useState("");
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  const REJECTION_REASONS = [
    "Fiyat beklentimin üzerinde",
    "Başka bir satıcı ile anlaştım",
    "Artık ihtiyacım kalmadı",
    "Ürün/Hizmet detayları yetersiz",
    "Diğer"
  ];

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    if (action === 'reject') {
      setRejectOfferId(offerId);
      setSelectedRejectReason("");
      setCustomRejectReason("");
      setIsRejectModalOpen(true);
      return;
    }

    try {
      const body = { offerId, action };
      const res = await fetch('/api/offers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        fetchAldigimTeklifler()
        toast({ title: 'Başarılı', description: 'Teklif kabul edildi', variant: 'success' });
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'İşlem başarısız', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Hata', description: 'Hata oluştu', variant: 'destructive' });
    }
  }

  const confirmReject = async () => {
    if (!rejectOfferId) return;
    
    let finalReason = selectedRejectReason;
    if (selectedRejectReason === 'Diğer') {
      if (!customRejectReason.trim()) {
        toast({ title: "Eksik Bilgi", description: "Lütfen bir sebep belirtiniz.", variant: "destructive" });
        return;
      }
      finalReason = customRejectReason;
    } else {
       if (customRejectReason.trim()) {
         finalReason = `${selectedRejectReason} - ${customRejectReason}`;
       }
    }
    
    if (!finalReason) {
       toast({ title: "Eksik Bilgi", description: "Lütfen bir sebep seçiniz.", variant: "destructive" });
       return;
    }

    setIsRejectLoading(true);
    try {
      const body = { offerId: rejectOfferId, action: 'reject', rejectionReason: finalReason };
      const res = await fetch('/api/offers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      
      if (res.ok) {
        fetchAldigimTeklifler();
        toast({ title: 'Başarılı', description: 'Teklif reddedildi', variant: 'success' });
        setIsRejectModalOpen(false);
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'İşlem başarısız', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Hata', description: 'Hata oluştu', variant: 'destructive' });
    } finally {
      setIsRejectLoading(false);
    }
  };

  const handleOfferUpdate = async (offerId: string) => {
    const input = typeof window !== 'undefined' ? window.prompt('Yeni fiyat (TL)') : null
    if (!input) return
    const price = Number(input)
    if (!price || price < 1) return
    try {
      const res = await fetch('/api/offers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId, action: 'update', price }) })
      if (res.ok) {
        fetchVerdigimTeklifler()
        toast({ title: 'Başarılı', description: 'Teklif güncellendi', variant: 'success' });
      }
    } catch {}
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;

  const tabs = [
    { id: "ozet", label: "Genel Bakış", icon: LayoutDashboard },
    { id: "taleplerim", label: "Taleplerim", icon: List },
    { id: "verdigim-teklifler", label: "Verdiğim Teklifler", icon: Tag },
    { id: "aldigim-teklifler", label: "Aldığım Teklifler", icon: Tag },
    { id: "favoriler", label: "Favoriler", icon: Heart },
    { id: "kayitli-aramalar", label: "Kayıtlı Aramalarım", icon: Search },
    { id: "mesajlar", label: "Mesajlarım", icon: MessageSquare },
    { id: "bildirimler", label: "Bildirimler", icon: Bell },
    { id: "istatistikler", label: "İstatistikler", icon: BarChart2 },
    { id: "ayarlar", label: "Ayarlar", icon: Settings }
  ];

  const renderContent = () => (
    <ProfileTabContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      taleplerim={taleplerim}
      isLoadingTalepler={isLoadingTalepler}
      verdigimTeklifler={verdigimTeklifler}
      isLoadingVerdigim={isLoadingVerdigim}
      aldigimTeklifler={aldigimTeklifler}
      isLoadingAldigim={isLoadingAldigim}
      favoriler={favoriler}
      isLoadingFavoriler={isLoadingFavoriler}
      mesajlar={mesajlar}
      isLoadingMesajlar={isLoadingMesajlar}
      bildirimler={bildirimler}
      isLoadingBildirimler={isLoadingBildirimler}
      perListingOfferInfo={perListingOfferInfo}
      nowTick={nowTick}
      blockedMap={blockedMap}
      onDeleteTalep={handleDelete}
      onOfferUpdate={handleOfferUpdate}
      onOfferAction={handleOfferAction}
      onBlockUser={handleBlockUser}
      onRemoveFavorite={handleRemoveFavorite}
      setBildirimler={setBildirimler}
      router={router}
      profileData={profileData}
      setProfileData={setProfileData}
      isProfileSaving={isProfileSaving}
      onSaveProfile={handleSaveProfile}
      onSignOut={() => signOut()}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative inline-block">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profil"
                width={48}
                height={48}
                className="rounded-full border-2 border-white shadow-md object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-50 to-indigo-50 flex items-center justify-center text-lg font-bold text-cyan-600 shadow-inner border border-cyan-100">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user?.name}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-cyan-500 transition-colors font-medium"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:block w-72 bg-white shadow-xl shadow-gray-200/50 md:min-h-screen md:sticky md:top-0 h-fit z-20 border-r border-gray-100">
        <div className="p-6 sticky top-0">
          {/* Profil Header */}
          <div className="text-center mb-8 pb-8 border-b border-gray-100">
            <div className="relative inline-block mb-4">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profil"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-50 to-indigo-50 flex items-center justify-center text-3xl font-bold text-cyan-600 shadow-inner border border-cyan-100">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-lime-500 rounded-full border-2 border-white shadow-sm" title="Çevrimiçi"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || "Kullanıcı"}</h2>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            <div className="mt-3 inline-flex px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium border border-cyan-100">
              Standart Üye
            </div>
          </div>

          {/* Navigasyon */}
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
                    activeTab === tab.id
                      ? "bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-200 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <TabIcon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? "text-cyan-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-600"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Ana Sayfa Link */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all group"
            >
              <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Ana Sayfa</span>
            </Link>
            <button 
              onClick={() => signOut()}
              className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden bg-gray-50">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
          {renderContent()}
        </div>
      </main>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Teklifi Reddet
              </h3>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Bu teklifi neden reddetmek istiyorsunuz?
              </p>
              
              <div className="space-y-2.5 mb-6">
                {REJECTION_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedRejectReason(reason)}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 flex items-center justify-between group
                      ${selectedRejectReason === reason 
                        ? 'border-red-600 bg-red-50 text-red-700 shadow-sm' 
                        : 'border-gray-100 hover:border-red-200 hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    {reason}
                    {selectedRejectReason === reason && <Check className="w-4 h-4 text-red-600" />}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  {selectedRejectReason === 'Diğer' ? 'Red Sebebi (Zorunlu)' : 'Ek Açıklama (Opsiyonel)'}
                </label>
                <textarea
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder={selectedRejectReason === 'Diğer' ? "Lütfen sebebi belirtiniz..." : "Eklemek istediğiniz bir not var mı?"}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all resize-none text-sm"
                />
              </div>
            </div>

            <div className="p-6 pt-2 flex gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={confirmReject}
                disabled={isRejectLoading || (selectedRejectReason === 'Diğer' && !customRejectReason.trim()) || !selectedRejectReason}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isRejectLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
