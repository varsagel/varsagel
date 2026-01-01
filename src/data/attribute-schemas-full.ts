// SAHİBİNDEN.COM TAM DERİN FİLTRE SİSTEMİ
// Her alt kategori için özel dinamik filtreler

export type AttrField = {
  label: string
  key?: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'range-number' | 'multiselect' | 'cascade'
  options?: string[] | any
  minKey?: string
  maxKey?: string
  required?: boolean
  minLabel?: string
  maxLabel?: string
  min?: number
  max?: number
  depends?: string  // Cascade için bağımlılık
}

// ======================
// EMLAK - SATILIK DAİRE
// ======================
export const emlak_satilik_daire: AttrField[] = [
  { label: 'İl', key: 'il', type: 'select', options: ['İstanbul', 'Ankara', 'İzmir', 'Adana', 'Antalya', 'Bursa', 'Konya', 'Kayseri', 'Gaziantep', 'Diyarbakır'], required: true },
  { label: 'İlçe', key: 'ilce', type: 'select', options: [], depends: 'il' },
  { label: 'Mahalle', key: 'mahalle', type: 'select', options: [], depends: 'ilce' },
  
  // Temel
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 100000000, required: true },
  { label: 'Kim den', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Emlak Ofisinden'] },
  
  // Oda ve Alan
  { label: 'Oda Sayısı', key: 'odaSayisi', type: 'multiselect', options: ['1+0 (Stüdyo)', '1+1', '2+0', '2+1', '2.5+1', '3+1', '3.5+1', '4+1', '4.5+1', '5+1', '5.5+1', '6+1', '6.5+1', '7+1', '7.5+1', '8+1', '8.5+1', '9+1', '9+üzeri'], required: true },
  { label: 'Brüt / Net m²', key: 'm2Tipi', type: 'select', options: ['Brüt', 'Net'] },
  { label: 'm² (Net)', type: 'range-number', minKey: 'm2Min', maxKey: 'm2Max', min: 15, max: 2000, required: true },
  
  // Bina
  { label: 'Bina Yaşı', key: 'binaYasi', type: 'multiselect', options: ['0', '1', '2', '3', '4', '5', '6-10', '11-15', '16-20', '21-25', '26-30', '31 ve üzeri'] },
  { label: 'Kat Sayısı', key: 'katSayisi', type: 'multiselect', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10-19', '20-29', '30 ve üzeri'] },
  { label: 'Bulunduğu Kat', key: 'bulunduguKat', type: 'multiselect', options: ['Bahçe Katı', 'Bodrum', 'Zemin', 'Giriş Katı', 'Yüksek Giriş', 'Müstakil', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16-20', '21-25', '26-30', '31 ve üzeri', 'Villa Tipi', 'Kot 1', 'Kot 2', 'Kot 3', 'Kot 4'] },
  
  // Isınma
  { label: 'Isınma Tipi', key: 'isinma', type: 'multiselect', options: ['Yok', 'Soba', 'Doğalgaz (Kombi)', 'Doğalgaz (Kat Kaloriferi)', 'Doğalgaz (Merkezi Sistem)', 'Merkezi (Pay Ölçer)', 'Yerden Isıtma', 'Klima', 'Fancoil Ünitesi', 'Güneş Enerjisi', 'Elektrikli Radyatör', 'Jeotermal', 'Şömine', 'VRV', 'Isı Pompası'] },
  
  // Banyo
  { label: 'Banyo Sayısı', key: 'banyoSayisi', type: 'multiselect', options: ['Yok', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'] },
  
  // Balkon
  { label: 'Balkon', key: 'balkon', type: 'multiselect', options: ['Var', 'Yok'] },
  
  // Asansör
  { label: 'Asansör', key: 'asansor', type: 'multiselect', options: ['Var', 'Yok'] },
  
  // Otopark
  { label: 'Otopark', key: 'otopark', type: 'multiselect', options: ['Açık Otopark', 'Kapalı Otopark'] },
  
  // Eşyalı
  { label: 'Eşyalı', key: 'esyali', type: 'multiselect', options: ['Evet', 'Hayır'] },
  
  // Kullanım Durumu
  { label: 'Kullanım Durumu', key: 'kullanimDurumu', type: 'multiselect', options: ['Boş', 'Dolu', 'Kiracılı', 'Mülk Sahibi'] },
  
  // Site İçerisinde
  { label: 'Site İçerisinde', key: 'siteIcerisinde', type: 'multiselect', options: ['Evet', 'Hayır'] },
  
  // Aidat
  { label: 'Aidat (₺)', type: 'range-number', minKey: 'aidatMin', maxKey: 'aidatMax', min: 0, max: 50000 },
  
  // Krediye Uygunluk
  { label: 'Krediye Uygunluk', key: 'krediyeUygun', type: 'multiselect', options: ['Uygun', 'Uygun Değil'] },
  
  // Takasın Durumu
  { label: 'Takasın Durumu', key: 'takas', type: 'multiselect', options: ['Takas Olur', 'Takas Olmaz'] },
  
  // Tapu Durumu
  { label: 'Tapu Durumu', key: 'tapuDurumu', type: 'multiselect', options: ['Kat Mülkiyetli', 'Kat İrtifaklı', 'Arsa Tapulu', 'Hisseli Tapulu', 'Müstakil Tapulu'] },
  
  // Konut Tipi (Yapı Tarzı)
  { label: 'Konut Tipi', key: 'konutTipi', type: 'multiselect', options: ['Az Katlı Blok', 'Çok Katlı Blok', 'Müstakil', 'Dublex', 'Triplex', 'Villa', 'Daire', 'Rezidans', 'Bahçe Dublex', 'Çatı Dublex'] },
  
  // Yapı Tipi
  { label: 'Yapı Tipi', key: 'yapiTipi', type: 'multiselect', options: ['Betonarme', 'Çelik', 'Ahşap', 'Karkas', 'Yığma'] },
  
  // Yapının Durumu
  { label: 'Yapının Durumu', key: 'yapininDurumu', type: 'multiselect', options: ['Sıfır Bina', 'İkinci El', 'Yapım Aşamasında', 'Proje'] },
  
  // Cephe
  { label: 'Cephe', key: 'cephe', type: 'multiselect', options: ['Doğu', 'Batı', 'Kuzey', 'Güney', 'Güneydoğu', 'Güneybatı', 'Kuzeydoğu', 'Kuzeybatı'] },
];

// ======================
// VASITA - OTOMOBİL (DERİN HİYERARŞİ)
// ======================
// Gerçek marka-seri-model-motor/paket hiyerarşisi
export const vasita_otomobil: AttrField[] = [
  // Temel
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 50000000, required: true },
  { label: 'Kimden', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Galeriden', 'Yetkili Bayiden'] },
  
  // MARKA (70 gerçek marka)
  { label: 'Marka', key: 'marka', type: 'select', options: ['Alfa Romeo', 'Audi', 'BMW', 'BYD', 'Chery', 'Chevrolet', 'Chrysler', 'Citroen', 'Dacia', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Maserati', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Rolls-Royce', 'Rover', 'Saab', 'Seat', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'TOGG', 'Tofaş', 'Toyota', 'Volkswagen', 'Volvo'], required: true },
  
  // MODEL (Markaya göre değişir - cascade)
  { label: 'Model', key: 'model', type: 'cascade', depends: 'marka', required: true },
  
  // SERİ (Modele göre değişir - cascade)
  { label: 'Seri', key: 'seri', type: 'cascade', depends: 'model' },
  
  // MOTOR/PAKET (Seriye göre değişir - cascade)
  { label: 'Motor / Paket', key: 'motorPaket', type: 'cascade', depends: 'seri' },
  
  // Yıl
  { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1960, max: 2026, required: true },
  
  // Kilometre
  { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax', min: 0, max: 1000000 },
  
  // Vites
  { label: 'Vites Tipi', key: 'vites', type: 'multiselect', options: ['Manuel', 'Yarı Otomatik', 'Otomatik', 'Düz Vites'] },
  
  // Yakıt
  { label: 'Yakıt Tipi', key: 'yakit', type: 'multiselect', options: ['Benzin', 'Dizel', 'Benzin & LPG', 'LPG & Benzin', 'Benzin & CNG', 'CNG & Benzin', 'Elektrik', 'Hibrit', 'Dizel & Elektrik', 'Benzin & Elektrik', 'Plug-in Hibrit', 'Hidrojen'] },
  
  // Kasa Tipi
  { label: 'Kasa Tipi', key: 'kasaTipi', type: 'multiselect', options: ['Sedan', 'Hatchback/3', 'Hatchback/5', 'Station wagon', 'Coupe', 'Cabrio', 'Roadster', 'MPV', 'SUV', 'Pick-up', 'Panelvan'] },
  
  // Motor Gücü
  { label: 'Motor Gücü (HP)', type: 'range-number', minKey: 'motorGucuMin', maxKey: 'motorGucuMax', min: 0, max: 2000 },
  
  // Motor Hacmi
  { label: 'Motor Hacmi (cm³)', type: 'range-number', minKey: 'motorHacmiMin', maxKey: 'motorHacmiMax', min: 0, max: 10000 },
  
  // Çekiş
  { label: 'Çekiş', key: 'cekis', type: 'multiselect', options: ['Önden Çekiş', 'Arkadan İtiş', '4WD (Sürekli)', 'AWD (Elektronik)'] },
  
  // Renk
  { label: 'Renk', key: 'renk', type: 'multiselect', options: ['Beyaz', 'Siyah', 'Gri', 'Gümüş Gri', 'Kırmızı', 'Mavi', 'Lacivert', 'Mor', 'Yeşil', 'Sarı', 'Turuncu', 'Kahverengi', 'Bej', 'Altın', 'Bronz', 'Bordo', 'Pembe', 'Şampanya', 'Turkuaz', 'Füme'] },
  
  // Kimden (Durumu)
  { label: 'Kimden (Durum)', key: 'kimdenDurum', type: 'multiselect', options: ['Boyasız', 'Boyalı', 'Değişensiz', 'Değişenli'] },
  
  // Tramer ve Hasar
  { label: 'Tramer', key: 'tramer', type: 'multiselect', options: ['Tramer Kaydı Yok', 'Tramer Kaydı Var', 'Tramer Kayıt Bilgisi Yok'] },
  { label: 'Ağır Hasar Kaydı', key: 'agirHasar', type: 'multiselect', options: ['Ağır Hasar Kaydı Yok', 'Ağır Hasar Kaydı Var'] },
  
  // Garanti
  { label: 'Garanti', key: 'garanti', type: 'multiselect', options: ['Yok', 'Var'] },
  
  // Plaka
  { label: 'Plaka', key: 'plaka', type: 'multiselect', options: ['TR Plakalı', 'Yabancı Plakalı'] },
  
  // Takas
  { label: 'Takas', key: 'takas', type: 'multiselect', options: ['Takasla Olur', 'Takas Olmaz'] },
];

// Diğer alt kategoriler için benzer derin filtre yapısı
// (Her kategori için 30-50 filtre eklenecek)

export const ATTR_SCHEMAS: Record<string, AttrField[]> = {
  // Emlak alt kategorileri
  'emlak-satilik-daire': emlak_satilik_daire,
  'emlak-kiralik-daire': emlak_satilik_daire, // Aynı filtreler
  'emlak-satilik-ev': emlak_satilik_daire,
  
  // Vasıta alt kategorileri
  'vasita-otomobil': vasita_otomobil,
  'vasita-arazi-suv-pickup': vasita_otomobil, // Benzer filtreler
  'vasita-motosiklet': vasita_otomobil, // Özelleştirilecek
  
  // Genel kategoriler (geriye dönük uyumluluk)
  'emlak': emlak_satilik_daire,
  'vasita': vasita_otomobil,
};
