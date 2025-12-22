import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ATTR_SCHEMAS, AttrField } from "@/data/attribute-schemas";
import { ATTR_SUBSCHEMAS } from "@/data/attribute-overrides";

export async function GET() {
  try {
    const log: string[] = [];
    log.push("Starting attribute seed...");

    // 1. Seed Top-Level Category Attributes (ATTR_SCHEMAS)
    for (const [categorySlug, fields] of Object.entries(ATTR_SCHEMAS)) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        log.push(`Category not found: ${categorySlug}`);
        continue;
      }

      log.push(`Processing category: ${category.name} (${categorySlug})`);

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        await createAttribute(category.id, null, field, i);
      }
    }

    // 2. Seed Sub-Category Attributes (ATTR_SUBSCHEMAS)
    for (const [key, fields] of Object.entries(ATTR_SUBSCHEMAS)) {
      // key format: "categorySlug/subcategorySlug"
      const [catSlug, subSlug] = key.split("/");
      if (!catSlug || !subSlug) continue;

      const subcategory = await prisma.subCategory.findFirst({
        where: {
          slug: subSlug,
          category: {
            slug: catSlug,
          },
        },
        include: {
          category: true,
        },
      });

      if (!subcategory) {
        log.push(`Subcategory not found: ${key}`);
        continue;
      }

      log.push(`Processing subcategory: ${subcategory.name} (${key})`);

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        await createAttribute(subcategory.categoryId, subcategory.id, field, i);
      }
    }

    log.push("Seeding completed.");
    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

async function createAttribute(
  categoryId: string,
  subCategoryId: string | null,
  field: AttrField,
  order: number
) {
  // Generate a unique slug for the attribute if 'key' is missing
  // The schema uses 'key', 'minKey', 'maxKey'.
  // We prefer 'key'. If range, we might need to handle differently or store as one attribute.
  // The 'CategoryAttribute' model has 'slug'.
  // In TalepForm, it maps DB attributes to UI fields.
  // DB attribute `slug` maps to `key`.

  let slug = field.key;
  if (!slug) {
    if (field.type === "range-number") {
      // For range, we usually store one attribute in DB, but the UI expands it to min/max.
      // However, the static schema defines minKey/maxKey.
      // The DB model is single record per attribute.
      // If we save it as type 'range-number', the UI should handle it.
      // We need a slug for it.
      // Usually range attributes in static schema don't have a main 'key', just minKey/maxKey.
      // We can derive a slug from label or use minKey base.
      if (field.minKey) {
        slug = field.minKey.replace("Min", "");
      } else {
        slug =
          field.label
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .replace(/\s+/g, "") || "attr_" + order;
      }
    } else {
        slug = field.label
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s+/g, "") || "attr_" + order;
    }
  }

  // Check if exists
  const where: any = {
    categoryId,
    slug: slug!,
  };
  if (subCategoryId) {
    where.subCategoryId = subCategoryId;
  } else {
    where.subCategoryId = null;
  }

  const existing = await prisma.categoryAttribute.findFirst({
    where,
  });

  if (existing) {
    // Update? Or skip. Let's update options and order.
    await prisma.categoryAttribute.update({
      where: { id: existing.id },
      data: {
        name: field.label,
        type: field.type,
        optionsJson: field.options ? JSON.stringify(field.options) : null,
        required: field.required || false,
        order,
      },
    });
  } else {
    await prisma.categoryAttribute.create({
      data: {
        categoryId,
        subCategoryId,
        name: field.label,
        slug: slug!,
        type: field.type,
        optionsJson: field.options ? JSON.stringify(field.options) : null,
        required: field.required || false,
        order,
      },
    });
  }
}
