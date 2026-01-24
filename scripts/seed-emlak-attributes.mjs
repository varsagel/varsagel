
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMLAK_SLUG = 'emlak';

const ATTRIBUTES = {
  // Ortak seçenekler
  ODA_SAYISI: {
    name: 'Oda Sayısı',
    slug: 'oda-sayisi',
    type: 'select',
    options: ['1+0', '1+1', '2+0', '2+1', '2+2', '3+1', '3+2', '4+1', '4+2', '4+3', '4+4', '5+1', '5+2', '5+3', '5+4', '6+1', '6+2', '6+3', '7+1', '7+2', '7+3', '8+1', '8+2', '8+3', '9+1', '10+ Üzeri'],
  },
  BINA_YASI: {
    name: 'Bina Yaşı',
    slug: 'bina-yasi',
    type: 'select',
    options: ['0', '1', '2', '3', '4', '5-10 Arası', '11-15 Arası', '16-20 Arası', '21-25 Arası', '26-30 Arası', '31 ve Üzeri'],
  },
  BULUNDUGU_KAT: {
    name: 'Bulunduğu Kat',
    slug: 'bulundugu-kat',
    type: 'select',
    options: ['Kot 1', 'Kot 2', 'Kot 3', 'Bodrum Kat', 'Zemin Kat', 'Bahçe Katı', 'Giriş Katı', 'Yüksek Giriş', 'Müstakil', 'Villa Tipi', 'Çatı Katı', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21-30 Arası', '30 ve Üzeri'],
  },
  KAT_SAYISI: {
    name: 'Kat Sayısı',
    slug: 'kat-sayisi',
    type: 'number',
  },
  ISITMA: {
    name: 'Isıtma',
    slug: 'isitma',
    type: 'select',
    options: ['Kombi (Doğalgaz)', 'Kombi (Elektrik)', 'Merkezi', 'Merkezi (Pay Ölçer)', 'Soba (Doğalgaz)', 'Soba (Kömür)', 'Kat Kaloriferi', 'Klima', 'Yerden Isıtma', 'Jeotermal', 'Güneş Enerjisi', 'VRV', 'Isı Pompası', 'Yok'],
  },
  BANYO_SAYISI: {
    name: 'Banyo Sayısı',
    slug: 'banyo-sayisi',
    type: 'select',
    options: ['1', '2', '3', '4', '5', '6', 'Yok'],
  },
  BALKON: {
    name: 'Balkon',
    slug: 'balkon',
    type: 'boolean', // Var/Yok
  },
  ESYALI: {
    name: 'Eşyalı',
    slug: 'esyali',
    type: 'boolean',
  },
  SITE_ICERISINDE: {
    name: 'Site İçerisinde',
    slug: 'site-icerisinde',
    type: 'boolean',
  },
  KREDIYE_UYGUN: {
    name: 'Krediye Uygun',
    slug: 'krediye-uygun',
    type: 'boolean',
  },
  METREKARE_BRUT: {
    name: 'Metrekare (Brüt)',
    slug: 'metrekare-brut',
    type: 'number',
  },
  METREKARE_NET: {
    name: 'Metrekare (Net)',
    slug: 'metrekare-net',
    type: 'number',
  },
  METREKARE: {
    name: 'Metrekare',
    slug: 'metrekare',
    type: 'number',
  },
  IMAR_DURUMU: {
    name: 'İmar Durumu',
    slug: 'imar-durumu',
    type: 'select',
    options: ['Ada', 'Konut', 'Ticari', 'Ticari + Konut', 'Turizm + Konut', 'Sanayi', 'Tarla', 'Bağ & Bahçe', 'Zeytinlik', 'Depo', 'Eğitim', 'Sağlık', 'Spor Alanı', 'Park', 'Diğer'],
  },
  KAKS_EMSAL: {
    name: 'Kaks (Emsal)',
    slug: 'kaks-emsal',
    type: 'select',
    options: ['0.10', '0.15', '0.20', '0.25', '0.30', '0.35', '0.40', '0.45', '0.50', '0.60', '0.70', '0.80', '0.90', '1.00', '1.10', '1.20', '1.25', '1.30', '1.40', '1.50', '1.60', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00', 'Belirtilmemiş'],
  },
  GABARI: {
    name: 'Gabari',
    slug: 'gabari',
    type: 'select',
    options: ['Serbest', '3.50', '6.50', '9.50', '12.50', '15.50', '18.50', '21.50', '24.50', '27.50', '30.50', 'Belirtilmemiş'],
  },
  TAPU_DURUMU: {
    name: 'Tapu Durumu',
    slug: 'tapu-durumu',
    type: 'select',
    options: ['Müstakil Parsel', 'Hisseli Tapu', 'Zilyetlik', 'Tahsis', 'Bilinmiyor'],
  },
  TESIS_TIPI: {
    name: 'Tesis Tipi',
    slug: 'tesis-tipi',
    type: 'select',
    options: ['Otel', 'Butik Otel', 'Pansiyon', 'Apart Otel', 'Motel', 'Camping', 'Tatil Köyü', 'Plaj', 'Restoran'],
  },
  YILDIZ_SAYISI: {
    name: 'Yıldız Sayısı',
    slug: 'yildiz-sayisi',
    type: 'select',
    options: ['1', '2', '3', '4', '5', '7', 'Belirtilmemiş'],
  },
  YATAK_KAPASITESI: {
    name: 'Yatak Kapasitesi',
    slug: 'yatak-kapasitesi',
    type: 'number',
  },
  ACIK_ALAN: {
    name: 'Açık Alan (m²)',
    slug: 'acik-alan',
    type: 'number',
  },
  KAPALI_ALAN: {
    name: 'Kapalı Alan (m²)',
    slug: 'kapali-alan',
    type: 'number',
  },
  ODA_BOLUM_SAYISI: {
    name: 'Oda/Bölüm Sayısı',
    slug: 'oda-bolum-sayisi',
    type: 'select',
    options: ['Tek Bölüm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'],
  },
  AIDAT: {
    name: 'Aidat (TL)',
    slug: 'aidat',
    type: 'number',
  },
  DEPOZITO: {
    name: 'Depozito (TL)',
    slug: 'depozito',
    type: 'number',
  }
};

const SUBCATEGORY_MAP = {
  'satilik-daire': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.BULUNDUGU_KAT, ATTRIBUTES.KAT_SAYISI, ATTRIBUTES.ISITMA, ATTRIBUTES.BANYO_SAYISI, ATTRIBUTES.BALKON, ATTRIBUTES.ESYALI, ATTRIBUTES.SITE_ICERISINDE, ATTRIBUTES.KREDIYE_UYGUN, ATTRIBUTES.AIDAT
  ],
  'kiralik-daire': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.BULUNDUGU_KAT, ATTRIBUTES.KAT_SAYISI, ATTRIBUTES.ISITMA, ATTRIBUTES.BANYO_SAYISI, ATTRIBUTES.BALKON, ATTRIBUTES.ESYALI, ATTRIBUTES.SITE_ICERISINDE, ATTRIBUTES.DEPOZITO, ATTRIBUTES.AIDAT
  ],
  'satilik-isyeri': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_BOLUM_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.KREDIYE_UYGUN, ATTRIBUTES.DEVREN
  ],
  'kiralik-isyeri': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_BOLUM_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.DEPOZITO, ATTRIBUTES.AIDAT
  ],
  'satilik-arsa': [
    ATTRIBUTES.METREKARE, ATTRIBUTES.IMAR_DURUMU, ATTRIBUTES.KAKS_EMSAL, ATTRIBUTES.GABARI, ATTRIBUTES.TAPU_DURUMU, ATTRIBUTES.KREDIYE_UYGUN
  ],
  'kiralik-arsa': [
    ATTRIBUTES.METREKARE, ATTRIBUTES.IMAR_DURUMU, ATTRIBUTES.KAKS_EMSAL, ATTRIBUTES.GABARI, ATTRIBUTES.TAPU_DURUMU
  ],
  'satilik-bina': [
    ATTRIBUTES.METREKARE, ATTRIBUTES.KAT_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.KREDIYE_UYGUN
  ],
  'satilik-yazlik': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.BANYO_SAYISI, ATTRIBUTES.BALKON, ATTRIBUTES.ESYALI, ATTRIBUTES.SITE_ICERISINDE, ATTRIBUTES.KREDIYE_UYGUN
  ],
  'kiralik-yazlik': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.BANYO_SAYISI, ATTRIBUTES.BALKON, ATTRIBUTES.ESYALI, ATTRIBUTES.SITE_ICERISINDE, ATTRIBUTES.DEPOZITO
  ],
  'satilik-villa': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.BANYO_SAYISI, ATTRIBUTES.BALKON, ATTRIBUTES.ESYALI, ATTRIBUTES.SITE_ICERISINDE, ATTRIBUTES.KREDIYE_UYGUN, ATTRIBUTES.ACIK_ALAN
  ],
  'kiralik-villa': [
    ATTRIBUTES.METREKARE_BRUT, ATTRIBUTES.METREKARE_NET, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.BINA_YASI, ATTRIBUTES.ISITMA, ATTRIBUTES.BANYO_SAYISI, ATTRIBUTES.BALKON, ATTRIBUTES.ESYALI, ATTRIBUTES.SITE_ICERISINDE, ATTRIBUTES.DEPOZITO, ATTRIBUTES.ACIK_ALAN
  ],
  'devren-satilik': [
    ATTRIBUTES.METREKARE, ATTRIBUTES.ODA_BOLUM_SAYISI, ATTRIBUTES.ISITMA, ATTRIBUTES.DEVREN
  ],
  'turistik-tesis': [
    ATTRIBUTES.TESIS_TIPI, ATTRIBUTES.YILDIZ_SAYISI, ATTRIBUTES.ODA_SAYISI, ATTRIBUTES.YATAK_KAPASITESI, ATTRIBUTES.KAPALI_ALAN, ATTRIBUTES.ACIK_ALAN, ATTRIBUTES.BINA_YASI, ATTRIBUTES.KREDIYE_UYGUN
  ]
};

async function main() {
  console.log('Emlak kategorisi ve özellikleri güncelleniyor...');

  // 1. Emlak Kategorisini Bul
  const category = await prisma.category.findUnique({
    where: { slug: EMLAK_SLUG },
  });

  if (!category) {
    console.error('HATA: "emlak" kategorisi bulunamadı! Önce kategorileri oluşturmalısınız.');
    process.exit(1);
  }

  console.log(`Kategori bulundu: ${category.name} (${category.id})`);

  // Önce EMLAK kategorisine ait tüm özellikleri temizle (Kullanıcı isteği: "hepsini sil")
  console.log('Eski özellikler temizleniyor...');
  await prisma.categoryAttribute.deleteMany({
    where: { categoryId: category.id }
  });
  console.log('Temizlik tamamlandı.');

  // 2. Alt Kategorileri ve Özelliklerini İşle
  for (const [slug, attributes] of Object.entries(SUBCATEGORY_MAP)) {
    // Alt kategoriyi bul (veya oluştur - ama genelde slug sabittir)
    // create-categories scripti zaten oluşturmuş olmalı, biz update/upsert yapacağız.
    // Ancak prisma.subCategory.upsert kullanarak garantiye alalım.
    
    // İsmi slug'dan türet (basitçe) - Gerçek isimler DB'de varsa onları korur
    const name = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    // Alt kategoriyi bul
    let subCategory = await prisma.subCategory.findUnique({
      where: { slug: slug },
    });

    if (!subCategory) {
      console.log(`Alt kategori oluşturuluyor: ${slug}`);
      subCategory = await prisma.subCategory.create({
        data: {
          name: name,
          slug: slug,
          categoryId: category.id,
        },
      });
    } else {
        // Kategori ID'sinin doğru olduğundan emin olalım (taşınmış olabilir mi? Sanmam ama update edelim)
        if (subCategory.categoryId !== category.id) {
            await prisma.subCategory.update({
                where: { id: subCategory.id },
                data: { categoryId: category.id }
            });
        }
    }

    console.log(`> Alt Kategori: ${subCategory.name} (${slug}) - ${attributes.length} özellik ekleniyor...`);

    // Mevcut özellikleri temizle (opsiyonel: temizleyip yeniden eklemek daha temiz olabilir, 
    // ama ID'ler değişirse sorun olabilir. Upsert tercih edelim.)
    // Ancak sıralama (order) önemli. 
    
    let order = 1;
    for (const attr of attributes) {
        if (!attr) continue; // undefined check

        const attrSlug = `${slug}-${attr.slug}`; // Unique slug per subcategory context if needed, 
        // BUT CategoryAttribute slug is unique globally? No, slug is string but no @unique constraint on model definition seen earlier?
        // Let's check model again.
        // model CategoryAttribute { ... slug String ... } -> No @unique.
        // But usually we want unique per category/subcategory.
        
        // We will match by (subCategoryId, slug).
        
        const existingAttr = await prisma.categoryAttribute.findFirst({
            where: {
                subCategoryId: subCategory.id,
                slug: attr.slug
            }
        });

        const data = {
            categoryId: category.id,
            subCategoryId: subCategory.id,
            name: attr.name,
            slug: attr.slug,
            type: attr.type,
            optionsJson: attr.options ? JSON.stringify(attr.options) : null,
            order: order++,
            showInOffer: true,
            showInRequest: true,
        };

        if (existingAttr) {
            await prisma.categoryAttribute.update({
                where: { id: existingAttr.id },
                data: data
            });
        } else {
            await prisma.categoryAttribute.create({
                data: data
            });
        }
    }
  }

  console.log('İşlem tamamlandı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
