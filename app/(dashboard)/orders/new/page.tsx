import { OrderForm } from "@/components/order-form";
import { QuickClientCreateForm } from "@/components/quick-client-create-form";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  await requireUser();

  const [clients, products] = await Promise.all([
    prisma.client.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      take: 200,
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
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">New order</h1>
        <p className="text-sm text-slate-500">Quick-add door rows and save as a draft.</p>
      </div>
      <QuickClientCreateForm />
      {!clients.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Add or restore a client before creating an order.
        </div>
      ) : (
        <OrderForm
          clients={clients.map((client) => ({
            id: client.id,
            label: `${client.uniqueClientId} - ${client.name}${client.company ? ` (${client.company})` : ""}`
          }))}
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
      )}
    </div>
  );
}
