const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  {
    name: "Emlak",
    slug: "emlak",
    subcategories: [
      { name: "Satılık Daire", slug: "satilik-daire" },
      { name: "Kiralık Daire", slug: "kiralik-daire" },
      { name: "Arsa", slug: "arsa" },
      { name: "İşyeri", slug: "isyeri" },
      { name: "Yazlık", slug: "yazlik" },
      { name: "Satılık Villa", slug: "satilik-villa" },
      { name: "Kiralık Villa", slug: "kiralik-villa" },
      { name: "Satılık Arsa", slug: "satilik-arsa" },
      { name: "Kiralık İşyeri", slug: "kiralik-isyeri" },
    ],
  },
  {
    name: "Vasıta",
    slug: "vasita",
    subcategories: [
      { name: "Otomobil", slug: "otomobil" },
      { name: "SUV & Pickup", slug: "suv-pickup" },
      { name: "Motosiklet", slug: "motosiklet" },
      { name: "Ticari Araçlar", slug: "ticari-arac" },
      { name: "Elektrikli Araç", slug: "elektrikli-arac" },
      { name: "Kamyon", slug: "kamyon" },
      { name: "Otobüs", slug: "otobus" },
      { name: "Minibüs", slug: "minibus" },
      { name: "Traktör", slug: "traktor" },
    ],
  },
  {
    name: "Yedek Parça, Aksesuar, Donanım",
    slug: "yedek-parca-aksesuar",
    subcategories: [
      { name: "Jant & Lastik", slug: "jant-lastik" },
      { name: "Ses & Multimedya", slug: "ses-multimedya" },
      { name: "Performans", slug: "performans" },
      { name: "İç Aksesuar", slug: "ic-aksesuar" },
      { name: "Dış Aksesuar", slug: "dis-aksesuar" },
      { name: "Motor Parçaları", slug: "motor-parcalari" },
      { name: "Aydınlatma", slug: "aydinlatma" },
      { name: "Egzoz Sistemleri", slug: "egzoz-sistemleri" },
    ],
  },
  {
    name: "İkinci El ve Sıfır Alışveriş",
    slug: "alisveris",
    subcategories: [
      { name: "Cep Telefonu", slug: "cep-telefonu" },
      { name: "Bilgisayar", slug: "bilgisayar" },
      { name: "Beyaz Eşya", slug: "beyaz-esya" },
      { name: "Mobilya", slug: "mobilya" },
      { name: "Hobi & Eğlence", slug: "hobi-eglence" },
      { name: "Fotoğraf Makinesi", slug: "fotograf-makinesi" },
      { name: "Oyun Konsolu", slug: "oyun-konsolu" },
      { name: "Küçük Ev Aletleri", slug: "kucuk-ev-aletleri" },
    ],
  },
  {
    name: "İş Makineleri & Sanayi",
    slug: "is-makineleri-sanayi",
    subcategories: [
      { name: "Forklift", slug: "forklift" },
      { name: "Vinç", slug: "vinc" },
      { name: "İnşaat Makinesi", slug: "insaat-makinesi" },
      { name: "Üretim Ekipmanı", slug: "uretim-ekipmani" },
      { name: "Kompresör", slug: "kompresor" },
      { name: "Jeneratör", slug: "jenerator" },
      { name: "Kaynak Makinesi", slug: "kaynak-makinesi" },
    ],
  },
  {
    name: "Ustalar ve Hizmetler",
    slug: "ustalar-hizmetler",
    subcategories: [
      { name: "Tadilat & Dekorasyon", slug: "tadilat-dekorasyon" },
      { name: "Boyacı", slug: "boyaci" },
      { name: "Elektrikçi", slug: "elektrikci" },
      { name: "Tesisatçı", slug: "tesisatci" },
      { name: "Temizlik", slug: "temizlik" },
      { name: "Nakliye", slug: "nakliye" },
      { name: "Anahtar & Kilit", slug: "anahtar-kilit" },
      { name: "Bilgisayar Servisi", slug: "bilgisayar-servisi" },
    ],
  },
  {
    name: "Özel Ders Verenler",
    slug: "ozel-ders",
    subcategories: [
      { name: "Matematik", slug: "matematik" },
      { name: "İngilizce", slug: "ingilizce" },
      { name: "Fizik", slug: "fizik" },
      { name: "Yabancı Dil", slug: "yabanci-dil" },
      { name: "Kimya", slug: "kimya" },
      { name: "Biyoloji", slug: "biyoloji" },
      { name: "Tarih", slug: "tarih" },
      { name: "Coğrafya", slug: "cografya" },
      { name: "Piyano", slug: "piyano" },
      { name: "Gitar", slug: "gitar" },
    ],
  },
  {
    name: "Yardımcı Arayanlar",
    slug: "yardimci-arayanlar",
    subcategories: [
      { name: "Temizlik", slug: "temizlik" },
      { name: "Bebek Bakımı", slug: "bebek-bakimi" },
      { name: "Yaşlı Bakımı", slug: "yasli-bakimi" },
      { name: "Özel Şoför", slug: "ozel-sofor" },
      { name: "Aşçı", slug: "asci" },
      { name: "Bahçıvan", slug: "bahcivan" },
    ],
  },
  {
    name: "İş İlanları",
    slug: "is-ilanlari",
    subcategories: [
      { name: "Tam Zamanlı", slug: "tam-zamanli" },
      { name: "Yarı Zamanlı", slug: "yari-zamanli" },
      { name: "Uzaktan", slug: "uzaktan" },
      { name: "Staj", slug: "staj" },
      { name: "Freelance", slug: "freelance" },
      { name: "Sözleşmeli", slug: "sozlesmeli" },
    ],
  },
  {
    name: "Hayvanlar Alemi",
    slug: "hayvanlar-alemi",
    subcategories: [
      { name: "Evcil Hayvan", slug: "evcil-hayvan" },
      { name: "Aksesuar", slug: "hayvan-aksesuar" },
      { name: "Mama", slug: "mama" },
      { name: "Kedi", slug: "kedi" },
      { name: "Köpek", slug: "kopek" },
      { name: "Kuş", slug: "kus" },
      { name: "Balık", slug: "balik" },
    ],
  },
];

async function main() {
  console.log('Kategoriler ekleniyor...');
  
  for (const category of categories) {
    console.log(`Kategori ekleniyor: ${category.name}`);
    
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
      },
    });
    
    console.log(`Kategori oluşturuldu: ${createdCategory.name} (ID: ${createdCategory.id})`);
    
    for (const subcategory of category.subcategories) {
      console.log(`  Alt kategori ekleniyor: ${subcategory.name}`);
      
      await prisma.subCategory.create({
        data: {
          name: subcategory.name,
          slug: subcategory.slug,
          categoryId: createdCategory.id,
        },
      });
      
      console.log(`  Alt kategori oluşturuldu: ${subcategory.name}`);
    }
  }
  
  console.log('Tüm kategoriler başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });