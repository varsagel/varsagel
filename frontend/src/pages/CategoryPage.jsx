import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { categories, mockListings, cities, years, carBrands, filterOptions } from '../data/mockData';
import { MapPin, Calendar, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

const CategoryPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Filtre state'leri
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedFuel, setSelectedFuel] = useState([]);
  const [selectedGear, setSelectedGear] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');

  const currentCategory = categories.find(cat => cat.slug === category);
  const subCategorySlug = searchParams.get('sub');

  // Filtrelenmiş ilanlar
  const filteredListings = useMemo(() => {
    let filtered = mockListings.filter(listing => listing.category === category);

    if (subCategorySlug) {
      filtered = filtered.filter(listing => listing.subCategory === subCategorySlug);
    }

    if (selectedCity) {
      filtered = filtered.filter(listing => listing.location.includes(selectedCity));
    }

    if (selectedBrand) {
      filtered = filtered.filter(listing => listing.brand === selectedBrand);
    }

    if (selectedModel) {
      filtered = filtered.filter(listing => listing.model === selectedModel);
    }

    if (selectedYear) {
      filtered = filtered.filter(listing => listing.year === parseInt(selectedYear));
    }

    if (priceMin) {
      filtered = filtered.filter(listing => parseInt(listing.price) >= parseInt(priceMin));
    }

    if (priceMax) {
      filtered = filtered.filter(listing => parseInt(listing.price) <= parseInt(priceMax));
    }

    if (selectedFuel.length > 0) {
      filtered = filtered.filter(listing => selectedFuel.includes(listing.fuel));
    }

    if (selectedGear.length > 0) {
      filtered = filtered.filter(listing => selectedGear.includes(listing.gear));
    }

    // Sıralama
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
        break;
      case 'date-desc':
      default:
        // Varsayılan sıralama zaten date-desc
        break;
    }

    return filtered;
  }, [category, subCategorySlug, selectedCity, selectedBrand, selectedModel, selectedYear, priceMin, priceMax, selectedFuel, selectedGear, sortBy]);

  const handleFuelChange = (fuel) => {
    setSelectedFuel(prev => 
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    );
  };

  const handleGearChange = (gear) => {
    setSelectedGear(prev => 
      prev.includes(gear) ? prev.filter(g => g !== gear) : [...prev, gear]
    );
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setPriceMin('');
    setPriceMax('');
    setSelectedFuel([]);
    setSelectedGear([]);
  };

  const availableModels = selectedBrand
    ? carBrands.find(b => b.name === selectedBrand)?.models || []
    : [];

  const isVasitaCategory = category === 'vasita';

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Şehir */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Şehir</Label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Şehir seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Tüm Şehirler</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fiyat Aralığı */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Fiyat Aralığı</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
      </div>

      {/* Vasıta özel filtreler */}
      {isVasitaCategory && (
        <>
          {/* Marka */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Marka</Label>
            <Select value={selectedBrand} onValueChange={(value) => {
              setSelectedBrand(value);
              setSelectedModel(''); // Model seçimini sıfırla
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Marka seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tüm Markalar</SelectItem>
                {carBrands.map(brand => (
                  <SelectItem key={brand.name} value={brand.name}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          {selectedBrand && availableModels.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Model seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tüm Modeller</SelectItem>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Yıl */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Yıl</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Yıl seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tüm Yıllar</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Yakıt Tipi */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Yakıt Tipi</Label>
            <div className="space-y-2">
              {filterOptions.vasita.fuel.map(fuel => (
                <div key={fuel} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fuel-${fuel}`}
                    checked={selectedFuel.includes(fuel)}
                    onCheckedChange={() => handleFuelChange(fuel)}
                  />
                  <Label htmlFor={`fuel-${fuel}`} className="text-sm font-normal cursor-pointer">
                    {fuel}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Vites Tipi */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Vites Tipi</Label>
            <div className="space-y-2">
              {filterOptions.vasita.gear.map(gear => (
                <div key={gear} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gear-${gear}`}
                    checked={selectedGear.includes(gear)}
                    onCheckedChange={() => handleGearChange(gear)}
                  />
                  <Label htmlFor={`gear-${gear}`} className="text-sm font-normal cursor-pointer">
                    {gear}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filtreleri Temizle */}
      <Button
        variant="outline"
        className="w-full"
        onClick={clearFilters}
      >
        <X className="w-4 h-4 mr-2" />
        Filtreleri Temizle
      </Button>
    </div>
  );

  if (!currentCategory) {
    return <div>Kategori bulunamadı</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{currentCategory.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentCategory.name} İlanları
          </h1>
          <Button
            className="md:hidden"
            variant="outline"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtreler
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
                <FilterPanel />
              </CardContent>
            </Card>
          </div>

          {/* Mobile Filter */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Filtreler</h2>
                    <button onClick={() => setMobileFilterOpen(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <FilterPanel />
                </div>
              </div>
            </div>
          )}

          {/* Listings */}
          <div className="lg:col-span-3">
            {/* Sort and Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredListings.length}</span> ilan bulundu
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">En Yeni</SelectItem>
                  <SelectItem value="price-asc">En Düşük Fiyat</SelectItem>
                  <SelectItem value="price-desc">En Yüksek Fiyat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">Seçilen filtrelere uygun ilan bulunamadı.</p>
                  <Button className="mt-4" onClick={clearFilters}>Filtreleri Temizle</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <Link key={listing.id} to={`/${listing.category}/${listing.id}`}>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Image */}
                          <div className="md:col-span-1 relative aspect-[4/3] md:aspect-auto overflow-hidden">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {listing.featured && (
                              <Badge className="absolute top-3 right-3 bg-yellow-500 text-gray-900 border-0">
                                Öne Çıkan
                              </Badge>
                            )}
                          </div>

                          {/* Content */}
                          <div className="md:col-span-3 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {listing.title}
                              </h3>
                              <div className="text-2xl font-bold text-blue-600">
                                {parseInt(listing.price).toLocaleString('tr-TR')} {listing.currency}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap gap-4 mb-3">
                              {listing.year && (
                                <span className="text-sm text-gray-600">
                                  <strong>Yıl:</strong> {listing.year}
                                </span>
                              )}
                              {listing.km && (
                                <span className="text-sm text-gray-600">
                                  <strong>Km:</strong> {parseInt(listing.km).toLocaleString('tr-TR')}
                                </span>
                              )}
                              {listing.fuel && (
                                <span className="text-sm text-gray-600">
                                  <strong>Yakıt:</strong> {listing.fuel}
                                </span>
                              )}
                              {listing.gear && (
                                <span className="text-sm text-gray-600">
                                  <strong>Vites:</strong> {listing.gear}
                                </span>
                              )}
                              {listing.rooms && (
                                <span className="text-sm text-gray-600">
                                  <strong>Oda:</strong> {listing.rooms}
                                </span>
                              )}
                              {listing.area && (
                                <span className="text-sm text-gray-600">
                                  <strong>m²:</strong> {listing.area}
                                </span>
                              )}
                            </div>

                            {/* Location and Date */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {listing.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {listing.date}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;