import { auth } from '@/auth';
import TalepCard from '@/components/home/TalepCard';
import FavoriteButton from '@/components/talep/FavoriteButton';
import QuestionsSection from '@/components/talep/QuestionsSection';
import ShareListing from '@/components/talep/ShareListing';
import ListingActionButtons from '@/components/talep/ListingActionButtons';
import SafetyTips from '@/components/talep/SafetyTips';
import { prisma } from '@/lib/prisma';
import { getListings } from '@/lib/services/listingService';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, Calendar, CheckCircle2, Eye, MapPin, ShieldCheck, User, Edit, Trash2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Metadata generation
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { category: true, subCategory: true }
  });

  if (!listing) {
    return {
      title: 'Talep Bulunamadı | Varsagel',
    };
  }

  return {
    title: `${listing.title} | Varsagel`,
    description: listing.description.substring(0, 160),
    openGraph: {
      images: listing.imagesJson ? JSON.parse(listing.imagesJson)[0] : undefined
    }
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  // Increment view count
  await prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  });

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          _count: {
            select: { listings: true }
          }
        }
      },
      category: true,
      subCategory: true,
      _count: {
        select: { offers: true }
      }
    }
  });

  if (!listing) return notFound();

  const isOwner = session?.user?.email === listing.owner.email;
  const images = listing.imagesJson ? JSON.parse(listing.imagesJson) : [];
  const attributes = listing.attributesJson ? JSON.parse(listing.attributesJson) : {};

  // Fetch similar listings
  const { data: similarListings } = await getListings({
    category: listing.category.slug,
    limit: 4,
    status: 'OPEN'
  });
  
  const filteredSimilar = similarListings.filter((l: any) => l.id !== listing.id).slice(0, 4);

  // Check if current user has an accepted offer
  let hasAcceptedOffer = false;
  if (session?.user?.email) {
    const acceptedOffer = await prisma.offer.findFirst({
      where: {
        listingId: listing.id,
        seller: {
          email: session.user.email
        },
        status: 'ACCEPTED'
      }
    });
    hasAcceptedOffer = !!acceptedOffer;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Breadcrumb & Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500 hidden sm:flex">
              <Link href="/" className="hover:text-cyan-600">Ana Sayfa</Link>
              <span>/</span>
              <Link href={`/kategori/${listing.category.slug}`} className="hover:text-cyan-600">{listing.category.name}</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{listing.title}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ShareListing id={listing.id} title={listing.title} />
            <FavoriteButton listingId={listing.id} initial={false} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery */}
            {images.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-video relative">
                  <Image
                    src={images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {images.slice(1).map((img: string, i: number) => (
                      <div key={i} className="aspect-video relative rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`${listing.title} - ${i + 2}`}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {listing.status === 'PENDING' && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  <ShieldCheck className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="font-semibold">Talep admin onayı bekliyor</p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      Bu talep yayınlanmadan önce ekibimiz tarafından kontrol ediliyor. Onaylandığında teklif verebilir ve favorilere ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-500 mb-1">Talep Bütçesi</p>
                  {(() => {
                    const minP = attributes?.minPrice ? Number(attributes.minPrice) : 0;
                    const maxPAttr = attributes?.maxPrice ? Number(attributes.maxPrice) : 0;
                    const budget = typeof listing.budget === 'bigint' ? Number(listing.budget) : Number(listing.budget || 0);

                    const hasMin = minP > 0;
                    const hasMax = maxPAttr > 0;
                    const hasBudget = budget > 0;

                    let from = 0;
                    let to = 0;

                    if (hasMin && hasMax) {
                      from = minP;
                      to = maxPAttr;
                    } else if (hasMin && hasBudget) {
                      from = minP;
                      to = budget;
                    } else if (hasMin) {
                      return (
                        <p className="text-2xl font-bold text-cyan-600">
                          {minP.toLocaleString('tr-TR')} - ∞
                        </p>
                      );
                    } else if (hasMax) {
                      from = 0;
                      to = maxPAttr;
                    } else if (hasBudget) {
                      from = 0;
                      to = budget;
                    } else {
                      return (
                        <p className="text-2xl font-bold text-gray-400">
                          Belirtilmemiş
                        </p>
                      );
                    }

                    return (
                      <p className="text-2xl font-bold text-cyan-600">
                        {from.toLocaleString('tr-TR')} - {to.toLocaleString('tr-TR')}
                      </p>
                    );
                  })()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {listing.city}, {listing.district}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: tr })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {(listing as any).viewCount} görüntülenme
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-medium">
                  {listing._count.offers} Teklif
                </div>
              </div>

              <div className="py-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Talep Açıklaması</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>

              {/* Attributes */}
              {Object.keys(attributes).length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Detaylar</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 capitalize">{key}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Questions */}
            <QuestionsSection listingId={listing.id} isOwner={isOwner} />

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                   {listing.owner.image ? (
                      <Image src={listing.owner.image} alt={listing.owner.name || ''} width={56} height={56} className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-7 h-7 text-gray-400" />
                   )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Talep Sahibi</p>
                  <p className="font-bold text-gray-900">{listing.owner.name}</p>
                  <div className="flex items-center gap-1 text-xs text-lime-600 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Onaylı Üye</span>
                  </div>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="p-4 bg-cyan-50 rounded-xl mb-4">
                    <p className="text-sm text-cyan-800 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Bu talep size ait
                    </p>
                    <p className="text-xs text-cyan-600 mt-1">
                      Gelen teklifleri profilinizden yönetebilirsiniz.
                    </p>
                  </div>
                  <Link href={`/profil?tab=taleplerim`} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-all">
                    <Edit className="w-4 h-4" />
                    Talebi Düzenle
                  </Link>
                  {/* <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                    Talebi Yayından Kaldır
                  </button> */}
                </div>
              ) : (
                <ListingActionButtons 
                  listingId={listing.id} 
                  isAuthenticated={!!session?.user} 
                  hasAcceptedOffer={hasAcceptedOffer}
                  isOpen={listing.status === 'OPEN'}
                />
              )}
            </div>

            <SafetyTips listingId={listing.id} listingTitle={listing.title} />

          </div>

        </div>

        {/* Similar Listings */}
        {filteredSimilar.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Benzer Talepler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredSimilar.map((l: any) => (
                <TalepCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
