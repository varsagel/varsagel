export type FilterPreset = { name: string; params: Record<string, string> }

export const FILTER_PRESETS: Record<string, FilterPreset[]> = {
  'emlak/satilik-daire': [
    { name: '3+1 • Doğalgaz • Krediye Uygun', params: { odaSayisi: '3+1', isitma: 'Doğalgaz', krediyeUygun: 'true' } },
    { name: '2+1 • Balkonlu', params: { odaSayisi: '2+1', balkon: 'true' } },
    { name: 'Krediye Uygun • Takaslı', params: { krediyeUygun: 'true', takasli: 'true' } },
  ],
  'emlak/kiralik-daire': [
    { name: 'Eşyalı • Doğalgaz', params: { esyali: 'true', isitma: 'Doğalgaz' } },
  ],
  'vasita/otomobil': [
    { name: 'Sedan • Benzin • Otomatik', params: { kasaTipi: 'Sedan', yakit: 'Benzin', vites: 'Otomatik' } },
    { name: 'SUV • Dizel • 4x4', params: { kasaTipi: 'SUV', yakit: 'Dizel', cekis: '4x4' } },
    { name: 'BMW • 3 Serisi', params: { marka: 'BMW', model: '3 Serisi' } },
    { name: 'Mercedes • C‑Serisi', params: { marka: 'Mercedes', model: 'C-Serisi' } },
    { name: 'Audi • A4', params: { marka: 'Audi', model: 'A4' } },
    { name: 'Elektrik • Otomatik', params: { yakit: 'Elektrik', vites: 'Otomatik' } },
    { name: 'Hibrit • Otomatik', params: { yakit: 'Hibrit', vites: 'Otomatik' } },
    { name: 'Dizel • Manuel', params: { yakit: 'Dizel', vites: 'Manuel' } },
    { name: 'Sedan • Önden Çekiş', params: { kasaTipi: 'Sedan', cekis: 'Önden Çekiş' } },
    { name: 'SUV • 4x4 • Benzin', params: { kasaTipi: 'SUV', cekis: '4x4', yakit: 'Benzin' } },
    { name: 'Elektrik • SUV', params: { yakit: 'Elektrik', kasaTipi: 'SUV' } },
    { name: 'Hibrit • Otomatik • SUV', params: { yakit: 'Hibrit', vites: 'Otomatik', kasaTipi: 'SUV' } },
    { name: 'Volvo • XC60', params: { marka: 'Volvo', model: 'XC60' } },
  ],
  'vasita/motosiklet': [
    { name: 'Yamaha • MT‑07', params: { marka: 'Yamaha', model: 'MT-07' } },
    { name: 'Honda • CBR500R', params: { marka: 'Honda', model: 'CBR500R' } },
  ],
  'vasita/ticari-arac': [
    { name: 'Transit • SRC', params: { marka: 'Ford', model: 'Transit', belgeDurumu: 'SRC' } },
    { name: 'Sprinter • Şirket', params: { marka: 'Mercedes', model: 'Sprinter', belgeDurumu: 'Şirket' } },
    { name: 'SRC • Yük Kapasitesi', params: { belgeDurumu: 'SRC' } },
  ],
  'vasita/elektrikli-arac': [
    { name: 'Tesla • Model 3', params: { marka: 'Tesla', model: 'Model 3' } },
    { name: 'Renault • Zoe', params: { marka: 'Renault', model: 'Zoe' } },
  ],
  'vasita/suv-pickup': [
    { name: 'Hilux • 4x4', params: { marka: 'Toyota', model: 'Hilux', cekis: '4x4' } },
    { name: 'Amarok • Dizel', params: { marka: 'Volkswagen', model: 'Amarok', yakit: 'Dizel' } },
    { name: 'Land Rover Defender • 4x4', params: { marka: 'Land Rover', model: 'Defender', cekis: '4x4' } },
    { name: 'SUV • 4x4 • Dizel', params: { kasaTipi: 'SUV', cekis: '4x4', yakit: 'Dizel' } },
    { name: 'RAV4 • Benzin', params: { marka: 'Toyota', model: 'RAV4', yakit: 'Benzin' } },
  ],
  'alisveris/cep-telefonu': [
    { name: '64GB • Garanti', params: { depolama: '64', garanti: 'true' } },
    { name: 'iPhone 13 • 128GB', params: { marka: 'Apple', model: 'iPhone 13', depolama: '128' } },
    { name: 'Galaxy S23 • 256GB', params: { marka: 'Samsung', model: 'Galaxy S23', depolama: '256' } },
  ],
  'alisveris/bilgisayar': [
    { name: 'i7 • 16GB • 512GB', params: { cpu: 'i7', ram: '16', depolama: '512' } },
    { name: 'MacBook Pro • 16GB • 512GB', params: { marka: 'Apple', model: 'MacBook Pro', ram: '16', depolama: '512' } },
    { name: 'Dell XPS 13 • 16GB', params: { marka: 'Dell', model: 'XPS 13', ram: '16' } },
  ],
  'alisveris/televizyon': [
    { name: '4K • 55" • Smart', params: { cozunurluk: '4K', ekranBoyutu: '55', smartTv: 'true' } },
    { name: 'LG OLED C1 • 55"', params: { marka: 'LG', model: 'OLED C1', ekranBoyutu: '55' } },
  ],
  'alisveris/tablet': [
    { name: '10" • 128GB • Hücresel', params: { ekranBoyutu: '10', depolama: '128', hucresel: 'true' } },
    { name: 'iPad Air • 64GB', params: { marka: 'Apple', model: 'iPad Air', depolama: '64' } },
  ],
  'alisveris/akilli-saat': [
    { name: 'GPS • 5ATM', params: { gps: 'true', suGecirmezlik: '5ATM' } },
    { name: 'Apple Watch SE', params: { marka: 'Apple', model: 'Watch SE' } },
  ],
  'alisveris/beyaz-esya': [
    { name: 'Arçelik • Buzdolabı • A++', params: { marka: 'Arçelik', model: 'Buzdolabı', enerjiSinifi: 'A++' } },
    { name: 'Bosch • Bulaşık • A+', params: { marka: 'Bosch', model: 'Bulaşık Makinesi', enerjiSinifi: 'A+' } },
  ],
  'is-ilanlari/uzaktan': [
    { name: 'Uzaktan • Esnek Saatler', params: { calismaSekli: 'Uzaktan', esnekSaatler: 'true' } },
  ],
  'is-ilanlari/tam-zamanli': [
    { name: 'Junior • Tam Zamanlı', params: { seviye: 'Junior', calismaSekli: 'Tam Zamanlı' } },
  ],
  'hayvanlar-alemi/kedi': [
    { name: 'Kısır • Aşılı', params: { kisir: 'true', asili: 'true' } },
  ],
  'hayvanlar-alemi/evcil-hayvan': [
    { name: 'Aşılı • Erkek', params: { asili: 'true', cinsiyet: 'Erkek' } },
  ],
}
