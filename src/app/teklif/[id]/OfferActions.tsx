'use client';

// Component for accepting/rejecting offers
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function OfferActions({ offerId, mode = 'decision' }: { offerId: string; mode?: 'decision' | 'reopen' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleAction = async (action: 'accept' | 'reject' | 'reopen', reason?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          offerId, 
          action,
          rejectionReason: reason 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'İşlem başarısız');
      }

      router.refresh();
      if (action === 'reject') setRejectDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'reopen') {
    return (
      <div className="space-y-3">
        <button
          onClick={() => {
            const ok = typeof window !== 'undefined' ? window.confirm('Talebi yeniden yayına almak için admin onayına gönderilsin mi?') : true;
            if (ok) handleAction('reopen');
          }}
          disabled={loading}
          className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Admin Onayına Gönder
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => handleAction('accept')}
          disabled={loading}
          className="flex-1 bg-lime-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-lime-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Teklifi Kabul Et
        </button>
        <button
          onClick={() => setRejectDialogOpen(true)}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
          Reddet
        </button>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teklifi Reddet</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Red Sebebi (Zorunlu)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Fiyat çok düşük, başka bir teklif değerlendiriliyor vb."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[100px]"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <DialogFooter>
            <button
              onClick={() => setRejectDialogOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={() => handleAction('reject', rejectionReason)}
              disabled={loading || !rejectionReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Reddet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
