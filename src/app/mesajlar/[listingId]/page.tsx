"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChatPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const { data: session } = useSession();
  const [listing, setListing] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [otherUserId, setOtherUserId] = useState<string>("");
  const [acceptedOffer, setAcceptedOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<Set<string>>(new Set());
  const ATTR_ICONS: Record<string, string> = {
    marka: '🚗',
    model: '🧩',
    yakit: '⛽',
    vites: '⚙️',
    yil: '📅',
    km: '📏',
    metrekare: '📐',
    odaSayisi: '🛏️',
    isitma: '🔥',
    balkon: '🪴',
    kasaTipi: '🚙',
    renk: '🎨',
    cekis: '🛞',
    donanim: '🔧',
  };

  const loadListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/listing?id=${listingId}`);
      if (!res.ok) return;
      const data = await res.json();
      setListing(data);
      const accepted = data.acceptedOffer || (data.offers || []).find((o: any) => o.status === 'ACCEPTED');
      if (accepted && session?.user?.id) {
        const ownerId = data.owner?.id as string;
        const sellerId = accepted.sellerId as string;
        const me = session.user.id as string;
        const other = me === ownerId ? sellerId : ownerId;
        setOtherUserId(other);
        setAcceptedOffer(accepted);
      }
    } catch {}
  }, [listingId, session?.user?.id]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?listingId=${listingId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.reverse());
    } catch {}
  }, [listingId]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadListing();
      await loadMessages();
      setLoading(false);
      const es = new EventSource(`/api/messages/stream?listingId=${listingId}`)
      es.addEventListener('messages', (e: MessageEvent) => {
        try {
          const data = JSON.parse((e as any).data)
          if (Array.isArray(data)) {
            const prev = prevIdsRef.current
            const newArr = data as any[]
            const newIds = newArr.map(m=> m.id).filter((id)=> !prev.has(id))
            setMessages(newArr)
            prevIdsRef.current = new Set(newArr.map(m=> m.id))
            if (newIds.length) {
              setHighlightIds((prevSet) => {
                const s = new Set(prevSet)
                newIds.forEach((id)=> s.add(id))
                return s
              })
              newIds.forEach((id)=> {
                setTimeout(()=> {
                  setHighlightIds((prevSet)=> {
                    const s = new Set(prevSet)
                    s.delete(id)
                    return s
                  })
                }, 2000)
              })
            }
          }
        } catch {}
      })
      es.onerror = () => { es.close() }
      ;(window as any).__msg_es = es
    })();
    return () => {
      active = false
      const es: EventSource | undefined = (window as any).__msg_es
      if (es) es.close()
    };
  }, [loadListing, loadMessages]);

  useEffect(() => {
    // Otomatik en alta kaydır
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = async () => {
    setError("");
    const content = input.trim();
    if (!content || !otherUserId) return;
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId, toUserId: otherUserId, content }) });
      const data = await res.json();
      if (res.ok) {
        setInput("");
        await loadMessages();
      } else {
        setError(data?.error || 'Mesaj gönderilemedi');
      }
    } catch {
      setError('Mesaj gönderilirken hata oluştu');
    }
  };

  const myId = session?.user?.id as string | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <Link href={listing ? `/ilan/${listing.id}` : '/'} className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
              ← İlana Dön
            </Link>
            <h1 className="text-2xl font-bold text-white">Mesajlaşma</h1>
            {listing && <p className="text-white/80 text-sm">{listing.title}</p>}
          </div>
          {listing && (
            <div className="text-right space-y-1">
              <span className="block text-gray-300 text-sm bg-white/10 px-2 py-1 rounded">Teklif: {(listing.offers || []).find((o: any)=>o.status==='ACCEPTED') ? 'Kabul edildi' : 'Aktif değil'}</span>
              {acceptedOffer && (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-white text-xs bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1 rounded">👤 Alıcı: {listing.owner?.name || 'Anonim'}</span>
                  <span className="text-white text-xs bg-gradient-to-r from-purple-600 to-purple-500 px-2 py-1 rounded">🛒 Satıcı: {acceptedOffer.sellerName || 'Satıcı'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-white">Yükleniyor...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sol: İlan Bilgileri */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-white text-lg font-semibold mb-3">İlan Bilgileri</h3>
              {listing ? (
                <div className="space-y-2 text-white/90">
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-white/80">{listing.location?.city}{listing.location?.district ? `, ${listing.location?.district}` : ''}</p>
                  <p className="text-sm text-white/80">Kategori: {listing.category?.name}{listing.subCategory ? ` • ${listing.subCategory.name}` : ''}</p>
                  {typeof listing.price === 'number' && (<p className="text-sm text-white/80">Bütçe: ₺{listing.price.toLocaleString('tr-TR')}</p>)}
                  {listing.code && (<p className="text-xs text-white/60">Kod: {listing.code}</p>)}
                  {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(listing.attributes).slice(0,8).map(([k,v]: any) => {
                        const s = String(v);
                        const parts = s.split(',').map(p=>p.trim()).filter(Boolean);
                        const icon = ATTR_ICONS[k] || '';
                        return parts.length ? parts.slice(0,3).map(p=> (
                          <span key={`${k}-${p}`} className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">{icon ? `${icon} ` : ''}{p}</span>
                        )) : <span key={k} className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">{icon ? `${icon} ` : ''}{s}</span>
                      })}
                    </div>
                  )}
                  {Array.isArray(listing.images) && listing.images.length > 0 && (
                    <img src={listing.images[0]} alt={listing.title} className="mt-2 w-full h-32 object-cover rounded" onError={(e)=> (e.currentTarget.src='/images/placeholder-1.svg')} />
                  )}
                </div>
              ) : (
                <p className="text-gray-300">İlan yüklenemedi</p>
              )}
            </div>

            {/* Orta: Sohbet */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 lg:col-span-2">
              <div className="flex flex-col h-[65vh]">
                <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-300">Mesaj yok</div>
                  ) : (
                    messages.map((m) => {
                      const mine = myId && m.fromUserId === myId;
                      const ownerId = listing?.owner?.id as string | undefined
                      const sellerId = acceptedOffer?.sellerId as string | undefined
                      const senderName = listing && acceptedOffer
                        ? (m.fromUserId === ownerId ? (listing.owner?.name || 'Alıcı') : (acceptedOffer.sellerName || 'Satıcı'))
                        : (mine ? 'Siz' : 'Karşı Taraf');
                      const roleLabel = listing && acceptedOffer
                        ? (m.fromUserId === ownerId ? 'Alıcı' : 'Satıcı')
                        : (mine ? 'Siz' : 'Karşı Taraf');
                      const timeLabel = new Date(m.createdAt).toLocaleString('tr-TR');
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${mine ? 'text-right' : 'text-left'} max-w-[70%]`}>
                            <div className={`flex items-center gap-2 mb-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${roleLabel==='Alıcı' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>{String(senderName).charAt(0)}</div>
                              <div className="text-xs text-white/70">{senderName}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${roleLabel==='Alıcı' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>{roleLabel==='Alıcı' ? '👤 Alıcı' : '🛒 Satıcı'}</span>
                            </div>
                          <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'} px-4 py-2 rounded-lg shadow transition-colors duration-300 ${highlightIds.has(m.id) ? 'ring-2 ring-yellow-300 animate-pulse' : ''}`}>{m.content}</div>
                          <div className="text-[10px] text-white/60 mt-1">{timeLabel}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 w-full">
                  <input
                    value={input}
                    onChange={(e)=>setInput(e.target.value)}
                    placeholder="Mesaj yazın..."
                    className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e)=> { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !otherUserId}
                    className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap ${(!input.trim() || !otherUserId) ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'}`}
                  >
                    📤 Gönder
                  </button>
                </div>
              </div>
            </div>

            {/* Sağ: Teklif Bilgileri */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-white text-lg font-semibold mb-3">Teklif Bilgileri</h3>
              {acceptedOffer ? (
                <div className="space-y-2 text-white/90">
                  <p className="text-sm">Satıcı: <span className="font-medium">{acceptedOffer.sellerName || 'Satıcı'}</span></p>
                  {acceptedOffer.sellerEmail && (<p className="text-sm">E-posta: <span className="font-medium">{acceptedOffer.sellerEmail}</span></p>)}
                  {typeof acceptedOffer.price === 'number' && (
                    <p className="text-sm">Fiyat: <span className="font-medium">₺{acceptedOffer.price.toLocaleString('tr-TR')}</span></p>
                  )}
                  <div className="mt-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-white/20 rounded p-3">
                    <div className="text-xs text-white/70 mb-1">📩 Teklif Mesajı</div>
                    <div className="text-white/90 text-sm">{acceptedOffer.message}</div>
                  </div>
                  <p className="text-xs text-white/70">Tarih: {new Date(acceptedOffer.createdAt).toLocaleString('tr-TR')}</p>
                  {acceptedOffer.attributes && Object.keys(acceptedOffer.attributes).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(acceptedOffer.attributes).slice(0,8).map(([k,v]: any) => {
                        const s = String(v);
                        const parts = s.split(',').map(p=>p.trim()).filter(Boolean);
                        const icon = ATTR_ICONS[k] || '';
                        return parts.length ? parts.slice(0,3).map(p=> (
                          <span key={`${k}-${p}`} className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">{icon ? `${icon} ` : ''}{p}</span>
                        )) : <span key={k} className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">{icon ? `${icon} ` : ''}{s}</span>
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">Kabul edilmiş teklif bulunamadı</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
