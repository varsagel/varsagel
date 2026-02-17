const https = require("https");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const host = "www.varsagel.com";
const port = Number(process.env.PORT || 3004);

function request(path, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
    const opts = {
      hostname: host,
      port,
      path,
      method,
      rejectUnauthorized: false,
      headers,
    };
    if (data && !opts.headers["Content-Type"]) {
      opts.headers["Content-Type"] = "application/json";
    }
    if (data) {
      opts.headers["Content-Length"] = Buffer.byteLength(data);
    }
    const req = https.request(opts, (res) => {
      let raw = "";
      res.on("data", (chunk) => {
        raw += chunk;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body: raw });
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function requestJson(path, method, body, headers = {}) {
  const res = await request(path, method, body, headers);
  let json = null;
  try {
    json = JSON.parse(res.body || "null");
  } catch {}
  return { ...res, json };
}

function flattenCategories(categories) {
  const items = [];
  for (const cat of categories || []) {
    const catSlug = String(cat.slug || "");
    const catName = String(cat.name || "");
    const walk = (nodes) => {
      for (const n of nodes || []) {
        const subSlug = String(n.slug || "");
        const subName = String(n.name || "");
        const children = Array.isArray(n.subcategories) ? n.subcategories : [];
        if (children.length === 0) {
          items.push({ categorySlug: catSlug, categoryName: catName, subSlug, subName });
        } else {
          walk(children);
        }
      }
    };
    walk(Array.isArray(cat.subcategories) ? cat.subcategories : []);
  }
  return items;
}

async function registerAndVerify(email, name, password) {
  await requestJson("/api/register", "POST", { name, email, password }, { "Content-Type": "application/json" });
  const token = await prisma.verificationToken.findFirst({
    where: { identifier: email.toLowerCase().trim() },
    orderBy: { expires: "desc" },
    select: { token: true },
  });
  if (token?.token) {
    await requestJson("/api/auth/verify-email", "POST", { token: token.token }, { "Content-Type": "application/json" });
  }
}

async function ensureUserProfile(email, name, password, image, phone, preferencesJson) {
  const hash = await bcrypt.hash(password, 10);
  const now = new Date();
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash: hash,
      emailVerified: now,
      role: "USER",
      image,
      phone,
      preferencesJson,
    },
    create: {
      email,
      name,
      passwordHash: hash,
      emailVerified: now,
      role: "USER",
      image,
      phone,
      preferencesJson,
    },
  });
  return user;
}

async function ensureCategory(slug, name, icon) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.category.create({ data: { slug, name, icon: icon || null } });
}

async function ensureSubCategory(categoryId, slug, name) {
  const existing = await prisma.subCategory.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.subCategory.create({ data: { slug, name, categoryId } });
}

async function main() {
  const password = "Test123!";
  const ownerEmail = "talep@varsagel.local";
  const sellerEmail = "teklif@varsagel.local";

  await registerAndVerify(ownerEmail, "Talep Sahibi", password);
  await registerAndVerify(sellerEmail, "Teklif Sahibi", password);

  const owner = await ensureUserProfile(
    ownerEmail,
    "Talep Sahibi",
    password,
    "https://placehold.co/128x128?text=Owner",
    "5551112233",
    JSON.stringify({ newOffers: true, messages: true, marketingEmails: false })
  );
  const seller = await ensureUserProfile(
    sellerEmail,
    "Teklif Sahibi",
    password,
    "https://placehold.co/128x128?text=Seller",
    "5554445566",
    JSON.stringify({ newOffers: true, messages: true, marketingEmails: false })
  );

  const categoriesRes = await requestJson("/api/categories", "GET");
  if (categoriesRes.status !== 200 || !Array.isArray(categoriesRes.json)) {
    throw new Error(`categories fetch failed: ${categoriesRes.status}`);
  }
  const leafSubcategories = flattenCategories(categoriesRes.json);
  const categoryOrder = categoriesRes.json.map((c) => String(c.slug || "")).filter(Boolean);

  const createdListings = [];
  const createdOffers = [];
  const errors = [];

  for (const item of leafSubcategories) {
    try {
      const category = await ensureCategory(item.categorySlug, item.categoryName, null);
      const subCategory = await ensureSubCategory(category.id, item.subSlug, item.subName);
      const title = `[E2E] ${item.categorySlug} / ${item.subSlug}`;
      const listing = await prisma.listing.create({
        data: {
          title,
          description: "Kapsamlı test senaryosu için oluşturuldu.",
          imagesJson: JSON.stringify([`https://placehold.co/800x600?text=${encodeURIComponent(item.subSlug)}`]),
          budget: BigInt(10000 + Math.floor(Math.random() * 90000)),
          city: "İstanbul",
          district: "Kadıköy",
          status: "OPEN",
          ownerId: owner.id,
          categoryId: category.id,
          subCategoryId: subCategory.id,
        },
      });
      createdListings.push({ listing, categorySlug: item.categorySlug, subSlug: item.subSlug });

      const offerPrice = Math.max(1, Math.floor(Number(listing.budget || 0) * 0.9));
      const offer = await prisma.offer.create({
        data: {
          listingId: listing.id,
          sellerId: seller.id,
          price: BigInt(offerPrice),
          body: "Teklifim hazır. Detayları konuşabiliriz.",
          status: "PENDING",
          imagesJson: JSON.stringify([`https://placehold.co/800x600?text=Offer+${encodeURIComponent(listing.id.slice(0, 6))}`]),
        },
      });
      createdOffers.push(offer);

      await prisma.message.create({
        data: {
          listingId: listing.id,
          senderId: seller.id,
          toUserId: owner.id,
          content: "Merhaba, talebiniz için teklifimi gönderdim.",
          read: false,
        },
      });

      await prisma.notification.create({
        data: {
          userId: owner.id,
          type: "offer_received",
          title: "Yeni teklif aldınız",
          body: listing.title,
          dataJson: JSON.stringify({ listingId: listing.id, offerId: offer.id }),
        },
      });
    } catch (e) {
      errors.push({ category: item.categorySlug, subcategory: item.subSlug, error: String(e?.message || e) });
    }
  }

  const acceptCategory = categoryOrder[0] || "";
  const rejectCategory = categoryOrder[1] || "";

  const acceptListing = createdListings.find((l) => l.categorySlug === acceptCategory)?.listing || null;
  const rejectListing = createdListings.find((l) => l.categorySlug === rejectCategory)?.listing || null;

  const acceptOffer = acceptListing ? createdOffers.find((o) => o.listingId === acceptListing.id) : null;
  const rejectOffer = rejectListing ? createdOffers.find((o) => o.listingId === rejectListing.id) : null;

  if (acceptOffer && acceptListing) {
    await prisma.offer.update({ where: { id: acceptOffer.id }, data: { status: "ACCEPTED" } });
    await prisma.listing.update({ where: { id: acceptListing.id }, data: { status: "CLOSED" } });
    await prisma.message.create({
      data: {
        listingId: acceptListing.id,
        senderId: owner.id,
        toUserId: seller.id,
        content: "Teklifi kabul ettim, konuşabiliriz.",
        read: false,
      },
    });
    await prisma.notification.create({
      data: {
        userId: seller.id,
        type: "offer_accepted",
        title: "Teklif kabul edildi",
        body: acceptListing.title,
        dataJson: JSON.stringify({ listingId: acceptListing.id, offerId: acceptOffer.id }),
      },
    });
    await prisma.listing.update({ where: { id: acceptListing.id }, data: { status: "OPEN" } });
  }

  if (rejectOffer && rejectListing) {
    await prisma.offer.update({
      where: { id: rejectOffer.id },
      data: { status: "REJECTED", rejectionReason: "Fiyat uygun değil" },
    });
    await prisma.listing.update({ where: { id: rejectListing.id }, data: { status: "OPEN" } });
    await prisma.message.create({
      data: {
        listingId: rejectListing.id,
        senderId: owner.id,
        toUserId: seller.id,
        content: "Teklifi reddettim, farklı bir teklif verebilirsiniz.",
        read: false,
      },
    });
    await prisma.notification.create({
      data: {
        userId: seller.id,
        type: "offer_rejected",
        title: "Teklif reddedildi",
        body: rejectListing.title,
        dataJson: JSON.stringify({ listingId: rejectListing.id, offerId: rejectOffer.id }),
      },
    });
  }

  const favoriteTargets = createdListings.slice(0, 10);
  for (const item of favoriteTargets) {
    try {
      await prisma.favorite.create({
        data: {
          userId: seller.id,
          listingId: item.listing.id,
        },
      });
    } catch {}
  }

  const listingPublic = createdListings[0]?.listing
    ? await requestJson(`/api/talepler/${createdListings[0].listing.id}`, "GET")
    : { status: 0 };

  const summary = {
    totals: {
      categories: categoriesRes.json.length,
      subcategories: leafSubcategories.length,
      listings: createdListings.length,
      offers: createdOffers.length,
      errors: errors.length,
      favorites: favoriteTargets.length,
    },
    acceptCategory,
    rejectCategory,
    sampleListingId: createdListings[0]?.listing?.id || null,
    sampleOfferId: createdOffers[0]?.id || null,
    listingPublicStatus: listingPublic.status,
    errors,
  };
  console.log(JSON.stringify(summary, null, 2));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
