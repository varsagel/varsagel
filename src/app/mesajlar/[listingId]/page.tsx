"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, Send, User, ShoppingCart, MapPin, Folder, Tag, Info, MessageSquare, CheckCircle } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const searchParams = useSearchParams();
  const toUserId = searchParams.get('to');
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
    donanim2: '🔧',
  };

  const loadListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/talep?id=${listingId}`);
      if (!res.ok) return;
      const data = await res.json();
      setListing(data);

      const accepted = data.acceptedOffer || (data.offers || []).find((o: any) => o.status === 'ACCEPTED');
      if (accepted) {
        setAcceptedOffer(accepted);
      }
      
      if (session?.user?.id) {
        const me = session.user.id;
        const ownerId = data.owner?.id;
        
        let targetId = "";
        if (toUserId && toUserId !== me) {
          targetId = toUserId;
        } else if (accepted) {
          targetId = me === ownerId ? accepted.sellerId : ownerId;
        } else {
          if (me !== ownerId) targetId = ownerId;
        }
        if (targetId) setOtherUserId(targetId);
      }
    } catch {}
  }, [listingId, session?.user?.id, toUserId]);

  const loadMessages = useCallback(async () => {
    if (!otherUserId) return;
    try {
      const res = await fetch(`/api/messages?listingId=${listingId}&contactId=${otherUserId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.reverse());
    } catch {}
  }, [listingId, otherUserId]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  useEffect(() => {
    if (!otherUserId || !session?.user?.id) return;

    let active = true;
    (async () => {
      setLoading(true);
      await loadMessages();
      setLoading(false);
    })();

    const es = new EventSource(`/api/messages/stream?listingId=${listingId}`);
    es.addEventListener('messages', (e: MessageEvent) => {
      try {
        const data = JSON.parse((e as any).data);
        if (Array.isArray(data)) {
          // Filter messages for this conversation
          const meId = session?.user?.id as string | undefined;
          const filtered = data.filter((m: any) => 
            meId && (
              (m.senderId === otherUserId && m.toUserId === meId) ||
              (m.senderId === meId && m.toUserId === otherUserId)
            )
          );

          const prev = prevIdsRef.current;
          const newArr = filtered as any[];
          const newIds = newArr.map(m => m.id).filter((id) => !prev.has(id));
          
          setMessages(newArr); // We replace with full filtered list from server (which sends last 200)
          
          // Update prevIds to avoid re-notifying known messages
          // But wait, prevIdsRef tracks ALL IDs seen? Or just for this conversation?
          // If we switch conversation, we should clear prevIdsRef?
          // The effect re-runs on otherUserId change, so we should reset refs?
          // Yes, but refs persist across renders.
          // We should reset prevIdsRef inside this effect cleanup or start.
          
          // However, simpler logic: just setMessages.
          // Highlighting logic might be nice but secondary.
          
          if (newIds.length) {
            setHighlightIds((prevSet) => {
              const s = new Set(prevSet);
              newIds.forEach((id) => s.add(id));
              return s;
            });
            newIds.forEach((id) => {
              setTimeout(() => {
                setHighlightIds((prevSet) => {
                  const s = new Set(prevSet);
                  s.delete(id);
                  return s;
                });
              }, 2000);
            });
          }
          
          // Update ref with current visible messages
          prevIdsRef.current = new Set(newArr.map(m => m.id));
        }
      } catch {}
    });
    es.onerror = () => { es.close(); };
    (window as any).__msg_es = es;

    return () => {
      active = false;
      es.close();
      prevIdsRef.current = new Set(); // Reset seen IDs
    };
  }, [otherUserId, listingId, loadMessages, session?.user?.id]); // Added listingId dependency

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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href={listing ? `/talep/${listing.id}` : '/'} className="text-cyan-600 hover:text-cyan-700 mb-1 inline-flex items-center text-sm font-medium transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Talebe Dön
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Mesajlaşma
              {listing && <span className="text-sm font-normal text-gray-500">/ {listing.title}</span>}
            </h1>
          </div>
          {listing && (
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(listing.offers || []).find((o: any)=>o.status==='ACCEPTED') ? 'bg-lime-100 text-lime-800' : 'bg-gray-100 text-gray-800'}`}>
                  {(listing.offers || []).find((o: any)=>o.status==='ACCEPTED') ? 'Teklif Kabul Edildi' : 'Teklif Bekleniyor'}
                </span>
              </div>
              {acceptedOffer && (
                <div className="flex items-center gap-2 justify-end text-xs">
                  <span className="flex items-center gap-1 text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-100">
                    <User className="w-3 h-3" /> Talep Sahibi: {listing.owner?.name || 'Anonim'}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                    <ShoppingCart className="w-3 h-3" /> Teklif Veren: {acceptedOffer.sellerName || 'Teklif Veren'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm shadow-sm">{error}</div>}
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-500 font-medium">Sohbet yükleniyor...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
            
            {/* Sol: Talep Bilgileri */}
            <div className="hidden lg:block bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full overflow-y-auto custom-scrollbar">
              <h3 className="text-gray-900 text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-600" />
                Talep Bilgileri
              </h3>
              {listing ? (
                <div className="space-y-4">
                   {Array.isArray(listing.images) && listing.images.length > 0 ? (
                    <div className="aspect-video w-full relative rounded-xl overflow-hidden border border-gray-100">
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" onError={(e)=> (e.currentTarget.src='/images/placeholder-1.svg')} />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      <span className="text-sm">Görsel Yok</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 leading-tight">{listing.title}</h4>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{listing.location?.city}{listing.location?.district ? `, ${listing.location?.district}` : ''}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Folder className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{listing.category?.name}{listing.subCategory ? ` • ${listing.subCategory.name}` : ''}</span>
                      </div>
                      {(listing.attributes?.marka || listing.attributes?.model) && (
                        <div className="flex items-start gap-2">
                          <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{[listing.attributes?.marka, listing.attributes?.model].filter(Boolean).join(' ')}</span>
                        </div>
                      )}
                    </div>

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
                        return (
                          <div className="bg-cyan-50 text-cyan-700 px-3 py-2 rounded-lg font-bold text-sm border border-cyan-100 text-center">
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
                        <div className="bg-cyan-50 text-cyan-700 px-3 py-2 rounded-lg font-bold text-sm border border-cyan-100 text-center">
                          {from.toLocaleString('tr-TR')} - {to.toLocaleString('tr-TR')}
                        </div>
                      );
                    })()}
                    
                    {listing.code && (
                      <div className="text-xs text-gray-400 text-center">Kod: {listing.code}</div>
                    )}
                  </div>

                  {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Özellikler</div>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(listing.attributes).map(([k,v]: any) => {
                          if(['minPrice', 'maxPrice'].includes(k)) return null;
                          const s = String(v);
                          const parts = s.split(',').map(p=>p.trim()).filter(Boolean);
                          const icon = ATTR_ICONS[k] || '•';
                          return (
                            <div key={k} className="flex items-start gap-2 text-sm group">
                              <span className="text-gray-400 mt-0.5">{icon}</span>
                              <div>
                                <span className="text-gray-500 text-xs block">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-gray-900 font-medium">{parts.length > 0 ? parts.join(', ') : s}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  Talep bilgisi bulunamadı
                </div>
              )}
            </div>

            {/* Orta: Sohbet */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm lg:col-span-2 flex flex-col h-full overflow-hidden">
              <div ref={listRef} className="flex-1 overflow-y-auto space-y-6 p-6 custom-scrollbar bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-900">Henüz mesaj yok</p>
                      <p className="text-sm text-gray-500">İlk mesajı göndererek sohbeti başlatın</p>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = myId && m.senderId === myId;
                    const ownerId = listing?.owner?.id as string | undefined
                    const sellerId = acceptedOffer?.sellerId as string | undefined
                    const senderName = listing && acceptedOffer
                      ? (m.senderId === ownerId ? (listing.owner?.name || 'Talep Sahibi') : (acceptedOffer.sellerName || 'Teklif Veren'))
                      : (mine ? 'Siz' : 'Karşı Taraf');
                    const roleLabel = listing && acceptedOffer
                      ? (m.senderId === ownerId ? 'Talep Sahibi' : 'Teklif Veren')
                      : (mine ? 'Siz' : 'Karşı Taraf');
                    const timeLabel = new Date(m.createdAt).toLocaleString('tr-TR');
                    
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} max-w-[85%] group`}>
                          <div className={`flex items-center gap-2 mb-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${roleLabel==='Talep Sahibi' ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'}`}>
                              {String(senderName).charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{senderName}</span>
                          </div>
                          
                          <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed relative ${
                            mine 
                              ? 'bg-cyan-600 text-white rounded-tr-none hover:bg-cyan-700 transition-colors' 
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none hover:bg-gray-50 transition-colors'
                          } ${highlightIds.has(m.id) ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
                            {m.content}
                          </div>
                          
                          <div className={`text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {timeLabel}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500 transition-all">
                  <input
                    value={input}
                    onChange={(e)=>setInput(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none px-3 py-2"
                    onKeyDown={(e)=> { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !otherUserId}
                    className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                      (!input.trim() || !otherUserId) 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sağ: Teklif Bilgileri */}
            <div className="hidden lg:block bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full overflow-y-auto custom-scrollbar">
              <h3 className="text-gray-900 text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-lime-600" />
                Teklif Detayları
              </h3>
              {acceptedOffer ? (
                <div className="space-y-4">
                  <div className="bg-lime-50 rounded-xl p-5 border border-lime-100">
                    <div className="flex items-center justify-between border-b border-lime-200 pb-3 mb-3">
                      <span className="text-lime-800 font-medium text-sm">Teklif Fiyatı</span>
                      <span className="text-2xl font-bold text-lime-700">{Number(acceptedOffer.price).toLocaleString('tr-TR')}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-lime-800/70">Teklif Veren</span>
                        <span className="font-medium text-lime-900">{acceptedOffer.sellerName || 'Teklif Veren'}</span>
                      </div>
                      {acceptedOffer.sellerEmail && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-lime-800/70">E-posta</span>
                          <span className="font-medium text-lime-900 truncate max-w-[150px]" title={acceptedOffer.sellerEmail}>{acceptedOffer.sellerEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-lime-800/70">Tarih</span>
                        <span className="font-medium text-lime-900">{new Date(acceptedOffer.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  {acceptedOffer.message && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                      <div className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 text-xs font-bold text-gray-500 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Teklif Mesajı
                      </div>
                      <p className="text-gray-600 text-sm italic leading-relaxed mt-1">
                        "{acceptedOffer.message}"
                      </p>
                    </div>
                  )}

                  {acceptedOffer.attributes && Object.keys(acceptedOffer.attributes).length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Teklif Özellikleri</div>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(acceptedOffer.attributes).map(([k,v]: any) => {
                          const s = String(v);
                          const parts = s.split(',').map(p=>p.trim()).filter(Boolean);
                          const icon = ATTR_ICONS[k] || '•';
                          return (
                            <div key={k} className="flex items-start gap-2 text-sm">
                              <span className="text-gray-400 mt-0.5">{icon}</span>
                              <div>
                                <span className="text-gray-500 text-xs block">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-gray-900 font-medium">{parts.length > 0 ? parts.join(', ') : s}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-center p-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 font-medium mb-1">Henüz Teklif Yok</h4>
                  <p className="text-sm text-gray-500">Bu talep için kabul edilmiş bir teklif bulunmuyor.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
