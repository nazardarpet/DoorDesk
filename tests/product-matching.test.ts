import { describe, expect, test } from "vitest";
import { findExactProductMatch, searchProductsBySku } from "@/lib/product-matching";

const products = [
  {
    id: "prod_caim_20",
    title: "Caiman",
    sku: "CAIM7020SC138",
    familyCode: "CAIM",
    heightCode: "70",
    widthCode: "20",
    coreCode: "SC",
    thicknessCode: "138"
  },
  {
    id: "prod_caim_24",
    title: "Caiman",
    sku: "CAIM7024SC138",
    familyCode: "CAIM",
    heightCode: "70",
    widthCode: "24",
    coreCode: "SC",
    thicknessCode: "138"
  },
  {
    id: "prod_carr_110",
    title: "Carrara",
    sku: "CARR68110SC138",
    familyCode: "CARR",
    heightCode: "68",
    widthCode: "110",
    coreCode: "SC",
    thicknessCode: "138"
  }
];

describe("product matching", () => {
  test("returns an exact imported product match for complete parameters", () => {
    const result = findExactProductMatch(products, {
      familyCode: "CAIM",
      heightCode: "70",
      widthCode: "20",
      coreCode: "SC",
      thicknessCode: "138"
    });

    expect(result).toEqual({
      status: "matched",
      product: products[0]
    });
  });

  test("returns no match when no imported product has the requested parameters", () => {
    const result = findExactProductMatch(products, {
      familyCode: "CAIM",
      heightCode: "70",
      widthCode: "30",
      coreCode: "SC",
      thicknessCode: "138"
    });

    expect(result).toEqual({ status: "no_match" });
  });

  test("returns ambiguous when multiple imported products share the same parameters", () => {
    const duplicate = { ...products[0], id: "prod_duplicate", sku: "CAIM7020SC138-DUP" };
    const result = findExactProductMatch([...products, duplicate], {
      familyCode: "CAIM",
      heightCode: "70",
      widthCode: "20",
      coreCode: "SC",
      thicknessCode: "138"
    });

    expect(result).toEqual({
      status: "ambiguous",
      products: [products[0], duplicate]
    });
  });

  test("searches imported products by SKU prefix before looser contains matches", () => {
    expect(searchProductsBySku(products, "caim")).toEqual([products[0], products[1]]);
    expect(searchProductsBySku(products, "110")).toEqual([products[2]]);
    expect(searchProductsBySku(products, "missing")).toEqual([]);
  });

  test("limits SKU search results", () => {
    expect(searchProductsBySku(products, "CAIM", 1)).toEqual([products[0]]);
  });
});
