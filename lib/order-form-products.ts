import type { Handing } from "@prisma/client";
import { findExactProductMatch, searchProductsBySku } from "@/lib/product-matching";

export type OrderFormProduct = {
  id: string;
  title: string;
  sku: string | null;
  family: string | null;
  familyCode: string | null;
  familyName: string | null;
  style: string | null;
  core: string | null;
  coreCode: string | null;
  height: string | null;
  heightCode: string | null;
  width: string | null;
  widthCode: string | null;
  thickness: string | null;
  thicknessCode: string | null;
};

export type OrderFormDoorLine = {
  productId: string;
  sku: string;
  familyCode: string;
  heightCode: string;
  widthCode: string;
  coreCode: string;
  thicknessCode: string;
  family: string;
  style: string;
  height: string;
  width: string;
  thickness: string;
  core: string;
  quantity: string;
  handing: "LEFT" | "RIGHT" | Handing;
  notes: string;
};

export type ProductCodeOption = {
  code: string;
  label: string;
};

function uniqueSorted(values: Array<string | null>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((left, right) => left.localeCompare(right));
}

function filterProducts(products: OrderFormProduct[], line: OrderFormDoorLine, ignoredField?: keyof OrderFormDoorLine) {
  return products.filter((product) => {
    if (ignoredField !== "familyCode" && line.familyCode && product.familyCode !== line.familyCode) return false;
    if (ignoredField !== "heightCode" && line.heightCode && product.heightCode !== line.heightCode) return false;
    if (ignoredField !== "widthCode" && line.widthCode && product.widthCode !== line.widthCode) return false;
    if (ignoredField !== "coreCode" && line.coreCode && product.coreCode !== line.coreCode) return false;
    if (ignoredField !== "thicknessCode" && line.thicknessCode && product.thicknessCode !== line.thicknessCode) return false;
    return true;
  });
}

function optionLabel(product: OrderFormProduct, field: "familyCode" | "heightCode" | "widthCode" | "coreCode" | "thicknessCode") {
  if (field === "familyCode") return product.familyName ?? product.family ?? product.familyCode ?? "";
  if (field === "heightCode") return product.height ? `${product.heightCode} - ${product.height}"` : product.heightCode ?? "";
  if (field === "widthCode") return product.width ? `${product.widthCode} - ${product.width}"` : product.widthCode ?? "";
  if (field === "coreCode") return product.core ? `${product.coreCode} - ${product.core}` : product.coreCode ?? "";
  return product.thickness ? `${product.thicknessCode} - ${product.thickness}"` : product.thicknessCode ?? "";
}

function codeOptions(products: OrderFormProduct[], field: "familyCode" | "heightCode" | "widthCode" | "coreCode" | "thicknessCode") {
  const codes = uniqueSorted(products.map((product) => product[field]));
  return codes.map((code) => {
    const product = products.find((candidate) => candidate[field] === code);
    return { code, label: product ? optionLabel(product, field) : code };
  });
}

export function getFilteredProductOptions(products: OrderFormProduct[], line: OrderFormDoorLine) {
  return {
    familyCodes: uniqueSorted(filterProducts(products, line, "familyCode").map((product) => product.familyCode)),
    heightCodes: uniqueSorted(filterProducts(products, line, "heightCode").map((product) => product.heightCode)),
    widthCodes: uniqueSorted(filterProducts(products, line, "widthCode").map((product) => product.widthCode)),
    coreCodes: uniqueSorted(filterProducts(products, line, "coreCode").map((product) => product.coreCode)),
    thicknessCodes: uniqueSorted(filterProducts(products, line, "thicknessCode").map((product) => product.thicknessCode)),
    familyOptions: codeOptions(filterProducts(products, line, "familyCode"), "familyCode"),
    heightOptions: codeOptions(filterProducts(products, line, "heightCode"), "heightCode"),
    widthOptions: codeOptions(filterProducts(products, line, "widthCode"), "widthCode"),
    coreOptions: codeOptions(filterProducts(products, line, "coreCode"), "coreCode"),
    thicknessOptions: codeOptions(filterProducts(products, line, "thicknessCode"), "thicknessCode")
  };
}

export function resolveDoorLineProduct(products: OrderFormProduct[], line: OrderFormDoorLine) {
  if (!line.familyCode || !line.heightCode || !line.widthCode || !line.coreCode || !line.thicknessCode) {
    return null;
  }

  const match = findExactProductMatch(products, {
    familyCode: line.familyCode,
    heightCode: line.heightCode,
    widthCode: line.widthCode,
    coreCode: line.coreCode,
    thicknessCode: line.thicknessCode
  });

  return match.status === "matched" ? match.product : null;
}

export function productToDoorLine(
  product: OrderFormProduct,
  handing: "LEFT" | "RIGHT" | Handing,
  notes = "",
  quantity = "1"
): OrderFormDoorLine {
  return {
    productId: product.id,
    sku: product.sku ?? "",
    familyCode: product.familyCode ?? "",
    heightCode: product.heightCode ?? "",
    widthCode: product.widthCode ?? "",
    coreCode: product.coreCode ?? "",
    thicknessCode: product.thicknessCode ?? "",
    family: product.familyName ?? product.family ?? product.title,
    style: product.style ?? product.title,
    height: product.height ?? "",
    width: product.width ?? "",
    thickness: product.thickness ?? "",
    core: product.core ?? "",
    quantity,
    handing,
    notes
  };
}

export function searchOrderProductsBySku(products: OrderFormProduct[], query: string, limit = 8) {
  return searchProductsBySku(products, query, limit);
}
