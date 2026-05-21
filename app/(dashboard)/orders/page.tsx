import Link from "next/link";
import { OrderStatus, Prisma, UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  status?: OrderStatus;
  client?: string;
  createdBy?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1"), 1);
  const status = Object.values(OrderStatus).includes(params.status as OrderStatus) ? params.status : undefined;

  const where: Prisma.OrderWhereInput = {
    ...(user.role === UserRole.ADMIN ? {} : { createdById: user.id }),
    ...(status ? { status } : {}),
    ...(params.client ? { clientId: params.client } : {}),
    ...(params.createdBy && user.role === UserRole.ADMIN ? { createdById: params.createdBy } : {}),
    ...((params.from || params.to)
      ? {
          createdAt: {
            ...(params.from ? { gte: new Date(params.from) } : {}),
            ...(params.to ? { lte: new Date(params.to) } : {})
          }
        }
      : {})
  };

  const [orders, count, clients, users] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        client: { select: { name: true, uniqueClientId: true } },
        createdBy: { select: { name: true } },
        _count: { select: { items: true } }
      }
    }),
    prisma.order.count({ where }),
    prisma.client.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, uniqueClientId: true }
    }),
    user.role === UserRole.ADMIN
      ? prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([])
  ]);
  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Orders</h1>
          <p className="text-sm text-slate-500">{user.role === UserRole.ADMIN ? "All orders" : "Your orders"}</p>
        </div>
        <Button asChild>
          <Link href="/orders/new">New order</Link>
        </Button>
      </div>
      <Card className="overflow-hidden">
        <form className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[160px_1fr_160px_150px_150px_auto]">
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            {Object.values(OrderStatus).map((orderStatus) => (
              <option key={orderStatus} value={orderStatus}>
                {orderStatus}
              </option>
            ))}
          </Select>
          <Select name="client" defaultValue={params.client ?? ""}>
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.uniqueClientId} - {client.name}
              </option>
            ))}
          </Select>
          {user.role === UserRole.ADMIN && (
            <Select name="createdBy" defaultValue={params.createdBy ?? ""}>
              <option value="">All salespeople</option>
              {users.map((salesUser) => (
                <option key={salesUser.id} value={salesUser.id}>
                  {salesUser.name}
                </option>
              ))}
            </Select>
          )}
          <Input name="from" type="date" defaultValue={params.from ?? ""} />
          <Input name="to" type="date" defaultValue={params.to ?? ""} />
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Doors</th>
                <th className="px-4 py-3">Created by</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.client.name}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{order._count.items}</td>
                  <td className="px-4 py-3">{order.createdBy.name}</td>
                  <td className="px-4 py-3">{order.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/orders/${order.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/orders?page=${Math.max(page - 1, 1)}`}>Previous</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/orders?page=${Math.min(page + 1, totalPages)}`}>Next</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
