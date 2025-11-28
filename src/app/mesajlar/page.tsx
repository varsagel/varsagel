"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Message = { id: string; listingId: string; fromUserId: string; toUserId: string; content: string; createdAt: string };

export default function MessagesIndexPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingInfo, setListingInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          setMessages(data);
        }
      } catch {}
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  // Grup by listingId, latest message
  const groups = useMemo(() => Object.values(messages.reduce((acc: Record<string, any>, m) => {
    const g = acc[m.listingId] || { listingId: m.listingId, latest: m };
    if (new Date(m.createdAt).getTime() > new Date(g.latest.createdAt).getTime()) g.latest = m;
    acc[m.listingId] = g;
    return acc;
  }, {})), [messages]);

  useEffect(() => {
    const run = async () => {
      const ids = groups.map((g: any) => g.listingId).filter(Boolean);
      const missing = ids.filter(id => !listingInfo[id]);
      if (!missing.length) return;
      try {
        const results = await Promise.all(missing.map(id => fetch(`/api/listing?id=${id}`).then(r => r.ok ? r.json() : null).catch(() => null)));
        const map: Record<string, any> = {};
        missing.forEach((id, idx) => { if (results[idx]) map[id] = results[idx]; });
        if (Object.keys(map).length) setListingInfo(prev => ({ ...prev, ...map }));
      } catch {}
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">Mesajlar</h1>
        {loading ? (
          <div className="text-gray-300">Yükleniyor...</div>
        ) : groups.length === 0 ? (
          <div className="text-gray-300">Henüz mesajınız yok</div>
        ) : (
          <div className="space-y-3">
            {groups.map((g: any) => (
              <Link key={g.listingId} href={`/mesajlar/${g.listingId}`} className="block bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium line-clamp-1">{listingInfo[g.listingId]?.title || `İlan #${g.listingId}`}</div>
                  {listingInfo[g.listingId]?.acceptedOffer && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Kabul edildi</span>
                  )}
                </div>
                <div className="text-white/80 text-sm line-clamp-1">{g.latest.content}</div>
                <div className="text-white/60 text-xs mt-1">{new Date(g.latest.createdAt).toLocaleString('tr-TR')}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-white/70 text-xs">
                    {listingInfo[g.listingId]?.location?.city}
                    {listingInfo[g.listingId]?.location?.district ? `, ${listingInfo[g.listingId]?.location?.district}` : ''}
                    {listingInfo[g.listingId]?.category?.name ? ` • ${listingInfo[g.listingId]?.category?.name}` : ''}
                  </div>
                  {typeof listingInfo[g.listingId]?.price === 'number' && (
                    <div className="text-blue-300 text-xs font-semibold">₺{listingInfo[g.listingId].price.toLocaleString('tr-TR')}</div>
                  )}
                </div>
                {Array.isArray(listingInfo[g.listingId]?.images) && listingInfo[g.listingId].images.length > 0 && (
                  <img src={listingInfo[g.listingId].images[0]} alt="" className="mt-2 w-full h-24 object-cover rounded" onError={(e)=> (e.currentTarget.src='/images/placeholder-1.svg')} />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
