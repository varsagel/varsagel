import type { AttrField } from "./attribute-schemas";
import XLSX_ATTR_SCHEMAS from "./xlsx-attr-schemas.json";

export const ATTR_SUBSCHEMAS = XLSX_ATTR_SCHEMAS as Record<string, AttrField[]>;

