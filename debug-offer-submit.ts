import { PrismaClient } from '@prisma/client';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding valid OPEN listing...');
  const listings = await prisma.listing.findMany({
    where: { status: 'OPEN' },
    include: { owner: true },
    take: 1
  });

  if (listings.length === 0) {
    console.error('No OPEN listings found.');
    return;
  }

  const listing = listings[0];
  console.log(`Found listing: [${listing.id}] ${listing.title} (Owner: ${listing.ownerId})`);

  console.log('Finding a seller user (different from owner)...');
  const seller = await prisma.user.findFirst({
    where: {
      id: { not: listing.ownerId }
    }
  });

  if (!seller) {
    console.error('No suitable seller user found.');
    return;
  }
  console.log(`Found seller: ${seller.email} (${seller.id})`);

  // Prepare payload
  const payload = {
    listingId: listing.id,
    price: Math.max(1, Math.floor(Number((listing as any).price || 1000) * 0.9)),
    message: "Bu bir test teklifidir. Lütfen dikkate almayınız. (Test offer message > 20 chars)",
    images: ["https://placehold.co/400"],
    attributes: {}
  };

  const url = 'https://localhost/api/teklif-ver';
  console.log(`Submitting offer to ${url} ...`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bypass-auth': 'true',
        'x-debug-user-id': seller.id,
        'Host': 'www.varsagel.com'
      },
      redirect: 'manual',
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const text = await res.text();
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${text}`);
    
    try {
        const json = JSON.parse(text);
        if (json.ok) {
            console.log("SUCCESS: Offer created!");
        } else {
            console.log("FAILURE: " + json.error);
        }
    } catch {
        console.log("Response is not JSON.");
    }

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
