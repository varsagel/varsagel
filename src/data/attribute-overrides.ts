import { AttrField } from './attribute-schemas'
import { EXTRA_BRAND_MODELS } from './extra-brands'
import { EXTRA_MODEL_SERIES, EXTRA_SERIES_TRIMS } from './extra-vehicle-details'
import { AUTOMOBILE_BRAND_MODELS, AUTOMOBILE_MODEL_SERIES, AUTOMOBILE_SERIES_TRIMS, AUTOMOBILE_TRIM_EQUIPMENTS } from './automobile-data'

const BUILDING_ATTRIBUTES: AttrField[] = [
  { label: 'Oda Sayısı', key: 'odaSayisi', type: 'select', options: ['1+0','1+1','1.5+1','2+0','2+1','2.5+1','3+1','3.5+1','4+0','4+1','4+2','5+1','5+2','6+1','6+2','7+1','8+1','9+1','10+ Üzeri','Stüdyo','Loft'], required: true },
  { label: 'Bina Yaşı', type: 'range-number', minKey: 'binaYasiMin', maxKey: 'binaYasiMax' },
  { label: 'Bulunduğu Kat', key: 'bulunduguKat', type: 'multiselect', options: ['Bodrum Kat','Zemin Kat','Bahçe Katı','Giriş Kat','Yüksek Giriş','Müstakil','Villa Tipi','Çatı Katı','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21 ve üzeri'] },
  { label: 'Isıtma', key: 'isitma', type: 'select', options: ['Doğalgaz (Kombi)','Doğalgaz (Merkezi)','Merkezi (Pay Ölçer)','Elektrikli Radyatör','Kat Kaloriferi','Klima','Soba','Şömine','Yerden Isıtma','Jeotermal','Güneş Enerjisi','VRV','Fancoil','Isı Pompası','Yok'] },
  { label: 'Banyo Sayısı', key: 'banyoSayisi', type: 'select', options: ['1','2','3','4','5','6','7+','Yok'] },
  { label: 'Balkon', key: 'balkon', type: 'boolean' },
  { label: 'Eşyalı', key: 'esyali', type: 'boolean' },
  { label: 'Kullanım Durumu', key: 'kullanimDurumu', type: 'select', options: ['Boş','Kiracılı','Mülk Sahibi Oturuyor'] },
  { label: 'Site İçerisinde', key: 'siteIcerisinde', type: 'boolean' },
  { label: 'Aidat (TL)', key: 'aidat', type: 'number' },
  { label: 'Cephe', key: 'cephe', type: 'multiselect', options: ['Kuzey','Güney','Doğu','Batı','Kuzeydoğu','Kuzeybatı','Güneydoğu','Güneybatı'] },
  { label: 'Tapu Durumu', key: 'tapuDurumu', type: 'select', options: ['Kat Mülkiyeti','Kat İrtifakı','Hisseli','Müstakil Tapulu','Arsa Tapulu','Bilinmiyor'] },
];

const ALTYAPI_OPTIONS = ['Elektrik','Sanayi Elektriği','Su','Şebeke Suyu','Doğalgaz','Kanalizasyon','Arıtma','Sondaj & Kuyu','Zemin Etüdü','Yolu Açılmış','Yolu Yok','Telefon','ADSL','Fiber İnternet'];
const KONUM_OPTIONS = ['Denize Sıfır','Denize Yakın','Caddeye Yakın','Havaalanına Yakın','Toplu Taşımaya Yakın','Merkeze Yakın','Manzara - Deniz','Manzara - Doğa','Manzara - Şehir','Manzara - Göl','Manzara - Boğaz'];

const LAND_ATTRIBUTES: AttrField[] = [
  { label: 'İmar Durumu', key: 'imarDurumu', type: 'select', options: ['Ada','Arazi','Bağ & Bahçe','Eğitim','Enerji Depolama','Konut','Özel Kullanım','Sağlık','Sanayi','Sera','Sit Alanı','Spor Alanı','Tarla','Ticari','Ticari + Konut','Turizm','Villa','Zeytinlik','Diğer'], required: true },
  { label: 'Ada No', key: 'adaNo', type: 'text' },
  { label: 'Parsel No', key: 'parselNo', type: 'text' },
  { label: 'Pafta No', key: 'paftaNo', type: 'text' },
  { label: 'Kaks (Emsal)', key: 'kaks', type: 'text' },
  { label: 'Gabari', key: 'gabari', type: 'text' },
  { label: 'Alt Yapı', key: 'altYapi', type: 'multiselect', options: ALTYAPI_OPTIONS },
  { label: 'Konum Özellikleri', key: 'konumOzellikleri', type: 'multiselect', options: KONUM_OPTIONS },
  { label: 'Genel Özellikler', key: 'genelOzellikler', type: 'multiselect', options: ['Köşe Parsel','İfrazlı','Parselli','Projeli','Krediye Uygun','Takasa Uygun'] },
];

const LAND_SALE_ATTRIBUTES: AttrField[] = [
  ...LAND_ATTRIBUTES,
  { label: 'Tapu Durumu', key: 'tapuDurumu', type: 'select', options: ['Müstakil Parsel','Hisseli Tapu','Zilliyet','Tahsis','Diğer'] },
  { label: 'Kat Karşılığı', key: 'katKarsiligi', type: 'boolean' },
  { label: 'Krediye Uygun', key: 'krediyeUygun', type: 'boolean' },
  { label: 'Takas', key: 'takas', type: 'boolean' },
];

const LAND_RENT_ATTRIBUTES: AttrField[] = [
  ...LAND_ATTRIBUTES,
  { label: 'Depozito', type: 'number', key: 'depozito' },
  { label: 'Kontrat Süresi (Ay)', type: 'number', key: 'kontratSuresi' },
];

const COMMON_VEHICLE_ATTRS: AttrField[] = [
  { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1950, max: 2026 },
  { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
  { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Benzin','Dizel','LPG','Elektrik','Hibrit'], required: true },
  { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik','Yarı Otomatik'], required: true },
  { label: 'Kasa Tipi', key: 'kasaTipi', type: 'select', options: ['Sedan','Hatchback','SUV','Coupe','Cabrio','Pick-up','Station Wagon','MPV'] },
  { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Gümüş Gri','Kırmızı','Mavi','Lacivert','Yeşil','Sarı','Turuncu','Kahverengi','Bej','Bordo','Mor','Pembe','Turkuaz','Şampanya','Altın','Bronz','Füme'] },
  { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
];

export const ATTR_SUBSCHEMAS: Record<string, AttrField[]> = {
  'emlak/satilik-daire': [...BUILDING_ATTRIBUTES],
  'emlak/kiralik-daire': [
    ...BUILDING_ATTRIBUTES,
    { label: 'Depozito', type: 'number', key: 'depozito' },
    { label: 'Kontrat Süresi (Ay)', type: 'number', key: 'kontratSuresi' },
  ],
  'emlak/satilik-isyeri': [...BUILDING_ATTRIBUTES],
  'emlak/kiralik-isyeri': [...BUILDING_ATTRIBUTES],
  'emlak/satilik-bina': [...BUILDING_ATTRIBUTES],
  'emlak/satilik-yazlik': [...BUILDING_ATTRIBUTES],
  'emlak/kiralik-yazlik': [...BUILDING_ATTRIBUTES],
  'emlak/satilik-villa': [...BUILDING_ATTRIBUTES],
  'emlak/kiralik-villa': [...BUILDING_ATTRIBUTES],
  'emlak/devren-satilik': [...BUILDING_ATTRIBUTES],
  'emlak/turistik-tesis': [...BUILDING_ATTRIBUTES],

  'emlak/satilik-arsa': [...LAND_SALE_ATTRIBUTES],
  'emlak/kiralik-arsa': [...LAND_RENT_ATTRIBUTES],

  'vasita/motosiklet': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/motosiklet'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket' },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1950, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Silindir Hacmi (cc)', type: 'number', key: 'silindirHacmi' },
    { label: 'Tip', type: 'select', key: 'tip', options: ['Scooter','Naked','Enduro','Cross','Cruiser','Sport','Touring','Chopper','Commuter'] },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Kırmızı','Mavi','Sarı','Turuncu','Yeşil','Diğer'] },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'vasita/elektrikli-araclar': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Audi','BMW','BYD','Citroën','Hyundai','Lucid','Mercedes','MG','NIO','Nissan','Polestar','Renault','Rivian','Tesla','Togg','Volkswagen'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket' },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1950, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Batarya Sağlığı (%)', type: 'number', key: 'bataryaSagligi' },
    { label: 'Menzil (km)', type: 'number', key: 'menzil' },
    { label: 'Şarj Tipi', type: 'select', key: 'sarjTipi', options: ['AC','DC'] },
    { label: 'Kasa Tipi', key: 'kasaTipi', type: 'select', options: ['Sedan','Hatchback','SUV','Coupe','MPV'] },
    { label: 'Renk', key: 'renk', type: 'select', options: ['Beyaz','Siyah','Gri','Kırmızı','Mavi','Yeşil','Diğer'] },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'vasita/otomobil': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(AUTOMOBILE_BRAND_MODELS).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Seri', type: 'select', key: 'seri' },
    { label: 'Motor/Paket', type: 'select', key: 'paket' },
    { label: 'Donanım', type: 'select', key: 'donanim' },
    ...COMMON_VEHICLE_ATTRS
  ],
  'vasita/ticari-araclar': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/minivan-panelvan'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1980, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Yük Kapasitesi (kg)', type: 'number', key: 'yukKapasitesi' },
    { label: 'Belge Durumu', type: 'select', key: 'belgeDurumu', options: ['SRC','K Belgesi','Şirket','Bireysel'] },
    { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Dizel','Benzin','LPG','Elektrik'], required: true },
    { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik'], required: true },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'vasita/arazi-suv-pickup': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/arazi-suv-pickup'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Base','Comfort','Elegance','Premium','Sport'] },
    ...COMMON_VEHICLE_ATTRS
  ],
  'vasita/kamyon-cekici': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/kamyon-cekici'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1980, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Dizel'], required: true },
    { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik'], required: true },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'vasita/otobus': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['BMC','Güleryüz','Isuzu','Karsan','MAN','Mercedes','Neoplan','Otokar','Scania','Setra','Temsa','Volvo'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1980, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Dizel','CNG','Elektrik'], required: true },
    { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik'], required: true },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'vasita/minivan-panelvan': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/minivan-panelvan'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
    ...COMMON_VEHICLE_ATTRS
  ],
  'vasita/minibus-midibus': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['BMC','Citroën','Fiat','Ford','Gaz','Hyundai','Isuzu','Iveco','Karsan','Mercedes','Opel','Otokar','Peugeot','Renault','Toyota','Volkswagen'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1980, max: 2026 },
    { label: 'Kilometre', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
    { label: 'Yakıt', key: 'yakit', type: 'select', options: ['Dizel','Benzin','LPG'], required: true },
    { label: 'Vites', key: 'vites', type: 'select', options: ['Manuel','Otomatik'], required: true },
    { label: 'Ağır Hasar Kayıtlı', key: 'agirHasarKayitli', type: 'boolean' },
  ],
  'vasita/traktor': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/traktor'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket' },
    { label: 'Yıl', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax', min: 1970, max: 2026 },
    { label: 'Çalışma Saati', type: 'range-number', minKey: 'saatMin', maxKey: 'saatMax' },
    { label: 'Çekiş Tipi', key: 'cekis', type: 'select', options: ['2WD','4WD'], required: true },
    { label: 'Kabin', key: 'kabin', type: 'select', options: ['Var','Yok'], required: true },
  ],
  'alisveris/cep-telefonu': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['alisveris/cep-telefonu'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Depolama (GB)', type: 'number', key: 'depolama' },
    { label: 'RAM (GB)', type: 'number', key: 'ram' },
    { label: 'Renk', type: 'select', key: 'renk', options: ['Beyaz','Siyah','Gri','Gümüş','Altın','Rose Gold','Mavi','Kırmızı','Yeşil','Mor','Sarı','Mercan','Gece Yeşili','Pasifik Mavisi','Sierra Mavisi','Derin Mor','Siyah Titanyum','Beyaz Titanyum','Mavi Titanyum','Naturel Titanyum'] },
    { label: 'Garanti', type: 'boolean', key: 'garanti' },
  ],
  'alisveris/bilgisayar': [
    { label: 'İşlemci', type: 'text', key: 'cpu' },
    { label: 'RAM (GB)', type: 'number', key: 'ram' },
    { label: 'Depolama (GB)', type: 'number', key: 'depolama' },
    { label: 'Ekran Boyutu (inch)', type: 'number', key: 'ekranBoyutu' },
    { label: 'Ekran Kartı', type: 'text', key: 'gpu' },
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['alisveris/bilgisayar'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/beyaz-esya': [
    { label: 'Enerji Sınıfı', type: 'select', key: 'enerjiSinifi', options: ['A+++','A++','A+','A','B','C'] },
    { label: 'Garanti', type: 'boolean', key: 'garanti' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['AEG','Altus','Arçelik','Beko','Bosch','Candy','Electrolux','Esty','Ferre','Franke','Gorenje','Grundig','Hoover','Hotpoint-Ariston','Indesit','Kumtel','LG','Liebherr','Luxell','Miele','Profilo','Regal','Samsung','Sharp','Siemens','Silverline','Simfer','Smeg','Teka','Uğur','Vestel','Windsor'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/mobilya': [
    { label: 'Malzeme', type: 'text', key: 'malzeme' },
    { label: 'Renk', type: 'select', key: 'renk', options: ['Beyaz','Siyah','Gri','Kahverengi','Bej','Krem','Mavi','Yeşil','Sarı','Turuncu','Kırmızı','Mor','Pembe','Çok Renkli','Ahşap'] },
    { label: 'Ölçü', type: 'text', key: 'olcu' },
  ],
  'alisveris/televizyon': [
    { label: 'Ekran Boyutu (inch)', type: 'number', key: 'ekranBoyutu' },
    { label: 'Çözünürlük', type: 'select', key: 'cozunurluk', options: ['HD','Full HD','2K','4K','8K'] },
    { label: 'Smart TV', type: 'boolean', key: 'smartTv' },
    { label: 'HDR', type: 'boolean', key: 'hdr' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Altus','Arçelik','Awox','Axen','Beko','Dijitsu','Elton','Grundig','Hi-Level','Hisense','Hitachi','JVC','LG','Navitech','Next','Nordmende','Onvo','Philips','Regal','Saba','Samsung','Seg','Sharp','Skytech','Sony','Sunny','TCL','Techwood','Telefunken','Toshiba','Vestel','Woon'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
  ],
}

Object.keys(ATTR_SUBSCHEMAS).forEach((key) => {
  ATTR_SUBSCHEMAS[key] = ATTR_SUBSCHEMAS[key].map((f) => {
    if ((f.type === 'select' || f.type === 'multiselect') && f.options && !f.options.includes('Farketmez')) {
      return { ...f, options: [...f.options, 'Farketmez'] };
    }
    return f;
  });
});

type BrandModelsMap = Record<string, Record<string, string[]>>
type ModelSeriesMap = Record<string, Record<string, Record<string, string[]>>>

type JsonPrimitive = string | number | boolean | null
type Json = JsonPrimitive | Json[] | { [key: string]: Json }
type SeriesTrimsMap = Record<string, Json>

// EXPORT EMPTY OBJECTS FOR COMPATIBILITY - Logic moved to API
export const BRAND_MODELS: BrandModelsMap = {
  ...EXTRA_BRAND_MODELS,
  'vasita/otomobil': AUTOMOBILE_BRAND_MODELS
}

export const MODEL_SERIES: ModelSeriesMap = {
  'vasita/otomobil': AUTOMOBILE_MODEL_SERIES
}
export const SERIES_TRIMS: SeriesTrimsMap = {
  'vasita/otomobil': AUTOMOBILE_SERIES_TRIMS
}
export const SERIES_TRIMS_EX: SeriesTrimsMap = {}

export const PACKAGE_EQUIPMENT: SeriesTrimsMap = {
  'vasita/otomobil': AUTOMOBILE_TRIM_EQUIPMENTS
}

export const MODEL_SERIES_EXTRA: ModelSeriesMap = EXTRA_MODEL_SERIES
export const SERIES_TRIMS_EXTRA: SeriesTrimsMap = EXTRA_SERIES_TRIMS
