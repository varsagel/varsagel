import YEDEK_PARCA_STRUCTURE from './yedek-parca-structure.json';
import ALISVERIS_STRUCTURE from './alisveris-structure.json';
import SANAYI_STRUCTURE from './sanayi-structure.json';
import OZEL_DERS_STRUCTURE from './xlsx-structures/ozel-ders-arayanlar.json';
import YARDIMCI_STRUCTURE from './xlsx-structures/yardimci-arayanlar.json';
import HAYVANLAR_STRUCTURE from './xlsx-structures/hayvanlar-alemi.json';
import IS_ARAYANLAR_STRUCTURE from './xlsx-structures/is-arayanlar.json';
import EMLAK_STRUCTURE from '../../scripts/emlak-structure.json';

export type SubCategory = {
  name: string;
  slug: string;
  fullSlug?: string;
  subcategories?: SubCategory[];
};

export type Category = {
  name: string;
  slug: string;
  icon?: string;
  subcategories: SubCategory[];
};

// Sahibinden ve genel pazar yeri standartlarına uygun kategori yapısı
export const CATEGORIES: Category[] = [
  {
  "name": "EMLAK",
  "slug": "emlak",
  "icon": "🏠",
  "subcategories": [
    {
      "name": "KONUT",
      "slug": "konut",
      "subcategories": [
        {
          "name": "SATILIK",
          "slug": "konut-satilik",
          "subcategories": [
            {
              "name": "DAİRE",
              "slug": "konut-satilik-daire"
            },
            {
              "name": "REZİDANS",
              "slug": "konut-satilik-rezidans"
            },
            {
              "name": "MÜSTAKİL EV",
              "slug": "konut-satilik-mustakil-ev"
            },
            {
              "name": "VİLLA",
              "slug": "konut-satilik-villa"
            },
            {
              "name": "ÇİFLİK EVİ",
              "slug": "konut-satilik-ciflik-evi"
            },
            {
              "name": "KÖŞK/KONAK",
              "slug": "konut-satilik-koskkonak"
            },
            {
              "name": "YALI",
              "slug": "konut-satilik-yali"
            },
            {
              "name": "YALI DAİRESİ",
              "slug": "konut-satilik-yali-dairesi"
            },
            {
              "name": "YAZLIK",
              "slug": "konut-satilik-yazlik"
            }
          ]
        },
        {
          "name": "KİRALIK",
          "slug": "konut-kiralik",
          "subcategories": [
            {
              "name": "YAZLIK",
              "slug": "konut-kiralik-yazlik"
            },
            {
              "name": "DAİRE",
              "slug": "konut-kiralik-daire"
            },
            {
              "name": "REZİDANS",
              "slug": "konut-kiralik-rezidans"
            },
            {
              "name": "MÜSTAKİL EV",
              "slug": "konut-kiralik-mustakil-ev"
            },
            {
              "name": "VİLLA",
              "slug": "konut-kiralik-villa"
            },
            {
              "name": "ÇİFLİK EVİ",
              "slug": "konut-kiralik-ciflik-evi"
            },
            {
              "name": "KÖŞK/KONAK",
              "slug": "konut-kiralik-koskkonak"
            },
            {
              "name": "YALI",
              "slug": "konut-kiralik-yali"
            },
            {
              "name": "YALI DAİRESİ",
              "slug": "konut-kiralik-yali-dairesi"
            }
          ]
        },
        {
          "name": "TURİSTİK GÜNLÜK KİRALIK",
          "slug": "konut-turistik-gunluk-kiralik",
          "subcategories": [
            {
              "name": "DAİRE",
              "slug": "konut-turistik-gunluk-kiralik-daire"
            },
            {
              "name": "REZİDANS",
              "slug": "konut-turistik-gunluk-kiralik-rezidans"
            },
            {
              "name": "MÜSTAKİL EV",
              "slug": "konut-turistik-gunluk-kiralik-mustakil-ev"
            },
            {
              "name": "VİLLA",
              "slug": "konut-turistik-gunluk-kiralik-villa"
            },
            {
              "name": "DEVRE MÜLK",
              "slug": "konut-turistik-gunluk-kiralik-devre-mulk"
            },
            {
              "name": "APART/PANSİYON",
              "slug": "konut-turistik-gunluk-kiralik-apartpansiyon"
            }
          ]
        },
        {
          "name": "Devren Satılık Konut",
          "slug": "konut-devren-satilik-konut",
          "subcategories": [
            {
              "name": "APART/PANSİYON",
              "slug": "konut-devren-satilik-konut-apartpansiyon"
            },
            {
              "name": "Daire",
              "slug": "konut-devren-satilik-konut-daire"
            },
            {
              "name": "Villa",
              "slug": "konut-devren-satilik-konut-villa"
            }
          ]
        }
      ]
    },
    {
      "name": "İş Yeri",
      "slug": "is-yeri",
      "subcategories": [
        {
          "name": "Devren Satılık Konut",
          "slug": "is-yeri-devren-satilik-konut",
          "subcategories": [
            {
              "name": "Villa",
              "slug": "is-yeri-devren-satilik-konut-villa"
            }
          ]
        },
        {
          "name": "Satılık",
          "slug": "is-yeri-satilik",
          "subcategories": [
            {
              "name": "Villa",
              "slug": "is-yeri-satilik-villa"
            },
            {
              "name": "Akaryakıt İstasyonu",
              "slug": "is-yeri-satilik-akaryakit-istasyonu"
            },
            {
              "name": "Apartman Dairesi",
              "slug": "is-yeri-satilik-apartman-dairesi"
            },
            {
              "name": "Atölye",
              "slug": "is-yeri-satilik-atolye"
            },
            {
              "name": "AVM",
              "slug": "is-yeri-satilik-avm"
            },
            {
              "name": "Büfe",
              "slug": "is-yeri-satilik-bufe"
            },
            {
              "name": "Büro Ofis",
              "slug": "is-yeri-satilik-buro-ofis"
            },
            {
              "name": "Çiftlik",
              "slug": "is-yeri-satilik-ciftlik"
            },
            {
              "name": "Depo & Antrepo",
              "slug": "is-yeri-satilik-depo-antrepo"
            },
            {
              "name": "Düğün Salonu",
              "slug": "is-yeri-satilik-dugun-salonu"
            },
            {
              "name": "Dükkan & Mağaza",
              "slug": "is-yeri-satilik-dukkan-magaza"
            },
            {
              "name": "Enerji Santrali",
              "slug": "is-yeri-satilik-enerji-santrali"
            },
            {
              "name": "Fabrika & Üretim Tesisi",
              "slug": "is-yeri-satilik-fabrika-uretim-tesisi"
            },
            {
              "name": "Garaj & Park Yeri",
              "slug": "is-yeri-satilik-garaj-park-yeri"
            },
            {
              "name": "İmalathane",
              "slug": "is-yeri-satilik-imalathane"
            },
            {
              "name": "İş Hanı Katı & Ofisi",
              "slug": "is-yeri-satilik-is-hani-kati-ofisi"
            },
            {
              "name": "Kafe & Bar",
              "slug": "is-yeri-satilik-kafe-bar"
            },
            {
              "name": "Kantin",
              "slug": "is-yeri-satilik-kantin"
            },
            {
              "name": "Kır & Kahvaltı Bahçesi ",
              "slug": "is-yeri-satilik-kir-kahvalti-bahcesi"
            },
            {
              "name": "Kıraathane",
              "slug": "is-yeri-satilik-kiraathane"
            },
            {
              "name": "Komple Bina",
              "slug": "is-yeri-satilik-komple-bina"
            },
            {
              "name": "Maden Ocağı",
              "slug": "is-yeri-satilik-maden-ocagi"
            },
            {
              "name": "Otopark & Garaj",
              "slug": "is-yeri-satilik-otopark-garaj"
            },
            {
              "name": "Oto Yıkama & Kuaför",
              "slug": "is-yeri-satilik-oto-yikama-kuafor"
            },
            {
              "name": "Pastane, Fırın & Tatlıcı",
              "slug": "is-yeri-satilik-pastane-firin-tatlici"
            },
            {
              "name": "Pazar Yeri",
              "slug": "is-yeri-satilik-pazar-yeri"
            },
            {
              "name": "Plaza",
              "slug": "is-yeri-satilik-plaza"
            },
            {
              "name": "Plaza Katı & Ofisi",
              "slug": "is-yeri-satilik-plaza-kati-ofisi"
            },
            {
              "name": "Radyo İstasyonu & TV Kanalı",
              "slug": "is-yeri-satilik-radyo-istasyonu-tv-kanali"
            },
            {
              "name": "Restoran & Lokanta",
              "slug": "is-yeri-satilik-restoran-lokanta"
            },
            {
              "name": "Rezidans Katı & Ofisi",
              "slug": "is-yeri-satilik-rezidans-kati-ofisi"
            },
            {
              "name": "Sağlık Merkezi",
              "slug": "is-yeri-satilik-saglik-merkezi"
            },
            {
              "name": "Sinema & Konferans Salonu",
              "slug": "is-yeri-satilik-sinema-konferans-salonu"
            },
            {
              "name": "SPA, Hamam & Sauna",
              "slug": "is-yeri-satilik-spa-hamam-sauna"
            },
            {
              "name": "Yurt",
              "slug": "is-yeri-satilik-yurt"
            }
          ]
        },
        {
          "name": "Kiralık",
          "slug": "is-yeri-kiralik",
          "subcategories": [
            {
              "name": "Yurt",
              "slug": "is-yeri-kiralik-yurt"
            },
            {
              "name": "Akaryakıt İstasyonu",
              "slug": "is-yeri-kiralik-akaryakit-istasyonu"
            },
            {
              "name": "Apartman Dairesi",
              "slug": "is-yeri-kiralik-apartman-dairesi"
            },
            {
              "name": "Atölye",
              "slug": "is-yeri-kiralik-atolye"
            },
            {
              "name": "AVM",
              "slug": "is-yeri-kiralik-avm"
            },
            {
              "name": "Büfe",
              "slug": "is-yeri-kiralik-bufe"
            },
            {
              "name": "Büro Ofis",
              "slug": "is-yeri-kiralik-buro-ofis"
            },
            {
              "name": "Çiftlik",
              "slug": "is-yeri-kiralik-ciftlik"
            },
            {
              "name": "Depo & Antrepo",
              "slug": "is-yeri-kiralik-depo-antrepo"
            },
            {
              "name": "Düğün Salonu",
              "slug": "is-yeri-kiralik-dugun-salonu"
            },
            {
              "name": "Dükkan & Mağaza",
              "slug": "is-yeri-kiralik-dukkan-magaza"
            },
            {
              "name": "Enerji Santrali",
              "slug": "is-yeri-kiralik-enerji-santrali"
            },
            {
              "name": "Fabrika & Üretim Tesisi",
              "slug": "is-yeri-kiralik-fabrika-uretim-tesisi"
            },
            {
              "name": "Garaj & Park Yeri",
              "slug": "is-yeri-kiralik-garaj-park-yeri"
            },
            {
              "name": "İmalathane",
              "slug": "is-yeri-kiralik-imalathane"
            },
            {
              "name": "İş Hanı Katı & Ofisi",
              "slug": "is-yeri-kiralik-is-hani-kati-ofisi"
            },
            {
              "name": "Kafe & Bar",
              "slug": "is-yeri-kiralik-kafe-bar"
            },
            {
              "name": "Kantin",
              "slug": "is-yeri-kiralik-kantin"
            },
            {
              "name": "Kır & Kahvaltı Bahçesi ",
              "slug": "is-yeri-kiralik-kir-kahvalti-bahcesi"
            },
            {
              "name": "Kıraathane",
              "slug": "is-yeri-kiralik-kiraathane"
            },
            {
              "name": "Komple Bina",
              "slug": "is-yeri-kiralik-komple-bina"
            },
            {
              "name": "Maden Ocağı",
              "slug": "is-yeri-kiralik-maden-ocagi"
            },
            {
              "name": "Otopark & Garaj",
              "slug": "is-yeri-kiralik-otopark-garaj"
            },
            {
              "name": "Oto Yıkama & Kuaför",
              "slug": "is-yeri-kiralik-oto-yikama-kuafor"
            },
            {
              "name": "Pastane, Fırın & Tatlıcı",
              "slug": "is-yeri-kiralik-pastane-firin-tatlici"
            },
            {
              "name": "Pazar Yeri",
              "slug": "is-yeri-kiralik-pazar-yeri"
            },
            {
              "name": "Plaza",
              "slug": "is-yeri-kiralik-plaza"
            },
            {
              "name": "Plaza Katı & Ofisi",
              "slug": "is-yeri-kiralik-plaza-kati-ofisi"
            },
            {
              "name": "Radyo İstasyonu & TV Kanalı",
              "slug": "is-yeri-kiralik-radyo-istasyonu-tv-kanali"
            },
            {
              "name": "Restoran & Lokanta",
              "slug": "is-yeri-kiralik-restoran-lokanta"
            },
            {
              "name": "Rezidans Katı & Ofisi",
              "slug": "is-yeri-kiralik-rezidans-kati-ofisi"
            },
            {
              "name": "Sağlık Merkezi",
              "slug": "is-yeri-kiralik-saglik-merkezi"
            },
            {
              "name": "Sinema & Konferans Salonu",
              "slug": "is-yeri-kiralik-sinema-konferans-salonu"
            },
            {
              "name": "SPA, Hamam & Sauna",
              "slug": "is-yeri-kiralik-spa-hamam-sauna"
            },
            {
              "name": "Villa",
              "slug": "is-yeri-kiralik-villa"
            }
          ]
        },
        {
          "name": "Devren Satılık",
          "slug": "is-yeri-devren-satilik",
          "subcategories": [
            {
              "name": "Acente",
              "slug": "is-yeri-devren-satilik-acente"
            },
            {
              "name": "Akaryakıt İstasyonu",
              "slug": "is-yeri-devren-satilik-akaryakit-istasyonu"
            },
            {
              "name": "Aktar & Baharatçı",
              "slug": "is-yeri-devren-satilik-aktar-baharatci"
            },
            {
              "name": "Anaokulu & Kreş",
              "slug": "is-yeri-devren-satilik-anaokulu-kres"
            },
            {
              "name": "Apartman Dairesi",
              "slug": "is-yeri-devren-satilik-apartman-dairesi"
            },
            {
              "name": "Araç Showroom & Servis",
              "slug": "is-yeri-devren-satilik-arac-showroom-servis"
            },
            {
              "name": "Atölye",
              "slug": "is-yeri-devren-satilik-atolye"
            },
            {
              "name": "AVM Standı",
              "slug": "is-yeri-devren-satilik-avm-standi"
            },
            {
              "name": "Balıkçı",
              "slug": "is-yeri-devren-satilik-balikci"
            },
            {
              "name": "Bar",
              "slug": "is-yeri-devren-satilik-bar"
            },
            {
              "name": "Bijuteri",
              "slug": "is-yeri-devren-satilik-bijuteri"
            },
            {
              "name": "Börekçi",
              "slug": "is-yeri-devren-satilik-borekci"
            },
            {
              "name": "Büfe",
              "slug": "is-yeri-devren-satilik-bufe"
            },
            {
              "name": "Büro & Ofis",
              "slug": "is-yeri-devren-satilik-buro-ofis"
            },
            {
              "name": "Cep Telefonu Dükkanı",
              "slug": "is-yeri-devren-satilik-cep-telefonu-dukkani"
            },
            {
              "name": "Çamaşırhane",
              "slug": "is-yeri-devren-satilik-camasirhane"
            },
            {
              "name": "Çay Ocağı",
              "slug": "is-yeri-devren-satilik-cay-ocagi"
            },
            {
              "name": "Çiçekçi & Fidanlık",
              "slug": "is-yeri-devren-satilik-cicekci-fidanlik"
            },
            {
              "name": "Çiftlik",
              "slug": "is-yeri-devren-satilik-ciftlik"
            },
            {
              "name": "Depo & Antrepo",
              "slug": "is-yeri-devren-satilik-depo-antrepo"
            },
            {
              "name": "Düğün Salonu",
              "slug": "is-yeri-devren-satilik-dugun-salonu"
            },
            {
              "name": "Dükkan & Mağaza",
              "slug": "is-yeri-devren-satilik-dukkan-magaza"
            },
            {
              "name": "Eczane & Medikal",
              "slug": "is-yeri-devren-satilik-eczane-medikal"
            },
            {
              "name": "Elektrikçi & Hırdavatçı",
              "slug": "is-yeri-devren-satilik-elektrikci-hirdavatci"
            },
            {
              "name": "Elektronik Mağazası",
              "slug": "is-yeri-devren-satilik-elektronik-magazasi"
            },
            {
              "name": "Enerji Santrali",
              "slug": "is-yeri-devren-satilik-enerji-santrali"
            },
            {
              "name": "Etkinlik & Performans Salonu",
              "slug": "is-yeri-devren-satilik-etkinlik-performans-salonu"
            },
            {
              "name": "Fabrika & Üretim Tesisi",
              "slug": "is-yeri-devren-satilik-fabrika-uretim-tesisi"
            },
            {
              "name": "Fotoğraf Stüdyosu",
              "slug": "is-yeri-devren-satilik-fotograf-studyosu"
            },
            {
              "name": "Gece Kulübü & Disko",
              "slug": "is-yeri-devren-satilik-gece-kulubu-disko"
            },
            {
              "name": "Giyim Mağazası",
              "slug": "is-yeri-devren-satilik-giyim-magazasi"
            },
            {
              "name": "Gözlükçü",
              "slug": "is-yeri-devren-satilik-gozlukcu"
            },
            {
              "name": "Halı Yıkama",
              "slug": "is-yeri-devren-satilik-hali-yikama"
            },
            {
              "name": "Huzur Evi",
              "slug": "is-yeri-devren-satilik-huzur-evi"
            },
            {
              "name": "İmalathane",
              "slug": "is-yeri-devren-satilik-imalathane"
            },
            {
              "name": "İnternet & Oyun Kafe",
              "slug": "is-yeri-devren-satilik-internet-oyun-kafe"
            },
            {
              "name": "İş Hanı",
              "slug": "is-yeri-devren-satilik-is-hani"
            },
            {
              "name": "İş Hanı Katı & Ofisi",
              "slug": "is-yeri-devren-satilik-is-hani-kati-ofisi"
            },
            {
              "name": "Kafe",
              "slug": "is-yeri-devren-satilik-kafe"
            },
            {
              "name": "Kantin",
              "slug": "is-yeri-devren-satilik-kantin"
            },
            {
              "name": "Kasap",
              "slug": "is-yeri-devren-satilik-kasap"
            },
            {
              "name": "Kır & Kahvaltı Bahçesi ",
              "slug": "is-yeri-devren-satilik-kir-kahvalti-bahcesi"
            },
            {
              "name": "Kıraathane",
              "slug": "is-yeri-devren-satilik-kiraathane"
            },
            {
              "name": "Kırtasiye",
              "slug": "is-yeri-devren-satilik-kirtasiye"
            },
            {
              "name": "Kozmetik Mağazası",
              "slug": "is-yeri-devren-satilik-kozmetik-magazasi"
            },
            {
              "name": "Kuaför & Güzellik Merkezi",
              "slug": "is-yeri-devren-satilik-kuafor-guzellik-merkezi"
            },
            {
              "name": "Kurs & Eğitim Merkezi",
              "slug": "is-yeri-devren-satilik-kurs-egitim-merkezi"
            },
            {
              "name": "Kuru Temizleme",
              "slug": "is-yeri-devren-satilik-kuru-temizleme"
            },
            {
              "name": "Kuruyemişçi",
              "slug": "is-yeri-devren-satilik-kuruyemisci"
            },
            {
              "name": "Kuyumcu",
              "slug": "is-yeri-devren-satilik-kuyumcu"
            },
            {
              "name": "Lunapark",
              "slug": "is-yeri-devren-satilik-lunapark"
            },
            {
              "name": "Maden Ocağı",
              "slug": "is-yeri-devren-satilik-maden-ocagi"
            },
            {
              "name": "Manav",
              "slug": "is-yeri-devren-satilik-manav"
            },
            {
              "name": "Market",
              "slug": "is-yeri-devren-satilik-market"
            },
            {
              "name": "Matbaa",
              "slug": "is-yeri-devren-satilik-matbaa"
            },
            {
              "name": "Modaevi",
              "slug": "is-yeri-devren-satilik-modaevi"
            },
            {
              "name": "Muayenehane",
              "slug": "is-yeri-devren-satilik-muayenehane"
            },
            {
              "name": "Nakliyat & Kargo",
              "slug": "is-yeri-devren-satilik-nakliyat-kargo"
            },
            {
              "name": "Nalbur",
              "slug": "is-yeri-devren-satilik-nalbur"
            },
            {
              "name": "Okul & Kurs",
              "slug": "is-yeri-devren-satilik-okul-kurs"
            },
            {
              "name": "Otopark / Garaj",
              "slug": "is-yeri-devren-satilik-otopark-garaj"
            },
            {
              "name": "Oto Servis & Bakım",
              "slug": "is-yeri-devren-satilik-oto-servis-bakim"
            },
            {
              "name": "Oto Yedek Parça",
              "slug": "is-yeri-devren-satilik-oto-yedek-parca"
            },
            {
              "name": "Oto Yıkama & Kuaför",
              "slug": "is-yeri-devren-satilik-oto-yikama-kuafor"
            },
            {
              "name": "Öğrenci Yurdu",
              "slug": "is-yeri-devren-satilik-ogrenci-yurdu"
            },
            {
              "name": "Pastane, Fırın & Tatlıcı",
              "slug": "is-yeri-devren-satilik-pastane-firin-tatlici"
            },
            {
              "name": "Pazar Yeri",
              "slug": "is-yeri-devren-satilik-pazar-yeri"
            },
            {
              "name": "Pet Shop",
              "slug": "is-yeri-devren-satilik-pet-shop"
            },
            {
              "name": "Plaza Katı & Ofisi",
              "slug": "is-yeri-devren-satilik-plaza-kati-ofisi"
            },
            {
              "name": "Prova & Kayıt Stüdyosu",
              "slug": "is-yeri-devren-satilik-prova-kayit-studyosu"
            },
            {
              "name": "Restoran & Lokanta",
              "slug": "is-yeri-devren-satilik-restoran-lokanta"
            },
            {
              "name": "Sağlık Merkezi",
              "slug": "is-yeri-devren-satilik-saglik-merkezi"
            },
            {
              "name": "Sebze & Meyve Hali",
              "slug": "is-yeri-devren-satilik-sebze-meyve-hali"
            },
            {
              "name": "Sinema & Konferans Salonu",
              "slug": "is-yeri-devren-satilik-sinema-konferans-salonu"
            },
            {
              "name": "Soğuk Hava Deposu",
              "slug": "is-yeri-devren-satilik-soguk-hava-deposu"
            },
            {
              "name": "SPA, Hamam & Sauna",
              "slug": "is-yeri-devren-satilik-spa-hamam-sauna"
            },
            {
              "name": "Spor Tesisi",
              "slug": "is-yeri-devren-satilik-spor-tesisi"
            },
            {
              "name": "Su & Tüp Bayi",
              "slug": "is-yeri-devren-satilik-su-tup-bayi"
            },
            {
              "name": "Şans Oyunları Bayisi",
              "slug": "is-yeri-devren-satilik-sans-oyunlari-bayisi"
            },
            {
              "name": "Şarküteri",
              "slug": "is-yeri-devren-satilik-sarkuteri"
            },
            {
              "name": "Taksi Durağı",
              "slug": "is-yeri-devren-satilik-taksi-duragi"
            },
            {
              "name": "Tamirhane",
              "slug": "is-yeri-devren-satilik-tamirhane"
            },
            {
              "name": "Tekel Bayi",
              "slug": "is-yeri-devren-satilik-tekel-bayi"
            },
            {
              "name": "Teknik Servis",
              "slug": "is-yeri-devren-satilik-teknik-servis"
            },
            {
              "name": "Terzi",
              "slug": "is-yeri-devren-satilik-terzi"
            },
            {
              "name": "Tuhafiye",
              "slug": "is-yeri-devren-satilik-tuhafiye"
            },
            {
              "name": "Tuvalet",
              "slug": "is-yeri-devren-satilik-tuvalet"
            },
            {
              "name": "Veteriner",
              "slug": "is-yeri-devren-satilik-veteriner"
            },
            {
              "name": "Züccaciye",
              "slug": "is-yeri-devren-satilik-zuccaciye"
            },
            {
              "name": "Harita G",
              "slug": "is-yeri-devren-satilik-harita-g"
            }
          ]
        },
        {
          "name": "Devren Kiralık",
          "slug": "is-yeri-devren-kiralik",
          "subcategories": [
            {
              "name": "Acente",
              "slug": "is-yeri-devren-kiralik-acente"
            },
            {
              "name": "Akaryakıt İstasyonu",
              "slug": "is-yeri-devren-kiralik-akaryakit-istasyonu"
            },
            {
              "name": "Aktar & Baharatçı",
              "slug": "is-yeri-devren-kiralik-aktar-baharatci"
            },
            {
              "name": "Anaokulu & Kreş",
              "slug": "is-yeri-devren-kiralik-anaokulu-kres"
            },
            {
              "name": "Apartman Dairesi",
              "slug": "is-yeri-devren-kiralik-apartman-dairesi"
            },
            {
              "name": "Araç Showroom & Servis",
              "slug": "is-yeri-devren-kiralik-arac-showroom-servis"
            },
            {
              "name": "Atölye",
              "slug": "is-yeri-devren-kiralik-atolye"
            },
            {
              "name": "AVM Standı",
              "slug": "is-yeri-devren-kiralik-avm-standi"
            },
            {
              "name": "Balıkçı",
              "slug": "is-yeri-devren-kiralik-balikci"
            },
            {
              "name": "Bar",
              "slug": "is-yeri-devren-kiralik-bar"
            },
            {
              "name": "Bijuteri",
              "slug": "is-yeri-devren-kiralik-bijuteri"
            },
            {
              "name": "Börekçi",
              "slug": "is-yeri-devren-kiralik-borekci"
            },
            {
              "name": "Büfe",
              "slug": "is-yeri-devren-kiralik-bufe"
            },
            {
              "name": "Büro & Ofis",
              "slug": "is-yeri-devren-kiralik-buro-ofis"
            },
            {
              "name": "Cep Telefonu Dükkanı",
              "slug": "is-yeri-devren-kiralik-cep-telefonu-dukkani"
            },
            {
              "name": "Çamaşırhane",
              "slug": "is-yeri-devren-kiralik-camasirhane"
            },
            {
              "name": "Çay Ocağı",
              "slug": "is-yeri-devren-kiralik-cay-ocagi"
            },
            {
              "name": "Çiçekçi & Fidanlık",
              "slug": "is-yeri-devren-kiralik-cicekci-fidanlik"
            },
            {
              "name": "Çiftlik",
              "slug": "is-yeri-devren-kiralik-ciftlik"
            },
            {
              "name": "Depo & Antrepo",
              "slug": "is-yeri-devren-kiralik-depo-antrepo"
            },
            {
              "name": "Düğün Salonu",
              "slug": "is-yeri-devren-kiralik-dugun-salonu"
            },
            {
              "name": "Dükkan & Mağaza",
              "slug": "is-yeri-devren-kiralik-dukkan-magaza"
            },
            {
              "name": "Eczane & Medikal",
              "slug": "is-yeri-devren-kiralik-eczane-medikal"
            },
            {
              "name": "Elektrikçi & Hırdavatçı",
              "slug": "is-yeri-devren-kiralik-elektrikci-hirdavatci"
            },
            {
              "name": "Elektronik Mağazası",
              "slug": "is-yeri-devren-kiralik-elektronik-magazasi"
            },
            {
              "name": "Enerji Santrali",
              "slug": "is-yeri-devren-kiralik-enerji-santrali"
            },
            {
              "name": "Etkinlik & Performans Salonu",
              "slug": "is-yeri-devren-kiralik-etkinlik-performans-salonu"
            },
            {
              "name": "Fabrika & Üretim Tesisi",
              "slug": "is-yeri-devren-kiralik-fabrika-uretim-tesisi"
            },
            {
              "name": "Fotoğraf Stüdyosu",
              "slug": "is-yeri-devren-kiralik-fotograf-studyosu"
            },
            {
              "name": "Gece Kulübü & Disko",
              "slug": "is-yeri-devren-kiralik-gece-kulubu-disko"
            },
            {
              "name": "Giyim Mağazası",
              "slug": "is-yeri-devren-kiralik-giyim-magazasi"
            },
            {
              "name": "Gözlükçü",
              "slug": "is-yeri-devren-kiralik-gozlukcu"
            },
            {
              "name": "Halı Yıkama",
              "slug": "is-yeri-devren-kiralik-hali-yikama"
            },
            {
              "name": "Huzur Evi",
              "slug": "is-yeri-devren-kiralik-huzur-evi"
            },
            {
              "name": "İmalathane",
              "slug": "is-yeri-devren-kiralik-imalathane"
            },
            {
              "name": "İnternet & Oyun Kafe",
              "slug": "is-yeri-devren-kiralik-internet-oyun-kafe"
            },
            {
              "name": "İş Hanı",
              "slug": "is-yeri-devren-kiralik-is-hani"
            },
            {
              "name": "İş Hanı Katı & Ofisi",
              "slug": "is-yeri-devren-kiralik-is-hani-kati-ofisi"
            },
            {
              "name": "Kafe",
              "slug": "is-yeri-devren-kiralik-kafe"
            },
            {
              "name": "Kantin",
              "slug": "is-yeri-devren-kiralik-kantin"
            },
            {
              "name": "Kasap",
              "slug": "is-yeri-devren-kiralik-kasap"
            },
            {
              "name": "Kır & Kahvaltı Bahçesi ",
              "slug": "is-yeri-devren-kiralik-kir-kahvalti-bahcesi"
            },
            {
              "name": "Kıraathane",
              "slug": "is-yeri-devren-kiralik-kiraathane"
            },
            {
              "name": "Kırtasiye",
              "slug": "is-yeri-devren-kiralik-kirtasiye"
            },
            {
              "name": "Kozmetik Mağazası",
              "slug": "is-yeri-devren-kiralik-kozmetik-magazasi"
            },
            {
              "name": "Kuaför & Güzellik Merkezi",
              "slug": "is-yeri-devren-kiralik-kuafor-guzellik-merkezi"
            },
            {
              "name": "Kurs & Eğitim Merkezi",
              "slug": "is-yeri-devren-kiralik-kurs-egitim-merkezi"
            },
            {
              "name": "Kuru Temizleme",
              "slug": "is-yeri-devren-kiralik-kuru-temizleme"
            },
            {
              "name": "Kuruyemişçi",
              "slug": "is-yeri-devren-kiralik-kuruyemisci"
            },
            {
              "name": "Kuyumcu",
              "slug": "is-yeri-devren-kiralik-kuyumcu"
            },
            {
              "name": "Lunapark",
              "slug": "is-yeri-devren-kiralik-lunapark"
            },
            {
              "name": "Maden Ocağı",
              "slug": "is-yeri-devren-kiralik-maden-ocagi"
            },
            {
              "name": "Manav",
              "slug": "is-yeri-devren-kiralik-manav"
            },
            {
              "name": "Market",
              "slug": "is-yeri-devren-kiralik-market"
            },
            {
              "name": "Matbaa",
              "slug": "is-yeri-devren-kiralik-matbaa"
            },
            {
              "name": "Modaevi",
              "slug": "is-yeri-devren-kiralik-modaevi"
            },
            {
              "name": "Muayenehane",
              "slug": "is-yeri-devren-kiralik-muayenehane"
            },
            {
              "name": "Nakliyat & Kargo",
              "slug": "is-yeri-devren-kiralik-nakliyat-kargo"
            },
            {
              "name": "Nalbur",
              "slug": "is-yeri-devren-kiralik-nalbur"
            },
            {
              "name": "Okul & Kurs",
              "slug": "is-yeri-devren-kiralik-okul-kurs"
            },
            {
              "name": "Otopark / Garaj",
              "slug": "is-yeri-devren-kiralik-otopark-garaj"
            },
            {
              "name": "Oto Servis & Bakım",
              "slug": "is-yeri-devren-kiralik-oto-servis-bakim"
            },
            {
              "name": "Oto Yedek Parça",
              "slug": "is-yeri-devren-kiralik-oto-yedek-parca"
            },
            {
              "name": "Oto Yıkama & Kuaför",
              "slug": "is-yeri-devren-kiralik-oto-yikama-kuafor"
            },
            {
              "name": "Öğrenci Yurdu",
              "slug": "is-yeri-devren-kiralik-ogrenci-yurdu"
            },
            {
              "name": "Pastane, Fırın & Tatlıcı",
              "slug": "is-yeri-devren-kiralik-pastane-firin-tatlici"
            },
            {
              "name": "Pazar Yeri",
              "slug": "is-yeri-devren-kiralik-pazar-yeri"
            },
            {
              "name": "Pet Shop",
              "slug": "is-yeri-devren-kiralik-pet-shop"
            },
            {
              "name": "Plaza Katı & Ofisi",
              "slug": "is-yeri-devren-kiralik-plaza-kati-ofisi"
            },
            {
              "name": "Prova & Kayıt Stüdyosu",
              "slug": "is-yeri-devren-kiralik-prova-kayit-studyosu"
            },
            {
              "name": "Restoran & Lokanta",
              "slug": "is-yeri-devren-kiralik-restoran-lokanta"
            },
            {
              "name": "Sağlık Merkezi",
              "slug": "is-yeri-devren-kiralik-saglik-merkezi"
            },
            {
              "name": "Sebze & Meyve Hali",
              "slug": "is-yeri-devren-kiralik-sebze-meyve-hali"
            },
            {
              "name": "Sinema & Konferans Salonu",
              "slug": "is-yeri-devren-kiralik-sinema-konferans-salonu"
            },
            {
              "name": "Soğuk Hava Deposu",
              "slug": "is-yeri-devren-kiralik-soguk-hava-deposu"
            },
            {
              "name": "SPA, Hamam & Sauna",
              "slug": "is-yeri-devren-kiralik-spa-hamam-sauna"
            },
            {
              "name": "Spor Tesisi",
              "slug": "is-yeri-devren-kiralik-spor-tesisi"
            },
            {
              "name": "Su & Tüp Bayi",
              "slug": "is-yeri-devren-kiralik-su-tup-bayi"
            },
            {
              "name": "Şans Oyunları Bayisi",
              "slug": "is-yeri-devren-kiralik-sans-oyunlari-bayisi"
            },
            {
              "name": "Şarküteri",
              "slug": "is-yeri-devren-kiralik-sarkuteri"
            },
            {
              "name": "Taksi Durağı",
              "slug": "is-yeri-devren-kiralik-taksi-duragi"
            },
            {
              "name": "Tamirhane",
              "slug": "is-yeri-devren-kiralik-tamirhane"
            },
            {
              "name": "Tekel Bayi",
              "slug": "is-yeri-devren-kiralik-tekel-bayi"
            },
            {
              "name": "Teknik Servis",
              "slug": "is-yeri-devren-kiralik-teknik-servis"
            },
            {
              "name": "Terzi",
              "slug": "is-yeri-devren-kiralik-terzi"
            },
            {
              "name": "Tuhafiye",
              "slug": "is-yeri-devren-kiralik-tuhafiye"
            },
            {
              "name": "Tuvalet",
              "slug": "is-yeri-devren-kiralik-tuvalet"
            },
            {
              "name": "Veteriner",
              "slug": "is-yeri-devren-kiralik-veteriner"
            },
            {
              "name": "Züccaciye",
              "slug": "is-yeri-devren-kiralik-zuccaciye"
            },
            {
              "name": "Harita G",
              "slug": "is-yeri-devren-kiralik-harita-g"
            }
          ]
        }
      ]
    },
    {
      "name": "Arsa",
      "slug": "arsa",
      "subcategories": [
        {
          "name": "Devren Kiralık",
          "slug": "arsa-devren-kiralik"
        },
        {
          "name": "Kat Karşılığı Satılık",
          "slug": "arsa-kat-karsiligi-satilik"
        },
        {
          "name": "Satılık",
          "slug": "arsa-satilik"
        },
        {
          "name": "Kiralık",
          "slug": "arsa-kiralik"
        }
      ]
    },
    {
      "name": "Konut Projeleri",
      "slug": "konut-projeleri",
      "subcategories": [
        {
          "name": "Daire",
          "slug": "konut-projeleri-daire"
        },
        {
          "name": "Residence",
          "slug": "konut-projeleri-residence"
        },
        {
          "name": "Villa",
          "slug": "konut-projeleri-villa"
        }
      ]
    },
    {
      "name": "Bina",
      "slug": "bina",
      "subcategories": [
        {
          "name": "Satılık",
          "slug": "bina-satilik"
        },
        {
          "name": "Kiralık",
          "slug": "bina-kiralik"
        }
      ]
    },
    {
      "name": "Devre Mülk",
      "slug": "devre-mulk",
      "subcategories": [
        {
          "name": "Satılık",
          "slug": "devre-mulk-satilik"
        }
      ]
    },
    {
      "name": "Turistik Tesis",
      "slug": "turistik-tesis",
      "subcategories": [
        {
          "name": "Satılık",
          "slug": "turistik-tesis-satilik"
        },
        {
          "name": "Kiralık",
          "slug": "turistik-tesis-kiralik"
        }
      ]
    }
  ]
},
  {
    name: "VASITA",
    slug: "vasita",
    icon: "🚗",
    subcategories: [
      { name: "Otomobil", slug: "otomobil" },
      { name: "Arazi, SUV & Pickup", slug: "arazi-suv-pickup" },
      { name: "Motosiklet", slug: "motosiklet" },
      { name: "Minivan & Panelvan", slug: "minivan-panelvan" },
      {
        name: "Ticari Araçlar",
        slug: "ticari-araclar",
        subcategories: [
          { name: "Minibüs & Midibüs", slug: "ticari-araclar-minibus-midibus" },
          { name: "Otobüs", slug: "ticari-araclar-otobus" },
          { name: "Kamyon & Kamyonet", slug: "ticari-araclar-kamyon-kamyonet" },
          { name: "Çekici", slug: "ticari-araclar-cekici" },
          { name: "Dorse", slug: "ticari-araclar-dorse" },
          { name: "Römork", slug: "ticari-araclar-romork" },
          { name: "Karoser & Üst Yapı", slug: "ticari-araclar-karoser-ust-yapi" },
          { name: "Oto Kurtarıcı & Taşıyıcı", slug: "ticari-araclar-oto-kurtarici-tasiyici" },
          { name: "Ticari Hat & Ticari Plaka", slug: "ticari-araclar-ticari-hat-ticari-plaka" },
        ],
      },
      { name: "Kiralık Araçlar", slug: "kiralik-araclar" },
      { name: "Deniz Araçları", slug: "deniz-araclari" },
      { name: "Hasarlı Araçlar", slug: "hasarli-araclar" },
      { name: "Karavan", slug: "karavan" },
      { name: "Klasik Araçlar", slug: "klasik-araclar" },
      { name: "Hava Araçları", slug: "hava-araclari" },
      { name: "ATV", slug: "atv" },
      { name: "UTV", slug: "utv" },
      { name: "Engelli Plakalı Araçlar", slug: "engelli-plakali-araclar" },
    ],
  },
  {
    ...YEDEK_PARCA_STRUCTURE,
    icon: "🔧",
  } as Category,
  {
    ...ALISVERIS_STRUCTURE,
    icon: "🛍️",
  } as Category,
  {
    ...SANAYI_STRUCTURE,
    icon: "🏗️",
  } as Category,
  {
    name: "Ustalar ve Hizmetler",
    slug: "ustalar-hizmetler",
    icon: "🛠️",
    subcategories: [
      { name: "Ev Tadilat & Dekorasyon", slug: "ev-tadilat-dekorasyon" },
      { name: "Nakliye", slug: "nakliye" },
      { name: "Araç Servis & Bakım", slug: "arac-servis-bakim" },
      { name: "Temizlik Hizmetleri", slug: "temizlik-hizmetleri" },
      { name: "Bilişim & Yazılım", slug: "bilisim-yazilim" },
      { name: "Düğün & Etkinlik", slug: "dugun-etkinlik" },
      { name: "Fotoğraf & Video", slug: "fotograf-video" },
      { name: "Güzellik & Bakım", slug: "guzellik-bakim" },
      { name: "Hukuk & Mali Müşavirlik", slug: "hukuk-mali-musavirlik" },
    ],
  },
  {
    ...OZEL_DERS_STRUCTURE,
    icon: "📚",
  } as Category,
  {
    ...IS_ARAYANLAR_STRUCTURE,
    icon: "💼",
  } as Category,
  {
    ...YARDIMCI_STRUCTURE,
    icon: "🤝",
  } as Category,
  {
    ...HAYVANLAR_STRUCTURE,
    icon: "🐾",
  } as Category,
];

const emlakIndex = CATEGORIES.findIndex((c) => c.slug === "emlak");
if (emlakIndex >= 0) {
  CATEGORIES[emlakIndex] = {
    ...EMLAK_STRUCTURE,
    name: "EMLAK",
    icon: "🏠",
  } as Category;
}
