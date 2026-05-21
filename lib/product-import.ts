import { parseDimensionText } from "@/lib/shopify";

export type ProductImportRow = {
  shopifyId?: string;
  title: string;
  family?: string;
  style?: string;
  sku?: string;
  height?: number;
  width?: number;
  thickness?: number;
  core?: string;
  rawData: Record<string, unknown>;
  skipped: boolean;
  reason?: string;
};

type RawRow = Record<string, string>;

const shopifyIdColumns = ["Variant ID", "Variant Id", "Variant Shopify ID", "Variant Shopify Id", "Product ID", "Product Id", "ID", "Id"];

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function normalizeRows(rows: RawRow[]) {
  let lastTitle = "";
  let lastHandle = "";
  let lastFamily = "";
  let lastTags = "";

  return rows.map((row) => {
    const title = row.Title || lastTitle;
    const handle = row.Handle || lastHandle;
    const family = row["Door Family (product.metafields.custom.door_family)"] || lastFamily;
    const tags = row.Tags || lastTags;

    if (row.Title) lastTitle = row.Title;
    if (row.Handle) lastHandle = row.Handle;
    if (row["Door Family (product.metafields.custom.door_family)"]) {
      lastFamily = row["Door Family (product.metafields.custom.door_family)"];
    }
    if (row.Tags) lastTags = row.Tags;

    const heightParts = parseDimensionText(row["Option1 Value"] ?? "");
    const widthParts = parseDimensionText(row["Option3 Value"] ?? "");
    const sku = row["Variant SKU"] || row["Variant Barcode"] || undefined;
    const shopifyId = shopifyIdColumns.map((column) => row[column]?.trim()).find(Boolean);
    const resolvedFamily = family || tags.split(",").map((tag) => tag.trim()).find(Boolean) || undefined;
    const resolvedTitle = title || handle || sku || "Untitled product";

    return {
      shopifyId,
      title: resolvedTitle,
      family: resolvedFamily,
      style: title || handle || undefined,
      sku,
      height: heightParts.primary,
      width: widthParts.primary,
      thickness: heightParts.thickness,
      core: row["Option2 Value"] || undefined,
      rawData: row,
      skipped: !shopifyId && !sku,
      reason: !shopifyId && !sku ? "Missing SKU and Shopify variant ID" : undefined
    } satisfies ProductImportRow;
  });
}

export function parseShopifyCsv(csv: string) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length);
  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<RawRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });

  return normalizeRows(rows);
}

export function rowsFromWorksheetJson(rows: Record<string, unknown>[]) {
  return normalizeRows(
    rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value == null ? "" : String(value)]))
    )
  );
}

export function summarizeImportRows(rows: Pick<ProductImportRow, "skipped">[]) {
  return rows.reduce(
    (summary, row) => {
      if (row.skipped) {
        summary.skipped += 1;
      } else {
        summary.valid += 1;
      }

      return summary;
    },
    { valid: 0, skipped: 0 }
  );
}
