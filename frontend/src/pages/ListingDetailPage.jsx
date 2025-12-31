import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { mockListings, categories } from '../data/mockData';
import { MapPin, Calendar, Phone, Mail, Share2, Heart, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const ListingDetailPage = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const listing = mockListings.find(l => l.id === parseInt(id));
  const currentCategory = categories.find(cat => cat.slug === category);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İlan bulunamadı</h1>
          <Button onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  const relatedListings = mockListings
    .filter(l => l.category === listing.category && l.id !== listing.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <Link to={`/${category}`} className="hover:text-blue-600">
              {currentCategory?.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">İlan Detayı</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.featured && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-gray-900 border-0 text-base px-4 py-2">
                      Öne Çıkan İlan
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Title and Price */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {parseInt(listing.price).toLocaleString('tr-TR')} {listing.currency}
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{listing.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">İlan Detayları</h2>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {listing.brand && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Marka</div>
                      <div className="font-semibold text-gray-900">{listing.brand}</div>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Model</div>
                      <div className="font-semibold text-gray-900">{listing.model}</div>
                    </div>
                  )}
                  {listing.year && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Yıl</div>
                      <div className="font-semibold text-gray-900">{listing.year}</div>
                    </div>
                  )}
                  {listing.km && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Kilometre</div>
                      <div className="font-semibold text-gray-900">
                        {parseInt(listing.km).toLocaleString('tr-TR')} km
                      </div>
                    </div>
                  )}
                  {listing.fuel && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Yakıt Tipi</div>
                      <div className="font-semibold text-gray-900">{listing.fuel}</div>
                    </div>
                  )}
                  {listing.gear && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Vites Tipi</div>
                      <div className="font-semibold text-gray-900">{listing.gear}</div>
                    </div>
                  )}
                  {listing.rooms && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Oda Sayısı</div>
                      <div className="font-semibold text-gray-900">{listing.rooms}</div>
                    </div>
                  )}
                  {listing.area && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Alan (m²)</div>
                      <div className="font-semibold text-gray-900">{listing.area} m²</div>
                    </div>
                  )}
                  {listing.floor && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Bulunduğu Kat</div>
                      <div className="font-semibold text-gray-900">{listing.floor}. Kat</div>
                    </div>
                  )}
                  {listing.buildingAge && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Bina Yaşı</div>
                      <div className="font-semibold text-gray-900">{listing.buildingAge} Yıl</div>
                    </div>
                  )}
                  {listing.condition && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Durum</div>
                      <div className="font-semibold text-gray-900">{listing.condition}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Açıklama</h2>
                <Separator className="mb-4" />
                <p className="text-gray-700 leading-relaxed">
                  Bu ilan sahibinden.com benzeri bir platformda yayınlanmış örnek bir ilandır. 
                  Gerçek bir alışveriş platformunda daha detaylı açıklama, çoklu fotoğraflar ve 
                  satıcı bilgileri yer alacaktır. Bu demo platform tüm kategori yapılarını, 
                  filtre sistemlerini ve dinamik içerik yönetimini göstermek için oluşturulmuştur.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Seller Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Sahibi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        AS
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Ahmet Yıldız</div>
                        <div className="text-sm text-gray-500">Üye</div>
                      </div>
                    </div>
                    <Separator />
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Telefonu Göster
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Mesaj Gönder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Güvenli Alışveriş İpuçları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      Ürünü görmeden ödeme yapmayın
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      Karşılaşmaları güvenli yerlerde yapın
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      Şüpheli ilanları bildirin
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      Kişisel bilgilerinizi paylaşmayın
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer İlanlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((relatedListing) => (
                <Link
                  key={relatedListing.id}
                  to={`/${relatedListing.category}/${relatedListing.id}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={relatedListing.image}
                        alt={relatedListing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedListing.title}
                      </h3>
                      <div className="text-xl font-bold text-blue-600 mb-2">
                        {parseInt(relatedListing.price).toLocaleString('tr-TR')} {relatedListing.currency}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {relatedListing.location}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetailPage;