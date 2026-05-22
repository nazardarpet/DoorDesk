import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { OrderForm } from "@/components/order-form";
import { OrderStatusForm } from "@/components/order-status-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      notes: true,
      clientId: true,
      createdById: true,
      createdAt: true,
      client: { select: { name: true, uniqueClientId: true, email: true, phone: true, address: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productId: true,
          sku: true,
          family: true,
          style: true,
          height: true,
          width: true,
          thickness: true,
          core: true,
          quantity: true,
          handing: true,
          notes: true,
          product: {
            select: {
              familyCode: true,
              heightCode: true,
              widthCode: true,
              coreCode: true,
              thicknessCode: true
            }
          }
        }
      }
    }
  });

  if (!order || (user.role !== UserRole.ADMIN && order.createdById !== user.id)) {
    notFound();
  }

  const [clients, products] = await Promise.all([
    prisma.client.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true, uniqueClientId: true }
    }),
    prisma.product.findMany({
      orderBy: [{ family: "asc" }, { style: "asc" }],
      take: 500,
      select: {
        id: true,
        title: true,
        sku: true,
        family: true,
        familyCode: true,
        familyName: true,
        style: true,
        core: true,
        coreCode: true,
        height: true,
        heightCode: true,
        width: true,
        widthCode: true,
        thickness: true,
        thicknessCode: true
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="font-mono text-xs text-slate-500">{order.orderNumber}</div>
          <h1 className="text-2xl font-semibold text-slate-950">{order.client.name}</h1>
          <p className="text-sm text-slate-500">
            {order.status} · {order.createdAt.toLocaleDateString()}
          </p>
        </div>
        <OrderStatusForm orderId={order.id} status={order.status} />
      </div>
      <Card className="p-4">
        <div className="grid gap-2 text-sm md:grid-cols-4">
          <div>
            <div className="text-slate-500">Client ID</div>
            <div className="font-medium">{order.client.uniqueClientId}</div>
          </div>
          <div>
            <div className="text-slate-500">Email</div>
            <div className="font-medium">{order.client.email ?? ""}</div>
          </div>
          <div>
            <div className="text-slate-500">Phone</div>
            <div className="font-medium">{order.client.phone ?? ""}</div>
          </div>
          <div>
            <div className="text-slate-500">Address</div>
            <div className="font-medium">{order.client.address ?? ""}</div>
          </div>
        </div>
      </Card>
      <OrderForm
        order={{
          id: order.id,
          clientId: order.clientId,
          notes: order.notes,
          items: order.items.map((item) => ({
            productId: item.productId ?? "",
            sku: item.sku ?? "",
            familyCode: item.product?.familyCode ?? "",
            heightCode: item.product?.heightCode ?? "",
            widthCode: item.product?.widthCode ?? "",
            coreCode: item.product?.coreCode ?? "",
            thicknessCode: item.product?.thicknessCode ?? "",
            family: item.family,
            style: item.style,
            height: item.height.toString(),
            width: item.width.toString(),
            thickness: item.thickness.toString(),
            core: item.core,
            quantity: String(item.quantity),
            handing: item.handing,
            notes: item.notes ?? ""
          }))
        }}
        clients={[
          {
            id: order.clientId,
            label: `${order.client.uniqueClientId} - ${order.client.name}`
          },
          ...clients
            .filter((client) => client.id !== order.clientId)
            .map((client) => ({
              id: client.id,
              label: `${client.uniqueClientId} - ${client.name}${client.company ? ` (${client.company})` : ""}`
            }))
        ]}
        products={products.map((product) => ({
          id: product.id,
          title: product.title,
          sku: product.sku,
          family: product.family,
          familyCode: product.familyCode,
          familyName: product.familyName,
          style: product.style,
          core: product.core,
          coreCode: product.coreCode,
          height: product.height?.toString() ?? null,
          heightCode: product.heightCode,
          width: product.width?.toString() ?? null,
          widthCode: product.widthCode,
          thickness: product.thickness?.toString() ?? null,
          thicknessCode: product.thicknessCode
        }))}
      />
    </div>
  );
}
