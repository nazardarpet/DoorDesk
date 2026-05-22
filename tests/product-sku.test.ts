import { describe, expect, test } from "vitest";
import { parseProductSku } from "@/lib/product-sku";

describe("product SKU parsing", () => {
  test("parses a standard solid-core SKU into normalized catalog fields", () => {
    expect(parseProductSku("CAIM7020SC138")).toEqual({
      sku: "CAIM7020SC138",
      familyCode: "CAIM",
      familyName: "Caiman",
      heightCode: "70",
      height: 84,
      heightLabel: "7'0\" (84\")",
      widthCode: "20",
      width: 24,
      widthLabel: "2'0\" (24\")",
      coreCode: "SC",
      core: "Solid Core",
      thicknessCode: "138",
      thickness: 1.375,
      thicknessLabel: "1-3/8\""
    });
  });

  test("matches the longest known family prefix before parsing dimensions", () => {
    expect(parseProductSku("CAIMBIF7020SC138")).toMatchObject({
      familyCode: "CAIMBIF",
      familyName: "Caiman Bifold",
      heightCode: "70",
      widthCode: "20",
      coreCode: "SC",
      thicknessCode: "138"
    });
  });

  test("parses variable-width codes and digit-prefixed family codes", () => {
    expect(parseProductSku("CARR68110SC138")).toMatchObject({
      familyCode: "CARR",
      widthCode: "110",
      width: 22,
      widthLabel: "1'10\" (22\")"
    });

    expect(parseProductSku("5PROCK6816HC138")).toMatchObject({
      familyCode: "5PROCK",
      familyName: "Rockport",
      heightCode: "68",
      widthCode: "16",
      coreCode: "HC",
      core: "Hollow Core"
    });
  });

  test("returns null for SKUs outside the known product code format", () => {
    expect(parseProductSku("UNKNOWN7020SC138")).toBeNull();
    expect(parseProductSku("CAIM7020XX138")).toBeNull();
    expect(parseProductSku("CAIM7020SC999")).toBeNull();
  });
});
