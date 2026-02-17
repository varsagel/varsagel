import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";
import { logApiError, createModuleLogger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

const logger = createModuleLogger('admin-attributes');

export async function GET(req: Request) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      logger.warn('Unauthorized admin access attempt in GET attributes');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const subCategoryId = searchParams.get("subCategoryId") || undefined;
    const q = searchParams.get("q") || undefined;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const attributes = await prisma.categoryAttribute.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        category: true,
        subCategory: true,
      } as any,
    });

    logger.info('Admin fetched attributes successfully', { userId, count: attributes.length });
    return NextResponse.json(attributes);
  } catch (error) {
    logApiError(error as Error, req);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      logger.warn('Unauthorized admin access attempt in POST attributes');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, subCategoryId, name, slug, type, optionsJson, required, showInRequest, showInOffer, order } = body;

    const data: Prisma.CategoryAttributeCreateInput = {
      name,
      slug,
      type,
      optionsJson: typeof optionsJson === "object" ? JSON.stringify(optionsJson) : optionsJson,
      required,
      ...(showInRequest !== undefined ? { showInRequest } : {}),
      ...(showInOffer !== undefined ? { showInOffer } : {}),
      order,
      category: {
        connect: { id: categoryId },
      },
      ...(subCategoryId
        ? {
            subCategory: {
              connect: { id: subCategoryId },
            },
          }
        : {}),
    };

    const attribute = await prisma.categoryAttribute.create({ data });

    logger.info('Admin created attribute successfully', { userId, attributeId: attribute.id, name: attribute.name });
    return NextResponse.json(attribute);
  } catch (error) {
    logApiError(error as Error, req);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}
