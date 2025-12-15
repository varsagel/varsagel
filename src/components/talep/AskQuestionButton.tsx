"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface AskQuestionButtonProps {
  listingId: string;
  ownerId: string;
  hasAcceptedOffer: boolean;
}

export default function AskQuestionButton({ listingId, ownerId, hasAcceptedOffer }: AskQuestionButtonProps) {
  const { toast } = useToast();

  const handleDisabledClick = () => {
    toast({
      title: "İşlem Kısıtlandı",
      description: "Sohbeti başlatmak istiyorsanız teklif verin ve teklif verdiyseniz kabul edilmesini bekleyin.",
      variant: "destructive",
    });
  };

  if (hasAcceptedOffer) {
    return (
      <Link href={`/mesajlar/${listingId}?to=${ownerId}`}>
        <button className="w-full bg-white border-2 border-cyan-600 text-cyan-600 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Talep Sahibine Soru Sor
        </button>
      </Link>
    );
  }

  return (
    <button
      onClick={handleDisabledClick}
      className="w-full bg-white border-2 border-gray-300 text-gray-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <MessageSquare className="w-5 h-5" />
      Talep Sahibine Soru Sor
    </button>
  );
}

