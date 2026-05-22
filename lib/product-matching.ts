export type ProductMatchCandidate = {
  id: string;
  title: string;
  sku: string | null;
  familyCode: string | null;
  heightCode: string | null;
  widthCode: string | null;
  coreCode: string | null;
  thicknessCode: string | null;
};

export type ProductMatchCriteria = {
  familyCode: string;
  heightCode: string;
  widthCode: string;
  coreCode: string;
  thicknessCode: string;
};

export type ProductMatchResult<TProduct extends ProductMatchCandidate> =
  | { status: "matched"; product: TProduct }
  | { status: "no_match" }
  | { status: "ambiguous"; products: TProduct[] };

function normalizeCode(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

export function findExactProductMatch<TProduct extends ProductMatchCandidate>(
  products: TProduct[],
  criteria: ProductMatchCriteria
): ProductMatchResult<TProduct> {
  const matches = products.filter(
    (product) =>
      normalizeCode(product.familyCode) === normalizeCode(criteria.familyCode) &&
      normalizeCode(product.heightCode) === normalizeCode(criteria.heightCode) &&
      normalizeCode(product.widthCode) === normalizeCode(criteria.widthCode) &&
      normalizeCode(product.coreCode) === normalizeCode(criteria.coreCode) &&
      normalizeCode(product.thicknessCode) === normalizeCode(criteria.thicknessCode)
  );

  if (matches.length === 0) {
    return { status: "no_match" };
  }

  if (matches.length > 1) {
    return { status: "ambiguous", products: matches };
  }

  return { status: "matched", product: matches[0] };
}

export function searchProductsBySku<TProduct extends ProductMatchCandidate>(
  products: TProduct[],
  rawQuery: string,
  limit = 10
) {
  const query = normalizeCode(rawQuery);
  if (!query) {
    return [];
  }

  const withSku = products.filter((product) => product.sku);
  const prefixMatches = withSku.filter((product) => normalizeCode(product.sku).startsWith(query));
  const prefixIds = new Set(prefixMatches.map((product) => product.id));
  const containsMatches = withSku.filter(
    (product) => !prefixIds.has(product.id) && normalizeCode(product.sku).includes(query)
  );

  return [...prefixMatches, ...containsMatches].slice(0, limit);
}
