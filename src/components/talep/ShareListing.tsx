"use client";

import { useState } from 'react';
import { Share2, Copy, X, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareListingProps {
  title: string;
  id: string;
  slug?: string;
}

export default function ShareListing({ title, id, slug }: ShareListingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    const baseUrl = (() => {
      if (typeof window !== "undefined") {
        const host = window.location.hostname.toLowerCase();
        if (host === "localhost" || host === "127.0.0.1") return window.location.origin;
      }
      const envBase = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
      if (envBase) return envBase;
      return "https://www.varsagel.com";
    })();
    const slugPart = slug || id;
    return `${baseUrl}/talep/${slugPart}`;
  };

  const handleCopy = async () => {
    const text = getUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Kopyalama başarısız', err);
          throw err;
        }

        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast({
        title: "Başarılı",
        description: "Talep bağlantısı panoya kopyalandı.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
      toast({
        title: "Hata",
        description: "Bağlantı kopyalanamadı. Lütfen manuel olarak kopyalayın.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const url = getUrl();
    const shareData = {
      title: title,
      text: `Varsagel'de bu talebe göz at: ${title}`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Paylaşım hatası:', err);
      }
    }

    setIsOpen(true);
  };

  const url = getUrl();
  const shareText = `Varsagel'de bu talebe göz at: ${title}\n\n${url}`;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-6 h-6 text-lime-500" />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      color: 'bg-lime-50 hover:bg-lime-100'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6 text-cyan-400" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Varsagel'de bu talebe göz at: ${title}`)}&url=${encodeURIComponent(url)}`,
      color: 'bg-cyan-50 hover:bg-cyan-100'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6 text-cyan-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-cyan-50 hover:bg-cyan-100'
    }
  ];

  return (
    <>
      <button 
        onClick={handleShare}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
        title="Paylaş"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Talebi Paylaş</h3>
            <p className="text-sm text-gray-500 mb-6">Bu talebi arkadaşlarınızla paylaşın</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors ${link.color}`}
                >
                  {link.icon}
                  <span className="text-xs font-medium text-gray-700">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={url}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-600 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <span className="text-lime-600 font-bold text-xs">Kopyalandı</span>
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
