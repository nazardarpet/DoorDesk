import { describe, expect, test } from "vitest";
import { buildProductWhere, productPageHref, resolveProductListParams } from "@/lib/product-filters";

describe("product list filters", () => {
  test("normalizes query params for the products page", () => {
    expect(
      resolveProductListParams({
        q: "  caim ",
        family: "CAIM",
        height: "70",
        width: "20",
        core: "SC",
        thickness: "138",
        page: "3"
      })
    ).toEqual({
      query: "caim",
      familyCode: "CAIM",
      heightCode: "70",
      widthCode: "20",
      coreCode: "SC",
      thicknessCode: "138",
      page: 3
    });
  });

  test("builds a Prisma where object for search and normalized filters", () => {
    expect(
      buildProductWhere({
        query: "caim",
        familyCode: "CAIM",
        heightCode: "70",
        widthCode: "",
        coreCode: "SC",
        thicknessCode: "",
        page: 1
      })
    ).toEqual({
      familyCode: "CAIM",
      heightCode: "70",
      coreCode: "SC",
      OR: [
        { sku: { contains: "caim", mode: "insensitive" } },
        { title: { contains: "caim", mode: "insensitive" } },
        { style: { contains: "caim", mode: "insensitive" } },
        { family: { contains: "caim", mode: "insensitive" } },
        { familyName: { contains: "caim", mode: "insensitive" } },
        { core: { contains: "caim", mode: "insensitive" } }
      ]
    });
  });

  test("preserves active filters in pagination hrefs", () => {
    expect(
      productPageHref("/products", {
        query: "carr",
        familyCode: "CARR",
        heightCode: "",
        widthCode: "110",
        coreCode: "",
        thicknessCode: "138",
        page: 2
      })
    ).toBe("/products?q=carr&family=CARR&width=110&thickness=138&page=2");
  });
});
