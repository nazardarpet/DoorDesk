import { describe, expect, test } from "vitest";
import { createOrderSchema } from "@/lib/validations";

describe("order validation", () => {
  test("accepts an order with multiple valid line items", () => {
    const result = createOrderSchema.safeParse({
      clientId: "client_1",
      notes: "Rush if possible",
      items: [
        {
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
});
