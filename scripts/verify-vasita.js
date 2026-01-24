const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: 'vasita' },
    include: {
      subcategories: {
        where: { 
        slug: { in: ['otomobil', 'ticari-araclar-kamyon-kamyonet'] }
    },
        include: { attributes: { orderBy: { order: 'asc' } } }
      }
    }
  });

  if (!category || category.subcategories.length === 0) {
    console.log('Category or Subcategory not found.');
    return;
  }

  category.subcategories.forEach(sub => {
      console.log(`\nSubcategory: ${sub.name} (${sub.slug})`);
      console.log('Attributes:');
      sub.attributes.forEach(attr => {
        console.log(`- ${attr.name} (${attr.slug}) [${attr.type}]`);
        if (attr.optionsJson) {
          const options = JSON.parse(attr.optionsJson);
          if (Array.isArray(options)) {
            console.log(`  Options count: ${options.length}`);
            console.log(`  First 5 options: ${options.slice(0, 5).join(', ')}`);
          } else {
            console.log(`  Options: ${JSON.stringify(options)}`);
          }
        } else {
             console.log('  No options.');
        }
      });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
