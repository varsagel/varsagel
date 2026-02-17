import fs from "node:fs";
import path from "node:path";

const defaultsDir = path.join(process.cwd(), "public", "images", "defaults");
const outputPath = path.join(process.cwd(), "src", "data", "available-defaults.json");

const entries = fs.existsSync(defaultsDir)
  ? fs.readdirSync(defaultsDir, { withFileTypes: true })
  : [];

const names = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.toLowerCase().endsWith(".webp"))
  .map((name) => name.slice(0, -5))
  .filter((base) => /^[a-z0-9-]+$/.test(base))
  .sort((a, b) => a.localeCompare(b, "tr"));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(names, null, 2) + "\n");
console.log(`Generated ${names.length} defaults -> ${outputPath}`);
