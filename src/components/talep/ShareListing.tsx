"use client";

import { useState } from 'react';
import { Share2, Copy, X, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareListingProps {
  title: string;
  id: string;
}

export default function ShareListing({ title, id }: ShareListingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // URL generation - safe for client side
  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://varsagel.com'}/talep/${id}`;
  };

  const handleCopy = async () => {
    const text = getUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Avoid scrolling to bottom
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
          console.error('Fallback: Oops, unable to copy', err);
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
      console.error('Failed to copy:', err);
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

    // Use native share if available (Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }

    // Fallback to modal
    setIsOpen(true);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-6 h-6 text-lime-500" />,
      url: `https://wa.me/?text=${encodeURIComponent(`Varsagel'de bu talebe göz at: ${title} \n\n ${typeof window !== 'undefined' ? window.location.href : ''}`)}`,
      color: 'bg-lime-50 hover:bg-lime-100'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6 text-cyan-400" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Varsagel'de bu talebe göz at: ${title}`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
      color: 'bg-cyan-50 hover:bg-cyan-100'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6 text-cyan-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
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
                value={typeof window !== 'undefined' ? window.location.href : ''}
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

