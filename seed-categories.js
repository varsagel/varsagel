const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sahibinden ve genel pazar yeri standartlarına uygun kategori yapısı
// src/data/categories.ts ile AYNI olmalı!
const categories = [
  {
    name: "Emlak",
    slug: "emlak",
    subcategories: [
      { name: "Satılık Daire", slug: "satilik-daire" },
      { name: "Kiralık Daire", slug: "kiralik-daire" },
      { name: "Satılık İşyeri", slug: "satilik-isyeri" },
      { name: "Kiralık İşyeri", slug: "kiralik-isyeri" },
      { name: "Satılık Arsa", slug: "satilik-arsa" },
      { name: "Kiralık Arsa", slug: "kiralik-arsa" },
      { name: "Satılık Bina", slug: "satilik-bina" },
      { name: "Satılık Yazlık", slug: "satilik-yazlik" },
      { name: "Kiralık Yazlık", slug: "kiralik-yazlik" },
      { name: "Satılık Villa", slug: "satilik-villa" },
      { name: "Kiralık Villa", slug: "kiralik-villa" },
      { name: "Devren Satılık", slug: "devren-satilik" },
      { name: "Turistik Tesis", slug: "turistik-tesis" },
    ],
  },
  {
    name: "Vasıta",
    slug: "vasita",
    subcategories: [
      { name: "Otomobil", slug: "otomobil" },
      { name: "Arazi, SUV & Pickup", slug: "arazi-suv-pickup" },
      { name: "Motosiklet", slug: "motosiklet" },
      { name: "Minivan & Panelvan", slug: "minivan-panelvan" },
      { name: "Ticari Araçlar", slug: "ticari-araclar" },
      { name: "Kamyon & Çekici", slug: "kamyon-cekici" },
      { name: "Otobüs", slug: "otobus" },
      { name: "Minibüs & Midibüs", slug: "minibus-midibus" },
      { name: "Traktör", slug: "traktor" },
      { name: "Kiralık Araçlar", slug: "kiralik-araclar" },
      { name: "Hasarlı Araçlar", slug: "hasarli-araclar" },
      { name: "Klasik Araçlar", slug: "klasik-araclar" },
      { name: "Elektrikli Araçlar", slug: "elektrikli-araclar" },
      { name: "Deniz Araçları", slug: "deniz-araclari" },
      { name: "Hava Araçları", slug: "hava-araclari" },
      { name: "ATV & UTV", slug: "atv-utv" },
      { name: "Karavan", slug: "karavan" },
      { name: "Engelli Plakalı Araçlar", slug: "engelli-plakali-araclar" },
    ],
  },
  {
    name: "Yedek Parça, Aksesuar, Donanım & Tuning",
    slug: "yedek-parca-aksesuar-donanim-tuning",
    subcategories: [
      { name: "Otomotiv Ekipmanları", slug: "otomotiv-ekipmanlari" },
      { name: "Motosiklet Ekipmanları", slug: "motosiklet-ekipmanlari" },
      { name: "Deniz Aracı Ekipmanları", slug: "deniz-araci-ekipmanlari" },
      { name: "Kask & Kıyafet & Ekipman", slug: "kask-kiyafet-ekipman" },
      { name: "Ses & Görüntü Sistemleri", slug: "ses-goruntu-sistemleri" },
    ],
  },
  {
    name: "İkinci El ve Sıfır Alışveriş",
    slug: "alisveris",
    subcategories: [
      { name: "Bilgisayar", slug: "bilgisayar" },
      { name: "Cep Telefonu", slug: "cep-telefonu" },
      { name: "Fotoğraf & Kamera", slug: "fotograf-kamera" },
      { name: "Ev Dekorasyon", slug: "ev-dekorasyon" },
      { name: "Ev Elektroniği", slug: "ev-elektronigi" },
      { name: "Elektrikli Ev Aletleri", slug: "elektrikli-ev-aletleri" },
      { name: "Giyim & Aksesuar", slug: "giyim-aksesuar" },
      { name: "Saat", slug: "saat" },
      { name: "Anne & Bebek", slug: "anne-bebek" },
      { name: "Kişisel Bakım & Kozmetik", slug: "kisisel-bakim-kozmetik" },
      { name: "Hobi & Oyuncak", slug: "hobi-oyuncak" },
      { name: "Oyun & Konsol", slug: "oyun-konsol" },
      { name: "Kitap, Dergi & Film", slug: "kitap-dergi-film" },
      { name: "Spor & Outdoor", slug: "spor-outdoor" },
      { name: "Müzik & Enstrümanlar", slug: "muzik-enstrumanlari" },
      { name: "Ofis & Kırtasiye", slug: "ofis-kirtasiye" },
      { name: "Bahçe & Yapı Market", slug: "bahce-yapi-market" },
      { name: "Teknik Elektronik", slug: "teknik-elektronik" },
      { name: "Diğer Her Şey", slug: "diger-her-sey" },
    ],
  },
  {
    name: "İş Makineleri & Sanayi",
    slug: "is-makineleri-sanayi",
    subcategories: [
      { name: "İş Makineleri", slug: "is-makineleri" },
      { name: "Tarım Makineleri", slug: "tarim-makineleri" },
      { name: "Sanayi", slug: "sanayi" },
      { name: "Elektrik & Enerji", slug: "elektrik-enerji" },
    ],
  },
  {
    name: "Ustalar ve Hizmetler",
    slug: "ustalar-hizmetler",
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
    name: "Özel Ders Arayanlar",
    slug: "ozel-ders-arayanlar",
    subcategories: [
      { name: "Lise & Üniversite Hazırlık", slug: "lise-universite-hazirlik" },
      { name: "İlköğretim Takviye", slug: "ilkogretim-takviye" },
      { name: "Yabancı Dil", slug: "yabanci-dil" },
      { name: "Bilgisayar", slug: "ozel-ders-bilgisayar" },
      { name: "Müzik & Enstrüman", slug: "muzik-enstruman" },
      { name: "Spor", slug: "ozel-ders-spor" },
      { name: "Sanat", slug: "sanat" },
      { name: "Direksiyon", slug: "direksiyon" },
      { name: "Kişisel Gelişim", slug: "kisisel-gelisim" },
    ],
  },
  {
    name: "İş İlanları",
    slug: "is-ilanlari",
    subcategories: [
      { name: "Avukatlık & Hukuki Danışmanlık", slug: "avukatlik-hukuki-danismanlik" },
      { name: "Eğitim", slug: "egitim" },
      { name: "Eğlence ve Aktiviteler", slug: "eglence-ve-aktiviteler" },
      { name: "Güzellik ve Bakım", slug: "guzellik-ve-bakim" },
      { name: "IT ve Yazılım Geliştirme", slug: "it-ve-yazilim-gelistirme" },
      { name: "İnsan Kaynakları", slug: "insan-kaynaklari" },
      { name: "İnşaat ve Yapı", slug: "insaat-ve-yapi" },
      { name: "İşletme ve Stratejik Yönetim", slug: "isletme-ve-stratejik-yonetim" },
      { name: "Lojistik ve Taşıma", slug: "lojistik-ve-tasima" },
      { name: "Mağazacılık ve Perakendecilik", slug: "magazacilik-ve-perakendecilik" },
      { name: "Müşteri Hizmetleri", slug: "musteri-hizmetleri" },
      { name: "Muhasebe, Finans ve Bankacılık", slug: "muhasebe-finans-ve-bankacilik" },
      { name: "Mühendislik", slug: "muhendislik" },
      { name: "Pazarlama ve Ürün Yönetimi", slug: "pazarlama-ve-urun-yonetimi" },
      { name: "Restoran ve Konaklama", slug: "restoran-ve-konaklama" },
      { name: "Sağlık Hizmetleri", slug: "saglik-hizmetleri" },
      { name: "Satış", slug: "satis" },
      { name: "Sekreterlik ve İdari Asistanlık", slug: "sekreterlik-ve-idari-asistanlik" },
      { name: "Tamir ve Bakım", slug: "tamir-ve-bakim" },
      { name: "Tarım ve Şarapçılık", slug: "tarim-ve-sarapcilik" },
      { name: "Tasarım ve Yaratıcılık", slug: "tasarim-ve-yaraticilik" },
      { name: "Tekstil ve Konfeksiyon", slug: "tekstil-ve-konfeksiyon" },
      { name: "Temizlik Hizmetleri", slug: "is-ilanlari-temizlik" },
      { name: "Üretim ve İmalat", slug: "uretim-ve-imalat" },
      { name: "Yarı Zamanlı ve Öğrenci İşleri", slug: "yari-zamanli-ve-ogrenci-isleri" },
    ],
  },
  {
    name: "Yardımcı Arayanlar",
    slug: "yardimci-arayanlar",
    subcategories: [
      { name: "Bebek & Çocuk Bakıcısı", slug: "bebek-cocuk-bakicisi" },
      { name: "Yaşlı & Hasta Bakıcısı", slug: "yasli-hasta-bakicisi" },
      { name: "Temizlikçi & Ev İşlerine Yardımcı", slug: "temizlikci-ev-islerine-yardimci" },
    ],
  },
  {
    name: "Hayvanlar Alemi",
    slug: "hayvanlar-alemi",
    subcategories: [
      { name: "Evcil Hayvanlar", slug: "evcil-hayvanlar" },
      { name: "Akvaryum Balıkları", slug: "akvaryum-baliklari" },
      { name: "Aksesuarlar", slug: "aksesuarlar" },
      { name: "Yem & Mama", slug: "yem-mama" },
      { name: "Kümes Hayvanları", slug: "kumes-hayvanlari" },
      { name: "Büyükbaş Hayvanlar", slug: "buyukbas-hayvanlar" },
      { name: "Küçükbaş Hayvanlar", slug: "kucukbas-hayvanlar" },
      { name: "Deniz Canlıları", slug: "deniz-canlilari" },
      { name: "Sürüngenler", slug: "surungenler" },
      { name: "Böcekler", slug: "bocekler" },
    ],
  },
];

async function main() {
  console.log('Kategoriler ekleniyor...');
  
  for (const category of categories) {
    console.log(`Kategori işleniyor: ${category.name}`);
    
    // Upsert category to avoid duplicates if running multiple times (based on slug)
    const upsertedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
    
    console.log(`Kategori güncellendi/oluşturuldu: ${upsertedCategory.name} (ID: ${upsertedCategory.id})`);
    
    for (const subcategory of category.subcategories) {
      // Find existing subcategory by slug AND categoryId to allow same slug in different categories (though unlikely)
      // Prisma findFirst or upsert. Since slug is usually unique per subcategory in standard schema but might not be constrained unique globally.
      // Let's assume slug is unique globally or per category.
      // Standard approach: find first, if exists update, else create.
      
      const existingSub = await prisma.subCategory.findFirst({
        where: {
          slug: subcategory.slug,
          categoryId: upsertedCategory.id
        }
      });

      if (existingSub) {
         await prisma.subCategory.update({
             where: { id: existingSub.id },
             data: { name: subcategory.name }
         });
         console.log(`  Alt kategori güncellendi: ${subcategory.name}`);
      } else {
         await prisma.subCategory.create({
            data: {
                name: subcategory.name,
                slug: subcategory.slug,
                categoryId: upsertedCategory.id
            }
         });
         console.log(`  Alt kategori oluşturuldu: ${subcategory.name}`);
      }
    }
  }
  
  console.log('Tüm kategoriler başarıyla işlendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
