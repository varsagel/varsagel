import { AttrField } from './attribute-schemas'
import { EXTRA_BRAND_MODELS } from './extra-brands'

const BUILDING_ATTRIBUTES: AttrField[] = [
  { label: 'Oda Sayısı', key: 'odaSayisi', type: 'select', options: ['1+0','1+1','1.5+1','2+0','2+1','2.5+1','3+1','3.5+1','4+0','4+1','4+2','5+1','5+2','6+1','6+2','7+1','8+1','9+1','10+ Üzeri','Stüdyo','Loft'], required: true },
  { label: 'Bina Yaşı', type: 'range-number', minKey: 'binaYasiMin', maxKey: 'binaYasiMax' },
  { label: 'Bulunduğu Kat', key: 'bulunduguKat', type: 'select', options: ['Bodrum Kat','Zemin Kat','Bahçe Katı','Giriş Kat','Yüksek Giriş','Müstakil','Villa Tipi','Çatı Katı','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21 ve üzeri'] },
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
    { label: 'Silindir Hacmi (cc)', type: 'number', key: 'silindirHacmi' },
    { label: 'Tip', type: 'select', key: 'tip', options: ['Scooter','Naked','Enduro','Cross','Cruiser','Sport','Touring','Chopper','Commuter'] },
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/motosiklet'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket' },
  ],
  'vasita/elektrikli-araclar': [
    { label: 'Batarya Sağlığı (%)', type: 'number', key: 'bataryaSagligi' },
    { label: 'Menzil (km)', type: 'number', key: 'menzil' },
    { label: 'Şarj Tipi', type: 'select', key: 'sarjTipi', options: ['AC','DC'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Audi','BMW','BYD','Citroën','Hyundai','Lucid','Mercedes','MG','NIO','Nissan','Polestar','Renault','Rivian','Tesla','Togg','Volkswagen'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket' },
  ],
  'vasita/otomobil': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Abarth','Alfa Romeo','Alpine','Anadol','Aston Martin','Audi','Bentley','BMW','Buick','BYD','Cadillac','Chery','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Daewoo','Daihatsu','Dodge','DS Automobiles','Ferrari','Fiat','Fisker','Ford','Geely','GWM','Honda','Hyundai','Ikco','Infiniti','Jaguar','Jeep','Kia','Lada','Lamborghini','Lancia','Land Rover','Leapmotor','Lexus','Lincoln','Lotus','Maserati','Mazda','McLaren','Mercedes','Mercury','MG','Mini','Mitsubishi','Moskvich','Nissan','Oldsmobile','Opel','Peugeot','Plymouth','Polestar','Pontiac','Porsche','Proton','Renault','Rolls-Royce','Rover','Saab','Seat','Skoda','Smart','SsangYong','Subaru','Suzuki','Tata','Tesla','Tofaş','TOGG','Toyota','Volkswagen','Volvo','ZAZ'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Base','Comfort','Elegance','Premium','Sport','AMG Line','M Sport','S-Line','Trendline','Highline'] },
  ],
  'vasita/ticari-araclar': [
    { label: 'Yük Kapasitesi (kg)', type: 'number', key: 'yukKapasitesi' },
    { label: 'Belge Durumu', type: 'select', key: 'belgeDurumu', options: ['SRC','K Belgesi','Şirket','Bireysel'] },
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/minivan-panelvan'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/arazi-suv-pickup': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/arazi-suv-pickup'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Base','Comfort','Elegance','Premium','Sport'] },
  ],
  'vasita/kamyon-cekici': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/kamyon-cekici'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/otobus': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['BMC','Güleryüz','Isuzu','Karsan','MAN','Mercedes','Neoplan','Otokar','Scania','Setra','Temsa','Volvo'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/minivan-panelvan': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/minivan-panelvan'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/minibus-midibus': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['BMC','Citroën','Fiat','Ford','Gaz','Hyundai','Isuzu','Iveco','Karsan','Mercedes','Opel','Otokar','Peugeot','Renault','Toyota','Volkswagen'].sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/traktor': [
    { label: 'Marka', type: 'select', key: 'marka', options: Object.keys(EXTRA_BRAND_MODELS['vasita/traktor'] || {}).sort((a,b)=> a.localeCompare(b,'tr')) },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket' },
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
  ...EXTRA_BRAND_MODELS
}

export const MODEL_SERIES: ModelSeriesMap = {}
export const SERIES_TRIMS: SeriesTrimsMap = {}
export const SERIES_TRIMS_EX: SeriesTrimsMap = {}

export const MODEL_SERIES_EXTRA: ModelSeriesMap = EXTRA_MODEL_SERIES
export const SERIES_TRIMS_EXTRA: SeriesTrimsMap = EXTRA_SERIES_TRIMS
