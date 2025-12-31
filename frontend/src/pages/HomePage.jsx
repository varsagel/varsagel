import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { categories, mockListings } from '../data/mockData';
import { ChevronRight, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const HomePage = () => {
  const featuredListings = mockListings.filter(l => l.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Türkiye'nin En Büyük İlan Sitesi
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Emlak, vasıta, ikinci el, yedek parça ve daha fazlası
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Kategoriler</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/${category.slug}`}
              className="group"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-blue-400">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-2xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.subCategories.length} alt kategori
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Öne Çıkan İlanlar</h2>
            <Link
              to="/vasita"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/${listing.category}/${listing.id}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-gray-900 border-0">
                      Öne Çıkan
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 mb-3">
                      {parseInt(listing.price).toLocaleString('tr-TR')} {listing.currency}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {listing.date}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">sahibinden.com</h3>
              <p className="text-gray-400">
                Türkiye'nin en büyük ilan ve alışveriş platformu
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kategoriler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emlak</li>
                <li>Vasıta</li>
                <li>Yedek Parça</li>
                <li>İkinci El</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kurumsal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hakkımızda</li>
                <li>İletişim</li>
                <li>Gizlilik</li>
                <li>Kullanım Koşulları</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yardım</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Güvenli Alışveriş</li>
                <li>Sıkça Sorulan Sorular</li>
                <li>Nasıl İlan Verilir?</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 sahibinden.com - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;