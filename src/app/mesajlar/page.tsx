"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Message = { id: string; listingId: string; senderId: string; toUserId: string; content: string; createdAt: string };

export default function MessagesIndexPage() {
  const sessionData = useSession();
  const { data: session } = sessionData || { data: null, status: "loading" };
  const router = useRouter();
  const didMarkRef = useRef(false);
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

  useEffect(() => {
    if (!session?.user?.id) return;
    if (didMarkRef.current) return;
    didMarkRef.current = true;
    fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(() => router.refresh())
      .catch(() => {});
  }, [session?.user?.id, router]);

  // Grup by listingId AND conversation partner
  const groups = useMemo(() => {
    if (!session?.user?.id) return [];
    const myId = session.user.id;
    
    const grouped = messages.reduce((acc: Record<string, any>, m) => {
      const otherId = m.senderId === myId ? m.toUserId : m.senderId;
      const key = `${m.listingId}-${otherId}`;
      
      const g = acc[key] || { listingId: m.listingId, otherUserId: otherId, latest: m };
      if (new Date(m.createdAt).getTime() > new Date(g.latest.createdAt).getTime()) g.latest = m;
      acc[key] = g;
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a: any, b: any) => new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime());
  }, [messages, session?.user?.id]);

  useEffect(() => {
    const run = async () => {
      const ids = groups.map((g: any) => g.listingId).filter(Boolean);
      const missing = ids.filter(id => !listingInfo[id]);
      if (!missing.length) return;
      try {
        const results = await Promise.all(missing.map(id => fetch(`/api/talep?id=${id}`).then(r => r.ok ? r.json() : null).catch(() => null)));
        const map: Record<string, any> = {};
        missing.forEach((id, idx) => { if (results[idx]) map[id] = results[idx]; });
        if (Object.keys(map).length) setListingInfo(prev => ({ ...prev, ...map }));
      } catch {}
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mesajlar</h1>
        {loading ? (
          <div className="text-gray-500 flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Yükleniyor...
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Henüz mesajınız yok</h3>
            <p className="text-gray-500 mt-1">Taleplere teklif vererek veya soru sorarak mesajlaşmaya başlayabilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g: any) => (
              <Link key={`${g.listingId}-${g.otherUserId}`} href={`/mesajlar/${g.listingId}?to=${g.otherUserId}`} className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                    {listingInfo[g.listingId]?.title || `Talep #${g.listingId}`}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (Konuşulan: {g.otherUserId === listingInfo[g.listingId]?.owner?.id ? 'Talep Sahibi' : 'Kullanıcı'})
                    </span>
                  </div>
                  {listingInfo[g.listingId]?.acceptedOffer && (
                    <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full font-medium">Kabul edildi</span>
                  )}
                </div>
                <div className="text-gray-600 text-sm line-clamp-1 mb-2">{g.latest.content}</div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>{new Date(g.latest.createdAt).toLocaleString('tr-TR')}</span>
                    {listingInfo[g.listingId]?.location?.city && (
                      <>
                        <span>•</span>
                        <span>{listingInfo[g.listingId]?.location?.city}/{listingInfo[g.listingId]?.location?.district}</span>
                      </>
                    )}
                  </div>
                  
                  {(() => {
                    const l = listingInfo[g.listingId];
                    if (!l) return null;

                    const minP = l.attributes?.minPrice ? Number(l.attributes.minPrice) : 0;
                    const maxPAttr = l.attributes?.maxPrice ? Number(l.attributes.maxPrice) : 0;
                    const budget = typeof l.price === 'number' ? l.price : 0;

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
                      return (
                        <div className="text-cyan-600 text-[11px] sm:text-xs font-bold">
                        {minP.toLocaleString('tr-TR')} - ∞
                      </div>
                      );
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
                      <div className="text-cyan-600 text-[11px] sm:text-xs font-bold">
                        {from.toLocaleString('tr-TR')} - {to.toLocaleString('tr-TR')}
                      </div>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
