"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock, Filter, Inbox } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  dataJson?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = list.filter(n => !n.read).length;

  const getNotificationTheme = (n: Notification) => {
    const base =
      n.type === "offer_accepted"
        ? {
            unreadCard: "bg-emerald-50 border-emerald-300",
            readCard: "bg-emerald-50 border-emerald-200",
            icon: n.read ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white",
            tag: "bg-emerald-600 text-white border-emerald-700",
          }
        : n.type === "offer_rejected"
          ? {
              unreadCard: "bg-rose-50 border-rose-300",
              readCard: "bg-rose-50 border-rose-200",
              icon: n.read ? "bg-rose-100 text-rose-700" : "bg-rose-600 text-white",
              tag: "bg-rose-600 text-white border-rose-700",
            }
          : n.type === "SAVED_SEARCH_MATCH"
            ? {
                unreadCard: "bg-amber-50 border-amber-300",
                readCard: "bg-amber-50 border-amber-200",
                icon: n.read ? "bg-amber-100 text-amber-800" : "bg-amber-500 text-white",
                tag: "bg-amber-600 text-white border-amber-700",
              }
            : {
                unreadCard: "bg-sky-50 border-sky-300",
                readCard: "bg-sky-50 border-sky-200",
                icon: n.read ? "bg-sky-100 text-sky-700" : "bg-sky-600 text-white",
                tag: "bg-sky-600 text-white border-sky-700",
              };

    return {
      card: n.read ? base.readCard : base.unreadCard,
      icon: base.icon,
      tag: base.tag,
    };
  };

  const load = useCallback(async (unreadOnly = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications${unreadOnly ? '?unread=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch (error) {
      console.error("Bildirimler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Bildirimler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter === 'unread');
  }, [filter, load]);

  const markRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setList(prev => filter === 'unread' ? prev.filter(n => n.id !== id) : prev.map(n => n.id === id ? { ...n, read: true } : n));
        toast({
          title: "Başarılı",
          description: "Bildirim okundu olarak işaretlendi",
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    }
  };

  const markAllRead = async () => {
    try {
      // Bu endpoint backend'de varsa kullanılabilir, yoksa tek tek döngü ile yapılabilir
      // Şimdilik frontend'de hepsini işaretleyip backend'e istek atalım
      const unreadIds = list.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      await Promise.all(unreadIds.map(id => 
        fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })
      ));

      setList(prev => filter === 'unread' ? [] : prev.map(n => ({ ...n, read: true })));
      toast({
        title: "Başarılı",
        description: "Tüm bildirimler okundu olarak işaretlendi",
        variant: "success",
      });
    } catch {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    
    let data: any = {};
    try {
      data = JSON.parse(n.dataJson || '{}');
    } catch {}

    if (n.type === 'offer_accepted') {
      if (data.listingId) router.push(`/mesajlar/${data.listingId}`);
    } else if (['offer_rejected', 'offer_updated', 'offer_received', 'offer_created'].includes(n.type)) {
      if (data.offerId) {
        router.push(`/teklif/${data.offerId}`);
      } else if (data.listingId) {
        router.push(`/talep/${data.listingId}`);
      }
    } else if (data.listingId) {
       router.push(`/talep/${data.listingId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-50 p-3 rounded-xl">
                <Bell className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} okunmamış bildirim var` : "Hesabınızla ilgili güncellemeler ve haberler"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100 self-start sm:self-auto">
              <button
                onClick={() => setFilter('all')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Inbox className="w-4 h-4" />
                Tümü
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === 'unread' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Okunmamış
                {unreadCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-4">
             <button 
              onClick={markAllRead}
              disabled={!list.some(n => !n.read)}
              className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tümünü Okundu İşaretle
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Bildirimler yükleniyor...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Bildirim Bulunamadı</h3>
            <p className="text-gray-500">Henüz size ulaşan bir bildirim yok.</p>
            {filter === 'unread' && (
              <button 
                onClick={() => setFilter('all')}
                className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
              >
                Tüm bildirimleri görüntüle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list
              .filter(n => filter === 'all' || !n.read)
              .map((notification) => {
                const theme = getNotificationTheme(notification);
                return (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${theme.card}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl shrink-0 shadow-sm ${theme.icon}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className={`font-bold text-sm truncate ${!notification.read ? 'text-gray-900' : 'text-gray-800'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-600 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={`text-sm line-clamp-2 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.body}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500"></span>
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600"></span>
                          </span>
                          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${theme.tag}`}>
                            YENİ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
