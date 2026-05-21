import { describe, expect, test } from "vitest";
import { parseDimensionText } from "@/lib/shopify";

describe("Shopify dimension parsing", () => {
  test("extracts inches from Shopify option labels", () => {
    expect(parseDimensionText("6'8\" (80\") 1-3/8\" thick")).toEqual({
      primary: 80,
      thickness: 1.375
    });
    expect(parseDimensionText("2'6\" (30\")")).toEqual({
      primary: 30,
      thickness: undefined
    });
  });
});
