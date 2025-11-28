import { AttrField } from './attribute-schemas'
import generatedAutomobil from './generated-automobil.json'

export const ATTR_SUBSCHEMAS: Record<string, AttrField[]> = {
  'emlak/kiralik-daire': [
    { label: 'Depozito', type: 'number', key: 'depozito' },
    { label: 'Kontrat Süresi (Ay)', type: 'number', key: 'kontratSuresi' },
  ],
  'emlak/satilik-daire': [
    { label: 'Takaslı', type: 'boolean', key: 'takasli' },
  ],
  'vasita/motosiklet': [
    { label: 'Silindir Hacmi (cc)', type: 'number', key: 'silindirHacmi' },
    { label: 'Tip', type: 'select', key: 'tip', options: ['Scooter','Naked','Enduro','Cross','Cruiser','Sport'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Yamaha','Honda','Suzuki','Kawasaki','KTM','Ducati','BMW','Triumph','Harley-Davidson','Aprilia','Benelli','CFMOTO','SYM','Kymco','Husqvarna','Piaggio'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'vasita/elektrikli-arac': [
    { label: 'Batarya Sağlığı (%)', type: 'number', key: 'bataryaSagligi' },
    { label: 'Menzil (km)', type: 'number', key: 'menzil' },
    { label: 'Şarj Tipi', type: 'select', key: 'sarjTipi', options: ['AC','DC'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Tesla','Renault','Nissan','Hyundai','BMW','Mercedes','Volkswagen','Audi','BYD','MG','NIO','Rivian','Polestar','Lucid'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'vasita/otomobil': [
    { label: 'Motor Gücü (HP)', type: 'number', key: 'motorGucu' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['BMW','Mercedes','Audi','Volkswagen','Renault','Peugeot','Citroën','Toyota','Honda','Hyundai','Kia','Ford','Fiat','Opel','Skoda','Volvo','Nissan','Seat','Alfa Romeo','Subaru','Mazda','Mini','Land Rover','Porsche','Jaguar','Bentley','Rolls-Royce','Aston Martin','Ferrari','Lamborghini','Maserati','Dacia','Tesla','BYD','Chery','MG','Geely','GWM','SsangYong','Jeep','Mitsubishi','TOGG','Chevrolet','Chrysler','Dodge','Infiniti','Cadillac','Lincoln','Proton','Rover'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Base','Comfort','Elegance','Premium','Sport','AMG Line','M Sport','S-Line','Trendline','Highline'] },
  ],
  'vasita/ticari-arac': [
    { label: 'Yük Kapasitesi (kg)', type: 'number', key: 'yukKapasitesi' },
    { label: 'Belge Durumu', type: 'select', key: 'belgeDurumu', options: ['SRC','K Belgesi','Şirket','Bireysel'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Ford','Fiat','Mercedes','Volkswagen','Peugeot','Citroën','Renault','Iveco','Opel','Nissan','MAN','Scania','DAF','Volvo'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/suv-pickup': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Toyota','Ford','Nissan','Volkswagen','Mitsubishi','Isuzu','Mercedes','Jeep','Land Rover','Subaru','Chevrolet','Dodge'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Base','Comfort','Elegance','Premium','Sport'] },
  ],
  'vasita/kamyon': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Mercedes','MAN','Scania','Volvo','DAF','Iveco','Ford','Renault'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/otobus': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Mercedes','MAN','Neoplan','Temsa','Otokar','Setra'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/minibus': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Ford','Mercedes','Volkswagen','Iveco','Renault','Peugeot','Citroën'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
    { label: 'Donanım/Paket', type: 'select', key: 'paket', options: ['Standart','Konfor','Lüks'] },
  ],
  'vasita/traktor': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['John Deere','New Holland','Massey Ferguson','Case IH','Kubota','Deutz-Fahr'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Motor/Seri', type: 'select', key: 'seri' },
  ],
  'alisveris/cep-telefonu': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Apple','Samsung','Xiaomi','Huawei','Oppo','Vivo','Realme','OnePlus','Nokia','General Mobile'] },
    { label: 'Model', type: 'select', key: 'model' },
    { label: 'Depolama (GB)', type: 'number', key: 'depolama' },
    { label: 'RAM (GB)', type: 'number', key: 'ram' },
    { label: 'Renk', type: 'text', key: 'renk' },
    { label: 'Garanti', type: 'boolean', key: 'garanti' },
    { label: 'Durum', type: 'select', key: 'durum', options: ['Sıfır','İkinci El'] },
  ],
  'alisveris/bilgisayar': [
    { label: 'İşlemci', type: 'text', key: 'cpu' },
    { label: 'RAM (GB)', type: 'number', key: 'ram' },
    { label: 'Depolama (GB)', type: 'number', key: 'depolama' },
    { label: 'Ekran Boyutu (inch)', type: 'number', key: 'ekranBoyutu' },
    { label: 'Ekran Kartı', type: 'text', key: 'gpu' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Apple','Dell','HP','Lenovo','Asus','Acer','MSI'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/beyaz-esya': [
    { label: 'Enerji Sınıfı', type: 'select', key: 'enerjiSinifi', options: ['A+++','A++','A+','A','B','C'] },
    { label: 'Garanti', type: 'boolean', key: 'garanti' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Arçelik','Beko','Vestel','Bosch','Siemens','Samsung','LG','Profilo'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/mobilya': [
    { label: 'Malzeme', type: 'text', key: 'malzeme' },
    { label: 'Renk', type: 'text', key: 'renk' },
    { label: 'Ölçü', type: 'text', key: 'olcu' },
    { label: 'Durum', type: 'select', key: 'durum', options: ['Sıfır','İkinci El'] },
  ],
  'alisveris/televizyon': [
    { label: 'Ekran Boyutu (inch)', type: 'number', key: 'ekranBoyutu' },
    { label: 'Çözünürlük', type: 'select', key: 'cozunurluk', options: ['HD','Full HD','2K','4K','8K'] },
    { label: 'Smart TV', type: 'boolean', key: 'smartTv' },
    { label: 'HDR', type: 'boolean', key: 'hdr' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Samsung','LG','Sony','Philips','Vestel','Toshiba'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/fotograf-makinesi': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Canon','Nikon','Sony','Fujifilm','Panasonic','Olympus'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/oyun-konsolu': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Sony','Microsoft','Nintendo'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/kucuk-ev-aletleri': [
    { label: 'Marka', type: 'select', key: 'marka', options: ['Philips','Arçelik','Bosch','Tefal','Fakir','Xiaomi'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/tablet': [
    { label: 'Ekran Boyutu (inch)', type: 'number', key: 'ekranBoyutu' },
    { label: 'Depolama (GB)', type: 'number', key: 'depolama' },
    { label: 'RAM (GB)', type: 'number', key: 'ram' },
    { label: 'Renk', type: 'text', key: 'renk' },
    { label: 'Hücresel', type: 'boolean', key: 'hucresel' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Apple','Samsung','Huawei','Lenovo','Xiaomi'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'alisveris/akilli-saat': [
    { label: 'Kasa Boyutu (mm)', type: 'number', key: 'kasaBoyutu' },
    { label: 'GPS', type: 'boolean', key: 'gps' },
    { label: 'Su Geçirmezlik', type: 'select', key: 'suGecirmezlik', options: ['Yok','IP67','IP68','5ATM','10ATM'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Apple','Samsung','Huawei','Xiaomi','Garmin','Suunto'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'is-makineleri-sanayi/forklift': [
    { label: 'Kapasite (kg)', type: 'number', key: 'kapasite' },
    { label: 'Yakıt', type: 'select', key: 'yakit', options: ['Elektrik','Dizel','LPG'] },
    { label: 'Direk Yüksekliği (m)', type: 'number', key: 'direkYuksekligi' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Toyota','Jungheinrich','Linde','Hyster','Yale','Crown'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'is-makineleri-sanayi/kompresor': [
    { label: 'Debi (m³/min)', type: 'number', key: 'debi' },
    { label: 'Basınç (bar)', type: 'number', key: 'basinc' },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Atlas Copco','Kaeser','Ingersoll Rand','Fini','Ekomak'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'is-makineleri-sanayi/jenerator': [
    { label: 'Güç (kVA)', type: 'number', key: 'gucKva' },
    { label: 'Yakıt', type: 'select', key: 'yakit', options: ['Dizel','Benzin','Doğal Gaz'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Caterpillar','Perkins','Cummins','Honda','Aksa'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'is-makineleri-sanayi/kaynak-makinesi': [
    { label: 'Kaynak Türü', type: 'select', key: 'kaynakTuru', options: ['MIG/MAG','TIG','Ark'] },
    { label: 'Marka', type: 'select', key: 'marka', options: ['Lincoln Electric','ESAB','Kemppi','Migatronic','Fronius'] },
    { label: 'Model', type: 'select', key: 'model' },
  ],
  'is-makineleri-sanayi/traktor': [
    { label: 'Güç (HP)', type: 'number', key: 'gucHp' },
    { label: 'Çekiş', type: 'select', key: 'cekis', options: ['4x2','4x4'] },
    { label: 'Kabini Var', type: 'boolean', key: 'kabiniVar' },
  ],
  'is-ilanlari/tam-zamanli': [
    { label: 'Pozisyon', type: 'text', key: 'pozisyon' },
    { label: 'Seviye', type: 'select', key: 'seviye', options: ['Junior','Mid','Senior','Lead'] },
    { label: 'Sektör', type: 'text', key: 'sektor' },
  ],
  'is-ilanlari/uzaktan': [
    { label: 'Zaman Dilimi', type: 'select', key: 'zamanDilimi', options: ['GMT+3','GMT+2','GMT+1','GMT','GMT-3'] },
    { label: 'Esnek Saatler', type: 'boolean', key: 'esnekSaatler' },
  ],
  'hayvanlar-alemi/evcil-hayvan': [
    { label: 'Tür', type: 'text', key: 'tur' },
    { label: 'Irk', type: 'text', key: 'irk' },
    { label: 'Aşılı', type: 'boolean', key: 'asili' },
  ],
  'hayvanlar-alemi/kedi': [
    { label: 'Kısır', type: 'boolean', key: 'kisir' },
    { label: 'Tuvalet Eğitimi', type: 'boolean', key: 'tuvaletEgitimi' },
    { label: 'Pedigri', type: 'boolean', key: 'pedigri' },
  ],
}

export const BRAND_MODELS: Record<string, Record<string, string[]>> = {
  'vasita/otomobil': {
    BMW: ['1 Serisi','2 Serisi','3 Serisi','4 Serisi','5 Serisi','X1','X3','X5','X6','M3','M4','M5'],
    Mercedes: ['A-Serisi','C-Serisi','E-Serisi','S-Serisi','GLA','GLB','GLC','GLE','GLS','CLA','CLA Shooting Brake'],
    Audi: ['A1','A3','A4','A5','A6','Q2','Q3','Q5','Q7','Q8'],
    Volkswagen: ['Golf','Polo','Passat','Arteon','Tiguan','T-Cross','Touareg','Jetta','Passat Variant','Golf Variant'],
    Renault: ['Clio','Megane','Symbol','Captur','Kadjar','Talisman','Fluence','Latitude','Taliant'],
    Peugeot: ['208','308','3008','2008','408','508'],
    Citroën: ['C3','C4','C5 Aircross','C3 Aircross'],
    Toyota: ['Corolla','Corolla HB','Avensis','Auris','Camry','Yaris','C-HR','RAV4','Supra'],
    Honda: ['Civic','Accord','Jazz','HR-V','CR-V'],
    Hyundai: ['i10','i20','i30','Elantra','Bayon','Kona','Tucson','Santa Fe'],
    Kia: ['Picanto','Rio','Ceed','Stonic','Stinger','Sportage','Sorento'],
    Ford: ['Fiesta','Focus','Focus HB','Focus Sedan','Focus ST','Mondeo','Mustang','Kuga','Puma'],
    Fiat: ['Egea','500','Panda','Bravo','Tipo HB','Linea','Doblo'],
    Opel: ['Corsa','Astra','Insignia','Zafira','Crossland','Grandland','Mokka'],
    Skoda: ['Fabia','Scala','Octavia','Superb','Rapid','Kamiq','Karoq','Kodiaq'],
    Volvo: ['S60','V60','S90','XC40','XC60','XC90'],
    Nissan: ['Micra','Note','Qashqai','X-Trail','Juke','Leaf'],
    Seat: ['Ibiza','Leon','Ateca','Arona','Toledo'],
    'Alfa Romeo': ['Giulia','Giulietta','Stelvio','Tonale'],
    Tesla: ['Model 3','Model S','Model X','Model Y'],
    Subaru: ['Impreza','Legacy','XV','Forester','Outback'],
    Mazda: ['Mazda3','Mazda6','CX-30','CX-5','MX-5'],
    Mini: ['Cooper','Clubman','Countryman','Paceman'],
    'Land Rover': ['Discovery','Defender','Range Rover','Range Rover Evoque','Range Rover Sport'],
    Porsche: ['911','Panamera','Macan','Cayenne','Cayman'],
    Jaguar: ['XE','XF','F-Pace','F-Type'],
    Jeep: ['Renegade','Compass','Cherokee','Grand Cherokee','Wrangler'],
    Mitsubishi: ['Lancer','Attrage','ASX','Eclipse Cross'],
    TOGG: ['T10X'],
    Cupra: ['Formentor','Ateca','Leon'],
    Smart: ['Fortwo','Forfour'],
    Bentley: ['Continental GT','Flying Spur'],
    'Rolls-Royce': ['Phantom','Ghost','Cullinan'],
    'Aston Martin': ['DB11','Vantage','DBX'],
    Ferrari: ['488','F8','Roma','Portofino'],
    Lamborghini: ['Huracán','Aventador','Urus'],
    Maserati: ['Ghibli','Quattroporte','Levante'],
    Dacia: ['Duster','Sandero','Logan'],
    BYD: ['Atto 3','Han','Tang','Seal'],
    Chery: ['Tiggo 7','Tiggo 8','Arrizo 5'],
    MG: ['ZS','HS','MG4','MG5'],
    Geely: ['Coolray','Azkarra'],
    GWM: ['Haval H6','Poer'],
    SsangYong: ['Tivoli','Korando','Rexton'],
    Chevrolet: ['Spark','Aveo','Cruze','Malibu','Captiva','Camaro'],
    Chrysler: ['300C','Sebring','PT Cruiser'],
    Dodge: ['Charger','Challenger','Journey','Nitro'],
    Infiniti: ['Q50','Q60','QX50','QX70'],
    Cadillac: ['CTS','ATS','Escalade'],
    Lincoln: ['MKZ','Navigator'],
    Proton: ['Gen-2','Persona','Saga'],
    Rover: ['75','45','25'],
    Lexus: ['IS','NX'],
    'DS Automobiles': ['DS 7 Crossback'],
    Lada: ['Vesta'],
    Lotus: ['Evora'],
    Polestar: ['2'],
  },
  'alisveris/cep-telefonu': {
    Apple: ['iPhone 11','iPhone 12','iPhone 13','iPhone 14','iPhone 15'],
    Samsung: ['Galaxy S21','Galaxy S22','Galaxy S23','Galaxy A52','Galaxy A53'],
    Xiaomi: ['Mi 11','Mi 12','Redmi Note 10','Redmi Note 11'],
    Huawei: ['P30','P40','P50','Mate 40'],
    Oppo: ['Find X3','Reno 6','Reno 7'],
    Vivo: ['V21','V23','X60','X70'],
    Realme: ['8','9','GT'],
    OnePlus: ['8','9','10','Nord'],
    Nokia: ['5.4','G20','X20'],
    'General Mobile': ['GM 20','GM 21','GM 22'],
  },
  'alisveris/bilgisayar': {
    Apple: ['MacBook Air','MacBook Pro'],
    Dell: ['XPS 13','XPS 15','Inspiron'],
    HP: ['Spectre','Envy','Pavilion'],
    Lenovo: ['ThinkPad X1','Yoga','IdeaPad'],
    Asus: ['ZenBook','ROG Strix','TUF Gaming'],
    Acer: ['Swift','Nitro','Aspire'],
    MSI: ['Stealth','Raider','Modern'],
  },
  'alisveris/televizyon': {
    Samsung: ['QLED Q70','Crystal UHD','Neo QLED'],
    LG: ['OLED C1','NanoCell','UHD'],
    Sony: ['Bravia X80','Bravia X90','Bravia A80'],
    Philips: ['Ambilight 7300','Ambilight 8500'],
    Vestel: ['Ultra HD','Smart 4K'],
    Toshiba: ['UHD Smart','Full HD Smart'],
  },
  'alisveris/tablet': {
    Apple: ['iPad 9','iPad Air','iPad Pro','iPad mini'],
    Samsung: ['Galaxy Tab S8','Galaxy Tab A8'],
    Huawei: ['MatePad 11','MatePad Pro'],
    Lenovo: ['Tab P11','Tab M10'],
    Xiaomi: ['Pad 5','Pad 6'],
  },
  'alisveris/akilli-saat': {
    Apple: ['Watch SE','Watch Series 8','Watch Ultra'],
    Samsung: ['Galaxy Watch 4','Galaxy Watch 5'],
    Huawei: ['Watch GT 3','Watch Fit'],
    Xiaomi: ['Mi Watch','Redmi Watch'],
    Garmin: ['Fenix 7','Forerunner 955','Venu 2'],
    Suunto: ['9 Peak','5 Peak'],
  },
  'alisveris/beyaz-esya': {
    'Arçelik': ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi','Fırın'],
    Beko: ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi','Fırın'],
    Vestel: ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi','Fırın'],
    Bosch: ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi','Fırın'],
    Siemens: ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi','Fırın'],
    Samsung: ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi'],
    LG: ['Buzdolabı','Çamaşır Makinesi'],
    Profilo: ['Buzdolabı','Çamaşır Makinesi','Bulaşık Makinesi'],
  },
  'vasita/motosiklet': {
    Yamaha: ['MT-07','MT-09','YZF-R3','YZF-R6','Tracer 900','XSR700'],
    Honda: ['CB500F','CBR500R','Africa Twin','CB650R','CB125F'],
    Suzuki: ['GSX-S750','GSX-S1000','GSX-R600','V-Strom 650'],
    Kawasaki: ['Z650','Z900','Z1000','Ninja 650','Ninja 400'],
    KTM: ['Duke 390','Duke 690','Duke 890','Adventure 790','Adventure 890'],
    Ducati: ['Monster 821','Panigale V2','Diavel','Scrambler Icon'],
    BMW: ['F 900 R','S 1000 RR','R nineT','R 1250 GS'],
    Triumph: ['Street Triple','Tiger 900','Tiger 1200','Bonneville T120'],
    'Harley-Davidson': ['Sportster','Street 750','Softail','Fat Boy'],
    Aprilia: ['Tuono 660','RS 660','Shiver 750'],
    Benelli: ['TRK 502','Leoncino 500','302S'],
    CFMOTO: ['300NK','650NK','800MT'],
    SYM: ['Joyride','Cruisym','Fiddle'],
    Kymco: ['Xciting 400','Downtown 350','Like 200'],
    Husqvarna: ['Vitpilen 701','Svartpilen 401','Norden 901'],
    Piaggio: ['Medley 150','Beverly 300','Liberty 125'],
  },
  'vasita/ticari-arac': {
    Ford: ['Transit','Transit Custom','Transit Courier','Ranger Van'],
    Fiat: ['Ducato','Fiorino','Doblo Cargo'],
    Mercedes: ['Sprinter','Vito','Citan'],
    Volkswagen: ['Crafter','Transporter','Caddy','Caddy Cargo'],
    Peugeot: ['Boxer','Expert','Partner'],
    Citroën: ['Jumper','Jumpy','Berlingo','Berlingo Van'],
    Renault: ['Master','Trafic','Kangoo'],
    Iveco: ['Daily'],
    MAN: ['TGE'],
    Scania: ['P-Series'],
    DAF: ['LF'],
    Volvo: ['FH','FL'],
    Opel: ['Combo Cargo','Vivaro'],
    Nissan: ['NV200','NV300'],
  },
  'vasita/elektrikli-arac': {
    Tesla: ['Model 3','Model Y','Model S','Model X'],
    Renault: ['Zoe','Megane E-Tech'],
    Nissan: ['Leaf'],
    Hyundai: ['Ioniq 5','Kona EV'],
    BMW: ['i3','i4'],
    Mercedes: ['EQC','EQA'],
    Volkswagen: ['ID.3','ID.4'],
    Audi: ['e-tron','Q8 e-tron'],
    BYD: ['Atto 3','Han'],
    MG: ['MG4','ZS EV'],
    NIO: ['ES6','ET7','EC7'],
    Rivian: ['R1T','R1S'],
    Polestar: ['2','3'],
    Lucid: ['Air','Gravity'],
  },
  'vasita/suv-pickup': {
    Toyota: ['RAV4','Hilux','Land Cruiser','Fortuner'],
    Ford: ['Kuga','Edge','Ranger','Bronco'],
    Nissan: ['Qashqai','X-Trail','Navara','Patrol'],
    Volkswagen: ['Tiguan','Amarok','T-Roc','Touareg'],
    Mitsubishi: ['Outlander','L200','Pajero'],
    Isuzu: ['D-Max'],
    Mercedes: ['GLB','GLC','GLE'],
    Jeep: ['Compass','Cherokee','Grand Cherokee','Wrangler'],
    'Land Rover': ['Discovery','Defender','Range Rover Sport'],
    Subaru: ['Forester','Outback'],
    Chevrolet: ['Trailblazer','Tahoe','Suburban'],
    Dodge: ['Durango','Ram 1500'],
  },
  'vasita/kamyon': {
    Mercedes: ['Actros','Axor','Arocs','Atego'],
    MAN: ['TGX','TGS'],
    Scania: ['R-Series','S-Series'],
    Volvo: ['FH','FH16','FM'],
    DAF: ['XF','CF','LF'],
    Iveco: ['Stralis','S-Way'],
    Ford: ['F-MAX'],
    Renault: ['T-Series'],
  },
  'vasita/otobus': {
    Mercedes: ['Travego','Tourismo'],
    MAN: ["Lion's Coach","Lion's City"],
    Neoplan: ['Tourliner','Cityliner','Skyliner'],
    Temsa: ['Safir','HD','Maraton','Prestij'],
    Otokar: ['Navigo','Doruk','Sultan','Kent'],
    Setra: ['S 415','S 515','S 517'],
  },
  'vasita/minibus': {
    Ford: ['Transit Minibus','Tourneo'],
    Mercedes: ['Sprinter Minibus'],
    Volkswagen: ['Crafter Minibus'],
    Iveco: ['Daily Minibus'],
    Renault: ['Trafic Passenger'],
    Peugeot: ['Boxer Minibus'],
    Citroën: ['Jumper Minibus'],
  },
  'vasita/traktor': {
    'John Deere': ['5E','6M'],
    'New Holland': ['T4','T5'],
    'Massey Ferguson': ['MF 4700','MF 5700'],
    'Case IH': ['Farmall','Maxxum'],
    Kubota: ['M Series'],
    'Deutz-Fahr': ['Agrotron'],
  },
  'alisveris/fotograf-makinesi': {
    Canon: ['EOS 90D','EOS R6'],
    Nikon: ['D7500','Z6'],
    Sony: ['Alpha A7 III','A6400'],
    Fujifilm: ['X-T4','X-S10'],
    Panasonic: ['Lumix GH5','G9'],
    Olympus: ['OM-D E-M10','E-M5'],
  },
  'alisveris/oyun-konsolu': {
    Sony: ['PlayStation 5','PlayStation 4'],
    Microsoft: ['Xbox Series X','Xbox Series S','Xbox One'],
    Nintendo: ['Switch OLED','Switch Lite'],
  },
  'alisveris/kucuk-ev-aletleri': {
    Philips: ['Airfryer','Avent'],
    'Arçelik': ['Kahve Makinesi','Blender'],
    Bosch: ['Blender','Toaster'],
    Tefal: ['Fryer','Blender'],
    Fakir: ['Blender','Süpürge'],
    Xiaomi: ['Mi Vacuum','Mi Air Purifier'],
  },
  'is-makineleri-sanayi/kompresor': {
    'Atlas Copco': ['GA','GX'],
    Kaeser: ['SK','ASD'],
    'Ingersoll Rand': ['R Series'],
    Fini: ['MK'],
    Ekomak: ['EG'],
  },
  'is-makineleri-sanayi/jenerator': {
    Caterpillar: ['CAT C Series'],
    Perkins: ['Diesel Series'],
    Cummins: ['QSK','QSX'],
    Honda: ['EU Series'],
    Aksa: ['AJ'],
  },
  'is-makineleri-sanayi/kaynak-makinesi': {
    'Lincoln Electric': ['Power MIG'],
    ESAB: ['Warrior'],
    Kemppi: ['FastMig'],
    Migatronic: ['Sigma'],
    Fronius: ['TransSteel'],
  },
};

export const EXTRA_BRANDS_AUTOMOBIL: string[] = [
  'Abarth','Aion','Alfa Romeo','Alpine','Anadol','Aston Martin','Audi','Bentley','BMW','Buick','BYD','Cadillac','Chery','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Daewoo','Daihatsu','Dodge','DS Automobiles','Eagle','Ferrari','Fiat','Ford','Geely','Honda','Hyundai','Infiniti','Jaguar','Kia','Lada','Lamborghini','Lancia','Leapmotor','Lexus','Lincoln','Lotus','Maserati','Mazda','McLaren','Mercedes','MG','Mini','Mitsubishi','Nissan','Opel','Peugeot','Plymouth','Polestar','Pontiac','Porsche','Proton','Renault','Rolls-Royce','Rover','Saab','Seat','Skoda','Smart','Subaru','Suzuki','Tata','Tesla','The London Taxi','Tofaş','TOGG','Toyota','Vanderhall','Volkswagen','Volvo','XEV','ZAZ'
];

export const MODEL_SERIES: Record<string, Record<string, Record<string, string[]>>> = {
  'vasita/otomobil': {
    Opel: {
      Corsa: ['1.3 CDTI','1.4 16V','1.2'],
      Astra: ['1.6 CDTI','1.4 Turbo','1.6']
    },
    Toyota: {
      Corolla: ['1.6','1.33','1.4 D-4D']
    },
    Ford: {
      Focus: ['1.6 TDCi','1.0 EcoBoost','1.5 EcoBoost']
    },
    Volkswagen: {
      Golf: ['1.6 TDI','1.4 TSI','1.0 TSI'],
      Passat: ['1.6 TDI','2.0 TDI']
    },
    Renault: {
      Megane: ['1.5 dCi','1.6','1.3 TCe']
    },
    Mercedes: {
      'C-Serisi': ['C 200 d','C 180'],
      'E-Serisi': ['E 220 d','E 200']
    },
    BMW: {
      '3 Serisi': ['316i','320i','320d'],
      '5 Serisi': ['520d','530i']
    },
    Audi: {
      A4: ['2.0 TFSI','2.0 TDI'],
      A6: ['2.0 TDI']
    },
    Peugeot: {
      '3008': ['1.5 BlueHDi','1.6 PureTech'],
      '308': ['1.2 PureTech','1.5 BlueHDi']
    },
    'Citroën': {
      'C5 Aircross': ['1.5 BlueHDi','1.6 PureTech'],
      C4: ['1.2 PureTech','1.5 BlueHDi']
    },
    Fiat: {
      Egea: ['1.3 Multijet','1.6 Multijet','1.4 Fire']
    },
    Hyundai: {
      i20: ['1.4 MPI','1.0 T-GDI'],
      Tucson: ['1.6 T-GDI','1.6 CRDi']
    },
    Kia: {
      Ceed: ['1.0 T-GDI','1.6 CRDi'],
      Sportage: ['1.6 T-GDI','1.6 CRDi']
    },
    Nissan: {
      Qashqai: ['1.3 DIG-T','1.5 dCi']
    },
    Skoda: {
      Octavia: ['1.6 TDI','1.5 TSI'],
      Superb: ['1.5 TSI','2.0 TDI']
    },
    Volvo: {
      XC60: ['B4','D4']
    },
    'Alfa Romeo': {
      Giulia: ['2.0 Turbo','2.2 JTDm'],
      Giulietta: ['1.6 JTDM','1.4 TB']
    },
    Lexus: {
      IS: ['300h'],
      NX: ['300h']
    },
    Jaguar: {
      'F-Pace': ['2.0 Ingenium']
    },
    Subaru: {
      Impreza: ['1.6'],
      Forester: ['2.0','2.0 e-Boxer']
    },
    Suzuki: {
      Vitara: ['1.6','1.4 Boosterjet'],
      SX4: ['1.6']
    },
    Tesla: {
      'Model 3': ['SR+','LR'],
      'Model S': ['LR']
    },
    Seat: {
      Leon: ['1.5 TSI','1.6 TDI'],
      Ateca: ['1.5 TSI']
    },
    Bentley: {
      'Continental GT': ['V8','W12'],
      'Flying Spur': ['V8','W12']
    },
    'Rolls-Royce': {
      Phantom: ['V12'],
      Ghost: ['V12'],
      Cullinan: ['V12']
    },
    'Aston Martin': {
      DB11: ['V8','V12'],
      Vantage: ['V8'],
      DBX: ['V8']
    },
    Ferrari: {
      '488': ['GTB'],
      'F8': ['Tributo'],
      Roma: ['3.9'],
      Portofino: ['M']
    },
    Lamborghini: {
      Huracán: ['V10'],
      Aventador: ['V12'],
      Urus: ['4.0']
    },
    Maserati: {
      Ghibli: ['2.0','3.0'],
      Quattroporte: ['3.0'],
      Levante: ['2.0','3.0']
    },
    Dacia: {
      Duster: ['1.5 dCi','1.3 TCe'],
      Sandero: ['1.0 TCe'],
      Logan: ['1.0']
    },
    BYD: {
      'Atto 3': ['EV60'],
      Han: ['EV']
    },
    Chery: {
      'Tiggo 7': ['1.5T'],
      'Tiggo 8': ['1.6T']
    },
    MG: {
      ZS: ['1.0 T-GDI'],
      HS: ['1.5T']
    },
    Geely: {
      Coolray: ['1.5T']
    },
    GWM: {
      'Haval H6': ['1.5T']
    },
    Chevrolet: {
      Cruze: ['1.6','1.4T'],
      Malibu: ['2.0'],
      Camaro: ['3.6']
    },
    Chrysler: {
      '300C': ['3.6']
    },
    Dodge: {
      Charger: ['3.6','5.7'],
      Challenger: ['3.6','5.7']
    },
    Cadillac: {
      CTS: ['2.0T'],
      ATS: ['2.0T'],
      Escalade: ['6.2']
    },
    Lincoln: {
      MKZ: ['2.0T'],
      Navigator: ['3.5T']
    },
    'DS Automobiles': {
      'DS 7 Crossback': ['1.5 BlueHDi','1.6 PureTech']
    },
    Polestar: {
      '2': ['Long Range']
    },
    Lada: {
      Vesta: ['1.6']
    },
    Lotus: {
      Evora: ['3.5']
    }
  },
  'vasita/suv-pickup': {
    Toyota: { Hilux: ['2.8 D','2.4 D'] },
    Ford: { Ranger: ['2.0 EcoBlue','3.2 TDCi'] },
    Nissan: { Navara: ['2.3 dCi'] },
    Volkswagen: { Amarok: ['3.0 V6 TDI','2.0 TDI'] }
  },
  'vasita/ticari-arac': {
    Ford: { Transit: ['2.2 TDCi','2.0 EcoBlue'] },
    Volkswagen: { Transporter: ['2.0 TDI'] },
    Renault: { Trafic: ['1.6 dCi','2.0 dCi'] }
  },
  'vasita/kamyon': {
    Mercedes: { Actros: ['1845','2545'] },
    Volvo: { FH: ['460','500'] },
    DAF: { XF: ['480','530'] }
  },
  'vasita/otobus': {
    Mercedes: { Travego: ['15 SHD','16 SHD'] },
    MAN: { "Lion's Coach": ['C12','C13'] },
    Temsa: { Safir: ['12','13'] }
  },
  'vasita/minibus': {
    Ford: { 'Transit Minibus': ['2.2 TDCi','2.0 EcoBlue'] },
    Mercedes: { 'Sprinter Minibus': ['2.2 CDI'] },
    Volkswagen: { 'Crafter Minibus': ['2.0 TDI'] }
  },
  'vasita/traktor': {
    'John Deere': { '5E': ['5083E','5090E'] },
    'New Holland': { T4: ['T4.75','T4.85'] }
  }
};

export const SERIES_TRIMS: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {
  'vasita/otomobil': {
    Opel: {
      Corsa: {
        '1.3 CDTI': ['Active','Essentia','Enjoy','Cosmo']
      },
      Astra: {
        '1.6 CDTI': ['Enjoy','Dynamic','Excellence'],
        '1.4 Turbo': ['Enjoy','Dynamic'],
        '1.6': ['Enjoy']
      }
    },
    Mercedes: {
      'C-Serisi': {
        'C 200 d': ['AMG Line','Avantgarde'],
        'C 180': ['AMG Line','Avantgarde']
      },
      'E-Serisi': {
        'E 220 d': ['Exclusive','AMG Line'],
        'E 200': ['Exclusive','AMG Line']
      }
    },
    BMW: {
      '3 Serisi': {
        '320i': ['M Sport','Luxury'],
        '320d': ['M Sport','Luxury'],
        '316i': ['Base','Comfort']
      },
      '5 Serisi': {
        '520d': ['M Sport','Luxury'],
        '530i': ['M Sport','Luxury']
      }
    },
    Audi: {
      A4: {
        '2.0 TFSI': ['S-Line','Advanced'],
        '2.0 TDI': ['S-Line','Advanced']
      },
      A6: {
        '2.0 TDI': ['S-Line','Advanced']
      }
    },
    Ford: {
      Focus: {
        '1.6 TDCi': ['Trend','Titanium'],
        '1.0 EcoBoost': ['Trend','Titanium']
      }
    },
    Volkswagen: {
      Golf: {
        '1.6 TDI': ['Trendline','Comfortline','Highline']
      },
      Passat: {
        '1.6 TDI': ['Trendline','Comfortline','Highline'],
        '2.0 TDI': ['Trendline','Comfortline','Highline']
      }
    },
    Renault: {
      Megane: {
        '1.5 dCi': ['Joy','Touch','Icon']
      }
    },
    Peugeot: {
      '3008': {
        '1.5 BlueHDi': ['Active','Allure','GT'],
        '1.6 PureTech': ['Active','Allure','GT']
      },
      '308': {
        '1.2 PureTech': ['Active','Allure','GT'],
        '1.5 BlueHDi': ['Active','Allure','GT']
      }
    },
    'Citroën': {
      'C5 Aircross': {
        '1.5 BlueHDi': ['Feel','Shine'],
        '1.6 PureTech': ['Feel','Shine']
      },
      C4: {
        '1.2 PureTech': ['Feel','Shine'],
        '1.5 BlueHDi': ['Feel','Shine']
      }
    },
    Fiat: {
      Egea: {
        '1.3 Multijet': ['Easy','Urban','Lounge'],
        '1.6 Multijet': ['Easy','Urban','Lounge'],
        '1.4 Fire': ['Easy','Urban']
      }
    },
    Hyundai: {
      i20: {
        '1.4 MPI': ['Style','Elite'],
        '1.0 T-GDI': ['Style','Elite']
      },
      Tucson: {
        '1.6 T-GDI': ['Prime','Elite'],
        '1.6 CRDi': ['Prime','Elite']
      }
    },
    Kia: {
      Ceed: {
        '1.0 T-GDI': ['Prestige','GT-Line'],
        '1.6 CRDi': ['Prestige','GT-Line']
      },
      Sportage: {
        '1.6 T-GDI': ['Prestige','GT-Line'],
        '1.6 CRDi': ['Prestige']
      }
    },
    Nissan: {
      Qashqai: {
        '1.3 DIG-T': ['Tekna','Platinum'],
        '1.5 dCi': ['Tekna','Platinum']
      }
    },
    Skoda: {
      Octavia: {
        '1.6 TDI': ['Ambition','Style'],
        '1.5 TSI': ['Ambition','Style']
      },
      Superb: {
        '1.5 TSI': ['Ambition','Style'],
        '2.0 TDI': ['Ambition','Style']
      }
    },
    Volvo: {
      XC60: {
        B4: ['Momentum','Inscription'],
        D4: ['Momentum','Inscription']
      }
    },
    Toyota: {
      Corolla: {
        '1.6': ['Base','Comfort','Elegant'],
        '1.33': ['Base','Comfort'],
        '1.4 D-4D': ['Base','Comfort','Elegant']
      }
    },
    'Alfa Romeo': {
      Giulia: {
        '2.0 Turbo': ['Super','Veloce'],
        '2.2 JTDm': ['Super']
      },
      Giulietta: {
        '1.6 JTDM': ['Distinctive','Sprint'],
        '1.4 TB': ['Distinctive']
      }
    },
    Lexus: {
      IS: {
        '300h': ['F-Sport','Executive']
      },
      NX: {
        '300h': ['F-Sport','Executive']
      }
    },
    Jaguar: {
      'F-Pace': {
        '2.0 Ingenium': ['R-Dynamic','Prestige']
      }
    },
    Subaru: {
      Impreza: {
        '1.6': ['Premium','Sport']
      }
    },
    Suzuki: {
      Vitara: {
        '1.6': ['GL','GL+','GLX'],
        '1.4 Boosterjet': ['GL+','GLX']
      },
      SX4: {
        '1.6': ['GL','GLX']
      }
    },
    Tesla: {
      'Model 3': {
        'SR+': ['Standard'],
        'LR': ['Standard']
      },
      'Model S': {
        'LR': ['Standard']
      }
    },
    Seat: {
      Leon: {
        '1.5 TSI': ['FR','Style'],
        '1.6 TDI': ['FR','Style']
      },
      Ateca: {
        '1.5 TSI': ['FR','Style']
      }
    },
    Bentley: {
      'Continental GT': {
        V8: ['Mulliner'],
        W12: ['Mulliner']
      },
      'Flying Spur': {
        V8: ['Mulliner'],
        W12: ['Mulliner']
      }
    },
    'Rolls-Royce': {
      Phantom: {
        V12: ['Black Badge','Standard']
      },
      Ghost: {
        V12: ['Black Badge','Standard']
      },
      Cullinan: {
        V12: ['Black Badge','Standard']
      }
    },
    'Aston Martin': {
      DB11: {
        V8: ['Base'],
        V12: ['Base']
      },
      Vantage: {
        V8: ['Base']
      },
      DBX: {
        V8: ['Base']
      }
    },
    Ferrari: {
      '488': {
        GTB: ['Base']
      },
      'F8': {
        Tributo: ['Base']
      },
      Roma: {
        '3.9': ['Base']
      },
      Portofino: {
        M: ['Base']
      }
    },
    Lamborghini: {
      Huracán: {
        V10: ['Base']
      },
      Aventador: {
        V12: ['Base']
      },
      Urus: {
        '4.0': ['Base']
      }
    },
    Maserati: {
      Ghibli: {
        '2.0': ['GranSport','GranLusso'],
        '3.0': ['GranSport','GranLusso']
      },
      Quattroporte: {
        '3.0': ['GranSport','GranLusso']
      },
      Levante: {
        '2.0': ['GranSport','GranLusso'],
        '3.0': ['GranSport','GranLusso']
      }
    },
    Dacia: {
      Duster: {
        '1.5 dCi': ['Comfort','Prestige'],
        '1.3 TCe': ['Comfort','Prestige']
      },
      Sandero: {
        '1.0 TCe': ['Comfort','Prestige']
      },
      Logan: {
        '1.0': ['Comfort']
      }
    },
    BYD: {
      'Atto 3': {
        EV60: ['Comfort','Prestige']
      },
      Han: {
        EV: ['Comfort','Prestige']
      }
    },
    Chery: {
      'Tiggo 7': {
        '1.5T': ['Comfort','Luxury']
      },
      'Tiggo 8': {
        '1.6T': ['Comfort','Luxury']
      }
    },
    MG: {
      ZS: {
        '1.0 T-GDI': ['Comfort','Luxury']
      },
      HS: {
        '1.5T': ['Comfort','Luxury']
      }
    },
    Geely: {
      Coolray: {
        '1.5T': ['Comfort','Luxury']
      }
    },
    GWM: {
      'Haval H6': {
        '1.5T': ['Comfort','Luxury']
      }
    },
    Chevrolet: {
      Cruze: {
        '1.6': ['LT','LTZ'],
        '1.4T': ['LT','LTZ']
      },
      Malibu: {
        '2.0': ['LT','Premier']
      },
      Camaro: {
        '3.6': ['Base']
      }
    },
    Chrysler: {
      '300C': {
        '3.6': ['Limited','Luxury']
      }
    },
    Dodge: {
      Charger: {
        '3.6': ['SXT'],
        '5.7': ['R/T']
      },
      Challenger: {
        '3.6': ['SXT'],
        '5.7': ['R/T']
      }
    },
    Cadillac: {
      CTS: {
        '2.0T': ['Luxury']
      },
      ATS: {
        '2.0T': ['Luxury']
      },
      Escalade: {
        '6.2': ['Premium']
      }
    },
    Lincoln: {
      MKZ: {
        '2.0T': ['Select','Reserve']
      },
      Navigator: {
        '3.5T': ['Reserve','Black Label']
      }
    },
    DS: {
      'DS 7 Crossback': {
        '1.5 BlueHDi': ['Performance Line','Rivoli'],
        '1.6 PureTech': ['Performance Line','Rivoli']
      }
    },
    Polestar: {
      '2': {
        'Long Range': ['Standard']
      }
    },
    Lada: {
      Vesta: {
        '1.6': ['Comfort','Luxury']
      }
    },
    Lotus: {
      Evora: {
        '3.5': ['Base']
      }
    }
  }
};

export const SERIES_TRIMS_EX: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {
  'vasita/suv-pickup': {
    Toyota: { Hilux: { '2.8 D': ['Invincible','Adventure'], '2.4 D': ['Adventure'] } },
    Ford: { Ranger: { '2.0 EcoBlue': ['Wildtrak','Limited'], '3.2 TDCi': ['XLT'] } },
    Nissan: { Navara: { '2.3 dCi': ['Tekna','Platinum'] } },
    Volkswagen: { Amarok: { '3.0 V6 TDI': ['Highline','Aventura'], '2.0 TDI': ['Trendline'] } }
  },
  'vasita/ticari-arac': {
    Ford: { Transit: { '2.2 TDCi': ['Base','Trend'], '2.0 EcoBlue': ['Base','Trend'] } },
    Volkswagen: { Transporter: { '2.0 TDI': ['Base','Comfort'] } },
    Renault: { Trafic: { '1.6 dCi': ['Business','Extra'], '2.0 dCi': ['Business'] } }
  },
  'vasita/kamyon': {
    Mercedes: { Actros: { '1845': ['LS','BigSpace'], '2545': ['LS'] } },
    Volvo: { FH: { '460': ['Globetrotter'], '500': ['Globetrotter XL'] } },
    DAF: { XF: { '480': ['Space Cab'], '530': ['Super Space Cab'] } }
  },
  'vasita/otobus': {
    Mercedes: { Travego: { '15 SHD': ['Comfort','Luxe'], '16 SHD': ['Comfort'] } },
    MAN: { "Lion's Coach": { 'C12': ['Comfort'], 'C13': ['Comfort'] } },
    Temsa: { Safir: { '12': ['Comfort'], '13': ['Luxe'] } }
  },
  'vasita/minibus': {
    Ford: { 'Transit Minibus': { '2.2 TDCi': ['City','Tour'], '2.0 EcoBlue': ['City'] } },
    Mercedes: { 'Sprinter Minibus': { '2.2 CDI': ['City','Tour'] } },
    Volkswagen: { 'Crafter Minibus': { '2.0 TDI': ['City'] } }
  },
  'vasita/traktor': {
    'John Deere': { '5E': { '5083E': ['Base'], '5090E': ['Base'] } },
    'New Holland': { T4: { 'T4.75': ['Base'], 'T4.85': ['Base'] } }
  }
};

const MODEL_SERIES_EXTRA_LOCAL = {
  'vasita/otomobil': {
    Mercedes: {
      'A-Serisi': ['A 180','A 200'],
      GLA: ['GLA 200','GLA 220 d']
    },
    BMW: {
      X1: ['sDrive18i','sDrive18d'],
      X3: ['xDrive20d','xDrive30i']
    },
    Audi: {
      A3: ['1.4 TFSI','1.6 TDI'],
      Q3: ['35 TFSI','35 TDI']
    },
    Toyota: {
      RAV4: ['2.0','2.5 Hybrid'],
      'C-HR': ['1.2 Turbo','1.8 Hybrid']
    },
    Honda: {
      Civic: ['1.6 i-DTEC','1.5 VTEC Turbo'],
      'HR-V': ['1.5 i-VTEC'],
      'CR-V': ['1.6 i-DTEC','1.5 VTEC Turbo']
    },
    Volkswagen: {
      Tiguan: ['1.5 TSI','2.0 TDI']
    },
    Renault: {
      Clio: ['1.0 TCe','1.5 dCi'],
      Captur: ['1.2 TCe','1.5 dCi']
    },
    Peugeot: {
      '2008': ['1.2 PureTech','1.5 BlueHDi']
    },
    'Citroën': {
      C3: ['1.2 PureTech','1.5 BlueHDi']
    },
    Skoda: {
      Karoq: ['1.5 TSI','2.0 TDI']
    },
    Volvo: {
      XC40: ['T3','D4']
    },
    Seat: {
      Ibiza: ['1.0 TSI','1.6 TDI']
    },
    Ford: {
      Kuga: ['1.5 EcoBoost','2.0 TDCi']
    },
    Hyundai: {
      Kona: ['1.6 T-GDI','1.6 CRDi']
    },
    Kia: {
      Sorento: ['2.2 CRDi']
    },
    Fiat: {
      '500': ['1.2','0.9 TwinAir']
    }
  }
} as Record<string, Record<string, Record<string, string[]>>>

export const MODEL_SERIES_EXTRA: Record<string, Record<string, Record<string, string[]>>> = (() => {
  const generated = (generatedAutomobil as any)?.modelSeries || {}
  const auto = generated['vasita/otomobil'] || {}
  return { 'vasita/otomobil': { ...MODEL_SERIES_EXTRA_LOCAL['vasita/otomobil'], ...auto } }
})()

const SERIES_TRIMS_EXTRA_LOCAL = {
  'vasita/otomobil': {
    Mercedes: {
      'A-Serisi': {
        'A 180': ['AMG Line','Style'],
        'A 200': ['AMG Line','Style']
      },
      GLA: {
        'GLA 200': ['AMG Line','Style'],
        'GLA 220 d': ['AMG Line','Style']
      }
    },
    BMW: {
      X1: {
        sDrive18i: ['M Sport','xLine'],
        sDrive18d: ['M Sport','xLine']
      },
      X3: {
        xDrive20d: ['M Sport','Luxury'],
        xDrive30i: ['M Sport','Luxury']
      }
    },
    Audi: {
      A3: {
        '1.4 TFSI': ['S-Line','Ambition','Attraction'],
        '1.6 TDI': ['S-Line','Ambition','Attraction']
      },
      Q3: {
        '35 TFSI': ['S-Line','Advanced'],
        '35 TDI': ['S-Line','Advanced']
      }
    },
    Toyota: {
      RAV4: {
        '2.0': ['Advance','Prestige'],
        '2.5 Hybrid': ['Advance','Prestige']
      },
      'C-HR': {
        '1.2 Turbo': ['Advance','Style'],
        '1.8 Hybrid': ['Advance','Style']
      }
    },
    Honda: {
      Civic: {
        '1.6 i-DTEC': ['Elegance','Executive'],
        '1.5 VTEC Turbo': ['Elegance','Executive']
      },
      'HR-V': {
        '1.5 i-VTEC': ['Elegance','Executive']
      },
      'CR-V': {
        '1.6 i-DTEC': ['Elegance','Executive'],
        '1.5 VTEC Turbo': ['Elegance','Executive']
      }
    },
    Volkswagen: {
      Tiguan: {
        '1.5 TSI': ['Trendline','Comfortline','Highline'],
        '2.0 TDI': ['Trendline','Comfortline','Highline']
      }
    },
    Renault: {
      Clio: {
        '1.0 TCe': ['Joy','Touch','Icon'],
        '1.5 dCi': ['Joy','Touch','Icon']
      },
      Captur: {
        '1.2 TCe': ['Touch','Icon'],
        '1.5 dCi': ['Touch','Icon']
      }
    },
    Peugeot: {
      '2008': {
        '1.2 PureTech': ['Active','Allure','GT'],
        '1.5 BlueHDi': ['Active','Allure','GT']
      }
    },
    'Citroën': {
      C3: {
        '1.2 PureTech': ['Feel','Shine'],
        '1.5 BlueHDi': ['Feel','Shine']
      }
    },
    Skoda: {
      Karoq: {
        '1.5 TSI': ['Ambition','Style'],
        '2.0 TDI': ['Ambition','Style']
      }
    },
    Volvo: {
      XC40: {
        T3: ['Momentum','Inscription'],
        D4: ['Momentum','Inscription']
      }
    },
    Seat: {
      Ibiza: {
        '1.0 TSI': ['FR','Style'],
        '1.6 TDI': ['FR','Style']
      }
    },
    Ford: {
      Kuga: {
        '1.5 EcoBoost': ['Trend','Titanium'],
        '2.0 TDCi': ['Trend','Titanium']
      }
    },
    Hyundai: {
      Kona: {
        '1.6 T-GDI': ['Style','Elite'],
        '1.6 CRDi': ['Style','Elite']
      }
    },
    Kia: {
      Sorento: {
        '2.2 CRDi': ['Prestige']
      }
    },
    Fiat: {
      '500': {
        '1.2': ['Pop','Lounge'],
        '0.9 TwinAir': ['Pop','Lounge']
      }
    }
  }
} as Record<string, Record<string, Record<string, Record<string, string[]>>>>

export const SERIES_TRIMS_EXTRA: Record<string, Record<string, Record<string, Record<string, string[]>>>> = (() => {
  const generated = (generatedAutomobil as any)?.seriesTrims || {}
  const auto = generated['vasita/otomobil'] || {}
  return { 'vasita/otomobil': { ...SERIES_TRIMS_EXTRA_LOCAL['vasita/otomobil'], ...auto } }
})()
