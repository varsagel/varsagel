import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { User, Clock, MessageSquare, Check, X, AlertCircle, ArrowLeft, MapPin, FileText, Tag } from 'lucide-react';
import OfferActions from './OfferActions';
import OfferImages from './OfferImages';
import SafetyTips from '@/components/talep/SafetyTips';

export default async function OfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return redirect('/giris');

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          owner: true,
          category: true,
          subCategory: true,
        }
      },
      seller: true,
    }
  });

  if (!offer) return notFound();

  const isOwner = session.user.id === offer.listing.ownerId;
  const isMaker = session.user.id === offer.sellerId;

  if (!isOwner && !isMaker) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Yetkisiz Erişim</h1>
            <p className="text-gray-600 mb-6">Bu teklifi görüntüleme yetkiniz bulunmamaktadır.</p>
            <Link href="/" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
              Ana Sayfaya Dön
            </Link>
         </div>
       </div>
     );
  }

  const images = (offer as any).imagesJson ? JSON.parse((offer as any).imagesJson) : [];
  const attributes = (offer as any).attributesJson ? JSON.parse((offer as any).attributesJson) : {};

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profil" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Teklif Detayı</h1>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            offer.status === 'ACCEPTED' ? 'bg-lime-100 text-lime-700' :
            offer.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {offer.status === 'ACCEPTED' ? 'Kabul Edildi' :
             offer.status === 'REJECTED' ? 'Reddedildi' :
             'Beklemede'}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Listing Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Talep</p>
              <Link href={`/talep/${offer.listing.id}`} className="text-lg font-bold text-gray-900 hover:text-cyan-600 transition-colors line-clamp-1">
                {offer.listing.title}
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{offer.listing.city}, {offer.listing.district}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-gray-500 mb-1">Talep Bütçesi</p>
              <p className="text-lg font-bold text-gray-900">{Number(offer.listing.budget).toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            Teklif İçeriği
          </h2>

          <div className="space-y-6">
            {/* Price & Message */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                <div className="flex items-center gap-2 text-cyan-800 font-medium mb-1">
                  <Tag className="w-4 h-4" />
                  Teklif Tutarı
                </div>
                <div className="text-2xl font-bold text-cyan-600">
                  {Number(offer.price).toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                  <User className="w-4 h-4" />
                  Teklif Veren
                </div>
                <div className="font-medium text-gray-900">
                  {offer.seller.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: tr })}
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Mesaj</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-700 border border-gray-100">
                {offer.body}
              </div>
            </div>

            {/* Rejection Reason */}
            {offer.status === 'REJECTED' && (offer as any).rejectionReason && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h3 className="text-sm font-medium text-red-800 mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Ret Sebebi
                </h3>
                <p className="text-red-700">{(offer as any).rejectionReason}</p>
              </div>
            )}

            {/* Attributes */}
            {Object.keys(attributes).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Ek Özellikler</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(attributes).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="block text-xs text-gray-400 uppercase mb-1">{key}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            <OfferImages images={images} />
          </div>

          {/* Actions */}
          {isOwner && offer.status === 'PENDING' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <OfferActions offerId={offer.id} />
            </div>
          )}
          
          {/* Messaging Link (if accepted) */}
          {offer.status === 'ACCEPTED' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
               <Link href={`/mesajlar/${offer.listingId}`} className="block w-full bg-cyan-600 text-white text-center py-3 rounded-xl font-bold hover:bg-cyan-700 transition-colors shadow-cyan-200 hover:shadow-lg">
                 Mesajlara Git
               </Link>
            </div>
          )}
        </div>

        <SafetyTips listingId={offer.listing.id} listingTitle={offer.listing.title} />
      </div>
    </div>
  );
}
