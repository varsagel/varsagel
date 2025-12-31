const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function upsertCategory(slug, name) {
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  })
}

async function upsertSub(categoryId, slug, name) {
  return prisma.subCategory.upsert({
    where: { slug },
    update: { name, categoryId },
    create: { slug, name, categoryId },
  })
}

async function upsertUser(email, name) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing
  return prisma.user.create({ data: { email, name } })
}

async function makeListing({ title, description, budget, city, district, categoryId, subCategoryId, ownerId, images = [], attributes = {}, code }) {
  return prisma.listing.create({
    data: {
      title,
      description,
      budget: budget != null ? BigInt(budget) : null,
      city,
      district,
      status: 'OPEN',
      ownerId,
      categoryId,
      subCategoryId,
      imagesJson: images.length ? JSON.stringify(images) : null,
      attributesJson: Object.keys(attributes).length ? JSON.stringify(attributes) : null,
      code,
    },
  })
}

async function main() {
  const user = await upsertUser('demo@varsagel.local', 'Demo Kullanıcı')

  const catEmlak = await upsertCategory('emlak', 'Emlak')
  const subSatilik = await upsertSub(catEmlak.id, 'satilik-daire', 'Satılık Daire')
  const subKiralik = await upsertSub(catEmlak.id, 'kiralik-daire', 'Kiralık Daire')

  const catVasita = await upsertCategory('vasita', 'Vasıta')
  const subOto = await upsertSub(catVasita.id, 'otomobil', 'Otomobil')

  const catAlis = await upsertCategory('alisveris', 'İkinci El ve Sıfır Alışveriş')
  const subPhone = await upsertSub(catAlis.id, 'cep-telefonu', 'Cep Telefonu')
  const subTV = await upsertSub(catAlis.id, 'televizyon', 'Televizyon')
  const subPC = await upsertSub(catAlis.id, 'bilgisayar', 'Bilgisayar')

  const catYedek = await upsertCategory('yedek-parca-aksesuar-donanim-tuning', 'Yedek Parça, Aksesuar, Donanım & Tuning')
  await upsertSub(catYedek.id, 'otomotiv-ekipmanlari', 'Otomotiv Ekipmanları')
  
  const catIsMakineleri = await upsertCategory('is-makineleri-sanayi', 'İş Makineleri & Sanayi')
  await upsertSub(catIsMakineleri.id, 'is-makineleri', 'İş Makineleri')

  const catUstalar = await upsertCategory('ustalar-hizmetler', 'Ustalar ve Hizmetler')
  await upsertSub(catUstalar.id, 'ev-tadilat-dekorasyon', 'Ev Tadilat & Dekorasyon')

  const catOzelDers = await upsertCategory('ozel-ders-arayanlar', 'Özel Ders Arayanlar')
  await upsertSub(catOzelDers.id, 'lise-universite-hazirlik', 'Lise & Üniversite Hazırlık')

  const catIs = await upsertCategory('is-ilanlari', 'İş İlanları')
  const subUzaktan = await upsertSub(catIs.id, 'it-ve-yazilim-gelistirme', 'IT ve Yazılım Geliştirme')

  const catYardimci = await upsertCategory('yardimci-arayanlar', 'Yardımcı Arayanlar')
  await upsertSub(catYardimci.id, 'bebek-cocuk-bakicisi', 'Bebek & Çocuk Bakıcısı')

  const catHayvan = await upsertCategory('hayvanlar-alemi', 'Hayvanlar Alemi')
  const subKedi = await upsertSub(catHayvan.id, 'evcil-hayvanlar', 'Evcil Hayvanlar')

  // Emlak (2)
  await makeListing({
    title: 'Amasya Merzifon 3+1 Asansör Otopark',
    description: 'Krediye uygun, kat mülkiyetli daire. Yerden ısıtma, balkon mevcut.',
    budget: 1250000,
    city: 'Amasya',
    district: 'Merzifon',
    categoryId: catEmlak.id,
    subCategoryId: subSatilik.id,
    ownerId: user.id,
    images: [],
    attributes: { odaSayisi: '3+1', asansor: true, otopark: true, krediyeUygun: true, tapuDurumu: 'Kat Mülkiyeti', isitma: 'Yerden Isıtma', balkon: true, metrekare: 120 },
    code: 'EM001',
  })
  await makeListing({
    title: 'Adana Yüreğir 2+1 Kiralık Daire',
    description: 'Doğalgaz kombili, eşyalı, giriş kat.',
    budget: 15000,
    city: 'Adana',
    district: 'Yüreğir',
    categoryId: catEmlak.id,
    subCategoryId: subKiralik.id,
    ownerId: user.id,
    images: [],
    attributes: { odaSayisi: '2+1', isitma: 'Doğalgaz', esyali: true, bulunduguKat: 'Giriş Kat', metrekare: 95 },
    code: 'EM002',
  })

  // Vasıta (2)
  await makeListing({
    title: 'BMW 320d Otomatik 2016 Sunroof',
    description: 'Dizel, 120 bin km, hasar kaydı yok.',
    budget: 950000,
    city: 'İstanbul',
    district: 'Kadıköy',
    categoryId: catVasita.id,
    subCategoryId: subOto.id,
    ownerId: user.id,
    attributes: { marka: 'BMW', model: '320d', yilMin: 2016, kmMax: 120000, yakit: 'Dizel', vites: 'Otomatik', sunroof: 'true' },
    code: 'VS001',
  })
  await makeListing({
    title: 'Mercedes GLA 4x4 2018',
    description: 'Otomatik, 80 bin km, 4x4.',
    budget: 1150000,
    city: 'İzmir',
    district: 'Konak',
    categoryId: catVasita.id,
    subCategoryId: subOto.id,
    ownerId: user.id,
    attributes: { marka: 'Mercedes', model: 'GLA', yilMin: 2018, kmMax: 80000, vites: 'Otomatik', cekis: '4x4' },
    code: 'VS002',
  })

  // Alışveriş - Telefon (2)
  await makeListing({
    title: 'Samsung Galaxy S23 5G 256GB',
    description: 'IP68, NFC, Type-C, 5000 mAh',
    budget: 43000,
    city: 'Ankara',
    district: 'Çankaya',
    categoryId: catAlis.id,
    subCategoryId: subPhone.id,
    ownerId: user.id,
    attributes: { marka: 'Samsung', model: 'Galaxy S23', ag: '5G', suDirenci: 'IP68', nfc: true, usbTipi: 'Type-C', pilKapasitesi: 5000 },
    code: 'ALP001',
  })
  await makeListing({
    title: 'Apple iPhone 14 128GB',
    description: 'NFC, suya dayanıklı, garantili.',
    budget: 52000,
    city: 'İstanbul',
    district: 'Üsküdar',
    categoryId: catAlis.id,
    subCategoryId: subPhone.id,
    ownerId: user.id,
    attributes: { marka: 'Apple', model: 'iPhone 14', nfc: true, suDirenci: 'IP68', garanti: true, depolama: 128 },
    code: 'ALP002',
  })

  // Alışveriş - TV (2)
  await makeListing({
    title: 'OLED TV 55" 120Hz Dolby Vision',
    description: 'Smart TV, 4K, panel OLED.',
    budget: 32000,
    city: 'Bursa',
    district: 'Nilüfer',
    categoryId: catAlis.id,
    subCategoryId: subTV.id,
    ownerId: user.id,
    attributes: { ekranBoyutu: 55, yenilemeOrani: 120, hdr: 'Dolby Vision', cozunurluk: '4K', panelTipi: 'OLED', smartTv: true },
    code: 'ALT001',
  })
  await makeListing({
    title: 'QLED TV 65" 120Hz HDR10',
    description: 'Smart TV, 4K, panel QLED.',
    budget: 28000,
    city: 'Antalya',
    district: 'Kepez',
    categoryId: catAlis.id,
    subCategoryId: subTV.id,
    ownerId: user.id,
    attributes: { ekranBoyutu: 65, yenilemeOrani: 120, hdr: 'HDR10', cozunurluk: '4K', panelTipi: 'QLED', smartTv: true },
    code: 'ALT002',
  })

  // Alışveriş - Bilgisayar (2)
  await makeListing({
    title: 'Gaming Laptop RTX 4060 144Hz',
    description: 'Windows 11, IPS, ışıklı klavye.',
    budget: 45000,
    city: 'Kayseri',
    district: 'Melikgazi',
    categoryId: catAlis.id,
    subCategoryId: subPC.id,
    ownerId: user.id,
    attributes: { gpu: 'RTX 4060', isletimSistemi: 'Windows 11', panel: 'IPS', yenilemeOrani: 144, isikliKlavye: true },
    code: 'ALB001',
  })
  await makeListing({
    title: 'Ultrabook i7 16GB 512GB SSD',
    description: 'macOS, 60Hz, hafif kasa.',
    budget: 38000,
    city: 'Eskişehir',
    district: 'Odunpazarı',
    categoryId: catAlis.id,
    subCategoryId: subPC.id,
    ownerId: user.id,
    attributes: { cpu: 'i7-1165G7', ram: 16, depolama: 512, isletimSistemi: 'macOS', yenilemeOrani: 60 },
    code: 'ALB002',
  })

  // İş Talepleri (2)
  await makeListing({
    title: 'Uzaktan React Geliştirici',
    description: 'Senior, maaş beklentisi esnek.',
    budget: 0,
    city: 'Ankara',
    district: 'Yenimahalle',
    categoryId: catIs.id,
    subCategoryId: subUzaktan.id,
    ownerId: user.id,
    attributes: { calismaSekli: 'Uzaktan', seviye: 'Senior', maasMin: 50000 },
    code: 'IS001',
  })
  await makeListing({
    title: 'Uzaktan Data Analyst',
    description: 'Mid, en az 2 yıl deneyim.',
    budget: 0,
    city: 'İzmir',
    district: 'Bornova',
    categoryId: catIs.id,
    subCategoryId: subUzaktan.id,
    ownerId: user.id,
    attributes: { calismaSekli: 'Uzaktan', seviye: 'Mid', deneyimMin: 2 },
    code: 'IS002',
  })

  // Hayvanlar Alemi (2)
  await makeListing({
    title: 'Aşılı Scottish Fold Kedi',
    description: '2 yaşında, erkek, sağlık raporlu.',
    budget: 6000,
    city: 'Konya',
    district: 'Selçuklu',
    categoryId: catHayvan.id,
    subCategoryId: subKedi.id,
    ownerId: user.id,
    attributes: { tur: 'Kedi', cinsiyet: 'Erkek', asili: true, yasMin: 2 },
    code: 'HV001',
  })
  await makeListing({
    title: 'Golden Retriever Yavru',
    description: 'Aşılı, dişi, kısır değil.',
    budget: 8000,
    city: 'Trabzon',
    district: 'Ortahisar',
    categoryId: catHayvan.id,
    subCategoryId: subKedi.id,
    ownerId: user.id,
    attributes: { tur: 'Köpek', cinsiyet: 'Dişi', asili: true },
    code: 'HV002',
  })

  console.log('Seed tamamlandı')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

