import { describe, expect, test } from "vitest";
import { createOrderSchema } from "@/lib/validations";

describe("order validation", () => {
  test("accepts an order with multiple valid line items", () => {
    const result = createOrderSchema.safeParse({
      clientId: "client_1",
      notes: "Rush if possible",
      items: [
        {
          productId: "prod_caim_30_hc",
          sku: "CAIM6830HC138",
          family: "Caiman",
          style: "Bifold",
          height: "80",
          width: "30",
          thickness: "1.375",
          core: "Hollow Core",
          quantity: "2",
          handing: "LEFT",
          notes: ""
        },
        {
          productId: "prod_caim_30_sc",
          sku: "CAIM7030SC138",
          family: "Caiman",
          style: "Bifold",
          height: "84",
          width: "30",
          thickness: "1.375",
          core: "Solid Core",
          quantity: "1",
          handing: "RIGHT",
          notes: "Match existing trim"
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  test("rejects orders without line items", () => {
    const result = createOrderSchema.safeParse({
      clientId: "client_1",
      items: []
    });

    expect(result.success).toBe(false);
  });

  test("rejects order items without an imported product reference", () => {
    const result = createOrderSchema.safeParse({
      clientId: "client_1",
      items: [
        {
          sku: "CAIM6830HC138",
          family: "Caiman",
          style: "Bifold",
          height: "80",
          width: "30",
          thickness: "1.375",
          core: "Hollow Core",
          quantity: "2",
          handing: "LEFT",
          notes: ""
        }
      ]
    });

    expect(result.success).toBe(false);
  });
});
