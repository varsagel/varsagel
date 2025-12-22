'use client';

import { useState } from 'react';
import { Shield, Flag } from 'lucide-react';
import ReportModal from './ReportModal';

export default function SafetyTips({ listingId, listingTitle, isAuthenticated }: { listingId: string, listingTitle: string, isAuthenticated: boolean }) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <div className="bg-cyan-50 rounded-3xl p-6 border border-cyan-100">
        <div className="flex items-center gap-2 text-cyan-800 font-bold mb-3">
          <Shield className="w-5 h-5" />
          <span>Güvenlik İpuçları</span>
        </div>
        <ul className="text-sm text-cyan-900/70 space-y-2 list-disc pl-4">
          <li>Ödemeyi asla ürünü görmeden yapmayın.</li>
          <li>Kişisel bilgilerinizi paylaşırken dikkatli olun.</li>
          <li>Şüpheli durumlarda talebi şikayet edin.</li>
        </ul>
        <button 
          onClick={() => setIsReportOpen(true)}
          disabled={!isAuthenticated}
          className="mt-4 text-red-600 text-sm font-semibold flex items-center gap-1 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isAuthenticated ? "Şikayet etmek için giriş yapmanız gerekiyor" : ""}
        >
          <Flag className="w-4 h-4" /> Talebi Şikayet Et
        </button>
      </div>

      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        listingId={listingId} 
        listingTitle={listingTitle} 
      />
    </>
  );
}

