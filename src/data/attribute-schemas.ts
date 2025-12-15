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
    { label: 'Metrekare (m²)', type: 'range-number', minKey: 'm2Min', maxKey: 'm2Max', required: true },
    { label: 'Krediye Uygun', key: 'krediyeUygun', type: 'boolean' },
    { label: 'Takas', key: 'takas', type: 'boolean' },
  ],
  vasita: [
    { label: 'Marka', key: 'marka', type: 'select', options: ['BMW','Mercedes','Audi','Volkswagen','Renault','Peugeot','Citroën','Toyota','Honda','Hyundai','Kia','Ford','Fiat','Opel','Skoda','Volvo','Nissan','Seat','Alfa Romeo','Subaru','Mazda','Mini','Land Rover','Porsche','Jaguar','Bentley','Rolls-Royce','Aston Martin','Ferrari','Lamborghini','Maserati','Dacia','Jeep','Mitsubishi','Isuzu','Tesla','BYD','Chery','MG','Geely','GWM','SsangYong','NIO','Rivian','TOGG','Cupra','Smart'], required: true },
    { label: 'Model', key: 'model', type: 'text', required: true },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1950, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Benzin','Dizel','LPG','Elektrik','Hibrit'], required: true },
    { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik','Yarı Otomatik'], required: true },
    { label: 'Kasa Tipi', key: 'kasaTipi', type: 'select', options: ['Sedan','Hatchback','SUV','Coupe','Cabrio','Pick-up','Station Wagon','MPV'] },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Gümüş Gri','Kırmızı','Mavi','Lacivert','Yeşil','Sarı','Turuncu','Kahverengi','Bej','Bordo','Mor','Pembe','Turkuaz','Şampanya','Altın','Bronz','Füme'] },
    { label: 'Motor Gücü (HP)', type: 'range-number', minKey: 'motorGucuMin', maxKey: 'motorGucuMax' },
    { label: 'Motor Hacmi (cc)', type: 'range-number', minKey: 'motorHacmiMin', maxKey: 'motorHacmiMax' },
    { label: 'Çekiş', key: 'cekis', type: 'select', options: ['Önden Çekiş','Arkadan İtiş','4WD (Sürekli)','AWD (Elektronik)'] },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'yedek-parca-aksesuar-donanim-tuning': [
    { label: 'Parça Türü', key: 'parcaTuru', type: 'text', required: true },
    { label: 'Uyumlu Araç', key: 'uyumluArac', type: 'text' },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El'], required: true },
    { label: 'Marka', key: 'marka', type: 'select', options: ['Bosch','Valeo','NGK','Brembo','MANN','Michelin','Pirelli','Continental','Diğer'] },
    { label: 'Orijinal', key: 'orijinal', type: 'boolean' },
  ],
  alisveris: [
    { label: 'Marka', key: 'marka', type: 'select', options: ['Apple','Samsung','Xiaomi','Huawei','LG','Sony','Bosch','Arçelik','Vestel','Philips','Diğer'] },
    { label: 'Garanti', key: 'garanti', type: 'boolean' },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Gümüş','Altın','Mavi','Kırmızı','Yeşil','Sarı','Turuncu','Kahverengi','Mor','Pembe','Diğer'] },
    { label: 'Garanti Süresi (Ay)', key: 'garantiSuresi', type: 'number' },
    { label: 'Durum', key: 'durum', type: 'select', options: ['Sıfır','İkinci El','Yenilenmiş'], required: true },
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
  'ozel-ders-verenler': [
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
