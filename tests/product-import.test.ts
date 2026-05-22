import { describe, expect, test } from "vitest";
import { parseShopifyCsv, summarizeImportRows } from "@/lib/product-import";

describe("product import parsing", () => {
  test("maps Shopify CSV rows into product preview rows", () => {
    const csv = [
      "Handle,Title,Variant SKU,Option1 Value,Option2 Value,Option3 Value,Door Family (product.metafields.custom.door_family),Tags",
      "caiman-bifold,Caiman Bifold,CAIMBIF6820HC138,\"6'8\"\" (80\"\") 1-3/8\"\" thick\",Hollow Core,\"2'0\"\" (24\"\")\",Caiman,\"2 Panel, Bifold\""
    ].join("\n");

    const rows = parseShopifyCsv(csv);

    expect(rows[0]).toMatchObject({
      title: "Caiman Bifold",
      shopifyId: undefined,
      sku: "CAIMBIF6820HC138",
      family: "Caiman Bifold",
      core: "Hollow Core",
      height: 80,
      width: 24,
      thickness: 1.375,
      familyCode: "CAIMBIF",
      familyName: "Caiman Bifold",
      heightCode: "68",
      widthCode: "20",
      coreCode: "HC",
      thicknessCode: "138",
      skipped: false
    });
  });

  test("does not treat Shopify handles as unique variant IDs", () => {
    const csv = [
      "Handle,Title,Variant SKU,Option1 Value,Option2 Value,Option3 Value,Tags",
      "caiman-bifold,Caiman Bifold,CAIMBIF6820HC138,\"6'8\"\" (80\"\") 1-3/8\"\" thick\",Hollow Core,\"2'0\"\" (24\"\")\",Caiman",
      "caiman-bifold,,CAIMBIF6824HC138,\"6'8\"\" (80\"\") 1-3/8\"\" thick\",Hollow Core,\"2'4\"\" (28\"\")\","
    ].join("\n");

    const rows = parseShopifyCsv(csv);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.shopifyId)).toEqual([undefined, undefined]);
    expect(rows.map((row) => row.sku)).toEqual(["CAIMBIF6820HC138", "CAIMBIF6824HC138"]);
    expect(summarizeImportRows(rows)).toEqual({ valid: 2, skipped: 0 });
  });

  test("derives normalized codes from Shopify options when SKU punctuation or core code is malformed", () => {
    const csv = [
      "Handle,Title,Variant SKU,Option1 Value,Option2 Value,Option3 Value,Tags",
      "flush-slab,Flush Slab,FPRIM7020HC138.,\"7'0\"\" (84\"\") 1-3/8\"\" thick\",Hollow Core,\"2'0\"\" (24\"\")\",Flush",
      "flush-slab,,FPRIM70110C138,\"7'0\"\" (84\"\") 1-3/8\"\" thick\",Hollow Core,\"1'10\"\" (22\"\")\","
    ].join("\n");

    const rows = parseShopifyCsv(csv);

    expect(rows[0]).toMatchObject({
      sku: "FPRIM7020HC138.",
      familyCode: "FPRIM",
      heightCode: "70",
      widthCode: "20",
      coreCode: "HC",
      thicknessCode: "138"
    });
    expect(rows[1]).toMatchObject({
      sku: "FPRIM70110C138",
      familyCode: "FPRIM",
      heightCode: "70",
      widthCode: "110",
      coreCode: "HC",
      thicknessCode: "138"
    });
  });

  test("summarizes rows that cannot be upserted", () => {
    const summary = summarizeImportRows([
      { skipped: true },
      { skipped: false }
    ]);

    expect(summary).toEqual({ valid: 1, skipped: 1 });
  });
});
