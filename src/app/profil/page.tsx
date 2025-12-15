"use client";

import { useState, useEffect } from "react";
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
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Check, 
  X, 
  Clock, 
  MapPin,
  ChevronRight,
  User,
  Mail,
  Phone,
  AlertCircle,
  TrendingUp,
  Search
} from "lucide-react";

import { toast } from "@/components/ui/use-toast";

// Tür tanımlamaları
type TabType = "ozet" | "taleplerim" | "verdigim-teklifler" | "aldigim-teklifler" | "favoriler" | "kayitli-aramalar" | "mesajlar" | "bildirimler" | "istatistikler" | "ayarlar";

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
  attributes?: Record<string, any>;
};

type Teklif = {
  id: string;
  listingId?: string;
  talepBaslik: string;
  teklifTutari: number;
  mesaj: string;
  durum: "beklemede" | "kabul" | "red" | "iptal";
  tarih: string;
  kullanici: string;
  telefon: string;
  email: string;
  rejectionReason?: string;
};

type Favori = {
  id: string;
  baslik: string;
  kategori: string;
  fiyat: number;
  konum: string;
  tarih: string;
  attributes?: Record<string, any>;
};

type KayitliArama = {
  id: string;
  query: string;
  categorySlug: string | null;
  tarih: string;
  matchMode?: "TITLE" | "CATEGORY" | "FILTERS";
  filters?: Record<string, any> | null;
};

// İkon bileşenleri
const IconWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex items-center justify-center rounded-lg bg-cyan-50 p-2 text-cyan-600 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon, change, loading, trend }: { title: string; value: string; icon: React.ReactNode; change?: string; loading?: boolean; trend?: 'up' | 'down' | 'neutral' }) => (
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
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-lime-500 mr-1" />}
            <p className={`text-xs font-medium ${trend === 'up' ? 'text-lime-600' : 'text-gray-500'}`}>{change}</p>
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
    tamamlandi: { bg: "bg-cyan-50 text-cyan-700 border-cyan-200", label: "Tamamlandı", icon: Check },
    iptal: { bg: "bg-red-50 text-red-700 border-red-200", label: "İptal", icon: X },
    beklemede: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Beklemede", icon: Clock },
    kabul: { bg: "bg-lime-50 text-lime-700 border-lime-200", label: "Kabul Edildi", icon: Check },
    red: { bg: "bg-red-50 text-red-700 border-red-200", label: "Reddedildi", icon: X },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { bg: "bg-gray-50 text-gray-700 border-gray-200", label: status, icon: AlertCircle };
  const StatusIcon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      <StatusIcon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
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
  const [kayitliAramalar, setKayitliAramalar] = useState<KayitliArama[]>([]);
  const [isLoadingKayitliAramalar, setIsLoadingKayitliAramalar] = useState(false);
  const [mesajlar, setMesajlar] = useState<any[]>([]);
  const [isLoadingMesajlar, setIsLoadingMesajlar] = useState(false);
  const [bildirimler, setBildirimler] = useState<any[]>([]);
  const [isLoadingBildirimler, setIsLoadingBildirimler] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    
    fetchUserListings();
  }, [session, status, router]);

  useEffect(() => {
    if (!session) return;
    if (activeTab === 'verdigim-teklifler') {
      fetchVerdigimTeklifler();
    } else if (activeTab === 'aldigim-teklifler') {
      fetchAldigimTeklifler();
    } else if (activeTab === 'favoriler') {
      fetchFavoriler();
    } else if (activeTab === 'kayitli-aramalar') {
      fetchKayitliAramalar();
    } else if (activeTab === 'mesajlar') {
      fetchMesajlar();
    } else if (activeTab === 'bildirimler') {
      fetchBildirimler();
    } else if (activeTab === 'ozet') {
      fetchUserListings();
      fetchVerdigimTeklifler();
      fetchAldigimTeklifler();
      fetchBildirimler();
    }
  }, [activeTab, session]);
  
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
        .then(res => res.json())
        .then(data => {
          if (data.name) {
            setProfileData(prev => ({
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
        .catch(err => console.error("Profil yüklenemedi", err));
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
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSaving(false);
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

  const handleDeleteSavedSearch = async (id: string) => {
    if (!confirm('Bu aramayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKayitliAramalar(prev => prev.filter(i => i.id !== id));
        toast({ title: 'Başarılı', description: 'Arama silindi', variant: 'success' });
      } else {
        toast({ title: 'Hata', description: 'İşlem başarısız', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Hata', description: 'Bir hata oluştu', variant: 'destructive' });
    }
  };

  const fetchUserListings = async () => {
    if (!session?.user?.id) return;
    
    setIsLoadingTalepler(true);
    try {
      const response = await fetch(`/api/talepler?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        const rawListings = Array.isArray(data) ? data : (data.data || []);
        const formattedListings: Talep[] = rawListings.map((listing: any) => {
          const durum =
            listing.status === 'active'
              ? 'aktif'
              : listing.status === 'pending'
              ? 'beklemede'
              : 'tamamlandi';

          return {
            id: listing.id,
            baslik: listing.title,
            kategori: listing.category || 'Belirtilmemiş',
            durum,
            tarih: new Date(listing.createdAt).toLocaleDateString('tr-TR'),
            teklifSayisi: 0,
            fiyat: listing.price,
            aciklama: listing.description,
            konum: `${listing.location?.city || ''}, ${listing.location?.district || ''}`,
            attributes: listing.attributes,
          };
        });
        setTaleplerim(formattedListings);
      } else {
        console.error('Talepler yüklenemedi:', response.statusText);
      }
    } catch (error) {
      console.error('Talepler yüklenirken hata:', error);
    } finally {
      setIsLoadingTalepler(false);
    }
  };

  const fetchVerdigimTeklifler = async () => {
    setIsLoadingVerdigim(true);
    try {
      const res = await fetch(`/api/offers?type=given`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Teklif[] = data.map((o: any) => ({
          id: o.id,
          listingId: o.listingId,
          talepBaslik: o.listingTitle,
          teklifTutari: o.price,
          mesaj: o.message,
          durum: o.status === 'PENDING' ? 'beklemede' : o.status === 'ACCEPTED' ? 'kabul' : o.status === 'REJECTED' ? 'red' : 'iptal',
          tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
          kullanici: o.counterpartName || '',
          telefon: '',
          email: o.counterpartEmail || '',
          rejectionReason: o.rejectionReason
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
        const data = await res.json();
        const mapped: Teklif[] = data.map((o: any) => ({
          id: o.id,
          listingId: o.listingId,
          talepBaslik: o.listingTitle,
          teklifTutari: o.price,
          mesaj: o.message,
          durum: o.status === 'PENDING' ? 'beklemede' : o.status === 'ACCEPTED' ? 'kabul' : o.status === 'REJECTED' ? 'red' : 'iptal',
          tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
          kullanici: '',
          telefon: '',
          email: '',
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
            const rawListings = Array.isArray(data) ? data : (data.data || []);
            const mapped: Favori[] = rawListings.map((l: any) => ({
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
    } catch (e) {
      setFavoriler([])
    } finally {
      setIsLoadingFavoriler(false)
    }
  }

  const fetchKayitliAramalar = async () => {
    setIsLoadingKayitliAramalar(true)
    try {
      const res = await fetch('/api/saved-searches')
      if (res.ok) {
        const data = await res.json()
        const mapped: KayitliArama[] = data.map((item: any) => ({
          id: item.id,
          query: item.query,
          categorySlug: item.categorySlug,
          tarih: new Date(item.createdAt).toLocaleDateString('tr-TR'),
          matchMode: item.matchMode,
          filters: item.filtersJson || null,
        }))
        setKayitliAramalar(mapped)
      } else {
        setKayitliAramalar([])
      }
    } catch {
      setKayitliAramalar([])
    } finally {
      setIsLoadingKayitliAramalar(false)
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
      const body: any = { offerId, action };
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

  const renderContent = () => {
    switch (activeTab) {
      case "ozet":
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Hoş Geldin, {user?.name?.split(' ')[0]}! ğŸ‘‹</h2>
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
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Aktif Taleplerim" 
                value={taleplerim.filter(i => i.durum === 'aktif').length.toString()} 
                icon={<List className="w-6 h-6" />} 
                change={taleplerim.length > 0 ? `${taleplerim.length} toplam` : undefined}
                loading={isLoadingTalepler}
                trend="neutral"
              />
              <StatCard 
                title="Verilen Teklifler" 
                value={verdigimTeklifler.length.toString()} 
                icon={<Tag className="w-6 h-6" />}
                change={`Bekleyen: ${verdigimTeklifler.filter(t => t.durum === 'beklemede').length}`}
                loading={isLoadingVerdigim}
                trend="up"
              />
              <StatCard 
                title="Alınan Teklifler" 
                value={aldigimTeklifler.length.toString()} 
                icon={<Tag className="w-6 h-6" />}
                change={`Yeni: ${aldigimTeklifler.filter(t => t.durum === 'beklemede').length}`}
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Son Talepler */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <List className="w-5 h-5 text-cyan-600" />
                    Son Taleplerim
                  </h3>
                  <button onClick={() => setActiveTab('taleplerim')} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
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

              {/* Son Teklifler */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-lime-600" />
                    Son Gelen Teklifler
                  </h3>
                  <button onClick={() => setActiveTab('aldigim-teklifler')} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
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
                          <span>â€¢</span>
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
                      <div className="flex gap-4 text-sm text-gray-600 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="flex items-center gap-1 font-medium text-cyan-600">
                          <Tag className="w-4 h-4" />
                          {(() => {
                          const minP = talep.attributes?.minPrice ? Number(talep.attributes.minPrice) : 0;
                          const maxP = talep.attributes?.maxPrice ? Number(talep.attributes.maxPrice) : 0;
                          
                          if (minP > 0 && maxP > 0) {
                            return `${minP.toLocaleString('tr-TR')} - ${maxP.toLocaleString('tr-TR')}`;
                          } else if (minP > 0) {
                             return `${minP.toLocaleString('tr-TR')} +`;
                          } else if (maxP > 0) {
                             return `Max ${maxP.toLocaleString('tr-TR')}`;
                          } else {
                             return `${talep.fiyat.toLocaleString('tr-TR')}`;
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
                        <button onClick={() => handleDelete(talep.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
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
              {verdigimTeklifler.map((teklif) => (
                <div key={teklif.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{teklif.talepBaslik}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <User className="w-3 h-3" /> {teklif.kullanici} 
                        <span className="text-gray-300">â€¢</span> 
                        <Clock className="w-3 h-3" /> {teklif.tarih}
                      </p>
                    </div>
                    <StatusBadge status={teklif.durum} />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-gray-700 text-sm border border-gray-100">
                    "{teklif.mesaj}"
                  </div>
                  
                  {teklif.durum === 'red' && teklif.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <strong>Ret Sebebi:</strong> {teklif.rejectionReason}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-100">
                    {teklif.teklifTutari.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/talep/${teklif.listingId || ''}`)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        Talep Detayı
                      </button>
                      {teklif.durum === "beklemede" && (
                        <button onClick={() => handleOfferUpdate(teklif.id)} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
                          Teklifi Güncelle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>)}
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
                        <span className="text-gray-300">â€¢</span>
                        <Clock className="w-3 h-3" /> {teklif.tarih}
                      </p>
                    </div>
                    <StatusBadge status={teklif.durum} />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-gray-700 text-sm border border-gray-100">
                    "{teklif.mesaj}"
                  </div>
                  
                  {teklif.durum === 'red' && teklif.rejectionReason && (
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
                      {teklif.durum === "beklemede" && (
                      <>
                        <button onClick={() => handleOfferAction(teklif.id, 'accept')} className="px-4 py-2 text-sm bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors shadow-sm shadow-lime-200 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Kabul Et
                        </button>
                        <button onClick={() => handleOfferAction(teklif.id, 'reject')} className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                          <X className="w-4 h-4" /> Reddet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>)}
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
                        <span>â€¢</span>
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
                      onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(favori.id); }} 
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
                          return `${minP.toLocaleString('tr-TR')} - ${maxP.toLocaleString('tr-TR')}`;
                        } else if (minP > 0) {
                           return `${minP.toLocaleString('tr-TR')} +`;
                        } else if (maxP > 0) {
                           return `Max ${maxP.toLocaleString('tr-TR')}`;
                        } else {
                           return `${favori.fiyat.toLocaleString('tr-TR')}`;
                        }
                      })()}
                    </div>
                    <div className="flex gap-2">
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
            </div>)}
          </div>
        );

      case "kayitli-aramalar":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Kayıtlı Aramalarım</h2>
            
            {isLoadingKayitliAramalar ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Aramalarınız yükleniyor...</p>
              </div>
            ) : kayitliAramalar.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto opacity-20" />
                </div>
                <p className="text-gray-500">Henüz kayıtlı aramanız yok.</p>
              </div>
            ) : (
              <div className="grid gap-4">
              {kayitliAramalar.map((arama) => (
                <div key={arama.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {arama.matchMode === "CATEGORY"
                          ? "Kategori bazlı alarm"
                          : arama.matchMode === "FILTERS"
                          ? "Filtre bazlı alarm"
                          : `"${arama.query}"`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                        {arama.categorySlug && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 text-xs">
                            Kategori: {arama.categorySlug}
                          </span>
                        )}
                        {arama.matchMode && (
                          <span className="bg-cyan-50 px-2 py-0.5 rounded text-cyan-700 text-xs border border-cyan-100">
                            {arama.matchMode === "TITLE"
                              ? "Başlığa göre"
                              : arama.matchMode === "CATEGORY"
                              ? "Sadece kategoriye göre"
                              : "Filtrelere göre"}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" /> {arama.tarih}
                        </span>
                      </div>
                      {arama.filters && Object.keys(arama.filters).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {Object.entries(arama.filters).slice(0, 6).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200"
                            >
                              <span className="font-medium mr-1">
                                {key === "city"
                                  ? "Şehir"
                                  : key === "district"
                                  ? "İlçe"
                                  : key === "minPrice"
                                  ? "Min"
                                  : key === "maxPrice"
                                  ? "Max"
                                  : key}
                                :
                              </span>
                              <span>
                                {typeof value === "number"
                                  ? key === "minPrice" || key === "maxPrice"
                                    ? value.toLocaleString("tr-TR")
                                    : value
                                  : String(value)}
                              </span>
                            </span>
                          ))}
                          {Object.keys(arama.filters).length > 6 && (
                            <span className="text-gray-400">
                              +{Object.keys(arama.filters).length - 6} filtre daha
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Bu arama ile eşleşen yeni bir talep açıldığında bildirim alacaksınız.
                      </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/?q=${encodeURIComponent(arama.query)}${arama.categorySlug ? `&category=${arama.categorySlug}` : ''}`)}
                          className="px-3 py-1.5 text-sm border border-cyan-200 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-1"
                        >
                           <Search className="w-3.5 h-3.5" /> Aramaya Git
                        </button>
                        <button 
                          onClick={() => handleDeleteSavedSearch(arama.id)} 
                          className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                           <Trash2 className="w-3.5 h-3.5" /> Sil
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>)}
          </div>
        );

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
                         <span className="font-semibold text-gray-900">{m.senderName || 'Kullanıcı'}</span>
                         <span className="text-xs text-gray-400">â€¢</span>
                         <span className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${m.read ? 'bg-gray-100 text-gray-500' : 'bg-cyan-100 text-cyan-600 font-medium'}`}>
                        {m.read ? 'Okundu' : 'Yeni'}
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
                  <div key={b.id} onClick={async()=>{ 
                      await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id }) }); 
                      setBildirimler(prev=>prev.map(x=> x.id===b.id ? { ...x, read: true } : x));
                      if (b.link) {
                        router.push(b.link);
                      }
                    }} className={`cursor-pointer bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all ${b.read ? 'border-gray-200 opacity-75' : 'border-cyan-200 bg-cyan-50/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">{b.title}</div>
                      <div className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleString('tr-TR')}</div>
                    </div>
                    {b.body && <p className="text-gray-600">{b.body}</p>}
                    <div className="mt-3 flex items-center gap-1 text-xs">
                      {b.read ? (
                        <span className="text-gray-400 flex items-center gap-1"><Check className="w-3 h-3" /> Okundu</span>
                      ) : (
                        <span className="text-cyan-600 font-medium flex items-center gap-1"><div className="w-2 h-2 bg-cyan-600 rounded-full"></div> Yeni</span>
                      )}
                    </div>
                  </div>
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
                onClick={handleSaveProfile}
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
                onClick={() => signOut()}
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white shadow-xl shadow-gray-200/50 md:min-h-screen md:sticky md:top-0 h-fit z-20 border-r border-gray-100">
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
