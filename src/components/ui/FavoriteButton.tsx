'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

interface FavoriteButtonProps {
  listingId: string;
  isAuthenticated?: boolean;
  isFavorited: boolean;
}

export default function FavoriteButton({ listingId, isAuthenticated, isFavorited }: FavoriteButtonProps) {
  const [fav, setFav] = useState(isFavorited);
  const { data: session } = useSession();
  const { toast } = useToast();
  const canUse = (typeof isAuthenticated === 'boolean' ? isAuthenticated : false) || !!session?.user?.id;

  const toggleFavorite = async () => {
    if (!canUse) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Lütfen üye olun veya giriş yapın.",
        variant: "warning",
      });
      return;
    }

    try {
      if (fav) {
        await fetch(`/api/favorites?listingId=${listingId}`, { method: 'DELETE' });
        setFav(false);
      } else {
        await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId }) });
        setFav(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
      }}
      className="absolute top-1 right-1 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
    >
      <Heart className={`h-3.5 w-3.5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
    </button>
  );
}
