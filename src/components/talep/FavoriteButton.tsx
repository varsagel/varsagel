"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

export default function FavoriteButton({ listingId, initial, disabled = false }: { listingId: string; initial: boolean; disabled?: boolean }) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const toggle = async () => {
    if (disabled) return;
    if (busy) return;

    if (!session) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Lütfen üye olun veya giriş yapın.",
        variant: "warning",
      });
      return;
    }

    setBusy(true);
    try {
      if (fav) {
        await fetch(`/api/favorites?listingId=${listingId}`, { method: 'DELETE' });
        setFav(false);
      } else {
        await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId }) });
        setFav(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      className={`w-full bg-white border-2 py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
        disabled
          ? "border-gray-200 text-gray-400 cursor-not-allowed"
          : "border-gray-200 text-gray-700 hover:border-cyan-200 hover:text-cyan-600"
      }`}
    >
      <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : disabled ? 'text-gray-400' : ''}`} />
      {disabled ? 'Kendi Talebinize Favori Ekleyemezsiniz' : (fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle')}
    </button>
  );
}
