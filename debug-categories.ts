
import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        attributes: {
          include: {
            subCategory: true,
          }
        }
      }
    });

    console.log("Categories found:", categories.length);
    for (const cat of categories) {
      console.log(`Category: ${cat.name} (${cat.slug})`);
      if (cat.attributes.length > 0) {
        console.log(`  Attributes: ${cat.attributes.length}`);
        for (const attr of cat.attributes) {
          console.log(`    - ${attr.name} (${attr.slug}) Type: ${attr.type}`);
          console.log(`      SubCategory: ${attr.subCategory ? attr.subCategory.slug : 'None'}`);
          if (attr.optionsJson) {
            console.log(`      Options: ${attr.optionsJson}`);
            try {
              const parsed = JSON.parse(attr.optionsJson);
              if (!Array.isArray(parsed)) {
                console.error(`      ERROR: optionsJson is not an array!`);
              }
            } catch (e) {
              console.error(`      ERROR: optionsJson is invalid JSON!`);
            }
          }
        }
      } else {
        console.log("  No attributes.");
      }
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
