'use client';

import Link from 'next/link';
import { Tag, MessageCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useMemo, useState } from 'react';

interface ListingActionButtonsProps {
  listingId: string;
  isAuthenticated: boolean;
  hasAcceptedOffer?: boolean;
  isOpen?: boolean;
}

export default function ListingActionButtons({ listingId, isAuthenticated, hasAcceptedOffer = false, isOpen = true }: ListingActionButtonsProps) {
  const { toast } = useToast();
  const [elig, setElig] = useState<any>(null);
  const [tick, setTick] = useState<number>(0);

  const handleOfferClick = () => {
    if (!isOpen) {
      toast({
        variant: "destructive",
        title: "Talep Henüz Yayında Değil",
        description: "Bu talep admin onayından sonra teklif almaya açılacaktır.",
      });
      return;
    }
    toast({
      variant: "warning",
      title: "Üye Olmalısınız",
      description: "Teklif verebilmek için lütfen giriş yapın veya üye olun.",
    });
  };

  const handleQuestionClick = () => {
    if (!isAuthenticated) return;
    
    const el = document.getElementById('questions-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const canInteract = isOpen;

  useEffect(() => {
    if (!isAuthenticated || !canInteract) {
      setElig(null);
      return;
    }
    fetch(`/api/offers/eligibility?listingId=${encodeURIComponent(listingId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setElig(data))
      .catch(() => setElig(null));
  }, [isAuthenticated, canInteract, listingId]);

  useEffect(() => {
    if (!elig?.nextAllowedAt) return;
    setTick(Date.now());
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [elig?.nextAllowedAt]);

  const blockedReasonText = useMemo(() => {
    if (!elig || elig.canOffer) return null;
    if (elig.reason === 'DAILY_LIMIT') return 'Aynı talebe bugün 2 teklif verdiniz.'
    if (elig.reason === 'COOLDOWN') return 'Tekrar teklif vermek için 1 saat beklemelisiniz.'
    if (elig.reason === 'PENDING_EXISTS') return 'Bu talep için bekleyen teklifiniz var.'
    if (elig.reason === 'BLOCKED') return 'Bu talep için teklif verme yetkiniz bulunmuyor.'
    return 'Şu anda teklif verilemiyor.'
  }, [elig]);

  const countdownText = useMemo(() => {
    if (!elig?.nextAllowedAt) return null;
    const until = new Date(elig.nextAllowedAt).getTime();
    const diff = Math.max(0, until - tick);
    const s = Math.floor(diff / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }, [elig?.nextAllowedAt, tick]);

  const offerDisabled = !canInteract || (isAuthenticated && elig && !elig.canOffer);

  return (
    <div className="space-y-3">
       {isAuthenticated && !offerDisabled ? (
         <Link 
          href={`/teklif-ver/${listingId}`}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
         >
           <Tag className="w-5 h-5" />
           Teklif Ver
         </Link>
       ) : (
         <button
          onClick={isAuthenticated ? undefined : handleOfferClick}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all ${
            canInteract && !offerDisabled ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
         >
           <Tag className="w-5 h-5" />
           Teklif Ver
         </button>
       )}

       <div className="text-xs text-gray-500">
        <div>Aynı talebe günde en fazla 2 defa teklif verebilirsiniz.</div>
        <div>Teklifler arasında 1 saat bekleme vardır.</div>
        <div>Bütçe üzeri teklifi bu talep için en fazla 1 defa verebilirsiniz.</div>
       </div>

       {isAuthenticated && blockedReasonText && (
        <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          {blockedReasonText}{countdownText ? ` (${countdownText})` : ''}
        </div>
       )}
       
       {isAuthenticated && hasAcceptedOffer ? (
         <Link
          href={`/mesajlar/${listingId}`}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-cyan-100 text-cyan-600 py-3 rounded-xl font-bold hover:border-cyan-200 hover:bg-cyan-50 transition-all"
         >
           <MessageCircle className="w-5 h-5" />
           Özel Mesaj Gönder
         </Link>
       ) : (
         <button
          onClick={isAuthenticated ? handleQuestionClick : handleOfferClick}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-cyan-100 text-cyan-600 py-3 rounded-xl font-bold hover:border-cyan-200 hover:bg-cyan-50 transition-all"
         >
           <MessageCircle className="w-5 h-5" />
           Soru Sor
         </button>
       )}

       <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl text-xs text-yellow-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>Güvenliğiniz için tüm görüşmeleri Varsagel üzerinden yapın. Kapora veya ön ödeme talep edenlere itibar etmeyin.</p>
          </div>
       </div>
    </div>
  );
}
