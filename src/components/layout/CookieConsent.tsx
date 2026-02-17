'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-2 bg-cyan-50 rounded-lg hidden sm:block">
            <Cookie className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="sm:hidden"><Cookie className="w-4 h-4 text-cyan-600 inline" /></span>
              Çerez Politikası
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Size daha iyi bir deneyim sunmak, site trafiğini analiz etmek ve içerikleri kişiselleştirmek için çerezleri kullanıyoruz.
              Daha fazla bilgi için <Link href="/kurumsal/gizlilik-politikasi" className="text-cyan-600 hover:underline font-medium">Gizlilik Politikası</Link> ve <Link href="/kurumsal/kvkk" className="text-cyan-600 hover:underline font-medium">KVKK Aydınlatma Metni</Link>ni inceleyebilirsiniz.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1 md:flex-none whitespace-nowrap"
          >
            Reddet
          </Button>
          <Button 
            onClick={handleAccept}
            className="flex-1 md:flex-none whitespace-nowrap bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Kabul Et
          </Button>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

