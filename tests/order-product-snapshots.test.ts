import { describe, expect, test } from "vitest";
import { buildOrderItemSnapshots } from "@/lib/order-product-snapshots";

const products = [
  {
    id: "prod_caim",
    title: "Caiman",
    sku: "CAIM7020SC138",
    family: "Caiman",
    style: "Caiman",
    height: "84",
    width: "24",
    thickness: "1.375",
    core: "Solid Core"
  }
];

describe("order product snapshots", () => {
  test("copies imported product details into order item snapshots", () => {
    const result = buildOrderItemSnapshots(
      [
        {
          productId: "prod_caim",
          sku: "CAIM7020SC138",
          family: "Edited family should not win",
          style: "Edited style should not win",
          height: "1",
          width: "1",
          thickness: "1",
          core: "Edited core should not win",
          quantity: "2",
          handing: "LEFT",
          notes: "Rush"
        }
      ],
      products
    );

    expect(result).toEqual({
      success: true,
      items: [
        {
          productId: "prod_caim",
          sku: "CAIM7020SC138",
          family: "Caiman",
          style: "Caiman",
          height: "84",
          width: "24",
          thickness: "1.375",
          core: "Solid Core",
          quantity: 2,
          handing: "LEFT",
          notes: "Rush"
        }
      ]
    });
  });

  test("rejects missing products instead of generating an order item", () => {
    const result = buildOrderItemSnapshots(
      [
        {
          productId: "prod_missing",
          sku: "MISSING",
          family: "Caiman",
          style: "Caiman",
          height: "84",
          width: "24",
          thickness: "1.375",
          core: "Solid Core",
          quantity: "1",
          handing: "RIGHT"
        }
      ],
      products
    );

    expect(result).toEqual({
      success: false,
      error: "Select a valid imported product for every order line."
    });
  });

  test("rejects SKU mismatches for the selected product", () => {
    const result = buildOrderItemSnapshots(
      [
        {
          productId: "prod_caim",
          sku: "CARR7020SC138",
          family: "Caiman",
          style: "Caiman",
          height: "84",
          width: "24",
          thickness: "1.375",
          core: "Solid Core",
          quantity: "1",
          handing: "RIGHT"
        }
      ],
      products
    );

    expect(result).toEqual({
      success: false,
      error: "Selected product does not match the submitted SKU."
    });
  });
});
