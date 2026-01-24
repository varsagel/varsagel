import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const REQUEST_OWNER_EMAIL = process.env.REQUEST_OWNER_EMAIL || "demo@varsagel.local";
const SELLER_EMAIL = process.env.SELLER_EMAIL || "teklifsahibi@gmail.com";
const TITLE_CONTAINS = String(process.env.TITLE_CONTAINS || "Deneme Talebi,Örnek Talep,deneme")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let cachedAttrSchemas = null;

async function ensureUser(email, name) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) return user;

  const bcrypt = await import("bcrypt");
  const passwordHash = await bcrypt.hash("123456", 10);

  user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "USER",
      phone: "5555555555",
    },
  });
  return user;
}

async function loadAttrSchemas() {
  if (cachedAttrSchemas) return cachedAttrSchemas;
  const filePath = path.resolve(process.cwd(), "src/data/xlsx-attr-schemas.json");
  const raw = await readFile(filePath, "utf-8");
  cachedAttrSchemas = JSON.parse(raw);
  return cachedAttrSchemas;
}

function normalizeSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function normalizeSubSlug(slug) {
  const value = String(slug || "").trim();
  if (value.includes("/")) return value.split("/").filter(Boolean).join("-");
  return value;
}

function normalizeKey(categorySlug, raw) {
  const key = String(raw || "").trim();
  if (categorySlug === "vasita") {
    if (key === "motor-seri") return "seri";
    if (key === "donanim-paket") return "paket";
  }
  return key;
}

function mapOverrideFields(categorySlug, key, schema) {
  return schema.map((f, index) => ({
    id: `${key}:${index}`,
    name: f.label,
    slug: normalizeKey(categorySlug, f.key || f.slug || f.label),
    type: f.type,
    options: Array.isArray(f.options) ? f.options : [],
    required: !!f.required,
    order: index,
    showInOffer: true,
    showInRequest: true,
    minKey: f.minKey,
    maxKey: f.maxKey,
    min: f.min,
    max: f.max,
  }));
}

async function getMergedFields(categorySlug, subSlug) {
  const attrSchemas = await loadAttrSchemas();
  const normalizedSubSlug = normalizeSubSlug(subSlug);
  const keyCandidates = [
    normalizedSubSlug ? `${categorySlug}/${normalizedSubSlug}` : "",
    subSlug ? `${categorySlug}/${subSlug}` : "",
    categorySlug,
  ].filter(Boolean);

  let overrideFields = null;
  for (const key of keyCandidates) {
    const schema = attrSchemas?.[key];
    if (Array.isArray(schema) && schema.length > 0) {
      overrideFields = mapOverrideFields(categorySlug, key, schema);
      break;
    }
  }

  const category = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
  const subCategory = subSlug
    ? await prisma.subCategory.findUnique({ where: { slug: subSlug }, select: { id: true } })
    : null;
  const subCategoryId = subCategory?.id || null;
  const subcategoryRequested = !!subSlug;

  const dbAttrs = category?.id
    ? await prisma.categoryAttribute.findMany({
        where: {
          categoryId: category.id,
          ...(subCategoryId
            ? { OR: [{ subCategoryId: null }, { subCategoryId }] }
            : subcategoryRequested
              ? { subCategoryId: null }
              : {}),
        },
        orderBy: [{ subCategoryId: "asc" }, { order: "asc" }],
      })
    : [];

  const dbMapped = dbAttrs.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    type: a.type,
    options: (() => {
      try {
        const parsed = a.optionsJson ? JSON.parse(a.optionsJson) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    required: a.required,
    order: a.order,
    showInOffer: a.showInOffer,
    showInRequest: a.showInRequest,
    subCategoryId: a.subCategoryId,
  }));

  if (overrideFields && overrideFields.length > 0) {
    if (dbMapped.length === 0) return overrideFields;
    const dbBySlug = new Map(dbMapped.map((a) => [normalizeSlug(a.slug), a]));
    const merged = overrideFields.map((o) => {
      const db = dbBySlug.get(normalizeSlug(o.slug));
      if (!db) return o;
      return {
        ...o,
        required: db.required,
        showInOffer: db.showInOffer,
        showInRequest: db.showInRequest,
        type: o.type || db.type,
        options: o.options?.length ? o.options : db.options,
      };
    });
    const seen = new Set(merged.map((o) => normalizeSlug(o.slug)));
    const missingRequired = dbMapped.filter((a) => a.required && !seen.has(normalizeSlug(a.slug)));
    const missingOptional = dbMapped.filter((a) => !a.required && !seen.has(normalizeSlug(a.slug)));
    return [
      ...missingRequired.sort((a, b) => (a.order || 0) - (b.order || 0)),
      ...merged,
      ...missingOptional.sort((a, b) => (a.order || 0) - (b.order || 0)),
    ];
  }

  return dbMapped;
}

function buildAttributes(fields, mode) {
  const attributes = {};
  for (const field of fields) {
    if (mode === "request" && field.showInRequest === false) continue;
    if (mode === "offer" && field.showInOffer === false) continue;

    const key = field.slug || field.key || field.name;
    if (!key) continue;

    const type = String(field.type || "").toLowerCase();
    if (type.startsWith("range")) {
      const baseKey = String(key);
      const minKey = field.minKey || `${baseKey}Min`;
      const maxKey = field.maxKey || `${baseKey}Max`;
      const minValue = Number.isFinite(field.min) ? Number(field.min) : 1;
      const maxValue = Number.isFinite(field.max) ? Number(field.max) : minValue + 1;
      attributes[minKey] = minValue;
      attributes[maxKey] = maxValue;
      continue;
    }

    if (type === "number") {
      attributes[key] = Number.isFinite(field.min) ? Number(field.min) : 1;
      continue;
    }

    if (type === "boolean") {
      attributes[key] = true;
      continue;
    }

    if (type === "select") {
      const options = Array.isArray(field.options) ? field.options : [];
      attributes[key] = options[0] ?? "Seçenek";
      continue;
    }

    if (type === "multiselect") {
      const options = Array.isArray(field.options) ? field.options : [];
      attributes[key] = options.length > 0 ? [options[0]] : ["Seçenek"];
      continue;
    }

    attributes[key] = `${field.name || key} Test`;
  }
  return attributes;
}

function nowIso() {
  return new Date().toISOString();
}

function makeOfferMessage(listingTitle) {
  return `Merhaba, "${listingTitle}" talebiniz için teklifim hazır. Detayları konuşabiliriz.`;
}

function makeOfferImages(listingId) {
  return [
    `https://placehold.co/800x600?text=Teklif+${encodeURIComponent(listingId.slice(0, 6))}`,
  ];
}

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: REQUEST_OWNER_EMAIL } });
  if (!owner) {
    throw new Error(`Talep sahibi kullanıcı bulunamadı: ${REQUEST_OWNER_EMAIL}`);
  }
  const seller = await ensureUser(SELLER_EMAIL, "Teklif Sahibi");

  const titleOr = TITLE_CONTAINS.map((x) => ({ title: { contains: x } }));

  const listings = await prisma.listing.findMany({
    where: {
      ownerId: owner.id,
      status: "OPEN",
      ...(titleOr.length ? { OR: titleOr } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      budget: true,
      createdAt: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
  });

  process.stdout.write(`[${nowIso()}] listings=${listings.length}\n`);

  let createdOffers = 0;
  let acceptedOffers = 0;
  let skippedAlreadyAccepted = 0;

  for (let index = 0; index < listings.length; index++) {
    const l = listings[index];
    process.stdout.write(`\n[${nowIso()}] listing=${l.id} "${l.title}"\n`);

    const existing = await prisma.offer.findFirst({
      where: { listingId: l.id, sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, price: true },
    });

    if (existing?.status === "ACCEPTED") {
      process.stdout.write(`  offer=EXISTS accepted id=${existing.id}\n`);
      skippedAlreadyAccepted += 1;
      continue;
    }

    let offerId = existing?.id || null;
    let offerPriceNum = existing?.price ? Number(existing.price) : null;
    const fields = await getMergedFields(l.category.slug, l.subCategory?.slug || "");
    const offerAttributes = buildAttributes(fields, "offer");
    const images = makeOfferImages(l.id);

    if (!offerId) {
      const budgetNum = l.budget ? Number(l.budget) : 10000;
      const price = Math.max(1, Math.floor(budgetNum * 0.9));
      const body = makeOfferMessage(l.title);

      const created = await prisma.offer.create({
        data: {
          listingId: l.id,
          sellerId: seller.id,
          price: BigInt(price),
          body,
          status: "PENDING",
          imagesJson: JSON.stringify(images),
          attributesJson: JSON.stringify(offerAttributes),
        },
        select: { id: true },
      });
      offerId = created.id;
      offerPriceNum = price;
      createdOffers += 1;
      process.stdout.write(`  offer=CREATED pending id=${offerId}\n`);
    } else {
      process.stdout.write(`  offer=EXISTS status=${existing?.status} id=${offerId}\n`);
      if (existing?.status !== "PENDING") {
        await prisma.offer.update({
          where: { id: offerId },
          data: {
            status: "PENDING",
            attributesJson: JSON.stringify(offerAttributes),
            imagesJson: JSON.stringify(images),
          },
        });
        process.stdout.write(`  offer=RESET status=PENDING id=${offerId}\n`);
      }
    }

    const shouldAccept = index % 2 === 0;
    if (shouldAccept) {
      await prisma.offer.update({ where: { id: offerId }, data: { status: "ACCEPTED" } });
      acceptedOffers += 1;
      process.stdout.write(`  offer=ACCEPTED id=${offerId}\n`);
    } else {
      await prisma.offer.update({
        where: { id: offerId },
        data: { status: "REJECTED", rejectionReason: "Fiyat uygun değil" },
      });
      process.stdout.write(`  offer=REJECTED id=${offerId}\n`);
    }
    if (!offerPriceNum) {
      const offer = await prisma.offer.findUnique({ where: { id: offerId }, select: { price: true } });
      offerPriceNum = offer?.price ? Number(offer.price) : 0;
    }

    await prisma.message.create({
      data: {
        listingId: l.id,
        senderId: owner.id,
        toUserId: seller.id,
        content: shouldAccept
          ? `Teklifinizi kabul ettim! İlan hakkında konuşabiliriz. (Teklif: ${Number(offerPriceNum || 0).toLocaleString("tr-TR")})`
          : `Teklifinizi reddettim. İsterseniz güncellenmiş teklif paylaşabilirsiniz.`,
        read: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: seller.id,
        type: shouldAccept ? "offer_accepted" : "offer_rejected",
        title: shouldAccept ? "Teklif kabul edildi" : "Teklif reddedildi",
        body: shouldAccept ? l.title : "Teklifiniz reddedildi. Sebep: Fiyat uygun değil",
        dataJson: JSON.stringify({ listingId: l.id, offerId }),
      },
    });
  }

  process.stdout.write(`\n[${nowIso()}] DONE\n`);
  process.stdout.write(
    `createdOffers=${createdOffers} acceptedOffers=${acceptedOffers} skippedAlreadyAccepted=${skippedAlreadyAccepted}\n`,
  );
}

main()
  .catch((e) => {
    process.stderr.write(String(e?.message || e) + "\n");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
