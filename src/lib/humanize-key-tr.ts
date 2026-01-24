import { titleCaseTR } from "@/lib/title-case-tr";

export function humanizeKeyTR(key: string) {
  const s = String(key || "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  return titleCaseTR(s);
}

