"use server";

import { OrderStatus, Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { buildOrderItemSnapshots, type OrderItemSnapshot } from "@/lib/order-product-snapshots";
import { nextOrderNumberFromLatest } from "@/lib/order-number";
import { canTransitionOrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/action-result";
import { createOrderSchema, transitionOrderStatusSchema, updateOrderSchema } from "@/lib/validations";

function parseOrderPayload(formData: FormData) {
  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function toOrderItemCreate(item: OrderItemSnapshot) {
  return {
    productId: item.productId,
    sku: item.sku,
    family: item.family,
    style: item.style,
    height: new Prisma.Decimal(item.height),
    width: new Prisma.Decimal(item.width),
    thickness: new Prisma.Decimal(item.thickness),
    core: item.core,
    quantity: item.quantity,
    handing: item.handing,
    notes: item.notes
  };
}

async function resolveOrderItemSnapshots(items: Parameters<typeof buildOrderItemSnapshots>[0]) {
  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      sku: true,
      family: true,
      style: true,
      height: true,
      width: true,
      thickness: true,
      core: true
    }
  });

  return buildOrderItemSnapshots(items, products);
}

export async function createOrderAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const payload = parseOrderPayload(formData);
  const parsed = createOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid order data." };
  }

  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId },
    select: { id: true, archivedAt: true }
  });

  if (!client) {
    return { success: false, error: "Client not found." };
  }

  if (client.archivedAt) {
    return { success: false, error: "Restore this client before creating an order." };
  }

  const snapshotResult = await resolveOrderItemSnapshots(parsed.data.items);
  if (!snapshotResult.success) {
    return { success: false, error: snapshotResult.error };
  }

  const order = await prisma.$transaction(async (tx) => {
    const latestOrder = await tx.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true }
    });

    return tx.order.create({
      data: {
        orderNumber: nextOrderNumberFromLatest(latestOrder?.orderNumber ?? null),
        clientId: parsed.data.clientId,
        createdById: user.id,
        notes: parsed.data.notes,
        items: {
          create: snapshotResult.items.map(toOrderItemCreate)
        }
      },
      select: { id: true }
    });
  });

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/clients/${parsed.data.clientId}`);
  return { success: true, data: order, message: "Draft order created." };
}

export async function createOrderAndRedirectAction(
  previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = await createOrderAction(previousState, formData);

  if (!result.success) {
    return result;
  }

  redirect(`/orders/${result.data?.id}`);
}

export async function updateOrderAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const payload = parseOrderPayload(formData);
  const parsed = updateOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid order data." };
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, createdById: true }
  });

  if (!existingOrder) {
    return { success: false, error: "Order not found." };
  }

  if (user.role !== UserRole.ADMIN && existingOrder.createdById !== user.id) {
    return { success: false, error: "You can only edit your own orders." };
  }

  const snapshotResult = await resolveOrderItemSnapshots(parsed.data.items);
  if (!snapshotResult.success) {
    return { success: false, error: snapshotResult.error };
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: parsed.data.id } });
    await tx.order.update({
      where: { id: parsed.data.id },
      data: {
        clientId: parsed.data.clientId,
        notes: parsed.data.notes,
        items: { create: snapshotResult.items.map(toOrderItemCreate) }
      },
      select: { id: true }
    });
  });

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/orders/${parsed.data.id}`);
  return { success: true, message: "Order updated." };
}

export async function transitionOrderStatusAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = transitionOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid status transition." };
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { status: true, createdById: true }
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (user.role !== UserRole.ADMIN && order.createdById !== user.id) {
    return { success: false, error: "You can only update your own orders." };
  }

  if (!canTransitionOrderStatus(order.status, parsed.data.status)) {
    return { success: false, error: `Cannot move order from ${order.status} to ${parsed.data.status}.` };
  }

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status as OrderStatus },
    select: { id: true }
  });

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/orders/${parsed.data.orderId}`);
  return { success: true, message: "Order status updated." };
}
