import { OrderStatus } from "@prisma/client";
import { describe, expect, test } from "vitest";
import { canTransitionOrderStatus, nextOrderStatuses } from "@/lib/order-status";

describe("order status transitions", () => {
  test("allows the normal forward order workflow", () => {
    expect(canTransitionOrderStatus(OrderStatus.DRAFT, OrderStatus.SUBMITTED)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.SUBMITTED, OrderStatus.IN_PROGRESS)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED)).toBe(true);
  });

  test("allows cancellation from every non-completed state", () => {
    expect(canTransitionOrderStatus(OrderStatus.DRAFT, OrderStatus.CANCELLED)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.SUBMITTED, OrderStatus.CANCELLED)).toBe(true);
    expect(canTransitionOrderStatus(OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED)).toBe(true);
  });

  test("does not allow reopening terminal orders", () => {
    expect(canTransitionOrderStatus(OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS)).toBe(false);
    expect(nextOrderStatuses(OrderStatus.CANCELLED)).toEqual([]);
  });
});
