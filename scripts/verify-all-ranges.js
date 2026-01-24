const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllRanges() {
  const emlak = await prisma.category.findFirst({
    where: { slug: 'emlak' },
    include: {
      subcategories: {
        include: {
          attributes: true
        }
      }
    }
  });

  if (!emlak) {
    console.error('Emlak category not found');
    return;
  }

  const subCategories = emlak.subcategories;

  console.log(`Found ${subCategories.length} subcategories.`);
  console.log('--------------------------------------------------');

  for (const sub of subCategories) {
    if (!sub.attributes || sub.attributes.length === 0) continue;

    const attributes = sub.attributes;
    const rangeAttributes = attributes.filter(a => a.type === 'range-number');

    if (rangeAttributes.length > 0) {
      console.log(`\nSubCategory: ${sub.name} (${sub.slug})`);
      console.log(`Total Attributes: ${attributes.length}`);
      console.log('Range Attributes:');
      rangeAttributes.forEach(attr => {
        let options = attr.optionsJson ? JSON.parse(attr.optionsJson) : {};
        console.log(`  - ${attr.name} [${attr.slug}] (min: ${options.minKey}, max: ${options.maxKey})`);
      });
    }
  }
}

verifyAllRanges()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
