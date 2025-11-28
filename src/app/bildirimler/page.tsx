"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Notification = { id: string; type: string; title: string; body?: string; dataJson?: string; isRead: boolean; createdAt: string };

export default function NotificationsPage() {
  const { status } = useSession();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (unreadOnly = false) => {
    try {
      const res = await fetch(`/api/notifications${unreadOnly ? '?unread=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(false); }, []);

  const markRead = async (id: string) => {
    try { await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      setList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Bildirimler</h1>
          <div className="flex items-center gap-2">
            <button className="text-sm bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20" onClick={() => load(true)}>Sadece Okunmamış</button>
            <button className="text-sm bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20" onClick={() => load(false)}>Tümü</button>
          </div>
        </div>
        {loading ? (
          <div className="text-gray-300">Yükleniyor...</div>
        ) : list.length === 0 ? (
          <div className="text-gray-300">Bildirim yok</div>
        ) : (
          <div className="space-y-3">
            {list.map(n => (
              <div key={n.id} className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 border ${n.isRead ? 'border-white/10' : 'border-yellow-300'} flex items-start justify-between`}>
                <div>
                  <div className="text-white font-medium">{n.title}</div>
                  {n.body && <div className="text-white/80 text-sm">{n.body}</div>}
                  <div className="text-white/60 text-xs mt-1">{new Date(n.createdAt).toLocaleString('tr-TR')}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <button className="text-xs bg-yellow-400 text-black px-2 py-1 rounded" onClick={() => markRead(n.id)}>Okundu İşaretle</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
