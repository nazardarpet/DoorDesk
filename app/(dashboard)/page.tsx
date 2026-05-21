import Link from "next/link";
import { ClientStatus, UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const orderScope = user.role === UserRole.ADMIN ? {} : { createdById: user.id };
  const [activeClients, ordersThisMonth, pendingOrders, recentOrders, clientBreakdown] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVE", archivedAt: null } }),
    prisma.order.count({ where: { ...orderScope, createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { ...orderScope, status: { in: ["DRAFT", "SUBMITTED", "IN_PROGRESS"] } } }),
    prisma.order.findMany({
      where: orderScope,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        client: { select: { name: true, uniqueClientId: true } }
      }
    }),
    prisma.client.groupBy({
      by: ["status"],
      where: { archivedAt: null },
      _count: { status: true }
    })
  ]);
  const breakdown = Object.fromEntries(clientBreakdown.map((item) => [item.status, item._count.status])) as Partial<Record<ClientStatus, number>>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back, {user.name}. {user.role === UserRole.ADMIN ? "Showing all order activity." : "Showing your order activity."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Active clients</div>
          <div className="mt-2 text-3xl font-semibold">{activeClients}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Orders this month</div>
          <div className="mt-2 text-3xl font-semibold">{ordersThisMonth}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Pending orders</div>
          <div className="mt-2 text-3xl font-semibold">{pendingOrders}</div>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Active</div>
          <div className="mt-2 text-2xl font-semibold">{breakdown.ACTIVE ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Prospect</div>
          <div className="mt-2 text-2xl font-semibold">{breakdown.PROSPECT ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Past</div>
          <div className="mt-2 text-2xl font-semibold">{breakdown.PAST ?? 0}</div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-medium">Recent orders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/orders/${order.id}`}>{order.orderNumber}</Link>
                    </Button>
                  </td>
                  <td className="px-4 py-3">{order.client.name}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{order.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {!recentOrders.length && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    No orders yet.
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
