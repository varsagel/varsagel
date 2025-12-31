// Mock Data - Türkiye'ye özel gerçek veriler

export const categories = [
  {
    id: 1,
    name: 'Emlak',
    icon: 'Home',
    slug: 'emlak',
    subCategories: [
      { id: 11, name: 'Konut', slug: 'konut', items: ['Satılık Daire', 'Kiralık Daire', 'Satılık Müstakil', 'Kiralık Müstakil', 'Satılık Villa', 'Kiralık Villa'] },
      { id: 12, name: 'İşyeri', slug: 'isyeri', items: ['Satılık Ofis', 'Kiralık Ofis', 'Satılık Dükkan', 'Kiralık Dükkan'] },
      { id: 13, name: 'Arsa', slug: 'arsa', items: ['Satılık Arsa', 'Satılık Tarla'] },
      { id: 14, name: 'Bina', slug: 'bina', items: ['Satılık Bina', 'Kiralık Bina'] },
      { id: 15, name: 'Turistik Tesis', slug: 'turistik', items: ['Satılık Otel', 'Kiralık Apart'] }
    ]
  },
  {
    id: 2,
    name: 'Vasıta',
    icon: 'Car',
    slug: 'vasita',
    subCategories: [
      { id: 21, name: 'Otomobil', slug: 'otomobil', items: ['Sedan', 'Hatchback', 'Station Wagon'] },
      { id: 22, name: 'Arazi, SUV & Pickup', slug: 'arazi-suv-pickup', items: ['Arazi', 'SUV', 'Pickup'] },
      { id: 23, name: 'Motosiklet', slug: 'motosiklet', items: ['Cruiser', 'Chopper', 'Scooter', 'Naked', 'Touring'] },
      { id: 24, name: 'Minivan & Panelvan', slug: 'minivan-panelvan', items: ['Minivan', 'Panelvan'] },
      { id: 25, name: 'Ticari Araçlar', slug: 'ticari-araclar', items: ['Kamyon', 'Kamyonet', 'Minibüs', 'Otobüs'] }
    ]
  },
  {
    id: 3,
    name: 'Yedek Parça & Aksesuar',
    icon: 'Wrench',
    slug: 'yedek-parca',
    subCategories: [
      { id: 31, name: 'Otomobil Yedek Parça', slug: 'otomobil-yedek', items: ['Motor', 'Şanzıman', 'Fren', 'Egzoz'] },
      { id: 32, name: 'Motosiklet Yedek Parça', slug: 'motor-yedek', items: ['Motor Parçaları', 'Elektrik'] },
      { id: 33, name: 'Aksesuar', slug: 'aksesuar', items: ['Lastiği', 'Jant', 'Oto Ses'] }
    ]
  },
  {
    id: 4,
    name: 'İkinci El ve Sıfır Alışveriş',
    icon: 'ShoppingBag',
    slug: 'ikinci-el',
    subCategories: [
      { id: 41, name: 'Cep Telefonu', slug: 'telefon', items: ['Apple iPhone', 'Samsung', 'Xiaomi', 'Huawei'] },
      { id: 42, name: 'Bilgisayar', slug: 'bilgisayar', items: ['Dizüstü', 'Masaüstü', 'Tablet'] },
      { id: 43, name: 'Ev Elektroniği', slug: 'ev-elektronik', items: ['Televizyon', 'Ses Sistemleri'] },
      { id: 44, name: 'Beyaz Eşya', slug: 'beyaz-esya', items: ['Buzdolabı', 'Çamaşır Makinesi', 'Bulaşık Makinesi'] },
      { id: 45, name: 'Giyim & Aksesuar', slug: 'giyim', items: ['Erkek Giyim', 'Kadın Giyim', 'Çocuk Giyim'] },
      { id: 46, name: 'Ev & Bahçe', slug: 'ev-bahce', items: ['Mobilya', 'Dekorasyon', 'Bahçe'] }
    ]
  },
  {
    id: 5,
    name: 'Emlak Dışı',
    icon: 'Construction',
    slug: 'emlak-disi',
    subCategories: [
      { id: 51, name: 'İş Makineleri & Sanayi', slug: 'is-makine', items: ['İş Makinesi', 'Forklift', 'Jeneratör'] },
      { id: 52, name: 'Tarım Makineleri', slug: 'tarim', items: ['Traktör', 'Biçer Döver', 'Römork'] },
      { id: 53, name: 'Üretim Makineleri', slug: 'uretim', items: ['CNC', 'Torna', 'Testere'] }
    ]
  },
  {
    id: 6,
    name: 'Hayvanlar Alemi',
    icon: 'PawPrint',
    slug: 'hayvanlar',
    subCategories: [
      { id: 61, name: 'Kedi', slug: 'kedi', items: ['British Shorthair', 'Scottish Fold', 'Tekir'] },
      { id: 62, name: 'Köpek', slug: 'kopek', items: ['Golden Retriever', 'Labrador', 'Husky'] },
      { id: 63, name: 'Kuş', slug: 'kus', items: ['Muhabbet Kuşu', 'Kanarya'] },
      { id: 64, name: 'Büyükbaş Hayvan', slug: 'buyukbas', items: ['İnek', 'Dana'] },
      { id: 65, name: 'Küçükbaş Hayvan', slug: 'kucukbas', items: ['Koyun', 'Keçi'] }
    ]
  },
  {
    id: 7,
    name: 'Alet & Yapı Market',
    icon: 'HardHat',
    slug: 'yapi-market',
    subCategories: [
      { id: 71, name: 'El Aletleri', slug: 'el-alet', items: ['Matkap', 'Testere', 'Tamir Seti'] },
      { id: 72, name: 'Elektrikli El Aletleri', slug: 'elektrikli-alet', items: ['Darbeli Matkap', 'Taşlama', 'Zımpara'] },
      { id: 73, name: 'Bahçe Makineleri', slug: 'bahce-makine', items: ['Çim Biçme', 'Budama'] },
      { id: 74, name: 'Yapı Malzemeleri', slug: 'yapi-malzeme', items: ['Çimento', 'Kireç', 'Boya'] }
    ]
  }
];

// Türkiye'ye özel gerçek araç markaları ve modelleri
export const carBrands = [
  {
    name: 'Fiat',
    models: ['Egea', 'Egea Cross', 'Panda', 'Tipo', '500', 'Doblo', 'Fiorino']
  },
  {
    name: 'Renault',
    models: ['Clio', 'Megane', 'Taliant', 'Austral', 'Captur', 'Kadjar', 'Koleos']
  },
  {
    name: 'Toyota',
    models: ['Corolla', 'C-HR', 'RAV4', 'Yaris', 'Camry', 'Land Cruiser', 'Hilux']
  },
  {
    name: 'Hyundai',
    models: ['i10', 'i20', 'Bayon', 'Tucson', 'Kona', 'Santa Fe', 'Elantra']
  },
  {
    name: 'Volkswagen',
    models: ['Polo', 'Golf', 'Passat', 'T-Roc', 'Tiguan', 'Touareg', 'Transporter']
  },
  {
    name: 'Ford',
    models: ['Fiesta', 'Focus', 'Mondeo', 'Puma', 'Kuga', 'Transit', 'Ranger']
  },
  {
    name: 'Peugeot',
    models: ['208', '301', '308', '2008', '3008', '5008', 'Rifter']
  },
  {
    name: 'Opel',
    models: ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka', 'Combo']
  },
  {
    name: 'Citroën',
    models: ['C3', 'C4', 'C5 Aircross', 'Berlingo']
  },
  {
    name: 'BMW',
    models: ['1 Serisi', '2 Serisi', '3 Serisi', '5 Serisi', 'X1', 'X3', 'X5']
  },
  {
    name: 'Mercedes-Benz',
    models: ['A Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'GLA', 'GLC', 'GLE']
  },
  {
    name: 'Audi',
    models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7']
  },
  {
    name: 'Nissan',
    models: ['Micra', 'Qashqai', 'X-Trail', 'Juke']
  },
  {
    name: 'Dacia',
    models: ['Sandero', 'Duster', 'Jogger', 'Spring']
  },
  {
    name: 'Skoda',
    models: ['Fabia', 'Octavia', 'Superb', 'Kodiaq', 'Karoq']
  },
  {
    name: 'Seat',
    models: ['Ibiza', 'Leon', 'Arona', 'Ateca']
  },
  {
    name: 'Honda',
    models: ['Civic', 'HR-V', 'CR-V', 'Jazz']
  },
  {
    name: 'Kia',
    models: ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento']
  },
  {
    name: 'Mazda',
    models: ['2', '3', '6', 'CX-3', 'CX-5', 'CX-30']
  },
  {
    name: 'TOGG',
    models: ['T10X']
  },
  {
    name: 'Tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X']
  },
  {
    name: 'BYD',
    models: ['Seal', 'Seal U', 'Atto 3']
  }
];

export const cities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan',
  'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis',
  'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce',
  'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane',
  'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Karabük',
  'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van',
  'Yalova', 'Yozgat', 'Zonguldak'
];

export const years = Array.from({ length: 30 }, (_, i) => 2025 - i);

export const mockListings = [
  {
    id: 1,
    title: '2020 Fiat Egea 1.6 MultiJet Easy',
    category: 'vasita',
    subCategory: 'otomobil',
    price: '485000',
    currency: 'TL',
    location: 'İstanbul / Kadıköy',
    date: '2 saat önce',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400',
    brand: 'Fiat',
    model: 'Egea',
    year: 2020,
    km: '82000',
    fuel: 'Dizel',
    gear: 'Manuel',
    featured: true
  },
  {
    id: 2,
    title: '2021 Renault Clio 1.0 TCe Touch',
    category: 'vasita',
    subCategory: 'otomobil',
    price: '560000',
    currency: 'TL',
    location: 'Ankara / Çankaya',
    date: '5 saat önce',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    km: '45000',
    fuel: 'Benzin',
    gear: 'Manuel'
  },
  {
    id: 3,
    title: '3+1 Satılık Daire 120 m²',
    category: 'emlak',
    subCategory: 'konut',
    price: '3500000',
    currency: 'TL',
    location: 'İzmir / Bornova',
    date: '1 gün önce',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    rooms: '3+1',
    area: '120',
    floor: '5',
    buildingAge: '5',
    featured: true
  },
  {
    id: 4,
    title: '2022 Toyota Corolla 1.6 Executive',
    category: 'vasita',
    subCategory: 'otomobil',
    price: '895000',
    currency: 'TL',
    location: 'Bursa / Nilüfer',
    date: '3 gün önce',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    km: '28000',
    fuel: 'Hybrid',
    gear: 'Otomatik'
  },
  {
    id: 5,
    title: 'iPhone 14 Pro 256GB',
    category: 'ikinci-el',
    subCategory: 'telefon',
    price: '42000',
    currency: 'TL',
    location: 'İstanbul / Beşiktaş',
    date: '1 saat önce',
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400',
    condition: 'Sıfır Gibi'
  },
  {
    id: 6,
    title: '2023 Hyundai Bayon 1.0 T-GDI',
    category: 'vasita',
    subCategory: 'arazi-suv-pickup',
    price: '780000',
    currency: 'TL',
    location: 'Antalya / Muratpaşa',
    date: '2 gün önce',
    image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400',
    brand: 'Hyundai',
    model: 'Bayon',
    year: 2023,
    km: '15000',
    fuel: 'Benzin',
    gear: 'Otomatik',
    featured: true
  },
  {
    id: 7,
    title: '2+1 Kiralık Daire 90 m²',
    category: 'emlak',
    subCategory: 'konut',
    price: '25000',
    currency: 'TL',
    location: 'Ankara / Kızılay',
    date: '4 saat önce',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    rooms: '2+1',
    area: '90',
    floor: '3',
    buildingAge: '10'
  },
  {
    id: 8,
    title: '2024 TOGG T10X Standard',
    category: 'vasita',
    subCategory: 'arazi-suv-pickup',
    price: '1450000',
    currency: 'TL',
    location: 'İstanbul / Şişli',
    date: '6 saat önce',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    brand: 'TOGG',
    model: 'T10X',
    year: 2024,
    km: '5000',
    fuel: 'Elektrik',
    gear: 'Otomatik',
    featured: true
  }
];

// Filtre seçenekleri
export const filterOptions = {
  vasita: {
    fuel: ['Benzin', 'Dizel', 'Hybrid', 'Elektrik', 'LPG'],
    gear: ['Manuel', 'Yarı Otomatik', 'Otomatik'],
    bodyType: ['Sedan', 'Hatchback', 'Station Wagon', 'Coupe', 'Cabrio'],
    color: ['Beyaz', 'Siyah', 'Gri', 'Kırmızı', 'Mavi', 'Yeşil', 'Turuncu', 'Sarı', 'Kahverengi']
  },
  emlak: {
    rooms: ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1 ve üzeri'],
    buildingAge: ['0', '1-5', '6-10', '11-15', '16-20', '21 ve üzeri'],
    heating: ['Doğalgaz', 'Kombi', 'Merkezi', 'Klima', 'Soba', 'Jeotermal']
  }
};