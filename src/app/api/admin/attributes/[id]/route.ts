import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";
import { createModuleLogger } from "@/lib/logger";

const logger = createModuleLogger('admin-attributes');

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  const { id } = await params;

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: "Attribute ID is required" }, { status: 400 });
  }

  try {
    userId = await getAdminUserId();
    if (!userId) {
      logger.warn('Unauthorized admin access attempt', { userId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, type, optionsJson, required, showInRequest, showInOffer, order, subCategoryId } = body;

    const data: any = {
      name,
      slug,
      type,
      optionsJson: typeof optionsJson === 'object' ? JSON.stringify(optionsJson) : optionsJson,
      required,
      ...(showInRequest !== undefined ? { showInRequest } : {}),
      ...(showInOffer !== undefined ? { showInOffer } : {}),
      order,
      subCategoryId: subCategoryId === undefined ? undefined : (subCategoryId || null)
    };

    const attribute = await prisma.categoryAttribute.update({
      where: { id },
      data
    });

    return NextResponse.json(attribute);
  } catch (error) {
    logger.error('Failed to update attribute', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      attributeId: id,
      userId 
    });
    return NextResponse.json({ error: "Failed to update attribute" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      logger.warn('Unauthorized admin delete attempt', { userId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await prisma.categoryAttribute.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error('Failed to delete attribute', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        attributeId: id,
        userId 
      });
      return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
    }
  } catch (error) {
    logger.error('Failed to delete attribute', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      attributeId: id
    });
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
