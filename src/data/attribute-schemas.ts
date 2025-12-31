export type AttrField = {
  label: string
  key?: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'range-number' | 'multiselect'
  options?: string[]
  minKey?: string
  maxKey?: string
  required?: boolean
  minLabel?: string
  maxLabel?: string
  min?: number
  max?: number
}

export const ATTR_SCHEMAS: Record<string, AttrField[]> = {
  emlak: [
    // Temel Bilgiler
    { label: 'İlan No', key: 'ilanNo', type: 'text' },
    { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 1 gün', 'Son 7 gün', 'Son 30 gün', 'Tümü'] },
    { label: 'Oda Sayısı', key: 'odaSayisi', type: 'select', options: ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', '7+1', '8+1', '9+1', '10+ '], required: true },
    { label: 'Net m²', type: 'range-number', minKey: 'm2Min', maxKey: 'm2Max', minLabel: 'Min m²', maxLabel: 'Max m²', required: true },
    { label: 'Brüt m²', type: 'range-number', minKey: 'brutM2Min', maxKey: 'brutM2Max' },
    { label: 'Bina Yaşı', key: 'binaYasi', type: 'select', options: ['0 (Yeni)', '1-5', '6-10', '11-15', '16-20', '21-25', '26-30', '31 ve üzeri'] },
    { label: 'Kat Sayısı', key: 'katSayisi', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'] },
    { label: 'Bulunduğu Kat', key: 'bulunduguKat', type: 'select', options: ['Bodrum Kat', 'Zemin Kat', '1. Kat', '2. Kat', '3. Kat', '4. Kat', '5. Kat', '6. Kat', '7. Kat', '8. Kat', '9. Kat', '10. Kat', '11-15. Kat', '16-20. Kat', '21-25. Kat', '26-30. Kat', '31 ve üzeri'] },
    
    // Isınma & Yakıt
    { label: 'Isınma Tipi', key: 'isinmaTipi', type: 'select', options: ['Yok', 'Soba', 'Doğalgaz (Kombi)', 'Doğalgaz (Kat Kaloriferi)', 'Doğalgaz (Merkezi)', 'Merkezi (Pay Ölçer)', 'Yerden Isıtma', 'Klima', 'Fancoil Ünitesi', 'Güneş Enerjisi', 'Elektrikli Radyatör', 'Jeotermal', 'Şömine', 'VRV', 'Isı Pompası'] },
    
    // Özellikler
    { label: 'Banyo Sayısı', key: 'banyoSayisi', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { label: 'Balkon', key: 'balkon', type: 'boolean' },
    { label: 'Asansör', key: 'asansor', type: 'boolean' },
    { label: 'Otopark', key: 'otopark', type: 'select', options: ['Yok', 'Açık', 'Kapalı'] },
    { label: 'Eşyalı', key: 'esyali', type: 'boolean' },
    { label: 'Kullanım Durumu', key: 'kullanimDurumu', type: 'select', options: ['Boş', 'Dolu', 'Kiracılı', 'Mülk Sahibi'] },
    { label: 'Site İçerisinde', key: 'siteIcinde', type: 'boolean' },
    { label: 'Yapı Tipi', key: 'yapiTipi', type: 'select', options: ['Betonarme', 'Ahşap', 'Çelik', 'Briket', 'Karkas', 'Diğer'] },
    { label: 'Yapının Durumu', key:'yapininDurumu', type: 'select', options: ['Sıfır Bina', 'İkinci El', 'Yapım Aşamasında'] },
    { label: 'Cephe', key: 'cephe', type: 'select', options: ['Kuzey', 'Güney', 'Doğu', 'Batı', 'Güneydoğu', 'Güneybatı', 'Kuzeydoğu', 'Kuzeybatı'] },
    
    // Ek Özellikler
    { label: 'Aidat (₺)', type: 'range-number', minKey: 'aidatMin', maxKey: 'aidatMax' },
    { label: 'Krediye Uygun', key: 'krediyeUygun', type: 'boolean' },
    { label: 'Takas', key: 'takas', type: 'boolean' },
    { label: 'Tapu Durumu', key: 'tapuDurumu', type: 'select', options: ['Kat Mülkiyetli', 'Kat İrtifaklı', 'Arsa', 'Hisseli'] },
  ],
  vasita: [
    // Temel Bilgiler
    { label: 'Marka', key: 'marka', type: 'select', options: ['BMW','Mercedes','Audi','Volkswagen','Renault','Peugeot','Citroën','Toyota','Honda','Hyundai','Kia','Ford','Fiat','Opel','Skoda','Volvo','Nissan','Seat','Alfa Romeo','Subaru','Mazda','Mini','Land Rover','Porsche','Jaguar','Bentley','Rolls-Royce','Aston Martin','Ferrari','Lamborghini','Maserati','Dacia','Jeep','Mitsubishi','Isuzu','Tesla','BYD','Chery','MG','Geely','GWM','SsangYong','NIO','Rivian','TOGG','Cupra','Smart'], required: true },
    { label: 'Seri', key: 'seri', type: 'text' },
    { label: 'Model', key: 'model', type: 'text', required: true },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1950, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    
    // Motor & Yakıt
    { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Benzin','Dizel','LPG & Benzin','Benzin & LPG','Hibrit','Elektrik','Dizel & LPG','Dizel & Elektrik','Benzin & Elektrik','Hidrojen'], required: true },
    { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik','Yarı Otomatik','Düz Vites'], required: true },
    { label: 'Motor Gücü (HP)', type: 'range-number', minKey: 'motorGucuMin', maxKey: 'motorGucuMax' },
    { label: 'Motor Hacmi (cm³)', type: 'range-number', minKey: 'motorHacmiMin', maxKey: 'motorHacmiMax' },
    { label: 'Çekiş', key: 'cekis', type: 'select', options: ['Önden Çekiş', 'Arkadan İtiş', '4WD (Sürekli)', 'AWD (Elektronik)'] },
    
    // Dış Özellikler
    { label: 'Kasa Tipi', key: 'kasaTipi', type: 'select', options: ['Sedan','Hatchback','SUV','Coupe','Cabrio','Pick-up','Station Wagon','MPV','Minivan','Van','Panelvan'] },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Gümüş Gri','Kırmızı','Mavi','Lacivert','Yeşil','Sarı','Turuncu','Kahverengi','Bej','Bordo','Mor','Pembe','Turkuaz','Şampanya','Altın','Bronz','Füme'] },
    { label: 'Boyasız', key: 'boyasiz', type: 'boolean' },
    { label: 'Boyalı', key: 'boyali', type: 'select', options: ['Değişen Yok', 'Boyalı', 'Lokal Boyalı', 'Boyalı (Detay Belirtilmemiş)'] },
    { label: 'Değişen', key: 'degisen', type: 'select', options: ['Değişen Yok', 'Değişen Var', 'Detay Belirtilmemiş'] },
    { label: 'Tramer (Hasar) Kayıtlı', key: 'tramerKayitli', type: 'boolean' },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
    
    // İç Özellikler
    { label: 'Koltuk Sayısı', key: 'koltukSayisi', type: 'select', options: ['2', '4', '5', '6', '7', '8', '9+'] },
    { label: 'Klima', key: 'klima', type: 'select', options: ['Yok', 'Manuel', 'Otomatik', 'Çift Bölge'] },
    { label: 'Donanım Paketi', key: 'donanimPaketi', type: 'text' },
    
    // Garanti & Durum
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
    { label: 'Garanti Tipi', key: 'garantiTipi', type: 'select', options: ['Yok', 'Bayi Garantili', 'Fabrika Garantili', 'İkinci El Garantili'] },
    { label: 'Kimden', key: 'kimden', type: 'select', options: ['Sahibinden', 'Galeriden', 'Yetkili Bayiden'] },
    { label: 'Plaka / Uyruk', key: 'plakaUyruk', type: 'select', options: ['TR', 'Yabancı Plakalı'] },
    { label: 'Takas', key: 'takas', type: 'boolean' },
    { label: 'Kredi', key: 'kredi', type: 'boolean' },
  ],
  'yedek-parca-aksesuar-donanim-tuning': [
    { label: 'Parça Türü', key: 'parcaTuru', type: 'text', required: true },
    { label: 'Uyumlu Araç', key: 'uyumluArac', type: 'text' },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'], required: true },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Bosch','Valeo','NGK','Brembo','MANN','Michelin','Pirelli','Continental','Diğer'] },
    { label: 'Orijinal', key: 'orijinal', type: 'boolean' },
  ],
  alisveris: [
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır', 'İkinci El', 'Yenilenmiş', 'Sıfır Ayarında', 'Az Kullanılmış'], required: true },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'LG', 'Sony', 'Bosch', 'Arçelik', 'Vestel', 'Philips', 'Beko', 'Siemens', 'Grundig', 'Canon', 'Nikon', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Diğer'] },
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
    { label: 'Garanti Süresi (Ay)', key: 'garantiSuresi', type: 'number' },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz', 'Siyah', 'Gri', 'Gümüş', 'Altın', 'Rose Gold', 'Mavi', 'Kırmızı', 'Yeşil', 'Sarı', 'Turuncu', 'Kahverengi', 'Mor', 'Pembe', 'Lacivert', 'Turkuaz', 'Diğer'] },
    { label: 'Takas', key: 'takas', type: 'boolean' },
    { label: 'Fatura', key: 'fatura', type: 'select', options: ['Var', 'Yok'] },
    { label: 'Kimden', key: 'kimden', type: 'select', options: ['Sahib inden', 'Firmalansan'] },
  ],
  'is-makineleri-sanayi': [
    { label: 'Makine Türü', key: 'makineTuru', type: 'text', required: true },
    { label: 'Çalışma Saati', type: 'range-number', minKey: 'saatMin', maxKey: 'saatMax' },
    { label: 'Güç/Kapasite', key: 'gucKapasite', type: 'text' },
    { label: 'Yıl', key: 'yil', type: 'number', min: 1980, max: 2026 },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'], required: true },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Caterpillar','Komatsu','Hitachi','Volvo','Doosan','JCB','Liebherr','Hyundai','Diğer'] },
  ],
  'is-ilanlari': [
    { label: 'Çalışma Şekli', key: 'calismaSekli', type: 'select', options: ['Tam Zamanlı','Yarı Zamanlı','Uzaktan','Staj','Freelance'], required: true },
    { label: 'Deneyim (Yıl)', type: 'range-number', minKey: 'deneyimMin', maxKey: 'deneyimMax' },
    { label: 'Maaş Beklentisi', type: 'range-number', minKey: 'maasMin', maxKey: 'maasMax' },
    { label: 'Sektör', key: 'sektor', type: 'text' },
    { label: 'Seviye', key: 'seviye', type: 'select', options: ['Junior','Mid','Senior','Lead','Manager'] },
    { label: 'Yan Haklar', key: 'yanHaklar', type: 'multiselect', options: ['Yemek','Servis','Özel Sağlık','Prim','Esnek Saatler'] },
    { label: 'Eğitim Durumu', key: 'egitimDurumu', type: 'select', options: ['Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora'] },
  ],
  'hayvanlar-alemi': [
    { label: 'Tür', key: 'tur', type: 'text', required: true },
    { label: 'Yaş', type: 'range-number', minKey: 'yasMin', maxKey: 'yasMax' },
    { label: 'Cinsiyet', key: 'cinsiyet', type: 'select', options: ['Erkek','Dişi'] },
    { label: 'Aşılı', key: 'asili', type: 'boolean' },
    { label: 'Irk', key: 'irk', type: 'text' },
    { label: 'Sağlık Raporu', key: 'saglikRaporu', type: 'boolean' },
    { label: 'Kısır', key: 'kisir', type: 'boolean' },
    { label: 'Kimlik/Çip', key: 'kimlikCip', type: 'boolean' },
  ],
  'ustalar-hizmetler': [
    { label: 'Hizmet Türü', key: 'hizmetTuru', type: 'text', required: true },
    { label: 'Hizmet Bölgesi', key: 'hizmetBolgesi', type: 'text' },
    { label: 'Tecrübe (Yıl)', key: 'tecrube', type: 'number' },
    { label: 'Garanti Veriyor mu?', key: 'garanti', type: 'boolean' },
    { label: '7/24 Hizmet', key: '724Hizmet', type: 'boolean' },
  ],
  'ozel-ders-arayanlar': [
    { label: 'Ders Alanı', key: 'dersAlani', type: 'text', required: true },
    { label: 'Ders Yeri', key: 'dersYeri', type: 'multiselect', options: ['Öğrenci Evi','Öğretmen Evi','Online','Etüt Merkezi'] },
    { label: 'Birebir/Grup', key: 'birebirGrup', type: 'select', options: ['Birebir','Grup'] },
    { label: 'Saat Ücreti', type: 'range-number', minKey: 'ucretMin', maxKey: 'ucretMax' },
    { label: 'Eğitim Seviyesi', key: 'egitimSeviyesi', type: 'select', options: ['İlkokul','Ortaokul','Lise','Üniversite','Yetişkin'] },
    { label: 'Cinsiyet', key: 'cinsiyet', type: 'select', options: ['Kadın','Erkek','Farketmez'] },
  ],
  'yardimci-arayanlar': [
    { label: 'Yardımcı Türü', key: 'yardimciTuru', type: 'text', required: true },
    { label: 'Çalışma Şekli', key: 'calismaSekli', type: 'select', options: ['Yatılı','Gündüzlü','Yarı Zamanlı'] },
    { label: 'Uyruk', key: 'uyruk', type: 'select', options: ['Türk','Yabancı','Farketmez'] },
    { label: 'Tecrübe (Yıl)', key: 'tecrube', type: 'number' },
    { label: 'Referanslı', key: 'referansli', type: 'boolean' },
    { label: 'Sigara Kullanımı', key: 'sigara', type: 'select', options: ['Kullanmıyor','Kullanıyor','Farketmez'] },
  ],
  elektronik: [
    { label: 'Marka', key: 'marka', type: 'select', options: ['Apple','Samsung','Xiaomi','Huawei','Sony','LG','Asus','HP','Dell','Lenovo','Diğer'], required: true },
    { label: 'Model', key: 'model', type: 'text', required: true },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El','Yenilenmiş'] },
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
    { label: 'Depolama (GB)', key: 'depolama', type: 'number' },
    { label: 'RAM (GB)', key: 'ram', type: 'number' },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Gümüş','Altın','Rose Gold','Mavi','Kırmızı','Yeşil','Mor','Sarı','Mercan','Gece Yeşili','Pasifik Mavisi','Sierra Mavisi','Derin Mor','Siyah Titanyum','Beyaz Titanyum','Mavi Titanyum','Naturel Titanyum','Diğer'] },
  ],
  'ev-bahce': [
    { label: 'Malzeme', key: 'malzeme', type: 'text' },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Kahverengi','Bej','Krem','Mavi','Yeşil','Sarı','Turuncu','Kırmızı','Mor','Pembe','Çok Renkli','Ahşap'] },
    { label: 'Ölçü', key: 'olcu', type: 'text' },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'] },
    { label: 'Marka', key: 'marka', type: 'select', options: ['IKEA','Koçtaş','Bauhaus','Fiskars','Bosch','Black+Decker','Diğer'] },
  ],
  moda: [
    { label: 'Beden', key: 'beden', type: 'select', options: ['XS','S','M','L','XL','XXL','3XL','Standart'] },
    { label: 'Renk', key: 'renk', type: 'text' },
    { label: 'Cinsiyet', key: 'cinsiyet', type: 'select', options: ['Kadın','Erkek','Unisex','Çocuk'] },
    { label: 'Sezon', key: 'sezon', type: 'select', options: ['Yaz','Kış','İlkbahar','Sonbahar','4 Mevsim'] },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Nike','Adidas','Puma','LC Waikiki','Zara','H&M','Mavi','Diğer'] },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'] },
  ],
  spor: [
  { label: 'Ürün Türü', key: 'urunTuru', type: 'text', required: true },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Nike','Adidas','Puma','Decathlon','Under Armour','Reebok','Diğer'] },
    { label: 'Kondisyon', key: 'kondisyon', type: 'select', options: ['Sıfır','Az Kullanılmış','İyi','Yıpranmış'], required: true },
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
  ],
  ofis: [
  { label: 'Ürün Türü', key: 'urunTuru', type: 'text', required: true },
    { label: 'Marka', key: 'marka', type: 'select', options: ['HP','Canon','Epson','Brother','Logitech','Microsoft','Lenovo','Diğer'] },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'], required: true },
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
  ],
  bebek: [
  { label: 'Yaş (Ay)', type: 'range-number', minKey: 'yasAyMin', maxKey: 'yasAyMax' },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Chicco','Fisher-Price','BabyBjörn','Kraft','Ebebek','Jungle','Mam','Diğer'] },
    { label: 'Renk', key: 'renk', type: 'text' },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'] },
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
  ],
  tarim: [
    { label: 'Ekipman Türü', key: 'ekipmanTuru', type: 'text' },
    { label: 'Marka', key: 'marka', type: 'select', options: ['John Deere','New Holland','Massey Ferguson','Case IH','Kubota','Deutz-Fahr','Diğer'] },
    { label: 'Güç/Kapasite', key: 'gucKapasite', type: 'text' },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'] },
    { label: 'Yıl', key: 'yil', type: 'number', min: 1980, max: 2026 },
  ],
  hobi: [
  { label: 'Hobi Türü', key: 'hobiTuru', type: 'text' },
    { label: 'Marka', key: 'marka', type: 'select', options: ['DJI','Lego','Tamiya','Fender','Yamaha','Canon','Nikon','Diğer'] },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'] },
  ],
}

Object.keys(ATTR_SCHEMAS).forEach((key) => {
  ATTR_SCHEMAS[key] = ATTR_SCHEMAS[key].map((f) => {
    if ((f.type === 'select' || f.type === 'multiselect') && f.options && !f.options.includes('Farketmez')) {
      return { ...f, options: [...f.options, 'Farketmez'] };
    }
    return f;
  });
});
