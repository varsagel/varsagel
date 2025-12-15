'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function IletisimPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    toast({
      title: "Mesajınız Gönderildi",
      description: "En kısa sürede size geri dönüş yapacağız.",
      variant: "success",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-cyan-600 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">İletişim</h1>
          <p className="text-cyan-100 text-lg max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya iş birlikleri için bizimle iletişime geçin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600 mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600 mb-4">Hafta içi 09:00 - 18:00</p>
              <a href="tel:+908501234567" className="text-cyan-600 font-medium hover:underline">
                +90 (850) 123 45 67
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
              <p className="text-gray-600 mb-4">7/24 Bize yazabilirsiniz</p>
              <a href="mailto:info@varsagel.com" className="text-cyan-600 font-medium hover:underline">
                info@varsagel.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ofis</h3>
              <p className="text-gray-600 mb-4">
                Maslak Mah. Büyükdere Cad. <br />
                No: 123 Sarıyer / İstanbul
              </p>
              <a href="#" className="text-cyan-600 font-medium hover:underline">
                Haritada Göster
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bize Mesaj Gönderin</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Adınız Soyadınız</Label>
                    <Input id="name" placeholder="Adınız Soyadınız" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta Adresiniz</Label>
                    <Input id="email" type="email" placeholder="ornek@email.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Konu</Label>
                  <Input id="subject" placeholder="Mesajınızın konusu" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mesajınız</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Mesajınızı buraya yazın..." 
                    className="min-h-[150px]" 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                  {loading ? (
                    "Gönderiliyor..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Mesajı Gönder
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

