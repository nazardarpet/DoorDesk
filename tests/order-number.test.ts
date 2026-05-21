import { describe, expect, test } from "vitest";
import { formatOrderNumber, nextOrderNumberFromLatest } from "@/lib/order-number";

describe("order number generation", () => {
  test("formats numeric sequences as padded order numbers", () => {
    expect(formatOrderNumber(1)).toBe("ORD-00001");
    expect(formatOrderNumber(42)).toBe("ORD-00042");
  });

  test("generates the next order number from the latest stored order", () => {
    expect(nextOrderNumberFromLatest(null)).toBe("ORD-00001");
    expect(nextOrderNumberFromLatest("ORD-00042")).toBe("ORD-00043");
  });
});
