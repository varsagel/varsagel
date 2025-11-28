"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Tür tanımlamaları
type TabType = "ilanlarim" | "verdigim-teklifler" | "aldigim-teklifler" | "favoriler" | "mesajlar" | "bildirimler" | "istatistikler" | "ayarlar";

type Ilan = {
  id: string;
  baslik: string;
  kategori: string;
  durum: "aktif" | "tamamlandi" | "iptal" | "beklemede";
  tarih: string;
  teklifSayisi: number;
  fiyat: number;
  aciklama: string;
  konum: string;
};

type Teklif = {
  id: string;
  listingId?: string;
  ilanBaslik: string;
  teklifTutari: number;
  mesaj: string;
  durum: "beklemede" | "kabul" | "red" | "iptal";
  tarih: string;
  kullanici: string;
  telefon: string;
  email: string;
};

type Favori = {
  id: string;
  baslik: string;
  kategori: string;
  fiyat: number;
  konum: string;
  tarih: string;
};

// İkon bileşenleri
const Icon = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-2 text-blue-600 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon, change }: { title: string; value: string; icon: React.ReactNode; change?: string }) => (
  <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className="text-sm text-green-600 mt-1">{change}</p>
        )}
      </div>
      {icon}
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    aktif: { bg: "bg-green-100 text-green-800", label: "Aktif" },
    tamamlandi: { bg: "bg-blue-100 text-blue-800", label: "Tamamlandı" },
    iptal: { bg: "bg-red-100 text-red-800", label: "İptal" },
    beklemede: { bg: "bg-yellow-100 text-yellow-800", label: "Beklemede" },
    kabul: { bg: "bg-green-100 text-green-800", label: "Kabul Edildi" },
    red: { bg: "bg-red-100 text-red-800", label: "Reddedildi" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { bg: "bg-gray-100 text-gray-800", label: status };

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
    {config.label}
  </span>;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ilanlarim");
  const [isLoading, setIsLoading] = useState(false);

  // Gerçek ilan verileri için state
  const [ilanlarim, setIlanlarim] = useState<Ilan[]>([]);
  const [isLoadingIlanlar, setIsLoadingIlanlar] = useState(false);

  const [verdigimTeklifler, setVerdigimTeklifler] = useState<Teklif[]>([]);
  const [isLoadingVerdigim, setIsLoadingVerdigim] = useState(false);

  const [aldigimTeklifler, setAldigimTeklifler] = useState<Teklif[]>([]);
  const [isLoadingAldigim, setIsLoadingAldigim] = useState(false);

  const [favoriler, setFavoriler] = useState<Favori[]>([]);
  const [isLoadingFavoriler, setIsLoadingFavoriler] = useState(false);
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
    } else if (activeTab === 'mesajlar') {
      fetchMesajlar();
    } else if (activeTab === 'bildirimler') {
      fetchBildirimler();
    }
  }, [activeTab, session]);
  
  const fetchUserListings = async () => {
    if (!session?.user?.id) return;
    
    setIsLoadingIlanlar(true);
    try {
      const response = await fetch(`/api/listings?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        const formattedListings: Ilan[] = data.map((listing: any) => ({
          id: listing.id,
          baslik: listing.title,
          kategori: listing.category || 'Belirtilmemiş',
          durum: listing.status === 'active' ? 'aktif' : 'tamamlandi',
          tarih: new Date(listing.createdAt).toLocaleDateString('tr-TR'),
          teklifSayisi: 0,
          fiyat: listing.price,
          aciklama: listing.description,
          konum: `${listing.location?.city || ''}, ${listing.location?.district || ''}`
        }));
        setIlanlarim(formattedListings);
      } else {
        console.error('İlanlar yüklenemedi:', response.statusText);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setIsLoadingIlanlar(false);
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
          ilanBaslik: o.listingTitle,
          teklifTutari: o.price,
          mesaj: o.message,
          durum: o.status === 'PENDING' ? 'beklemede' : o.status === 'ACCEPTED' ? 'kabul' : o.status === 'REJECTED' ? 'red' : 'iptal',
          tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
          kullanici: o.counterpartName || '',
          telefon: '',
          email: o.counterpartEmail || ''
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
          ilanBaslik: o.listingTitle,
          teklifTutari: o.price,
          mesaj: o.message,
          durum: o.status === 'PENDING' ? 'beklemede' : o.status === 'ACCEPTED' ? 'kabul' : o.status === 'REJECTED' ? 'red' : 'iptal',
          tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
          kullanici: '',
          telefon: '',
          email: ''
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
          const listRes = await fetch(`/api/listings?ids=${ids.join(',')}`)
          if (listRes.ok) {
            const data = await listRes.json()
            const mapped: Favori[] = data.map((l: any) => ({
              id: l.id,
              baslik: l.title,
              kategori: l.category || '',
              fiyat: l.price,
              konum: `${l.location?.city || ''}, ${l.location?.district || ''}`,
              tarih: new Date(l.createdAt).toLocaleDateString('tr-TR')
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

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch('/api/offers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId, action }) })
      if (res.ok) {
        fetchAldigimTeklifler()
      }
    } catch {}
  }

  const handleOfferUpdate = async (offerId: string) => {
    const input = typeof window !== 'undefined' ? window.prompt('Yeni fiyat (TL)') : null
    if (!input) return
    const price = Number(input)
    if (!price || price < 1) return
    try {
      const res = await fetch('/api/offers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId, action: 'update', price }) })
      if (res.ok) {
        fetchVerdigimTeklifler()
      }
    } catch {}
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;

  const tabs = [
    { id: "ilanlarim", label: "İlanlarım", icon: "📋" },
    { id: "verdigim-teklifler", label: "Verdiğim Teklifler", icon: "💰" },
    { id: "aldigim-teklifler", label: "Aldığım Teklifler", icon: "📨" },
    { id: "favoriler", label: "Favoriler", icon: "⭐" },
    { id: "mesajlar", label: "Mesajlarım", icon: "💬" },
    { id: "bildirimler", label: "Bildirimler", icon: "🔔" },
    { id: "istatistikler", label: "İstatistikler", icon: "📊" },
    { id: "ayarlar", label: "Ayarlar", icon: "⚙️" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "ilanlarim":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">İlanlarım</h2>
              <Link href="/ilan-ver" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                Yeni İlan Ver
              </Link>
            </div>
            
            {isLoadingIlanlar ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">İlanlarınız yükleniyor...</p>
              </div>
            ) : ilanlarim.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Henüz ilanınız bulunmuyor.</p>
                <Link href="/ilan-ver" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  İlk İlanınızı Verin
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {ilanlarim.map((ilan) => (
                  <div key={ilan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{ilan.baslik}</h3>
                        <p className="text-sm text-gray-600 mt-1">{ilan.kategori} • {ilan.konum}</p>
                      </div>
                      <StatusBadge status={ilan.durum} />
                    </div>
                    
                    <p className="text-gray-700 mb-4">{ilan.aciklama}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>💰 {ilan.fiyat.toLocaleString()} TL</span>
                        <span>📅 {ilan.tarih}</span>
                        <span>💬 {ilan.teklifSayisi} teklif</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/ilan/${ilan.id}`)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          Düzenle
                        </button>
                        <button onClick={() => router.push(`/ilan/${ilan.id}`)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Teklifleri Gör
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Verdiğiniz teklifler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid gap-4">
              {verdigimTeklifler.map((teklif) => (
                <div key={teklif.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{teklif.ilanBaslik}</h3>
                      <p className="text-sm text-gray-600 mt-1">{teklif.kullanici} • {teklif.tarih}</p>
                    </div>
                    <StatusBadge status={teklif.durum} />
                  </div>
                  
                  <p className="text-gray-700 mb-4">{teklif.mesaj}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-blue-600">
                      💰 {teklif.teklifTutari.toLocaleString()} TL
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/ilan/${teklif.listingId || ''}`)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        Detaylar
                      </button>
                      {teklif.durum === "beklemede" && (
                        <button onClick={() => handleOfferUpdate(teklif.id)} className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                          Güncelle
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Aldığınız teklifler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid gap-4">
              {aldigimTeklifler.map((teklif) => (
                <div key={teklif.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{teklif.ilanBaslik}</h3>
                      <p className="text-sm text-gray-600 mt-1">{teklif.kullanici} • {teklif.tarih}</p>
                    </div>
                    <StatusBadge status={teklif.durum} />
                  </div>
                  
                  <p className="text-gray-700 mb-4">{teklif.mesaj}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold text-blue-600">
                      💰 {teklif.teklifTutari.toLocaleString()} TL
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      Detaylar
                    </button>
                    {teklif.durum === "beklemede" && (
                      <>
                        <button onClick={() => handleOfferAction(teklif.id, 'accept')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Kabul Et
                        </button>
                        <button onClick={() => handleOfferAction(teklif.id, 'reject')} className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                          Reddet
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
            <h2 className="text-2xl font-bold text-gray-900">Favorilerim</h2>
            
            {isLoadingFavoriler ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Favorileriniz yükleniyor...</p>
              </div>
            ) : (
              <div className="grid gap-4">
              {favoriler.map((favori) => (
                <div key={favori.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{favori.baslik}</h3>
                      <p className="text-sm text-gray-600 mt-1">{favori.kategori} • {favori.konum}</p>
                    </div>
                    <button className="text-red-500 hover:text-red-700">
                      ⭐
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-blue-600">
                      💰 {favori.fiyat.toLocaleString()} TL
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        Detaylar
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Teklif Ver
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Mesajlar yükleniyor...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mesajlar.map((m) => (
                  <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-600">{new Date(m.createdAt).toLocaleString('tr-TR')}</div>
                      <span className={`text-xs ${m.isRead ? 'text-gray-500' : 'text-blue-600'}`}>{m.isRead ? 'Okundu' : 'Yeni'}</span>
                    </div>
                    <p className="text-gray-800">{m.content}</p>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Bildirimler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bildirimler.map((b) => (
                  <div key={b.id} onClick={async()=>{ await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id }) }); setBildirimler(prev=>prev.map(x=> x.id===b.id ? { ...x, isRead: true } : x)) }} className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">{b.title}</div>
                      <div className="text-sm text-gray-600">{new Date(b.createdAt).toLocaleString('tr-TR')}</div>
                    </div>
                    {b.body && <p className="text-gray-700">{b.body}</p>}
                    <div className="mt-3 text-xs {b.isRead ? 'text-gray-400' : 'text-blue-600'}">{b.isRead ? 'Okundu' : 'Yeni'}</div>
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
              <StatCard title="Toplam İlan" value="12" icon={<Icon>📋</Icon>} change="+2 bu ay" />
              <StatCard title="Verilen Teklif" value="28" icon={<Icon>💰</Icon>} change="+5 bu ay" />
              <StatCard title="Alınan Teklif" value="45" icon={<Icon>📨</Icon>} change="+12 bu ay" />
              <StatCard title="Başarı Oranı" value="%85" icon={<Icon>✅</Icon>} change="+5% bu ay" />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Performans Grafiği</h3>
              <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Grafik verisi burada görünecek</p>
              </div>
            </div>
          </div>
        );

      case "ayarlar":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profil Ayarları</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                  <input type="text" defaultValue={user?.name || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <input type="email" defaultValue={user?.email || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input type="tel" placeholder="Telefon numaranız" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Ayarları</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Yeni teklif bildirimleri</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Mesaj bildirimleri</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Haftalık özet e-postaları</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                Değişiklikleri Kaydet
              </button>
              <button 
                onClick={() => signOut()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all"
              >
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            {/* Profil Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="Profil"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-gray-900">{user?.name || "Kullanıcı"}</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>

            {/* Navigasyon */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Ana Sayfa Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              >
                <span>🏠</span>
                <span className="font-medium">Ana Sayfa</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
