'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

const REASONS = [
  { id: 'scam', label: 'Dolandırıcılık Şüphesi' },
  { id: 'spam', label: 'Spam / Yanıltıcı İçerik' },
  { id: 'offensive', label: 'Hakaret / Uygunsuz Dil' },
  { id: 'illegal', label: 'Yasadışı Ürün/Hizmet' },
  { id: 'other', label: 'Diğer' }
];

export default function ReportModal({ isOpen, onClose, listingId, listingTitle }: ReportModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('scam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          reason,
          details
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast({
        title: "Şikayetiniz Alındı",
        description: "Bildiriminiz için teşekkürler. Ekibimiz en kısa sürede inceleyecektir.",
        variant: "success",
      });

      onClose();
      setDetails('');
      setReason('scam');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Şikayet gönderilemedi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Talebi Şikayet Et
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <strong>Talep:</strong> {listingTitle}
          </div>

          <div className="space-y-3">
            <Label>Şikayet Nedeni</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="grid grid-cols-1 gap-2">
              {REASONS.map((r) => (
                <div key={r.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors [&:has(:checked)]:bg-red-50 [&:has(:checked)]:border-red-200">
                  <RadioGroupItem value={r.id} id={r.id} />
                  <Label htmlFor={r.id} className="cursor-pointer flex-1 font-normal">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Ek Açıklama (İsteğe bağlı)</Label>
            <Textarea 
              id="details" 
              placeholder="Lütfen durumu detaylandırın..." 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Gönderiliyor..." : "Şikayeti Gönder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
