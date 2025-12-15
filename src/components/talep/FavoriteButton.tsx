"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ listingId, initial }: { listingId: string; initial: boolean }) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
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
    <button onClick={toggle} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:border-cyan-200 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2">
      <Heart className={`w-5 h-5 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
      {fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
    </button>
  );
}

