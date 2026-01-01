// SAHİBİNDEN.COM HER ALT KATEGORİ İÇİN ÖZEL FİLTRELER
// 115 alt kategori için dinamik filtre sistemi

export type AttrField = {
  label: string
  key?: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'range-number' | 'multiselect' | 'cascade'
  options?: string[]
  minKey?: string
  maxKey?: string
  required?: boolean
  minLabel?: string
  maxLabel?: string
  min?: number
  max?: number
  depends?: string
}

// ============================================
// EMLAK - SATILIK DAİRE
// ============================================
const emlak_satilik_daire: AttrField[] = [
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 100000000, required: true },
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Kimden', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Emlak Ofisinden'] },
  { label: 'Oda Sayısı', key: 'odaSayisi', type: 'multiselect', options: ['1+0 (Stüdyo)', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', '7+1', '8+1', '9+1', '10+üzeri'], required: true },
  { label: 'm² (Net)', type: 'range-number', minKey: 'm2Min', maxKey: 'm2Max', min: 15, max: 2000 },
  { label: 'Bina Yaşı', key: 'binaYasi', type: 'multiselect', options: ['0', '1-5', '6-10', '11-15', '16-20', '21-25', '26-30', '31+'] },
  { label: 'Kat Sayısı', key: 'katSayisi', type: 'multiselect', options: ['1', '2', '3', '4', '5-10', '11-20', '20+'] },
  { label: 'Bulunduğu Kat', key: 'bulunduguKat', type: 'multiselect', options: ['Bodrum', 'Zemin', '1', '2', '3', '4', '5+'] },
  { label: 'Isınma', key: 'isinma', type: 'multiselect', options: ['Yok', 'Soba', 'Doğalgaz (Kombi)', 'Merkezi', 'Yerden Isıtma', 'Klima'] },
  { label: 'Banyo Sayısı', key: 'banyoSayisi', type: 'multiselect', options: ['1', '2', '3', '4+'] },
  { label: 'Balkon', key: 'balkon', type: 'multiselect', options: ['Var', 'Yok'] },
  { label: 'Asansör', key: 'asansor', type: 'multiselect', options: ['Var', 'Yok'] },
  { label: 'Otopark', key: 'otopark', type: 'multiselect', options: ['Açık', 'Kapalı', 'Yok'] },
  { label: 'Eşyalı', key: 'esyali', type: 'multiselect', options: ['Evet', 'Hayır'] },
  { label: 'Kullanım Durumu', key: 'kullanimDurumu', type: 'multiselect', options: ['Boş', 'Dolu', 'Kiracılı'] },
  { label: 'Site İçerisinde', key: 'siteIcerisinde', type: 'multiselect', options: ['Evet', 'Hayır'] },
  { label: 'Aidat (₺)', type: 'range-number', minKey: 'aidatMin', maxKey: 'aidatMax', min: 0, max: 50000 },
  { label: 'Krediye Uygun', key: 'krediyeUygun', type: 'multiselect', options: ['Uygun', 'Uygun Değil'] },
  { label: 'Takas', key: 'takas', type: 'multiselect', options: ['Olur', 'Olmaz'] },
  { label: 'Tapu Durumu', key: 'tapuDurumu', type: 'multiselect', options: ['Kat Mülkiyetli', 'Kat İrtifaklı', 'Arsa Tapulu'] },
];

// ============================================
// EMLAK - SATILIK ARSA (FARKLI FİLTRELER!)
// ============================================
const emlak_satilik_arsa: AttrField[] = [
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 100000000, required: true },
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Kimden', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Emlak Ofisinden'] },
  { label: 'm²', type: 'range-number', minKey: 'm2Min', maxKey: 'm2Max', min: 100, max: 1000000, required: true },
  { label: 'İmar Durumu', key: 'imarDurumu', type: 'multiselect', options: ['İmarlı', 'İmarsız', 'Muhtelif İmar', 'Kat Karşılığı', 'Tarla'] },
  { label: 'Ada No', key: 'adaNo', type: 'text' },
  { label: 'Parsel No', key: 'parselNo', type: 'text' },
  { label: 'Tapu Durumu', key: 'tapuDurumu', type: 'multiselect', options: ['Kat Mülkiyetli', 'Arsa Tapulu', 'Hisseli Tapulu', 'Zilyet'] },
  { label: 'Krediye Uygun', key: 'krediyeUygun', type: 'multiselect', options: ['Uygun', 'Uygun Değil'] },
  { label: 'Takas', key: 'takas', type: 'multiselect', options: ['Olur', 'Olmaz'] },
  { label: 'Kat Karşılığı', key: 'katKarsiligi', type: 'multiselect', options: ['Evet', 'Hayır'] },
  { label: 'Gabari', key: 'gabari', type: 'text' },
];

// ============================================
// VASITA - OTOMOBİL
// ============================================
const vasita_otomobil: AttrField[] = [
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 50000000, required: true },
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Kimden', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Galeriden', 'Yetkili Bayiden'] },
  { label: 'Marka', key: 'marka', type: 'select', options: ['Alfa Romeo', 'Audi', 'BMW', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Mercedes-Benz', 'Opel', 'Peugeot', 'Renault', 'TOGG', 'Toyota', 'Volkswagen'], required: true },
  { label: 'Model', key: 'model', type: 'text', required: true },
  { label: 'Seri', key: 'seri', type: 'text' },
  { label: 'Motor / Paket', key: 'motorPaket', type: 'text' },
  { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1960, max: 2026 },
  { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax', min: 0, max: 1000000 },
  { label: 'Vites', key: 'vites', type: 'multiselect', options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
  { label: 'Yakıt', key: 'yakit', type: 'multiselect', options: ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'] },
  { label: 'Kasa Tipi', key: 'kasaTipi', type: 'multiselect', options: ['Sedan', 'Hatchback', 'SUV', 'Station Wagon', 'Coupe'] },
  { label: 'Motor Gücü (HP)', type: 'range-number', minKey: 'motorGucuMin', maxKey: 'motorGucuMax', min: 0, max: 2000 },
  { label: 'Çekiş', key: 'cekis', type: 'multiselect', options: ['Önden', 'Arkadan', '4WD'] },
  { label: 'Renk', key: 'renk', type: 'multiselect', options: ['Beyaz', 'Siyah', 'Gri', 'Kırmızı', 'Mavi', 'Yeşil'] },
  { label: 'Tramer', key: 'tramer', type: 'multiselect', options: ['Tramer Kaydı Yok', 'Tramer Kaydı Var'] },
  { label: 'Garanti', key: 'garanti', type: 'multiselect', options: ['Var', 'Yok'] },
  { label: 'Takas', key: 'takas', type: 'multiselect', options: ['Olur', 'Olmaz'] },
];

// ============================================
// VASITA - MOTOSİKLET (FARKLI FİLTRELER!)
// ============================================
const vasita_motosiklet: AttrField[] = [
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 5000000 },
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Kimden', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Galeriden'] },
  { label: 'Marka', key: 'marka', type: 'select', options: ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Harley Davidson', 'Ducati', 'KTM', 'Aprilia'], required: true },
  { label: 'Model', key: 'model', type: 'text', required: true },
  { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1960, max: 2026 },
  { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax', min: 0, max: 500000 },
  { label: 'Motor Hacmi (cc)', type: 'range-number', minKey: 'motorHacmiMin', maxKey: 'motorHacmiMax', min: 50, max: 2000 },
  { label: 'Vites Tipi', key: 'vites', type: 'multiselect', options: ['Manuel', 'Otomatik'] },
  { label: 'Motosiklet Tipi', key: 'motosikletTipi', type: 'multiselect', options: ['Naked', 'Sport', 'Touring', 'Chopper', 'Scooter', 'Cross'] },
  { label: 'Renk', key: 'renk', type: 'multiselect', options: ['Beyaz', 'Siyah', 'Kırmızı', 'Mavi', 'Yeşil'] },
  { label: 'Garanti', key: 'garanti', type: 'multiselect', options: ['Var', 'Yok'] },
  { label: 'Takas', key: 'takas', type: 'multiselect', options: ['Olur', 'Olmaz'] },
];

// ============================================
// İKİNCİ EL - CEP TELEFONU (FARKLI FİLTRELER!)
// ============================================
const alisveris_cep_telefonu: AttrField[] = [
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 200000 },
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Marka', key: 'marka', type: 'multiselect', options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Realme', 'Google', 'OnePlus'], required: true },
  { label: 'Model', key: 'model', type: 'text', required: true },
  { label: 'Hafıza', key: 'hafiza', type: 'multiselect', options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'] },
  { label: 'Renk', key: 'renk', type: 'multiselect', options: ['Siyah', 'Beyaz', 'Gri', 'Mavi', 'Kırmızı', 'Altın', 'Yeşil'] },
  { label: 'Garanti Durumu', key: 'garantiDurumu', type: 'multiselect', options: ['Garantili', 'Garantisiz'] },
  { label: 'Durum', key: 'durum', type: 'multiselect', options: ['Sıfır', 'İkinci El', 'Yenilenmiş'] },
  { label: 'Değişen-Takas', key: 'degisen', type: 'multiselect', options: ['Değişen Yok', 'Değişen Var'] },
  { label: 'Kimden', key: 'kimden', type: 'multiselect', options: ['Sahibinden', 'Firmadan'] },
];

// ============================================
// İKİNCİ EL - BİLGİSAYAR (FARKLI FİLTRELER!)
// ============================================
const alisveris_bilgisayar: AttrField[] = [
  { label: 'Fiyat', type: 'range-number', minKey: 'fiyatMin', maxKey: 'fiyatMax', min: 0, max: 500000 },
  { label: 'İlan Tarihi', key: 'ilanTarihi', type: 'select', options: ['Son 24 Saat', 'Son 3 Gün', 'Son 7 Gün', 'Son 15 Gün', 'Son 30 Gün'] },
  { label: 'Marka', key: 'marka', type: 'multiselect', options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Monster'], required: true },
  { label: 'İşlemci', key: 'islemci', type: 'multiselect', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'M1', 'M2', 'M3'] },
  { label: 'RAM', key: 'ram', type: 'multiselect', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'] },
  { label: 'Ekran Kartı', key: 'ekranKarti', type: 'multiselect', options: ['Yok', 'NVIDIA', 'AMD', 'Entegre'] },
  { label: 'Disk Tipi', key: 'diskTipi', type: 'multiselect', options: ['HDD', 'SSD', 'HDD + SSD'] },
  { label: 'Disk Kapasitesi', key: 'diskKapasitesi', type: 'multiselect', options: ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB'] },
  { label: 'Ekran Boyutu', key: 'ekranBoyutu', type: 'multiselect', options: ['13"', '14"', '15"', '16"', '17"'] },
  { label: 'Garanti', key: 'garanti', type: 'multiselect', options: ['Var', 'Yok'] },
  { label: 'Durum', key: 'durum', type: 'multiselect', options: ['Sıfır', 'İkinci El'] },
];

// DİNAMİK SCHEMA EXPORT - Her alt kategori için özel filtreler
export const ATTR_SCHEMAS: Record<string, AttrField[]> = {
  // EMLAK
  'satilik-daire': emlak_satilik_daire,
  'kiralik-daire': emlak_satilik_daire, // Benzer ama depozito eklenebilir
  'satilik-arsa': emlak_satilik_arsa,
  'kiralik-arsa': emlak_satilik_arsa,
  'satilik-isyeri': emlak_satilik_daire, // Ofis/dükkan için özelleştirilebilir
  'kiralik-isyeri': emlak_satilik_daire,
  'satilik-villa': emlak_satilik_daire,
  'kiralik-villa': emlak_satilik_daire,
  
  // VASITA
  'otomobil': vasita_otomobil,
  'arazi-suv-pickup': vasita_otomobil,
  'motosiklet': vasita_motosiklet,
  'minivan-panelvan': vasita_otomobil,
  'ticari-araclar': vasita_otomobil,
  
  // ALIŞVERİŞ
  'cep-telefonu': alisveris_cep_telefonu,
  'bilgisayar': alisveris_bilgisayar,
  
  // Geriye dönük uyumluluk
  'emlak': emlak_satilik_daire,
  'vasita': vasita_otomobil,
  'alisveris': alisveris_cep_telefonu,
};
