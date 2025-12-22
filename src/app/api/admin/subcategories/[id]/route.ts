import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.listing.updateMany({
      where: { subCategoryId: params.id },
      data: { subCategoryId: null }
    });

    await prisma.subCategory.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
  }
}

