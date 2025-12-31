
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function createListing() {
  // Use localhost IP to avoid resolution issues, port 3004
  const url = 'https://127.0.0.1:3004/api/talep-olustur';
  
  const payload = {
    title: "İstanbul Kadıköy'de Satılık 3+1 Daire",
    description: "Merkezi konumda, metroya yakın, krediye uygun, geniş ve ferah daire.",
    category: "emlak",
    subcategory: "satilik-daire",
    city: "İstanbul",
    district: "Kadıköy",
    budget: "5000000",
    minBudget: "4000000",
    images: [],
    attributes: {
      odaSayisi: "3+1",
      m2Min: "110",
      m2Max: "130",
      binaYasiMin: "5",
      binaYasiMax: "10",
      bulunduguKat: ["3"],
      isitma: "Doğalgaz (Kombi)",
      banyoSayisi: "2",
      balkon: true,
      esyali: false,
      kullanimDurumu: "Boş",
      siteIcerisinde: true,
      aidat: 1500,
      cephe: ["Güney", "Doğu"],
      tapuDurumu: "Kat Mülkiyeti",
      krediyeUygun: true,
      takas: false,
      minPrice: 4000000,
      maxPrice: 5000000
    }
  };

  console.log('Sending payload to ' + url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bypass-auth': 'true',
        'x-debug-user-email': 'test@example.com',
        'Host': 'www.varsagel.com'
      },
      body: JSON.stringify(payload),
      redirect: 'manual'
    });

    console.log('Status:', response.status);
    if (response.status === 301 || response.status === 302) {
       console.log('Location:', response.headers.get('location'));
    }
    
    const text = await response.text();
    console.log('Response body:', text);

  } catch (error) {
    console.error('Error creating listing:', error);
  }
}

createListing();
