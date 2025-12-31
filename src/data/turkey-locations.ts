// Türkiye İller ve İlçeleri
export interface District {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  plate: string;
  districts: District[];
}

export const TURKEY_PROVINCES: Province[] = [
  {
    id: "adana",
    name: "Adana",
    plate: "01",
    districts: [
      { id: "adana-seyhan", name: "Seyhan" },
      { id: "adana-cukurova", name: "Çukurova" },
      { id: "adana-yuregir", name: "Yüreğir" },
      { id: "adana-sariçam", name: "Sarıçam" },
      { id: "adana-kozan", name: "Kozan" },
      { id: "adana-ceyhan", name: "Ceyhan" },
      { id: "adana-feke", name: "Feke" },
      { id: "adana-imamoglu", name: "İmamoğlu" },
      { id: "adana-karaisali", name: "Karaisalı" },
      { id: "adana-karatas", name: "Karataş" },
      { id: "adana-pozanti", name: "Pozantı" },
      { id: "adana-saimbeyli", name: "Saimbeyli" },
      { id: "adana-tufanbeyli", name: "Tufanbeyli" },
      { id: "adana-yumurtalik", name: "Yumurtalık" },
      { id: "adana-aladag", name: "Aladağ" }
    ]
  },
  {
    id: "adiyaman",
    name: "Adıyaman",
    plate: "02",
    districts: [
      { id: "adiyaman-merkez", name: "Merkez" },
      { id: "adiyaman-besni", name: "Besni" },
      { id: "adiyaman-celikhan", name: "Çelikhan" },
      { id: "adiyaman-gerger", name: "Gerger" },
      { id: "adiyaman-golbasi", name: "Gölbaşı" },
      { id: "adiyaman-kahta", name: "Kahta" },
      { id: "adiyaman-samsat", name: "Samsat" },
      { id: "adiyaman-sincik", name: "Sincik" },
      { id: "adiyaman-tut", name: "Tut" }
    ]
  },
  {
    id: "afyonkarahisar",
    name: "Afyonkarahisar",
    plate: "03",
    districts: [
      { id: "afyonkarahisar-merkez", name: "Merkez" },
      { id: "afyonkarahisar-basmakci", name: "Başmakçı" },
      { id: "afyonkarahisar-bayat", name: "Bayat" },
      { id: "afyonkarahisar-bolvadin", name: "Bolvadin" },
      { id: "afyonkarahisar-çay", name: "Çay" },
      { id: "afyonkarahisar-çobanlar", name: "Çobanlar" },
      { id: "afyonkarahisar-dazkiri", name: "Dazkırı" },
      { id: "afyonkarahisar-dinar", name: "Dinar" },
      { id: "afyonkarahisar-emirdag", name: "Emirdağ" },
      { id: "afyonkarahisar-evciler", name: "Evciler" },
      { id: "afyonkarahisar-hocalar", name: "Hocalar" },
      { id: "afyonkarahisar-ihsaniye", name: "İhsaniye" },
      { id: "afyonkarahisar-iscehisar", name: "İscehisar" },
      { id: "afyonkarahisar-kizilören", name: "Kızılören" },
      { id: "afyonkarahisar-sandikli", name: "Sandıklı" },
      { id: "afyonkarahisar-sinanpasa", name: "Sinanpaşa" },
      { id: "afyonkarahisar-sultandagi", name: "Sultandağı" },
      { id: "afyonkarahisar-suhut", name: "Şuhut" }
    ]
  },
  {
    id: "agri",
    name: "Ağrı",
    plate: "04",
    districts: [
      { id: "agri-merkez", name: "Merkez" },
      { id: "agri-diyadin", name: "Diyadin" },
      { id: "agri-dogubayazit", name: "Doğubayazıt" },
      { id: "agri-eleşkir", name: "Eleşkir" },
      { id: "agri-hamur", name: "Hamur" },
      { id: "agri-patnos", name: "Patnos" },
      { id: "agri-taşliçay", name: "Taşlıçay" },
      { id: "agri-tutak", name: "Tutak" }
    ]
  },
  {
    id: "amasya",
    name: "Amasya",
    plate: "05",
    districts: [
      { id: "amasya-merkez", name: "Merkez" },
      { id: "amasya-goynucek", name: "Göynücek" },
      { id: "amasya-gumushacikoy", name: "Gümüşhacıköy" },
      { id: "amasya-hamamözü", name: "Hamamözü" },
      { id: "amasya-merzifon", name: "Merzifon" },
      { id: "amasya-suluova", name: "Suluova" },
      { id: "amasya-taşova", name: "Taşova" }
    ]
  },
  {
    id: "ankara",
    name: "Ankara",
    plate: "06",
    districts: [
      { id: "ankara-çankaya", name: "Çankaya" },
      { id: "ankara-kecioren", name: "Keçiören" },
      { id: "ankara-yenimahalle", name: "Yenimahalle" },
      { id: "ankara-mamak", name: "Mamak" },
      { id: "ankara-sincan", name: "Sincan" },
      { id: "ankara-etimesgut", name: "Etimesgut" },
      { id: "ankara-altindag", name: "Altındağ" },
      { id: "ankara-pursaklar", name: "Pursaklar" },
      { id: "ankara-golbasi", name: "Gölbaşı" },
      { id: "ankara-polatli", name: "Polatlı" },
      { id: "ankara-çubuk", name: "Çubuk" },
      { id: "ankara-akyurt", name: "Akyurt" },
      { id: "ankara-kahramankazan", name: "Kahramankazan" },
      { id: "ankara-beypazari", name: "Beypazarı" },
      { id: "ankara-nihatdalgül", name: "Nallıhan" },
      { id: "ankara-kalecik", name: "Kalecik" },
      { id: "ankara-yenice", name: "Yenice" },
      { id: "ankara-kizilcahamam", name: "Kızılcahamam" },
      { id: "ankara-çamlidere", name: "Çamlıdere" },
      { id: "ankara-haymana", name: "Haymana" },
      { id: "ankara-bala", name: "Bala" },
      { id: "ankara-evren", name: "Evren" },
      { id: "ankara-şereflikoçhisar", name: "Şereflikoçhisar" }
    ]
  },
  {
    id: "antalya",
    name: "Antalya",
    plate: "07",
    districts: [
      { id: "antalya-muratpasa", name: "Muratpaşa" },
      { id: "antalya-kepez", name: "Kepez" },
      { id: "antalya-konyaalti", name: "Konyaaltı" },
      { id: "antalya-aksu", name: "Aksu" },
      { id: "antalya-alanya", name: "Alanya" },
      { id: "antalya-manavgat", name: "Manavgat" },
      { id: "antalya-serik", name: "Serik" },
      { id: "antalya-kemer", name: "Kemer" },
      { id: "antalya-kumluca", name: "Kumluca" },
      { id: "antalya-finike", name: "Finike" },
      { id: "antalya-kas", name: "Kaş" },
      { id: "antalya-demre", name: "Demre" },
      { id: "antalya-gazipasa", name: "Gazipaşa" },
      { id: "antalya-elmal", name: "Elmalı" },
      { id: "antalya-dosemealti", name: "Döşemealtı" },
      { id: "antalya-ibradi", name: "İbradı" },
      { id: "antalya-korkuteli", name: "Korkuteli" },
      { id: "antalya-akseki", name: "Akseki" },
      { id: "antalya-gundogmus", name: "Gündoğmuş" }
    ]
  },
  {
    id: "artvin",
    name: "Artvin",
    plate: "08",
    districts: [
      { id: "artvin-merkez", name: "Merkez" },
      { id: "artvin-ardanuç", name: "Ardanuç" },
      { id: "artvin-arhav", name: "Arhavi" },
      { id: "artvin-borçka", name: "Borçka" },
      { id: "artvin-hopa", name: "Hopa" },
      { id: "artvin-murgul", name: "Murgul" },
      { id: "artvin-şavşat", name: "Şavşat" },
      { id: "artvin-yusufeli", name: "Yusufeli" }
    ]
  },
  {
    id: "aydin",
    name: "Aydın",
    plate: "09",
    districts: [
      { id: "aydin-merkez", name: "Merkez" },
      { id: "aydin-bozdogan", name: "Bozdoğan" },
      { id: "aydin-çine", name: "Çine" },
      { id: "aydin-germencik", name: "Germencik" },
      { id: "aydin-incirliova", name: "İncirliova" },
      { id: "aydin-karacasu", name: "Karacasu" },
      { id: "aydin-karpuzlu", name: "Karpuzlu" },
      { id: "aydin-koçarli", name: "Koçarlı" },
      { id: "aydin-kuyucak", name: "Kuyucak" },
      { id: "aydin-nazilli", name: "Nazilli" },
      { id: "aydin-söke", name: "Söke" },
      { id: "aydin-sultanhisar", name: "Sultanhisar" },
      { id: "aydin-yenipazar", name: "Yenipazar" },
      { id: "aydin-kusadasi", name: "Kuşadası" },
      { id: "aydin-didim", name: "Didim" },
      { id: "aydin-efeler", name: "Efeler" }
    ]
  },
  {
    id: "balikesir",
    name: "Balıkesir",
    plate: "10",
    districts: [
      { id: "balikesir-merkez", name: "Merkez" },
      { id: "balikesir-ayvalik", name: "Ayvalık" },
      { id: "balikesir-balya", name: "Balya" },
      { id: "balikesir-bandirma", name: "Bandırma" },
      { id: "balikesir-bigadiç", name: "Bigadiç" },
      { id: "balikesir-burhaniye", name: "Burhaniye" },
      { id: "balikesir-dursunbey", name: "Dursunbey" },
      { id: "balikesir-edremit", name: "Edremit" },
      { id: "balikesir-erdek", name: "Erdek" },
      { id: "balikesir-gömeç", name: "Gömeç" },
      { id: "balikesir-gönen", name: "Gönen" },
      { id: "balikesir-havl", name: "Havran" },
      { id: "balikesir-ivriz", name: "İvrindi" },
      { id: "balikesir-kepsut", name: "Kepsut" },
      { id: "balikesir-manyas", name: "Manyas" },
      { id: "balikesir-marmara", name: "Marmara" },
      { id: "balikesir-savastepe", name: "Savaştepe" },
      { id: "balikesir-sindirgi", name: "Sındırgı" },
      { id: "balikesir-susurluk", name: "Susurluk" }
    ]
  },
  {
    id: "bilecik",
    name: "Bilecik",
    plate: "11",
    districts: [
      { id: "bilecik-merkez", name: "Merkez" },
      { id: "bilecik-bozüyük", name: "Bozüyük" },
      { id: "bilecik-gölpazari", name: "Gölpazarı" },
      { id: "bilecik-inhisar", name: "İnhisar" },
      { id: "bilecik-osmaneli", name: "Osmaneli" },
      { id: "bilecik-pazaryeri", name: "Pazaryeri" },
      { id: "bilecik-sögüt", name: "Söğüt" },
      { id: "bilecik-yenipazar", name: "Yenipazar" }
    ]
  },
  {
    id: "bingöl",
    name: "Bingöl",
    plate: "12",
    districts: [
      { id: "bingöl-merkez", name: "Merkez" },
      { id: "bingöl-adakli", name: "Adaklı" },
      { id: "bingöl-genç", name: "Genç" },
      { id: "bingöl-karliova", name: "Karlıova" },
      { id: "bingöl-kiği", name: "Kiğı" },
      { id: "bingöl-solhan", name: "Solhan" },
      { id: "bingöl-yayladere", name: "Yayladere" },
      { id: "bingöl-yedisu", name: "Yedisu" }
    ]
  },
  {
    id: "bitlis",
    name: "Bitlis",
    plate: "13",
    districts: [
      { id: "bitlis-merkez", name: "Merkez" },
      { id: "bitlis-adilcevaz", name: "Adilcevaz" },
      { id: "bitlis-ahlat", name: "Ahlat" },
      { id: "bitlis-güroymak", name: "Güroymak" },
      { id: "bitlis-hizan", name: "Hizan" },
      { id: "bitlis-mutki", name: "Mutki" },
      { id: "bitlis-tatvan", name: "Tatvan" }
    ]
  },
  {
    id: "bolu",
    name: "Bolu",
    plate: "14",
    districts: [
      { id: "bolu-merkez", name: "Merkez" },
      { id: "bolu-dörtdivan", name: "Dörtdivan" },
      { id: "bolu-gerede", name: "Gerede" },
      { id: "bolu-göynük", name: "Göynük" },
      { id: "bolu-kibriscik", name: "Kıbrıscık" },
      { id: "bolu-mengen", name: "Mengen" },
      { id: "bolu-mudurnu", name: "Mudurnu" },
      { id: "bolu-seben", name: "Seben" },
      { id: "bolu-yenicaga", name: "Yeniçağa" }
    ]
  },
  {
    id: "burdur",
    name: "Burdur",
    plate: "15",
    districts: [
      { id: "burdur-merkez", name: "Merkez" },
      { id: "burdur-altinyayla", name: "Altınyayla" },
      { id: "burdur-bucak", name: "Bucak" },
      { id: "burdur-çavdir", name: "Çavdır" },
      { id: "burdur-çeltikçi", name: "Çeltikçi" },
      { id: "burdur-gölhisar", name: "Gölhisar" },
      { id: "burdur-karamanli", name: "Karamanlı" },
      { id: "burdur-kemer", name: "Kemer" },
      { id: "burdur-tefenni", name: "Tefenni" },
      { id: "burdur-yesilova", name: "Yeşilova" }
    ]
  },
  {
    id: "bursa",
    name: "Bursa",
    plate: "16",
    districts: [
      { id: "bursa-osmangazi", name: "Osmangazi" },
      { id: "bursa-yildirim", name: "Yıldırım" },
      { id: "bursa-nilüfer", name: "Nilüfer" },
      { id: "bursa-inegöl", name: "İnegöl" },
      { id: "bursa-gemlik", name: "Gemlik" },
      { id: "bursa-mudanya", name: "Mudanya" },
      { id: "bursa-mustafakemalpasa", name: "Mustafakemalpaşa" },
      { id: "bursa-orhangazi", name: "Orhangazi" },
      { id: "bursa-guRSU", name: "Gürsu" },
      { id: "bursa-kestel", name: "Kestel" },
      { id: "bursa-karacabey", name: "Karacabey" },
      { id: "bursa-büyükorhan", name: "Büyükorhan" },
      { id: "bursa-harmancik", name: "Harmancık" },
      { id: "bursa-iznik", name: "İznik" },
      { id: "bursa-keles", name: "Keles" },
      { id: "bursa-orhaneli", name: "Orhaneli" },
      { id: "bursa-yenişehir", name: "Yenişehir" }
    ]
  },
  {
    id: "canakkale",
    name: "Çanakkale",
    plate: "17",
    districts: [
      { id: "canakkale-merkez", name: "Merkez" },
      { id: "canakkale-ayvacik", name: "Ayvacık" },
      { id: "canakkale-bayramiç", name: "Bayramiç" },
      { id: "canakkale-biga", name: "Biga" },
      { id: "canakkale-bozcaada", name: "Bozcaada" },
      { id: "canakkale-çan", name: "Çan" },
      { id: "canakkale-eceabat", name: "Eceabat" },
      { id: "canakkale-ezine", name: "Ezine" },
      { id: "canakkale-gelibolu", name: "Gelibolu" },
      { id: "canakkale-gökçeada", name: "Gökçeada" },
      { id: "canakkale-lapseki", name: "Lapseki" },
      { id: "canakkale-yenice", name: "Yenice" }
    ]
  },
  {
    id: "çankiri",
    name: "Çankırı",
    plate: "18",
    districts: [
      { id: "çankiri-merkez", name: "Merkez" },
      { id: "çankiri-atkaracalar", name: "Atkaracalar" },
      { id: "çankiri-bayramören", name: "Bayramören" },
      { id: "çankiri-çerkeş", name: "Çerkeş" },
      { id: "çankiri-eldivan", name: "Eldivan" },
      { id: "çankiri-ilgaz", name: "Ilgaz" },
      { id: "çankiri-kizilirmak", name: "Kızılırmak" },
      { id: "çankiri-korgun", name: "Korgun" },
      { id: "çankiri-kursunlu", name: "Kurşunlu" },
      { id: "çankiri-orta", name: "Orta" },
      { id: "çankiri-sabanözü", name: "Şabanözü" },
      { id: "çankiri-yaprakli", name: "Yapraklı" }
    ]
  },
  {
    id: "çorum",
    name: "Çorum",
    plate: "19",
    districts: [
      { id: "çorum-merkez", name: "Merkez" },
      { id: "çorum-alaca", name: "Alaca" },
      { id: "çorum-bayat", name: "Bayat" },
      { id: "çorum-bogazkale", name: "Boğazkale" },
      { id: "çorum-dodurga", name: "Dodurga" },
      { id: "çorum-iskilip", name: "İskilip" },
      { id: "çorum-kargi", name: "Kargı" },
      { id: "çorum-laçin", name: "Laçin" },
      { id: "çorum-mecitözü", name: "Mecitözü" },
      { id: "çorum-oguzlar", name: "Oğuzlar" },
      { id: "çorum-ortaköy", name: "Ortaköy" },
      { id: "çorum-osmancik", name: "Osmancık" },
      { id: "çorum-sungurlu", name: "Sungurlu" },
      { id: "çorum-uğurludağ", name: "Uğurludağ" }
    ]
  },
  {
    id: "denizli",
    name: "Denizli",
    plate: "20",
    districts: [
      { id: "denizli-merkez", name: "Merkez" },
      { id: "denizli-acipayam", name: "Acıpayam" },
      { id: "denizli-babadağ", name: "Babadağ" },
      { id: "denizli-baklan", name: "Baklan" },
      { id: "denizli-bekilli", name: "Bekilli" },
      { id: "denizli-beyağaç", name: "Beyağaç" },
      { id: "denizli-bosdere", name: "Bozkurt" },
      { id: "denizli-buldan", name: "Buldan" },
      { id: "denizli-çal", name: "Çal" },
      { id: "denizli-çameli", name: "Çameli" },
      { id: "denizli-çardak", name: "Çardak" },
      { id: "denizli-çivril", name: "Çivril" },
      { id: "denizli-güney", name: "Güney" },
      { id: "denizli-honaz", name: "Honaz" },
      { id: "denizli-kale", name: "Kale" },
      { id: "denizli-sarayköy", name: "Sarayköy" },
      { id: "denizli-serik", name: "Serinhisar" },
      { id: "denizli-tavas", name: "Tavas" }
    ]
  },
  {
    id: "diyarbakir",
    name: "Diyarbakır",
    plate: "21",
    districts: [
      { id: "diyarbakir-baglar", name: "Bağlar" },
      { id: "diyarbakir-bismil", name: "Bismil" },
      { id: "diyarbakir-çermik", name: "Çermik" },
      { id: "diyarbakir-çinar", name: "Çınar" },
      { id: "diyarbakir-çüngüş", name: "Çüngüş" },
      { id: "diyarbakir-dicle", name: "Dicle" },
      { id: "diyarbakir-egil", name: "Eğil" },
      { id: "diyarbakir-ergani", name: "Ergani" },
      { id: "diyarbakir-hazro", name: "Hazro" },
      { id: "diyarbakir-kayapinar", name: "Kayapınar" },
      { id: "diyarbakir-kocaköy", name: "Kocaköy" },
      { id: "diyarbakir-kulp", name: "Kulp" },
      { id: "diyarbakir-lic", name: "Lice" },
      { id: "diyarbakir-silvan", name: "Silvan" },
      { id: "diyarbakir-sur", name: "Sur" },
      { id: "diyarbakir-yenişehir", name: "Yenişehir" }
    ]
  },
  {
    id: "edirne",
    name: "Edirne",
    plate: "22",
    districts: [
      { id: "edirne-merkez", name: "Merkez" },
      { id: "edirne-enez", name: "Enez" },
      { id: "edirne-havsa", name: "Havsa" },
      { id: "edirne-ipsala", name: "İpsala" },
      { id: "edirne-kesan", name: "Keşan" },
      { id: "edirne-lalapaşa", name: "Lalapaşa" },
      { id: "edirne-meriç", name: "Meriç" },
      { id: "edirne-süloğlu", name: "Süloğlu" },
      { id: "edirne-uzunköprü", name: "Uzunköprü" }
    ]
  },
  {
    id: "elazig",
    name: "Elazığ",
    plate: "23",
    districts: [
      { id: "elazig-merkez", name: "Merkez" },
      { id: "elazig-agin", name: "Ağın" },
      { id: "elazig-alacakaya", name: "Alacakaya" },
      { id: "elazig-aricak", name: "Arıcak" },
      { id: "elazig-baskil", name: "Baskil" },
      { id: "elazig-karakoçan", name: "Karakoçan" },
      { id: "elazig-keban", name: "Keban" },
      { id: "elazig-kovancilar", name: "Kovancılar" },
      { id: "elazig-maden", name: "Maden" },
      { id: "elazig-palu", name: "Palu" },
      { id: "elazig-sivrice", name: "Sivrice" }
    ]
  },
  {
    id: "erzincan",
    name: "Erzincan",
    plate: "24",
    districts: [
      { id: "erzincan-merkez", name: "Merkez" },
      { id: "erzincan-çayirli", name: "Çayırlı" },
      { id: "erzincan-içme", name: "İliç" },
      { id: "erzincan-kemah", name: "Kemah" },
      { id: "erzincan-kemaliye", name: "Kemaliye" },
      { id: "erzincan-otlukbeli", name: "Otlukbeli" },
      { id: "erzincan-refahiye", name: "Refahiye" },
      { id: "erzincan-tercan", name: "Tercan" },
      { id: "erzincan-uzumlu", name: "Üzümlü" }
    ]
  },
  {
    id: "erzurum",
    name: "Erzurum",
    plate: "25",
    districts: [
      { id: "erzurum-aziziye", name: "Aziziye" },
      { id: "erzurum-çat", name: "Çat" },
      { id: "erzurum-hinis", name: "Hınıs" },
      { id: "erzurum-horasan", name: "Horasan" },
      { id: "erzurum-ilica", name: "İspir" },
      { id: "erzurum-karayazi", name: "Karayazı" },
      { id: "erzurum-koprüköy", name: "Köprüköy" },
      { id: "erzurum-narman", name: "Narman" },
      { id: "erzurum-olur", name: "Olur" },
      { id: "erzurum-oltu", name: "Oltu" },
      { id: "erzurum-palandöken", name: "Palandöken" },
      { id: "erzurum-pasinler", name: "Pasinler" },
      { id: "erzurum-şenkaya", name: "Şenkaya" },
      { id: "erzurum-tekman", name: "Tekman" },
      { id: "erzurum-tortum", name: "Tortum" },
      { id: "erzurum-uzundere", name: "Uzundere" },
      { id: "erzurum-yakutiye", name: "Yakutiye" }
    ]
  },
  {
    id: "eskişehir",
    name: "Eskişehir",
    plate: "26",
    districts: [
      { id: "eskişehir-tepebasi", name: "Tepebaşı" },
      { id: "eskişehir-odunpazari", name: "Odunpazarı" },
      { id: "eskişehir-alpu", name: "Alpu" },
      { id: "eskişehir-beylikova", name: "Beylikova" },
      { id: "eskişehir-çifteler", name: "Çifteler" },
      { id: "eskişehir-günyüzü", name: "Günyüzü" },
      { id: "eskişehir-han", name: "Han" },
      { id: "eskişehir-inönü", name: "İnönü" },
      { id: "eskişehir-mahmudiye", name: "Mahmudiye" },
      { id: "eskişehir-mihalgazi", name: "Mihalgazi" },
      { id: "eskişehir-mihalliççik", name: "Mihalliççik" },
      { id: "eskişehir-saricakaya", name: "Sarıcakaya" },
      { id: "eskişehir-seyitgazi", name: "Seyitgazi" },
      { id: "eskişehir-sivrihisar", name: "Sivrihisar" }
    ]
  },
  {
    id: "gaziantep",
    name: "Gaziantep",
    plate: "27",
    districts: [
      { id: "gaziantep-şahinbey", name: "Şahinbey" },
      { id: "gaziantep-şehitkamil", name: "Şehitkamil" },
      { id: "gaziantep-araban", name: "Araban" },
      { id: "gaziantep-islahiye", name: "İslahiye" },
      { id: "gaziantep-karkamiş", name: "Karkamış" },
      { id: "gaziantep-nizip", name: "Nizip" },
      { id: "gaziantep-nurdagi", name: "Nurdağı" },
      { id: "gaziantep-oğuzeli", name: "Oğuzeli" },
      { id: "gaziantep-yavuzeli", name: "Yavuzeli" }
    ]
  },
  {
    id: "giresun",
    name: "Giresun",
    plate: "28",
    districts: [
      { id: "giresun-merkez", name: "Merkez" },
      { id: "giresun-alucra", name: "Alucra" },
      { id: "giresun-bulancak", name: "Bulancak" },
      { id: "giresun-çamoluk", name: "Çamoluk" },
      { id: "giresun-çanakçi", name: "Çanakçı" },
      { id: "giresun-dereli", name: "Dereli" },
      { id: "giresun-doğankent", name: "Doğankent" },
      { id: "giresun-espiye", name: "Espiye" },
      { id: "giresun-eynesil", name: "Eynesil" },
      { id: "giresun-görele", name: "Görele" },
      { id: "giresun-güce", name: "Güce" },
      { id: "giresun-keşap", name: "Keşap" },
      { id: "giresun-piraziz", name: "Piraziz" },
      { id: "giresun-şebinkarahisar", name: "Şebinkarahisar" },
      { id: "giresun-tirebolu", name: "Tirebolu" },
      { id: "giresun-yağliDere", name: "Yağlıdere" }
    ]
  },
  {
    id: "gümüşhane",
    name: "Gümüşhane",
    plate: "29",
    districts: [
      { id: "gümüşhane-merkez", name: "Merkez" },
      { id: "gümüşhane-kelkit", name: "Kelkit" },
      { id: "gümüşhane-kose", name: "Köse" },
      { id: "gümüşhane-kürtün", name: "Kürtün" },
      { id: "gümüşhane-şiran", name: "Şiran" },
      { id: "gümüşhane-torul", name: "Torul" }
    ]
  },
  {
    id: "hakkari",
    name: "Hakkari",
    plate: "30",
    districts: [
      { id: "hakkari-merkez", name: "Merkez" },
      { id: "hakkari-çukurca", name: "Çukurca" },
      { id: "hakkari-dereli", name: "Derecik" },
      { id: "hakkari-şemdinli", name: "Şemdinli" },
      { id: "hakkari-yuksekova", name: "Yüksekova" }
    ]
  },
  {
    id: "hatay",
    name: "Hatay",
    plate: "31",
    districts: [
      { id: "hatay-altinözü", name: "Altınözü" },
      { id: "hatay-antakya", name: "Antakya" },
      { id: "hatay-arsuz", name: "Arsuz" },
      { id: "hatay-belen", name: "Belen" },
      { id: "hatay-dörtyol", name: "Dörtyol" },
      { id: "hatay-erzin", name: "Erzin" },
      { id: "hatay-hassa", name: "Hassa" },
      { id: "hatay-iskenderun", name: "İskenderun" },
      { id: "hatay-kumlu", name: "Kumlu" },
      { id: "hatay-payas", name: "Payas" },
      { id: "hatay-reyhanli", name: "Reyhanlı" },
      { id: "hatay-samandag", name: "Samandağ" },
      { id: "hatay-yayladagi", name: "Yayladağı" }
    ]
  },
  {
    id: "isparta",
    name: "Isparta",
    plate: "32",
    districts: [
      { id: "isparta-merkez", name: "Merkez" },
      { id: "isparta-aksu", name: "Aksu" },
      { id: "isparta-atabey", name: "Atabey" },
      { id: "isparta-çünür", name: "Çünür" },
      { id: "isparta-eğirdir", name: "Eğirdir" },
      { id: "isparta-gelendost", name: "Gelendost" },
      { id: "isparta-gönen", name: "Gönen" },
      { id: "isparta-keçiborlu", name: "Keçiborlu" },
      { id: "isparta-senirkent", name: "Senirkent" },
      { id: "isparta-sütçüler", name: "Sütçüler" },
      { id: "isparta-şarkikaraağaç", name: "Şarkikaraağaç" },
      { id: "isparta-uluborlu", name: "Uluborlu" },
      { id: "isparta-yalvaç", name: "Yalvaç" },
      { id: "isparta-yenişarbademli", name: "Yenişarbademli" }
    ]
  },
  {
    id: "mersin",
    name: "Mersin",
    plate: "33",
    districts: [
      { id: "mersin-akdeniz", name: "Akdeniz" },
      { id: "mersin-anamur", name: "Anamur" },
      { id: "mersin-aydincik", name: "Aydıncık" },
      { id: "mersin-bozyazi", name: "Bozyazı" },
      { id: "mersin-çamliyayla", name: "Çamlıyayla" },
      { id: "mersin-erdemli", name: "Erdemli" },
      { id: "mersin-gülnar", name: "Gülnar" },
      { id: "mersin-mevzitli", name: "Mezitli" },
      { id: "mersin-mut", name: "Mut" },
      { id: "mersin-silifke", name: "Silifke" },
      { id: "mersin-tarsus", name: "Tarsus" },
      { id: "mersin-toroslar", name: "Toroslar" },
      { id: "mersin-yenişehir", name: "Yenişehir" }
    ]
  },
  {
    id: "istanbul",
    name: "İstanbul",
    plate: "34",
    districts: [
      { id: "istanbul-adalar", name: "Adalar" },
      { id: "istanbul-arnavutköy", name: "Arnavutköy" },
      { id: "istanbul-atasehir", name: "Ataşehir" },
      { id: "istanbul-avcilar", name: "Avcılar" },
      { id: "istanbul-bagcilar", name: "Bağcılar" },
      { id: "istanbul-bahçelievler", name: "Bahçelievler" },
      { id: "istanbul-bakirköy", name: "Bakırköy" },
      { id: "istanbul-basaksehir", name: "Başakşehir" },
      { id: "istanbul-bayrampasa", name: "Bayrampaşa" },
      { id: "istanbul-besiktaş", name: "Beşiktaş" },
      { id: "istanbul-beykoz", name: "Beykoz" },
      { id: "istanbul-beylikdüzü", name: "Beylikdüzü" },
      { id: "istanbul-beyoğlu", name: "Beyoğlu" },
      { id: "istanbul-buyukçekmece", name: "Büyükçekmece" },
      { id: "istanbul-çatalca", name: "Çatalca" },
      { id: "istanbul-çekmeköy", name: "Çekmeköy" },
      { id: "istanbul-esenler", name: "Esenler" },
      { id: "istanbul-esenyurt", name: "Esenyurt" },
      { id: "istanbul-eyüpsultan", name: "Eyüpsultan" },
      { id: "istanbul-fatih", name: "Fatih" },
      { id: "istanbul-gaziosmanpaşa", name: "Gaziosmanpaşa" },
      { id: "istanbul-güngören", name: "Güngören" },
      { id: "istanbul-kadiköy", name: "Kadıköy" },
      { id: "istanbul-kağithane", name: "Kağıthane" },
      { id: "istanbul-kartal", name: "Kartal" },
      { id: "istanbul-küçükçekmece", name: "Küçükçekmece" },
      { id: "istanbul-maltepe", name: "Maltepe" },
      { id: "istanbul-pendik", name: "Pendik" },
      { id: "istanbul-sancaktepe", name: "Sancaktepe" },
      { id: "istanbul-sariyer", name: "Sarıyer" },
      { id: "istanbul-silivri", name: "Silivri" },
      { id: "istanbul-sultanbeyli", name: "Sultanbeyli" },
      { id: "istanbul-sultangazi", name: "Sultangazi" },
      { id: "istanbul-şile", name: "Şile" },
      { id: "istanbul-şişli", name: "Şişli" },
      { id: "istanbul-tuzla", name: "Tuzla" },
      { id: "istanbul-ümraniye", name: "Ümraniye" },
      { id: "istanbul-üsküdar", name: "Üsküdar" },
      { id: "istanbul-zeytinburnu", name: "Zeytinburnu" }
    ]
  },
  {
    id: "izmir",
    name: "İzmir",
    plate: "35",
    districts: [
      { id: "izmir-alsancak", name: "Alsancak" },
      { id: "izmir-balçova", name: "Balçova" },
      { id: "izmir-bayindir", name: "Bayındır" },
      { id: "izmir-bayrakli", name: "Bayraklı" },
      { id: "izmir-bergama", name: "Bergama" },
      { id: "izmir-beydağ", name: "Beydağ" },
      { id: "izmir-bornova", name: "Bornova" },
      { id: "izmir-buca", name: "Buca" },
      { id: "izmir-çesme", name: "Çeşme" },
      { id: "izmir-çigli", name: "Çiğli" },
      { id: "izmir-dikili", name: "Dikili" },
      { id: "izmir-foça", name: "Foça" },
      { id: "izmir-gaziemir", name: "Gaziemir" },
      { id: "izmir-güzelbahçe", name: "Güzelbahçe" },
      { id: "izmir-karabağlar", name: "Karabağlar" },
      { id: "izmir-karaburun", name: "Karaburun" },
      { id: "izmir-karşıyaka", name: "Karşıyaka" },
      { id: "izmir-kemalpaşa", name: "Kemalpaşa" },
      { id: "izmir-kinik", name: "Kınık" },
      { id: "izmir-kiraz", name: "Kiraz" },
      { id: "izmir-konak", name: "Konak" },
      { id: "izmir-menemen", name: "Menemen" },
      { id: "izmir-narliDere", name: "Narlıdere" },
      { id: "izmir-ödemiş", name: "Ödemiş" },
      { id: "izmir-seferihisar", name: "Seferihisar" },
      { id: "izmir-selçuk", name: "Selçuk" },
      { id: "izmir-tire", name: "Tire" },
      { id: "izmir-torbali", name: "Torbalı" },
      { id: "izmir-urla", name: "Urla" }
    ]
  },
  {
    id: "kars",
    name: "Kars",
    plate: "36",
    districts: [
      { id: "kars-merkez", name: "Merkez" },
      { id: "kars-akçakale", name: "Akyaka" },
      { id: "kars-aralik", name: "Aralık" },
      { id: "kars-digor", name: "Digor" },
      { id: "kars-kağizman", name: "Kağızman" },
      { id: "kars-sarıkamış", name: "Sarıkamış" },
      { id: "kars-selim", name: "Selim" },
      { id: "kars-susuz", name: "Susuz" }
    ]
  },
  {
    id: "kastamonu",
    name: "Kastamonu",
    plate: "37",
    districts: [
      { id: "kastamonu-merkez", name: "Merkez" },
      { id: "kastamonu-abana", name: "Abana" },
      { id: "kastamonu-agaçören", name: "Ağlı" },
      { id: "kastamonu-araci", name: "Araç" },
      { id: "kastamonu-azdavay", name: "Azdavay" },
      { id: "kastamonu-bozkurt", name: "Bozkurt" },
      { id: "kastamonu-cide", name: "Cide" },
      { id: "kastamonu-çatalzeytin", name: "Çatalzeytin" },
      { id: "kastamonu-daday", name: "Daday" },
      { id: "kastamonu-devrekani", name: "Devrekani" },
      { id: "kastamonu-dögermez", name: "Doğanyurt" },
      { id: "kastamonu-hanönü", name: "Hanönü" },
      { id: "kastamonu-iğdir", name: "İhsangazi" },
      { id: "kastamonu-inebolu", name: "İnebolu" },
      { id: "kastamonu-küre", name: "Küre" },
      { id: "kastamonu-pinarbasi", name: "Pınarbaşı" },
      { id: "kastamonu-seydisehir", name: "Seydiler" },
      { id: "kastamonu-taşköprü", name: "Taşköprü" },
      { id: "kastamonu-tosya", name: "Tosya" }
    ]
  },
  {
    id: "kayseri",
    name: "Kayseri",
    plate: "38",
    districts: [
      { id: "kayseri-melikgazi", name: "Melikgazi" },
      { id: "kayseri-kocasinan", name: "Kocasinan" },
      { id: "kayseri-talas", name: "Talas" },
      { id: "kayseri-develi", name: "Develi" },
      { id: "kayseri-hacilar", name: "Hacılar" },
      { id: "kayseri-incesu", name: "İncesu" },
      { id: "kayseri-pinarbasi", name: "Pınarbaşı" },
      { id: "kayseri-sarioglan", name: "Sarıoğlan" },
      { id: "kayseri-sarız", name: "Sarız" },
      { id: "kayseri-tomarza", name: "Tomarza" },
      { id: "kayseri-yahyali", name: "Yahyalı" },
      { id: "kayseri-yesilhisar", name: "Yeşilhisar" },
      { id: "kayseri-bünyan", name: "Bünyan" },
      { id: "kayseri-felahiye", name: "Felahiye" },
      { id: "kayseri-özvatan", name: "Özvatan" }
    ]
  },
  {
    id: "kirklareli",
    name: "Kırklareli",
    plate: "39",
    districts: [
      { id: "kirklareli-merkez", name: "Merkez" },
      { id: "kirklareli-babaeski", name: "Babaeski" },
      { id: "kirklareli-demirköy", name: "Demirköy" },
      { id: "kirklareli-kofçaz", name: "Kofçaz" },
      { id: "kirklareli-lüleburgaz", name: "Lüleburgaz" },
      { id: "kirklareli-pehlivanköy", name: "Pehlivanköy" },
      { id: "kirklareli-pinarhisar", name: "Pınarhisar" },
      { id: "kirklareli-vize", name: "Vize" }
    ]
  },
  {
    id: "kirşehir",
    name: "Kırşehir",
    plate: "40",
    districts: [
      { id: "kirşehir-merkez", name: "Merkez" },
      { id: "kirşehir-akçakent", name: "Akçakent" },
      { id: "kirşehir-akpinar", name: "Akpınar" },
      { id: "kirşehir-boztepe", name: "Boztepe" },
      { id: "kirşehir-çicekdagi", name: "Çiçekdağı" },
      { id: "kirşehir-kaman", name: "Kaman" },
      { id: "kirşehir-mucur", name: "Mucur" }
    ]
  },
  {
    id: "kocaeli",
    name: "Kocaeli",
    plate: "41",
    districts: [
      { id: "kocaeli-izmit", name: "İzmit" },
      { id: "kocaeli-basiskele", name: "Başiskele" },
      { id: "kocaeli-çayirova", name: "Çayırova" },
      { id: "kocaeli-dilovasi", name: "Dilovası" },
      { id: "kocaeli-gebze", name: "Gebze" },
      { id: "kocaeli-gölcük", name: "Gölcük" },
      { id: "kocaeli-kandira", name: "Kandıra" },
      { id: "kocaeli-karamürsel", name: "Karamürsel" },
      { id: "kocaeli-kartepe", name: "Kartepe" },
      { id: "kocaeli-körfez", name: "Körfez" },
      { id: "kocaeli-derince", name: "Derince" }
    ]
  },
  {
    id: "konya",
    name: "Konya",
    plate: "42",
    districts: [
      { id: "konya-karatay", name: "Karatay" },
      { id: "konya-meram", name: "Meram" },
      { id: "konya-selçuklu", name: "Selçuklu" },
      { id: "konya-akören", name: "Akören" },
      { id: "konya-akşehir", name: "Akşehir" },
      { id: "konya-beyşehir", name: "Beyşehir" },
      { id: "konya-bozkir", name: "Bozkır" },
      { id: "konya-cihanbeyli", name: "Cihanbeyli" },
      { id: "konya-çeltik", name: "Çeltik" },
      { id: "konya-çumra", name: "Çumra" },
      { id: "konya-derbent", name: "Derbent" },
      { id: "konya-derebucak", name: "Derebucak" },
      { id: "konya-doganhisar", name: "Doğanhisar" },
      { id: "konya-emirgazi", name: "Emirgazi" },
      { id: "konya-ereğli", name: "Ereğli" },
      { id: "konya-güneysinir", name: "Güneysınır" },
      { id: "konya-hadim", name: "Hadim" },
      { id: "konya-halkapinar", name: "Halkapınar" },
      { id: "konya-hüyük", name: "Hüyük" },
      { id: "konya-ilgin", name: "Ilgın" },
      { id: "konya-kadınhani", name: "Kadınhanı" },
      { id: "konya-karapinar", name: "Karapınar" },
      { id: "konya-kulu", name: "Kulu" },
      { id: "konya-sarayönü", name: "Sarayönü" },
      { id: "konya-seydisehir", name: "Seydişehir" },
      { id: "konya-taskent", name: "Taşkent" },
      { id: "konya-tuzlukçu", name: "Tuzlukçu" },
      { id: "konya-yalihüyük", name: "Yalıhüyük" }
    ]
  },
  {
    id: "kütahya",
    name: "Kütahya",
    plate: "43",
    districts: [
      { id: "kütahya-merkez", name: "Merkez" },
      { id: "kütahya-altintas", name: "Altıntaş" },
      { id: "kütahya-aslanapa", name: "Aslanapa" },
      { id: "kütahya-çavdarhisar", name: "Çavdarhisar" },
      { id: "kütahya-domaniç", name: "Domaniç" },
      { id: "kütahya-dumlupinar", name: "Dumlupınar" },
      { id: "kütahya-emin", name: "Emet" },
      { id: "kütahya-gediz", name: "Gediz" },
      { id: "kütahya-hisarcik", name: "Hisarcık" },
      { id: "kütahya-pazarlar", name: "Pazarlar" },
      { id: "kütahya-saphane", name: "Sapanca" },
      { id: "kütahya-simav", name: "Simav" },
      { id: "kütahya-tavşanli", name: "Tavşanlı" }
    ]
  },
  {
    id: "malatya",
    name: "Malatya",
    plate: "44",
    districts: [
      { id: "malatya-battalgazi", name: "Battalgazi" },
      { id: "malatya-yeşilyurt", name: "Yeşilyurt" },
      { id: "malatya-akçadağ", name: "Akçadağ" },
      { id: "malatya-arapgir", name: "Arapgir" },
      { id: "malatya-arguvan", name: "Arguvan" },
      { id: "malatya-darende", name: "Darende" },
      { id: "malatya-doğanşehir", name: "Doğanşehir" },
      { id: "malatya-doğanyol", name: "Doğanyol" },
      { id: "malatya-hekimhan", name: "Hekimhan" },
      { id: "malatya-kale", name: "Kale" },
      { id: "malatya-kuluncak", name: "Kuluncak" },
      { id: "malatya-pütürge", name: "Pütürge" },
      { id: "malatya-yazihan", name: "Yazıhan" }
    ]
  },
  {
    id: "manisa",
    name: "Manisa",
    plate: "45",
    districts: [
      { id: "manisa-merkez", name: "Merkez" },
      { id: "manisa-ahmetli", name: "Ahmetli" },
      { id: "manisa-akhisar", name: "Akhisar" },
      { id: "manisa-alaşehir", name: "Alaşehir" },
      { id: "manisa-demirci", name: "Demirci" },
      { id: "manisa-gölmarmara", name: "Gölmarmara" },
      { id: "manisa-gördes", name: "Gördes" },
      { id: "manisa-kirkagaç", name: "Kırkağaç" },
      { id: "manisa-köprübaşi", name: "Köprübaşı" },
      { id: "manisa-kula", name: "Kula" },
      { id: "manisa-salihli", name: "Salihli" },
      { id: "manisa-sarıgöl", name: "Sarıgöl" },
      { id: "manisa-saruhanli", name: "Saruhanlı" },
      { id: "manisa-selendi", name: "Selendi" },
      { id: "manisa-soma", name: "Soma" },
      { id: "manisa-şehzadeler", name: "Şehzadeler" },
      { id: "manisa-yunusemre", name: "Yunusemre" },
      { id: "manisa-turgutlu", name: "Turgutlu" }
    ]
  },
  {
    id: "kahramanmaraş",
    name: "Kahramanmaraş",
    plate: "46",
    districts: [
      { id: "kahramanmaraş-dulkadiroğlu", name: "Dulkadiroğlu" },
      { id: "kahramanmaraş-onikişubat", name: "Onikişubat" },
      { id: "kahramanmaraş-afşin", name: "Afşin" },
      { id: "kahramanmaraş-andirin", name: "Andırın" },
      { id: "kahramanmaraş-çaglayancerit", name: "Çağlayancerit" },
      { id: "kahramanmaraş-ekinözü", name: "Ekinözü" },
      { id: "kahramanmaraş-elbistan", name: "Elbistan" },
      { id: "kahramanmaraş-göksun", name: "Göksun" },
      { id: "kahramanmaraş-nurhak", name: "Nurhak" },
      { id: "kahramanmaraş-pazarcik", name: "Pazarcık" },
      { id: "kahramanmaraş-türkoğlu", name: "Türkoğlu" }
    ]
  },
  {
    id: "mardin",
    name: "Mardin",
    plate: "47",
    districts: [
      { id: "mardin-artuklu", name: "Artuklu" },
      { id: "mardin-dargeçit", name: "Dargeçit" },
      { id: "mardin-derik", name: "Derik" },
      { id: "mardin-kiziltepe", name: "Kızıltepe" },
      { id: "mardin-mazidagi", name: "Mazıdağı" },
      { id: "mardin-midyat", name: "Midyat" },
      { id: "mardin-nusaybin", name: "Nusaybin" },
      { id: "mardin-ömerli", name: "Ömerli" },
      { id: "mardin-savur", name: "Savur" },
      { id: "mardin-yeşilli", name: "Yeşilli" }
    ]
  },
  {
    id: "muğla",
    name: "Muğla",
    plate: "48",
    districts: [
      { id: "muğla-merkez", name: "Merkez" },
      { id: "muğla-bodrum", name: "Bodrum" },
      { id: "muğla-dalaman", name: "Dalaman" },
      { id: "muğla-datça", name: "Datça" },
      { id: "muğla-fethiye", name: "Fethiye" },
      { id: "muğla-kavaklidere", name: "Kavaklıdere" },
      { id: "muğla-köyceğiz", name: "Köyceğiz" },
      { id: "muğla-marmaris", name: "Marmaris" },
      { id: "muğla-mentese", name: "Menteşe" },
      { id: "muğla-milas", name: "Milas" },
      { id: "muğla-ortaca", name: "Ortaca" },
      { id: "muğla-seydikemer", name: "Seydikemer" },
      { id: "muğla-ula", name: "Ula" },
      { id: "muğla-yatagan", name: "Yatağan" }
    ]
  },
  {
    id: "muş",
    name: "Muş",
    plate: "49",
    districts: [
      { id: "muş-merkez", name: "Merkez" },
      { id: "muş-bulanik", name: "Bulanık" },
      { id: "muş-hasköy", name: "Hasköy" },
      { id: "muş-korkut", name: "Korkut" },
      { id: "muş-malazgirt", name: "Malazgirt" },
      { id: "muş-varto", name: "Varto" }
    ]
  },
  {
    id: "nevşehir",
    name: "Nevşehir",
    plate: "50",
    districts: [
      { id: "nevşehir-merkez", name: "Merkez" },
      { id: "nevşehir-acigöl", name: "Acıgöl" },
      { id: "nevşehir-avanos", name: "Avanos" },
      { id: "nevşehir-çavusin", name: "Çavuşin" },
      { id: "nevşehir-derinkuyu", name: "Derinkuyu" },
      { id: "nevşehir-gülşehir", name: "Gülşehir" },
      { id: "nevşehir-hacibektas", name: "Hacıbektaş" },
      { id: "nevşehir-kozakli", name: "Kozaklı" },
      { id: "nevşehir-urgup", name: "Ürgüp" }
    ]
  },
  {
    id: "niğde",
    name: "Niğde",
    plate: "51",
    districts: [
      { id: "niğde-merkez", name: "Merkez" },
      { id: "niğde-altunhisar", name: "Altunhisar" },
      { id: "niğde-bor", name: "Bor" },
      { id: "niğde-çamard", name: "Çamardı" },
      { id: "niğde-çiftlik", name: "Çiftlik" },
      { id: "niğde-ulukisla", name: "Ulukışla" }
    ]
  },
  {
    id: "ordu",
    name: "Ordu",
    plate: "52",
    districts: [
      { id: "ordu-altinordu", name: "Altınordu" },
      { id: "ordu-akkuş", name: "Akkuş" },
      { id: "ordu-aybasti", name: "Aybastı" },
      { id: "ordu-çamaş", name: "Çamaş" },
      { id: "ordu-çatalpinar", name: "Çatalpınar" },
      { id: "ordu-çaybaşi", name: "Çaybaşı" },
      { id: "ordu-fatsa", name: "Fatsa" },
      { id: "ordu-gölköy", name: "Gölköy" },
      { id: "ordu-gülyali", name: "Gülyalı" },
      { id: "ordu-gürgentepe", name: "Gürgentepe" },
      { id: "ordu-ikizce", name: "İkizce" },
      { id: "ordu-kabadüz", name: "Kabadüz" },
      { id: "ordu-kabataş", name: "Kabataş" },
      { id: "ordu-korgan", name: "Korgan" },
      { id: "ordu-kumru", name: "Kumru" },
      { id: "ordu-mesudiye", name: "Mesudiye" },
      { id: "ordu-perşembe", name: "Perşembe" },
      { id: "ordu-ulubey", name: "Ulubey" },
      { id: "ordu-üniye", name: "Ünye" }
    ]
  },
  {
    id: "rize",
    name: "Rize",
    plate: "53",
    districts: [
      { id: "rize-merkez", name: "Merkez" },
      { id: "rize-ardesen", name: "Ardeşen" },
      { id: "rize-çayeli", name: "Çayeli" },
      { id: "rize-derepazari", name: "Derepazarı" },
      { id: "rize-findikli", name: "Fındıklı" },
      { id: "rize-güneysu", name: "Güneysu" },
      { id: "rize-hemşin", name: "Hemşin" },
      { id: "rize-ikizdere", name: "İkizdere" },
      { id: "rize-kalkandere", name: "Kalkandere" },
      { id: "rize-pazar", name: "Pazar" }
    ]
  },
  {
    id: "sakarya",
    name: "Sakarya",
    plate: "54",
    districts: [
      { id: "sakarya-adapazari", name: "Adapazarı" },
      { id: "sakarya-akyazi", name: "Akyazı" },
      { id: "sakarya-arifiye", name: "Arifiye" },
      { id: "sakarya-erenler", name: "Erenler" },
      { id: "sakarya-ferizli", name: "Ferizli" },
      { id: "sakarya-geyve", name: "Geyve" },
      { id: "sakarya-hendek", name: "Hendek" },
      { id: "sakarya-karapürçek", name: "Karapürçek" },
      { id: "sakarya-karasu", name: "Karasu" },
      { id: "sakarya-kaynarca", name: "Kaynarca" },
      { id: "sakarya-kocaali", name: "Kocaali" },
      { id: "sakarya-pamukova", name: "Pamukova" },
      { id: "sakarya-sapanca", name: "Sapanca" },
      { id: "sakarya-serdivan", name: "Serdivan" },
      { id: "sakarya-sögütlü", name: "Söğütlü" },
      { id: "sakarya-tarakli", name: "Taraklı" }
    ]
  },
  {
    id: "samsun",
    name: "Samsun",
    plate: "55",
    districts: [
      { id: "samsun-atakum", name: "Atakum" },
      { id: "samsun-ilkadim", name: "İlkadım" },
      { id: "samsun-canik", name: "Canik" },
      { id: "samsun-tekkkeköy", name: "Tekkeköy" },
      { id: "samsun-alaçam", name: "Alaçam" },
      { id: "samsun-asarcik", name: "Asarcık" },
      { id: "samsun-ayvacik", name: "Ayvacık" },
      { id: "samsun-bafra", name: "Bafra" },
      { id: "samsun-carsamba", name: "Çarşamba" },
      { id: "samsun-havza", name: "Havza" },
      { id: "samsun-kavak", name: "Kavak" },
      { id: "samsun-ladik", name: "Ladik" },
      { id: "samsun-ondokuzmayis", name: "19 Mayıs" },
      { id: "samsun-salipazari", name: "Salıpazarı" },
      { id: "samsun-terme", name: "Terme" },
      { id: "samsun-vezirköprü", name: "Vezirköprü" },
      { id: "samsun-yakakent", name: "Yakakent" }
    ]
  },
  {
    id: "siirt",
    name: "Siirt",
    plate: "56",
    districts: [
      { id: "siirt-merkez", name: "Merkez" },
      { id: "siirt-baykan", name: "Baykan" },
      { id: "siirt-eruh", name: "Eruh" },
      { id: "siirt-kurtalan", name: "Kurtalan" },
      { id: "siirt-pervari", name: "Pervari" },
      { id: "siirt-şirvan", name: "Şirvan" },
      { id: "siirt-tilo", name: "Tillo" }
    ]
  },
  {
    id: "sinop",
    name: "Sinop",
    plate: "57",
    districts: [
      { id: "sinop-merkez", name: "Merkez" },
      { id: "sinop-ayancik", name: "Ayancık" },
      { id: "sinop-boyabat", name: "Boyabat" },
      { id: "sinop-dikmen", name: "Dikmen" },
      { id: "sinop-durağan", name: "Durağan" },
      { id: "sinop-erfelek", name: "Erfelek" },
      { id: "sinop-gerze", name: "Gerze" },
      { id: "sinop-saraydüzü", name: "Saraydüzü" },
      { id: "sinop-türkeli", name: "Türkeli" }
    ]
  },
  {
    id: "sivas",
    name: "Sivas",
    plate: "58",
    districts: [
      { id: "sivas-merkez", name: "Merkez" },
      { id: "sivas-akincilar", name: "Akıncılar" },
      { id: "sivas-altinyayla", name: "Altınyayla" },
      { id: "sivas-divriği", name: "Divriği" },
      { id: "sivas-doganşar", name: "Doğanşar" },
      { id: "sivas-gemerek", name: "Gemerek" },
      { id: "sivas-gölova", name: "Gölova" },
      { id: "sivas-gürün", name: "Gürün" },
      { id: "sivas-hafik", name: "Hafik" },
      { id: "sivas-imranli", name: "İmranlı" },
      { id: "sivas-kangal", name: "Kangal" },
      { id: "sivas-koyulhisar", name: "Koyulhisar" },
      { id: "sivas-sarkişla", name: "Şarkışla" },
      { id: "sivas-susehri", name: "Suşehri" },
      { id: "sivas-ulasi", name: "Ulaş" },
      { id: "sivas-yildizeli", name: "Yıldızeli" },
      { id: "sivas-zara", name: "Zara" }
    ]
  },
  {
    id: "tekirdag",
    name: "Tekirdağ",
    plate: "59",
    districts: [
      { id: "tekirdag-süleymanpaşa", name: "Süleymanpaşa" },
      { id: "tekirdag-çerkezköy", name: "Çerkezköy" },
      { id: "tekirdag-çorlu", name: "Çorlu" },
      { id: "tekirdag-ergene", name: "Ergene" },
      { id: "tekirdag-hayrabolu", name: "Hayrabolu" },
      { id: "tekirdag-kapakli", name: "Kapaklı" },
      { id: "tekirdag-malkara", name: "Malkara" },
      { id: "tekirdag-marmaraereğlisi", name: "Marmaraereğlisi" },
      { id: "tekirdag-muratli", name: "Muratlı" },
      { id: "tekirdag-saray", name: "Saray" },
      { id: "tekirdag-şarköy", name: "Şarköy" }
    ]
  },
  {
    id: "tokat",
    name: "Tokat",
    plate: "60",
    districts: [
      { id: "tokat-merkez", name: "Merkez" },
      { id: "tokat-almus", name: "Almus" },
      { id: "tokat-artova", name: "Artova" },
      { id: "tokat-başçiftlik", name: "Başçiftlik" },
      { id: "tokat-erbaa", name: "Erbaa" },
      { id: "tokat-niksar", name: "Niksar" },
      { id: "tokat-pazar", name: "Pazar" },
      { id: "tokat-reşadiye", name: "Reşadiye" },
      { id: "tokat-sulusaray", name: "Sulusaray" },
      { id: "tokat-turhal", name: "Turhal" },
      { id: "tokat-yeşilyurt", name: "Yeşilyurt" },
      { id: "tokat-zile", name: "Zile" }
    ]
  },
  {
    id: "trabzon",
    name: "Trabzon",
    plate: "61",
    districts: [
      { id: "trabzon-ortahisar", name: "Ortahisar" },
      { id: "trabzon-akçaabat", name: "Akçaabat" },
      { id: "trabzon-arakli", name: "Araklı" },
      { id: "trabzon-arsin", name: "Arsin" },
      { id: "trabzon-beşikdüzü", name: "Beşikdüzü" },
      { id: "trabzon-çarşıbaşı", name: "Çarşıbaşı" },
      { id: "trabzon-çaykara", name: "Çaykara" },
      { id: "trabzon-dernekpazari", name: "Dernekpazarı" },
      { id: "trabzon-düzköy", name: "Düzköy" },
      { id: "trabzon-hayrat", name: "Hayrat" },
      { id: "trabzon-köprübaşı", name: "Köprübaşı" },
      { id: "trabzon-maçka", name: "Maçka" },
      { id: "trabzon-of", name: "Of" },
      { id: "trabzon-sürmene", name: "Sürmene" },
      { id: "trabzon-tonya", name: "Tonya" },
      { id: "trabzon-vakfikebir", name: "Vakfıkebir" },
      { id: "trabzon-yomra", name: "Yomra" }
    ]
  },
  {
    id: "tunceli",
    name: "Tunceli",
    plate: "62",
    districts: [
      { id: "tunceli-merkez", name: "Merkez" },
      { id: "tunceli-çemişgezek", name: "Çemişgezek" },
      { id: "tunceli-hozat", name: "Hozat" },
      { id: "tunceli-mazgirt", name: "Mazgirt" },
      { id: "tunceli-nazimiye", name: "Nazımiye" },
      { id: "tunceli-ovacik", name: "Ovacık" },
      { id: "tunceli-pertek", name: "Pertek" },
      { id: "tunceli-pülümür", name: "Pülümür" }
    ]
  },
  {
    id: "şanliurfa",
    name: "Şanlıurfa",
    plate: "63",
    districts: [
      { id: "şanliurfa-eyyübiye", name: "Eyyübiye" },
      { id: "şanliurfa-haliliye", name: "Haliliye" },
      { id: "şanliurfa-karaköprü", name: "Karaköprü" },
      { id: "şanliurfa-akçakale", name: "Akçakale" },
      { id: "şanliurfa-birecik", name: "Birecik" },
      { id: "şanliurfa-bozova", name: "Bozova" },
      { id: "şanliurfa-ceylanpinar", name: "Ceylanpınar" },
      { id: "şanliurfa-halfeti", name: "Halfeti" },
      { id: "şanliurfa-harran", name: "Harran" },
      { id: "şanliurfa-hilan", name: "Hilvan" },
      { id: "şanliurfa-siverek", name: "Siverek" },
      { id: "şanliurfa-suruç", name: "Suruç" },
      { id: "şanliurfa-viranşehir", name: "Viranşehir" }
    ]
  },
  {
    id: "uşak",
    name: "Uşak",
    plate: "64",
    districts: [
      { id: "uşak-merkez", name: "Merkez" },
      { id: "uşak-banaz", name: "Banaz" },
      { id: "uşak-esme", name: "Eşme" },
      { id: "uşak-karahalli", name: "Karahallı" },
      { id: "uşak-sivasli", name: "Sivaslı" },
      { id: "uşak-ulubey", name: "Ulubey" }
    ]
  },
  {
    id: "van",
    name: "Van",
    plate: "65",
    districts: [
      { id: "van-edremit", name: "Edremit" },
      { id: "van-ipekyolu", name: "İpekyolu" },
      { id: "van-tuşba", name: "Tuşba" },
      { id: "van-bahçesaray", name: "Bahçesaray" },
      { id: "van-başkale", name: "Başkale" },
      { id: "van-çaldıran", name: "Çaldıran" },
      { id: "van-çatak", name: "Çatak" },
      { id: "van-erciş", name: "Erciş" },
      { id: "van-gürpinar", name: "Gürpınar" },
      { id: "van-muradiye", name: "Muradiye" },
      { id: "van-özalp", name: "Özalp" },
      { id: "van-sarıçay", name: "Sarıçay" }
    ]
  },
  {
    id: "yozgat",
    name: "Yozgat",
    plate: "66",
    districts: [
      { id: "yozgat-merkez", name: "Merkez" },
      { id: "yozgat-akdagmadeni", name: "Akdagmadeni" },
      { id: "yozgat-aydincik", name: "Aydıncık" },
      { id: "yozgat-boğazliyan", name: "Boğazlıyan" },
      { id: "yozgat-çandir", name: "Çandır" },
      { id: "yozgat-çayiralan", name: "Çayıralan" },
      { id: "yozgat-çekerek", name: "Çekerek" },
      { id: "yozgat-kadisehri", name: "Kadışehri" },
      { id: "yozgat-saraykent", name: "Saraykent" },
      { id: "yozgat-sarikaya", name: "Sarıkaya" },
      { id: "yozgat-sorgun", name: "Sorgun" },
      { id: "yozgat-şefaatli", name: "Şefaatli" },
      { id: "yozgat-yerköy", name: "Yerköy" }
    ]
  },
  {
    id: "zonguldak",
    name: "Zonguldak",
    plate: "67",
    districts: [
      { id: "zonguldak-merkez", name: "Merkez" },
      { id: "zonguldak-alapli", name: "Alaplı" },
      { id: "zonguldak-çaycuma", name: "Çaycuma" },
      { id: "zonguldak-devrek", name: "Devrek" },
      { id: "zonguldak-gökçebey", name: "Gökçebey" },
      { id: "zonguldak-kilimli", name: "Kilimli" },
      { id: "zonguldak-kozlu", name: "Kozlu" }
    ]
  },
  {
    id: "aksaray",
    name: "Aksaray",
    plate: "68",
    districts: [
      { id: "aksaray-merkez", name: "Merkez" },
      { id: "aksaray-ağaçören", name: "Ağaçören" },
      { id: "aksaray-eskil", name: "Eskil" },
      { id: "aksaray-gülağaç", name: "Gülağaç" },
      { id: "aksaray-güzelyurt", name: "Güzelyurt" },
      { id: "aksaray-ortaköy", name: "Ortaköy" },
      { id: "aksaray-sariyahşi", name: "Sarıyahşi" }
    ]
  },
  {
    id: "bayburt",
    name: "Bayburt",
    plate: "69",
    districts: [
      { id: "bayburt-merkez", name: "Merkez" },
      { id: "bayburt-aydintepe", name: "Aydıntepe" },
      { id: "bayburt-demirözü", name: "Demirözü" }
    ]
  },
  {
    id: "karaman",
    name: "Karaman",
    plate: "70",
    districts: [
      { id: "karaman-merkez", name: "Merkez" },
      { id: "karaman-ayranş", name: "Ayrancı" },
      { id: "karaman-başyayla", name: "Başyayla" },
      { id: "karaman-ermenek", name: "Ermenek" },
      { id: "karaman-kazimkarabekir", name: "Kazımkarabekir" },
      { id: "karaman-sarıveliler", name: "Sarıveliler" }
    ]
  },
  {
    id: "kirikkale",
    name: "Kırıkkale",
    plate: "71",
    districts: [
      { id: "kirikkale-merkez", name: "Merkez" },
      { id: "kirikkale-bahşili", name: "Bahşili" },
      { id: "kirikkale-balışeyh", name: "Balışeyh" },
      { id: "kirikkale-çelebi", name: "Çelebi" },
      { id: "kirikkale-delice", name: "Delice" },
      { id: "kirikkale-karakeçili", name: "Karakeçili" },
      { id: "kirikkale-keskin", name: "Keskin" },
      { id: "kirikkale-sulakyurt", name: "Sulakyurt" },
      { id: "kirikkale-yahşihan", name: "Yahşihan" }
    ]
  },
  {
    id: "batman",
    name: "Batman",
    plate: "72",
    districts: [
      { id: "batman-merkez", name: "Merkez" },
      { id: "batman-besiri", name: "Beşiri" },
      { id: "batman-gercüş", name: "Gercüş" },
      { id: "batman-hasankeyf", name: "Hasankeyf" },
      { id: "batman-kozluk", name: "Kozluk" },
      { id: "batman-sason", name: "Sason" }
    ]
  },
  {
    id: "şirnak",
    name: "Şırnak",
    plate: "73",
    districts: [
      { id: "şirnak-merkez", name: "Merkez" },
      { id: "şirnak-beytüşşebap", name: "Beytüşşebap" },
      { id: "şirnak-cizre", name: "Cizre" },
      { id: "şirnak-güçlükonak", name: "Güçlükonak" },
      { id: "şirnak-idil", name: "İdil" },
      { id: "şirnak-silopi", name: "Silopi" },
      { id: "şirnak-uludere", name: "Uludere" }
    ]
  },
  {
    id: "bartin",
    name: "Bartın",
    plate: "74",
    districts: [
      { id: "bartin-merkez", name: "Merkez" },
      { id: "bartin-amasra", name: "Amasra" },
      { id: "bartin-kurucaşile", name: "Kurucaşile" },
      { id: "bartin-ulus", name: "Ulus" }
    ]
  },
  {
    id: "ardahan",
    name: "Ardahan",
    plate: "75",
    districts: [
      { id: "ardahan-merkez", name: "Merkez" },
      { id: "ardahan-çildir", name: "Çıldır" },
      { id: "ardahan-damal", name: "Damal" },
      { id: "ardahan-göle", name: "Göle" },
      { id: "ardahan-hanak", name: "Hanak" },
      { id: "ardahan-posof", name: "Posof" }
    ]
  },
  {
    id: "igdir",
    name: "Iğdır",
    plate: "76",
    districts: [
      { id: "igdir-merkez", name: "Merkez" },
      { id: "igdir-arak", name: "Aralık" },
      { id: "igdir-karakoyunlu", name: "Karakoyunlu" },
      { id: "igdir-tuzluca", name: "Tuzluca" }
    ]
  },
  {
    id: "yalova",
    name: "Yalova",
    plate: "77",
    districts: [
      { id: "yalova-merkez", name: "Merkez" },
      { id: "yalova-altinova", name: "Altınova" },
      { id: "yalova-çiftlikköy", name: "Çiftlikköy" },
      { id: "yalova-çınarcik", name: "Çınarcık" },
      { id: "yalova-çınarcik", name: "Çınarcık" },
      { id: "yalova-termal", name: "Termal" },
      { id: "yalova-ardal", name: "Armutlu" }
    ]
  },
  {
    id: "karabük",
    name: "Karabük",
    plate: "78",
    districts: [
      { id: "karabük-merkez", name: "Merkez" },
      { id: "karabük-eflani", name: "Eflani" },
      { id: "karabük-eskipazar", name: "Eskipazar" },
      { id: "karabük-ovacik", name: "Ovacık" },
      { id: "karabük-safranbolu", name: "Safranbolu" },
      { id: "karabük-yenice", name: "Yenice" }
    ]
  },
  {
    id: "kilis",
    name: "Kilis",
    plate: "79",
    districts: [
      { id: "kilis-merkez", name: "Merkez" },
      { id: "kilis-elbeyli", name: "Elbeyli" },
      { id: "kilis-musabeyli", name: "Musabeyli" },
      { id: "kilis-polateli", name: "Polateli" }
    ]
  },
  {
    id: "osmaniye",
    name: "Osmaniye",
    plate: "80",
    districts: [
      { id: "osmaniye-merkez", name: "Merkez" },
      { id: "osmaniye-bahçe", name: "Bahçe" },
      { id: "osmaniye-düziçi", name: "Düziçi" },
      { id: "osmaniye-hasanbeyli", name: "Hasanbeyli" },
      { id: "osmaniye-kadirli", name: "Kadirli" },
      { id: "osmaniye-sumbas", name: "Sumbas" },
      { id: "osmaniye-toprakkale", name: "Toprakkale" }
    ]
  },
  {
    id: "düzce",
    name: "Düzce",
    plate: "81",
    districts: [
      { id: "düzce-merkez", name: "Merkez" },
      { id: "düzce-akçakoca", name: "Akçakoca" },
      { id: "düzce-cumayeri", name: "Cumayeri" },
      { id: "düzce-çilimli", name: "Çilimli" },
      { id: "düzce-gölyaka", name: "Gölyaka" },
      { id: "düzce-gümüşova", name: "Gümüşova" },
      { id: "düzce-kaynaşli", name: "Kaynaşlı" },
      { id: "düzce-yigilca", name: "Yığılca" }
    ]
  }
];

// Helper functions
export const getProvinceById = (id: string): Province | undefined => {
  return TURKEY_PROVINCES.find(province => province.id === id);
};

export const getDistrictById = (provinceId: string, districtId: string): District | undefined => {
  const province = getProvinceById(provinceId);
  return province?.districts.find(district => district.id === districtId);
};

export const getProvinceName = (id: string): string => {
  return getProvinceById(id)?.name || id;
};

export const getDistrictName = (provinceId: string, districtId: string): string => {
  return getDistrictById(provinceId, districtId)?.name || districtId;
};

export const getProvinceOptions = () => {
  return TURKEY_PROVINCES.map(province => ({
    value: province.id,
    label: province.name
  }));
};

export const getDistrictOptions = (provinceId: string) => {
  const province = getProvinceById(provinceId);
  return province?.districts.map(district => ({
    value: district.id,
    label: district.name
  })) || [];
};

// Helper functions for name-based lookups (used in forms)
export const getProvinceByName = (name: string): Province | undefined => {
  return TURKEY_PROVINCES.find(province => province.name === name);
};

export const getDistrictsByProvince = (provinceName: string): District[] => {
  const province = getProvinceByName(provinceName);
  return province?.districts || [];
};