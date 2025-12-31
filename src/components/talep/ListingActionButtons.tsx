'use client';

import Link from 'next/link';
import { Tag, MessageCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ListingActionButtonsProps {
  listingId: string;
  isAuthenticated: boolean;
  hasAcceptedOffer?: boolean;
  isOpen?: boolean;
}

export default function ListingActionButtons({ listingId, isAuthenticated, hasAcceptedOffer = false, isOpen = true }: ListingActionButtonsProps) {
  const { toast } = useToast();

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
      variant: "destructive",
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

  return (
    <div className="space-y-3">
       {isAuthenticated && canInteract ? (
         <Link 
          href={`/teklif-ver/${listingId}`}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
         >
           <Tag className="w-5 h-5" />
           Teklif Ver
         </Link>
       ) : (
         <button
          onClick={handleOfferClick}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all ${
            canInteract ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
         >
           <Tag className="w-5 h-5" />
           Teklif Ver
         </button>
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
