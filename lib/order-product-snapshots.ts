import type { Handing } from "@prisma/client";

export type OrderItemProductInput = {
  productId: string;
  sku: string;
  family: string;
  style: string;
  height: string;
  width: string;
  thickness: string;
  core: string;
  quantity: string;
  handing: "LEFT" | "RIGHT" | Handing;
  notes?: string;
};

export type OrderSnapshotProduct = {
  id: string;
  title: string;
  sku: string | null;
  family: string | null;
  style: string | null;
  height: string | number | { toString(): string } | null;
  width: string | number | { toString(): string } | null;
  thickness: string | number | { toString(): string } | null;
  core: string | null;
};

export type OrderItemSnapshot = {
  productId: string;
  sku: string;
  family: string;
  style: string;
  height: string;
  width: string;
  thickness: string;
  core: string;
  quantity: number;
  handing: "LEFT" | "RIGHT" | Handing;
  notes?: string;
};

export type OrderItemSnapshotResult =
  | { success: true; items: OrderItemSnapshot[] }
  | { success: false; error: string };

function valueToString(value: string | number | { toString(): string } | null | undefined) {
  return value == null ? "" : value.toString();
}

export function buildOrderItemSnapshots(
  items: OrderItemProductInput[],
  products: OrderSnapshotProduct[]
): OrderItemSnapshotResult {
  const productsById = new Map(products.map((product) => [product.id, product]));

  const snapshots = items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      return null;
    }

    const productSku = product.sku?.trim();
    if (!productSku || productSku.toUpperCase() !== item.sku.trim().toUpperCase()) {
      return "sku_mismatch" as const;
    }

    return {
      productId: product.id,
      sku: productSku,
      family: product.family ?? product.title,
      style: product.style ?? product.title,
      height: valueToString(product.height),
      width: valueToString(product.width),
      thickness: valueToString(product.thickness),
      core: product.core ?? item.core,
      quantity: Number(item.quantity),
      handing: item.handing,
      notes: item.notes
    };
  });

  if (snapshots.some((snapshot) => snapshot === null)) {
    return { success: false, error: "Select a valid imported product for every order line." };
  }

  if (snapshots.some((snapshot) => snapshot === "sku_mismatch")) {
    return { success: false, error: "Selected product does not match the submitted SKU." };
  }

  return {
    success: true,
    items: snapshots as OrderItemSnapshot[]
  };
}
