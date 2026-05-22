import type { Prisma } from "@prisma/client";

export type ProductListParams = {
  query: string;
  familyCode: string;
  heightCode: string;
  widthCode: string;
  coreCode: string;
  thicknessCode: string;
  page: number;
};

type RawProductSearchParams = {
  q?: string;
  family?: string;
  height?: string;
  width?: string;
  core?: string;
  thickness?: string;
  page?: string;
};

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

export function resolveProductListParams(params: RawProductSearchParams): ProductListParams {
  return {
    query: clean(params.q),
    familyCode: clean(params.family),
    heightCode: clean(params.height),
    widthCode: clean(params.width),
    coreCode: clean(params.core),
    thicknessCode: clean(params.thickness),
    page: Math.max(Number(params.page ?? "1") || 1, 1)
  };
}

export function buildProductWhere(params: ProductListParams): Prisma.ProductWhereInput {
  return {
    ...(params.familyCode ? { familyCode: params.familyCode } : {}),
    ...(params.heightCode ? { heightCode: params.heightCode } : {}),
    ...(params.widthCode ? { widthCode: params.widthCode } : {}),
    ...(params.coreCode ? { coreCode: params.coreCode } : {}),
    ...(params.thicknessCode ? { thicknessCode: params.thicknessCode } : {}),
    ...(params.query
      ? {
          OR: [
            { sku: { contains: params.query, mode: "insensitive" } },
            { title: { contains: params.query, mode: "insensitive" } },
            { style: { contains: params.query, mode: "insensitive" } },
            { family: { contains: params.query, mode: "insensitive" } },
            { familyName: { contains: params.query, mode: "insensitive" } },
            { core: { contains: params.query, mode: "insensitive" } }
          ]
        }
      : {})
  };
}

export function productPageHref(pathname: string, params: ProductListParams) {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set("q", params.query);
  if (params.familyCode) searchParams.set("family", params.familyCode);
  if (params.heightCode) searchParams.set("height", params.heightCode);
  if (params.widthCode) searchParams.set("width", params.widthCode);
  if (params.coreCode) searchParams.set("core", params.coreCode);
  if (params.thicknessCode) searchParams.set("thickness", params.thicknessCode);
  searchParams.set("page", String(params.page));

  return `${pathname}?${searchParams.toString()}`;
}
