
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const categorySlug = 'yedek-parca-aksesuar-donanim-tuning';
  
  console.log(`Checking category: ${categorySlug}`);
  
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      subcategories: true,
      attributes: true
    }
  });

  if (!category) {
    console.log('Category not found');
    return;
  }

  console.log(`Category found: ${category.name} (${category.id})`);
  console.log(`Total subcategories: ${category.subcategories.length}`);
  
  // Check for specific subcategory "atesleme-yakit"
  const targetSlug = 'atesleme-yakit';
  const targetSub = category.subcategories.find(s => s.slug === targetSlug);
  
  if (targetSub) {
    console.log(`SubCategory found: ${targetSub.name} (${targetSub.slug}) - ID: ${targetSub.id}`);
    
    // Check attributes for this subcategory
    const attrs = await prisma.categoryAttribute.findMany({
      where: {
        categoryId: category.id,
        subCategoryId: targetSub.id
      }
    });
    console.log(`Attributes for ${targetSlug}:`, attrs.map(a => a.name));
  } else {
    console.log(`SubCategory '${targetSlug}' NOT found under this category.`);
    
    // Search for similar slugs
    const similar = category.subcategories.filter(s => s.slug.includes('atesleme'));
    console.log('Similar subcategories:', similar.map(s => `${s.name} (${s.slug})`));
  }
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
