import { notFound } from "next/navigation";
import { ClientArchiveForm } from "@/components/client-archive-form";
import { ClientForm } from "@/components/client-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      uniqueClientId: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      address: true,
      status: true,
      notes: true,
      archivedAt: true,
      createdAt: true,
      createdBy: { select: { name: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true
        }
      }
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs text-slate-500">{client.uniqueClientId}</div>
        <h1 className="text-2xl font-semibold text-slate-950">{client.name}</h1>
        <p className="text-sm text-slate-500">Created by {client.createdBy.name}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ClientArchiveForm clientId={client.id} archived={Boolean(client.archivedAt)} />
        {client.archivedAt && <p className="text-sm text-amber-700">Archived clients are hidden from order creation.</p>}
      </div>
      <ClientForm client={client} />
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-medium">Order history</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {client.orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{order.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {!client.orders.length && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={3}>
                    No orders for this client yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
