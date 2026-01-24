
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Attribute Definitions
const ATTRS = {
  // Common
  DURUMU: { name: 'Durumu', slug: 'durumu', type: 'select', options: ['Sıfır', 'İkinci El', 'Yenilenmiş', 'Teşhir'] },
  GARANTI: { name: 'Garanti', slug: 'garanti', type: 'boolean' },
  RENK: { name: 'Renk', slug: 'renk', type: 'select', options: ['Beyaz', 'Siyah', 'Gri', 'Gümüş', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Kahverengi', 'Bej', 'Altın', 'Diğer'] },
  MARKA: { name: 'Marka', slug: 'marka', type: 'text' }, // Text for now as brands are too many

  // Vasıta (Vehicles)
  YIL: { name: 'Yıl', slug: 'yil', type: 'number' },
  YAKIT: { name: 'Yakıt', slug: 'yakit', type: 'select', options: ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'] },
  VITES: { name: 'Vites', slug: 'vites', type: 'select', options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
  KM: { name: 'KM', slug: 'km', type: 'number' },
  KASA_TIPI: { name: 'Kasa Tipi', slug: 'kasa-tipi', type: 'select', options: ['Sedan', 'Hatchback', 'Station Wagon', 'Cabrio', 'Coupe', 'MPV', 'SUV', 'Minivan', 'Panelvan', 'Pickup'] },
  MOTOR_GUCU: { name: 'Motor Gücü (HP)', slug: 'motor-gucu', type: 'number' },
  MOTOR_HACMI: { name: 'Motor Hacmi (cc)', slug: 'motor-hacmi', type: 'number' },
  CEKIS: { name: 'Çekiş', slug: 'cekis', type: 'select', options: ['Önden Çekiş', 'Arkadan İtiş', '4WD (Sürekli)', 'AWD (Akıllı)'] },
  HASAR_DURUMU: { name: 'Hasar Durumu', slug: 'hasar-durumu', type: 'select', options: ['Hasarsız', 'Boyalı', 'Değişenli', 'Ağır Hasarlı', 'Pert Kayıtlı'] },
  TAKAS: { name: 'Takaslı', slug: 'takas', type: 'boolean' },
  TASIMA_KAPASITESI: { name: 'Taşıma Kapasitesi (kg)', slug: 'tasima-kapasitesi', type: 'number' },

  // İş İlanları (Jobs)
  CALISMA_SEKLI: { name: 'Çalışma Şekli', slug: 'calisma-sekli', type: 'select', options: ['Tam Zamanlı', 'Yarı Zamanlı', 'Dönemsel', 'Stajyer', 'Freelance', 'Gönüllü'] },
  POZISYON_SEVIYESI: { name: 'Pozisyon Seviyesi', slug: 'pozisyon-seviyesi', type: 'select', options: ['Başlangıç', 'Orta Düzey', 'Uzman', 'Yönetici', 'Üst Düzey Yönetici'] },
  DENEYIM_SURESI: { name: 'Deneyim Süresi', slug: 'deneyim-suresi', type: 'select', options: ['Deneyimsiz', '0-2 Yıl', '2-5 Yıl', '5-10 Yıl', '10+ Yıl'] },
  EGITIM_SEVIYESI: { name: 'Eğitim Seviyesi', slug: 'egitim-seviyesi', type: 'select', options: ['İlköğretim', 'Lise', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora'] },

  // Hayvanlar Alemi (Pets)
  YAS: { name: 'Yaşı', slug: 'yas', type: 'select', options: ['0-3 Aylık', '3-6 Aylık', '6-12 Aylık', '1 Yaş', '2 Yaş', '3 Yaş', '4 Yaş', '5+ Yaş'] },
  CINSIYET: { name: 'Cinsiyet', slug: 'cinsiyet', type: 'select', options: ['Dişi', 'Erkek'] },
  IRK: { name: 'Irk', slug: 'irk', type: 'text' },
  ASI_DURUMU: { name: 'Aşıları Tam', slug: 'asilari-tam', type: 'boolean' },

  // Özel Ders (Tutors)
  DERS_YERI: { name: 'Ders Yeri', slug: 'ders-yeri', type: 'select', options: ['Öğretmenin Evi', 'Öğrencinin Evi', 'Etüt Merkezi', 'Online', 'Kütüphane/Kafe'] },
  DERS_SEVIYESI: { name: 'Ders Seviyesi', slug: 'ders-seviyesi', type: 'select', options: ['İlkokul', 'Ortaokul', 'Lise', 'Üniversite', 'Genel', 'İleri Düzey'] },
  
  // Ustalar ve Hizmetler
  HIZMET_TURU: { name: 'Hizmet Türü', slug: 'hizmet-turu', type: 'text' },
  
  // Yedek Parça
  UYUMLU_MARKA: { name: 'Uyumlu Marka', slug: 'uyumlu-marka', type: 'text' },
  
  // İş Makineleri
  SAAT: { name: 'Çalışma Saati', slug: 'saat', type: 'number' },
};

// Category Map
const CATEGORY_ATTRS = {
  'vasita': {
    // Apply to all vehicle subcategories generally, can be refined
    'default': [ATTRS.YIL, ATTRS.YAKIT, ATTRS.VITES, ATTRS.KM, ATTRS.RENK, ATTRS.HASAR_DURUMU, ATTRS.TAKAS],
    'otomobil': [ATTRS.KASA_TIPI, ATTRS.MOTOR_GUCU, ATTRS.MOTOR_HACMI, ATTRS.CEKIS],
    'arazi-suv-pickup': [ATTRS.KASA_TIPI, ATTRS.MOTOR_GUCU, ATTRS.MOTOR_HACMI, ATTRS.CEKIS],
    'motosiklet': [ATTRS.MOTOR_HACMI, ATTRS.MOTOR_GUCU], // Vites is already in default
    'ticari-araclar': [ATTRS.TASIMA_KAPASITESI], // TODO: Add specific attrs if needed
  },
  'yedek-parca-aksesuar-donanim-tuning': {
    'default': [ATTRS.DURUMU, ATTRS.UYUMLU_MARKA]
  },
  'is-makineleri-sanayi': {
    'default': [ATTRS.DURUMU, ATTRS.MARKA, ATTRS.YIL, ATTRS.SAAT]
  },
  'alisveris': {
    'default': [ATTRS.DURUMU, ATTRS.GARANTI, ATTRS.MARKA]
  },
  'is-ilanlari': {
    'default': [ATTRS.CALISMA_SEKLI, ATTRS.POZISYON_SEVIYESI, ATTRS.DENEYIM_SURESI, ATTRS.EGITIM_SEVIYESI]
  },
  'hayvanlar-alemi': {
    'default': [ATTRS.YAS, ATTRS.CINSIYET, ATTRS.IRK, ATTRS.ASI_DURUMU]
  },
  'ozel-ders-arayanlar': {
    'default': [ATTRS.DERS_YERI, ATTRS.DERS_SEVIYESI, ATTRS.DENEYIM_SURESI]
  },
  'ustalar-hizmetler': {
    'default': [ATTRS.HIZMET_TURU, ATTRS.DENEYIM_SURESI]
  },
  'yardimci-arayanlar': {
    'default': [ATTRS.CALISMA_SEKLI, ATTRS.DENEYIM_SURESI, ATTRS.CINSIYET] // Gender preference for helpers often exists
  }
};

async function main() {
  console.log('Diğer kategoriler ve özellikleri güncelleniyor...');

  for (const [catSlug, config] of Object.entries(CATEGORY_ATTRS)) {
    // 1. Find Main Category
    const category = await prisma.category.findUnique({
      where: { slug: catSlug },
      include: { subcategories: true }
    });

    if (!category) {
      console.warn(`UYARI: "${catSlug}" kategorisi bulunamadı. Atlanıyor.`);
      continue;
    }
    
    console.log(`\nKategori İşleniyor: ${category.name} (${catSlug})`);

    // 2. Process Subcategories
    for (const sub of category.subcategories) {
      console.log(`  > Alt Kategori: ${sub.name} (${sub.slug})`);
      
      // Determine attributes for this subcategory
      // Merge 'default' attributes with specific subcategory attributes if any
      let attrs = [...(config['default'] || [])];
      
      if (config[sub.slug]) {
        attrs = [...attrs, ...config[sub.slug]];
      }
      
      // Filter out undefineds
      attrs = attrs.filter(Boolean);

      if (attrs.length === 0) {
        console.log(`    Özellik tanımlanmamış.`);
        continue;
      }

      console.log(`    ${attrs.length} özellik ekleniyor...`);

      let order = 1;
      for (const attr of attrs) {
        // Check existing
        const existingAttr = await prisma.categoryAttribute.findFirst({
            where: {
                subCategoryId: sub.id,
                slug: attr.slug
            }
        });

        const data = {
            categoryId: category.id,
            subCategoryId: sub.id,
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
  }

  console.log('\nİşlem tamamlandı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
