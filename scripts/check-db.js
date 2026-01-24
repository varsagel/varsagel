const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slugsToCheck = [
    'arsa-satilik',
    'bina-satilik',
    'konut-projeleri-daire',
    'devre-mulk-satilik',
    'turistik-tesis-satilik-otel'
  ];

  for (const slug of slugsToCheck) {
    console.log(`\nChecking attributes for subcategory: ${slug}`);

    const subcategory = await prisma.subCategory.findUnique({
      where: { slug: slug },
      include: {
        attributes: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!subcategory) {
      console.log('Subcategory not found!');
      continue;
    }

    console.log(`Subcategory found: ${subcategory.name} (ID: ${subcategory.id})`);
    console.log(`Attribute count: ${subcategory.attributes.length}`);
    
    subcategory.attributes.forEach(attr => {
      console.log(`- ${attr.name} (Slug: ${attr.slug}, Type: ${attr.type}, Required: ${attr.required})`);
      if (attr.optionsJson) {
          // Truncate long options for display
          const options = attr.optionsJson.length > 100 ? attr.optionsJson.substring(0, 100) + '...' : attr.optionsJson;
          console.log(`  Options: ${options}`);
      }
    });
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
